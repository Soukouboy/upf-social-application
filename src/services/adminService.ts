/**
 * Service d'administration
 *
 * Endpoints attendus côté backend :
 *   GET    /admin/stats                          — statistiques globales
 *   GET    /admin/users?page&size&filiere&annee&isActive&search — liste utilisateurs
 *   PUT    /admin/users/:id/status               — activer/désactiver un utilisateur
 *   GET    /admin/admins                         — liste des admins
 *   PUT    /admin/users/:id/role                 — promouvoir/rétrograder
 *   POST   /admin/courses                        — créer un cours
 *   PUT    /admin/courses/:id                    — modifier un cours
 *   DELETE /admin/courses/:id                    — supprimer un cours
 *   POST   /admin/courses/:id/resources          — uploader une ressource
 *   DELETE /admin/courses/:courseId/resources/:resourceId — supprimer une ressource
 *   POST   /admin/courses/:id/enroll             — enroller un étudiant à un cours
 *   POST   /admin/courses/:id/assign-professor   — affecter un professeur à un cours
 *   GET    /admin/professors                     — liste des professeurs
 *   POST   /admin/professors                     — créer un compte professeur
 *   GET    /admin/reports?status                 — liste des signalements
 *   PUT    /admin/reports/:id                    — mettre à jour le statut d'un signalement
 *   PUT    /admin/exams/:id/visibility           — masquer/afficher une épreuve
 */
import api from './api';
import type {
  AdminStats,
  Student,
  Course,
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseResource,
  ExamReport,
  ReportStatus,
  UserRole,
  PaginatedResponse,
  Professor,
  CreateProfessorRequest,
  EnrollmentResponse,
} from '../types';

// ────────── Dashboard ──────────

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
};

// ────────── Utilisateurs ──────────

interface UserFilters {
  page?: number;
  size?: number;
  filiere?: string;
  annee?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const getUsers = async (filters?: UserFilters): Promise<PaginatedResponse<Student>> => {
  const { data } = await api.get<PaginatedResponse<Student>>('/admin/users', { params: filters });
  return data;
};

export const updateUserStatus = async (userId: number | string, isActive: boolean): Promise<void> => {
  await api.put(`/admin/users/${userId}/status`, { isActive });
};

// ────────── Admins ──────────

export const getAdmins = async (): Promise<Student[]> => {
  const { data } = await api.get<Student[]>('/admin/admins');
  return data;
};

export const updateUserRole = async (userId: number | string, role: UserRole): Promise<void> => {
  await api.put(`/admin/users/${userId}/role`, { role });
};

// ────────── Cours ──────────

export const createCourse = async (payload: CourseCreateRequest): Promise<Course> => {
  const { data } = await api.post<Course>('/admin/courses', payload);
  return data;
};

export const updateCourse = async (id: number | string, payload: CourseUpdateRequest): Promise<Course> => {
  const { data } = await api.put<Course>(`/admin/courses/${id}`, payload);
  return data;
};

export const deleteCourse = async (id: number | string): Promise<void> => {
  await api.delete(`/admin/courses/${id}`);
};

// ────────── Ressources de cours ──────────

export const uploadCourseResource = async (
  courseId: number | string,
  file: File,
  title: string,
  type: string
): Promise<CourseResource> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('type', type);
  const { data } = await api.post<CourseResource>(`/admin/courses/${courseId}/resources`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCourseResource = async (courseId: number | string, resourceId: number | string): Promise<void> => {
  await api.delete(`/admin/courses/${courseId}/resources/${resourceId}`);
};

// ────────── Enrôlement étudiants ──────────

export const enrollStudent = async (courseId: number | string, studentId: number | string): Promise<EnrollmentResponse> => {
  const { data } = await api.post<EnrollmentResponse>(`/admin/courses/${courseId}/enroll`, { studentId });
  return data;
};

// ────────── Professeurs ──────────

export const getProfessors = async (): Promise<Professor[]> => {
  const { data } = await api.get<Professor[]>('/admin/professors');
  return data;
};

export const createProfessor = async (payload: CreateProfessorRequest): Promise<Professor> => {
  const { data } = await api.post<Professor>('/admin/professors', payload);
  return data;
};

export const assignCourseToProf = async (courseId: number | string, professorId: string): Promise<void> => {
  await api.post(`/admin/courses/${courseId}/assign-professor`, { professorId });
};

// ────────── Signalements ──────────

export const getReports = async (status?: ReportStatus): Promise<ExamReport[]> => {
  const { data } = await api.get<ExamReport[]>('/admin/reports', { params: { status } });
  return data;
};

export const updateReportStatus = async (reportId: number | string, status: ReportStatus): Promise<void> => {
  await api.put(`/admin/reports/${reportId}`, { status });
};

export const toggleExamVisibility = async (examId: number | string, isHidden: boolean): Promise<void> => {
  await api.put(`/admin/exams/${examId}/visibility`, { isHidden });
};

// ────────── Création d'administrateur (SUPER_ADMIN) ──────────

export interface CreateAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const createAdmin = async (payload: CreateAdminPayload): Promise<Student> => {
  const { data } = await api.post<Student>('/admin/admins', payload);
  return data;
};
