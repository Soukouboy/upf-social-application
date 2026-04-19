/**
 * Service des présences académiques (Attendance)
 *
 * Endpoints (alignés sur QUICK_START_TESTS.md) :
 *   POST  /attendance/courses/{courseId}/sessions             — créer une séance
 *   GET   /attendance/courses/{courseId}/sessions             — lister les séances
 *   POST  /attendance/sessions/{sessionId}/attendances        — marquer une présence
 *   POST  /attendance/sessions/{sessionId}/attendances/bulk   — marquer en bulk
 *   PATCH /attendance/sessions/{sessionId}/lock               — verrouiller une séance
 *   GET   /attendance/courses/{courseId}/report               — rapport par cours
 *   GET   /attendance/my/report                               — rapport personnel (étudiant)
 */
import api from './api';
import type {
  SessionResponse,
  CreateSessionRequest,
  AttendanceResponse,
  MarkAttendanceRequest,
  BulkAttendanceRequest,
  AttendanceReportEntry,
} from '../types';

// ─── Séances ──────────────────────────────────────────────────────────────────

/**
 * Créer une nouvelle séance pour un cours.
 * Rôles : PROFESSOR / ADMIN
 */
export const createSession = async (
  courseId: string,
  data: CreateSessionRequest
): Promise<SessionResponse> => {
  const { data: response } = await api.post<SessionResponse>(
    `/attendance/courses/${courseId}/sessions`,
    data
  );
  return response;
};

/**
 * Lister toutes les séances d'un cours (ordre chronologique).
 * Rôles : PROFESSOR / ADMIN
 */
export const getCourseSessions = async (courseId: string): Promise<SessionResponse[]> => {
  const { data } = await api.get<SessionResponse[]>(
    `/attendance/courses/${courseId}/sessions`
  );
  return Array.isArray(data) ? data : [];
};

// ─── Présences ────────────────────────────────────────────────────────────────

/**
 * Marquer la présence d'un seul étudiant pour une séance.
 * Rôles : PROFESSOR / ADMIN
 */
export const markAttendance = async (
  sessionId: string,
  data: MarkAttendanceRequest
): Promise<AttendanceResponse> => {
  const { data: response } = await api.post<AttendanceResponse>(
    `/attendance/sessions/${sessionId}/attendances`,
    data
  );
  return response;
};

/**
 * Marquer les présences de plusieurs étudiants en une seule requête.
 * Rôles : PROFESSOR / ADMIN
 */
export const bulkMarkAttendance = async (
  sessionId: string,
  data: BulkAttendanceRequest
): Promise<AttendanceResponse[]> => {
  const { data: response } = await api.post<AttendanceResponse[]>(
    `/attendance/sessions/${sessionId}/attendances/bulk`,
    data
  );
  return Array.isArray(response) ? response : [];
};

/**
 * Verrouiller une séance (empêche toute modification ultérieure des présences).
 * Rôles : PROFESSOR / ADMIN
 */
export const lockSession = async (sessionId: string): Promise<SessionResponse> => {
  const { data } = await api.patch<SessionResponse>(
    `/attendance/sessions/${sessionId}/lock`
  );
  return data;
};

// ─── Rapports ─────────────────────────────────────────────────────────────────

/**
 * Rapport complet de présences pour un cours donné.
 * Inclut taux d'absence + éligibilité pour chaque étudiant.
 * Rôles : PROFESSOR / ADMIN
 */
export const getCourseAttendanceReport = async (
  courseId: string
): Promise<AttendanceReportEntry[]> => {
  const { data } = await api.get<AttendanceReportEntry[]>(
    `/attendance/courses/${courseId}/report`
  );
  return Array.isArray(data) ? data : [];
};

/**
 * Rapport personnel de présences de l'étudiant connecté (tous ses cours).
 * Rôle : STUDENT uniquement
 */
export const getMyAttendanceReport = async (): Promise<AttendanceReportEntry[]> => {
  const { data } = await api.get<AttendanceReportEntry[]>('/attendance/my/report');
  return Array.isArray(data) ? data : [];
};
