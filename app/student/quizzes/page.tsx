'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { quizService } from '@/services/quiz.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { Quiz } from '@/types/quiz';

export default function StudentQuizzesWaitingRoomPage() {
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['student', 'quizzes'],
    queryFn: () => quizService.getAllQuizzes(),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Quizzes & Online Examination Room"
        subtitle="Review testing schedules, launch timed assessments, and view verified performance results"
        gradientTitle
      />

      {/* Guidelines Banner */}
      <div className="p-4 sm:p-5 rounded-3xl border border-accent-indigo/30 bg-accent-indigo/5 space-y-2 text-xs text-text-secondary leading-relaxed">
        <span className="font-heading font-bold text-sm text-accent-indigo flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Examination Rules & Instructions
        </span>
        <ul className="list-disc pl-5 space-y-1">
          <li>Once launched, the countdown timer cannot be paused. Tests auto-submit when the timer reaches zero.</li>
          <li>Multiple choice options are automatically randomized to prevent order bias.</li>
          <li>Leaving the exam room or refreshing the page will trigger an alert warning.</li>
          <li>Answer keys and full explanations will become accessible once the testing window closes.</li>
        </ul>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const isOpen = quiz.status === 'open';
          const isUpcoming = quiz.status === 'upcoming';
          const isClosed = quiz.status === 'closed';
          const remaining = quiz.remainingAttempts ?? 2;
          const canTake = isOpen && remaining > 0;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-6 shadow-card hover:border-accent-indigo/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      isOpen
                        ? 'success'
                        : isUpcoming
                        ? 'indigo'
                        : 'default'
                    }
                    className="capitalize text-xs font-semibold"
                  >
                    {quiz.status || 'Active'}
                  </Badge>

                  <Badge variant="cyan" className="text-xs">
                    {remaining} of {quiz.maxAttempts || 3} attempts left
                  </Badge>

                  <Badge variant="default" className="text-xs">
                    Pass: {quiz.passingScore}%
                  </Badge>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Comprehensive multiple choice testing module.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                  <span className="flex items-center gap-1.5 text-accent-cyan font-medium">
                    <Clock className="w-4 h-4" />
                    {quiz.duration || quiz.timeLimit || 20} Minutes
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    Testing Window:{' '}
                    {quiz.openTime ? format(new Date(quiz.openTime), 'MMM d, h:mm a') : 'Now'} —{' '}
                    {quiz.closeTime ? format(new Date(quiz.closeTime), 'MMM d, h:mm a') : 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                {canTake && (
                  <Button
                    size="md"
                    asChild
                    className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
                  >
                    <Link href={`/student/quizzes/${quiz.id}/exam`}>
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      <span>Start Assessment</span>
                    </Link>
                  </Button>
                )}

                {isUpcoming && (
                  <Button size="md" variant="secondary" disabled className="cursor-not-allowed">
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span>Opens Soon</span>
                  </Button>
                )}

                <Button
                  size="md"
                  variant="outline"
                  asChild
                  className="border-border-DEFAULT hover:border-accent-cyan text-text-secondary hover:text-accent-cyan"
                >
                  <Link href={`/student/quizzes/${quiz.id}/results`}>
                    <Award className="w-4 h-4 mr-1.5" />
                    <span>Results & Answers</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          );
        })}

        {quizzes.length === 0 && !isLoading && (
          <EmptyState
            icon={FileQuestion}
            title="No quizzes assigned"
            description="You are all caught up! Quizzes will appear here when assigned to your cohort."
          />
        )}
      </div>
    </div>
  );
}
