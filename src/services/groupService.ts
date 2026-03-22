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

/** Liste de tous les groupes */
export const getGroups = async (): Promise<Group[]> => {
  const { data } = await api.get<Group[]>('/groups');
  return data;
};

/** Détail d'un groupe */
export const getGroupById = async (id: number): Promise<Group> => {
  const { data } = await api.get<Group>(`/groups/${id}`);
  return data;
};

/** Créer un nouveau groupe */
export const createGroup = async (
  payload: Pick<Group, 'name' | 'description' | 'visibility'> & { coverImage?: File }
): Promise<Group> => {
  const formData = new FormData();
  formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);
  formData.append('visibility', payload.visibility);
  if (payload.coverImage) formData.append('coverImage', payload.coverImage);

  const { data } = await api.post<Group>('/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

/** Rejoindre un groupe public */
export const joinGroup = async (id: number): Promise<void> => {
  await api.post(`/groups/${id}/join`);
};

/** Demander à rejoindre un groupe privé */
export const requestJoinGroup = async (id: number): Promise<void> => {
  await api.post(`/groups/${id}/request`);
};

/** Liste des membres d'un groupe */
export const getGroupMembers = async (groupId: number): Promise<GroupMembership[]> => {
  const { data } = await api.get<GroupMembership[]>(`/groups/${groupId}/members`);
  return data;
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
export const removeMember = async (groupId: number, userId: number): Promise<void> => {
  await api.delete(`/groups/${groupId}/members/${userId}`);
};
