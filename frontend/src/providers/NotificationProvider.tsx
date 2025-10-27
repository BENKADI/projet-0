import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster } from 'sonner';
import { useNotifications, UseNotificationsReturn } from '../hooks/useNotifications';

const NotificationContext = createContext<UseNotificationsReturn | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationState = useNotifications();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
      <Toaster 
        position="top-right" 
        expand={false}
        richColors
        closeButton
        duration={5000}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
