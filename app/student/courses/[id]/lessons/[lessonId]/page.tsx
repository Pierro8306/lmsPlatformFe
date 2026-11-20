'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Video,
  FileText,
  Download,
  Share2,
  Bookmark,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { courseService } from '@/services/course.service';
import { lessonService } from '@/services/lesson.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentLessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params.id as string) || '';
  const lessonId = (params.lessonId as string) || '';

  const [isCompleted, setIsCompleted] = React.useState(false);

  // Fetch course & lessons
  const { data: course } = useQuery({
    queryKey: ['student', 'course-detail', courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['student', 'course-lessons', courseId],
    queryFn: () => lessonService.getLessons(courseId),
  });

  const currentLesson = lessons.find((l) => String(l.id) === String(lessonId)) || lessons[0];
  const currentIndex = lessons.findIndex((l) => String(l.id) === String(lessonId));
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  React.useEffect(() => {
    if (currentLesson?.completed) {
      setIsCompleted(true);
    }
  }, [currentLesson]);

  // Video embed helper
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch')) {
        const id = new URL(url).searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return url;
    } catch {
      return null;
    }
  };

  const handleMarkComplete = async () => {
    try {
      if (currentLesson) {
        await lessonService.completeLesson(currentLesson.id);
      }
      setIsCompleted(true);
      toast.success('Lesson marked as complete! Progress saved.');
      if (nextLesson) {
        setTimeout(() => {
          router.push(`/student/courses/${courseId}/lessons/${nextLesson.id}`);
        }, 1200);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete lesson');
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(currentLesson.videoUrl || currentLesson.video_url || null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
          >
            <Link href={`/student/courses/${courseId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>

          <div>
            <p className="text-xs text-text-muted">
              {course?.title || 'Course'} • Module {currentIndex + 1} of {lessons.length}
            </p>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-text-primary">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isCompleted ? 'secondary' : 'default'}
            onClick={handleMarkComplete}
            className={
              isCompleted
                ? 'border-status-success/40 text-status-success'
                : 'bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110'
            }
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
          </Button>
        </div>
      </div>

      {/* Embedded Video Player Container */}
      {embedUrl ? (
        <div className="rounded-3xl border border-border-DEFAULT bg-black overflow-hidden shadow-2xl">
          <div className="aspect-video w-full bg-black/90 relative">
            <iframe
              src={embedUrl}
              title={currentLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl border border-border-DEFAULT bg-background-card/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Reading & Interactive Module</h3>
            <p className="text-xs text-text-secondary">
              This lesson consists of formatted lecture notes, code walk-throughs, and downloadable attachments.
            </p>
          </div>
        </div>
      )}

      {/* Formatted Text Content Body */}
      <div className="rounded-3xl border border-border-DEFAULT bg-background-card/90 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <span className="text-xs uppercase font-semibold text-text-muted tracking-wider">
            Lesson Notes & Reference
          </span>
          <span className="text-xs text-text-muted">
            Duration: {currentLesson.duration || 45} mins
          </span>
        </div>

        {/* Lesson HTML Content */}
        <div
          className="prose prose-invert max-w-none text-text-primary text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>No content provided</p>' }}
        />

        {/* Downloadable Attachments Section */}
        {currentLesson.attachments && currentLesson.attachments.length > 0 && (
          <div className="pt-6 border-t border-border-subtle space-y-3">
            <h4 className="text-xs uppercase font-semibold text-text-muted tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-accent-cyan" />
              Downloadable Attachments & Slides
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentLesson.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-2xl border border-border-subtle bg-background-elevated/70 flex items-center justify-between gap-3 hover:border-accent-indigo/40 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-xl bg-accent-violet/10 text-accent-violet shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {((att.fileSize || 1024) / 1024).toFixed(0)} KB • PDF
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.success(`Downloading ${att.name}...`);
                    }}
                    className="h-8 text-xs border-accent-indigo/30 hover:bg-accent-indigo hover:text-white shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Previous / Next Lesson Navigation Footer */}
      <div className="flex items-center justify-between gap-4 pt-4">
        {prevLesson ? (
          <Button
            variant="outline"
            asChild
            className="border-border-DEFAULT hover:border-accent-indigo"
          >
            <Link href={`/student/courses/${courseId}/lessons/${prevLesson.id}`}>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-text-muted block">Previous Module</span>
                <span className="text-xs font-semibold text-text-primary truncate max-w-[180px] block">
                  {prevLesson.title}
                </span>
              </div>
              <span className="sm:hidden">Previous</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Button
            variant="default"
            asChild
            className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
          >
            <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-white/70 block">Next Module</span>
                <span className="text-xs font-semibold text-white truncate max-w-[180px] block">
                  {nextLesson.title}
                </span>
              </div>
              <span className="sm:hidden">Next Module</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="default"
            asChild
            className="bg-status-success hover:bg-status-success/90"
          >
            <Link href={`/student/courses/${courseId}`}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Complete Course Curriculum
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
