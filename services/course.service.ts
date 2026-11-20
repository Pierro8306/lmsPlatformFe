import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getUserRole } from '@/lib/auth';
import type { Course, CourseWithLessons } from '@/types/course';
import type { PaginatedResponse } from '@/types/api';
import type { CourseFormValues } from '@/lib/validators';

interface BackendCourseSummary {
  id: string;
  title: string;
  description: string;
  userGroup: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

interface BackendCourseDetail extends BackendCourseSummary {
  lessons: Array<{
    id: string;
    title: string;
    content: string;
    video_url: string | null;
    attachment_urls: string | null;
    completed: boolean;
    completedAt?: string | null;
  }>;
}

function mapSummaryToCourse(c: BackendCourseSummary): Course {
  return {
    id: c.id,
    title: c.title,
    description: c.description || '',
    coverImage: null,
    instructor: 'Administrator',
    instructorAvatar: null,
    group: c.userGroup || null,
    userGroup: c.userGroup || null,
    isPublished: true,
    lessonCount: c.totalLessons || 0,
    totalLessons: c.totalLessons || 0,
    completedLessons: c.completedLessons || 0,
    enrolledCount: 0,
    progress: Math.round(c.progressPercent || 0),
    progressPercent: c.progressPercent || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getCourses(): Promise<PaginatedResponse<Course>> {
  const role = getUserRole();
  const url = role === 'admin' ? ENDPOINTS.COURSES.LIST : ENDPOINTS.COURSES.STUDENT_LIST;

  const { data } = await apiClient.get<BackendCourseSummary[]>(url);
  const courses = (Array.isArray(data) ? data : []).map(mapSummaryToCourse);

  return {
    results: courses,
    count: courses.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function getCourseById(id: string | number): Promise<CourseWithLessons> {
  const role = getUserRole();
  const url = ENDPOINTS.COURSES.STUDENT_DETAIL(id);

  try {
    const { data } = await apiClient.get<BackendCourseDetail>(url);
    const course = mapSummaryToCourse(data);
    const lessons = (data.lessons || []).map((l, index) => ({
      id: l.id,
      courseId: data.id,
      title: l.title,
      content: l.content || '',
      videoUrl: l.video_url || null,
      video_url: l.video_url || null,
      attachment_urls: l.attachment_urls || null,
      duration: 30,
      order: index + 1,
      isPublished: true,
      completed: l.completed || false,
      completedAt: l.completedAt || null,
      attachments: l.attachment_urls
        ? [
            {
              id: `att-${l.id}`,
              lessonId: l.id,
              name: 'Resource Attachment',
              file: l.attachment_urls,
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return {
      ...course,
      lessons,
    };
  } catch {
    // If student detail endpoint is not accessible (or admin viewing course not yet in group)
    const allCourses = await getCourses();
    const course = allCourses.results.find((c) => String(c.id) === String(id));
    if (!course) throw new Error('Course not found');
    return {
      ...course,
      lessons: [],
    };
  }
}

export async function createCourse(payload: CourseFormValues): Promise<Course> {
  const { data } = await apiClient.post<BackendCourseSummary>(ENDPOINTS.COURSES.CREATE, {
    title: payload.title.trim(),
    description: payload.description?.trim() || '',
    userGroup: payload.group?.trim() || null,
  });

  return mapSummaryToCourse(data);
}

export async function updateCourse(
  id: string | number,
  payload: Partial<CourseFormValues>
): Promise<Course> {
  await apiClient.put(ENDPOINTS.COURSES.UPDATE(id), {
    title: payload.title?.trim(),
    description: payload.description?.trim() || '',
    userGroup: payload.group?.trim() || null,
  });

  return {
    id,
    title: payload.title || '',
    description: payload.description || '',
    coverImage: null,
    instructor: 'Administrator',
    instructorAvatar: null,
    group: payload.group || null,
    userGroup: payload.group || null,
    isPublished: payload.isPublished ?? true,
    lessonCount: 0,
    enrolledCount: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteCourse(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.COURSES.DELETE(id));
}

export const courseService = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
