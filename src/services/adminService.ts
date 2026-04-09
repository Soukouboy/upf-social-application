/**
 * Service d'administration
 *
 * Endpoints réels (backend ENDPIN.md) :
 *
 * AdminController (/admin) :
 *   POST   /admin/bootstrap/initial              — créer le premier admin
 *   POST   /admin/accounts                       — créer un compte admin/modérateur
 *   POST   /admin/students/{studentId}/promote   — promouvoir un étudiant en admin
 *   GET    /admin/accounts                        — lister tous les admins
 *   GET    /admin/accounts/{adminProfileId}       — récupérer un profil admin
 *   PUT    /admin/accounts/{adminProfileId}/level — modifier le niveau d'un admin
 *   DELETE /admin/accounts/{adminProfileId}       — révoquer les droits admin
 *   POST   /admin/professors                      — créer un compte professeur
 *   PUT    /admin/professors/{professorId}/courses/{courseId} — assigner un cours à un prof
 *   GET    /admin/students                        — lister tous les étudiants
 *   POST   /admin/students/{studentId}/enroll/{courseId}   — inscrire un étudiant
 *   DELETE /admin/students/{studentId}/enroll/{courseId}   — désinscrire un étudiant
 *
 * AdminCourseController (/admin/courses) :
 *   POST   /admin/courses                        — créer un cours
 *   PUT    /admin/courses/{courseId}             — modifier un cours
 *   GET    /admin/courses/{courseId}             — récupérer un cours
 *   GET    /admin/courses                        — lister tous les cours (paginé)
 *   PATCH  /admin/courses/{courseId}/activate    — activer un cours
 *   PATCH  /admin/courses/{courseId}/deactivate  — désactiver un cours
 *   DELETE /admin/courses/{courseId}             — supprimer un cours
 *
 * Endpoints supplémentaires (non dans ENDPIN.md mais utilisés par le frontend) :
 *   GET    /admin/stats                          — statistiques globales
 *   GET    /admin/reports?status                 — liste des signalements
 *   PUT    /admin/reports/{id}                   — mettre à jour le statut d'un signalement
 *   PUT    /admin/exams/{id}/visibility          — masquer/afficher une épreuve
 */
import api from './api';
import type {
  AdminStats,
  AdminLevel,
  CreateAdminRequest,
  CreateProfessorRequest,
  CourseResourceResponse,
  ExamReport,
  ReportStatus,
  PaginatedResponse,
  CourseSummary,
  EnrollmentResponse,
} from '../types';

// ────────── Types spécifiques Admin ──────────────────────────────────────────

export interface AdminProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  adminLevel: AdminLevel;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessorProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  title?: string;
  courseNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  major: string;
  currentYear: number;
  profilePictureUrl?: string;
}

export interface CreateCourseAdminRequest {
  title: string;        // Aligné sur CourseSummary
  description?: string;
  code: string;
  credits: number;
  major?: string;        // Aligné sur CourseSummaryl
  semester: number;      // Changé de string à number
}

export interface UpdateCourseAdminRequest {
  title?: string;
  name?: string;
  description?: string;
  code?: string;
  credits?: number;
  major?: string;
  department?: string;
  year?: number;
  semester?: number;
  isActive?: boolean;
}

// ────────── Dashboard ──────────

export const getAdminStats = async (): Promise<AdminStats> => {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
};

// ────────── Comptes Admin ──────────

/** Lister tous les admins */
export const getAdminAccounts = async (): Promise<AdminProfileResponse[]> => {
  const { data } = await api.get<AdminProfileResponse[]>('/admin/accounts');
  return Array.isArray(data) ? data : [];
};

/** Récupérer un profil admin par ID */
export const getAdminById = async (adminProfileId: string): Promise<AdminProfileResponse> => {
  const { data } = await api.get<AdminProfileResponse>(`/admin/accounts/${adminProfileId}`);
  return data;
};

/** Créer un compte admin ou modérateur */
export const createAdminAccount = async (
  payload: CreateAdminRequest
): Promise<AdminProfileResponse> => {
  const { data } = await api.post<AdminProfileResponse>('/admin/accounts', payload);
  return data;
};

/** Promouvoir un étudiant en admin */
export const promoteStudentToAdmin = async (
  studentId: string,
  adminLevel: AdminLevel
): Promise<AdminProfileResponse> => {
  const { data } = await api.post<AdminProfileResponse>(
    `/admin/students/${studentId}/promote`,
    { adminLevel }
  );
  return data;
};

/** Modifier le niveau d'un admin */
export const updateAdminLevel = async (
  adminProfileId: string,
  adminLevel: AdminLevel
): Promise<AdminProfileResponse> => {
  const { data } = await api.put<AdminProfileResponse>(
    `/admin/accounts/${adminProfileId}/level`,
    { adminLevel }
  );
  return data;
};

/** Révoquer les droits admin (204 No Content) */
export const revokeAdmin = async (adminProfileId: string): Promise<void> => {
  await api.delete(`/admin/accounts/${adminProfileId}`);
};

/** Bootstrap — créer le premier admin */
export const bootstrapAdmin = async (
  payload: CreateAdminRequest & { adminLevel: AdminLevel }
): Promise<AdminProfileResponse> => {
  const { data } = await api.post<AdminProfileResponse>('/admin/bootstrap/initial', payload);
  return data;
};

// ────────── Étudiants ──────────

/** Lister tous les étudiants */
export const getStudents = async (): Promise<StudentProfileSummary[]> => {
  const { data } = await api.get<StudentProfileSummary[]>('/admin/students');
  return Array.isArray(data) ? data : [];
};

/** Inscrire un étudiant à un cours */
export const enrollStudent = async (
  studentId: string,
  courseId: string
): Promise<EnrollmentResponse> => {
  const { data } = await api.post<EnrollmentResponse>(
    `/admin/students/${studentId}/enroll/${courseId}`
  );
  return data;
};

/** Désinscrire un étudiant d'un cours */
export const unenrollStudent = async (
  studentId: string,
  courseId: string
): Promise<void> => {
  await api.delete(`/admin/students/${studentId}/enroll/${courseId}`);
};

// ────────── Professeurs ──────────

/** Créer un compte professeur */
export const createProfessor = async (
  payload: CreateProfessorRequest
): Promise<ProfessorProfileResponse> => {
  const { data } = await api.post<ProfessorProfileResponse>('/admin/professors', payload);
  return data;
};

/** Assigner un cours à un professeur */
export const assignCourseToProf = async (
  professorId: string,
  courseId: string
): Promise<ProfessorProfileResponse> => {
  const { data } = await api.put<ProfessorProfileResponse>(
    `/admin/professors/${professorId}/courses/${courseId}`
  );
  return data;
};

/** Lister tous les cours (admin) */
export const getAdminCourses = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<CourseSummary>> => {
  const { data } = await api.get<PaginatedResponse<CourseSummary>>('/admin/courses', {
    params: { page, size }
  });
  return data;
};

// ────────── Cours (AdminCourseController) ──────────

/** Créer un cours */
export const createCourse = async (
  payload: CreateCourseAdminRequest
): Promise<CourseSummary> => {
  const { data } = await api.post<CourseSummary>('/admin/courses', payload);
  return data;
};

/** Modifier un cours */
export const updateCourse = async (
  courseId: string,
  payload: UpdateCourseAdminRequest
): Promise<CourseSummary> => {
  const { data } = await api.put<CourseSummary>(`/admin/courses/${courseId}`, payload);
  return data;
};

/** Supprimer un cours */
export const deleteCourse = async (courseId: string): Promise<void> => {
  await api.delete(`/admin/courses/${courseId}`);
};

/** Activer un cours */
export const activateCourse = async (courseId: string): Promise<CourseSummary> => {
  const { data } = await api.patch<CourseSummary>(`/admin/courses/${courseId}/activate`);
  return data;
};

/** Désactiver un cours */
export const deactivateCourse = async (courseId: string): Promise<CourseSummary> => {
  const { data } = await api.put<CourseSummary>(`/admin/courses/${courseId}/deactivate`);
  return data;
};

// ────────── Signalements ──────────

export const getReports = async (status?: ReportStatus): Promise<ExamReport[]> => {
  const { data } = await api.get<ExamReport[]>('/admin/reports', { params: { status } });
  return Array.isArray(data) ? data : [];
};

export const resolveReport = async (
  reportId: string,
  accept: boolean
): Promise<void> => {
  await api.put(`/admin/reports/${reportId}/resolve`, null, { params: { accept } });
};

export const toggleExamVisibility = async (
  examId: string,
  isHidden: boolean
): Promise<void> => {
  await api.put(`/admin/exams/${examId}/visibility`, { isHidden });
};

// ────────── Ressources de cours (admin) ──────────

export const uploadCourseResource = async (
  courseId: string,
  file: File,
  title: string,
  type: string
): Promise<CourseResourceResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('type', type);
  const { data } = await api.post<CourseResourceResponse>(
    `/admin/courses/${courseId}/resources`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const deleteCourseResource = async (
  courseId: string,
  resourceId: string
): Promise<void> => {
  await api.delete(`/admin/courses/${courseId}/resources/${resourceId}`);
};

// ────────── Alias de compatibilité ──────────────────────────────────────────

/** @deprecated Utiliser getAdminAccounts() */
export const getAdmins = getAdminAccounts;

/** @deprecated Utiliser createAdminAccount() */
export const createAdmin = createAdminAccount;

/** @deprecated Utiliser updateAdminLevel() — l'ancien updateUserRole ne correspond plus */
export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  console.warn('[DEPRECATED] updateUserRole — utilisez promoteStudentToAdmin ou updateAdminLevel');
  await api.put(`/admin/users/${userId}/role`, { role });
};

/** @deprecated L'endpoint /admin/users n'existe plus — utiliser getStudents() */
export const getUsers = async (filters?: Record<string, unknown>) => {
  console.warn('[DEPRECATED] getUsers — utiliser getStudents() pour les étudiants');
  const { data } = await api.get('/admin/students', { params: filters });
  return { content: Array.isArray(data) ? data : [], totalElements: 0, totalPages: 1, number: 0, size: 20, first: true, last: true };
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  if (isActive) {
    await api.put(`/admin/users/${userId}/reactivate`);
  } else {
    await api.put(`/admin/users/${userId}/suspend`);
  }
};

export const getProfessors = async () => {
  // Note : pas d'endpoint direct GET /admin/professors dans ENDPIN.md
  // Cet endpoint est à ajouter côté backend
  const { data } = await api.get('/admin/professors');
  return Array.isArray(data) ? data : [];
};

// ────────── Groupes ──────────
export const deleteGroup = async (groupId: string): Promise<void> => {
  await api.delete(`/admin/groups/${groupId}`);
};

export const deactivateGroup = async (groupId: string): Promise<void> => {
  await api.put(`/admin/groups/${groupId}/deactivate`);
};

// ────────── Suppression / Désactivation des professeurs ──────────
export const deleteProfessor = async (professorId: string): Promise<void> => {
  await api.delete(`/admin/professors/${professorId}`);
};

export const deactivateProfessor = async (professorId: string): Promise<void> => {
  await api.put(`/admin/professors/${professorId}/deactivate`);
};
