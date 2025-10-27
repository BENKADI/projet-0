import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Printer,
  User,
  ChevronDown,
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
      {/* Logo et titre - Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16 bg-gradient-to-r from-primary/5 to-transparent">
        {!isCollapsed ? (
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
              <Printer className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                {import.meta.env.VITE_APP_NAME || 'Projet-0'}
              </span>
              <span className="text-xs text-muted-foreground">Enterprise Edition</span>
            </div>
          </Link>
        ) : (
          <Link to="/dashboard" className="p-2 bg-primary rounded-lg hover:scale-110 transition-transform mx-auto">
            <Printer className="h-5 w-5 text-primary-foreground" />
          </Link>
        )}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Réduire la sidebar"
          >
            <PanelLeftClose className={iconClasses} />
          </button>
        )}
      </div>
      
      {/* Bouton pour agrandir quand collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="p-2 m-2 rounded-lg hover:bg-muted transition-colors"
          title="Agrandir la sidebar"
        >
          <PanelRightClose className="h-5 w-5" />
        </button>
      )}

      {/* Profil Utilisateur */}
      {user && (
        <div className={cn(
          "px-4 py-3 border-b border-border bg-muted/30",
          isCollapsed ? "px-2" : ""
        )}>
          {!isCollapsed ? (
            <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all group">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName || user.email}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      {user.lastName?.[0]?.toUpperCase() || ''}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
              
              {/* Infos utilisateur */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-foreground">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium capitalize">
                    {user.role || 'utilisateur'}
                  </span>
                </div>
              </div>
              
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ) : (
            <Link to="/profile" className="flex justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName || user.email}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </Link>
          )}
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
