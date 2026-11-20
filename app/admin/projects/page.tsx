'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Clock,
  Github,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Award,
  Users,
  ChevronRight,
  Send,
  MessageSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { projectService } from '@/services/project.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import type { Project, ProjectSubmission } from '@/types/project';
import type { ProjectFormValues } from '@/lib/validators';

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Project Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

  // Submissions & Grading Drawer state
  const [selectedProjectForSubmissions, setSelectedProjectForSubmissions] = React.useState<Project | null>(null);
  const [gradingSubmission, setGradingSubmission] = React.useState<ProjectSubmission | null>(null);
  const [gradeScore, setGradeScore] = React.useState<number | string>(10);
  const [gradeFeedback, setGradeFeedback] = React.useState('');
  const [gradeStatus, setGradeStatus] = React.useState<'graded' | 'resubmit'>('graded');

  // Form states for creating/editing project
  const [formTitle, setFormTitle] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formRequirements, setFormRequirements] = React.useState('');
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );
  const [formAllowLate, setFormAllowLate] = React.useState(true);

  // Queries
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => projectService.getAllProjects(),
  });

  const { data: submissions = [], isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ['admin', 'project-submissions', selectedProjectForSubmissions?.id],
    queryFn: () =>
      selectedProjectForSubmissions
        ? projectService.getSubmissions(selectedProjectForSubmissions.id)
        : Promise.resolve([]),
    enabled: !!selectedProjectForSubmissions,
  });

  // Create / Update project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      const payload: ProjectFormValues = {
        title: formTitle,
        description: formDescription,
        requirements: formRequirements,
        dueDate: formDueDate ? new Date(formDueDate).toISOString() : null,
        maxScore: 10,
        allowLateSubmission: formAllowLate,
        isPublished: true,
      };

      if (editingProject) {
        return projectService.updateProject(editingProject.id, payload);
      } else {
        return projectService.createProject(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast.success(editingProject ? 'Project updated successfully' : 'Project assigned successfully');
      handleCloseProjectModal();
    },
    onError: () => {
      toast.error('Failed to save project');
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string | number) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast.success('Project deleted');
      setProjectToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: async () => {
      if (!gradingSubmission || !selectedProjectForSubmissions) return;
      const numScore = Number(gradeScore);
      if (isNaN(numScore) || numScore < 0 || numScore > 10) {
        throw new Error('Score must be between 0 and 10');
      }
      return projectService.gradeSubmission(gradingSubmission.id, {
        score: numScore,
        feedback: gradeFeedback,
        status: gradeStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'project-submissions', selectedProjectForSubmissions?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast.success('Grade and feedback submitted successfully');
      setGradingSubmission(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit grade');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormDescription('');
    setFormRequirements('1. Architecture design\n2. Strict TypeScript\n3. GitHub PR link');
    setFormDueDate(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
    setFormAllowLate(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormDescription(project.description);
    setFormRequirements(project.requirements || '');
    setFormDueDate(
      project.dueDate
        ? new Date(project.dueDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setFormAllowLate(!!project.allowLateSubmission);
    setIsCreateModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsCreateModalOpen(false);
    setEditingProject(null);
  };

  const handleOpenGrading = (sub: ProjectSubmission) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score !== null ? sub.score : 9.0);
    setGradeFeedback(sub.feedback || 'Great implementation of core features. Code structure is clean.');
    setGradeStatus(sub.status === 'resubmit' ? 'resubmit' : 'graded');
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Assignments & Grading"
        subtitle="Create milestone projects, inspect student GitHub repositories, and evaluate submissions"
        gradientTitle
      >
        <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-accent-indigo/25">
          <Plus className="w-4 h-4 mr-1.5" />
          Assign New Project
        </Button>
      </PageHeader>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-background-card/60 p-3 rounded-2xl border border-border-DEFAULT">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 bg-background-elevated/80 border-border-subtle h-9 text-xs"
          />
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-primary">{filteredProjects.length}</strong> active projects
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-60 rounded-2xl bg-background-card/50 border border-border-DEFAULT animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects assigned yet"
          description="Create your first coding assignment to start receiving student GitHub submissions."
          action={{
            label: 'Assign Project',
            onClick: handleOpenCreateModal,
            icon: Plus,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isOverdue = project.dueDate ? new Date() > new Date(project.dueDate) : false;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl border border-border-DEFAULT bg-background-card hover:border-accent-indigo/40 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-accent-indigo/10 border border-accent-indigo/30 text-accent-indigo">
                      <FolderGit2 className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(project)}
                        className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProjectToDelete(project)}
                        className="h-8 w-8 p-0 text-status-danger hover:text-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-accent-indigo transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Deadline pill */}
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span className={isOverdue ? 'text-status-danger font-medium' : 'text-text-secondary'}>
                      {project.dueDate
                        ? `${isOverdue ? 'Closed' : 'Due'}: ${format(new Date(project.dueDate), 'MMM d, yyyy h:mm a')}`
                        : 'No deadline'}
                    </span>
                    {isOverdue && (
                      <Badge variant="danger" className="text-[10px] py-0">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent-cyan" />
                    {project.submissionCount} submissions
                  </span>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setSelectedProjectForSubmissions(project)}
                    className="h-8 px-3 text-xs bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110"
                  >
                    <span>Review Submissions</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      <Modal
        open={isCreateModalOpen}
        onClose={handleCloseProjectModal}
        title={editingProject ? 'Edit Project' : 'Assign New Project'}
        description="Set project instructions, requirements, and submission deadline."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Project Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Full-Stack E-Commerce Platform"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Overview of the project goals..."
              rows={3}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Acceptance Criteria / Requirements
            </label>
            <textarea
              value={formRequirements}
              onChange={(e) => setFormRequirements(e.target.value)}
              placeholder="List specific technical requirements (one per line)..."
              rows={3}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Submission Deadline (Date & Time)
            </label>
            <Input
              type="datetime-local"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="bg-background-elevated"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="allow-late"
              checked={formAllowLate}
              onChange={(e) => setFormAllowLate(e.target.checked)}
              className="w-4 h-4 rounded border-border-DEFAULT bg-background-elevated text-accent-indigo"
            />
            <label htmlFor="allow-late" className="text-xs font-medium text-text-primary cursor-pointer">
              Allow late submissions with &quot;Late&quot; indicator badge
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleCloseProjectModal}>
              Cancel
            </Button>
            <Button
              onClick={() => saveProjectMutation.mutate()}
              disabled={!formTitle.trim() || saveProjectMutation.isPending}
            >
              {saveProjectMutation.isPending ? 'Saving...' : editingProject ? 'Update Project' : 'Assign Project'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* SUBMISSIONS & GRADING MODAL/DRAWER */}
      <Modal
        open={!!selectedProjectForSubmissions}
        onClose={() => {
          setSelectedProjectForSubmissions(null);
          setGradingSubmission(null);
        }}
        title={`Submissions: ${selectedProjectForSubmissions?.title || ''}`}
        description="Inspect submitted GitHub code repositories, deployment previews, and assign 0–10 score."
        size="xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Submissions Table */}
          <div className="rounded-2xl border border-border-DEFAULT bg-background-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-background-elevated/70 border-b border-border-DEFAULT text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">GitHub Link</th>
                  <th className="px-4 py-3">Score (0-10)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {submissions.map((sub) => {
                  const isLate = sub.status === 'late';

                  return (
                    <tr key={sub.id} className="hover:bg-background-elevated/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-text-primary text-xs">{sub.studentName}</p>
                        <p className="text-[11px] text-text-muted">{sub.studentEmail}</p>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-text-secondary">
                        {format(new Date(sub.submittedAt), 'MMM d, h:mm a')}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              sub.status === 'graded'
                                ? 'success'
                                : sub.status === 'late'
                                ? 'danger'
                                : 'indigo'
                            }
                            className="text-[10px] capitalize py-0"
                          >
                            {sub.status}
                          </Badge>
                          {isLate && (
                            <Badge variant="danger" className="text-[9px] py-0 px-1">
                              Late
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <a
                          href={sub.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent-indigo hover:text-accent-violet hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>View Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs">
                        {sub.score !== null ? (
                          <span className="font-bold text-accent-cyan">{sub.score} / 10</span>
                        ) : (
                          <span className="text-text-muted">Ungraded</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenGrading(sub)}
                          className="h-7 text-xs border-accent-indigo/40 hover:bg-accent-indigo hover:text-white"
                        >
                          <Award className="w-3.5 h-3.5 mr-1" />
                          {sub.score !== null ? 'Re-grade' : 'Grade'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-text-muted">
                      No student submissions received yet for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ACTIVE GRADING INTERFACE */}
          {gradingSubmission && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border-2 border-accent-indigo/40 bg-background-elevated/60 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent-indigo" />
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    Grading: {gradingSubmission.studentName}
                  </h4>
                </div>
                <Badge variant="indigo" className="text-xs">
                  Score Scale: 0.0 – 10.0
                </Badge>
              </div>

              {gradingSubmission.notes && (
                <div className="p-3 rounded-xl bg-background-card border border-border-subtle text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary block mb-0.5">Student Notes:</span>
                  {gradingSubmission.notes}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Score Input (0-10 Validated) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Grade Score (0.0 to 10.0)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    placeholder="e.g. 9.5"
                    className="font-mono text-base font-bold text-accent-cyan"
                  />
                  <p className="text-[11px] text-text-muted">Maximum allowable score: 10.0</p>
                </div>

                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Evaluation Status</label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value as 'graded' | 'resubmit')}
                    className="w-full h-10 rounded-xl bg-background-elevated border border-border-DEFAULT px-3 text-xs text-text-primary focus:border-accent-indigo focus:outline-none"
                  >
                    <option value="graded">Graded (Accepted)</option>
                    <option value="resubmit">Request Resubmission (Action Required)</option>
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Instructor Feedback & Code Review Comments
                </label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Provide constructive feedback on code structure, architecture, styling, and test coverage..."
                  rows={3}
                  className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGradingSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => gradeMutation.mutate()}
                  disabled={gradeMutation.isPending}
                  className="bg-accent-indigo hover:bg-accent-violet"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {gradeMutation.isPending ? 'Submitting...' : 'Save Grade & Feedback'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>

      {/* Delete Project Dialog */}
      <ConfirmDialog
        open={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) deleteProjectMutation.mutate(projectToDelete.id);
        }}
        title="Delete Project Assignment"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? All submissions associated with this project will be removed.`}
        confirmText="Delete Project"
        variant="danger"
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}
