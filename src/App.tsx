/**
 * App.tsx — Point d'entrée de l'application
 *
 * Structure :
 *   BrowserRouter → AuthProvider → NotificationProvider → ChatProvider → ThemeProvider → Routes
 *
 * Routes publiques : /login, /register
 * Routes protégées : toutes les autres (encapsulées dans AppLayout + ProtectedRoute)
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages — Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages — Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Pages — Courses
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';

// Pages — Exams
import ExamListPage from './pages/exams/ExamListPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import ExamUploadPage from './pages/exams/ExamUploadPage';

// Pages — Profile
import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';

// Pages — Groups
import GroupListPage from './pages/groups/GroupListPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import GroupChatPage from './pages/groups/GroupChatPage';

// Pages — Network
import NetworkPage from './pages/network/NetworkPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <Routes>
                  {/* ──── Routes publiques ──── */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ──── Routes protégées (encapsulées dans le layout) ──── */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Cours */}
                    <Route path="/courses" element={<CourseListPage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />

                    {/* Épreuves */}
                    <Route path="/exams" element={<ExamListPage />} />
                    <Route path="/exams/upload" element={<ExamUploadPage />} />
                    <Route path="/exams/:id" element={<ExamDetailPage />} />

                    {/* Profil */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/edit" element={<ProfileEditPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />

                    {/* Groupes */}
                    <Route path="/groups" element={<GroupListPage />} />
                    <Route path="/groups/:id" element={<GroupDetailPage />} />
                    <Route path="/groups/:id/chat" element={<GroupChatPage />} />
                    
                    {/* Réseau */}
                    <Route path="/network" element={<NetworkPage />} />
                  </Route>

                  {/* Redirection par défaut */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
