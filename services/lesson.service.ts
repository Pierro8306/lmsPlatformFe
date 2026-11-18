import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { Lesson, LessonWithCourse, LessonAttachment } from '@/types/course';
import type { LessonFormValues } from '@/lib/validators';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockLessons: Lesson[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Introduction to Modern React & JSX Paradigm',
    content: `
      <h2>Welcome to React 18 Architecture</h2>
      <p>React is a declarative, efficient, and flexible JavaScript library for building modern user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.</p>
      <h3>Core Learning Objectives</h3>
      <ul>
        <li>Understand the virtual DOM and reconciliation tree</li>
        <li>Write typed JSX with strict TypeScript rules</li>
        <li>Master one-way reactive data flow and state lifting</li>
      </ul>
      <blockquote>"Thinking in React is about identifying minimal, complete representations of UI state."</blockquote>
    `,
    videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    duration: 45,
    order: 1,
    isPublished: true,
    attachments: [
      {
        id: 1,
        lessonId: 1,
        name: 'react-fundamentals-slides.pdf',
        file: '/files/react-fundamentals-slides.pdf',
        fileSize: 1024 * 1024 * 2.4, // 2.4MB
        fileType: 'application/pdf',
        uploadedAt: '2024-02-05T00:00:00Z',
      },
    ],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 2,
    courseId: 1,
    title: 'Component Lifecycle & Advanced Hooks (useMemo, useCallback)',
    content: `
      <h2>Mastering React Hooks</h2>
      <p>Hooks allow functional components to attach local state and lifecycle side effects without class abstractions.</p>
      <h3>When to use memoization:</h3>
      <ul>
        <li><strong>useMemo:</strong> When calculating expensive transformations like array sorting or filtering large datasets.</li>
        <li><strong>useCallback:</strong> When passing stable function references to child components wrapped in <code>React.memo</code>.</li>
      </ul>
    `,
    videoUrl: 'https://www.youtube.com/watch?v=LlvBzyy-558',
    duration: 60,
    order: 2,
    isPublished: true,
    attachments: [
      {
        id: 2,
        lessonId: 2,
        name: 'hooks-cheatsheet.pdf',
        file: '/files/hooks-cheatsheet.pdf',
        fileSize: 245760,
        fileType: 'application/pdf',
        uploadedAt: '2024-02-20T00:00:00Z',
      },
    ],
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-10-05T00:00:00Z',
  },
  {
    id: 3,
    courseId: 1,
    title: 'Global State Management with Zustand & TanStack Query',
    content: `
      <h2>State Architecture: Server vs Client</h2>
      <p>Separating server-cached state (TanStack Query) from transient client UI state (Zustand) is the gold standard of modern production applications.</p>
      <p>Zustand provides a lightweight, hook-based store without boilerplate or context re-rendering penalties.</p>
    `,
    videoUrl: null,
    duration: 50,
    order: 3,
    isPublished: true,
    attachments: [],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-10-10T00:00:00Z',
  },
  {
    id: 4,
    courseId: 1,
    title: 'Building Scalable REST APIs with Express & JWT Auth',
    content: `
      <h2>API Security & Middleware</h2>
      <p>Learn how to design robust HTTP endpoints with Express.js, structured error handling middleware, and stateless JWT authorization with refresh token rotation.</p>
    `,
    videoUrl: null,
    duration: 75,
    order: 4,
    isPublished: true,
    attachments: [],
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 5,
    courseId: 1,
    title: 'Production Deployment & Edge Caching',
    content: `
      <h2>Deploying Next.js Applications</h2>
      <p>Explore Vercel edge deployment, ISR (Incremental Static Regeneration), CDN edge caching, and monitoring production metrics.</p>
    `,
    videoUrl: null,
    duration: 40,
    order: 5,
    isPublished: true,
    attachments: [],
    createdAt: '2024-02-25T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];

export async function getLessons(courseId: number): Promise<Lesson[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Lesson[]>(ENDPOINTS.LESSONS.LIST(courseId));
    return data;
  }
  await sleep(350);
  return mockLessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
}

export async function getAllLessons(): Promise<Lesson[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Lesson[]>('/lessons/');
    return data;
  }
  await sleep(300);
  return [...mockLessons];
}

export async function getLessonById(courseId: number, lessonId: number): Promise<LessonWithCourse> {
  if (HAS_API) {
    const { data } = await apiClient.get<LessonWithCourse>(ENDPOINTS.LESSONS.DETAIL(courseId, lessonId));
    return data;
  }
  await sleep(350);
  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error('Lesson not found');
  return {
    ...lesson,
    course: {
      id: courseId,
      title: 'Full-Stack Web Development with React & Node.js',
      description: 'Course curriculum overview',
      coverImage: null,
      instructor: 'Alice Admin',
      instructorAvatar: null,
      group: null,
      isPublished: true,
      lessonCount: 5,
      enrolledCount: 38,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-11-01T00:00:00Z',
    },
  };
}

export async function createLesson(courseId: number, payload: LessonFormValues): Promise<Lesson> {
  if (HAS_API) {
    const { data } = await apiClient.post<Lesson>(ENDPOINTS.LESSONS.CREATE(courseId), payload);
    return data;
  }
  await sleep(500);
  const existing = mockLessons.filter((l) => l.courseId === courseId);
  const newLesson: Lesson = {
    id: Date.now(),
    courseId,
    title: payload.title,
    content: payload.content,
    videoUrl: payload.videoUrl || null,
    duration: payload.duration ?? null,
    order: existing.length + 1,
    isPublished: payload.isPublished ?? true,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLessons.push(newLesson);
  return newLesson;
}

export async function updateLesson(
  courseId: number,
  lessonId: number,
  payload: Partial<LessonFormValues>
): Promise<Lesson> {
  if (HAS_API) {
    const { data } = await apiClient.patch<Lesson>(
      ENDPOINTS.LESSONS.UPDATE(courseId, lessonId),
      payload
    );
    return data;
  }
  await sleep(400);
  const index = mockLessons.findIndex((l) => l.id === lessonId);
  if (index === -1) throw new Error('Lesson not found');
  const updated: Lesson = {
    ...mockLessons[index],
    ...payload,
    videoUrl: payload.videoUrl !== undefined ? payload.videoUrl || null : mockLessons[index].videoUrl,
    updatedAt: new Date().toISOString(),
  };
  mockLessons[index] = updated;
  return updated;
}

export async function deleteLesson(courseId: number, lessonId: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.LESSONS.DELETE(courseId, lessonId));
    return;
  }
  await sleep(400);
  mockLessons = mockLessons.filter((l) => l.id !== lessonId);
}

export async function reorderLessons(courseId: number, orderedIds: number[]): Promise<void> {
  if (HAS_API) {
    await apiClient.post(ENDPOINTS.LESSONS.REORDER(courseId), { order: orderedIds });
    return;
  }
  await sleep(300);
  orderedIds.forEach((id, index) => {
    const lesson = mockLessons.find((l) => l.id === id);
    if (lesson) lesson.order = index + 1;
  });
}

export async function assignLessonToCourse(lessonId: number, targetCourseId: number | null): Promise<void> {
  await sleep(300);
  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (lesson) {
    lesson.courseId = targetCourseId || 0;
  }
}

export async function uploadAttachment(
  courseId: number,
  lessonId: number,
  file: File
): Promise<LessonAttachment> {
  if (HAS_API) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<LessonAttachment>(
      ENDPOINTS.LESSONS.ATTACHMENTS(courseId, lessonId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }
  await sleep(600);
  const newAttachment: LessonAttachment = {
    id: Date.now(),
    lessonId,
    name: file.name,
    file: `/files/${file.name}`,
    fileSize: file.size,
    fileType: file.type || 'application/pdf',
    uploadedAt: new Date().toISOString(),
  };
  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (lesson) {
    lesson.attachments = [...(lesson.attachments || []), newAttachment];
  }
  return newAttachment;
}

export async function deleteAttachment(
  courseId: number,
  lessonId: number,
  attachmentId: number
): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.LESSONS.ATTACHMENT_DELETE(courseId, lessonId, attachmentId));
    return;
  }
  await sleep(300);
  const lesson = mockLessons.find((l) => l.id === lessonId);
  if (lesson) {
    lesson.attachments = (lesson.attachments || []).filter((a) => a.id !== attachmentId);
  }
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
  uploadAttachment,
  deleteAttachment,
};
