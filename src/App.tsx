/**
 * App.tsx — Point d'entrée de l'application (routing par rôle)
 *
 * Routes :
 *   /login, /register                → publiques
 *   /student/*                       → STUDENT layout + pages
 *   /professor/*                     → PROFESSOR layout + pages
 *   /admin/*                         → ADMIN layout + pages
 *   /                                → redirige vers /{role}/dashboard
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
import RoleRoute from './components/common/RoleRoute';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import ProfessorLayout from './components/layout/ProfessorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages — Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages — Student
import DashboardPage from './pages/dashboard/DashboardPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import ExamListPage from './pages/exams/ExamListPage';
import ExamDetailPage from './pages/exams/ExamDetailPage';
import ExamUploadPage from './pages/exams/ExamUploadPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';
import GroupListPage from './pages/groups/GroupListPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import GroupChatPage from './pages/groups/GroupChatPage';
import GroupCreatePage from './pages/groups/GroupCreatePage';
import DirectMessagesPage from './pages/messages/DirectMessagesPage';
import DirectChatPage from './pages/messages/DirectChatPage';
import NetworkPage from './pages/network/NetworkPage';

// Pages — Professor
import ProfessorDashboardPage from './pages/professor/ProfessorDashboardPage';
import ProfessorCoursesPage from './pages/professor/ProfessorCoursesPage';
import ProfessorCourseDetailPage from './pages/professor/ProfessorCourseDetailPage';
import ProfessorDocumentsPage from './pages/professor/ProfessorDocumentsPage';
import ProfessorAnnouncementsPage from './pages/professor/ProfessorAnnouncementsPage';
import ProfessorStudentsPage from './pages/professor/ProfessorStudentsPage';

// Pages — Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminCourseResourcesPage from './pages/admin/AdminCourseResourcesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminProfessorsPage from './pages/admin/AdminProfessorsPage';
import AdminGroupsPage from './pages/admin/AdminGroupsPage';

// ────────── Helper : redirection intelligente vers le bon dashboard ──────────
import { useAuth } from './hooks/useAuth';

const RoleRedirect: React.FC = () => {
  const { dashboardPath, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPath} replace />;
};

// ────────── App ──────────

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

                  {/* ──── STUDENT routes ──── */}
                  <Route element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['STUDENT']}>
                        <StudentLayout />
                      </RoleRoute>
                    </ProtectedRoute>
                  }>
                    <Route path="/student/dashboard" element={<DashboardPage />} />
                    <Route path="/student/courses" element={<CourseListPage />} />
                    <Route path="/student/courses/:id" element={<CourseDetailPage />} />
                    <Route path="/student/exams" element={<ExamListPage />} />
                    <Route path="/student/exams/upload" element={<ExamUploadPage />} />
                    <Route path="/student/exams/:id" element={<ExamDetailPage />} />
                    <Route path="/student/profile" element={<ProfilePage />} />
                    <Route path="/student/profile/edit" element={<ProfileEditPage />} />
                    <Route path="/student/profile/:id" element={<ProfilePage />} />
                    <Route path="/student/groups" element={<GroupListPage />} />
                    <Route path="/student/groups/create" element={<GroupCreatePage />} />
                    <Route path="/student/groups/:id" element={<GroupDetailPage />} />
                    <Route path="/student/groups/:id/chat" element={<GroupChatPage />} />
                    <Route path="/student/messages" element={<DirectMessagesPage />} />
                    <Route path="/student/messages/:userId" element={<DirectChatPage />} />
                    <Route path="/student/network" element={<NetworkPage />} />
                  </Route>

                  {/* ──── PROFESSOR routes ──── */}
                  <Route element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['PROFESSOR']}>
                        <ProfessorLayout />
                      </RoleRoute>
                    </ProtectedRoute>
                  }>
                    <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
                    <Route path="/professor/courses" element={<ProfessorCoursesPage />} />
                    <Route path="/professor/courses/:id" element={<ProfessorCourseDetailPage />} />
                    <Route path="/professor/courses/:id/documents" element={<ProfessorDocumentsPage />} />
                    <Route path="/professor/students" element={<ProfessorStudentsPage />} />
                    <Route path="/professor/announcements" element={<ProfessorAnnouncementsPage />} />
                    <Route path="/professor/profile" element={<ProfilePage />} />
                  </Route>

                  {/* ──── ADMIN routes ──── */}
                  <Route element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['ADMIN']}>
                        <AdminLayout />
                      </RoleRoute>
                    </ProtectedRoute>
                  }>
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/admins" element={<AdminAdminsPage />} />
                    <Route path="/admin/courses" element={<AdminCoursesPage />} />
                    <Route path="/admin/professors" element={<AdminProfessorsPage />} />
                    <Route path="/admin/courses/:id/resources" element={<AdminCourseResourcesPage />} />
                    <Route path="/admin/groups" element={<AdminGroupsPage />} />
                    <Route path="/admin/reports" element={<AdminReportsPage />} />
                  </Route>

                  {/* ──── Redirections ──── */}
                  <Route path="/" element={<RoleRedirect />} />
                  <Route path="/dashboard" element={<RoleRedirect />} />
                  <Route path="*" element={<RoleRedirect />} />
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
