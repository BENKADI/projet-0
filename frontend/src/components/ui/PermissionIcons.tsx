import { Plus, Eye, Pencil, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionIconProps {
  action: string;
  className?: string;
  size?: number;
}

export const PermissionIcon = ({ action, className, size = 16 }: PermissionIconProps) => {
  const commonClasses = 'inline-block mr-1.5';
  
  const getIcon = () => {
    const actionType = action.split(':')[0];
    
    switch (actionType) {
      case 'create':
        return <Plus size={size} className="text-green-600" />;
      case 'read':
        return <Eye size={size} className="text-blue-600" />;
      case 'update':
        return <Pencil size={size} className="text-amber-600" />;
      case 'delete':
        return <Trash2 size={size} className="text-red-600" />;
      case 'manage':
      case 'admin':
        return <Settings size={size} className="text-purple-600" />;
      default:
        return null;
    }
  };

  return <span className={cn(commonClasses, className)}>{getIcon()}</span>;
};

export default PermissionIcon;
