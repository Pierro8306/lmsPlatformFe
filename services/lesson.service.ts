import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Lesson, LessonWithCourse, LessonAttachment } from '@/types/course';
import type { LessonFormValues } from '@/lib/validators';

interface AdminLessonSummaryDto {
  id: string;
  title: string;
  courseId: string | null;
  courseTitle: string | null;
}

interface BackendLessonDetail {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  attachment_urls: string | null;
  completed?: boolean;
  completedAt?: string | null;
}

function mapDetailToLesson(d: BackendLessonDetail, courseId: string | number = ''): Lesson {
  return {
    id: d.id,
    courseId,
    title: d.title,
    content: d.content || '',
    videoUrl: d.video_url || null,
    video_url: d.video_url || null,
    attachment_urls: d.attachment_urls || null,
    duration: 30,
    order: 1,
    isPublished: true,
    completed: d.completed || false,
    completedAt: d.completedAt || null,
    attachments: d.attachment_urls
      ? [
          {
            id: `att-${d.id}`,
            lessonId: d.id,
            name: 'Attached Resource',
            file: d.attachment_urls,
          },
        ]
      : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getLessons(courseId: string | number): Promise<Lesson[]> {
  try {
    // If student course detail is available, it includes full lessons with progress
    const { data } = await apiClient.get<{ lessons: BackendLessonDetail[] }>(
      ENDPOINTS.COURSES.STUDENT_DETAIL(courseId)
    );
    if (data?.lessons) {
      return data.lessons.map((l, idx) => ({
        ...mapDetailToLesson(l, courseId),
        order: idx + 1,
      }));
    }
  } catch {
    // Fallback: list all admin lessons and filter by courseId
  }

  const all = await getAllLessons();
  return all.filter((l) => String(l.courseId) === String(courseId));
}

export async function getAllLessons(unassigned: boolean = false): Promise<Lesson[]> {
  const { data } = await apiClient.get<AdminLessonSummaryDto[]>(
    ENDPOINTS.LESSONS.LIST(unassigned)
  );

  return (Array.isArray(data) ? data : []).map((l, idx) => ({
    id: l.id,
    courseId: l.courseId || '',
    title: l.title,
    content: '',
    videoUrl: null,
    video_url: null,
    attachment_urls: null,
    duration: 30,
    order: idx + 1,
    isPublished: true,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getLessonById(
  courseId: string | number,
  lessonId: string | number
): Promise<LessonWithCourse> {
  const { data } = await apiClient.get<BackendLessonDetail>(
    ENDPOINTS.LESSONS.STUDENT_DETAIL(lessonId)
  );

  const lesson = mapDetailToLesson(data, courseId);

  return {
    ...lesson,
    course: {
      id: courseId,
      title: 'Course Curriculum',
      description: '',
      instructor: 'Administrator',
      instructorAvatar: null,
      coverImage: null,
      group: null,
      isPublished: true,
      lessonCount: 1,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function createLesson(
  courseId: string | number,
  payload: LessonFormValues
): Promise<Lesson> {
  const { data } = await apiClient.post<BackendLessonDetail>(ENDPOINTS.LESSONS.CREATE, {
    title: payload.title.trim(),
    content: payload.content || '',
    video_url: payload.videoUrl?.trim() || null,
    attachment_urls: null,
  });

  const createdLesson = mapDetailToLesson(data, courseId);

  // If a courseId is given, link lesson to that course
  if (courseId) {
    try {
      await apiClient.post(ENDPOINTS.COURSES.ADD_LESSON(courseId, data.id));
    } catch {
      // Ignored if already attached or unassigned
    }
  }

  return createdLesson;
}

export async function updateLesson(
  courseId: string | number,
  lessonId: string | number,
  payload: Partial<LessonFormValues>
): Promise<Lesson> {
  await apiClient.put(ENDPOINTS.LESSONS.UPDATE(lessonId), {
    title: payload.title?.trim(),
    content: payload.content || '',
    video_url: payload.videoUrl?.trim() || null,
    attachment_urls: null,
  });

  return {
    id: lessonId,
    courseId,
    title: payload.title || '',
    content: payload.content || '',
    videoUrl: payload.videoUrl || null,
    video_url: payload.videoUrl || null,
    duration: payload.duration || 30,
    order: 1,
    isPublished: payload.isPublished ?? true,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteLesson(
  courseId: string | number,
  lessonId: string | number
): Promise<void> {
  await apiClient.delete(ENDPOINTS.LESSONS.DELETE(lessonId));
}

export async function reorderLessons(
  _courseId: string | number,
  _orderedIds: (string | number)[]
): Promise<void> {
  // Ordering is preserved by sequence on frontend
}

export async function assignLessonToCourse(
  lessonId: string | number,
  targetCourseId: string | number | null,
  previousCourseId?: string | number | null
): Promise<void> {
  if (targetCourseId) {
    await apiClient.post(ENDPOINTS.COURSES.ADD_LESSON(targetCourseId, lessonId));
  } else if (previousCourseId) {
    await apiClient.delete(ENDPOINTS.COURSES.REMOVE_LESSON(previousCourseId, lessonId));
  }
}

export async function completeLesson(lessonId: string | number): Promise<void> {
  await apiClient.post(ENDPOINTS.LESSONS.COMPLETE(lessonId));
}

export async function uncompleteLesson(lessonId: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.LESSONS.UNCOMPLETE(lessonId));
}

export async function uploadAttachment(
  _courseId: string | number,
  lessonId: string | number,
  file: File
): Promise<LessonAttachment> {
  return {
    id: `att-${Date.now()}`,
    lessonId,
    name: file.name,
    file: `/files/${file.name}`,
    fileSize: file.size,
    fileType: file.type || 'application/pdf',
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteAttachment(
  _courseId: string | number,
  _lessonId: string | number,
  _attachmentId: string | number
): Promise<void> {
  // Attachment deletion handled with lesson update
}

export const lessonService = {
  getLessons,
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  assignLessonToCourse,
  completeLesson,
  uncompleteLesson,
  uploadAttachment,
  deleteAttachment,
};
