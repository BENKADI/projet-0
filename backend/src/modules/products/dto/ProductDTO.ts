import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, MaxLength, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export class ProductImageDTO {
  @ApiProperty({ example: 'https://example.com/image1.jpg', description: 'Image URL' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Main product image', description: 'Image alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @ApiPropertyOptional({ example: true, description: 'Is this the primary image?' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}

export class ProductVariantDTO {
  @ApiProperty({ example: 'Red-Large', description: 'Variant SKU' })
  @IsString()
  @MaxLength(100)
  sku: string;

  @ApiProperty({ example: 'Red', description: 'Variant name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 29.99, description: 'Variant price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 100, description: 'Inventory quantity' })
  @IsNumber()
  @Min(0)
  inventory: number;

  @ApiPropertyOptional({ example: { color: 'red', size: 'L' }, description: 'Variant attributes' })
  @IsOptional()
  attributes?: Record<string, string>;
}

export class CreateProductDTO {
  @ApiProperty({ example: 'Premium T-Shirt', description: 'Product name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'High-quality cotton t-shirt with premium print', description: 'Product description' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 29.99, description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD', description: 'Currency code' })
  @IsString()
  @MaxLength(3)
  currency: string = 'USD';

  @ApiPropertyOptional({ example: 'TSHIRT001', description: 'Product SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 'apparel', description: 'Product category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: ['clothing', 'fashion', 'cotton'], description: 'Product tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [ProductImageDTO], description: 'Product images' })
  @IsOptional()
  @IsArray()
  images?: ProductImageDTO[];

  @ApiPropertyOptional({ type: [ProductVariantDTO], description: 'Product variants' })
  @IsOptional()
  @IsArray()
  variants?: ProductVariantDTO[];

  @ApiPropertyOptional({ example: ProductStatus.DRAFT, enum: ProductStatus, description: 'Product status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.DRAFT;

  @ApiPropertyOptional({ example: true, description: 'Track inventory for this product' })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean = true;

  @ApiPropertyOptional({ example: 100, description: 'Initial inventory quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inventory?: number = 0;

  @ApiPropertyOptional({ example: 10, description: 'Low inventory threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number = 10;

  @ApiPropertyOptional({ example: { weight: 200, dimensions: { length: 30, width: 20, height: 2 } }, description: 'Product metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateProductDTO {
  @ApiPropertyOptional({ example: 'Premium T-Shirt', description: 'Product name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'High-quality cotton t-shirt with premium print', description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 29.99, description: 'Product price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'TSHIRT001', description: 'Product SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 'apparel', description: 'Product category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: ['clothing', 'fashion', 'cotton'], description: 'Product tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [ProductImageDTO], description: 'Product images' })
  @IsOptional()
  @IsArray()
  images?: ProductImageDTO[];

  @ApiPropertyOptional({ type: [ProductVariantDTO], description: 'Product variants' })
  @IsOptional()
  @IsArray()
  variants?: ProductVariantDTO[];

  @ApiPropertyOptional({ example: ProductStatus.ACTIVE, enum: ProductStatus, description: 'Product status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true, description: 'Track inventory for this product' })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Inventory quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inventory?: number;

  @ApiPropertyOptional({ example: 10, description: 'Low inventory threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: { weight: 200, dimensions: { length: 30, width: 20, height: 2 } }, description: 'Product metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProductQueryDTO {
  @ApiPropertyOptional({ example: 't-shirt', description: 'Search term for name, description, or SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'apparel', description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ProductStatus.ACTIVE, enum: ProductStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'clothing', description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ example: '0', description: 'Minimum price' })
  @IsOptional()
  @IsString()
  minPrice?: string;

  @ApiPropertyOptional({ example: '100', description: 'Maximum price' })
  @IsOptional()
  @IsString()
  maxPrice?: string;

  @ApiPropertyOptional({ example: 'true', description: 'Show low stock products only' })
  @IsOptional()
  @IsString()
  lowStock?: string;

  @ApiPropertyOptional({ example: '1', description: 'Page number' })
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiPropertyOptional({ example: '20', description: 'Items per page' })
  @IsOptional()
  @IsString()
  limit?: string = '20';

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class InventoryUpdateDTO {
  @ApiProperty({ example: 150, description: 'New inventory quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'Stock replenishment', description: 'Reason for inventory update' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ example: 'manual', description: 'Update type' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string = 'manual';
}

export class BulkInventoryUpdateDTO {
  @ApiProperty({ example: [{ productId: 'prod_123', quantity: 100 }, { productId: 'prod_456', quantity: 50 }], description: 'Inventory updates' })
  @IsArray()
  updates: Array<{
    productId: string;
    quantity: number;
    reason?: string;
  }>;
}
