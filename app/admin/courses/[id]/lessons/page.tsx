'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '@/services/course.service';
import { lessonService } from '@/services/lesson.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import { FileUpload } from '@/components/ui/file-upload';
import type { Lesson } from '@/types/course';
import type { LessonFormValues } from '@/lib/validators';

export default function AdminCourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = (params.id as string) || '';

  // Active tab in this screen: "Curriculum" vs "Dual-List Assignment"
  const [activeTab, setActiveTab] = React.useState<'curriculum' | 'assignment'>('curriculum');

  // Modal editor states
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = React.useState<Lesson | null>(null);

  // Form states
  const [formTitle, setFormTitle] = React.useState('');
  const [formContent, setFormContent] = React.useState('');
  const [formVideoUrl, setFormVideoUrl] = React.useState('');
  const [formDuration, setFormDuration] = React.useState<number>(45);
  const [formPublished, setFormPublished] = React.useState(true);
  const [uploadedAttachmentName, setUploadedAttachmentName] = React.useState<string | null>(null);

  // Fetch Course details
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  // Fetch Lessons for this course
  const { data: courseLessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ['admin', 'course-lessons', courseId],
    queryFn: () => lessonService.getLessons(courseId),
  });

  // Fetch all lessons (for dual-list pool)
  const { data: allLessons = [] } = useQuery({
    queryKey: ['admin', 'all-lessons'],
    queryFn: () => lessonService.getAllLessons(),
  });

  // Available lessons in the pool that are not assigned to this course
  const unassignedLessons = allLessons.filter(
    (l) => String(l.courseId) !== String(courseId)
  );

  // Lesson Save mutation (create/edit)
  const saveLessonMutation = useMutation({
    mutationFn: async () => {
      const payload: LessonFormValues = {
        title: formTitle,
        content: formContent,
        videoUrl: formVideoUrl || null,
        duration: formDuration || 30,
        isPublished: formPublished,
      };

      if (editingLesson) {
        return lessonService.updateLesson(courseId, editingLesson.id, payload);
      } else {
        return lessonService.createLesson(courseId, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(editingLesson ? 'Lesson updated successfully' : 'Lesson created successfully');
      handleCloseEditor();
    },
    onError: () => {
      toast.error('Failed to save lesson');
    },
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: string | number) => lessonService.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-lessons'] });
      toast.success('Lesson deleted successfully');
      setLessonToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete lesson');
    },
  });

  // Dual list assignment mutations
  const assignMutation = useMutation({
    mutationFn: (lessonId: string | number) => lessonService.assignLessonToCourse(lessonId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-lessons'] });
      toast.success('Lesson added to course curriculum');
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (lessonId: string | number) => lessonService.assignLessonToCourse(lessonId, null, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-lessons'] });
      toast.info('Lesson returned to available pool');
    },
  });

  // Reorder mutation
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const newItems = [...courseLessons];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const orderedIds = newItems.map((l) => l.id);
    lessonService.reorderLessons(courseId, orderedIds);
    queryClient.setQueryData(['admin', 'course-lessons', courseId], newItems);
    toast.success('Curriculum sequence updated');
  };

  const handleOpenCreateEditor = () => {
    setEditingLesson(null);
    setFormTitle('');
    setFormContent('<h2>Lesson Overview</h2><p>Provide detailed notes and step-by-step instructions for students...</p>');
    setFormVideoUrl('https://www.youtube.com/watch?v=dGcsHMXbSOA');
    setFormDuration(45);
    setFormPublished(true);
    setUploadedAttachmentName(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditEditor = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormTitle(lesson.title);
    setFormContent(lesson.content || '');
    setFormVideoUrl(lesson.videoUrl || '');
    setFormDuration(lesson.duration || 45);
    setFormPublished(!!lesson.isPublished);
    setUploadedAttachmentName(lesson.attachments?.[0]?.name || null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingLesson(null);
  };

  // Helper to extract YouTube video ID for preview
  const getEmbedUrl = (url: string) => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={course?.title || 'Course Curriculum'}
        subtitle={`Organize lessons, author rich media content, and assign modules`}
        backHref="/admin/courses"
        gradientTitle
      >
        <div className="flex items-center gap-2">
          {/* View mode pill */}
          <div className="flex items-center bg-background-elevated rounded-xl p-0.5 border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'curriculum'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Curriculum Editor
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'assignment'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Assignment UI (Dual-List)
            </button>
          </div>

          <Button onClick={handleOpenCreateEditor} className="shadow-lg shadow-accent-indigo/25">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lesson
          </Button>
        </div>
      </PageHeader>

      {/* Mode 1: Curriculum List & Direct Re-ordering */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-text-secondary px-1">
            <span>
              Curriculum contains{' '}
              <strong className="text-text-primary">{courseLessons.length}</strong> sequential lessons
            </span>
            <span>Use Up/Down arrows to reorder sequence</span>
          </div>

          <div className="space-y-3">
            {courseLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/90 hover:border-accent-indigo/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-background-elevated border border-border-subtle flex items-center justify-center font-bold text-xs text-accent-indigo shrink-0">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary text-sm truncate">
                        {lesson.title}
                      </h4>
                      <Badge variant={lesson.isPublished ? 'success' : 'default'} className="text-[10px] py-0">
                        {lesson.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      {lesson.videoUrl && (
                        <span className="flex items-center gap-1 text-accent-cyan">
                          <Video className="w-3.5 h-3.5" />
                          Video Attached
                        </span>
                      )}
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-accent-violet">
                          <FileText className="w-3.5 h-3.5" />
                          {lesson.attachments.length} Document(s)
                        </span>
                      )}
                      {lesson.duration && <span>{lesson.duration} mins</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Sequence Reorder buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveLesson(index, 'up')}
                    className="h-8 w-8 p-0 text-text-muted hover:text-text-primary disabled:opacity-30"
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === courseLessons.length - 1}
                    onClick={() => moveLesson(index, 'down')}
                    className="h-8 w-8 p-0 text-text-muted hover:text-text-primary disabled:opacity-30"
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>

                  <div className="w-[1px] h-4 bg-border-DEFAULT mx-1" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditEditor(lesson)}
                    className="h-8 w-8 p-0 text-text-secondary hover:text-text-primary"
                    title="Edit Lesson"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLessonToDelete(lesson)}
                    className="h-8 w-8 p-0 text-status-danger hover:text-status-danger"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {courseLessons.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border-DEFAULT bg-background-card/30">
                <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-primary">No lessons in this course yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Click &quot;Add Lesson&quot; or switch to the Assignment tab to assign available modules.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: DUAL-LIST ASSIGNMENT INTERFACE */}
      {activeTab === 'assignment' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-accent-indigo/30 bg-accent-indigo/5 text-xs text-text-secondary leading-relaxed flex items-center justify-between">
            <div>
              <strong className="text-accent-indigo font-semibold block mb-0.5">
                Dual-List Module Assignment
              </strong>
              Add available lessons to this course or unassign existing modules back to the general lesson repository.
            </div>
            <Badge variant="indigo" className="text-xs">
              Interactive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Available Lessons Pool */}
            <div className="rounded-2xl border border-border-DEFAULT bg-background-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    Available Lesson Pool
                  </h3>
                  <p className="text-xs text-text-muted">Unassigned or other modular lessons</p>
                </div>
                <Badge variant="default" className="text-xs">
                  {unassignedLessons.length} Available
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {unassignedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-xl border border-border-subtle bg-background-elevated/70 hover:border-accent-indigo/40 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        Duration: {lesson.duration || 30} mins
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => assignMutation.mutate(lesson.id)}
                      disabled={assignMutation.isPending}
                      className="shrink-0 h-8 text-xs border-accent-indigo/30 hover:bg-accent-indigo hover:text-white"
                    >
                      <span>Add</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}

                {unassignedLessons.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-8">
                    No unassigned lessons currently available in pool.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Assigned to this Course */}
            <div className="rounded-2xl border border-border-DEFAULT bg-background-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    Course Curriculum
                  </h3>
                  <p className="text-xs text-text-muted">Currently assigned to &quot;{course?.title}&quot;</p>
                </div>
                <Badge variant="indigo" className="text-xs">
                  {courseLessons.length} Enrolled
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {courseLessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-xl border border-accent-indigo/30 bg-accent-indigo/10 hover:border-accent-indigo/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-accent-indigo/20 text-accent-indigo text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {lesson.duration || 30} mins
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unassignMutation.mutate(lesson.id)}
                      disabled={unassignMutation.isPending}
                      className="shrink-0 h-8 text-xs text-status-danger hover:bg-status-danger/10"
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5 mr-1" />
                      <span>Remove</span>
                    </Button>
                  </div>
                ))}

                {courseLessons.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-8">
                    Curriculum is empty. Click &quot;Add&quot; from the available pool on the left.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL LESSON AUTHORING MODAL */}
      <Modal
        open={isEditorOpen}
        onClose={handleCloseEditor}
        title={editingLesson ? 'Edit Lesson Content' : 'Author New Lesson'}
        description="Write rich-text instructions, embed video links, and attach downloadable files."
        size="xl"
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Lesson Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Mastering React 18 Concurrent Rendering"
            />
          </div>

          {/* Duration & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Duration (Minutes)</label>
              <Input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                min={5}
                max={300}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="lesson-published"
                checked={formPublished}
                onChange={(e) => setFormPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border-DEFAULT bg-background-elevated text-accent-indigo"
              />
              <label htmlFor="lesson-published" className="text-xs font-medium text-text-primary cursor-pointer">
                Publish lesson immediately
              </label>
            </div>
          </div>

          {/* Video URL & Live Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
              Video Lesson Link (YouTube or Direct MP4)
            </label>
            <Input
              value={formVideoUrl}
              onChange={(e) => setFormVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />

            {/* Live Video Preview Box */}
            {getEmbedUrl(formVideoUrl) && (
              <div className="rounded-2xl border border-border-DEFAULT bg-background-elevated/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1.5 text-accent-cyan font-medium">
                    <Video className="w-3.5 h-3.5" /> Live Video Preview
                  </span>
                  <a
                    href={formVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                  >
                    Open link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-border-subtle">
                  <iframe
                    src={getEmbedUrl(formVideoUrl) || ''}
                    title="Video Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rich-Text Content Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Rich-Text Formatted Lesson Content
            </label>
            <RichTextEditor
              content={formContent}
              onChange={(html) => setFormContent(html)}
              placeholder="Write detailed lesson curriculum notes, code snippets, and explanations..."
              minHeight="220px"
            />
          </div>

          {/* Document Attachment Upload */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
              Document Attachment (PDF or Resource Slides)
            </label>
            {uploadedAttachmentName ? (
              <div className="p-3 rounded-xl border border-status-success/30 bg-status-success/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>{uploadedAttachmentName}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadedAttachmentName(null)}
                  className="h-7 text-xs text-status-danger"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <FileUpload
                onFileSelect={(file) => {
                  setUploadedAttachmentName(file.name);
                  toast.success(`Attached ${file.name}`);
                }}
                helperText="Upload reference PDF, slides, or cheatsheet (Max 10MB)"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleCloseEditor}>
              Cancel
            </Button>
            <Button
              onClick={() => saveLessonMutation.mutate()}
              disabled={!formTitle.trim() || saveLessonMutation.isPending}
            >
              {saveLessonMutation.isPending
                ? 'Saving...'
                : editingLesson
                ? 'Update Lesson'
                : 'Create Lesson'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!lessonToDelete}
        onClose={() => setLessonToDelete(null)}
        onConfirm={() => {
          if (lessonToDelete) deleteMutation.mutate(lessonToDelete.id);
        }}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${lessonToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Lesson"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
