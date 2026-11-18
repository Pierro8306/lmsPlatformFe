import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// User schemas
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['admin', 'student']),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  group: z.string().nullable().optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  group: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

// Course schemas
export const courseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description is too long'),
  group: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
})

// Lesson schemas
export const lessonSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string().min(1, 'Content is required'),
  videoUrl: z
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  duration: z.number().positive('Duration must be positive').nullable().optional(),
  isPublished: z.boolean().default(false),
})

// Quiz schemas
export const quizSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().max(1000, 'Description is too long').nullable().optional(),
  timeLimit: z
    .number()
    .positive('Time limit must be positive')
    .int('Time limit must be a whole number')
    .nullable()
    .optional(),
  passingScore: z
    .number()
    .min(0, 'Passing score must be at least 0')
    .max(100, 'Passing score must be at most 100'),
  maxAttempts: z
    .number()
    .positive('Max attempts must be positive')
    .int('Max attempts must be a whole number')
    .default(3),
  isPublished: z.boolean().default(false),
})

export const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
})

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  points: z.number().positive('Points must be positive').default(1),
  explanation: z.string().nullable().optional(),
  options: z
    .array(questionOptionSchema)
    .min(2, 'At least 2 options required for multiple choice')
    .optional(),
})

// Project schemas
export const projectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(1, 'Requirements are required'),
  dueDate: z.string().nullable().optional(),
  maxScore: z
    .number()
    .positive('Max score must be positive')
    .int('Max score must be a whole number')
    .default(100),
  allowLateSubmission: z.boolean().default(false),
  isPublished: z.boolean().default(false),
})

export const projectSubmissionSchema = z.object({
  repositoryUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com'
      } catch {
        return false
      }
    }, 'Please enter a valid GitHub repository URL'),
  deployedUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
})

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0, 'Score must be at least 0'),
  feedback: z.string().min(1, 'Feedback is required').max(2000, 'Feedback is too long'),
  status: z.enum(['graded', 'resubmit']),
})

// Announcement schemas
export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string().min(1, 'Content is required'),
  target: z.enum(['all', 'group', 'course']),
  targetId: z.number().nullable().optional(),
  isPinned: z.boolean().default(false),
})

// Event schemas
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description is too long').nullable().optional(),
  type: z.enum(['deadline', 'live_session', 'exam', 'holiday', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().nullable().optional(),
  location: z.string().max(200, 'Location is too long').nullable().optional(),
  meetingUrl: z
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  courseId: z.number().nullable().optional(),
  isAllDay: z.boolean().default(false),
})

// Inferred types
export type LoginFormValues = z.infer<typeof loginSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
export type CourseFormValues = z.infer<typeof courseSchema>
export type LessonFormValues = z.infer<typeof lessonSchema>
export type QuizFormValues = z.infer<typeof quizSchema>
export type QuestionFormValues = z.infer<typeof questionSchema>
export type ProjectFormValues = z.infer<typeof projectSchema>
export type ProjectSubmissionFormValues = z.infer<typeof projectSubmissionSchema>
export type GradeSubmissionFormValues = z.infer<typeof gradeSubmissionSchema>
export type AnnouncementFormValues = z.infer<typeof announcementSchema>
export type EventFormValues = z.infer<typeof eventSchema>
