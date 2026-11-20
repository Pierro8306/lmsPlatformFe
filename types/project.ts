export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late' | 'resubmit';

export interface Project {
  id: string | number;
  courseId?: string | number;
  title: string;
  description: string;
  requirements?: string;
  dueDate?: string | null;
  deadline?: string | null;
  userGroup?: string | null;
  maxScore?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  submissionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSubmission {
  id: string | number;
  projectId: string | number;
  studentId?: string | number;
  studentName?: string;
  userName?: string;
  studentEmail?: string;
  repositoryUrl: string;
  github_url?: string;
  deployedUrl?: string | null;
  notes?: string | null;
  status: SubmissionStatus | string;
  score: number | string | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  gradedBy?: string | null;
}

export interface ProjectWithSubmissions extends Project {
  submissions: ProjectSubmission[];
}

export interface CreateProjectSubmissionRequest {
  projectId: string | number;
  repositoryUrl?: string;
  githubUrl?: string;
  deployedUrl?: string;
  notes?: string;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
  status?: SubmissionStatus | string;
}
