export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late' | 'resubmit'

export interface Project {
  id: number
  courseId: number
  title: string
  description: string
  requirements: string
  dueDate: string | null
  maxScore: number
  allowLateSubmission: boolean
  isPublished: boolean
  submissionCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectSubmission {
  id: number
  projectId: number
  studentId: number
  studentName: string
  studentEmail: string
  repositoryUrl: string
  deployedUrl: string | null
  notes: string | null
  status: SubmissionStatus
  score: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
  gradedBy: string | null
}

export interface ProjectWithSubmissions extends Project {
  submissions: ProjectSubmission[]
}

export interface CreateProjectSubmissionRequest {
  projectId: number
  repositoryUrl: string
  deployedUrl?: string
  notes?: string
}

export interface GradeSubmissionRequest {
  score: number
  feedback: string
  status: SubmissionStatus
}
