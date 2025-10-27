import { PrismaClient, Product, ProductStatus } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO, ProductQueryDTO, InventoryUpdateDTO, BulkInventoryUpdateDTO } from '../dto/ProductDTO';
import { ProductRepository } from '../repositories/ProductRepository';
import { CacheService } from '../../infrastructure/cache/CacheService';
import { AuditService } from '../../shared/services/AuditService';
import { NotificationService } from '../notifications/services/NotificationService';

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  productsByCategory: Record<string, number>;
  productsByStatus: Record<ProductStatus, number>;
  topProducts: Array<{
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }>;
  recentlyAdded: Product[];
}

export interface InventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'low_stock' | 'out_of_stock';
  lastUpdated: Date;
}

export class ProductService {
  constructor(
    private prisma: PrismaClient,
    private productRepository: ProductRepository,
    private cacheService: CacheService,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  async createProduct(data: CreateProductDTO, createdBy: string): Promise<Product> {
    // Check if SKU already exists
    if (data.sku) {
      const existingProduct = await this.productRepository.findBySKU(data.sku);
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }
    }

    // Generate SKU if not provided
    if (!data.sku) {
      data.sku = await this.generateSKU(data.category || 'product');
    }

    // Create product
    const product = await this.productRepository.create({
      ...data,
      createdBy,
    });

    // Cache product
    await this.cacheService.set(`product:${product.id}`, product, 3600);
    await this.cacheService.invalidate('products:*');

    // Audit log
    await this.auditService.log({
      userId: createdBy,
      action: 'create',
      resource: 'product',
      resourceId: product.id,
      newValues: {
        name: product.name,
        sku: product.sku,
        price: product.price,
        status: product.status,
      },
    });

    // Check for low stock initial inventory
    if (product.trackInventory && product.inventory <= product.lowStockThreshold) {
      await this.sendInventoryAlert(product);
    }

    return product;
  }

  async getProducts(query: ProductQueryDTO): Promise<PaginatedProducts> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    // Build filters
    const filters = {
      search: query.search,
      category: query.category,
      status: query.status,
      tag: query.tag,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      lowStock: query.lowStock === 'true',
    };

    // Get products and total count
    const [products, total] = await Promise.all([
      this.productRepository.findMany(filters, {
        skip,
        take: limit,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
      }),
      this.productRepository.count(filters),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    // Try cache first
    const cachedProduct = await this.cacheService.get<Product>(`product:${id}`);
    if (cachedProduct) {
      return cachedProduct;
    }

    // Get from database
    const product = await this.productRepository.findById(id);
    if (product) {
      await this.cacheService.set(`product:${id}`, product, 3600);
    }

    return product;
  }

  async getProductBySKU(sku: string): Promise<Product | null> {
    const cacheKey = `product:sku:${sku}`;
    
    // Try cache first
    const cachedProduct = await this.cacheService.get<Product>(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }

    // Get from database
    const product = await this.productRepository.findBySKU(sku);
    if (product) {
      await this.cacheService.set(cacheKey, product, 3600);
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO, updatedBy: string): Promise<Product> {
    // Get current product for audit
    const currentProduct = await this.productRepository.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Check SKU uniqueness if changing
    if (data.sku && data.sku !== currentProduct.sku) {
      const existingProduct = await this.productRepository.findBySKU(data.sku);
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }
    }

    // Update product
    const updatedProduct = await this.productRepository.update(id, data);

    // Update cache
    await this.cacheService.set(`product:${id}`, updatedProduct, 3600);
    await this.cacheService.invalidate('products:*');
    await this.cacheService.invalidate(`product:sku:${currentProduct.sku}`);
    
    if (data.sku && data.sku !== currentProduct.sku) {
      await this.cacheService.set(`product:sku:${data.sku}`, updatedProduct, 3600);
    }

    // Audit log
    await this.auditService.log({
      userId: updatedBy,
      action: 'update',
      resource: 'product',
      resourceId: id,
      oldValues: {
        name: currentProduct.name,
        sku: currentProduct.sku,
        price: currentProduct.price,
        status: currentProduct.status,
        inventory: currentProduct.inventory,
      },
      newValues: data,
    });

    // Check for inventory changes
    if (data.inventory !== undefined && updatedProduct.trackInventory) {
      await this.checkInventoryAlerts(updatedProduct);
    }

    return updatedProduct;
  }

  async deleteProduct(id: string, deletedBy: string): Promise<void> {
    // Get product for audit
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if product can be deleted (no orders, etc.)
    const canDelete = await this.canDeleteProduct(id);
    if (!canDelete) {
      throw new Error('Product cannot be deleted (has associated orders or dependencies)');
    }

    // Delete product
    await this.productRepository.delete(id);

    // Clear cache
    await this.cacheService.invalidate(`product:${id}`);
    await this.cacheService.invalidate(`product:sku:${product.sku}`);
    await this.cacheService.invalidate('products:*');

    // Audit log
    await this.auditService.log({
      userId: deletedBy,
      action: 'delete',
      resource: 'product',
      resourceId: id,
      oldValues: {
        name: product.name,
        sku: product.sku,
        status: product.status,
      },
    });
  }

  async updateInventory(id: string, data: InventoryUpdateDTO, updatedBy: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.trackInventory) {
      throw new Error('Inventory tracking is not enabled for this product');
    }

    const oldInventory = product.inventory;
    
    // Update inventory
    const updatedProduct = await this.productRepository.updateInventory(id, data.quantity);

    // Update cache
    await this.cacheService.set(`product:${id}`, updatedProduct, 3600);
    await this.cacheService.invalidate('products:*');

    // Audit log
    await this.auditService.log({
      userId: updatedBy,
      action: 'inventory_update',
      resource: 'product',
      resourceId: id,
      oldValues: { inventory: oldInventory },
      newValues: { inventory: data.quantity, reason: data.reason },
    });

    // Check for inventory alerts
    await this.checkInventoryAlerts(updatedProduct);

    return updatedProduct;
  }

  async bulkUpdateInventory(data: BulkInventoryUpdateDTO, updatedBy: string): Promise<Product[]> {
    const updatedProducts = [];

    for (const update of data.updates) {
      try {
        const product = await this.updateInventory(
          update.productId,
          {
            quantity: update.quantity,
            reason: update.reason,
          },
          updatedBy
        );
        updatedProducts.push(product);
      } catch (error) {
        console.error(`Failed to update inventory for product ${update.productId}:`, error);
      }
    }

    return updatedProducts;
  }

  async getProductMetrics(period?: { start: Date; end: Date }): Promise<ProductMetrics> {
    const cacheKey = `product_metrics:${period?.start?.toISOString()}:${period?.end?.toISOString()}`;
    
    // Try cache first
    const cachedMetrics = await this.cacheService.get<ProductMetrics>(cacheKey);
    if (cachedMetrics) {
      return cachedMetrics;
    }

    // Calculate metrics
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory,
      productsByStatus,
      topProducts,
      recentlyAdded,
      totalInventoryValue,
    ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ status: ProductStatus.ACTIVE }),
      this.productRepository.countLowStock(),
      this.productRepository.countOutOfStock(),
      this.productRepository.countByCategory(),
      this.productRepository.countByStatus(),
      this.productRepository.getTopProducts(period),
      this.productRepository.getRecentlyAdded(10),
      this.productRepository.getTotalInventoryValue(),
    ]);

    const metrics: ProductMetrics = {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      productsByCategory,
      productsByStatus,
      topProducts,
      recentlyAdded,
    };

    // Cache metrics for 5 minutes
    await this.cacheService.set(cacheKey, metrics, 300);

    return metrics;
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const cacheKey = `product_search:${query}:${limit}`;
    
    // Try cache first
    const cachedResults = await this.cacheService.get<Product[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Search products
    const products = await this.productRepository.search(query, limit);

    // Cache results for 2 minutes
    await this.cacheService.set(cacheKey, products, 120);

    return products;
  }

  async getLowStockProducts(): Promise<InventoryAlert[]> {
    const cacheKey = 'low_stock_products';
    
    // Try cache first
    const cachedAlerts = await this.cacheService.get<InventoryAlert[]>(cacheKey);
    if (cachedAlerts) {
      return cachedAlerts;
    }

    // Get low stock products
    const products = await this.productRepository.getLowStockProducts();

    const alerts: InventoryAlert[] = products.map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.inventory,
      threshold: product.lowStockThreshold,
      status: product.inventory === 0 ? 'out_of_stock' : 'low_stock',
      lastUpdated: product.updatedAt,
    }));

    // Cache alerts for 10 minutes
    await this.cacheService.set(cacheKey, alerts, 600);

    return alerts;
  }

  async exportProducts(format: 'csv' | 'excel' | 'json', filters?: ProductQueryDTO): Promise<Buffer> {
    const products = await this.productRepository.findMany(filters || {}, {
      // Get all products for export
      take: 10000,
    });

    // Transform data for export
    const exportData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      status: product.status,
      inventory: product.inventory,
      trackInventory: product.trackInventory,
      lowStockThreshold: product.lowStockThreshold,
      tags: product.tags?.join(', ') || '',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // Generate export based on format
    switch (format) {
      case 'csv':
        return this.generateCSV(exportData);
      case 'excel':
        return this.generateExcel(exportData);
      case 'json':
        return Buffer.from(JSON.stringify(exportData, null, 2));
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async duplicateProduct(id: string, newName?: string, createdBy: string): Promise<Product> {
    const originalProduct = await this.productRepository.findById(id);
    if (!originalProduct) {
      throw new Error('Product not found');
    }

    // Create duplicate with new SKU
    const duplicateData = {
      ...originalProduct,
      name: newName || `${originalProduct.name} (Copy)`,
      sku: await this.generateSKU(originalProduct.category || 'product'),
      status: ProductStatus.DRAFT,
    };

    // Remove fields that shouldn't be duplicated
    delete (duplicateData as any).id;
    delete (duplicateData as any).createdAt;
    delete (duplicateData as any).updatedAt;
    delete (duplicateData as any).createdBy;

    return this.createProduct(duplicateData, createdBy);
  }

  private async generateSKU(category: string): Promise<string> {
    const prefix = category.toUpperCase().slice(0, 4);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const sku = `${prefix}${timestamp}${random}`;
    
    // Ensure SKU is unique
    const existingProduct = await this.productRepository.findBySKU(sku);
    if (existingProduct) {
      return this.generateSKU(category); // Recursive call with new timestamp
    }
    
    return sku;
  }

  private async canDeleteProduct(productId: string): Promise<boolean> {
    // Check if product has orders
    const orderCount = await this.prisma.orderItem.count({
      where: { productId },
    });

    return orderCount === 0;
  }

  private async checkInventoryAlerts(product: Product): Promise<void> {
    if (!product.trackInventory) {
      return;
    }

    if (product.inventory === 0) {
      await this.sendInventoryAlert(product, 'out_of_stock');
    } else if (product.inventory <= product.lowStockThreshold) {
      await this.sendInventoryAlert(product, 'low_stock');
    }
  }

  private async sendInventoryAlert(product: Product, alertType: 'low_stock' | 'out_of_stock' = 'low_stock'): Promise<void> {
    const title = alertType === 'out_of_stock' ? 'Product Out of Stock' : 'Low Stock Alert';
    const message = alertType === 'out_of_stock'
      ? `Product "${product.name}" is out of stock (SKU: ${product.sku})`
      : `Product "${product.name}" has low stock (${product.inventory} units, threshold: ${product.lowStockThreshold})`;

    // Send notification to admins
    const adminUsers = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of adminUsers) {
      await this.notificationService.sendNotification(admin.id, {
        type: 'inventory_alert',
        title,
        message,
        sendEmail: true,
      });
    }

    // Clear low stock cache
    await this.cacheService.invalidate('low_stock_products');
  }

  private generateCSV(data: any[]): Buffer {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    return Buffer.from(csv);
  }

  private generateExcel(data: any[]): Buffer {
    // Implementation would use a library like xlsx
    // For now, return CSV as placeholder
    return this.generateCSV(data);
  }

  // Advanced product operations

  async bulkUpdateStatus(productIds: string[], status: ProductStatus, updatedBy: string): Promise<Product[]> {
    const updatedProducts = [];

    for (const productId of productIds) {
      try {
        const updatedProduct = await this.updateProduct(productId, { status }, updatedBy);
        updatedProducts.push(updatedProduct);
      } catch (error) {
        console.error(`Failed to update status for product ${productId}:`, error);
      }
    }

    return updatedProducts;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const cacheKey = `products_by_category:${category}`;
    
    let products = await this.cacheService.get<Product[]>(cacheKey);
    if (!products) {
      products = await this.productRepository.findByCategory(category);
      await this.cacheService.set(cacheKey, products, 600); // 10 minutes
    }

    return products;
  }

  async getRelatedProducts(productId: string, limit: number = 5): Promise<Product[]> {
    const product = await this.getProductById(productId);
    if (!product) {
      return [];
    }

    const cacheKey = `related_products:${productId}`;
    
    let relatedProducts = await this.cacheService.get<Product[]>(cacheKey);
    if (!relatedProducts) {
      relatedProducts = await this.productRepository.findRelated(
        product.category,
        product.tags,
        productId,
        limit
      );
      await this.cacheService.set(cacheKey, relatedProducts, 1800); // 30 minutes
    }

    return relatedProducts;
  }
}
