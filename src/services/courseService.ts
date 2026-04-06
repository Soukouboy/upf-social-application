/**
 * Service des cours
 *
 * Endpoints :
 *   GET /courses          — liste paginée avec filtres
 *   GET /courses/:id      — détail d'un cours
 *   GET /courses/:id/resources — ressources associées
 */
import api from './api';
import type { CourseDetails, CourseResourceResponse, CourseFilters, PaginatedResponse, CourseSummary } from '../types';

/** Liste des cours avec filtres et pagination */
export const getCourses = async (filters?: CourseFilters): Promise<PaginatedResponse<CourseDetails>> => {
  const { data } = await api.get<PaginatedResponse<CourseDetails>>('/courses', { params: filters });
  return data;
};

/** Lister les cours de l'étudiant connecté */
export const getMyCourses = async (): Promise<CourseSummary[]> => {
  const { data } = await api.get<CourseDetails[]>('/courses/me');
  return data;
};

/** Détail d'un cours */
export const getCourseById = async (id: string): Promise<CourseDetails> => {
  const { data } = await api.get<CourseDetails>(`/courses/${id}`);
  return data;
};

/** Ressources associées à un cours */
export const getCourseResources = async (courseId: string): Promise<CourseResourceResponse[]> => {
  const { data } = await api.get<CourseResourceResponse[]>(`/courses/${courseId}/resources`);
  return data;
};

/** Télécharger une ressource d'un cours */
export const downloadCourseResource = async (courseId: string, resourceId: string): Promise<Blob> => {
  const { data } = await api.get<Blob>(`/courses/${courseId}/resources/${resourceId}/download`, {
    responseType: 'blob',
  });
  return data;
};
