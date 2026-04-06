/**
 * Service des groupes
 *
 * Endpoints :
 *   GET    /groups             — liste des groupes
 *   GET    /groups/:id         — détail d'un groupe
 *   POST   /groups             — créer un groupe
 *   POST   /groups/:id/join    — rejoindre un groupe public
 *   POST   /groups/:id/request — demander à rejoindre un groupe privé
 *   GET    /groups/:id/members — liste des membres
 *   PUT    /groups/:id/members/:userId — modifier le rôle d'un membre
 *   DELETE /groups/:id/members/:userId — retirer un membre
 */
import api from './api';
import type { Group, GroupMembership, MemberRole } from '../types';

/** Liste de tous les groupes publics */
export const getGroups = async (): Promise<Group[]> => {
  const { data } = await api.get<any>('/groups/public');
  return Array.isArray(data) ? data : (data?.content || []);
};

/** Liste des groupes de l'utilisateur */
export const getMyGroups = async (): Promise<Group[]> => {
  const { data } = await api.get<any>('/groups/me');
  return Array.isArray(data) ? data : (data?.content || []);
};
// Tous les id sont des types UUID donc string 
/** Détail d'un groupe */
export const getGroupById = async (id: string): Promise<Group> => {
  const { data } = await api.get<Group>(`/groups/${id}`);
  return data;
};

/** Créer un nouveau groupe */
export const createGroup = async (
  payload: { name: string; description: string; type: string; major: string }
): Promise<Group> => {
  const { data } = await api.post<Group>('/groups', {
    name: payload.name,
    description: payload.description || '',
    type: payload.type,
    major: payload.major || '',
    coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c'
  });
  return data;
};

/** Rejoindre un groupe public */
export const joinGroup = async (id: string): Promise<void> => {
  await api.post(`/groups/${id}/join`);
};

/** Demander à rejoindre un groupe privé */
export const requestJoinGroup = async (id: string): Promise<void> => {
  await api.post(`/groups/${id}/request-join`);
};

/** Liste des membres d'un groupe */
export const getGroupMembers = async (groupId: string): Promise<GroupMembership[]> => {
  const { data } = await api.get<any>(`/groups/${groupId}/members`);
  return Array.isArray(data) ? data : (data?.content || []);
};

/** Modifier le rôle d'un membre */
export const updateMemberRole = async (
  groupId: number,
  userId: number,
  role: MemberRole
): Promise<void> => {
  await api.put(`/groups/${groupId}/members/${userId}`, { role });
};

/** Retirer un membre d'un groupe */
export const removeMember = async (groupId: string, userId: string): Promise<void> => {
  await api.delete(`/groups/${groupId}/members/${userId}`);
};
