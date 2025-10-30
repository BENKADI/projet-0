import React from 'react';
import { 
  Plus, 
  Eye, 
  Edit as Pencil, 
  Trash2, 
  Settings, 
  Lock, 
  Unlock, 
  User, 
  Users,
  FileText,
  FileCheck,
  FileX,
  FileClock,
  FileSearch,
  FileBarChart2,
  FileCog,
  FileKey,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Key,
  KeyRound,
  UserCheck,
  UserCog,
  UserPlus,
  UserMinus,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionType = 
  | 'create' | 'new' | 'add' | 'generate'
  | 'read' | 'view' | 'get' | 'list' | 'export'
  | 'update' | 'edit' | 'modify' | 'change'
  | 'delete' | 'remove' | 'trash' | 'archive'
  | 'manage' | 'admin' | 'super' | 'all'
  | 'approve' | 'reject' | 'verify' | 'validate'
  | 'import' | 'upload' | 'download'
  | 'assign' | 'unassign' | 'grant' | 'revoke'
  | 'enable' | 'disable' | 'activate' | 'deactivate';

interface PermissionIconProps {
  action: string | ActionType;
  className?: string;
  size?: number;
}

const actionIcons: Record<string, LucideIcon> = {
  // Create actions
  create: Plus,
  new: Plus,
  add: Plus,
  generate: Plus,
  
  // Read actions
  read: Eye,
  view: Eye,
  get: Eye,
  list: FileText,
  export: FileBarChart2,
  
  // Update actions
  update: Pencil,
  edit: Pencil,
  modify: Pencil,
  change: Pencil,
  
  // Delete actions
  delete: Trash2,
  remove: Trash2,
  trash: Trash2,
  archive: FileX,
  
  // Management actions
  manage: Settings,
  admin: ShieldCheck,
  super: Shield,
  all: Shield,
  
  // Approval actions
  approve: FileCheck,
  reject: FileX,
  verify: FileSearch,
  validate: FileCheck,
  
  // Import/Export
  import: FileText,
  upload: FileText,
  download: FileText,
  
  // User permissions
  assign: UserPlus,
  unassign: UserMinus,
  grant: UserCheck,
  revoke: UserMinus,
  
  // State changes
  enable: Unlock,
  disable: Lock,
  activate: UserCheck,
  deactivate: UserMinus,
};

const actionColors: Record<string, string> = {
  // Create - Green
  create: 'text-green-500',
  new: 'text-green-500',
  add: 'text-green-500',
  generate: 'text-green-500',
  
  // Read - Blue
  read: 'text-blue-500',
  view: 'text-blue-500',
  get: 'text-blue-500',
  list: 'text-blue-500',
  export: 'text-blue-500',
  
  // Update - Yellow/Amber
  update: 'text-amber-500',
  edit: 'text-amber-500',
  modify: 'text-amber-500',
  change: 'text-amber-500',
  
  // Delete - Red
  delete: 'text-red-500',
  remove: 'text-red-500',
  trash: 'text-red-500',
  archive: 'text-red-500',
  
  // Management - Purple
  manage: 'text-purple-500',
  admin: 'text-purple-500',
  super: 'text-purple-500',
  all: 'text-purple-500',
  
  // Default - Gray
  default: 'text-muted-foreground'
};

export const PermissionIcon: React.FC<PermissionIconProps> = ({
  action,
  className,
  size = 16,
  ...props
}) => {
  // Normalize action to lowercase and get the base action (first word before any separator)
  const normalizedAction = action.toLowerCase().split(/[.:_-]/)[0] as ActionType;
  
  // Get the appropriate icon or fallback to a default
  const Icon = actionIcons[normalizedAction] || Settings;
  
  // Get the color class, falling back to default
  const colorClass = actionColors[normalizedAction] || actionColors.default;
  
  return (
    <Icon 
      className={cn('inline-block', colorClass, className)} 
      size={size} 
      {...props} 
    />
  );
};

export default PermissionIcon;
