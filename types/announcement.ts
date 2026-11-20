export type AnnouncementTarget = 'all' | 'group' | 'course';

export interface Announcement {
  id: string | number;
  title: string;
  content: string;
  description?: string;
  author: string;
  authorAvatar?: string | null;
  target: AnnouncementTarget;
  targetId?: number | null;
  targetName?: string | null;
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type EventType = 'deadline' | 'live_session' | 'exam' | 'holiday' | 'other';

export interface Event {
  id: string | number;
  title: string;
  description: string | null;
  type: EventType;
  date?: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  courseId?: number | null;
  courseName?: string | null;
  isAllDay?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventParticipant {
  id?: string | number;
  eventId?: string | number;
  userId: string | number;
  userName: string;
  username?: string;
  userEmail?: string;
  email?: string;
  status?: 'accepted' | 'declined' | 'pending';
  joinedAt: string;
}
