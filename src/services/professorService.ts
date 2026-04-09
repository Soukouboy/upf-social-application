/**
 * Service Professeur
 *   GET    /professors/me/courses                          — cours du professeur connecté
 *   GET    /professors/me/courses/{courseId}/students      — étudiants inscrits à un cours
 *   POST   /professors/me/courses/{courseId}/resources     — upload une ressource (multipart)
 *   POST   /professors/me/courses/{courseId}/announcements — créer une annonce
 *   DELETE /professors/me/announcements/{announcementId}   — supprimer une annonce
 *
 * Note : Le préfixe est /professors/me/ (et non /professor/)
 */
import api from './api';
import type { CourseSummary, CourseResourceResponse, AnnouncementResponse } from '../types';

// ─── Cours ────────────────────────────────────────────────────────────────────

/** Liste des cours du professeur connecté (204 si aucun cours) */
export const getMyCourses = async (): Promise<CourseSummary[]> => {
  const { data, status } = await api.get<CourseSummary[] | null>('/professors/me/courses');
  if (status === 204 || !data) return [];
  return Array.isArray(data) ? data : [];
};

/** Étudiants inscrits à un cours du professeur */
export const getCourseStudents = async (courseId: string): Promise<StudentProfileSummary[]> => {
  const { data } = await api.get<StudentProfileSummary[]>(
    `/professors/me/courses/${courseId}/students`
  );
  return Array.isArray(data) ? data : [];
};

// ─── Ressources ──────────────────────────────────────────────────────────────

/** Upload une ressource pour un cours (multipart/form-data) */
export const uploadResource = async (
  courseId: string,
  file: File,
  title: string,
  fileType: string,
  isExternal: boolean = false
): Promise<CourseResourceResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('fileType', fileType);
  formData.append('isExternal', String(isExternal));

  const { data } = await api.post<CourseResourceResponse>(
    `/professors/me/courses/${courseId}/resources`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

/** @deprecated Utiliser uploadResource() */
export const uploadDocument = (
  courseId: string,
  file: File,
  title: string,
  fileType: string
) => uploadResource(courseId, file, title, fileType, false);

// ─── Annonces ─────────────────────────────────────────────────────────────────

/** Liste de toutes les annonces du professeur */
export const getMyAnnouncements = async (): Promise<AnnouncementResponse[]> => {
  const { data, status } = await api.get<AnnouncementResponse[] | null>('/professors/me/announcements');
  if (status === 204 || !data) return [];
  return Array.isArray(data) ? data : [];
};

/** Créer une annonce pour un cours */
export const createAnnouncement = async (
  courseId: string,
  title: string,
  content: string
): Promise<AnnouncementResponse> => {
  const { data } = await api.post<AnnouncementResponse>(
    `/professors/me/courses/${courseId}/announcements`,
    { title, content }
  );
  return data;
};

/** Supprimer une annonce */
export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  await api.delete(`/professors/me/announcements/${announcementId}`);
};

// ─── Types locaux ─────────────────────────────────────────────────────────────

export interface StudentProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  major: string;
  currentYear: number;
  profilePictureUrl?: string;
}

/**
 * Inscrire un étudiant dans un cours du professeur connecté.
 */
export const enrollStudentInMyCourse = async (
  courseId: string,
  studentId: string
): Promise<void> => {
  // Tentative d'abord sur l'endpoint prof
  try {
    await api.post(`/professors/me/courses/${courseId}/students/${studentId}`);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      // Fallback sur l'endpoint admin
      await api.post(`/admin/students/${studentId}/enroll/${courseId}`);
    } else {
      throw err;
    }
  }
};
