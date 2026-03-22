/**
 * Définitions TypeScript — Modèle de données du réseau social UPF
 *
 * Toutes les interfaces sont alignées sur les DTOs du backend Spring Boot.
 */

// ────────────────────────────── Auth ──────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  filiere: string;
  annee: number;
}

// ────────────────────────────── Utilisateur ──────────────────────────────

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  filiere: string;
  annee: number;
  bio?: string;
  avatarUrl?: string;
  competences?: string[];
  createdAt: string;
}

export interface StudentActivity {
  examsShared: number;
  groupsJoined: number;
  recentActions: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'EXAM_SHARED' | 'GROUP_JOINED' | 'COURSE_VIEWED' | 'COMMENT_POSTED';
  description: string;
  timestamp: string;
  relatedId?: number;
}

// ────────────────────────────── Cours ──────────────────────────────

export interface Course {
  id: number;
  title: string;
  description: string;
  objectives?: string[];
  prerequisites?: string[];
  filiere: string;
  annee: number;
  semestre: number;
  professorName?: string;
  createdAt: string;
}

export interface CourseResource {
  id: number;
  courseId: number;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT';
  url: string;
  sizeBytes?: number;
}

export interface CourseFilters {
  filiere?: string;
  annee?: number;
  semestre?: number;
  search?: string;
  page?: number;
  size?: number;
}

// ────────────────────────────── Épreuves ──────────────────────────────

export type ExamType = 'PARTIEL' | 'FINAL' | 'RATTRAPAGE' | 'CC' | 'TP' | 'AUTRE';

export interface Exam {
  id: number;
  title: string;
  matiere: string;
  anneeAcademique: string;
  type: ExamType;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  downloadCount: number;
  upvotes: number;
  downvotes: number;
  uploadedBy: Pick<Student, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  createdAt: string;
}

export interface ExamUploadRequest {
  title: string;
  matiere: string;
  anneeAcademique: string;
  type: ExamType;
  description?: string;
  file: File;
}

export interface ExamFilters {
  matiere?: string;
  anneeAcademique?: string;
  type?: ExamType;
  search?: string;
  page?: number;
  size?: number;
}

export type VoteType = 'UP' | 'DOWN';

export interface ExamVote {
  id: number;
  examId: number;
  userId: number;
  type: VoteType;
}

export type ReportReason = 'INAPPROPRIATE' | 'ERROR' | 'DUPLICATE' | 'PLAGIARISM' | 'OTHER';

export interface ExamReport {
  id: number;
  examId: number;
  userId: number;
  reason: ReportReason;
  description?: string;
  createdAt: string;
}

// ────────────────────────────── Groupes ──────────────────────────────

export type GroupVisibility = 'PUBLIC' | 'PRIVATE';
export type MemberRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type MembershipStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

export interface Group {
  id: number;
  name: string;
  description?: string;
  coverImageUrl?: string;
  visibility: GroupVisibility;
  memberCount: number;
  createdBy: Pick<Student, 'id' | 'firstName' | 'lastName'>;
  createdAt: string;
}

export interface GroupMembership {
  id: number;
  groupId: number;
  user: Pick<Student, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  role: MemberRole;
  status: MembershipStatus;
  joinedAt: string;
}

// ────────────────────────────── Messages ──────────────────────────────

export interface Message {
  id: number;
  groupId: number;
  sender: Pick<Student, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  content: string;
  timestamp: string;
}

export interface SendMessageRequest {
  groupId: number;
  content: string;
}

// ────────────────────────────── Notifications ──────────────────────────────

export type NotificationType = 'NEW_EXAM' | 'NEW_COURSE' | 'GROUP_MESSAGE' | 'GROUP_INVITE' | 'SYSTEM';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedId?: number;
  createdAt: string;
}

// ────────────────────────────── API Génériques ──────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
}

// ────────────────────────────── Réseau & Abonnements ──────────────────────────────

export interface StudentNetwork extends Student {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

