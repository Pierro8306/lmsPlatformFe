import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type {
  Problem,
  TestCase,
  Submission,
  RunCodeRequest,
  SubmitCodeRequest,
  JudgeResult,
  LineComment,
  AddLineCommentRequest,
  GradeSubmissionRequest as ProblemGradeRequest,
} from '@/types/problem';
import {
  mockProblems,
  mockTestCases,
  mockSubmissions,
  mockComments,
} from '@/lib/mock/problems';
import { simulateJudge, JudgeExecutionOptions } from '@/lib/mock/judge';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

// In-memory state for mock mode session persistence
let localProblems: Problem[] = [...mockProblems];
let localTestCases: Record<string, TestCase[]> = { ...mockTestCases };
let localSubmissions: Submission[] = [...mockSubmissions];
let localComments: Record<string, LineComment[]> = { ...mockComments };

export async function getProblems(params?: {
  difficulty?: string;
  tag?: string;
  search?: string;
}): Promise<Problem[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Problem[]>(ENDPOINTS.PROBLEMS.LIST, { params });
    return data;
  }
  await sleep(300);
  let list = [...localProblems];
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
  }
  if (params?.difficulty && params.difficulty !== 'all') {
    list = list.filter((p) => p.difficulty === params.difficulty);
  }
  if (params?.tag && params.tag !== 'all') {
    list = list.filter((p) => p.tags.includes(params.tag!));
  }
  return list;
}

export async function getProblem(id: string): Promise<Problem> {
  if (HAS_API) {
    const { data } = await apiClient.get<Problem>(ENDPOINTS.PROBLEMS.DETAIL(id));
    return data;
  }
  await sleep(250);
  const found = localProblems.find((p) => p.id === id || p.slug === id);
  if (!found) {
    throw new Error(`Problem not found: ${id}`);
  }
  return found;
}

export async function createProblem(payload: Partial<Problem>): Promise<Problem> {
  if (HAS_API) {
    const { data } = await apiClient.post<Problem>(ENDPOINTS.PROBLEMS.CREATE, payload);
    return data;
  }
  await sleep(400);
  const slug = (payload.title || 'new-problem').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newProblem: Problem = {
    id: slug,
    title: payload.title || 'Untitled Problem',
    slug,
    difficulty: payload.difficulty || 'easy',
    tags: payload.tags || ['Algorithms'],
    timeLimitMs: payload.timeLimitMs || 1000,
    memoryLimitMb: payload.memoryLimitMb || 256,
    description: payload.description || 'Problem statement...',
    allowedLanguages: payload.allowedLanguages || ['python', 'javascript'],
    starterCode: payload.starterCode || {
      python: '# write solution here\n',
      javascript: '// write solution here\n',
      java: '// write solution here\n',
      cpp: '// write solution here\n',
    },
    assignedCourseId: payload.assignedCourseId ?? null,
    assignedGroupName: payload.assignedGroupName ?? null,
    deadline: payload.deadline ?? null,
    totalPoints: payload.totalPoints || 100,
    userStatus: 'unsolved',
    totalSubmissions: 0,
    acceptanceRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localProblems.unshift(newProblem);
  return newProblem;
}

export async function updateProblem(id: string, payload: Partial<Problem>): Promise<Problem> {
  if (HAS_API) {
    const { data } = await apiClient.put<Problem>(ENDPOINTS.PROBLEMS.UPDATE(id), payload);
    return data;
  }
  await sleep(350);
  const idx = localProblems.findIndex((p) => p.id === id || p.slug === id);
  if (idx === -1) throw new Error('Problem not found');
  localProblems[idx] = {
    ...localProblems[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return localProblems[idx];
}

export async function deleteProblem(id: string): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.PROBLEMS.DELETE(id));
    return;
  }
  await sleep(300);
  localProblems = localProblems.filter((p) => p.id !== id && p.slug !== id);
}

// Test cases
export async function getTestCases(problemId: string): Promise<TestCase[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<TestCase[]>(ENDPOINTS.PROBLEMS.TESTCASES(problemId));
    return data;
  }
  await sleep(250);
  return localTestCases[problemId] || [];
}

export async function createTestCase(problemId: string, testCase: Partial<TestCase>): Promise<TestCase> {
  if (HAS_API) {
    const { data } = await apiClient.post<TestCase>(ENDPOINTS.PROBLEMS.TESTCASES(problemId), testCase);
    return data;
  }
  await sleep(300);
  const list = localTestCases[problemId] || [];
  const newTc: TestCase = {
    id: `tc-${Date.now()}`,
    problemId,
    input: testCase.input || '',
    expectedOutput: testCase.expectedOutput || '',
    isVisible: testCase.isVisible ?? true,
    points: testCase.points ?? 20,
    order: list.length + 1,
  };
  localTestCases[problemId] = [...list, newTc];
  return newTc;
}

export async function updateTestCase(
  problemId: string,
  testCaseId: string,
  data: Partial<TestCase>
): Promise<TestCase> {
  if (HAS_API) {
    const { data: updated } = await apiClient.put<TestCase>(
      ENDPOINTS.PROBLEMS.TESTCASE_DETAIL(problemId, testCaseId),
      data
    );
    return updated;
  }
  await sleep(250);
  const list = localTestCases[problemId] || [];
  const idx = list.findIndex((t) => t.id === testCaseId);
  if (idx === -1) throw new Error('Test case not found');
  list[idx] = { ...list[idx], ...data };
  localTestCases[problemId] = [...list];
  return list[idx];
}

export async function deleteTestCase(problemId: string, testCaseId: string): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(ENDPOINTS.PROBLEMS.TESTCASE_DETAIL(problemId, testCaseId));
    return;
  }
  await sleep(250);
  const list = localTestCases[problemId] || [];
  localTestCases[problemId] = list.filter((t) => t.id !== testCaseId);
}

export async function reorderTestCases(problemId: string, orderedIds: string[]): Promise<TestCase[]> {
  if (HAS_API) {
    const { data } = await apiClient.post<TestCase[]>(ENDPOINTS.PROBLEMS.TESTCASES(problemId) + 'reorder/', {
      orderedIds,
    });
    return data;
  }
  await sleep(250);
  const list = localTestCases[problemId] || [];
  const reordered: TestCase[] = [];
  orderedIds.forEach((id, idx) => {
    const found = list.find((t) => t.id === id);
    if (found) {
      reordered.push({ ...found, order: idx + 1 });
    }
  });
  localTestCases[problemId] = reordered;
  return reordered;
}

// Submissions
export async function getSubmissions(problemId: string): Promise<Submission[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Submission[]>(ENDPOINTS.PROBLEMS.SUBMISSIONS(problemId));
    return data;
  }
  await sleep(300);
  return localSubmissions.filter((s) => s.problemId === problemId);
}

export async function getSubmission(problemId: string, submissionId: string): Promise<Submission> {
  if (HAS_API) {
    const { data } = await apiClient.get<Submission>(
      ENDPOINTS.PROBLEMS.SUBMISSION_DETAIL(problemId, submissionId)
    );
    return data;
  }
  await sleep(250);
  const found = localSubmissions.find((s) => s.id === submissionId);
  if (!found) throw new Error('Submission not found');
  return {
    ...found,
    comments: localComments[submissionId] || [],
  };
}

export async function gradeSubmission(
  problemId: string,
  submissionId: string,
  grade: ProblemGradeRequest
): Promise<Submission> {
  if (HAS_API) {
    const { data } = await apiClient.post<Submission>(
      ENDPOINTS.PROBLEMS.GRADE_SUBMISSION(problemId, submissionId),
      grade
    );
    return data;
  }
  await sleep(350);
  const idx = localSubmissions.findIndex((s) => s.id === submissionId);
  if (idx === -1) throw new Error('Submission not found');
  localSubmissions[idx] = {
    ...localSubmissions[idx],
    score: grade.score,
    feedback: grade.feedback,
  };
  return localSubmissions[idx];
}

// Code Execution & Judge
export async function runCode(
  payload: RunCodeRequest,
  options?: JudgeExecutionOptions
): Promise<JudgeResult> {
  if (HAS_API) {
    const { data } = await apiClient.post<JudgeResult>(ENDPOINTS.PROBLEMS.RUN(payload.problemId), payload);
    return data;
  }
  return simulateJudge(
    payload.problemId,
    payload.language,
    payload.code,
    false,
    payload.customInput,
    options
  );
}

export async function submitCode(
  payload: SubmitCodeRequest,
  options?: JudgeExecutionOptions
): Promise<JudgeResult> {
  if (HAS_API) {
    const { data } = await apiClient.post<JudgeResult>(ENDPOINTS.PROBLEMS.SUBMIT(payload.problemId), payload);
    return data;
  }
  const result = await simulateJudge(
    payload.problemId,
    payload.language,
    payload.code,
    true,
    undefined,
    options
  );

  // Record submission in mock store
  const newSub: Submission = {
    id: result.submissionId,
    problemId: payload.problemId,
    problemTitle: localProblems.find((p) => p.id === payload.problemId)?.title || payload.problemId,
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    language: payload.language,
    code: payload.code,
    verdict: result.verdict,
    passedTests: result.passedTests,
    totalTests: result.totalTests,
    executionTimeMs: result.executionTimeMs,
    memoryKb: result.memoryKb,
    score: result.score,
    submittedAt: new Date().toISOString(),
    isLate: false,
    testResults: result.testResults,
  };
  localSubmissions.unshift(newSub);

  // Update problem user status if accepted
  const probIdx = localProblems.findIndex((p) => p.id === payload.problemId);
  if (probIdx !== -1) {
    if (result.verdict === 'ACCEPTED') {
      localProblems[probIdx].userStatus = 'solved';
      localProblems[probIdx].userBestScore = Math.max(localProblems[probIdx].userBestScore || 0, result.score);
    } else if (localProblems[probIdx].userStatus !== 'solved') {
      localProblems[probIdx].userStatus = 'attempted';
      localProblems[probIdx].userBestScore = Math.max(localProblems[probIdx].userBestScore || 0, result.score);
    }
  }

  return result;
}

// Line Comments
export async function getComments(submissionId: string): Promise<LineComment[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<LineComment[]>(ENDPOINTS.PROBLEMS.COMMENTS(submissionId));
    return data;
  }
  await sleep(200);
  return localComments[submissionId] || [];
}

export async function addLineComment(payload: AddLineCommentRequest): Promise<LineComment> {
  if (HAS_API) {
    const { data } = await apiClient.post<LineComment>(ENDPOINTS.PROBLEMS.COMMENTS(payload.submissionId), payload);
    return data;
  }
  await sleep(300);
  const newComment: LineComment = {
    id: `c-${Date.now()}`,
    submissionId: payload.submissionId,
    lineNumber: payload.lineNumber,
    author: {
      id: 1,
      name: 'Alice Administrator',
      role: 'admin',
    },
    content: payload.content,
    severity: payload.severity,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  const list = localComments[payload.submissionId] || [];
  localComments[payload.submissionId] = [...list, newComment];
  return newComment;
}

export async function toggleCommentStatus(
  submissionId: string,
  commentId: string
): Promise<LineComment> {
  if (HAS_API) {
    const { data } = await apiClient.patch<LineComment>(
      `${ENDPOINTS.PROBLEMS.COMMENTS(submissionId)}${commentId}/toggle/`
    );
    return data;
  }
  await sleep(250);
  const list = localComments[submissionId] || [];
  const idx = list.findIndex((c) => c.id === commentId);
  if (idx === -1) throw new Error('Comment not found');
  list[idx] = {
    ...list[idx],
    status: list[idx].status === 'open' ? 'resolved' : 'open',
  };
  localComments[submissionId] = [...list];
  return list[idx];
}
