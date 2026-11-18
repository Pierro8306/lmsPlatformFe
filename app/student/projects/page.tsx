'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Github,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Send,
  MessageSquare,
  FileCode,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { projectService } from '@/services/project.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Countdown } from '@/components/ui/countdown';
import { EmptyState } from '@/components/shared/empty-state';
import type { Project, ProjectSubmission } from '@/types/project';
import type { CreateProjectSubmissionRequest } from '@/types/project';

export default function StudentProjectsPage() {
  const queryClient = useQueryClient();

  // Submission modal state
  const [selectedProjectForSubmit, setSelectedProjectForSubmit] = React.useState<Project | null>(null);
  const [githubUrl, setGithubUrl] = React.useState('');
  const [deployedUrl, setDeployedUrl] = React.useState('');
  const [submissionNotes, setSubmissionNotes] = React.useState('');
  const [urlError, setUrlError] = React.useState<string | null>(null);

  // Queries
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['student', 'projects'],
    queryFn: () => projectService.getAllProjects(),
  });

  // Query submissions for each project to show student's personal status
  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['student', 'my-submissions'],
    queryFn: async () => {
      const allProjects = await projectService.getAllProjects();
      const results: { projectId: number; submission: ProjectSubmission | null }[] = [];
      for (const p of allProjects) {
        const sub = await projectService.getMySubmission(p.id);
        results.push({ projectId: p.id, submission: sub });
      }
      return results;
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectForSubmit) return;

      // Validate GitHub URL format
      const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
      if (!githubRegex.test(githubUrl.trim())) {
        throw new Error('Please enter a valid GitHub repository URL (e.g. https://github.com/username/repo)');
      }

      const payload: CreateProjectSubmissionRequest = {
        projectId: selectedProjectForSubmit.id,
        repositoryUrl: githubUrl.trim(),
        deployedUrl: deployedUrl.trim() || undefined,
        notes: submissionNotes.trim() || undefined,
      };

      return projectService.submitProject(selectedProjectForSubmit.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'projects'] });
      toast.success('Project repository submitted successfully!');
      handleCloseModal();
    },
    onError: (err: any) => {
      setUrlError(err.message || 'Invalid repository URL');
      toast.error(err.message || 'Failed to submit repository');
    },
  });

  const handleOpenSubmitModal = (project: Project, existingSub: ProjectSubmission | null) => {
    setSelectedProjectForSubmit(project);
    setUrlError(null);
    if (existingSub) {
      setGithubUrl(existingSub.repositoryUrl);
      setDeployedUrl(existingSub.deployedUrl || '');
      setSubmissionNotes(existingSub.notes || '');
    } else {
      setGithubUrl('');
      setDeployedUrl('');
      setSubmissionNotes('');
    }
  };

  const handleCloseModal = () => {
    setSelectedProjectForSubmit(null);
    setGithubUrl('');
    setDeployedUrl('');
    setSubmissionNotes('');
    setUrlError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Project Assignments"
        subtitle="Submit your GitHub repositories, track automated deadlines, and view instructor review feedback"
        gradientTitle
      />

      <div className="space-y-5">
        {projects.map((project) => {
          const isOverdue = project.dueDate ? new Date() > new Date(project.dueDate) : false;
          const userSubEntry = mySubmissions.find((s) => s.projectId === project.id);
          const mySubmission = userSubEntry?.submission;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border-DEFAULT bg-[#151923] p-6 sm:p-7 shadow-card hover:border-accent-indigo/40 transition-all space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="indigo" className="text-xs">
                      Max Score: {project.maxScore} pts
                    </Badge>

                    {isOverdue ? (
                      <Badge variant="danger" className="text-xs">
                        Deadline Passed
                      </Badge>
                    ) : (
                      project.dueDate && (
                        <Countdown
                          targetDate={project.dueDate}
                          size="sm"
                          variant="badge"
                        />
                      )
                    )}

                    {mySubmission && (
                      <Badge
                        variant={
                          mySubmission.status === 'graded'
                            ? 'success'
                            : mySubmission.status === 'late'
                            ? 'danger'
                            : 'cyan'
                        }
                        className="text-xs capitalize font-semibold"
                      >
                        Status: {mySubmission.status}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {project.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    onClick={() => handleOpenSubmitModal(project, mySubmission || null)}
                    className="w-full sm:w-auto shadow-lg shadow-accent-indigo/20 bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110"
                  >
                    <Github className="w-4 h-4 mr-1.5" />
                    <span>{mySubmission ? 'Update Submission' : 'Submit Repository'}</span>
                  </Button>
                </div>
              </div>

              {/* Acceptance Criteria */}
              {project.requirements && (
                <div className="p-4 rounded-2xl bg-background-elevated/50 border border-border-subtle space-y-1.5">
                  <span className="text-xs uppercase font-semibold text-text-muted tracking-wider block">
                    Acceptance Criteria & Guidelines:
                  </span>
                  <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                    {project.requirements}
                  </p>
                </div>
              )}

              {/* Submission Status & Feedback Display */}
              {mySubmission && (
                <div className="pt-4 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Submission Links */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Submitted Repositories
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <a
                        href={mySubmission.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-accent-indigo hover:text-accent-violet hover:underline font-mono"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{mySubmission.repositoryUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {mySubmission.deployedUrl && (
                        <div>
                          <a
                            href={mySubmission.deployedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-accent-cyan hover:underline font-mono"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview: {mySubmission.deployedUrl}</span>
                          </a>
                        </div>
                      )}

                      <p className="text-[11px] text-text-muted">
                        Submitted: {format(new Date(mySubmission.submittedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  {/* Instructor Feedback & Grade */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                      Evaluation & Grade
                    </span>

                    {mySubmission.score !== null ? (
                      <div className="p-3 rounded-2xl border border-status-success/30 bg-status-success/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-status-success flex items-center gap-1">
                            <Award className="w-4 h-4" /> Evaluated
                          </span>
                          <span className="font-mono text-base font-bold text-accent-cyan">
                            {mySubmission.score} / {project.maxScore}
                          </span>
                        </div>

                        {mySubmission.feedback && (
                          <div className="text-xs text-text-secondary pt-1 border-t border-status-success/20">
                            <strong className="text-text-primary block mb-0.5">Instructor Feedback:</strong>
                            {mySubmission.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl border border-border-subtle bg-background-elevated/40 text-xs text-text-muted flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-cyan" />
                        <span>Submission received. Pending instructor evaluation.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {projects.length === 0 && !isLoading && (
          <EmptyState
            icon={FolderGit2}
            title="No project assignments right now"
            description="All milestone projects will appear here with instructions and deadlines."
          />
        )}
      </div>

      {/* SUBMISSION FORM MODAL */}
      <Modal
        open={!!selectedProjectForSubmit}
        onClose={handleCloseModal}
        title={`Submit: ${selectedProjectForSubmit?.title || 'Project'}`}
        description="Provide your public GitHub repository link and optional deployment preview."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              GitHub Repository URL <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <Input
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  setUrlError(null);
                }}
                placeholder="https://github.com/username/project-repo"
                className="pl-9 font-mono text-xs bg-background-elevated"
              />
              <Github className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {urlError && <p className="text-xs text-status-danger mt-1">{urlError}</p>}
            <p className="text-[11px] text-text-muted">
              Must be a valid GitHub URL (e.g. https://github.com/your-username/your-repository)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Live Deployed Preview URL (Optional)
            </label>
            <div className="relative">
              <Input
                value={deployedUrl}
                onChange={(e) => setDeployedUrl(e.target.value)}
                placeholder="https://your-app.vercel.app"
                className="pl-9 font-mono text-xs bg-background-elevated"
              />
              <ExternalLink className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Submission Notes / Documentation (Optional)
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Highlight any additional features, libraries used, or setup instructions..."
              rows={3}
              className="w-full rounded-xl bg-background-elevated border border-border-DEFAULT p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-indigo focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!githubUrl.trim() || submitMutation.isPending}
              className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {submitMutation.isPending ? 'Verifying...' : 'Submit Repository'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
