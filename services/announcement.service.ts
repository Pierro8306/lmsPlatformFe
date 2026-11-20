import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getUserRole } from '@/lib/auth';
import type { Announcement } from '@/types/announcement';
import type { AnnouncementFormValues } from '@/lib/validators';
import type { PaginatedResponse } from '@/types/api';

interface BackendNotificationResponse {
  id: string;
  title: string;
  description: string;
}

function mapToAnnouncement(n: BackendNotificationResponse, idx: number = 0): Announcement {
  return {
    id: n.id,
    title: n.title,
    content: n.description || '',
    description: n.description || '',
    author: 'Administrator',
    authorAvatar: null,
    target: 'all',
    targetId: null,
    targetName: 'All Students & Staff',
    isPinned: idx === 0,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAnnouncements(): Promise<PaginatedResponse<Announcement>> {
  const role = getUserRole();
  const url = role === 'admin'
    ? ENDPOINTS.ANNOUNCEMENTS.LIST
    : ENDPOINTS.ANNOUNCEMENTS.STUDENT_LIST;

  const { data } = await apiClient.get<BackendNotificationResponse[]>(url);
  const items = (Array.isArray(data) ? data : []).map((n, idx) => mapToAnnouncement(n, idx));

  return {
    results: items,
    count: items.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function createAnnouncement(payload: AnnouncementFormValues): Promise<Announcement> {
  const { data } = await apiClient.post<BackendNotificationResponse>(
    ENDPOINTS.ANNOUNCEMENTS.CREATE,
    {
      title: payload.title.trim(),
      description: payload.content?.trim() || '',
    }
  );

  return mapToAnnouncement(data || { id: `notif-${Date.now()}`, title: payload.title, description: payload.content });
}

export async function updateAnnouncement(
  id: string | number,
  payload: Partial<AnnouncementFormValues>
): Promise<Announcement> {
  await apiClient.put(ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), {
    title: payload.title?.trim(),
    description: payload.content?.trim() || '',
  });

  return {
    id,
    title: payload.title || '',
    content: payload.content || '',
    description: payload.content || '',
    author: 'Administrator',
    authorAvatar: null,
    target: 'all',
    targetId: null,
    targetName: 'All Users',
    isPinned: false,
    isRead: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteAnnouncement(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.ANNOUNCEMENTS.DELETE(id));
}

export const announcementService = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
