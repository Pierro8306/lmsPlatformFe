export interface QuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: number;
  quizId: number;
  text: string;
  type: QuestionType;
  points: number;
  order: number;
  options: QuestionOption[];
  explanation: string | null;
}

export interface Quiz {
  id: number;
  courseId: number;
  courseTitle?: string;
  title: string;
  description: string | null;
  timeLimit: number | null; // in minutes
  duration?: number; // alias in minutes
  passingScore: number;
  maxAttempts: number;
  remainingAttempts?: number;
  openTime?: string;
  closeTime?: string;
  allowedGroups?: string[];
  status?: 'upcoming' | 'open' | 'closed';
  isPublished: boolean;
  questionCount: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  passed: boolean | null;
  attemptNumber: number;
}

export interface QuizResult {
  attemptId: number;
  quizId: number;
  quizTitle?: string;
  studentId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  isQuizClosed?: boolean;
  answers: QuizAnswerResult[];
}

export interface QuizAnswerResult {
  questionId: number;
  questionText?: string;
  selectedOptionId: number | null;
  textAnswer: string | null;
  isCorrect: boolean;
  correctOptionId?: number;
  correctOptionText?: string;
  explanation?: string | null;
  pointsEarned: number;
}

export interface QuizSubmission {
  quizId: number;
  answers: QuizAnswerSubmit[];
}

export interface QuizAnswerSubmit {
  questionId: number;
  selectedOptionId: number | null;
  textAnswer: string | null;
}

export interface StudentQuizResult {
  studentId: number;
  studentName: string;
  studentEmail: string;
  group?: string;
  attempts: number;
  bestScore: number;
  maxScore: number;
  bestPercentage: number;
  completionPercentage: number;
  timeTaken: number; // in seconds
  passed: boolean;
  lastAttemptAt: string;
}

export interface ExtractedQuestion {
  id: string;
  text: string;
  points: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}
