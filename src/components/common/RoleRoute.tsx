/**
 * RoleRoute — Protection de route par rôle
 *
 * Redirige vers le dashboard du rôle courant si l'utilisateur
 * n'a pas le rôle requis.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading, dashboardPath } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Vérification des droits…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !(allowedRoles.includes(user.role) || (user.role === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN')))) {
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
