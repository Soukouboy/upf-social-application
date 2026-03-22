/**
 * Fausse API (Mock)
 *
 * Intercepte les requêtes Axios vers le backend manquant et renvoie de fausses données.
 * Idéal pour développer et tester le front-end de manière autonome.
 */
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';
import type { Student, StudentNetwork, Course, Exam, Group } from '../types';

export const startMockApi = () => {
  // Configurer le mock avec un léger délai pour simuler le réseau (500ms)
  const mock = new MockAdapter(api, { delayResponse: 500 });

  // ────────── Données factices (Db) ──────────

  const mockUser: Student = {
    id: 1,
    firstName: 'Amine',
    lastName: 'Benali',
    email: 'amine.benali@upf.ac.ma',
    filiere: 'Génie Informatique',
    annee: 3,
    bio: 'Passionné par le web et les nouvelles technologies.',
    createdAt: new Date().toISOString()
  };

  // Nouveaux étudiants pour la fonctionnalité Réseau
  let mockNetworkUsers: StudentNetwork[] = [
    { ...mockUser, id: 2, firstName: 'Sarah', lastName: 'Alaoui', filiere: 'Génie Électrique', isFollowing: false, followersCount: 120, followingCount: 45 },
    { ...mockUser, id: 3, firstName: 'Youssef', lastName: 'Karimi', filiere: 'Génie Civil', isFollowing: true, followersCount: 89, followingCount: 12 },
    { ...mockUser, id: 4, firstName: 'Lina', lastName: 'Tazi', filiere: 'Architecture', isFollowing: false, followersCount: 304, followingCount: 150 },
    { ...mockUser, id: 5, firstName: 'Omar', lastName: 'Fassi', filiere: 'Management', isFollowing: false, followersCount: 45, followingCount: 80 },
    { ...mockUser, id: 6, firstName: 'Kenza', lastName: 'Moussaoui', filiere: 'Génie Informatique', isFollowing: true, followersCount: 210, followingCount: 198 },
    { ...mockUser, id: 7, firstName: 'Mehdi', lastName: 'Bennani', filiere: 'Génie Mécanique', isFollowing: false, followersCount: 15, followingCount: 20 },
  ];

  const mockCourses: Course[] = [
    {
      id: 1,
      title: 'Mathématiques de l\'ingénieur',
      description: 'Analyse numérique et algèbre avancée.',
      filiere: 'Génie Informatique',
      annee: 3,
      semestre: 5,
      professorName: 'Dr. Idrissi',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Programmation Web (React & Spring Boot)',
      description: 'Création d\'applications web full-stack.',
      filiere: 'Génie Informatique',
      annee: 3,
      semestre: 5,
      professorName: 'Dr. Chraibi',
      createdAt: new Date().toISOString()
    }
  ];

  const mockExams: Exam[] = [
    {
      id: 1,
      title: 'Partiel Algorithmique 2024',
      matiere: 'Algorithmique',
      anneeAcademique: '2023-2024',
      type: 'PARTIEL',
      fileUrl: '#',
      fileName: 'partiel_algo_2024.pdf',
      fileSizeBytes: 1024000,
      downloadCount: 45,
      upvotes: 12,
      downvotes: 0,
      uploadedBy: { id: 2, firstName: 'Sarah', lastName: 'Alaoui' },
      createdAt: new Date().toISOString()
    }
  ];

  const mockGroups: Group[] = [
    {
      id: 1,
      name: 'Entraide Génie Info (3ème année)',
      description: 'Groupe de révision pour nos examens de S5.',
      visibility: 'PUBLIC',
      memberCount: 24,
      createdBy: { id: 1, firstName: 'Amine', lastName: 'Benali' },
      createdAt: new Date().toISOString()
    }
  ];

  // ────────── Mocks des Routes (Interception) ──────────

  // AUTH & ME
  mock.onPost('/auth/login').reply(200, {
    accessToken: 'mock_jwt_access_token_123',
    refreshToken: 'mock_jwt_refresh_token_456'
  });

  mock.onPost('/auth/register').reply(200, {
    accessToken: 'mock_jwt_access_token_123',
    refreshToken: 'mock_jwt_refresh_token_456'
  });

  mock.onGet('/users/me').reply(200, mockUser);

  // USERS NETWORK
  mock.onGet('/users').reply((config) => {
    const search = config.params?.search?.toLowerCase() || '';
    const filtered = mockNetworkUsers.filter(u => 
      u.firstName.toLowerCase().includes(search) || 
      u.lastName.toLowerCase().includes(search) ||
      u.filiere.toLowerCase().includes(search)
    );
    return [200, {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      page: 0,
      size: 10,
      hasNext: false
    }];
  });

  mock.onPost(/\/users\/\d+\/follow/).reply((config) => {
    const id = parseInt(config.url?.split('/')[2] || '0');
    mockNetworkUsers = mockNetworkUsers.map(u => 
      u.id === id ? { ...u, isFollowing: true, followersCount: u.followersCount + 1 } : u
    );
    return [200];
  });

  mock.onDelete(/\/users\/\d+\/follow/).reply((config) => {
    const id = parseInt(config.url?.split('/')[2] || '0');
    mockNetworkUsers = mockNetworkUsers.map(u => 
      u.id === id ? { ...u, isFollowing: false, followersCount: u.followersCount - 1 } : u
    );
    return [200];
  });

  // COURSES
  mock.onGet('/courses').reply(200, {
    content: mockCourses,
    totalElements: mockCourses.length,
    totalPages: 1,
    page: 0,
    size: 10,
    hasNext: false
  });

  mock.onGet(/\/courses\/\d+/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '1');
    const course = mockCourses.find(c => c.id === id) || mockCourses[0];
    return [200, course];
  });

  // EXAMS
  mock.onGet('/exams').reply(200, {
    content: mockExams,
    totalElements: mockExams.length,
    totalPages: 1,
    page: 0,
    size: 10,
    hasNext: false
  });

  mock.onGet(/\/exams\/\d+/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '1');
    const exam = mockExams.find(e => e.id === id) || mockExams[0];
    return [200, exam];
  });

  // GROUPS
  mock.onGet('/groups').reply(200, mockGroups); // Attendu sous la forme Group[] par le service

  mock.onGet(/\/groups\/\d+/).reply((config) => {
    const id = parseInt(config.url?.split('/').pop() || '1');
    const group = mockGroups.find(g => g.id === id) || mockGroups[0];
    return [200, group];
  });

  // Fallback (Passe toutes les autres requêtes)
  mock.onAny().passThrough();

  console.log('✅ Mock API (Network update) activé avec succès !');
};
