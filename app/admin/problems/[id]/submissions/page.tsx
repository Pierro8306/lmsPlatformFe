'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Drawer } from '@/components/ui/drawer';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { CodeEditor } from '@/components/shared/code-editor';
import { EmptyState } from '@/components/shared/empty-state';
import {
  FileCheck,
  ArrowLeft,
  User,
  Clock,
  Cpu,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getProblem,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  addLineComment,
  toggleCommentStatus,
} from '@/services/problem.service';
import type {
  Problem,
  Submission,
  LineComment,
} from '@/types/problem';

export default function AdminSubmissionsPage() {
  const params = useParams();
  const problemId = params?.id as string;
  const router = useRouter();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer / Inspection state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeLineForComment, setActiveLineForComment] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentSeverity, setNewCommentSeverity] = useState<'suggestion' | 'issue' | 'critical'>('suggestion');

  // Manual grading state
  const [manualScore, setManualScore] = useState<number>(0);
  const [generalFeedback, setGeneralFeedback] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prob, subs] = await Promise.all([
        getProblem(problemId),
        getSubmissions(problemId),
      ]);
      setProblem(prob);
      setSubmissions(subs);
    } catch (err: any) {
      toast.error('Failed to load submissions');
      router.push('/admin/problems');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (problemId) {
      fetchData();
    }
  }, [problemId]);

  const handleOpenSubmission = async (sub: Submission) => {
    try {
      const fullSub = await getSubmission(problemId, sub.id);
      setSelectedSubmission(fullSub);
      setManualScore(fullSub.score);
      setGeneralFeedback(fullSub.feedback || '');
      setActiveLineForComment(null);
      setIsDrawerOpen(true);
    } catch (err) {
      toast.error('Failed to open submission details');
    }
  };

  const handleLineClick = (lineNumber: number) => {
    setActiveLineForComment(lineNumber);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !activeLineForComment || !newCommentText.trim()) return;

    try {
      const newComment = await addLineComment({
        submissionId: selectedSubmission.id,
        lineNumber: activeLineForComment,
        content: newCommentText.trim(),
        severity: newCommentSeverity,
      });

      setSelectedSubmission((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), newComment],
            }
          : null
      );
      setNewCommentText('');
      setActiveLineForComment(null);
      toast.success(`Comment posted on line ${activeLineForComment}`);
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleToggleCommentStatus = async (commentId: string) => {
    if (!selectedSubmission) return;
    try {
      const updated = await toggleCommentStatus(selectedSubmission.id, commentId);
      setSelectedSubmission((prev) =>
        prev
          ? {
              ...prev,
              comments: (prev.comments || []).map((c) =>
                c.id === commentId ? { ...c, status: updated.status } : c
              ),
            }
          : null
      );
    } catch (err) {
      toast.error('Failed to update comment status');
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    if (manualScore < 0 || manualScore > 10) {
      toast.error('Score must be between 0 and 10');
      return;
    }
    setIsGrading(true);
    try {
      const updated = await gradeSubmission(problemId, selectedSubmission.id, {
        score: Number(manualScore),
        feedback: generalFeedback,
      });
      setSelectedSubmission((prev) => (prev ? { ...prev, score: updated.score, feedback: updated.feedback } : null));
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, score: updated.score, feedback: updated.feedback }
            : s
        )
      );
      toast.success('Grade & feedback updated successfully');
    } catch (err) {
      toast.error('Failed to save grade');
    } finally {
      setIsGrading(false);
    }
  };

  const highlightedLines = (selectedSubmission?.comments || []).map((c) => ({
    lineNumber: c.lineNumber,
    severity: c.severity,
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#232938]">
        <div className="flex items-center space-x-3">
          <Link href="/admin/problems">
            <Button variant="ghost" className="text-[#9AA3B5] hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center">
              <FileCheck className="w-5 h-5 text-indigo-400 mr-2" />
              Student Submissions
            </h1>
            <p className="text-xs text-[#9AA3B5] mt-0.5">
              Problem: <span className="text-white font-medium">{problem?.title}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-[#9AA3B5]">
          Total: <span className="text-white font-bold">{submissions.length}</span> submissions
        </div>
      </div>

      {/* Submissions Table */}
      <Card className="bg-[#151923] border-[#2A3142] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#9AA3B5]">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No submissions recorded"
            description="When students run or submit solutions from their coding arena, their attempts will appear here for grading and code review."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1F2B] text-xs text-[#9AA3B5] uppercase border-b border-[#2A3142]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-4 py-3.5 font-semibold">Language</th>
                  <th className="px-4 py-3.5 font-semibold">Verdict</th>
                  <th className="px-4 py-3.5 font-semibold">Tests Passed</th>
                  <th className="px-4 py-3.5 font-semibold">Runtime / Memory</th>
                  <th className="px-4 py-3.5 font-semibold">Score (0-10)</th>
                  <th className="px-4 py-3.5 font-semibold">Submitted Time</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232938]">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleOpenSubmission(sub)}
                    className="hover:bg-[#1A1F2B]/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{sub.studentName}</div>
                      <div className="text-xs text-[#6B7385]">{sub.studentEmail}</div>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-cyan-300">
                      {sub.language}
                    </td>

                    <td className="px-4 py-4">
                      <VerdictBadge verdict={sub.verdict} size="sm" />
                    </td>

                    <td className="px-4 py-4 text-xs text-[#9AA3B5]">
                      <span className="text-white font-medium">{sub.passedTests}</span> /{' '}
                      {sub.totalTests} passed
                    </td>

                    <td className="px-4 py-4 text-xs text-[#9AA3B5]">
                      <div>{sub.executionTimeMs} ms</div>
                      <div className="text-[11px] text-[#6B7385]">
                        {(sub.memoryKb / 1024).toFixed(1)} MB
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-white bg-[#0F1218] px-2 py-0.5 rounded border border-[#2A3142] text-xs">
                        {sub.score} / 10
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-[#9AA3B5]">
                      <div>{new Date(sub.submittedAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-[#6B7385]">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      >
                        Inspect Code →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Code Viewer & Review Drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={
          selectedSubmission
            ? `Submission: ${selectedSubmission.studentName} (${selectedSubmission.language})`
            : 'Submission Review'
        }
        widthClass="w-[90vw] max-w-5xl"
      >
        {selectedSubmission && (
          <div className="flex flex-col h-full space-y-4 pt-4">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F1218] rounded-lg border border-[#2A3142] text-xs">
              <div className="flex items-center space-x-3">
                <VerdictBadge verdict={selectedSubmission.verdict} size="md" />
                <span className="text-[#9AA3B5]">
                  Tests: <strong className="text-white">{selectedSubmission.passedTests}/{selectedSubmission.totalTests}</strong>
                </span>
                <span className="text-[#9AA3B5]">
                  Runtime: <strong className="text-white">{selectedSubmission.executionTimeMs} ms</strong>
                </span>
                <span className="text-[#9AA3B5]">
                  Memory: <strong className="text-white">{(selectedSubmission.memoryKb / 1024).toFixed(1)} MB</strong>
                </span>
              </div>

              <div className="text-[#6B7385]">
                Click any line number to add an inline review comment.
              </div>
            </div>

            {/* Split Code and Comment Thread */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[420px]">
              {/* Code viewer (2 cols) */}
              <div className="lg:col-span-2 border border-[#2A3142] rounded-lg overflow-hidden bg-[#0B0D12]">
                <CodeEditor
                  language={selectedSubmission.language}
                  value={selectedSubmission.code}
                  readOnly={true}
                  highlightedLines={highlightedLines}
                  onLineClick={handleLineClick}
                />
              </div>

              {/* Comments & Line Feedbacks (1 col) */}
              <div className="flex flex-col space-y-4 bg-[#0F1218] border border-[#2A3142] rounded-lg p-4 overflow-y-auto max-h-[550px]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                  Line Review Comments ({selectedSubmission.comments?.length || 0})
                </h3>

                {/* Inline Comment Form if line clicked */}
                {activeLineForComment && (
                  <form
                    onSubmit={handleAddComment}
                    className="p-3 bg-[#151923] border border-indigo-500/40 rounded-lg space-y-2.5 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-300 font-medium">
                        Comment on Line {activeLineForComment}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveLineForComment(null)}
                        className="text-[#6B7385] hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <Textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Write feedback, issue, or optimization tip..."
                      className="bg-[#0F1218] border-[#2A3142] text-xs text-white"
                      required
                    />

                    <div className="flex items-center justify-between">
                      <select
                        value={newCommentSeverity}
                        onChange={(e: any) => setNewCommentSeverity(e.target.value)}
                        className="bg-[#0F1218] border border-[#2A3142] text-[11px] text-white rounded px-2 py-1"
                      >
                        <option value="suggestion">Suggestion</option>
                        <option value="issue">Issue</option>
                        <option value="critical">Critical</option>
                      </select>

                      <Button
                        type="submit"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5"
                      >
                        <Send className="w-3 h-3 mr-1" /> Post
                      </Button>
                    </div>
                  </form>
                )}

                {/* List of comments */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {!selectedSubmission.comments || selectedSubmission.comments.length === 0 ? (
                    <p className="text-xs text-[#6B7385] italic">
                      No line comments yet. Click any line number in the code above to attach a note.
                    </p>
                  ) : (
                    selectedSubmission.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2.5 rounded-lg bg-[#151923] border border-[#2A3142] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white flex items-center space-x-1.5">
                            <span className="text-indigo-400">L{comment.lineNumber}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                comment.severity === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : comment.severity === 'issue'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-indigo-500/20 text-indigo-300'
                              }`}
                            >
                              {comment.severity}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleCommentStatus(comment.id)}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                              comment.status === 'resolved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-[#0F1218] text-[#9AA3B5] border-[#2A3142]'
                            }`}
                          >
                            {comment.status === 'resolved' ? '✓ Resolved' : 'Open'}
                          </button>
                        </div>

                        <p className="text-[#9AA3B5] leading-relaxed">{comment.content}</p>
                        <div className="text-[10px] text-[#6B7385]">
                          By {comment.author.name} • {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Manual Grading & Overall Feedback Footer */}
            <div className="p-4 bg-[#0F1218] border border-[#2A3142] rounded-lg space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <Award className="w-4 h-4 text-amber-400 mr-1.5" />
                Instructor Grade & Feedback Override
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-[#9AA3B5] mb-1">
                    Score (0–10 Scale)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={manualScore}
                    onChange={(e) => setManualScore(Number(e.target.value))}
                    className="bg-[#151923] border-[#2A3142] text-white text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#9AA3B5] mb-1">
                    General Feedback
                  </label>
                  <Input
                    value={generalFeedback}
                    onChange={(e) => setGeneralFeedback(e.target.value)}
                    placeholder="Provide constructive overall feedback..."
                    className="bg-[#151923] border-[#2A3142] text-white text-sm"
                  />
                </div>

                <div>
                  <Button
                    onClick={handleSaveGrade}
                    disabled={isGrading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-10"
                  >
                    {isGrading ? 'Saving Grade...' : 'Save Grade & Feedback'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
