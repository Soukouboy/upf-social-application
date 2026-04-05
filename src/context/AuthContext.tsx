/**
 * Contexte d'authentification
 *
 * Fournit à toute l'application :
 *   - l'utilisateur connecté (user)
 *   - l'état d'authentification (isAuthenticated, loading)
 *   - les rôles (isAdmin, isProfessor, isStudent)
 *   - les actions : login, register, logout
 *
 * Le token JWT est stocké dans localStorage et ajouté
 * automatiquement aux requêtes via l'intercepteur Axios (api.ts).
 */
import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Student, LoginRequest, RegisterRequest, UserRole } from '../types';
import * as authService from '../services/authService';
import { storeTokens, removeTokens, getStoredTokens } from '../services/api';

// ────────── Types du contexte ──────────

interface AuthContextValue {
  user: Student | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<Student>;
  register: (payload: RegisterRequest) => Promise<Student>;
  logout: () => Promise<void>;
  /** Retourne le préfixe de route pour le rôle courant */
  rolePrefix: string;
  /** Retourne le dashboard path pour le rôle courant */
  dashboardPath: string;
}

// ────────── Helpers ──────────

const getRolePrefix = (role?: UserRole): string => {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN': return '/admin';
    case 'PROFESSOR': return '/professor';
    default: return '/student';
  }
};

const getDashboardPath = (role?: UserRole): string => `${getRolePrefix(role)}/dashboard`;

// ────────── Contexte ──────────

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isProfessor: false,
  isStudent: false,
  loading: true,
  login: async () => ({} as Student),
  register: async () => ({} as Student),
  logout: async () => {},
  rolePrefix: '/student',
  dashboardPath: '/student/dashboard',
});

// ────────── Provider ──────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          removeTokens();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<Student> => {
    const tokens = await authService.login(credentials);
    storeTokens(tokens);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(async (payload: RegisterRequest): Promise<Student> => {
    const tokens = await authService.register(payload);
    storeTokens(tokens);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
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
    isAdmin: user?.role === 'ADMIN',
    isProfessor: user?.role === 'PROFESSOR',
    isStudent: user?.role === 'STUDENT',
    loading,
    login,
    register,
    logout,
    rolePrefix: getRolePrefix(user?.role),
    dashboardPath: getDashboardPath(user?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
