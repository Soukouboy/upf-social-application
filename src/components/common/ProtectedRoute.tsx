/**
 * Composant de route protégée
 *
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 * Affiche un spinner pendant le chargement initial de l'auth.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage message="Chargement..." />;
  }

  if (!isAuthenticated) {
    // Sauvegarder l'URL demandée pour redirection après login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
