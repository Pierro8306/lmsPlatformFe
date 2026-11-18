'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Users,
  Award,
  ArrowRight,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { courseService } from '@/services/course.service';
import { lessonService } from '@/services/lesson.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.id) || 1;

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['student', 'course-detail', courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ['student', 'course-lessons', courseId],
    queryFn: () => lessonService.getLessons(courseId),
  });

  const progress = course?.progress || 60;
  const completedLessonCount = Math.round((progress / 100) * lessons.length);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={course?.title || 'Course Details'}
        subtitle={`Instructed by ${course?.instructor || 'Faculty Lead'} • ${lessons.length} Modules`}
        backHref="/student/courses"
        gradientTitle
      >
        {lessons.length > 0 && (
          <Button asChild className="shadow-lg shadow-accent-indigo/25">
            <Link href={`/student/courses/${courseId}/lessons/${lessons[0].id}`}>
              <PlayCircle className="w-4 h-4 mr-1.5" />
              <span>Continue Learning</span>
            </Link>
          </Button>
        )}
      </PageHeader>

      {/* Course Overview Banner */}
      <div className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" className="text-xs">
              Enrolled Track
            </Badge>
            {course?.group && (
              <Badge variant="cyan" className="text-xs">
                {course.group}
              </Badge>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
            {course?.title}
          </h2>

          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            {course?.description}
          </p>

          {/* Progress Tracker Card */}
          <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Curriculum Progress</span>
                <span className="font-bold text-accent-cyan">{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-background-elevated" />
              <p className="text-[11px] text-text-muted">
                {completedLessonCount} of {lessons.length} lessons finished
              </p>
            </div>

            <div className="flex items-center justify-start sm:justify-end gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-indigo" />
                ~{lessons.reduce((sum, l) => sum + (l.duration || 30), 0)} mins total
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-accent-cyan" />
                Certificate track
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Outline Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-indigo" />
            Course Curriculum & Lessons
          </h3>
          <span className="text-xs text-text-muted">{lessons.length} Modules</span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isCompleted = idx < completedLessonCount;
            const isCurrent = idx === completedLessonCount;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-accent-indigo bg-accent-indigo/10 shadow-lg shadow-accent-indigo/10'
                    : 'border-border-DEFAULT bg-background-card hover:border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCompleted
                        ? 'bg-status-success/20 text-status-success border border-status-success/40'
                        : isCurrent
                        ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/30'
                        : 'bg-background-elevated text-text-muted border border-border-subtle'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary text-sm truncate">
                        {lesson.title}
                      </h4>
                      {isCurrent && (
                        <Badge variant="indigo" className="text-[10px] py-0">
                          Up Next
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      {lesson.videoUrl && (
                        <span className="flex items-center gap-1 text-accent-cyan">
                          <Video className="w-3.5 h-3.5" />
                          Video
                        </span>
                      )}
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-accent-violet">
                          <FileText className="w-3.5 h-3.5" />
                          {lesson.attachments.length} Resource(s)
                        </span>
                      )}
                      <span>{lesson.duration || 45} mins</span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <Button
                    size="sm"
                    variant={isCurrent ? 'default' : 'outline'}
                    asChild
                    className={`h-8 px-3 text-xs ${
                      !isCurrent ? 'border-border-subtle hover:border-accent-indigo' : ''
                    }`}
                  >
                    <Link href={`/student/courses/${courseId}/lessons/${lesson.id}`}>
                      <span>{isCompleted ? 'Review' : 'Open Lesson'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {lessons.length === 0 && (
            <p className="text-xs text-text-muted text-center py-10">
              No lessons have been published for this course yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
