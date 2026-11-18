import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { Course, CourseWithLessons } from '@/types/course';
import type { PaginatedResponse } from '@/types/api';
import type { CourseFormValues } from '@/lib/validators';
import { getLessons } from './lesson.service';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockCourses: Course[] = [
  {
    id: 1,
    title: 'Full-Stack Web Development with React & Node.js',
    description:
      'Learn to build modern full-stack applications from scratch using React 18, Node.js, Express, and MongoDB. Covers REST APIs, authentication, deployment, and performance optimization.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Alice Admin',
    instructorAvatar: null,
    group: 'Group Alpha',
    isPublished: true,
    lessonCount: 5,
    enrolledCount: 38,
    progress: 60,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Python for Data Science & Machine Learning',
    description:
      'Master Python programming for data analysis, visualization, and machine learning. Includes pandas, NumPy, Matplotlib, scikit-learn, and neural networks fundamentals.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Alice Admin',
    instructorAvatar: null,
    group: 'Group Alpha',
    isPublished: true,
    lessonCount: 6,
    enrolledCount: 29,
    progress: 35,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 3,
    title: 'Enterprise UI/UX Design & Design Systems',
    description:
      'Understand the principles of user-centered design. Learn Figma, design tokens, responsive auto-layout, wireframing, and creating dark theme design systems.',
    coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Alice Admin',
    instructorAvatar: null,
    group: 'Group Beta',
    isPublished: true,
    lessonCount: 4,
    enrolledCount: 22,
    progress: 10,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 4,
    title: 'DevOps, Docker & Cloud Infrastructure',
    description:
      'Master CI/CD workflows, Docker containerization, Kubernetes clusters, and cloud deployments on AWS and Vercel.',
    coverImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Alice Admin',
    instructorAvatar: null,
    group: 'Group Gamma',
    isPublished: false,
    lessonCount: 3,
    enrolledCount: 0,
    progress: 0,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z',
  },
];

export async function getCourses(): Promise<PaginatedResponse<Course>> {
  if (HAS_API) {
    const { data } = await apiClient.get<PaginatedResponse<Course>>(ENDPOINTS.COURSES.LIST);
    return data;
  }
  await sleep(400);
  return {
    results: [...mockCourses],
    count: mockCourses.length,
    next: null,
    previous: null,
    totalPages: 1,
    currentPage: 1,
  };
}

export async function getCourseById(id: number): Promise<CourseWithLessons> {
  if (HAS_API) {
    const { data } = await apiClient.get<CourseWithLessons>(ENDPOINTS.COURSES.DETAIL(id));
    return data;
  }
  await sleep(400);
  const course = mockCourses.find((c) => c.id === id);
  if (!course) throw new Error('Course not found');
  const lessons = await getLessons(id);
  return { ...course, lessons };
}

export async function createCourse(payload: CourseFormValues): Promise<Course> {
  if (HAS_API) {
    const { data } = await apiClient.post<Course>(ENDPOINTS.COURSES.CREATE, payload);
    return data;
  }
  await sleep(500);
  const newCourse: Course = {
    id: Date.now(),
    title: payload.title,
    description: payload.description,
    coverImage: null,
    instructor: 'Alice Admin',
    instructorAvatar: null,
    group: payload.group ?? null,
    isPublished: payload.isPublished ?? false,
    lessonCount: 0,
    enrolledCount: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCourses.unshift(newCourse);
  return newCourse;
}

export async function updateCourse(id: number, payload: Partial<CourseFormValues>): Promise<Course> {
  if (HAS_API) {
    const { data } = await apiClient.patch<Course>(ENDPOINTS.COURSES.UPDATE(id), payload);
    return data;
  }
  await sleep(400);
  const index = mockCourses.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Course not found');
  const updated: Course = {
    ...mockCourses[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockCourses[index] = updated;
  return updated;
}

export async function deleteCourse(id: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.COURSES.DELETE(id));
    return;
  }
  await sleep(400);
  mockCourses = mockCourses.filter((c) => c.id !== id);
}

export const courseService = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
