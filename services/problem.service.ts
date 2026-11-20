import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getUserRole } from '@/lib/auth';
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
  Language,
  Difficulty,
  Verdict,
} from '@/types/problem';

interface BackendProblemSummary {
  id: string;
  title: string;
  slug?: string;
  content: string;
  difficulty: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  published?: boolean;
  startAt?: string | null;
  deadline?: string | null;
  allowLate?: boolean;
  maxAttempts?: number;
  groupIds?: string[];
  testCaseCount?: number;
  open?: boolean;
  attemptsUsed?: number;
  samples?: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface BackendSubmissionSummary {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  language: string;
  verdict: string;
  score: number;
  timeMs: number;
  memoryKb: number;
  submittedAt: string;
}

interface BackendSubmissionDetail extends BackendSubmissionSummary {
  sourceCode: string;
  results?: Array<{
    testCaseId: number | string;
    verdict: string;
    timeMs: number;
    memoryKb: number;
    message?: string;
  }>;
}

interface BackendTestCaseResponse {
  id: string;
  input: string;
  expectedOutput: string;
  isVisible: boolean;
  points?: number;
  order?: number;
}

interface BackendJudgeReport {
  verdict: string;
  maxTimeMs: number;
  maxMemoryKb: number;
  score: number;
  maxScore: number;
  message: string;
  results?: Array<{
    id: number;
    verdict: string;
    timeMs: number;
    memoryKb: number;
    message: string;
  }>;
}

function normalizeVerdict(raw?: string): Verdict {
  if (!raw) return 'RUNNING';
  const u = raw.toUpperCase();
  if (u === 'AC' || u === 'ACCEPTED') return 'ACCEPTED';
  if (u === 'WA' || u === 'WRONG_ANSWER') return 'WRONG_ANSWER';
  if (u === 'TLE' || u === 'TIME_LIMIT_EXCEEDED') return 'TIME_LIMIT_EXCEEDED';
  if (u === 'MLE' || u === 'MEMORY_LIMIT_EXCEEDED') return 'MEMORY_LIMIT_EXCEEDED';
  if (u === 'RTE' || u === 'RUNTIME_ERROR') return 'RUNTIME_ERROR';
  if (u === 'CE' || u === 'COMPILE_ERROR') return 'COMPILE_ERROR';
  return (u as Verdict) || 'RUNNING';
}

function mapBackendToProblem(p: BackendProblemSummary): Problem {
  const diff = (p.difficulty || 'easy').toLowerCase() as Difficulty;
  const slug = p.slug || p.id;

  return {
    id: p.id,
    title: p.title,
    slug,
    difficulty: diff,
    tags: ['Algorithms', 'Data Structures'],
    timeLimitMs: p.timeLimitMs || 1000,
    memoryLimitMb: Math.round((p.memoryLimitKb || 65536) / 1024),
    memoryLimitKb: p.memoryLimitKb || 65536,
    description: p.content || 'Problem description',
    content: p.content,
    allowedLanguages: ['python', 'javascript', 'java', 'cpp'],
    starterCode: {
      python: '# Write solution here\n',
      javascript: '// Write solution here\n',
      java: '// Write solution here\n',
      cpp: '// Write solution here\n',
    },
    examples: (p.samples || []).map((s) => ({
      input: s.input,
      output: s.expectedOutput,
    })),
    samples: p.samples,
    assignedCourseId: 1,
    assignedGroupName: p.groupIds?.[0] || null,
    groupIds: p.groupIds,
    startAt: p.startAt,
    deadline: p.deadline,
    allowLate: p.allowLate,
    maxAttempts: p.maxAttempts,
    attemptsUsed: p.attemptsUsed || 0,
    open: p.open ?? true,
    totalPoints: 100,
    testCaseCount: p.testCaseCount || 0,
    userStatus: 'unsolved',
    totalSubmissions: 0,
    acceptanceRate: 75,
    published: p.published ?? true,
    createdAt: p.startAt || new Date().toISOString(),
    updatedAt: p.deadline || new Date().toISOString(),
  };
}

export async function getProblems(params?: {
  difficulty?: string;
  tag?: string;
  search?: string;
}): Promise<Problem[]> {
  const role = getUserRole();
  const url = role === 'admin' ? ENDPOINTS.PROBLEMS.LIST : ENDPOINTS.PROBLEMS.STUDENT_LIST;

  const { data } = await apiClient.get<BackendProblemSummary[]>(url);
  let list = (Array.isArray(data) ? data : []).map(mapBackendToProblem);

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (params?.difficulty && params.difficulty !== 'all') {
    list = list.filter((p) => p.difficulty === params.difficulty);
  }

  return list;
}

export async function getProblem(id: string): Promise<Problem> {
  const role = getUserRole();
  const url = role === 'admin' ? ENDPOINTS.PROBLEMS.DETAIL(id) : ENDPOINTS.PROBLEMS.STUDENT_DETAIL(id);

  const { data } = await apiClient.get<BackendProblemSummary>(url);
  return mapBackendToProblem(data);
}

export async function createProblem(payload: Partial<Problem>): Promise<Problem> {
  const slug = (payload.slug || payload.title || 'problem')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '') || 'problem';

  const timeLimitMs = Math.max(50, Math.min(30000, Number(payload.timeLimitMs || 1000)));
  const memoryLimitKb = Math.max(
    16384,
    Math.min(2097152, Number(payload.memoryLimitKb || (payload.memoryLimitMb ? payload.memoryLimitMb * 1024 : 65536)))
  );

  const { data } = await apiClient.post<BackendProblemSummary>(ENDPOINTS.PROBLEMS.CREATE, {
    title: (payload.title || 'New Problem').trim(),
    slug,
    content: payload.description || payload.content || 'Problem content',
    difficulty: (payload.difficulty || 'easy').toUpperCase(),
    timeLimitMs,
    memoryLimitKb,
    published: payload.published ?? true,
    startAt: payload.startAt || new Date().toISOString(),
    deadline: payload.deadline || new Date(Date.now() + 86400000 * 30).toISOString(),
    allowLate: payload.allowLate ?? false,
    maxAttempts: payload.maxAttempts || 10,
    groupIds: payload.groupIds || [],
    testCases: (payload.testCases || []).map((tc, idx) => ({
      input: tc.input || '',
      expectedOutput: tc.expectedOutput || '',
      isVisible: tc.isVisible ?? true,
      points: tc.points ?? 20,
      order: idx + 1,
    })),
  });

  return mapBackendToProblem(data);
}

export async function updateProblem(id: string, payload: Partial<Problem>): Promise<Problem> {
  const timeLimitMs = Math.max(50, Math.min(30000, Number(payload.timeLimitMs || 1000)));
  const memoryLimitKb = Math.max(
    16384,
    Math.min(2097152, Number(payload.memoryLimitKb || (payload.memoryLimitMb ? payload.memoryLimitMb * 1024 : 65536)))
  );

  const { data } = await apiClient.put<BackendProblemSummary>(ENDPOINTS.PROBLEMS.UPDATE(id), {
    title: payload.title?.trim(),
    slug: payload.slug,
    content: payload.description || payload.content,
    difficulty: payload.difficulty ? String(payload.difficulty).toUpperCase() : 'EASY',
    timeLimitMs,
    memoryLimitKb,
    published: payload.published ?? true,
    startAt: payload.startAt || new Date().toISOString(),
    deadline: payload.deadline || new Date(Date.now() + 86400000 * 30).toISOString(),
    allowLate: payload.allowLate ?? false,
    maxAttempts: payload.maxAttempts || 10,
    groupIds: payload.groupIds || [],
  });

  return mapBackendToProblem(data);
}

export async function deleteProblem(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.PROBLEMS.DELETE(id));
}

// Test cases
export async function getTestCases(problemId: string): Promise<TestCase[]> {
  const { data } = await apiClient.get<BackendTestCaseResponse[]>(
    ENDPOINTS.PROBLEMS.TESTCASES(problemId)
  );

  return (Array.isArray(data) ? data : []).map((tc, idx) => ({
    id: tc.id,
    problemId,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    isVisible: tc.isVisible,
    points: tc.points ?? 20,
    order: tc.order || idx + 1,
  }));
}

export async function createTestCase(problemId: string, testCase: Partial<TestCase>): Promise<TestCase> {
  const { data } = await apiClient.post<BackendTestCaseResponse>(
    ENDPOINTS.PROBLEMS.TESTCASES(problemId),
    {
      input: testCase.input || '',
      expectedOutput: testCase.expectedOutput || '',
      isVisible: testCase.isVisible ?? true,
      points: testCase.points ?? 20,
    }
  );

  return {
    id: data.id,
    problemId,
    input: data.input,
    expectedOutput: data.expectedOutput,
    isVisible: data.isVisible,
    points: data.points ?? 20,
    order: data.order || 1,
  };
}

export async function updateTestCase(
  problemId: string,
  testCaseId: string,
  data: Partial<TestCase>
): Promise<TestCase> {
  const { data: updated } = await apiClient.put<BackendTestCaseResponse>(
    ENDPOINTS.PROBLEMS.TESTCASE_DETAIL(problemId, testCaseId),
    {
      input: data.input || '',
      expectedOutput: data.expectedOutput || '',
      isVisible: data.isVisible ?? true,
      points: data.points ?? 20,
    }
  );

  return {
    id: updated.id,
    problemId,
    input: updated.input,
    expectedOutput: updated.expectedOutput,
    isVisible: updated.isVisible,
    points: updated.points ?? 20,
    order: updated.order || 1,
  };
}

export async function deleteTestCase(problemId: string, testCaseId: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.PROBLEMS.TESTCASE_DETAIL(problemId, testCaseId));
}

export async function reorderTestCases(
  problemId: string,
  orderedIds: string[]
): Promise<TestCase[]> {
  const current = await getTestCases(problemId);
  const reorderedItems = orderedIds.map((id, idx) => {
    const item = current.find((c) => c.id === id);
    return {
      input: item?.input || '',
      expectedOutput: item?.expectedOutput || '',
      isVisible: item?.isVisible ?? true,
      points: item?.points ?? 20,
      order: idx + 1,
    };
  });

  const { data } = await apiClient.put<BackendTestCaseResponse[]>(
    ENDPOINTS.PROBLEMS.TESTCASES(problemId),
    reorderedItems
  );

  return (Array.isArray(data) ? data : []).map((tc, idx) => ({
    id: tc.id,
    problemId,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    isVisible: tc.isVisible,
    points: tc.points ?? 20,
    order: tc.order || idx + 1,
  }));
}

// Submissions
export async function getSubmissions(problemId: string): Promise<Submission[]> {
  const role = getUserRole();
  const url = role === 'admin'
    ? ENDPOINTS.PROBLEMS.SUBMISSIONS(problemId)
    : ENDPOINTS.PROBLEMS.MY_SUBMISSIONS(problemId);

  const { data } = await apiClient.get<BackendSubmissionSummary[]>(url);

  return (Array.isArray(data) ? data : []).map((s) => ({
    id: s.id,
    problemId,
    studentId: s.userId,
    studentName: s.userName,
    userName: s.userName,
    studentEmail: `${s.userName}@eduflow.dev`,
    language: (s.language || 'python').toLowerCase() as Language,
    verdict: normalizeVerdict(s.verdict),
    passedTests: 0,
    totalTests: 0,
    executionTimeMs: s.timeMs,
    memoryKb: s.memoryKb,
    score: s.score,
    submittedAt: s.submittedAt || new Date().toISOString(),
  }));
}

export async function getSubmission(problemId: string, submissionId: string): Promise<Submission> {
  const { data } = await apiClient.get<BackendSubmissionDetail>(
    ENDPOINTS.PROBLEMS.SUBMISSION_DETAIL(problemId, submissionId)
  );

  const verdict = normalizeVerdict(data.verdict);
  const testResults = (data.results || []).map((r) => ({
    testCaseId: String(r.testCaseId),
    id: r.testCaseId,
    passed: normalizeVerdict(r.verdict) === 'ACCEPTED',
    verdict: normalizeVerdict(r.verdict),
    executionTimeMs: r.timeMs,
    timeMs: r.timeMs,
    memoryKb: r.memoryKb,
    message: r.message,
    errorMessage: r.message,
    isVisible: true,
  }));

  const passedTests = testResults.filter((r) => r.passed).length;

  return {
    id: data.id,
    problemId,
    studentId: data.userId,
    studentName: data.userName,
    userName: data.userName,
    studentEmail: `${data.userName}@eduflow.dev`,
    language: (data.language || 'python').toLowerCase() as Language,
    code: data.sourceCode,
    sourceCode: data.sourceCode,
    verdict,
    passedTests,
    totalTests: testResults.length,
    executionTimeMs: data.timeMs,
    memoryKb: data.memoryKb,
    score: data.score,
    submittedAt: data.submittedAt || new Date().toISOString(),
    testResults,
  };
}

export async function gradeSubmission(
  _problemId: string,
  submissionId: string,
  grade: ProblemGradeRequest
): Promise<Submission> {
  return {
    id: submissionId,
    problemId: '',
    language: 'python',
    verdict: 'ACCEPTED',
    passedTests: 10,
    totalTests: 10,
    executionTimeMs: 120,
    memoryKb: 14200,
    score: grade.score,
    feedback: grade.feedback,
    submittedAt: new Date().toISOString(),
  };
}

// Code Execution & Judge — connected directly to Docker sandbox judge via POST /api/student/problems/submit
export async function runCode(
  payload: RunCodeRequest,
  options?: { onStatusChange?: (status: any) => void }
): Promise<JudgeResult> {
  return submitCode(
    {
      problemId: payload.problemId,
      language: payload.language,
      code: payload.code,
    },
    options
  );
}

export async function submitCode(
  payload: SubmitCodeRequest,
  options?: { onStatusChange?: (status: any) => void }
): Promise<JudgeResult> {
  if (options?.onStatusChange) {
    options.onStatusChange('RUNNING');
  }

  // Spring Boot SubmitDto: { sourceCode: string, language: string, idProblem: string }
  const { data } = await apiClient.post<BackendJudgeReport>(
    ENDPOINTS.PROBLEMS.SUBMIT,
    {
      sourceCode: payload.code,
      language: payload.language.toUpperCase(),
      idProblem: payload.problemId,
    }
  );

  const verdict = normalizeVerdict(data.verdict);
  const testResults = (data.results || []).map((r) => ({
    testCaseId: String(r.id),
    id: r.id,
    passed: normalizeVerdict(r.verdict) === 'ACCEPTED',
    verdict: normalizeVerdict(r.verdict),
    executionTimeMs: r.timeMs,
    timeMs: r.timeMs,
    memoryKb: r.memoryKb,
    message: r.message,
    errorMessage: r.message,
    isVisible: true,
  }));

  const passedTests = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;

  return {
    submissionId: `sub-${Date.now()}`,
    verdict,
    passedTests,
    totalTests,
    executionTimeMs: data.maxTimeMs || 0,
    memoryKb: data.maxMemoryKb || 0,
    score: data.score || 0,
    maxScore: data.maxScore || 100,
    message: data.message,
    testResults,
    results: testResults,
  };
}

// Line Comments
export async function getComments(_submissionId: string): Promise<LineComment[]> {
  return [];
}

export async function addLineComment(payload: AddLineCommentRequest): Promise<LineComment> {
  return {
    id: `c-${Date.now()}`,
    submissionId: payload.submissionId,
    lineNumber: payload.lineNumber,
    author: {
      id: 'admin',
      name: 'Administrator',
      role: 'admin',
    },
    content: payload.content,
    severity: payload.severity,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
}

export async function toggleCommentStatus(
  _submissionId: string,
  _commentId: string
): Promise<LineComment> {
  return {
    id: _commentId,
    submissionId: _submissionId,
    lineNumber: 1,
    author: {
      id: 'admin',
      name: 'Administrator',
      role: 'admin',
    },
    content: '',
    severity: 'suggestion',
    status: 'resolved',
    createdAt: new Date().toISOString(),
  };
}

export const problemService = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  reorderTestCases,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  runCode,
  submitCode,
  getComments,
  addLineComment,
  toggleCommentStatus,
};
