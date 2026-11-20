'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { quizService } from '@/services/quiz.service';
import { Countdown } from '@/components/ui/countdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import type { Question, QuestionOption, QuizSubmission } from '@/types/quiz';

interface ShuffledQuestion extends Question {
  shuffledOptions: QuestionOption[];
}

export default function StudentOnlineExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = (params.id as string) || '';

  // Active question index
  const [currentIdx, setCurrentIdx] = React.useState<number>(0);

  // User state: Map of questionId -> selectedOptionId
  const [answers, setAnswers] = React.useState<Record<string, string | number>>({});

  // Flagged questions for review: Set of questionIds
  const [flagged, setFlagged] = React.useState<Set<string | number>>(new Set());

  // Confirm submit modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

  // Time expired state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch quiz details
  const { data: quiz } = useQuery({
    queryKey: ['student', 'quiz-detail', quizId],
    queryFn: () => quizService.getQuizById(quizId),
  });

  // Start attempt and fetch questions from server
  const { data: attemptData } = useQuery({
    queryKey: ['student', 'start-quiz', quizId],
    queryFn: () => quizService.startQuizAttempt(quizId),
    staleTime: Infinity,
  });

  // Shuffled questions (Options shuffled on initial load to prevent cheat sheets)
  const [questions, setQuestions] = React.useState<ShuffledQuestion[]>([]);

  React.useEffect(() => {
    const rawQuestions = attemptData?.questions || [];
    if (rawQuestions.length > 0 && questions.length === 0) {
      const prepared: ShuffledQuestion[] = rawQuestions.map((q) => {
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        return {
          ...q,
          shuffledOptions: shuffled,
        };
      });
      setQuestions(prepared);
    }
  }, [attemptData, questions.length]);

  // Page leave warning listener (beforeunload)
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active exam in progress. Leaving will submit or forfeit your answers.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Submit assessment mutation
  const submitExam = async (autoExpire: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (autoExpire) {
        toast.warning('Time limit expired! Automatically finalizing exam submission.');
      } else {
        toast.info('Submitting answers for grading...');
      }

      const submissionPayload: QuizSubmission = {
        quizId,
        answers: Object.entries(answers).map(([qId, optId]) => ({
          questionId: qId,
          selectedOptionId: optId,
          textAnswer: null,
        })),
      };

      await quizService.submitQuizAttempt(quizId, attemptData?.id || Date.now(), submissionPayload);
      toast.success('Exam successfully graded!');
      router.push(`/student/quizzes/${quizId}/results`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit exam. Please try again.');
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const toggleFlag = (qId: string | number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
        toast.info('Removed flag for review');
      } else {
        next.add(qId);
        toast.warning('Flagged question for review');
      }
      return next;
    });
  };

  const handleSelectOption = (qId: string | number, optId: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [String(qId)]: optId,
    }));
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted">Initializing secure exam room...</span>
        </div>
      </div>
    );
  }

  const durationSeconds = Number(quiz?.duration || quiz?.timeLimit || 20) * 60;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Sticky Countdown Header */}
      <div className="sticky top-20 z-40 rounded-2xl border border-border-DEFAULT bg-[#151923]/95 backdrop-blur-xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-status-danger animate-ping" />
          <div>
            <h2 className="font-heading font-bold text-sm text-text-primary truncate">
              {quiz?.title || 'Online Examination Room'}
            </h2>
            <p className="text-[11px] text-text-muted">
              Auto-submits when timer expires • Options shuffled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Sticky Countdown Timer */}
          <Countdown
            initialSeconds={durationSeconds}
            onExpire={() => submitExam(true)}
            size="md"
            variant="badge"
            showIcon={true}
          />

          <Button
            size="sm"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Finish & Submit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Question Area */}
        <div className="lg:col-span-3 space-y-5">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-6 sm:p-8 shadow-card space-y-6"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-accent-indigo">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-xs text-text-muted">• {currentQ.points} Points</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleFlag(currentQ.id)}
                className={`h-8 px-2.5 text-xs ${
                  flagged.has(currentQ.id)
                    ? 'text-status-warning bg-status-warning/10'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Flag className="w-3.5 h-3.5 mr-1" />
                <span>{flagged.has(currentQ.id) ? 'Flagged' : 'Flag Question'}</span>
              </Button>
            </div>

            {/* Question Text */}
            <p className="text-base sm:text-lg font-medium text-text-primary leading-relaxed">
              {currentQ.text}
            </p>

            {/* Shuffled Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.shuffledOptions.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === opt.id;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                      isSelected
                        ? 'border-accent-indigo bg-accent-indigo/15 shadow-md shadow-accent-indigo/10'
                        : 'border-border-DEFAULT bg-background-elevated/50 hover:border-border-subtle hover:bg-background-elevated'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-accent-indigo text-white'
                          : 'bg-background-card text-text-muted border border-border-subtle'
                      }`}
                    >
                      {letter}
                    </div>

                    <span className="text-sm font-medium text-text-primary flex-1">
                      {opt.text}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-accent-indigo shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="border-border-DEFAULT hover:border-accent-indigo"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="text-xs text-text-muted">
                {answers[currentQ.id] ? (
                  <span className="text-status-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Answer Saved
                  </span>
                ) : (
                  <span>Select an option to answer</span>
                )}
              </span>

              {currentIdx < questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="bg-accent-indigo hover:bg-accent-violet"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="bg-status-success hover:bg-status-success/90"
                >
                  Review & Submit
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right col: QUESTION NAVIGATOR PANEL */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-5 space-y-4 shadow-card">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
              Question Navigator
            </h3>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged.has(q.id);
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all relative flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-accent-indigo bg-accent-indigo text-white shadow-md shadow-accent-indigo/30'
                        : isFlagged
                        ? 'border border-status-warning bg-status-warning/20 text-status-warning'
                        : isAnswered
                        ? 'bg-status-success/15 border border-status-success/40 text-status-success'
                        : 'bg-background-elevated border border-border-subtle text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-status-warning" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-3 border-t border-border-subtle text-[11px] text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-status-success/20 border border-status-success/40" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-status-warning/20 border border-status-warning" />
                <span>Flagged for Review ({flagged.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-background-elevated border border-border-subtle" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM BEFORE SUBMIT MODAL */}
      <Modal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Ready to Submit Exam?"
        description="Please verify your answers before final evaluation."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-background-elevated border border-border-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Total Questions:</span>
              <strong className="text-text-primary">{questions.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-status-success">Questions Answered:</span>
              <strong className="text-status-success">{answeredCount}</strong>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between text-status-danger font-medium">
                <span>Unanswered Questions:</span>
                <strong>{unansweredCount}</strong>
              </div>
            )}
            {flagged.size > 0 && (
              <div className="flex items-center justify-between text-status-warning">
                <span>Flagged for Review:</span>
                <strong>{flagged.size}</strong>
              </div>
            )}
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You have unanswered questions. Unanswered items score zero points.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Back to Exam
            </Button>
            <Button
              onClick={() => {
                setIsConfirmModalOpen(false);
                submitExam(false);
              }}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
            >
              {isSubmitting ? 'Grading...' : 'Yes, Confirm & Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
