/**
 * Service des épreuves (exams)
 *
 * Endpoints :
 *   GET    /exams              — liste paginée avec filtres
 *   GET    /exams/:id          — détail d'une épreuve
 *   POST   /exams              — dépôt d'une épreuve (multipart)
 *   GET    /exams/:id/download — téléchargement du fichier
 *   POST   /exams/:id/vote     — vote (up/down)
 *   POST   /exams/:id/report   — signalement
 */
import api from './api';
import type {
  Exam,
  ExamUploadRequest,
  ExamFilters,
  ExamReport,
  VoteType,
  ReportReason,
  PaginatedResponse,
} from '../types';

/** Liste des épreuves avec filtres et pagination */
export const getExams = async (filters?: ExamFilters): Promise<PaginatedResponse<Exam>> => {
  const { data } = await api.get<PaginatedResponse<Exam>>('/exams', { params: filters });
  return data;
};

/** Détail d'une épreuve */
export const getExamById = async (id: number): Promise<Exam> => {
  const { data } = await api.get<Exam>(`/exams/${id}`);
  return data;
};

/** Dépôt d'une épreuve (envoi multipart/form-data) */
export const uploadExam = async (payload: ExamUploadRequest): Promise<Exam> => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('matiere', payload.matiere);
  formData.append('anneeAcademique', payload.anneeAcademique);
  formData.append('type', payload.type);
  if (payload.description) formData.append('description', payload.description);
  formData.append('file', payload.file);

  const { data } = await api.post<Exam>('/exams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Télécharger le fichier d'une épreuve */
export const downloadExam = async (id: number): Promise<Blob> => {
  const { data } = await api.get<Blob>(`/exams/${id}/download`, {
    responseType: 'blob',
  });
  return data;
};

/** Voter pour une épreuve */
export const voteExam = async (id: number, type: VoteType): Promise<void> => {
  await api.post(`/exams/${id}/vote`, { type });
};

/** Signaler une épreuve */
export const reportExam = async (
  id: number,
  reason: ReportReason,
  description?: string
): Promise<ExamReport> => {
  const { data } = await api.post<ExamReport>(`/exams/${id}/report`, { reason, description });
  return data;
};
