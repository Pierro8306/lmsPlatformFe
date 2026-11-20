import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getUserRole } from '@/lib/auth';
import type { Event, EventParticipant, EventType } from '@/types/announcement';
import type { EventFormValues } from '@/lib/validators';
import type { PaginatedResponse } from '@/types/api';

interface BackendEventResponse {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
}

interface BackendMemberResponse {
  userId: string;
  username: string;
  email: string;
}

function mapToEvent(e: BackendEventResponse): Event {
  const dateStr = e.date ? `${e.date}T09:00:00Z` : new Date().toISOString();

  return {
    id: e.id,
    title: e.title,
    description: e.description || '',
    type: 'live_session' as EventType,
    date: e.date,
    startDate: dateStr,
    endDate: dateStr,
    location: 'Virtual Online Session',
    meetingUrl: 'https://zoom.us',
    courseId: 1,
    courseName: 'Platform Event',
    isAllDay: false,
    createdBy: 'Administrator',
    createdAt: dateStr,
    updatedAt: dateStr,
  };
}

export async function getEvents(): Promise<PaginatedResponse<Event>> {
  const role = getUserRole();
  const url = role === 'admin'
    ? ENDPOINTS.EVENTS.LIST
    : ENDPOINTS.EVENTS.STUDENT_LIST;

  const { data } = await apiClient.get<BackendEventResponse[]>(url);
  const items = (Array.isArray(data) ? data : []).map(mapToEvent);

  return {
    results: items,
    count: items.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function createEvent(payload: EventFormValues): Promise<Event> {
  // Format to YYYY-MM-DD for LocalDate in Spring Boot
  const dateObj = payload.startDate ? new Date(payload.startDate) : new Date();
  const dateStr = dateObj.toISOString().split('T')[0];

  const { data } = await apiClient.post<BackendEventResponse>(ENDPOINTS.EVENTS.CREATE, {
    title: payload.title.trim(),
    description: payload.description?.trim() || '',
    date: dateStr,
  });

  return mapToEvent(data || { id: `event-${Date.now()}`, title: payload.title, description: payload.description || '', date: dateStr });
}

export async function updateEvent(
  id: string | number,
  payload: Partial<EventFormValues>
): Promise<Event> {
  const dateObj = payload.startDate ? new Date(payload.startDate) : new Date();
  const dateStr = dateObj.toISOString().split('T')[0];

  await apiClient.put(ENDPOINTS.EVENTS.UPDATE(id), {
    title: payload.title?.trim(),
    description: payload.description?.trim() || '',
    date: dateStr,
  });

  return {
    id,
    title: payload.title || '',
    description: payload.description || null,
    type: payload.type || 'live_session',
    date: dateStr,
    startDate: payload.startDate || new Date().toISOString(),
    endDate: payload.endDate || null,
    location: payload.location || null,
    meetingUrl: payload.meetingUrl || null,
    courseId: payload.courseId || null,
    courseName: null,
    isAllDay: payload.isAllDay ?? false,
    createdBy: 'Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteEvent(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.EVENTS.DELETE(id));
}

export async function getEventParticipants(eventId: string | number): Promise<EventParticipant[]> {
  try {
    const { data } = await apiClient.get<BackendMemberResponse[]>(
      ENDPOINTS.EVENTS.PARTICIPANTS(eventId)
    );

    return (Array.isArray(data) ? data : []).map((m, idx) => ({
      id: idx + 1,
      eventId,
      userId: m.userId,
      userName: m.username,
      username: m.username,
      userEmail: m.email,
      email: m.email,
      status: 'accepted',
      joinedAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function toggleEventAttendance(
  eventId: string | number,
  userId: string | number,
  userName: string,
  userEmail: string
): Promise<{ joined: boolean; count: number }> {
  try {
    // Attempt join
    await apiClient.post(ENDPOINTS.EVENTS.JOIN(eventId));
    return { joined: true, count: 1 };
  } catch (err: any) {
    // If already joined, leave
    try {
      await apiClient.delete(ENDPOINTS.EVENTS.LEAVE(eventId));
      return { joined: false, count: 0 };
    } catch {
      return { joined: false, count: 0 };
    }
  }
}

export const eventService = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  toggleEventAttendance,
};
