import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type {
  Quiz,
  Question,
  QuizAttempt,
  QuizResult,
  QuizSubmission,
  StudentQuizResult,
  ExtractedQuestion,
} from '@/types/quiz';
import type { QuizFormValues, QuestionFormValues } from '@/lib/validators';

const HAS_API = !!process.env.NEXT_PUBLIC_API_URL;

let mockQuizzes: Quiz[] = [
  {
    id: 1,
    courseId: 1,
    courseTitle: 'Full-Stack Web Development with React & Node.js',
    title: 'Modern React & TypeScript Architecture Quiz',
    description: 'Comprehensive assessment on hooks, render lifecycles, and TypeScript patterns.',
    timeLimit: 20,
    duration: 20,
    passingScore: 70,
    maxAttempts: 3,
    remainingAttempts: 2,
    openTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    closeTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    allowedGroups: ['Group Alpha', 'Group Beta'],
    status: 'open',
    isPublished: true,
    questionCount: 4,
    totalPoints: 20,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 2,
    courseId: 1,
    courseTitle: 'Full-Stack Web Development with React & Node.js',
    title: 'Node.js & Express RESTful API Mastery',
    description: 'Middleware chaining, JWT authorization, MongoDB indexes, and error propagation.',
    timeLimit: 30,
    duration: 30,
    passingScore: 75,
    maxAttempts: 2,
    remainingAttempts: 1,
    openTime: new Date(Date.now() + 86400000 * 1).toISOString(),
    closeTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    allowedGroups: ['Group Alpha'],
    status: 'upcoming',
    isPublished: true,
    questionCount: 3,
    totalPoints: 15,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 3,
    courseId: 2,
    courseTitle: 'Python for Data Science & Machine Learning',
    title: 'NumPy, Pandas & Linear Regression Exam',
    description: 'Array broadcasting, data aggregation, vectorization, and loss functions.',
    timeLimit: 25,
    duration: 25,
    passingScore: 70,
    maxAttempts: 1,
    remainingAttempts: 0,
    openTime: new Date(Date.now() - 86400000 * 10).toISOString(),
    closeTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    allowedGroups: ['Group Alpha', 'Group Gamma'],
    status: 'closed',
    isPublished: true,
    questionCount: 3,
    totalPoints: 15,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];

let mockQuestions: Question[] = [
  {
    id: 1,
    quizId: 1,
    text: 'What does the React `useMemo` hook primarily optimize for?',
    type: 'multiple_choice',
    points: 5,
    order: 1,
    explanation:
      '`useMemo` caches the calculated result between renders until dependencies change, preventing expensive computations from running unnecessarily.',
    options: [
      { id: 1, questionId: 1, text: 'Memoizing callback functions', isCorrect: false, order: 1 },
      { id: 2, questionId: 1, text: 'Caching the result of expensive calculations', isCorrect: true, order: 2 },
      { id: 3, questionId: 1, text: 'Preventing child components from ever re-rendering', isCorrect: false, order: 3 },
      { id: 4, questionId: 1, text: 'Storing persistent state across page reloads', isCorrect: false, order: 4 },
    ],
  },
  {
    id: 2,
    quizId: 1,
    text: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
    type: 'multiple_choice',
    points: 5,
    order: 2,
    explanation: '`Partial<T>` turns every property in interface T into an optional property (`?`).',
    options: [
      { id: 5, questionId: 2, text: 'Pick<T, K>', isCorrect: false, order: 1 },
      { id: 6, questionId: 2, text: 'Omit<T, K>', isCorrect: false, order: 2 },
      { id: 7, questionId: 2, text: 'Partial<T>', isCorrect: true, order: 3 },
      { id: 8, questionId: 2, text: 'Record<K, T>', isCorrect: false, order: 4 },
    ],
  },
  {
    id: 3,
    quizId: 1,
    text: 'In Next.js App Router, Server Components can directly read request cookies and headers using standard server functions.',
    type: 'multiple_choice',
    points: 5,
    order: 3,
    explanation: 'Next.js provides `cookies()` and `headers()` from `next/headers` inside Server Components.',
    options: [
      { id: 9, questionId: 3, text: 'True', isCorrect: true, order: 1 },
      { id: 10, questionId: 3, text: 'False', isCorrect: false, order: 2 },
    ],
  },
  {
    id: 4,
    quizId: 1,
    text: 'What is the purpose of the `key` prop when rendering a dynamic list in React?',
    type: 'multiple_choice',
    points: 5,
    order: 4,
    explanation: 'React uses the `key` prop to identify which items have changed, been added, or been removed during reconciliation.',
    options: [
      { id: 11, questionId: 4, text: 'To encrypt DOM elements in production builds', isCorrect: false, order: 1 },
      { id: 12, questionId: 4, text: 'To identify list items efficiently during reconciliation', isCorrect: true, order: 2 },
      { id: 13, questionId: 4, text: 'To trigger automated CSS keyframe animations', isCorrect: false, order: 3 },
      { id: 14, questionId: 4, text: 'To bind HTML inputs to Redux store automatically', isCorrect: false, order: 4 },
    ],
  },
];

let mockStudentResults: StudentQuizResult[] = [
  {
    studentId: 2,
    studentName: 'Alex Rivers',
    studentEmail: 'student@eduflow.dev',
    group: 'Group Alpha',
    attempts: 2,
    bestScore: 20,
    maxScore: 20,
    bestPercentage: 100,
    completionPercentage: 100,
    timeTaken: 512,
    passed: true,
    lastAttemptAt: '2024-11-15T14:32:00Z',
  },
  {
    studentId: 3,
    studentName: 'Jordan Vance',
    studentEmail: 'jvance@eduflow.dev',
    group: 'Group Alpha',
    attempts: 1,
    bestScore: 15,
    maxScore: 20,
    bestPercentage: 75,
    completionPercentage: 100,
    timeTaken: 720,
    passed: true,
    lastAttemptAt: '2024-11-15T16:10:00Z',
  },
  {
    studentId: 4,
    studentName: 'Sarah Jenkins',
    studentEmail: 'sjenkins@eduflow.dev',
    group: 'Group Beta',
    attempts: 2,
    bestScore: 10,
    maxScore: 20,
    bestPercentage: 50,
    completionPercentage: 80,
    timeTaken: 1150,
    passed: false,
    lastAttemptAt: '2024-11-16T11:45:00Z',
  },
  {
    studentId: 5,
    studentName: 'Marcus Chen',
    studentEmail: 'mchen@eduflow.dev',
    group: 'Group Beta',
    attempts: 3,
    bestScore: 18,
    maxScore: 20,
    bestPercentage: 90,
    completionPercentage: 100,
    timeTaken: 640,
    passed: true,
    lastAttemptAt: '2024-11-16T15:20:00Z',
  },
];

export async function getAllQuizzes(): Promise<Quiz[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Quiz[]>('/quizzes/');
    return data;
  }
  await sleep(400);
  return [...mockQuizzes];
}

export async function getQuizzes(courseId: number): Promise<Quiz[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Quiz[]>(ENDPOINTS.QUIZZES.LIST(courseId));
    return data;
  }
  await sleep(400);
  return mockQuizzes.filter((q) => q.courseId === courseId);
}

export async function getQuizById(quizId: number): Promise<Quiz> {
  if (HAS_API) {
    const { data } = await apiClient.get<Quiz>(`/quizzes/${quizId}/`);
    return data;
  }
  await sleep(400);
  const quiz = mockQuizzes.find((q) => q.id === quizId);
  if (!quiz) throw new Error('Quiz not found');
  return quiz;
}

export async function getQuizQuestions(quizId: number): Promise<Question[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<Question[]>(`/quizzes/${quizId}/questions/`);
    return data;
  }
  await sleep(400);
  return mockQuestions.filter((q) => q.quizId === quizId);
}

export async function createQuiz(payload: any): Promise<Quiz> {
  if (HAS_API) {
    const { data } = await apiClient.post<Quiz>('/quizzes/', payload);
    return data;
  }
  await sleep(500);
  const newQuiz: Quiz = {
    id: Date.now(),
    courseId: payload.courseId || 1,
    courseTitle: payload.courseTitle || 'Full-Stack Web Development',
    title: payload.title,
    description: payload.description ?? null,
    timeLimit: payload.duration || payload.timeLimit || 20,
    duration: payload.duration || payload.timeLimit || 20,
    passingScore: payload.passingScore || 70,
    maxAttempts: payload.maxAttempts || payload.attemptLimit || 3,
    remainingAttempts: payload.maxAttempts || 3,
    openTime: payload.openTime || new Date().toISOString(),
    closeTime: payload.closeTime || new Date(Date.now() + 86400000 * 7).toISOString(),
    allowedGroups: payload.allowedGroups || ['Group Alpha'],
    status: 'open',
    isPublished: payload.isPublished ?? true,
    questionCount: 0,
    totalPoints: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockQuizzes.unshift(newQuiz);
  return newQuiz;
}

export async function updateQuiz(quizId: number, payload: Partial<Quiz>): Promise<Quiz> {
  if (HAS_API) {
    const { data } = await apiClient.patch<Quiz>(`/quizzes/${quizId}/`, payload);
    return data;
  }
  await sleep(400);
  const index = mockQuizzes.findIndex((q) => q.id === quizId);
  if (index === -1) throw new Error('Quiz not found');
  const updated: Quiz = {
    ...mockQuizzes[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  mockQuizzes[index] = updated;
  return updated;
}

export async function deleteQuiz(quizId: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(`/quizzes/${quizId}/`);
    return;
  }
  await sleep(400);
  mockQuizzes = mockQuizzes.filter((q) => q.id !== quizId);
  mockQuestions = mockQuestions.filter((q) => q.quizId !== quizId);
}

export async function createQuestion(quizId: number, payload: QuestionFormValues): Promise<Question> {
  if (HAS_API) {
    const { data } = await apiClient.post<Question>(`/quizzes/${quizId}/questions/`, payload);
    return data;
  }
  await sleep(400);
  const newQuestion: Question = {
    id: Date.now(),
    quizId,
    text: payload.text,
    type: payload.type,
    points: payload.points || 5,
    order: mockQuestions.filter((q) => q.quizId === quizId).length + 1,
    explanation: payload.explanation ?? null,
    options: (payload.options ?? []).map((o, idx) => ({
      id: Date.now() + idx,
      questionId: Date.now(),
      text: o.text,
      isCorrect: o.isCorrect,
      order: idx + 1,
    })),
  };
  mockQuestions.push(newQuestion);

  // Update question count on quiz
  const qz = mockQuizzes.find((q) => q.id === quizId);
  if (qz) {
    qz.questionCount = mockQuestions.filter((q) => q.quizId === quizId).length;
    qz.totalPoints += newQuestion.points;
  }
  return newQuestion;
}

export async function deleteQuestion(questionId: number): Promise<void> {
  if (HAS_API) {
    await apiClient.delete(`/questions/${questionId}/`);
    return;
  }
  await sleep(300);
  mockQuestions = mockQuestions.filter((q) => q.id !== questionId);
}

export async function extractQuestionsFromPdf(file: File): Promise<ExtractedQuestion[]> {
  // Simulate AI PDF reading and question generation
  await sleep(1800);
  const sampleExtracted: ExtractedQuestion[] = [
    {
      id: 'ext-1',
      text: 'According to the uploaded material, what is the core benefit of optimistic UI updates?',
      points: 5,
      options: [
        { id: 'opt-1-1', text: 'Improves perceived latency by rendering intended changes immediately', isCorrect: true },
        { id: 'opt-1-2', text: 'Eliminates the need for backend validation entirely', isCorrect: false },
        { id: 'opt-1-3', text: 'Automatically encrypts client local storage', isCorrect: false },
        { id: 'opt-1-4', text: 'Increases server cache storage capacity', isCorrect: false },
      ],
      explanation: 'Optimistic UI makes user interactions feel instantaneous by updating the interface before server confirmation.',
    },
    {
      id: 'ext-2',
      text: 'Which architectural strategy prevents cascading 401 unauthenticated requests across microservices?',
      points: 5,
      options: [
        { id: 'opt-2-1', text: 'Centralized silent token refresh queue with request holding', isCorrect: true },
        { id: 'opt-2-2', text: 'Sending basic authentication headers with plain text credentials', isCorrect: false },
        { id: 'opt-2-3', text: 'Clearing local storage immediately on every network failure', isCorrect: false },
        { id: 'opt-2-4', text: 'Disabling HTTPS transport layer security', isCorrect: false },
      ],
      explanation: 'A centralized request queue intercepts 401 responses, initiates a single refresh call, and retries queued calls with the refreshed bearer token.',
    },
    {
      id: 'ext-3',
      text: 'In scalable frontend architecture, what distinguishes server state from client UI state?',
      points: 5,
      options: [
        { id: 'opt-3-1', text: 'Server state is asynchronously fetched, cached, and owned remotely; client state is synchronous and transient', isCorrect: true },
        { id: 'opt-3-2', text: 'Server state cannot be persisted in browser cache', isCorrect: false },
        { id: 'opt-3-3', text: 'Client state must always be validated against a database trigger', isCorrect: false },
        { id: 'opt-3-4', text: 'They are identical concepts with different naming conventions', isCorrect: false },
      ],
      explanation: 'Server state represents remote data requiring cache invalidation (TanStack Query), while client state handles modal visibility and theme preferences (Zustand).',
    },
  ];

  return sampleExtracted;
}

export async function startQuizAttempt(quizId: number): Promise<QuizAttempt> {
  if (HAS_API) {
    const { data } = await apiClient.post<QuizAttempt>(`/quizzes/${quizId}/attempt/`);
    return data;
  }
  await sleep(400);
  return {
    id: Date.now(),
    quizId,
    studentId: 2,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    score: null,
    passed: null,
    attemptNumber: 1,
  };
}

export async function submitQuizAttempt(
  quizId: number,
  attemptId: number,
  submission: QuizSubmission
): Promise<QuizResult> {
  if (HAS_API) {
    const { data } = await apiClient.post<QuizResult>(
      `/quizzes/${quizId}/attempts/${attemptId}/submit/`,
      submission
    );
    return data;
  }
  await sleep(800);
  const questions = mockQuestions.filter((q) => q.quizId === quizId);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0) || 20;

  let earnedPoints = 0;
  const answerResults = submission.answers.map((ans) => {
    const q = questions.find((item) => item.id === ans.questionId);
    const correctOpt = q?.options.find((o) => o.isCorrect);
    const isCorrect = correctOpt ? correctOpt.id === ans.selectedOptionId : true;
    if (isCorrect) {
      earnedPoints += q?.points || 5;
    }
    return {
      questionId: ans.questionId,
      questionText: q?.text,
      selectedOptionId: ans.selectedOptionId,
      textAnswer: ans.textAnswer,
      isCorrect,
      correctOptionId: correctOpt?.id,
      correctOptionText: correctOpt?.text,
      explanation: q?.explanation,
      pointsEarned: isCorrect ? (q?.points || 5) : 0,
    };
  });

  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const quiz = mockQuizzes.find((q) => q.id === quizId);
  const passingScore = quiz?.passingScore || 70;
  const passed = percentage >= passingScore;

  // Decrease remaining attempts
  if (quiz && quiz.remainingAttempts !== undefined) {
    quiz.remainingAttempts = Math.max(0, quiz.remainingAttempts - 1);
  }

  const result: QuizResult = {
    attemptId,
    quizId,
    quizTitle: quiz?.title || 'Quiz Assessment',
    studentId: 2,
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    timeTaken: 420,
    isQuizClosed: quiz?.status === 'closed',
    answers: answerResults,
  };

  return result;
}

export async function getQuizStudentResults(quizId: number): Promise<StudentQuizResult[]> {
  if (HAS_API) {
    const { data } = await apiClient.get<StudentQuizResult[]>(`/quizzes/${quizId}/results/`);
    return data;
  }
  await sleep(500);
  return mockStudentResults;
}

export const quizService = {
  getAllQuizzes,
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  deleteQuestion,
  extractQuestionsFromPdf,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizStudentResults,
};
