export interface QuestionOption {
  id: string | number;
  questionId?: string | number;
  text: string;
  isCorrect: boolean;
  order?: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string | number;
  quizId?: string | number;
  text: string;
  type?: QuestionType;
  points?: number;
  order?: number;
  options: QuestionOption[];
  explanation?: string | null;
  subject?: string;
}

export interface Quiz {
  id: string | number;
  courseId?: string | number;
  courseTitle?: string;
  title: string;
  description: string | null;
  timeLimit: number | string | null; // minutes or "HH:mm:ss"
  duration?: number; // alias in minutes
  passingScore?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
  attemptsUsed?: number;
  attemptCount?: number;
  openTime?: string;
  closeTime?: string;
  startTime?: string;
  endTime?: string;
  userGroup?: string | null;
  allowedGroups?: string[];
  status?: 'upcoming' | 'open' | 'closed' | 'UPCOMING' | 'OPEN' | 'CLOSED';
  isPublished?: boolean;
  questionCount?: number;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  id: string | number;
  quizId: string | number;
  studentId?: string | number;
  startedAt: string;
  deadline?: string;
  submittedAt?: string | null;
  score?: number | null;
  passed?: boolean | null;
  attemptNumber?: number;
}

export interface QuizResult {
  attemptId: string | number;
  quizId: string | number;
  quizTitle?: string;
  studentId?: string | number;
  score: number;
  points?: number;
  totalPoints: number;
  totalQuestions?: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  isQuizClosed?: boolean;
  answers: QuizAnswerResult[];
  correct?: { id_question: string; id_answer: string }[];
}

export interface QuizAnswerResult {
  questionId: string | number;
  questionText?: string;
  selectedOptionId: string | number | null;
  textAnswer?: string | null;
  isCorrect: boolean;
  correctOptionId?: string | number;
  correctOptionText?: string;
  explanation?: string | null;
  pointsEarned: number;
}

export interface QuizSubmission {
  quizId: string | number;
  answers: QuizAnswerSubmit[];
}

export interface QuizAnswerSubmit {
  questionId: string | number;
  selectedOptionId: string | number | null;
  textAnswer?: string | null;
}

export interface StudentQuizResult {
  studentId?: string | number;
  studentName?: string;
  studentEmail?: string;
  username?: string;
  group?: string;
  attempts?: number;
  bestScore?: number;
  points?: number;
  maxScore?: number;
  totalQuestions?: number;
  bestPercentage?: number;
  completionPercentage?: number;
  timeTaken?: number | string; // in seconds or HH:mm:ss
  passed?: boolean;
  status?: string;
  lastAttemptAt?: string;
  startedAt?: string;
  submittedAt?: string;
}

export interface ExtractedQuestion {
  id: string;
  text: string;
  points: number;
  subject?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}
