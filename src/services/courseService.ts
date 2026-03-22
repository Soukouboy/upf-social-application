/**
 * Service des cours
 *
 * Endpoints :
 *   GET /courses          — liste paginée avec filtres
 *   GET /courses/:id      — détail d'un cours
 *   GET /courses/:id/resources — ressources associées
 */
import api from './api';
import type { Course, CourseResource, CourseFilters, PaginatedResponse } from '../types';

/** Liste des cours avec filtres et pagination */
export const getCourses = async (filters?: CourseFilters): Promise<PaginatedResponse<Course>> => {
  const { data } = await api.get<PaginatedResponse<Course>>('/courses', { params: filters });
  return data;
};

/** Détail d'un cours */
export const getCourseById = async (id: number): Promise<Course> => {
  const { data } = await api.get<Course>(`/courses/${id}`);
  return data;
};

/** Ressources associées à un cours */
export const getCourseResources = async (courseId: number): Promise<CourseResource[]> => {
  const { data } = await api.get<CourseResource[]>(`/courses/${courseId}/resources`);
  return data;
};
