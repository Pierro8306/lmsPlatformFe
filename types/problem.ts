export type Language = 'python' | 'java' | 'cpp' | 'javascript';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export type Verdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'RUNNING'
  | 'IN_QUEUE'
  | 'AC'
  | 'WA'
  | 'TLE'
  | 'MLE'
  | 'RTE'
  | 'OLE'
  | 'CE'
  | 'SE';

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isVisible: boolean;
  points?: number;
  order?: number;
}

export interface TestResult {
  testCaseId?: string;
  id?: number | string;
  verdict?: Verdict;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionTimeMs?: number;
  timeMs?: number;
  memoryKb?: number;
  errorMessage?: string;
  message?: string;
  isVisible?: boolean;
}

export interface JudgeResult {
  submissionId?: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  memoryKb: number;
  score: number;
  maxScore?: number;
  compileOutput?: string;
  message?: string;
  stdout?: string;
  stderr?: string;
  testResults: TestResult[];
  results?: TestResult[];
}

export interface LineComment {
  id: string;
  submissionId: string;
  lineNumber: number;
  author: {
    id: number | string;
    name: string;
    role: 'admin' | 'instructor';
    avatar?: string | null;
  };
  content: string;
  severity: 'suggestion' | 'issue' | 'critical';
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle?: string;
  studentId?: number | string;
  studentName?: string;
  userName?: string;
  studentEmail?: string;
  language: Language;
  code?: string;
  sourceCode?: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  memoryKb: number;
  score: number; // 0-10 or 0-100
  submittedAt: string;
  isLate?: boolean;
  feedback?: string;
  comments?: LineComment[];
  testResults?: TestResult[];
}

export interface Problem {
  id: string;
  title: string;
  slug?: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb?: number;
  memoryLimitKb?: number;
  description?: string;
  content?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  samples?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  allowedLanguages: Language[];
  starterCode: Record<Language, string>;
  assignedCourseId?: number | null;
  assignedGroupName?: string | null;
  groupIds?: string[];
  startAt?: string | null;
  deadline?: string | null;
  allowLate?: boolean;
  maxAttempts?: number;
  attemptsUsed?: number;
  open?: boolean;
  totalPoints?: number;
  testCases?: TestCase[];
  testCaseCount?: number;
  userStatus?: ProblemStatus;
  userBestScore?: number;
  totalSubmissions?: number;
  acceptanceRate?: number;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RunCodeRequest {
  problemId: string;
  language: Language;
  code: string;
  customInput?: string;
}

export interface SubmitCodeRequest {
  problemId: string;
  language: Language;
  code: string;
}

export interface AddLineCommentRequest {
  submissionId: string;
  lineNumber: number;
  content: string;
  severity: 'suggestion' | 'issue' | 'critical';
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}
