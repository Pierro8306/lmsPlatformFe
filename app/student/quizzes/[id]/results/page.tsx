'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Lock,
  Unlock,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { quizService } from '@/services/quiz.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizResult } from '@/types/quiz';

export default function StudentQuizResultsPage() {
  const params = useParams();
  const quizId = Number(params.id) || 1;

  // Demo toggle: preview closed state answers
  const [demoForceClosed, setDemoForceClosed] = React.useState(false);

  // Fetch quiz details
  const { data: quiz } = useQuery({
    queryKey: ['student', 'quiz-detail', quizId],
    queryFn: () => quizService.getQuizById(quizId),
  });

  // Fetch student's latest result (or simulated result)
  const { data: result, isLoading } = useQuery({
    queryKey: ['student', 'quiz-result', quizId],
    queryFn: async (): Promise<QuizResult> => {
      // Simulate submitted attempt result
      const questions = await quizService.getQuizQuestions(quizId);
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0) || 20;
      const earned = Math.round(totalPoints * 0.85);

      return {
        attemptId: 101,
        quizId,
        quizTitle: quiz?.title || 'Assessment Result',
        studentId: 2,
        score: earned,
        totalPoints,
        percentage: 85,
        passed: true,
        timeTaken: 512,
        isQuizClosed: quiz?.status === 'closed',
        answers: questions.map((q, idx) => {
          const correctOpt = q.options.find((o) => o.isCorrect) || q.options[0];
          const isCorrect = idx !== 1; // sample: second question missed
          const selected = isCorrect ? correctOpt : q.options.find((o) => !o.isCorrect) || q.options[1];

          return {
            questionId: q.id,
            questionText: q.text,
            selectedOptionId: selected?.id || null,
            textAnswer: null,
            isCorrect,
            correctOptionId: correctOpt?.id,
            correctOptionText: correctOpt?.text,
            explanation: q.explanation,
            pointsEarned: isCorrect ? q.points : 0,
          };
        }),
      };
    },
  });

  const isClosed = demoForceClosed || quiz?.status === 'closed';

  if (!result) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <PageHeader
        title="Assessment Evaluation & Performance"
        subtitle={`Exam: ${quiz?.title || 'Quiz'} • Verified Results`}
        backHref="/student/quizzes"
        gradientTitle
      >
        {/* Reviewer / Demo Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDemoForceClosed(!demoForceClosed)}
          className="text-xs border-accent-indigo/40 hover:bg-accent-indigo/10"
        >
          {isClosed ? <Unlock className="w-3.5 h-3.5 mr-1 text-accent-cyan" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
          <span>{isClosed ? 'Exam Closed (Answers Unlocked)' : 'Toggle Closed State (Unlock Keys)'}</span>
        </Button>
      </PageHeader>

      {/* Main Score Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl space-y-6"
      >
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-accent-indigo/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-status-success/15 border border-status-success/40 items-center justify-center text-status-success mx-auto shadow-lg shadow-status-success/15">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={result.passed ? 'success' : 'danger'} className="text-xs py-0.5 px-3">
                {result.passed ? 'PASSED EXAMINATION' : 'NEEDS IMPROVEMENT'}
              </Badge>
            </div>

            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-text-primary tracking-tight">
              {result.percentage}%
            </h2>

            <p className="text-sm text-text-secondary mt-1">
              Final Score: <strong className="text-accent-cyan font-mono">{result.score}</strong> / {result.totalPoints} Points
            </p>
          </div>

          {/* Metrics Row */}
          <div className="pt-6 border-t border-border-subtle max-w-lg mx-auto grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-text-muted block mb-0.5">Time Spent</span>
              <strong className="text-text-primary font-mono">{minutes}m {seconds}s</strong>
            </div>
            <div>
              <span className="text-text-muted block mb-0.5">Passing Score</span>
              <strong className="text-text-primary font-mono">{quiz?.passingScore || 70}%</strong>
            </div>
            <div>
              <span className="text-text-muted block mb-0.5">Completion</span>
              <strong className="text-status-success font-mono">100%</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answer Key Disclosure Notice */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-3 ${
        isClosed
          ? 'border-status-success/30 bg-status-success/5 text-text-secondary'
          : 'border-status-warning/30 bg-status-warning/5 text-text-secondary'
      }`}>
        <div className="flex items-center gap-2.5">
          {isClosed ? (
            <Unlock className="w-5 h-5 text-status-success shrink-0" />
          ) : (
            <Lock className="w-5 h-5 text-status-warning shrink-0" />
          )}
          <div>
            <strong className={`block font-semibold ${isClosed ? 'text-status-success' : 'text-status-warning'}`}>
              {isClosed ? 'Testing Window Closed — Correct Answers Unlocked' : 'Correct Answers Protected (Exam Window Active)'}
            </strong>
            <span>
              {isClosed
                ? 'The examination window has officially concluded. Full correct solutions and pedagogical explanations are revealed below.'
                : 'Per academic security policy, correct answers and detailed explanations will be visible after the quiz testing window closes.'}
            </span>
          </div>
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
          <span>Question Performance Review</span>
          <span className="text-xs text-text-muted font-normal">({result.answers.length} Questions)</span>
        </h3>

        <div className="space-y-4">
          {result.answers.map((ans, idx) => (
            <div
              key={ans.questionId}
              className={`p-5 rounded-2xl border transition-all ${
                ans.isCorrect
                  ? 'border-border-DEFAULT bg-[#151923]'
                  : 'border-status-danger/30 bg-status-danger/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-background-elevated text-xs font-bold flex items-center justify-center shrink-0 text-text-muted mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">
                      {ans.questionText || `Question ${idx + 1}`}
                    </h4>
                    <span className="text-[11px] text-text-muted font-mono">
                      Earned: {ans.pointsEarned} Points
                    </span>
                  </div>
                </div>

                <Badge variant={ans.isCorrect ? 'success' : 'danger'} className="text-[11px] py-0 shrink-0">
                  {ans.isCorrect ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Incorrect
                    </span>
                  )}
                </Badge>
              </div>

              {/* Revealed solutions if closed */}
              {isClosed ? (
                <div className="space-y-2.5 pl-8 pt-2 border-t border-border-subtle text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px] mb-0.5">Correct Answer:</span>
                    <p className="font-medium text-status-success bg-status-success/10 px-3 py-1.5 rounded-xl border border-status-success/20">
                      {ans.correctOptionText || 'Verified Correct Solution'}
                    </p>
                  </div>

                  {ans.explanation && (
                    <div className="p-3 rounded-xl bg-background-elevated/70 border border-border-subtle text-text-secondary text-[11px]">
                      <strong className="text-text-primary block mb-0.5">Pedagogical Explanation:</strong>
                      {ans.explanation}
                    </div>
                  )}
                </div>
              ) : (
                <p className="pl-8 text-[11px] text-text-muted italic">
                  Correct answer and solution will unlock when the exam closes.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <Button variant="outline" asChild className="border-border-DEFAULT hover:border-accent-indigo">
          <Link href="/student/quizzes">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Examination Room
          </Link>
        </Button>
      </div>
    </div>
  );
}
