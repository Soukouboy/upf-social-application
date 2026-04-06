/**
 * RoleRoute — Protection de route par rôle
 *
 * Redirige vers le dashboard du rôle courant si l'utilisateur
 * n'a pas le rôle requis.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading, dashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage message="Vérification des droits…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !(allowedRoles.includes(user.role) || (user.role === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN')))) {
    // Éviter une boucle de redirection infinie
    if (location.pathname === dashboardPath) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Accès non autorisé</h2>
          <p>Votre rôle ({user?.role}) n'a pas accès à cet espace.</p>
        </div>
      );
    }
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
