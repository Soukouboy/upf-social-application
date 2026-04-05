/**
 * Service Professeur
 *
 * Endpoints attendus côté backend :
 *   GET    /professor/courses                     — cours du professeur connecté
 *   GET    /professor/courses/:id/students        — étudiants inscrits à un cours
 *   POST   /professor/courses/:id/documents       — upload un document de cours
 *   DELETE /professor/courses/:courseId/documents/:docId — supprimer un document
 *   GET    /professor/announcements               — liste des annonces du professeur
 *   POST   /professor/announcements               — créer une annonce
 */
import api from './api';
import type { Course, CourseResource, Student, Announcement } from '../types';

/** Liste des cours du professeur connecté */
export const getMyCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<Course[]>('/professor/courses');
  return data;
};

/** Étudiants inscrits à un cours */
export const getCourseStudents = async (courseId: number | string): Promise<Student[]> => {
  const { data } = await api.get<Student[]>(`/professor/courses/${courseId}/students`);
  return data;
};

/** Upload un document de cours */
export const uploadDocument = async (
  courseId: number | string,
  file: File,
  title: string,
  type: string
): Promise<CourseResource> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('type', type);
  const { data } = await api.post<CourseResource>(`/professor/courses/${courseId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Supprimer un document */
export const deleteDocument = async (courseId: number | string, docId: number | string): Promise<void> => {
  await api.delete(`/professor/courses/${courseId}/documents/${docId}`);
};

/** Liste des annonces du professeur */
export const getMyAnnouncements = async (): Promise<Announcement[]> => {
  const { data } = await api.get<Announcement[]>('/professor/announcements');
  return data;
};

/** Créer une annonce */
export const createAnnouncement = async (
  courseId: number | string,
  title: string,
  content: string
): Promise<Announcement> => {
  const { data } = await api.post<Announcement>('/professor/announcements', { courseId, title, content });
  return data;
};
