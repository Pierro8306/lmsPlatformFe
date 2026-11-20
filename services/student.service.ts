import type { Course } from '@/types/course';
import type { Project } from '@/types/project';
import type { Quiz } from '@/types/quiz';
import type { Announcement, Event } from '@/types/announcement';
import { getCourses } from './course.service';
import { getAllProjects } from './project.service';
import { getAllQuizzes } from './quiz.service';
import { getAnnouncements } from './announcement.service';
import { getEvents } from './event.service';

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
  enrolledCourses: (Course & { progress: number; lastLessonId?: string | number; lastLessonTitle?: string })[];
  upcomingQuizzes: Quiz[];
  pendingProjects: Project[];
  recentEvents: Event[];
}

export async function getDashboard(): Promise<StudentDashboardData> {
  const [coursesRes, quizzesRes, projectsRes, eventsRes, announcementsRes] = await Promise.allSettled([
    getCourses(),
    getAllQuizzes(),
    getAllProjects(),
    getEvents(),
    getAnnouncements(),
  ]);

  const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.results : [];
  const quizzes = quizzesRes.status === 'fulfilled' ? quizzesRes.value : [];
  const projects = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
  const events = eventsRes.status === 'fulfilled' ? eventsRes.value.results : [];
  const announcements = announcementsRes.status === 'fulfilled' ? announcementsRes.value.results : [];

  const coursesInProgress = courses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length;
  const coursesCompleted = courses.filter((c) => (c.progress || 0) >= 100).length;

  const upcomingDeadlines: StudentDashboardDeadline[] = [
    ...projects
      .filter((p) => p.dueDate && new Date(p.dueDate) > new Date())
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title,
        type: 'Project Assignment',
        dueDate: p.dueDate!,
      })),
    ...quizzes
      .filter((q) => q.endTime && new Date(q.endTime) > new Date())
      .slice(0, 3)
      .map((q) => ({
        id: q.id,
        title: q.title,
        type: 'Timed Quiz',
        dueDate: q.endTime!,
      })),
  ];

  const firstCourse = courses[0];
  const nextLesson: StudentDashboardNextLesson | undefined = firstCourse
    ? {
        courseId: String(firstCourse.id),
        lessonId: '1',
        courseTitle: firstCourse.title,
        lessonTitle: firstCourse.description?.slice(0, 40) || 'Course Introduction',
        progress: firstCourse.progress || 0,
      }
    : undefined;

  return {
    coursesInProgress,
    coursesCompleted,
    totalCourses: courses.length,
    upcomingQuizzesCount: quizzes.filter((q) => q.status !== 'closed').length,
    unreadAnnouncements: announcements.length,
    nextLesson,
    upcomingDeadlines,
    enrolledCourses: courses.map((c) => ({
      ...c,
      progress: c.progress || 0,
    })),
    upcomingQuizzes: quizzes.filter((q) => q.status !== 'closed'),
    pendingProjects: projects,
    recentEvents: events.slice(0, 4),
  };
}

export async function getMyCourses(params?: {
  filter?: 'all' | 'in_progress' | 'completed';
  search?: string;
}): Promise<any[]> {
  const coursesRes = await getCourses();
  let list = coursesRes.results.map((c) => ({
    id: String(c.id),
    title: c.title,
    description: c.description,
    instructor: c.instructor || 'Administrator',
    lessonCount: c.lessonCount || 0,
    progress: c.progress || 0,
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
  const res = await getAnnouncements();
  const limit = params?.limit || res.results.length;
  return res.results.slice(0, limit);
}

export const studentService = {
  getDashboard,
  getMyCourses,
  getAnnouncements: getStudentAnnouncements,
};
