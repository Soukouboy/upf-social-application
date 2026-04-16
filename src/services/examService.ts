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
  ExamResponseDto,
  ExamFilters,
  ExamReport,
  VoteType,
  ReportReason,
  PaginatedResponse,
  ExamResponse,
} from '../types';

/** Liste des épreuves avec filtres et pagination */
export const getExams = async (filters?: ExamFilters): Promise<PaginatedResponse<ExamResponseDto>> => {
  const { data } = await api.get<any>('/exams', { params: filters });
  
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length || 10,
      first: true,
      last: true,
    };
  }
  
  return data;
};

/** Détail d'une épreuve */
export const getExamById = async (id: number | string): Promise<ExamResponseDto> => {
  const { data } = await api.get<ExamResponseDto>(`/exams/${id}`);
  return data;
};

/** Dépôt d'une épreuve (envoi multipart/form-data) */
export const uploadExam = async (payload: any): Promise<ExamResponse> => {
  const formData = new FormData();
  formData.append('subject', payload.subject);
  formData.append('courseId', payload.courseId);
  formData.append('academicYear', payload.academicYear);
  formData.append('examType', payload.type || payload.examType);
  if (payload.description) {
    formData.append('description', payload.description);
  }
  formData.append('file', payload.file);

  const { data } = await api.post<ExamResponse>('/exams/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Télécharger le fichier d'une épreuve */
export const downloadExam = async (id: number | string): Promise<Blob> => {
  const { data } = await api.get<Blob>(`/exams/${id}/download`, {
    responseType: 'blob',
  });
  return data;
};

/** Supprimer une épreuve */
export const deleteExam = async (id: number | string): Promise<void> => {
  await api.delete(`/exams/${id}`);
};

/** Voter pour une épreuve */
export const voteExam = async (id: number | string, type: VoteType): Promise<void> => {
  await api.post(`/exams/${id}/vote`, null, { params: { voteType: type } });
};

/** Signaler une épreuve */
export const reportExam = async (
  id: number | string,
  reason: ReportReason,
  description?: string
): Promise<ExamReport> => {
  const { data } = await api.post<ExamReport>(`/exams/${id}/report`, null, { 
    params: { reason, details: description || '' } 
  });
  return data;
};

/** Ajouter un commentaire à une épreuve */
export const addExamComment = async (id: number | string, comment: string): Promise<any> => {
  const { data } = await api.post(`/exams/${id}/comments`, comment, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return data;
};

/** Épreuves uploadées par l'utilisateur connecté (pour le dashboard) */
export const getMyExams = async (): Promise<PaginatedResponse<ExamResponseDto>> => {
  const { data } = await api.get<any>('/exams', {
    params: { uploadedByMe: true, size: 100 },
  });
  
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length || 10,
      first: true,
      last: true,
    };
  }
  
  return data;
};
