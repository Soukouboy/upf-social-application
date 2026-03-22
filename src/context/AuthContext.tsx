/**
 * Contexte d'authentification
 *
 * Fournit à toute l'application :
 *   - l'utilisateur connecté (user)
 *   - l'état d'authentification (isAuthenticated, loading)
 *   - les actions : login, register, logout
 *
 * Le token JWT est stocké dans localStorage et ajouté
 * automatiquement aux requêtes via l'intercepteur Axios (api.ts).
 */
import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Student, LoginRequest, RegisterRequest } from '../types';
import * as authService from '../services/authService';
import { storeTokens, removeTokens, getStoredTokens } from '../services/api';

// ────────── Types du contexte ──────────

interface AuthContextValue {
  /** Utilisateur connecté (null si non authentifié) */
  user: Student | null;
  /** True si l'utilisateur est authentifié */
  isAuthenticated: boolean;
  /** True pendant le chargement initial (vérification du token) */
  loading: boolean;
  /** Connexion avec email/mot de passe */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Inscription */
  register: (payload: RegisterRequest) => Promise<void>;
  /** Déconnexion */
  logout: () => Promise<void>;
}

// ────────── Contexte ──────────

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// ────────── Provider ──────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Au montage, vérifier si un token existe et récupérer le profil
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          // Token expiré ou invalide → nettoyage
          removeTokens();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const tokens = await authService.login(credentials);
    storeTokens(tokens);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const tokens = await authService.register(payload);
    storeTokens(tokens);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignorer les erreurs de déconnexion côté serveur
    } finally {
      removeTokens();
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
