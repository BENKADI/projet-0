import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Toaster } from 'sonner';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Passer la fonction de toggle et l'état au Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      
      {/* Contenu principal qui s'ajuste automatiquement */}
      <div 
        className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <Outlet />
          <Toaster position="bottom-right" richColors />
        </div>
      </div>
    </div>
  );
};

export default Layout;
