import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { Announcement } from '@/types/announcement';
import type { AnnouncementFormValues } from '@/lib/validators';
import type { PaginatedResponse } from '@/types/api';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Midterm Examination Schedule Released',
    content:
      'The comprehensive midterm examination schedule for all registered tracks is now available. Please review your respective course schedules and ensure your environment meets the online testing requirements.',
    author: 'Academic Affairs',
    authorAvatar: null,
    target: 'all',
    targetId: null,
    targetName: 'All Students & Staff',
    isPinned: true,
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: 2,
    title: 'Guest Lecture: Modern Microfrontends with Next.js',
    content:
      'Join us this Thursday at 3:00 PM for an exclusive session with Senior Staff Engineers discussing enterprise microfrontend architectures and performance optimization techniques.',
    author: 'Prof. Alice Admin',
    authorAvatar: null,
    target: 'course',
    targetId: 1,
    targetName: 'Full-Stack Web Development',
    isPinned: true,
    createdAt: '2024-11-12T14:30:00Z',
    updatedAt: '2024-11-12T14:30:00Z',
  },
  {
    id: 3,
    title: 'System Maintenance Window (Scheduled)',
    content:
      'EduFlow LMS will undergo planned database optimization this Saturday from 02:00 AM to 04:00 AM UTC. Active quiz sessions will be temporarily paused.',
    author: 'Platform Ops',
    authorAvatar: null,
    target: 'all',
    targetId: null,
    targetName: 'All Students',
    isPinned: false,
    createdAt: '2024-11-14T11:00:00Z',
    updatedAt: '2024-11-14T11:00:00Z',
  },
];

export async function getAnnouncements(): Promise<PaginatedResponse<Announcement>> {
  if (HAS_API) {
    const { data } = await apiClient.get<PaginatedResponse<Announcement>>(ENDPOINTS.ANNOUNCEMENTS.LIST);
    return data;
  }
  await sleep(400);
  return {
    results: [...mockAnnouncements],
    count: mockAnnouncements.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function createAnnouncement(payload: AnnouncementFormValues): Promise<Announcement> {
  if (HAS_API) {
    const { data } = await apiClient.post<Announcement>(ENDPOINTS.ANNOUNCEMENTS.CREATE, payload);
    return data;
  }
  await sleep(500);
  const newAnnouncement: Announcement = {
    id: Date.now(),
    title: payload.title,
    content: payload.content,
    author: 'Administrator',
    authorAvatar: null,
    target: payload.target,
    targetId: payload.targetId ?? null,
    targetName: payload.target === 'all' ? 'All Users' : `Target ${payload.targetId}`,
    isPinned: payload.isPinned ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAnnouncements.unshift(newAnnouncement);
  return newAnnouncement;
}

export async function updateAnnouncement(
  id: number,
  payload: Partial<AnnouncementFormValues>
): Promise<Announcement> {
  if (HAS_API) {
    const { data } = await apiClient.put<Announcement>(ENDPOINTS.ANNOUNCEMENTS.DETAIL(id), payload);
    return data;
  }
  await sleep(400);
  const index = mockAnnouncements.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Announcement not found');
  const updated: Announcement = {
    ...mockAnnouncements[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockAnnouncements[index] = updated;
  return updated;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.ANNOUNCEMENTS.DETAIL(id));
    return;
  }
  await sleep(400);
  mockAnnouncements = mockAnnouncements.filter((a) => a.id !== id);
}

export const announcementService = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
