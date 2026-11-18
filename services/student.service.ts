import apiClient from '@/lib/api/axios';
import { sleep } from '@/lib/utils';
import type { Course } from '@/types/course';
import type { Project } from '@/types/project';
import type { Quiz } from '@/types/quiz';
import type { Announcement, Event } from '@/types/announcement';
import { getCourses } from './course.service';
import { getAllProjects } from './project.service';
import { getAllQuizzes } from './quiz.service';
import { getAnnouncements } from './announcement.service';
import { getEvents } from './event.service';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

export interface StudentDashboardDeadline {
  id: string | number;
  title: string;
  type: string;
  dueDate: string;
}

export interface StudentDashboardNextLesson {
  courseId: string;
  lessonId: string;
  courseTitle: string;
  lessonTitle: string;
  progress: number;
}

export interface StudentDashboardData {
  coursesInProgress: number;
  coursesCompleted: number;
  totalCourses: number;
  upcomingQuizzesCount: number;
  unreadAnnouncements: number;
  nextLesson?: StudentDashboardNextLesson;
  upcomingDeadlines: StudentDashboardDeadline[];
  enrolledCourses: (Course & { progress: number; lastLessonId?: number; lastLessonTitle?: string })[];
  upcomingQuizzes: Quiz[];
  pendingProjects: Project[];
  recentEvents: Event[];
}

export async function getDashboard(): Promise<StudentDashboardData> {
  if (HAS_API) {
    const { data } = await apiClient.get<StudentDashboardData>('/student/dashboard/');
    return data;
  }
  await sleep(400);

  const coursesRes = await getCourses();
  const quizzesRes = await getAllQuizzes();
  const projectsRes = await getAllProjects();
  const eventsRes = await getEvents();

  return {
    coursesInProgress: 2,
    coursesCompleted: 1,
    totalCourses: 3,
    upcomingQuizzesCount: 2,
    unreadAnnouncements: 2,
    nextLesson: {
      courseId: '1',
      lessonId: '2',
      courseTitle: 'Full-Stack Web Development with React 18',
      lessonTitle: 'Component Lifecycle & Advanced Hooks (useMemo, useCallback)',
      progress: 60,
    },
    upcomingDeadlines: [
      {
        id: 1,
        title: 'Project 1: SaaS Portfolio Repository Submission',
        type: 'Project Assignment',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: 2,
        title: 'React Architecture Online Assessment',
        type: 'Timed Quiz',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      },
    ],
    enrolledCourses: coursesRes.results.slice(0, 3).map((c, i) => ({
      ...c,
      progress: i === 0 ? 60 : i === 1 ? 35 : 100,
      lastLessonId: i === 0 ? 2 : 1,
      lastLessonTitle:
        i === 0
          ? 'Component Lifecycle & Advanced Hooks'
          : 'DataFrames & Series Manipulation',
    })),
    upcomingQuizzes: quizzesRes.filter((q) => q.status !== 'closed'),
    pendingProjects: projectsRes.slice(0, 2),
    recentEvents: eventsRes.results.slice(0, 3),
  };
}

export async function getMyCourses(params?: {
  filter?: 'all' | 'in_progress' | 'completed';
  search?: string;
}): Promise<any[]> {
  if (HAS_API) {
    const { data } = await apiClient.get('/student/courses/', { params });
    return data;
  }
  await sleep(400);
  const coursesRes = await getCourses();
  let list = coursesRes.results.map((c, i) => ({
    id: c.id.toString(),
    title: c.title,
    description: c.description,
    instructor: c.instructor,
    lessonCount: c.lessonCount,
    progress: i === 0 ? 60 : i === 1 ? 35 : 100,
  }));

  if (params?.search) {
    const s = params.search.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(s));
  }

  if (params?.filter === 'in_progress') {
    list = list.filter((c) => c.progress > 0 && c.progress < 100);
  } else if (params?.filter === 'completed') {
    list = list.filter((c) => c.progress >= 100);
  }

  return list;
}

export async function getStudentAnnouncements(params?: { limit?: number }): Promise<Announcement[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Announcement[]>('/student/announcements/', { params });
    return data;
  }
  await sleep(300);
  const res = await getAnnouncements();
  const limit = params?.limit || res.results.length;
  return res.results.slice(0, limit).map((a, idx) => ({
    ...a,
    isRead: idx > 0, // first is unread
  }));
}

export const studentService = {
  getDashboard,
  getMyCourses,
  getAnnouncements: getStudentAnnouncements,
};
