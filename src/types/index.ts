/**
 * Définitions TypeScript — alignées sur les DTOs backend Spring Boot UPF
 *
 * Règles :
 *  - Tous les IDs sont des UUID → string (jamais number)
 *  - Les noms de champs correspondent exactement aux DTOs des mappers
 *  - Les enums correspondent aux enums Java du backend
 */

// =============================================================================
// ENUMS — correspondance exacte avec les enums Java
// =============================================================================

export type UserRole = 'STUDENT' | 'PROFESSOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AdminLevel = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE';

export type ExamType = 'PARTIEL' | 'FINAL' | 'RATTRAPAGE' | 'CC' | 'TP' | 'AUTRE';

// Correspond à FileType.java
export type FileType = 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX'
  | 'PNG' | 'JPEG' | 'JPG' | 'GIF' | 'ZIP' | 'TXT';

// Correspond à ContextMessage.java (discriminant de Messages.java)
export type ContextMessage = 'GROUP' | 'PRIVATE';

// Correspond à MessageType.java
export type MessageType = 'TEXT' | 'FILE' | 'IMAGE';

// Correspond à NotificationType.java
export type NotificationType =
  | 'WELCOME'
  | 'ACCOUNT_CREATED'
  | 'ENROLLMENT_CONFIRMED'
  | 'NEW_RESOURCE'
  | 'NEW_ANNOUNCEMENT'
  | 'NEW_MESSAGE'
  | 'NEW_FOLLOWER'
  | 'NEW_GROUP_MEMBER'
  | 'ADMIN_ALERT';

// Correspond à NotificationStatus.java
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export type GroupVisibility = 'PUBLIC' | 'PRIVATE';

export type MemberRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export type MembershipStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

export type ReportReason = 'INAPPROPRIATE' | 'ERROR' | 'DUPLICATE' | 'PLAGIARISM' | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';

export type VoteType = 'UP' | 'DOWN';

// =============================================================================
// AUTH
// =============================================================================

// Correspond à AuthTokens.java (record)
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;       // UUID — toujours présent
  profileId: string;    // UUID — studentId | adminId | professorId selon le rôle
  role: UserRole;       // enum sérialisé par Jackson → "STUDENT" | "ADMIN" | "PROFESSOR"
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Correspond à RegisterStudentRequest.java (record)
export interface RegisterStudentRequest {
  firstName: string;
  lastName: string;
  email: string;        // doit finir par @upf.ac.ma
  password: string;     // min 8 caractères
  major: string;        // filière (ex: "Génie Informatique")
  currentYear: number;  // année d'études
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// =============================================================================
// USER & PROFILS
// =============================================================================

// Correspond à StudentProfile.java (résumé pour les listes)
export interface StudentSummary {
  id: string;           // UUID de StudentProfile
  userId: string;       // UUID de User
  firstName: string;
  lastName: string;
  email: string;
  major: string;
  currentYear: number;
  avatarUrl?: string;
  profilePublic: boolean;
}

// Correspond à StudentProfile.java (détail complet)
export interface StudentDetails extends StudentSummary {
  bio?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;  // calculé côté backend selon l'utilisateur connecté
}

// Correspond à ProfessorProfile.java
export interface ProfessorSummary {
  id: string;           // UUID de ProfessorProfile
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  title?: string;       // "Dr.", "Pr."
}

export interface ProfessorDetails extends ProfessorSummary {
  bio?: string;
  courses: CourseSummary[];
}

// Correspond à AdminProfile.java
export interface AdminProfile {
  id: string;           // UUID de AdminProfile
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  adminLevel: AdminLevel;
}

// =============================================================================
// COURS — DTOs des mappers CourseMapper
// =============================================================================

// Correspond à CourseSummary.java (liste paginée)
export interface CourseSummary {
  id: string;           // UUID
  code: string;
  title: string;
  major: string;        // ← "major" et non "filiere"
  year: number;         // ← "year" et non "annee"
  semester: number;     // ← "semester" et non "semestre"
  credits: number;
  instructorName: string;
  isActive: boolean;
}

// Correspond à CourseDetails.java (détail complet)
export interface CourseDetails extends CourseSummary {
  description?: string;
  objectives?: string;
  prerequisites?: string;
  resources: CourseResourceResponse[];
  announcements: AnnouncementResponse[];
  createdAt: string;
  updatedAt: string;
}

// Correspond à CourseResourceResponse.java
export interface CourseResourceResponse {
  id: string;           // UUID
  courseId: string;     // UUID
  title: string;
  fileUrl: string;
  fileType: FileType;
  fileSizeBytes?: number;   // nullable pour les liens externes
  downloadCount: number;
  isExternal: boolean;
  uploadedAt: string;
  uploadedByName?: string;  // nom du professeur
}

// Correspond à AnnouncementResponse.java
export interface AnnouncementResponse {
  id: string;           // UUID
  courseId: string;     // UUID
  courseTitle: string;
  title: string;
  content: string;
  professorName: string;
  createdAt: string;
}

// =============================================================================
// COURS — Requêtes (envoyées au backend)
// =============================================================================

// Correspond à CreateCourseRequest.java (record)
export interface CreateCourseRequest {
  code: string;
  title: string;
  description?: string;
  objectives?: string;
  prerequisites?: string;
  major: string;
  year: number;
  semester: number;
  credits: number;
  instructorName: string;
}

// Correspond à UpdateCourseRequest.java (record)
export interface UpdateCourseRequest {
  title: string;
  description?: string;
  objectives?: string;
  prerequisites?: string;
  credits: number;
  isActive: boolean;
}

export interface CourseFilters {
  major?: string;
  year?: number;
  semester?: number;
  search?: string;
  page?: number;
  size?: number;
}

// =============================================================================
// ÉPREUVES — DTOs des mappers ExamMapper
// =============================================================================

// Correspond à ExamSummary.java
export interface ExamSummary {
  id: string;           // UUID
  subject: string;
  academicYear: string;
  examType: ExamType;
  fileName: string;
  fileSizeBytes: number;
  downloadCount: number;
  upvoteCount: number;
  uploadedBy: StudentSummary;
  courseId: string;     // UUID
  createdAt: string;
}

// Correspond à ExamResponse.java
export interface ExamResponse extends ExamSummary {
  fileUrl: string;
  fileHash: string;
  description?: string;
}

// Correspond à ExamDetails.java
export interface ExamDetails extends ExamResponse {
  comments: ExamCommentResponse[];
  userVote?: VoteType;  // vote de l'utilisateur connecté
  isHidden: boolean;
}

// Correspond à ExamCommentResponse.java
export interface ExamCommentResponse {
  id: string;           // UUID
  examId: string;
  content: string;
  author: StudentSummary;
  createdAt: string;
}

// Requête d'upload — envoyée en multipart/form-data
export interface ExamUploadRequest {
  courseId: string;     // UUID
  subject: string;
  academicYear: string;
  examType: ExamType;
  description?: string;
  file: File;           // MultipartFile côté backend
}

export interface ExamFilters {
  subject?: string;
  major?: string;
  courseYear?: number;
  academicYear?: string;
  examType?: ExamType;
  uploaderId?: string;  // UUID
  page?: number;
  size?: number;
}

// Correspond à ExamReport.java
export interface ExamReport {
  id: string;           // UUID
  examId: string;
  examTitle: string;
  reporterId: string;   // UUID StudentProfile
  reporterName: string;
  reason: ReportReason;
  status: ReportStatus;
  description?: string;
  createdAt: string;
}

// =============================================================================
// GROUPES ACADÉMIQUES
// =============================================================================

// Correspond à AcademicGroup.java (résumé)
export interface GroupSummary {
  id: string;           // UUID
  name: string;
  description?: string;
  visibility: GroupVisibility;
  memberCount: number;
  createdAt: string;
}

// Correspond à AcademicGroup.java (détail)
export interface GroupDetails extends GroupSummary {
  coverImageUrl?: string;
  createdBy: StudentSummary;
  members: GroupMembershipResponse[];
}

// Correspond à GroupMembership.java
export interface GroupMembershipResponse {
  id: string;           // UUID
  groupId: string;
  student: StudentSummary;
  role: MemberRole;
  status: MembershipStatus;
  joinedAt: string;
}

// =============================================================================
// MESSAGES — alignés sur Messages.java
// =============================================================================

// Correspond à Messages.java (message de groupe ou privé)
export interface ChatMessageResponse {
  id: string;           // UUID
  context: ContextMessage;
  groupId?: string;     // UUID — présent si context = GROUP
  senderId: string;     // UUID brut (StudentProfile) ← UUID brut dans l'entité
  recipientId?: string; // UUID brut — présent si context = PRIVATE
  senderName: string;   // calculé côté backend
  content?: string;
  messageType: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;   // UUID
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;    // ← "createdAt" et non "timestamp" ni "sentAt"
}

// Envoyé via STOMP WebSocket vers /app/chat/group/{groupId}
export interface ChatMessageRequest {
  content: string;
  groupId?: string;     // UUID — null si message privé
}

// Correspond à Conversation (liste des DMs)
export interface Conversation {
  studentId: string;    // UUID StudentProfile de l'interlocuteur
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// =============================================================================
// NOTIFICATIONS — alignées sur Notification.java
// =============================================================================

// Correspond à Notification.java
export interface NotificationResponse {
  id: string;             // UUID
  type: NotificationType;
  status: NotificationStatus;
  title: string;          // ← "title" et non "subject"
  content?: string;       // ← "content" et non "message"
  relatedEntityType?: string;  // "COURSE", "ANNOUNCEMENT", "MESSAGE"...
  relatedEntityId?: string;    // UUID de l'entité liée
  isRead: boolean;        // ← "isRead" et non "read"
  createdAt: string;
  expiresAt?: string;
}

// Envoyé via WebSocket STOMP → /user/queue/notifications
export interface WsNotification {
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;   // UUID
}

// =============================================================================
// FOLLOW / RÉSEAU
// =============================================================================

// Correspond à Follow.java
export interface FollowResponse {
  id: string;           // UUID
  follower: StudentSummary;
  followed: StudentSummary;
  followedAt: string;
}

// StudentNetwork — voir alias de compatibilité en bas de fichier

// =============================================================================
// BADGES
// =============================================================================

// Correspond à Badge.java / StudentBadge.java
export interface BadgeResponse {
  id: string;           // UUID
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// =============================================================================
// ENROLLMENT
// =============================================================================

// Correspond à Enrollment.java
export interface EnrollmentResponse {
  id: string;           // UUID
  studentId: string;    // UUID StudentProfile
  courseId: string;     // UUID Course
  courseTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

// =============================================================================
// ADMIN
// =============================================================================

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
  totalExams: number;
  totalGroups: number;
  pendingReports: number;
}

// Correspond à CreateAdminRequest.java (record)
export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adminLevel: AdminLevel;
}

// Correspond à CreateProfessorRequest.java (record)
export interface CreateProfessorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
  title?: string;
  courseIds?: string[];  // UUID[] des cours à assigner à la création
}

// Correspond à UploadResourceRequest.java (record)
export interface UploadResourceRequest {
  title: string;
  fileUrl: string;
  fileType: FileType;
  fileSizeBytes?: number;
  isExternal: boolean;
}

// Correspond à AnnouncementRequest.java (record)
export interface AnnouncementRequest {
  title: string;
  content: string;
}

// =============================================================================
// API GÉNÉRIQUES — pagination Spring Data
// =============================================================================

// Correspond à Page<T> de Spring Data
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // ← "number" (index page) et non "page"
  size: number;
  first: boolean;
  last: boolean;        // ← "last" et non "hasNext"
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

// =============================================================================
// ALIAS DE COMPATIBILITÉ (frontend)
// 
// Les anciens noms utilisés dans les pages/services sont mappés ici vers
// les types alignés backend. Les propriétés supplémentaires sont ajoutées
// pour la compatibilité avec le code existant. Ces alias seront retirés
// lors de la migration complète vers les types backend.
// =============================================================================

/** Alias utilisé par toutes les pages existantes */
export interface Student {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  filiere: string;
  annee: number;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
  competences?: string[];
}

/** Alias réseau (Student + infos follow) */
export interface StudentNetwork extends Student {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  major?: string;
  currentYear?: number;
}

/** Alias cours utilisé dans les pages */
export interface Course {
  id: number | string;
  code?: string;
  title: string;
  description?: string;
  filiere: string;
  annee: number;
  semestre: number;
  professorName: string;
  isActive: boolean;
  createdAt: string;
  credits?: number;
}

/** Alias épreuves */
export interface Exam {
  id: number | string;
  title: string;
  matiere: string;
  anneeAcademique: string;
  type: ExamType;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  downloadCount: number;
  upvotes: number;
  downvotes: number;
  uploadedBy: { id: number | string; firstName: string; lastName: string };
  createdAt: string;
  description?: string;
}

/** Requête d'upload d'épreuve (ancien format) */
export interface ExamUploadRequestLegacy {
  title: string;
  matiere: string;
  anneeAcademique: string;
  type: ExamType;
  description?: string;
  file: File;
}

/** Alias ressource de cours */
export interface CourseResource {
  id: number | string;
  courseId: number | string;
  title: string;
  type: string;
  url: string;
  sizeBytes?: number;
  downloadCount: number;
}

/** Alias annonce */
export interface Announcement {
  id: number | string;
  courseId: number | string;
  courseTitle: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

/** Alias groupe */
export interface Group {
  id: number | string;
  name: string;
  description?: string;
  visibility: GroupVisibility;
  memberCount: number;
  createdBy: { id: number | string; firstName: string; lastName: string };
  createdAt: string;
  coverImageUrl?: string;
}

/** Alias adhésion de groupe */
export interface GroupMembership {
  id: number | string;
  groupId: number | string;
  user: { id: number | string; firstName: string; lastName: string };
  role: MemberRole;
  status: MembershipStatus;
  joinedAt: string;
}

/** Message privé (ancien format) */
export interface DirectMessage {
  id: number | string;
  senderId: number | string;
  receiverId: number | string;
  senderName: string;
  content: string;
  read: boolean;
  timestamp: string;
}

/** Message de groupe (ancien format) */
export interface Message {
  id: number | string;
  senderId: number | string;
  senderName: string;
  content: string;
  groupId: number | string;
  timestamp: string;
}

/** Requête de création de cours (ancien format) */
export interface CourseCreateRequest {
  code?: string;
  title: string;
  description?: string;
  filiere: string;
  annee: number;
  semestre: number;
  professorName?: string;
  credits?: number;
}

/** Requête de modification de cours (ancien format) */
export interface CourseUpdateRequest {
  code?: string;
  title: string;
  description?: string;
  filiere: string;
  annee: number;
  semestre: number;
  professorName?: string;
  credits?: number;
  isActive?: boolean;
}

/** Alias RegisterRequest */
export type RegisterRequest = RegisterStudentRequest;

/** Alias Conversation — ancien format avec userId */
export interface ConversationLegacy {
  userId: number | string;
  firstName: string;
  lastName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  avatarUrl?: string;
}

/** Professeur — alias simplifié */
export interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  title?: string;
  courses?: Course[];
}