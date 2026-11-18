export type AnnouncementTarget = 'all' | 'group' | 'course'

export interface Announcement {
  id: number
  title: string
  content: string
  author: string
  authorAvatar: string | null
  target: AnnouncementTarget
  targetId: number | null
  targetName: string | null
  isPinned: boolean
  isRead?: boolean
  createdAt: string
  updatedAt: string
}

export type EventType = 'deadline' | 'live_session' | 'exam' | 'holiday' | 'other'

export interface Event {
  id: number
  title: string
  description: string | null
  type: EventType
  startDate: string
  endDate: string | null
  location: string | null
  meetingUrl: string | null
  courseId: number | null
  courseName: string | null
  isAllDay: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EventParticipant {
  id: number
  eventId: number
  userId: number
  userName: string
  userEmail: string
  status: 'accepted' | 'declined' | 'pending'
  joinedAt: string
}
