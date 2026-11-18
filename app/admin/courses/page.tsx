'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Users,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ListFilter,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { courseService } from '@/services/course.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/shared/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import type { Course } from '@/types/course';
import type { CourseFormValues } from '@/lib/validators';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'published' | 'draft'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(null);

  // Form states
  const [formTitle, setFormTitle] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formGroup, setFormGroup] = React.useState('');
  const [formPublished, setFormPublished] = React.useState(true);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => courseService.getCourses(),
  });

  const courses = coursesData?.results || [];

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CourseFormValues = {
        title: formTitle,
        description: formDescription,
        group: formGroup || null,
        isPublished: formPublished,
      };

      if (editingCourse) {
        return courseService.updateCourse(editingCourse.id, payload);
      } else {
        return courseService.createCourse(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
      handleCloseModal();
    },
    onError: () => {
      toast.error('Failed to save course. Please check inputs.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course deleted successfully');
      setCourseToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormTitle('');
    setFormDescription('');
    setFormGroup('Group Alpha');
    setFormPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDescription(course.description);
    setFormGroup(course.group || '');
    setFormPublished(course.isPublished);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? c.isPublished
        : !c.isPublished;
    return matchesSearch && matchesStatus;
  });

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        subtitle="Author curriculums, organize modular lessons, and distribute learning tracks"
        gradientTitle
      >
        <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-accent-indigo/25">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </PageHeader>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80 backdrop-blur-md">
          <p className="text-xs text-text-muted">Total Courses</p>
          <p className="text-2xl font-bold font-heading text-text-primary mt-1">{courses.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80 backdrop-blur-md">
          <p className="text-xs text-text-muted">Published Courses</p>
          <p className="text-2xl font-bold font-heading text-accent-indigo mt-1">
            {courses.filter((c) => c.isPublished).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80 backdrop-blur-md">
          <p className="text-xs text-text-muted">Total Lessons</p>
          <p className="text-2xl font-bold font-heading text-accent-cyan mt-1">{totalLessons}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80 backdrop-blur-md">
          <p className="text-xs text-text-muted">Active Enrollments</p>
          <p className="text-2xl font-bold font-heading text-status-success mt-1">{totalStudents}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background-card/60 p-3 rounded-2xl border border-border-DEFAULT">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="pl-9 bg-background-elevated/80 border-border-subtle h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center bg-background-elevated rounded-xl p-0.5 border border-border-subtle text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Drafts
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-background-elevated rounded-xl p-0.5 border border-border-subtle">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background-card text-accent-indigo'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-background-card text-accent-indigo'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-background-card/50 border border-border-DEFAULT animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search criteria or create your first learning course."
          action={{
            label: 'Create New Course',
            onClick: handleOpenCreateModal,
            icon: Plus,
          }}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border border-border-DEFAULT bg-background-card hover:border-accent-indigo/40 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Banner */}
              <div className="h-36 relative bg-gradient-to-tr from-accent-indigo/20 via-background-elevated to-accent-violet/20 p-4 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: course.coverImage ? `url(${course.coverImage})` : undefined }} />
                <div className="relative z-10 flex items-center justify-between">
                  <Badge variant={course.isPublished ? 'success' : 'default'} className="text-[11px]">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-text-secondary hover:text-text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEditModal(course)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${course.id}/lessons`}>
                          <Layers className="w-4 h-4 mr-2 text-accent-indigo" />
                          Manage Lessons
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCourseToDelete(course)}
                        className="text-status-danger focus:text-status-danger focus:bg-status-danger/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="relative z-10">
                  {course.group && (
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-accent-cyan px-2 py-0.5 rounded-md bg-black/50 border border-accent-cyan/30">
                      {course.group}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-text-primary line-clamp-1 group-hover:text-accent-indigo transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-accent-indigo" />
                      {course.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-accent-cyan" />
                      {course.enrolledCount} students
                    </span>
                  </div>

                  <Link
                    href={`/admin/courses/${course.id}/lessons`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-indigo hover:text-accent-violet transition-colors"
                  >
                    Curriculum
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border-DEFAULT bg-background-card overflow-hidden shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-background-elevated/70 border-b border-border-DEFAULT text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-5 py-3.5 font-medium">Course</th>
                <th className="px-5 py-3.5 font-medium">Group</th>
                <th className="px-5 py-3.5 font-medium">Lessons</th>
                <th className="px-5 py-3.5 font-medium">Students</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-background-elevated/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text-primary">{course.title}</p>
                    <p className="text-xs text-text-muted truncate max-w-sm">{course.description}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-text-secondary">
                    {course.group || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs">{course.lessonCount}</td>
                  <td className="px-5 py-4 text-xs">{course.enrolledCount}</td>
                  <td className="px-5 py-4">
                    <Badge variant={course.isPublished ? 'success' : 'default'} className="text-[10px]">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 text-xs text-accent-indigo hover:text-accent-indigo"
                      >
                        <Link href={`/admin/courses/${course.id}/lessons`}>
                          Lessons
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(course)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCourseToDelete(course)}
                        className="h-8 w-8 p-0 text-status-danger hover:text-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Course Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        description="Configure track curriculum details and target group enrollment."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Course Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Full-Stack Web Development with React 18"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide a comprehensive syllabus overview..."
              rows={3}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Target Cohort / Group</label>
            <Input
              value={formGroup}
              onChange={(e) => setFormGroup(e.target.value)}
              placeholder="e.g. Group Alpha (Optional)"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="course-published"
              checked={formPublished}
              onChange={(e) => setFormPublished(e.target.checked)}
              className="w-4 h-4 rounded border-border-DEFAULT bg-background-elevated text-accent-indigo focus:ring-accent-indigo"
            />
            <label htmlFor="course-published" className="text-xs font-medium text-text-primary cursor-pointer">
              Publish immediately to enrolled students
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!formTitle.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) deleteMutation.mutate(courseToDelete.id);
        }}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? All associated lessons will remain in the pool or be unassigned.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
