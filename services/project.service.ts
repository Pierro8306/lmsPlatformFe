import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getUserRole } from '@/lib/auth';
import type {
  Project,
  ProjectSubmission,
  ProjectWithSubmissions,
  GradeSubmissionRequest,
  CreateProjectSubmissionRequest,
  SubmissionStatus,
} from '@/types/project';
import type { ProjectFormValues } from '@/lib/validators';

interface BackendProjectResponse {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  userGroup: string | null;
}

interface BackendSubmissionDto {
  id: string;
  userName: string;
  github_url: string;
  submittedAt: string;
  status: string;
  score: string | null;
  feedback: string | null;
}

function mapBackendToProject(p: BackendProjectResponse): Project {
  return {
    id: p.id,
    courseId: 1,
    title: p.title,
    description: p.description || '',
    requirements: '1. Follow system development lifecycle\n2. Submit valid GitHub repo link\n3. Include README documentation',
    dueDate: p.deadline,
    deadline: p.deadline,
    userGroup: p.userGroup,
    maxScore: 10,
    allowLateSubmission: false,
    isPublished: true,
    submissionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapBackendToSubmission(
  s: BackendSubmissionDto,
  projectId: string | number
): ProjectSubmission {
  const statusLower = (s.status || 'submitted').toLowerCase() as SubmissionStatus;

  return {
    id: s.id,
    projectId,
    studentName: s.userName,
    userName: s.userName,
    studentEmail: `${s.userName}@eduflow.dev`,
    repositoryUrl: s.github_url,
    github_url: s.github_url,
    deployedUrl: null,
    notes: null,
    status: statusLower,
    score: s.score ? Number(s.score) : null,
    feedback: s.feedback,
    submittedAt: s.submittedAt || new Date().toISOString(),
    gradedAt: s.status === 'GRADED' ? s.submittedAt : null,
    gradedBy: 'Administrator',
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const role = getUserRole();
  const url = role === 'admin' ? ENDPOINTS.PROJECTS.LIST : ENDPOINTS.PROJECTS.STUDENT_LIST;

  const { data } = await apiClient.get<BackendProjectResponse[]>(url);
  return (Array.isArray(data) ? data : []).map(mapBackendToProject);
}

export async function getProjects(_courseId?: string | number): Promise<Project[]> {
  return getAllProjects();
}

export async function getProjectById(
  projectId: string | number,
  _courseId?: string | number
): Promise<ProjectWithSubmissions> {
  const role = getUserRole();
  const url = role === 'admin'
    ? ENDPOINTS.PROJECTS.DETAIL(projectId)
    : ENDPOINTS.PROJECTS.STUDENT_DETAIL(projectId);

  const { data } = await apiClient.get<BackendProjectResponse>(url);
  const project = mapBackendToProject(data);

  let submissions: ProjectSubmission[] = [];
  if (role === 'admin') {
    try {
      const subRes = await getSubmissions(projectId);
      submissions = subRes;
      project.submissionCount = submissions.length;
    } catch {
      // Submissions not loaded yet
    }
  } else {
    try {
      const mySub = await getMySubmission(projectId);
      if (mySub) submissions = [mySub];
    } catch {
      // Student has not submitted yet
    }
  }

  return {
    ...project,
    submissions,
  };
}

export async function createProject(
  payload: ProjectFormValues,
  _courseId?: string | number
): Promise<Project> {
  // Ensure deadline is in the future as required by BE @Future validator
  let deadline = payload.dueDate ? new Date(payload.dueDate).toISOString() : '';
  if (!deadline || new Date(deadline) <= new Date()) {
    deadline = new Date(Date.now() + 86400000 * 7).toISOString();
  }

  const { data } = await apiClient.post<BackendProjectResponse>(ENDPOINTS.PROJECTS.CREATE, {
    title: payload.title.trim(),
    description: payload.description?.trim() || 'Project Assignment Description',
    deadline,
    userGroup: null,
  });

  return mapBackendToProject(data);
}

export async function updateProject(
  projectId: string | number,
  payload: Partial<ProjectFormValues>,
  _courseId?: string | number
): Promise<Project> {
  let deadline = payload.dueDate ? new Date(payload.dueDate).toISOString() : '';
  if (!deadline || new Date(deadline) <= new Date()) {
    deadline = new Date(Date.now() + 86400000 * 7).toISOString();
  }

  const { data } = await apiClient.put<BackendProjectResponse>(
    ENDPOINTS.PROJECTS.UPDATE(projectId),
    {
      title: payload.title?.trim(),
      description: payload.description?.trim() || '',
      deadline,
      userGroup: null,
    }
  );

  return mapBackendToProject(data);
}

export async function deleteProject(
  projectId: string | number,
  _courseId?: string | number
): Promise<void> {
  await apiClient.delete(ENDPOINTS.PROJECTS.DELETE(projectId));
}

export async function getSubmissions(
  projectId: string | number,
  _courseId?: string | number
): Promise<ProjectSubmission[]> {
  const { data } = await apiClient.get<BackendSubmissionDto[]>(
    ENDPOINTS.PROJECTS.SUBMISSIONS(projectId)
  );

  return (Array.isArray(data) ? data : []).map((s) => mapBackendToSubmission(s, projectId));
}

export async function submitProject(
  projectId: string | number,
  payload: CreateProjectSubmissionRequest,
  _courseId?: string | number
): Promise<ProjectSubmission> {
  const githubUrl = payload.githubUrl || payload.repositoryUrl || '';

  await apiClient.post(ENDPOINTS.PROJECTS.SUBMIT, {
    projectId: String(projectId),
    githubUrl,
  });

  return {
    id: `sub-${Date.now()}`,
    projectId,
    repositoryUrl: githubUrl,
    github_url: githubUrl,
    deployedUrl: payload.deployedUrl || null,
    notes: payload.notes || null,
    status: 'submitted',
    score: null,
    feedback: null,
    submittedAt: new Date().toISOString(),
  };
}

export async function gradeSubmission(
  submissionId: string | number,
  payload: GradeSubmissionRequest,
  _projectId?: string | number,
  _courseId?: string | number
): Promise<ProjectSubmission> {
  await apiClient.put(ENDPOINTS.PROJECTS.GRADE(submissionId), {
    score: payload.score,
    feedback: payload.feedback || '',
  });

  return {
    id: submissionId,
    projectId: 1,
    repositoryUrl: '',
    status: 'graded',
    score: payload.score,
    feedback: payload.feedback || '',
    submittedAt: new Date().toISOString(),
    gradedAt: new Date().toISOString(),
    gradedBy: 'Administrator',
  };
}

export async function getMySubmission(
  projectId: string | number,
  _courseId?: string | number
): Promise<ProjectSubmission | null> {
  try {
    const { data } = await apiClient.get<BackendSubmissionDto>(
      ENDPOINTS.PROJECTS.MY_SUBMISSION(projectId)
    );
    if (!data) return null;
    return mapBackendToSubmission(data, projectId);
  } catch {
    return null;
  }
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
