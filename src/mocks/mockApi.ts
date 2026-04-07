// /**
//  * Mock API — Intercepte les requêtes Axios pour simuler le backend
//  *
//  * Couvre : auth, users, courses, exams, groups, messages, admin, professor.
//  *
//  * Rôles de test :
//  *   - admin@upf.ac.ma    → ADMIN
//  *   - prof@upf.ac.ma     → PROFESSOR
//  *   - *@upf.ac.ma        → STUDENT
//  */
// import MockAdapter from 'axios-mock-adapter';
// import api from '../services/api';
// import type {
//   Student, StudentNetwork, Course, Exam, Group,
//   AdminStats, Announcement, Professor, DirectMessage,
// } from '../types';

// export const startMockApi = () => {
//   const mock = new MockAdapter(api, { delayResponse: 300 });

//   // ────────── DONNÉES MOCK ──────────



//   let mockUser: Student = {
//     id: 1,
//     firstName: 'Amine',
//     lastName: 'Benali',
//     email: 'amine.benali@upf.ac.ma',
//     filiere: 'Génie Informatique',
//     annee: 3,
//     bio: 'Passionné par le développement web et les nouvelles technologies.',
//     role: 'STUDENT',
//     isActive: true,
//     createdAt: '2025-09-01',
//     competences: ['React', 'TypeScript', 'Java', 'Spring Boot'],
//   };

//   let mockNetworkUsers: StudentNetwork[] = [
//     { id: 2, firstName: 'Sarah', lastName: 'Alaoui', email: 'sarah@upf.ac.ma', filiere: 'Génie Électrique', annee: 2, role: 'STUDENT', isActive: true, createdAt: '2025-09-15', isFollowing: false, followersCount: 120, followingCount: 45, major: 'Génie Électrique', currentYear: 2 },
//     { id: 3, firstName: 'Youssef', lastName: 'Karimi', email: 'youssef@upf.ac.ma', filiere: 'Génie Civil', annee: 4, role: 'STUDENT', isActive: true, createdAt: '2024-09-01', isFollowing: true, followersCount: 89, followingCount: 12, major: 'Génie Civil', currentYear: 4 },
//     { id: 4, firstName: 'Lina', lastName: 'Tazi', email: 'lina@upf.ac.ma', filiere: 'Architecture', annee: 1, role: 'STUDENT', isActive: false, createdAt: '2026-01-10', isFollowing: false, followersCount: 304, followingCount: 150, major: 'Architecture', currentYear: 1 },
//     { id: 5, firstName: 'Omar', lastName: 'Fassi', email: 'omar@upf.ac.ma', filiere: 'Management', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2025-03-20', isFollowing: false, followersCount: 45, followingCount: 80, major: 'Management', currentYear: 3 },
//     { id: 6, firstName: 'Kenza', lastName: 'Moussaoui', email: 'kenza@upf.ac.ma', filiere: 'Génie Informatique', annee: 2, role: 'STUDENT', isActive: true, createdAt: '2025-10-01', isFollowing: true, followersCount: 210, followingCount: 198, major: 'Génie Informatique', currentYear: 2 },
//     { id: 7, firstName: 'Mehdi', lastName: 'Bennani', email: 'mehdi@upf.ac.ma', filiere: 'Génie Mécanique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2024-09-01', isFollowing: false, followersCount: 15, followingCount: 20, major: 'Génie Mécanique', currentYear: 3 },
//     { id: 8, firstName: 'Nadia', lastName: 'Idrissi', email: 'nadia@upf.ac.ma', filiere: 'Génie Informatique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2025-02-15', isFollowing: false, followersCount: 67, followingCount: 55, major: 'Génie Informatique', currentYear: 3 },
//   ];

//   let mockCourses: Course[] = [
//     { id: 1, code: 'INF301', title: "Algorithmique avancée", description: "Structures de données, arbres, graphes, complexité algorithmique.", filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Chraibi', isActive: true, createdAt: '2025-09-01', credits: 4 },
//     { id: 2, code: 'INF302', title: 'Programmation Web', description: 'React, Spring Boot, API REST, TypeScript.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Chraibi', isActive: true, createdAt: '2025-09-01', credits: 4 },
//     { id: 3, code: 'INF303', title: 'Base de données avancées', description: 'SQL avancé, NoSQL, optimisation de requêtes.', filiere: 'Génie Informatique', annee: 3, semestre: 5, professorName: 'Dr. Amrani', isActive: false, createdAt: '2025-09-01', credits: 3 },
//     { id: 4, code: 'INF201', title: "Systèmes d'exploitation", description: 'Linux, processus, threads, gestion mémoire.', filiere: 'Génie Informatique', annee: 2, semestre: 3, professorName: 'Dr. Chraibi', isActive: true, createdAt: '2025-09-01', credits: 3 },
//     { id: 5, code: 'GC201', title: 'Mécanique des structures', description: 'Calcul des structures RDM.', filiere: 'Génie Civil', annee: 2, semestre: 3, professorName: 'Dr. Fassi', isActive: true, createdAt: '2025-09-01', credits: 4 },
//   ];

//   const mockExams: Exam[] = [
//     { id: 1, title: 'Partiel Algorithmique 2024', matiere: 'Algorithmique', anneeAcademique: '2023-2024', type: 'PARTIEL', fileUrl: '#', fileName: 'partiel_algo_2024.pdf', fileSizeBytes: 1024000, downloadCount: 45, upvotes: 12, downvotes: 0, uploadedBy: { id: 2, firstName: 'Sarah', lastName: 'Alaoui' }, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
//     { id: 2, title: 'Final Programmation Web 2024', matiere: 'Programmation Web', anneeAcademique: '2023-2024', type: 'FINAL', fileUrl: '#', fileName: 'final_web_2024.pdf', fileSizeBytes: 2048000, downloadCount: 78, upvotes: 23, downvotes: 1, uploadedBy: { id: 3, firstName: 'Youssef', lastName: 'Karimi' }, createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
//     { id: 3, title: 'CC Base de données 2025', matiere: 'Base de données', anneeAcademique: '2024-2025', type: 'CC', fileUrl: '#', fileName: 'cc_bdd_2025.pdf', fileSizeBytes: 512000, downloadCount: 22, upvotes: 8, downvotes: 0, uploadedBy: { id: 6, firstName: 'Kenza', lastName: 'Moussaoui' }, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
//   ];

//   let mockGroups: Group[] = [
//     { id: 1, name: 'Entraide Génie Info (3ème année)', description: 'Groupe de révision pour nos examens de S5. Partagez vos notes et posez vos questions.', visibility: 'PUBLIC', memberCount: 24, createdBy: { id: 1, firstName: 'Amine', lastName: 'Benali' }, createdAt: '2025-10-01' },
//     { id: 2, name: 'Projet Web — Équipe Alpha', description: 'Coordination du projet final de Programmation Web.', visibility: 'PRIVATE', memberCount: 5, createdBy: { id: 3, firstName: 'Youssef', lastName: 'Karimi' }, createdAt: '2026-01-15' },
//     { id: 3, name: 'Club Robotique UPF', description: 'Pour les passionnés de robotique et d\'électronique.', visibility: 'PUBLIC', memberCount: 42, createdBy: { id: 7, firstName: 'Mehdi', lastName: 'Bennani' }, createdAt: '2025-09-20' },
//   ];

//   const mockConversations = [
//     { userId: 2, firstName: 'Sarah', lastName: 'Alaoui', lastMessage: 'Merci pour les notes !', lastMessageTime: new Date(Date.now() - 300000).toISOString(), unreadCount: 2, isOnline: true },
//     { userId: 3, firstName: 'Youssef', lastName: 'Karimi', lastMessage: 'On se retrouve à la biblio à 14h ?', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, isOnline: true },
//     { userId: 4, firstName: 'Lina', lastName: 'Tazi', lastMessage: 'Voici le PDF du cours.', lastMessageTime: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1, isOnline: false },
//     { userId: 5, firstName: 'Omar', lastName: 'Fassi', lastMessage: 'Super présentation hier ! 👏', lastMessageTime: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0, isOnline: false },
//     { userId: 6, firstName: 'Kenza', lastName: 'Moussaoui', lastMessage: 'Tu as fini le TP 4 ?', lastMessageTime: new Date(Date.now() - 172800000).toISOString(), unreadCount: 0, isOnline: true },
//   ];

//   const mockReports = [
//     { id: '1', examId: '5', examTitle: 'Partiel Algo 2024 — Corrigé', reporterId: '3', reporterName: 'Youssef K.', reason: 'ERROR' as const, status: 'PENDING' as const, description: 'Le corrigé contient des erreurs sur l\'exercice 3.', createdAt: new Date(Date.now() - 86400000).toISOString() },
//     { id: '2', examId: '8', examTitle: 'TP BDD — Série 2', reporterId: '6', reporterName: 'Kenza M.', reason: 'DUPLICATE' as const, status: 'PENDING' as const, description: 'Ce document est un doublon.', createdAt: new Date(Date.now() - 172800000).toISOString() },
//     { id: '3', examId: '12', examTitle: 'Final Réseaux 2023', reporterId: '2', reporterName: 'Sarah A.', reason: 'PLAGIARISM' as const, status: 'REVIEWED' as const, description: 'Contenu copié depuis un autre site.', createdAt: new Date(Date.now() - 259200000).toISOString() },
//   ];

//   const mockAdminStats: AdminStats = {
//     totalUsers: 156, activeUsers: 142, totalStudents: 128, totalProfessors: 12,
//     totalCourses: 24, totalExams: 89, totalGroups: 18, pendingReports: 2,
//   };

//   const mockAnnouncements: Announcement[] = [
//     { id: 1, courseId: 1, courseTitle: 'Algorithmique avancée', title: 'Report du TP 3', content: 'Le TP 3 est reporté au lundi prochain suite à un problème de salle.', authorName: 'Pr. Chraibi', createdAt: new Date(Date.now() - 86400000).toISOString() },
//     { id: 2, courseId: 2, courseTitle: 'Programmation Web', title: 'Projet final — Sujet disponible', content: 'Le sujet du projet final est disponible dans les documents du cours. Date limite : 15 avril.', authorName: 'Pr. Chraibi', createdAt: new Date(Date.now() - 172800000).toISOString() },
//     { id: 3, courseId: 1, courseTitle: 'Algorithmique avancée', title: 'Résultats du CC', content: 'Les résultats du contrôle continu sont disponibles sur le portail.', authorName: 'Pr. Chraibi', createdAt: new Date(Date.now() - 604800000).toISOString() },
//   ];

//   const mockStudents: Student[] = [
//     { id: 2, firstName: 'Sarah', lastName: 'Alaoui', email: 'sarah@upf.ac.ma', filiere: 'Génie Informatique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2025-09-15' },
//     { id: 3, firstName: 'Youssef', lastName: 'Karimi', email: 'youssef@upf.ac.ma', filiere: 'Génie Informatique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2024-09-01' },
//     { id: 5, firstName: 'Omar', lastName: 'Fassi', email: 'omar@upf.ac.ma', filiere: 'Génie Informatique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2025-03-20' },
//     { id: 6, firstName: 'Kenza', lastName: 'Moussaoui', email: 'kenza@upf.ac.ma', filiere: 'Génie Informatique', annee: 2, role: 'STUDENT', isActive: true, createdAt: '2025-10-01' },
//     { id: 9, firstName: 'Lina', lastName: 'Tazi', email: 'lina@upf.ac.ma', filiere: 'Génie Informatique', annee: 3, role: 'STUDENT', isActive: true, createdAt: '2026-01-10' },
//   ];

//   let mockProfessors: Professor[] = [
//     { id: 'prof-1', firstName: 'Mohammed', lastName: 'Chraibi', email: 'chraibi@upf.ac.ma', department: 'Informatique', title: 'Dr.', courses: [mockCourses[0], mockCourses[1], mockCourses[3]] },
//     { id: 'prof-2', firstName: 'Fatima', lastName: 'Amrani', email: 'amrani@upf.ac.ma', department: 'Informatique', title: 'Dr.', courses: [mockCourses[2]] },
//     { id: 'prof-3', firstName: 'Ahmed', lastName: 'Fassi', email: 'fassi@upf.ac.ma', department: 'Génie Civil', title: 'Pr.', courses: [mockCourses[4]] },
//   ];

//   // ────────── AUTH ──────────

//   mock.onPost('/auth/login').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const { email } = body;

//     if (email?.toLowerCase().includes('superadmin')) {
//       mockUser = { ...mockUser, id: 99, role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin', email: email, bio: 'Super Administrateur de la plateforme UPF Social' };
//     } else if (email?.toLowerCase().includes('admin')) {
//       mockUser = { ...mockUser, id: 100, role: 'ADMIN', firstName: 'Admin', lastName: 'UPF', email: email, bio: 'Administrateur de la plateforme UPF Social' };
//     } else if (email?.toLowerCase().includes('prof')) {
//       mockUser = { ...mockUser, id: 101, role: 'PROFESSOR', firstName: 'Mohammed', lastName: 'Chraibi', bio: 'Enseignant-chercheur en informatique', email: email };
//     } else {
//       mockUser = { ...mockUser, id: 1, role: 'STUDENT', firstName: 'Amine', lastName: 'Benali', bio: 'Passionné par le développement web et les nouvelles technologies.', email: email || 'amine@upf.ac.ma', competences: ['React', 'TypeScript', 'Java', 'Spring Boot'] };
//     }

//     return [200, { accessToken: 'mock_jwt_token', refreshToken: 'mock_refresh_token', userId: String(mockUser.id), role: mockUser.role, email: mockUser.email, profileId: `profile-${mockUser.id}` }];
//   });

//   mock.onPost('/auth/register').reply(200, { accessToken: 'mock_jwt_token', refreshToken: 'mock_refresh_token', userId: '1', role: 'STUDENT', email: 'new@upf.ac.ma', profileId: 'profile-1' });
//   mock.onPost('/auth/refresh').reply(200, { accessToken: 'mock_jwt_token_refreshed', refreshToken: 'mock_refresh_token_new' });
//   mock.onPost('/auth/logout').reply(200);

//   mock.onGet('/users/me').reply(() => [200, mockUser]);
//   mock.onPut('/users/me').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     mockUser = { ...mockUser, ...body };
//     return [200, mockUser];
//   });
//   mock.onPost('/users/me/avatar').reply(() => {
//     mockUser = { ...mockUser, avatarUrl: 'https://i.pravatar.cc/150?u=amine' };
//     return [200, { avatarUrl: mockUser.avatarUrl }];
//   });

//   // ────────── USERS / NETWORK ──────────

//   mock.onGet('/users').reply((config) => {
//     const search = config.params?.search?.toLowerCase() || '';
//     const filtered = mockNetworkUsers.filter((u) =>
//       u.firstName.toLowerCase().includes(search) || u.lastName.toLowerCase().includes(search) || u.filiere.toLowerCase().includes(search)
//     );
//     return [200, { content: filtered, totalElements: filtered.length, totalPages: 1, number: 0, size: 10, first: true, last: true }];
//   });

//   mock.onPost(/\/users\/\d+\/follow/).reply((config) => {
//     const id = parseInt(config.url?.split('/')[2] || '0');
//     mockNetworkUsers = mockNetworkUsers.map((u) => (u.id === id ? { ...u, isFollowing: true, followersCount: u.followersCount + 1 } : u));
//     return [200];
//   });

//   mock.onDelete(/\/users\/\d+\/follow/).reply((config) => {
//     const id = parseInt(config.url?.split('/')[2] || '0');
//     mockNetworkUsers = mockNetworkUsers.map((u) => (u.id === id ? { ...u, isFollowing: false, followersCount: u.followersCount - 1 } : u));
//     return [200];
//   });

//   // ────────── COURSES ──────────

//   mock.onGet('/courses').reply(200, { content: mockCourses, totalElements: mockCourses.length, totalPages: 1, number: 0, size: 10, first: true, last: true });

//   mock.onGet(/\/courses\/\d+\/resources/).reply(200, [
//     { id: 1, courseId: 1, title: 'Cours magistral — Chapitre 1', type: 'PDF', url: '#', sizeBytes: 2048000, downloadCount: 34 },
//     { id: 2, courseId: 1, title: 'TD Série 1', type: 'PDF', url: '#', sizeBytes: 512000, downloadCount: 56 },
//     { id: 3, courseId: 1, title: 'TP — Implémentation BFS/DFS', type: 'PDF', url: '#', sizeBytes: 256000, downloadCount: 28 },
//   ]);

//   mock.onGet(/\/courses\/\d+/).reply((config) => {
//     const id = parseInt(config.url?.split('/').pop() || '1');
//     return [200, mockCourses.find((c) => c.id === id) || mockCourses[0]];
//   });

//   // ────────── EXAMS ──────────

//   mock.onGet('/exams').reply(200, { content: mockExams, totalElements: mockExams.length, totalPages: 1, number: 0, size: 10, first: true, last: true });

//   mock.onPost('/exams').reply(200, { ...mockExams[0], id: Date.now(), title: 'Nouvel examen uploadé', createdAt: new Date().toISOString() });

//   mock.onGet(/\/exams\/\d+/).reply((config) => {
//     const id = parseInt(config.url?.split('/').pop() || '1');
//     return [200, mockExams.find((e) => e.id === id) || mockExams[0]];
//   });

//   mock.onGet(/\/exams\/\d+\/download/).reply(200, new Blob(['Mock PDF content'], { type: 'application/pdf' }));
//   mock.onPost(/\/exams\/\d+\/vote/).reply(200);
//   mock.onPost(/\/exams\/\d+\/report/).reply(200, { id: Date.now(), status: 'PENDING' });

//   // ────────── GROUPS ──────────

//   mock.onGet('/groups').reply(200, mockGroups);

//   mock.onPost('/groups').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newGroup: Group = {
//       id: Date.now(), name: body.name || 'Nouveau Groupe', description: body.description || '',
//       visibility: body.visibility || 'PUBLIC', memberCount: 1,
//       createdBy: { id: mockUser.id, firstName: mockUser.firstName, lastName: mockUser.lastName },
//       createdAt: new Date().toISOString(),
//     };
//     mockGroups = [...mockGroups, newGroup];
//     return [200, newGroup];
//   });

//   mock.onGet(/\/groups\/\d+\/members/).reply(200, [
//     { id: 1, groupId: 1, user: { id: 1, firstName: 'Amine', lastName: 'Benali' }, role: 'ADMIN', status: 'ACTIVE', joinedAt: '2025-02-10' },
//     { id: 2, groupId: 1, user: { id: 2, firstName: 'Sarah', lastName: 'Alaoui' }, role: 'MEMBER', status: 'ACTIVE', joinedAt: '2025-02-12' },
//     { id: 3, groupId: 1, user: { id: 3, firstName: 'Youssef', lastName: 'Karimi' }, role: 'MEMBER', status: 'ACTIVE', joinedAt: '2025-02-14' },
//   ]);

//   mock.onPost(/\/groups\/\d+\/join/).reply(200);
//   mock.onPost(/\/groups\/\d+\/request/).reply(200);

//   mock.onGet(/\/groups\/\d+/).reply((config) => {
//     const id = parseInt(config.url?.split('/').pop() || '1');
//     return [200, mockGroups.find((g) => g.id === id) || mockGroups[0]];
//   });

//   // ────────── DM (Messages privés) ──────────

//   mock.onGet('/messages/conversations').reply(200, mockConversations);

//   mock.onGet(/\/messages\/direct\/\d+/).reply(() => {
//     const dmMsgs: DirectMessage[] = [
//       { id: 1, senderId: 2, receiverId: 1, senderName: 'Sarah Alaoui', content: 'Salut ! Tu as les notes du cours de ce matin ?', read: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
//       { id: 2, senderId: 1, receiverId: 2, senderName: 'Moi', content: 'Oui, je te les envoie tout de suite 📄', read: true, timestamp: new Date(Date.now() - 3000000).toISOString() },
//       { id: 3, senderId: 2, receiverId: 1, senderName: 'Sarah Alaoui', content: 'Merci beaucoup ! Tu gères 🙌', read: true, timestamp: new Date(Date.now() - 2400000).toISOString() },
//       { id: 4, senderId: 1, receiverId: 2, senderName: 'Moi', content: 'De rien ! On se retrouve à la biblio demain ?', read: true, timestamp: new Date(Date.now() - 1800000).toISOString() },
//       { id: 5, senderId: 2, receiverId: 1, senderName: 'Sarah Alaoui', content: 'Parfait, à 10h comme d\'habitude 👍', read: false, timestamp: new Date(Date.now() - 300000).toISOString() },
//     ];
//     return [200, { content: dmMsgs, totalElements: dmMsgs.length, totalPages: 1, number: 0, size: 30, first: true, last: true }];
//   });

//   mock.onPost(/\/messages\/direct\/\d+/).reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     return [200, {
//       id: Date.now(), senderId: mockUser.id, receiverId: 2,
//       senderName: `${mockUser.firstName} ${mockUser.lastName}`,
//       content: body.content, read: false, timestamp: new Date().toISOString(),
//     }];
//   });

//   mock.onGet('/messages').reply(200, { content: [], totalElements: 0, totalPages: 0, number: 0, size: 30, first: true, last: true });

//   // ────────── PROFESSOR ──────────

//   mock.onGet('/professor/courses').reply(200, mockCourses.filter((c) => c.professorName?.includes('Chraibi')));

//   mock.onGet(/\/professor\/courses\/\d+\/students/).reply(200, mockStudents);

//   mock.onPost(/\/professor\/courses\/\d+\/documents/).reply(200, {
//     id: Date.now(), courseId: 1, title: 'Nouveau document', type: 'PDF', url: '#', sizeBytes: 1024, downloadCount: 0,
//   });

//   mock.onDelete(/\/professor\/courses\/\d+\/documents\/\d+/).reply(200);

//   mock.onGet('/professor/announcements').reply(200, mockAnnouncements);

//   mock.onPost('/professor/announcements').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const course = mockCourses.find((c) => c.id === body.courseId);
//     const newAnnouncement: Announcement = {
//       id: Date.now(), courseId: body.courseId, courseTitle: course?.title || '',
//       title: body.title, content: body.content,
//       authorName: `Pr. ${mockUser.lastName}`, createdAt: new Date().toISOString(),
//     };
//     return [200, newAnnouncement];
//   });

//   // ────────── ADMIN ──────────

//   mock.onGet('/admin/stats').reply(200, mockAdminStats);

//   mock.onGet('/admin/users').reply(200, {
//     content: [
//       ...mockNetworkUsers.map((u) => ({ ...u })),
//       { id: 100, firstName: 'Admin', lastName: 'UPF', email: 'admin@upf.ac.ma', filiere: 'Administration', annee: 0, role: 'ADMIN' as const, isActive: true, createdAt: '2024-01-01' },
//     ],
//     totalElements: mockNetworkUsers.length + 1, totalPages: 1, number: 0, size: 20, first: true, last: true,
//   });

//   mock.onPut(/\/admin\/users\/\d+\/status/).reply(200);
//   mock.onPut(/\/admin\/users\/\d+\/role/).reply(200);

//   let mockAdmins: Student[] = [
//     { id: 99, firstName: 'Super', lastName: 'Admin', email: 'superadmin@upf.ac.ma', filiere: 'Administration', annee: 0, role: 'SUPER_ADMIN', isActive: true, createdAt: '2024-01-01' },
//     { id: 100, firstName: 'Admin', lastName: 'UPF', email: 'admin@upf.ac.ma', filiere: 'Administration', annee: 0, role: 'ADMIN', isActive: true, createdAt: '2024-01-01' },
//   ];

//   mock.onGet('/admin/admins').reply(() => [200, mockAdmins]);

//   mock.onPost('/admin/admins').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newAdmin: Student = {
//       id: Date.now(),
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       filiere: 'Administration',
//       annee: 0,
//       role: 'ADMIN',
//       isActive: true,
//       createdAt: new Date().toISOString(),
//     };
//     mockAdmins = [...mockAdmins, newAdmin];
//     return [200, newAdmin];
//   });

//   // Admin — Cours
//   mock.onPost('/admin/courses').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newCourse: Course = { id: Date.now(), ...body, isActive: true, createdAt: new Date().toISOString() };
//     mockCourses = [...mockCourses, newCourse];
//     return [200, newCourse];
//   });

//   mock.onPut(/\/admin\/courses\/\d+/).reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const id = parseInt(config.url?.match(/\/admin\/courses\/(\d+)/)?.[1] || '0');
//     mockCourses = mockCourses.map((c) => (c.id === id ? { ...c, ...body } : c));
//     return [200];
//   });

//   mock.onDelete(/\/admin\/courses\/\d+/).reply((config) => {
//     const id = parseInt(config.url?.match(/\/admin\/courses\/(\d+)/)?.[1] || '0');
//     mockCourses = mockCourses.filter((c) => c.id !== id);
//     return [200];
//   });

//   mock.onPost(/\/admin\/courses\/\d+\/resources/).reply(200, {
//     id: Date.now(), courseId: 1, title: 'Nouvelle ressource', type: 'PDF', url: '#', sizeBytes: 1024, downloadCount: 0,
//   });

//   mock.onDelete(/\/admin\/courses\/\d+\/resources\/\d+/).reply(200);

//   // Admin — Enrôlement étudiants
//   mock.onPost(/\/admin\/courses\/\d+\/enroll/).reply(200, {
//     id: Date.now(), status: 'ACTIVE', enrolledAt: new Date().toISOString(),
//   });

//   // Admin — Professeurs
//   mock.onGet('/admin/professors').reply(() => [200, mockProfessors]);

//   mock.onPost('/admin/professors').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newProf: Professor = {
//       id: `prof-${Date.now()}`,
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       department: body.department,
//       title: body.title,
//       courses: [],
//     };
//     mockProfessors = [...mockProfessors, newProf];
//     return [200, newProf];
//   });

//   // Admin — Affecter un cours à un professeur
//   mock.onPost(/\/admin\/courses\/\d+\/assign-professor/).reply((config) => {
//     const courseId = parseInt(config.url?.match(/\/admin\/courses\/(\d+)\//)?.[1] || '0');
//     const body = JSON.parse(config.data || '{}');
//     const course = mockCourses.find((c) => c.id === courseId);
//     if (course) {
//       const prof = mockProfessors.find((p) => p.id === body.professorId);
//       if (prof) {
//         prof.courses = [...(prof.courses || []), course];
//         mockCourses = mockCourses.map((c) => c.id === courseId ? { ...c, professorName: `${prof.title || ''} ${prof.lastName}`.trim() } : c);
//       }
//     }
//     return [200];
//   });

//   // Admin — Signalements
//   mock.onGet('/admin/reports').reply(200, mockReports);
//   mock.onPut(/\/admin\/reports\/\d+/).reply(200);
//   mock.onPut(/\/admin\/exams\/\d+\/visibility/).reply(200);

//   // ────────── Notifications ──────────

//   mock.onGet('/notifications').reply(200, []);

//   // ────────── Creation Endpoints (Groups & Exams) ──────────

//   mock.onPost('/groups').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newGroup = {
//       id: Date.now(),
//       name: body.name,
//       description: body.description,
//       visibility: body.visibility || 'PUBLIC',
//       memberCount: 1,
//       createdBy: { id: mockUser.id, firstName: mockUser.firstName, lastName: mockUser.lastName },
//       createdAt: new Date().toISOString()
//     };
//     return [200, newGroup];
//   });

//   mock.onPost('/exams').reply((config) => {
//     const body = JSON.parse(config.data || '{}');
//     const newExam = {
//       id: Date.now(),
//       title: body.title,
//       matiere: body.matiere,
//       anneeAcademique: body.anneeAcademique,
//       type: body.type,
//       description: body.description || '',
//       fileUrl: '#',
//       fileName: 'uploaded_document.pdf',
//       fileSizeBytes: 1024000,
//       downloadCount: 0,
//       upvotes: 0,
//       downvotes: 0,
//       uploadedBy: { id: mockUser.id, firstName: mockUser.firstName, lastName: mockUser.lastName },
//       createdAt: new Date().toISOString()
//     };
//     return [200, newExam];
//   });

//   // ────────── Fallback ──────────

//   mock.onAny().passThrough();

//   console.log(`✅ Mock API activé — Rôles de test :
//   📧 superadmin@upf.ac.ma (mot de passe : test) → SUPER_ADMIN
//   📧 admin@upf.ac.ma      (mot de passe : test) → ADMIN
//   📧 prof@upf.ac.ma       (mot de passe : test) → PROFESSOR
//   📧 *@upf.ac.ma          (mot de passe : test) → STUDENT`);
// };
