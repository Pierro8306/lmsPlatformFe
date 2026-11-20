import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { UserProfile, UserGroup, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';
import type { UserRole } from '@/types/auth';

interface BackendUserDto {
  id: string;
  role: string;
  userGroup: string | null;
  username: string;
  email: string;
}

interface BackendGroupDto {
  id: string;
  name: string;
}

function mapBackendUserToProfile(u: BackendUserDto): UserProfile {
  const roleLower = (u.role || '').toLowerCase();
  const role: UserRole = roleLower.includes('admin') ? 'admin' : 'student';

  return {
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.username,
    lastName: '',
    role,
    group: u.userGroup || null,
    avatar: null,
    bio: null,
    isActive: true,
    lastLogin: null,
    enrolledCourses: 0,
    completedCourses: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getUsers(roleFilter?: string): Promise<PaginatedResponse<UserProfile>> {
  const url = roleFilter
    ? ENDPOINTS.USERS.BY_ROLE(roleFilter.toUpperCase())
    : ENDPOINTS.USERS.LIST;

  const { data } = await apiClient.get<BackendUserDto[]>(url);
  const profiles = (Array.isArray(data) ? data : []).map(mapBackendUserToProfile);

  return {
    results: profiles,
    count: profiles.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function getUserById(id: string | number): Promise<UserProfile> {
  const all = await getUsers();
  const found = all.results.find((u) => String(u.id) === String(id));
  if (!found) {
    throw new Error('User not found');
  }
  return found;
}

export async function createUser(payload: CreateUserRequest): Promise<UserProfile> {
  const roleUpper = (payload.role || 'student').toUpperCase();
  const groupName = payload.group || payload.userGroup || null;

  await apiClient.post(ENDPOINTS.USERS.CREATE, {
    username: payload.username.trim(),
    email: payload.email.trim(),
    password: payload.password,
    role: roleUpper,
    userGroup: groupName || undefined,
  });

  return {
    id: payload.username,
    username: payload.username,
    email: payload.email,
    firstName: payload.firstName || payload.username,
    lastName: payload.lastName || '',
    role: (roleUpper.includes('ADMIN') ? 'admin' : 'student') as UserRole,
    group: groupName,
    avatar: null,
    bio: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateUser(
  id: string | number,
  payload: UpdateUserRequest
): Promise<UserProfile> {
  const existing = await getUserById(id);
  const roleUpper = (payload.role ? String(payload.role) : existing.role).toUpperCase();
  const groupName = payload.group !== undefined ? payload.group : payload.userGroup !== undefined ? payload.userGroup : existing.group;

  await apiClient.put(ENDPOINTS.USERS.UPDATE, {
    id: String(id),
    username: (payload.username || existing.username).trim(),
    email: (payload.email || existing.email).trim(),
    role: roleUpper,
    userGroup: groupName || undefined,
  });

  return {
    ...existing,
    ...payload,
    id,
    role: (roleUpper.includes('ADMIN') ? 'admin' : 'student') as UserRole,
    group: groupName ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteUser(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.USERS.DELETE(id));
}

export async function getGroups(): Promise<UserGroup[]> {
  const { data } = await apiClient.get<BackendGroupDto[]>(ENDPOINTS.USERS.GROUPS);
  return (Array.isArray(data) ? data : []).map((g) => ({
    id: g.id,
    name: g.name,
    description: null,
    memberCount: 0,
    createdAt: new Date().toISOString(),
  }));
}

export async function createGroup(name: string): Promise<UserGroup> {
  const { data } = await apiClient.post<BackendGroupDto>(ENDPOINTS.USERS.GROUPS, { name });
  return {
    id: data.id,
    name: data.name,
    memberCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function renameGroup(groupId: string | number, name: string): Promise<UserGroup> {
  const { data } = await apiClient.put<BackendGroupDto>(ENDPOINTS.USERS.GROUP_DETAIL(groupId), { name });
  return {
    id: data.id,
    name: data.name,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteGroup(groupId: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.USERS.GROUP_DETAIL(groupId));
}

export async function setGroupMembers(groupId: string | number, userIds: string[]): Promise<void> {
  await apiClient.put(ENDPOINTS.USERS.GROUP_MEMBERS(groupId), { userIds });
}

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getGroups,
  createGroup,
  renameGroup,
  deleteGroup,
  setGroupMembers,
};
