import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { UserProfile, UserGroup, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockUsers: UserProfile[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@eduflow.dev',
    firstName: 'Alice',
    lastName: 'Administrator',
    role: 'admin',
    group: null,
    avatar: null,
    bio: 'Platform Lead & Systems Administrator',
    isActive: true,
    lastLogin: '2024-11-17T08:00:00Z',
    enrolledCourses: 0,
    completedCourses: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-17T08:00:00Z',
  },
  {
    id: 2,
    username: 'student',
    email: 'student@eduflow.dev',
    firstName: 'Alex',
    lastName: 'Rivers',
    role: 'student',
    group: 'Group Alpha',
    avatar: null,
    bio: 'Full-Stack Student Track',
    isActive: true,
    lastLogin: '2024-11-17T12:30:00Z',
    enrolledCourses: 3,
    completedCourses: 1,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-11-17T12:30:00Z',
  },
  {
    id: 3,
    username: 'jvance',
    email: 'jvance@eduflow.dev',
    firstName: 'Jordan',
    lastName: 'Vance',
    role: 'student',
    group: 'Group Alpha',
    avatar: null,
    bio: 'Backend & Cloud architecture learner',
    isActive: true,
    lastLogin: '2024-11-16T14:30:00Z',
    enrolledCourses: 4,
    completedCourses: 2,
    createdAt: '2024-02-11T00:00:00Z',
    updatedAt: '2024-11-16T14:30:00Z',
  },
  {
    id: 4,
    username: 'mlee',
    email: 'mlee@eduflow.dev',
    firstName: 'Morgan',
    lastName: 'Lee',
    role: 'student',
    group: 'Group Beta',
    avatar: null,
    bio: 'Design systems enthusiast',
    isActive: true,
    lastLogin: '2024-11-15T16:00:00Z',
    enrolledCourses: 2,
    completedCourses: 0,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-11-15T16:00:00Z',
  },
  {
    id: 5,
    username: 'sjenkins',
    email: 'sjenkins@eduflow.dev',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    role: 'student',
    group: 'Group Beta',
    avatar: null,
    bio: 'Data Science candidate',
    isActive: false,
    lastLogin: '2024-10-01T10:00:00Z',
    enrolledCourses: 1,
    completedCourses: 0,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
  },
  {
    id: 6,
    username: 'mchen',
    email: 'mchen@eduflow.dev',
    firstName: 'Marcus',
    lastName: 'Chen',
    role: 'student',
    group: 'Group Gamma',
    avatar: null,
    bio: 'Algorithms and Distributed Systems',
    isActive: true,
    lastLogin: '2024-11-17T07:30:00Z',
    enrolledCourses: 5,
    completedCourses: 3,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-17T07:30:00Z',
  },
];

let mockGroups: UserGroup[] = [
  { id: 1, name: 'Group Alpha', description: 'Advanced Full-Stack Engineering Cohort', memberCount: 16, createdAt: '2024-01-15T00:00:00Z' },
  { id: 2, name: 'Group Beta', description: 'UI/UX & Frontend Specialization Cohort', memberCount: 14, createdAt: '2024-01-15T00:00:00Z' },
  { id: 3, name: 'Group Gamma', description: 'Cloud Infrastructure & DevOps Cohort', memberCount: 12, createdAt: '2024-01-15T00:00:00Z' },
];

export async function getUsers(): Promise<PaginatedResponse<UserProfile>> {
  if (HAS_API) {
    const { data } = await apiClient.get<PaginatedResponse<UserProfile>>(ENDPOINTS.USERS.LIST);
    return data;
  }
  await sleep(400);
  return {
    results: [...mockUsers],
    count: mockUsers.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function getUserById(id: number): Promise<UserProfile> {
  if (HAS_API) {
    const { data } = await apiClient.get<UserProfile>(ENDPOINTS.USERS.DETAIL(id));
    return data;
  }
  await sleep(350);
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function createUser(payload: CreateUserRequest): Promise<UserProfile> {
  if (HAS_API) {
    const { data } = await apiClient.post<UserProfile>(ENDPOINTS.USERS.CREATE, payload);
    return data;
  }
  await sleep(500);
  const newUser: UserProfile = {
    id: Date.now(),
    username: payload.username,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    group: payload.group ?? null,
    avatar: null,
    bio: null,
    isActive: true,
    lastLogin: null,
    enrolledCourses: 0,
    completedCourses: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUsers.unshift(newUser);
  return newUser;
}

export async function updateUser(id: number, payload: UpdateUserRequest): Promise<UserProfile> {
  if (HAS_API) {
    const { data } = await apiClient.patch<UserProfile>(ENDPOINTS.USERS.UPDATE(id), payload);
    return data;
  }
  await sleep(400);
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  const updated: UserProfile = {
    ...mockUsers[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockUsers[idx] = updated;
  return updated;
}

export async function deleteUser(id: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.USERS.DELETE(id));
    return;
  }
  await sleep(400);
  mockUsers = mockUsers.filter((u) => u.id !== id);
}

export async function getGroups(): Promise<UserGroup[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<UserGroup[]>(ENDPOINTS.USERS.GROUPS);
    return data;
  }
  await sleep(300);
  return mockGroups;
}

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getGroups,
};
