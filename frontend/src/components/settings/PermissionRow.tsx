import React from 'react';
import { Permission } from '@/services/permissionService';
import { Button } from '@/components/ui/Button';
import { TableCell, TableRow } from '@/components/ui/Table';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Trash2, Edit, Copy } from 'lucide-react';
import PermissionIcon from '@/components/ui/PermissionIcon';

interface PermissionRowProps {
  permission: Permission;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number) => void;
  onCopy: (text: string) => void;
  level?: number;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  permission,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onCopy,
  level = 0
}) => {
  const [action, resource] = permission.name.split(':');
  
  return (
    <TableRow className={level > 0 ? 'bg-muted/5' : ''}>
      <TableCell className="w-[50px] pl-8">
        <div className="flex items-center">
          <Checkbox
            id={`select-${permission.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(permission.id, checked as boolean)}
            className="rounded"
          />
          <Label htmlFor={`select-${permission.id}`} className="sr-only">
            Sélectionner {permission.name}
          </Label>
        </div>
      </TableCell>
      <TableCell className="font-mono">
        <div className="flex items-center">
          <div className="w-6 flex-shrink-0">
            <PermissionIcon action={action} />
          </div>
          <span className="ml-1">
            <span className="text-foreground">{action}</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-foreground font-medium">{resource}</span>
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {permission.description || 'Aucune description'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCopy(permission.name)}
            title="Copier le nom"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Copier</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(permission)}
            title="Modifier"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Modifier</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(permission.id)}
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PermissionRow;
