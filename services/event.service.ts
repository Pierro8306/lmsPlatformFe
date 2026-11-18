import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { Event, EventParticipant } from '@/types/announcement';
import type { EventFormValues } from '@/lib/validators';
import type { PaginatedResponse } from '@/types/api';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockEvents: Event[] = [
  {
    id: 1,
    title: 'Advanced Next.js 14 Workshop: Server Actions & Cache',
    description:
      'Deep dive into React Server Components, server actions, optimistic UI, and advanced cache invalidation strategies.',
    type: 'live_session',
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    location: 'Virtual Classroom (Zoom)',
    meetingUrl: 'https://zoom.us/j/eduflow-workshop-1',
    courseId: 1,
    courseName: 'Full-Stack Web Development',
    isAllDay: false,
    createdBy: 'Alice Admin',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Project 1 Submission Deadline: E-Commerce Store',
    description:
      'Final deadline to submit repository URL and deployed preview for the full-stack project.',
    type: 'deadline',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: null,
    location: null,
    meetingUrl: null,
    courseId: 1,
    courseName: 'Full-Stack Web Development',
    isAllDay: true,
    createdBy: 'Alice Admin',
    createdAt: '2024-11-05T00:00:00Z',
    updatedAt: '2024-11-05T00:00:00Z',
  },
  {
    id: 3,
    title: 'Interactive AI & Data Science Quiz Window',
    description:
      'Timed quiz assessment covering NumPy, pandas, and linear regression principles.',
    type: 'exam',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 4).toISOString(),
    location: 'Online Exam Portal',
    meetingUrl: null,
    courseId: 2,
    courseName: 'Python for Data Science',
    isAllDay: false,
    createdBy: 'Alice Admin',
    createdAt: '2024-11-08T00:00:00Z',
    updatedAt: '2024-11-08T00:00:00Z',
  },
];

let mockParticipants: Record<number, EventParticipant[]> = {
  1: [
    {
      id: 101,
      eventId: 1,
      userId: 2,
      userName: 'Alex Rivers',
      userEmail: 'student@eduflow.dev',
      status: 'accepted',
      joinedAt: '2024-11-12T10:00:00Z',
    },
    {
      id: 102,
      eventId: 1,
      userId: 3,
      userName: 'Morgan Lee',
      userEmail: 'morgan@eduflow.dev',
      status: 'accepted',
      joinedAt: '2024-11-13T12:00:00Z',
    },
  ],
  2: [
    {
      id: 103,
      eventId: 2,
      userId: 2,
      userName: 'Alex Rivers',
      userEmail: 'student@eduflow.dev',
      status: 'accepted',
      joinedAt: '2024-11-11T09:30:00Z',
    },
  ],
  3: [],
};

export async function getEvents(): Promise<PaginatedResponse<Event>> {
  if (HAS_API) {
    const { data } = await apiClient.get<PaginatedResponse<Event>>(ENDPOINTS.EVENTS.LIST);
    return data;
  }
  await sleep(400);
  return {
    results: [...mockEvents],
    count: mockEvents.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function createEvent(payload: EventFormValues): Promise<Event> {
  if (HAS_API) {
    const { data } = await apiClient.post<Event>(ENDPOINTS.EVENTS.CREATE, payload);
    return data;
  }
  await sleep(500);
  const newEvent: Event = {
    id: Date.now(),
    title: payload.title,
    description: payload.description ?? null,
    type: payload.type,
    startDate: payload.startDate,
    endDate: payload.endDate ?? null,
    location: payload.location ?? null,
    meetingUrl: payload.meetingUrl ?? null,
    courseId: payload.courseId ?? null,
    courseName: payload.courseId ? `Course ${payload.courseId}` : null,
    isAllDay: payload.isAllDay ?? false,
    createdBy: 'Alice Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEvents.unshift(newEvent);
  mockParticipants[newEvent.id] = [];
  return newEvent;
}

export async function updateEvent(id: number, payload: Partial<EventFormValues>): Promise<Event> {
  if (HAS_API) {
    const { data } = await apiClient.put<Event>(ENDPOINTS.EVENTS.DETAIL(id), payload);
    return data;
  }
  await sleep(400);
  const idx = mockEvents.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Event not found');
  const updated: Event = {
    ...mockEvents[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockEvents[idx] = updated;
  return updated;
}

export async function deleteEvent(id: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.EVENTS.DETAIL(id));
    return;
  }
  await sleep(400);
  mockEvents = mockEvents.filter((e) => e.id !== id);
  delete mockParticipants[id];
}

export async function getEventParticipants(eventId: number): Promise<EventParticipant[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<EventParticipant[]>(ENDPOINTS.EVENTS.PARTICIPANTS(eventId));
    return data;
  }
  await sleep(300);
  return mockParticipants[eventId] || [];
}

export async function toggleEventAttendance(
  eventId: number,
  userId: number,
  userName: string,
  userEmail: string
): Promise<{ joined: boolean; count: number }> {
  if (HAS_API) {
    const { data } = await apiClient.post<{ joined: boolean; count: number }>(
      `${ENDPOINTS.EVENTS.DETAIL(eventId)}toggle-attendance/`
    );
    return data;
  }
  await sleep(300);
  const list = mockParticipants[eventId] || [];
  const existingIndex = list.findIndex((p) => p.userId === userId);

  if (existingIndex >= 0) {
    list.splice(existingIndex, 1);
    mockParticipants[eventId] = list;
    return { joined: false, count: list.length };
  } else {
    list.push({
      id: Date.now(),
      eventId,
      userId,
      userName,
      userEmail,
      status: 'accepted',
      joinedAt: new Date().toISOString(),
    });
    mockParticipants[eventId] = list;
    return { joined: true, count: list.length };
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
