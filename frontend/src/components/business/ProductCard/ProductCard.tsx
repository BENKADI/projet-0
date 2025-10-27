import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';
import { Badge } from '../../ui/Badge/Badge';
import { formatCurrency } from '../../../lib/utils';
import { Product } from '../../../types/product';
import { Eye, Edit, Trash2, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  variant = 'default',
  showActions = true,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (inventory: number, threshold: number) => {
    if (inventory === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (inventory <= threshold) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(product.inventory, product.lowStockThreshold);

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm truncate">{product.name}</h4>
              <p className="text-xs text-muted-foreground">{product.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
                <Badge className={stockStatus.color}>
                  {stockStatus.text}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {formatCurrency(product.price, product.currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                {product.inventory} units
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{product.sku}</p>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Badge className={getStatusColor(product.status)}>
              {product.status}
            </Badge>
            {product.trackInventory && (
              <Badge className={stockStatus.color}>
                {stockStatus.text}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatCurrency(product.price, product.currency)}
              </span>
            </div>
            
            {product.trackInventory && (
              <div className="text-sm text-muted-foreground">
                {product.inventory} units available
              </div>
            )}
          </div>

          {product.category && (
            <div className="text-sm text-muted-foreground">
              Category: {product.category}
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3">
          <div className="flex gap-2 w-full">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                icon={<Eye className="h-4 w-4" />}
                onClick={() => onView(product)}
                className="flex-1"
              >
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => onDelete(product.id)}
                className="flex-1"
              >
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
