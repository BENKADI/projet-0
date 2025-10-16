import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const linkClasses = (path: string) =>
    cn(
      'flex items-center p-3 rounded-lg transition-all duration-200',
      isCollapsed ? 'justify-center' : '',
      isActive(path)
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
    );

  const iconClasses = 'h-5 w-5';

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-card text-card-foreground transition-all duration-300 fixed left-0 top-0 shadow-lg',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo et titre */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        {!isCollapsed && (
          <Link to="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <Printer className="h-6 w-6 text-primary" />
                        <span>{import.meta.env.VITE_APP_NAME}</span>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <PanelRightClose className={iconClasses} />
          ) : (
            <PanelLeftClose className={iconClasses} />
          )}
        </button>
      </div>

      {/* Informations utilisateur */}
      {!isCollapsed && user && (
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm text-muted-foreground">Connecté en tant que:</div>
          <div className="font-medium truncate">{user.email}</div>
          <div className="text-xs bg-primary/20 text-primary inline-block px-2 py-1 rounded mt-1 capitalize">
            {user.role || 'utilisateur'}
          </div>
        </div>
      )}

      {/* Navigation principale */}
      <nav className="flex-grow overflow-y-auto p-2">
        <ul className="space-y-1">
          <li>
            <Link to="/dashboard" className={linkClasses('/dashboard')}>
              <LayoutDashboard className={cn(iconClasses, !isCollapsed && 'mr-3')} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          {user?.role === 'admin' && (
            <>
              <li>
                <Link to="/users" className={linkClasses('/users')}>
                  <Users className={cn(iconClasses, !isCollapsed && 'mr-3')} />
                  {!isCollapsed && <span>Utilisateurs</span>}
                </Link>
              </li>
              <li>
                <Link to="/permissions" className={linkClasses('/permissions')}>
                  <ShieldCheck className={cn(iconClasses, !isCollapsed && 'mr-3')} />
                  {!isCollapsed && <span>Permissions</span>}
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Paramètres - Toujours en bas avant la déconnexion */}
      <div className="p-2 border-t border-border">
        <Link to="/settings" className={linkClasses('/settings')}>
          <Settings className={cn(iconClasses, !isCollapsed && 'mr-3')} />
          {!isCollapsed && <span>Paramètres</span>}
        </Link>
      </div>

      {/* Pied de page avec bouton de déconnexion */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center w-full p-3 rounded-lg transition-colors text-destructive-foreground bg-destructive hover:bg-destructive/90',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className={cn(iconClasses, !isCollapsed && 'mr-3')} />
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
