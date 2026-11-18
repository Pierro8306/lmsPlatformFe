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
  | 'IN_QUEUE';

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isVisible: boolean;
  points: number;
  order: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionTimeMs: number;
  memoryKb: number;
  errorMessage?: string;
  isVisible: boolean;
}

export interface JudgeResult {
  submissionId: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  memoryKb: number;
  score: number;
  compileOutput?: string;
  stdout?: string;
  stderr?: string;
  testResults: TestResult[];
}

export interface LineComment {
  id: string;
  submissionId: string;
  lineNumber: number;
  author: {
    id: number;
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
  studentId: number;
  studentName: string;
  studentEmail: string;
  language: Language;
  code: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  memoryKb: number;
  score: number; // 0-10
  submittedAt: string;
  isLate?: boolean;
  feedback?: string;
  comments?: LineComment[];
  testResults?: TestResult[];
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  allowedLanguages: Language[];
  starterCode: Record<Language, string>;
  assignedCourseId?: number | null;
  assignedGroupName?: string | null;
  deadline?: string | null;
  totalPoints: number;
  testCases?: TestCase[];
  userStatus?: ProblemStatus;
  userBestScore?: number;
  totalSubmissions?: number;
  acceptanceRate?: number;
  createdAt: string;
  updatedAt: string;
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
  score: number; // 0-10
  feedback?: string;
}
