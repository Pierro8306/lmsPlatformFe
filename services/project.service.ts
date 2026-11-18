import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type {
  Project,
  ProjectSubmission,
  ProjectWithSubmissions,
  GradeSubmissionRequest,
  CreateProjectSubmissionRequest,
} from '@/types/project';
import type { ProjectFormValues } from '@/lib/validators';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockProjects: Project[] = [
  {
    id: 1,
    courseId: 1,
    title: 'Modern Full-Stack SaaS Portfolio Website',
    description:
      'Build and deploy a responsive personal portfolio with Next.js 14, Tailwind CSS, dark mode support, and an interactive contact form.',
    requirements:
      '1. Implement modern dark palette design system\n2. Include at least 4 projects with live demo links\n3. Responsive across mobile, tablet, and desktop\n4. Verified GitHub repository with meaningful commits\n5. Deployed to Vercel or Netlify',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    maxScore: 10,
    allowLateSubmission: true,
    isPublished: true,
    submissionCount: 3,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 2,
    courseId: 1,
    title: 'E-Commerce Marketplace with Stripe Integration',
    description:
      'Build a complete multi-vendor shopping platform with cart management, webhooks, and an administrative order management dashboard.',
    requirements:
      '1. Product catalog with filtering and search\n2. Shopping cart persistence in Zustand / LocalStorage\n3. Stripe Elements test integration\n4. Role-based routes for vendors and buyers',
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    maxScore: 10,
    allowLateSubmission: false,
    isPublished: true,
    submissionCount: 1,
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 3,
    courseId: 2,
    title: 'Exploratory Data Analysis & ML Classifier Pipeline',
    description:
      'Analyze the UCI Machine Learning repository dataset using pandas, seaborn, and scikit-learn random forest classifier.',
    requirements:
      '1. Data cleaning and missing value imputation\n2. Visualizations with seaborn correlation heatmaps\n3. Hyperparameter tuning using GridSearchCV\n4. Confusion matrix and classification report',
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // overdue
    maxScore: 10,
    allowLateSubmission: true,
    isPublished: true,
    submissionCount: 2,
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
  },
];

let mockSubmissions: ProjectSubmission[] = [
  {
    id: 1,
    projectId: 1,
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    repositoryUrl: 'https://github.com/alexrivers/eduflow-portfolio',
    deployedUrl: 'https://alexrivers.vercel.app',
    notes: 'Built with Next.js 14 App Router, Tailwind CSS, and Framer Motion micro-interactions.',
    status: 'graded',
    score: 9.5,
    feedback: 'Exceptional visual polish and clean component separation! Accessibility focus states look great.',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    gradedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    gradedBy: 'Alice Admin',
  },
  {
    id: 2,
    projectId: 1,
    studentId: 3,
    studentName: 'Jordan Vance',
    studentEmail: 'jvance@eduflow.dev',
    repositoryUrl: 'https://github.com/jvance/developer-portfolio',
    deployedUrl: 'https://jvance-portfolio.netlify.app',
    notes: 'Added dark mode toggle and blog markdown preview section.',
    status: 'submitted',
    score: null,
    feedback: null,
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    gradedAt: null,
    gradedBy: null,
  },
  {
    id: 3,
    projectId: 1,
    studentId: 4,
    studentName: 'Morgan Lee',
    studentEmail: 'mlee@eduflow.dev',
    repositoryUrl: 'https://github.com/mlee/saas-showcase',
    deployedUrl: null,
    notes: 'Submitted past deadline due to local build configuration issues.',
    status: 'late',
    score: null,
    feedback: null,
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    gradedAt: null,
    gradedBy: null,
  },
];

export async function getAllProjects(): Promise<Project[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Project[]>('/projects/');
    return data;
  }
  await sleep(400);
  return [...mockProjects];
}

export async function getProjects(courseId: number): Promise<Project[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Project[]>(ENDPOINTS.PROJECTS.LIST(courseId));
    return data;
  }
  await sleep(400);
  return mockProjects.filter((p) => p.courseId === courseId);
}

export async function getProjectById(
  projectId: number,
  courseId: number = 1
): Promise<ProjectWithSubmissions> {
  if (HAS_API) {
    const { data } = await apiClient.get<ProjectWithSubmissions>(
      ENDPOINTS.PROJECTS.DETAIL(courseId, projectId)
    );
    return data;
  }
  await sleep(400);
  const project = mockProjects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');
  return {
    ...project,
    submissions: mockSubmissions.filter((s) => s.projectId === projectId),
  };
}

export async function createProject(
  payload: ProjectFormValues,
  courseId: number = 1
): Promise<Project> {
  if (HAS_API) {
    const { data } = await apiClient.post<Project>(ENDPOINTS.PROJECTS.CREATE(courseId), payload);
    return data;
  }
  await sleep(500);
  const newProject: Project = {
    id: Date.now(),
    courseId,
    title: payload.title,
    description: payload.description,
    requirements: payload.requirements,
    dueDate: payload.dueDate ?? null,
    maxScore: payload.maxScore || 10,
    allowLateSubmission: payload.allowLateSubmission ?? false,
    isPublished: payload.isPublished ?? true,
    submissionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProjects.unshift(newProject);
  return newProject;
}

export async function updateProject(
  projectId: number,
  payload: Partial<ProjectFormValues>,
  courseId: number = 1
): Promise<Project> {
  if (HAS_API) {
    const { data } = await apiClient.patch<Project>(
      ENDPOINTS.PROJECTS.UPDATE(courseId, projectId),
      payload
    );
    return data;
  }
  await sleep(400);
  const idx = mockProjects.findIndex((p) => p.id === projectId);
  if (idx === -1) throw new Error('Project not found');
  const updated: Project = {
    ...mockProjects[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockProjects[idx] = updated;
  return updated;
}

export async function deleteProject(projectId: number, courseId: number = 1): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.PROJECTS.DELETE(courseId, projectId));
    return;
  }
  await sleep(400);
  mockProjects = mockProjects.filter((p) => p.id !== projectId);
  mockSubmissions = mockSubmissions.filter((s) => s.projectId !== projectId);
}

export async function getSubmissions(
  projectId: number,
  courseId: number = 1
): Promise<ProjectSubmission[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<ProjectSubmission[]>(
      ENDPOINTS.PROJECTS.SUBMISSIONS(courseId, projectId)
    );
    return data;
  }
  await sleep(400);
  return mockSubmissions.filter((s) => s.projectId === projectId);
}

export async function submitProject(
  projectId: number,
  payload: CreateProjectSubmissionRequest,
  courseId: number = 1
): Promise<ProjectSubmission> {
  if (HAS_API) {
    const { data } = await apiClient.post<ProjectSubmission>(
      ENDPOINTS.PROJECTS.SUBMIT(courseId, projectId),
      payload
    );
    return data;
  }
  await sleep(600);
  const project = mockProjects.find((p) => p.id === projectId);
  const isLate = project?.dueDate ? new Date() > new Date(project.dueDate) : false;

  const newSub: ProjectSubmission = {
    id: Date.now(),
    projectId,
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    repositoryUrl: payload.repositoryUrl,
    deployedUrl: payload.deployedUrl ?? null,
    notes: payload.notes ?? null,
    status: isLate ? 'late' : 'submitted',
    score: null,
    feedback: null,
    submittedAt: new Date().toISOString(),
    gradedAt: null,
    gradedBy: null,
  };

  // Replace or add
  const existingIdx = mockSubmissions.findIndex(
    (s) => s.projectId === projectId && s.studentId === 2
  );
  if (existingIdx >= 0) {
    mockSubmissions[existingIdx] = newSub;
  } else {
    mockSubmissions.push(newSub);
  }

  if (project) {
    project.submissionCount = mockSubmissions.filter((s) => s.projectId === projectId).length;
  }

  return newSub;
}

export async function gradeSubmission(
  submissionId: number,
  payload: GradeSubmissionRequest,
  projectId: number = 1,
  courseId: number = 1
): Promise<ProjectSubmission> {
  if (HAS_API) {
    const { data } = await apiClient.post<ProjectSubmission>(
      ENDPOINTS.PROJECTS.GRADE(courseId, projectId, submissionId),
      payload
    );
    return data;
  }
  await sleep(400);
  const sub = mockSubmissions.find((s) => s.id === submissionId);
  if (!sub) throw new Error('Submission not found');
  sub.score = payload.score;
  sub.feedback = payload.feedback;
  sub.status = payload.status;
  sub.gradedAt = new Date().toISOString();
  sub.gradedBy = 'Alice Admin';
  return { ...sub };
}

export async function getMySubmission(
  projectId: number,
  courseId: number = 1
): Promise<ProjectSubmission | null> {
  if (HAS_API) {
    const { data } = await apiClient.get<ProjectSubmission | null>(
      ENDPOINTS.PROJECTS.MY_SUBMISSION(courseId, projectId)
    );
    return data;
  }
  await sleep(300);
  return mockSubmissions.find((s) => s.projectId === projectId && s.studentId === 2) ?? null;
}

export const projectService = {
  getAllProjects,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getSubmissions,
  submitProject,
  gradeSubmission,
  getMySubmission,
};
