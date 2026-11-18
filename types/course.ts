export interface LessonAttachment {
  id: number
  lessonId: number
  name: string
  file: string
  fileSize: number
  fileType: string
  uploadedAt: string
}

export interface Lesson {
  id: number
  courseId: number
  title: string
  content: string
  videoUrl: string | null
  duration: number | null
  order: number
  isPublished: boolean
  attachments: LessonAttachment[]
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  title: string
  description: string
  coverImage: string | null
  instructor: string
  instructorAvatar: string | null
  group: string | null
  isPublished: boolean
  lessonCount: number
  enrolledCount: number
  progress?: number
  createdAt: string
  updatedAt: string
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[]
}

export interface LessonWithCourse extends Lesson {
  course: Course
}


export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  lessonCount: number;
  progress: number;
}
