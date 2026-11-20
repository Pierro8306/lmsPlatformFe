export interface LessonAttachment {
  id: string | number;
  lessonId: string | number;
  name: string;
  file: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
}

export interface Lesson {
  id: string | number;
  courseId: string | number;
  title: string;
  content: string;
  videoUrl?: string | null;
  video_url?: string | null;
  attachment_urls?: string | null;
  duration?: number | null;
  order?: number;
  isPublished?: boolean;
  completed?: boolean;
  completedAt?: string | null;
  attachments?: LessonAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string | number;
  title: string;
  description: string;
  coverImage?: string | null;
  instructor?: string;
  instructorAvatar?: string | null;
  group?: string | null;
  userGroup?: string | null;
  isPublished: boolean;
  lessonCount: number;
  totalLessons?: number;
  completedLessons?: number;
  enrolledCount: number;
  progress?: number;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export interface LessonWithCourse extends Lesson {
  course: Course;
}

export interface StudentCourse {
  id: string | number;
  title: string;
  description: string;
  instructor?: string;
  lessonCount?: number;
  totalLessons?: number;
  completedLessons?: number;
  progress: number;
  progressPercent?: number;
  userGroup?: string | null;
}
