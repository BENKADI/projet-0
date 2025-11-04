import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Props = {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
};

const RequirePermission: React.FC<Props> = ({ permission, permissions, requireAll = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const perms = user.permissions || [];
  const isAdmin = user.role === 'admin';

  let allowed = false;
  if (isAdmin) {
    allowed = true;
  } else if (permission) {
    allowed = perms.includes(permission);
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? permissions.every(p => perms.includes(p)) : permissions.some(p => perms.includes(p));
  } else {
    allowed = true;
  }

  return allowed ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RequirePermission;
