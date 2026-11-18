'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Code2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Layers,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProblems, deleteProblem } from '@/services/problem.service';
import type { Problem, Difficulty } from '@/types/problem';

export default function AdminProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProblems = async () => {
    setIsLoading(true);
    try {
      const data = await getProblems({
        search,
        difficulty: difficultyFilter,
      });
      setProblems(data);
    } catch (err: any) {
      toast.error('Failed to load coding problems');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search, difficultyFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProblem(deleteId);
      toast.success('Problem deleted successfully');
      setDeleteId(null);
      fetchProblems();
    } catch (err: any) {
      toast.error('Failed to delete problem');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Hard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Problems"
        subtitle="Create and manage algorithm challenges, starter templates, automated test cases, and student submissions."
      >
        <Link href="/admin/problems/new">
          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-1.5" /> New Problem
          </Button>
        </Link>
      </PageHeader>

      {/* Filters & Search */}
      <Card className="p-4 bg-[#151923] border-[#2A3142] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B7385] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0F1218] border-[#2A3142] text-white text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-[#9AA3B5]">
            <Filter className="w-3.5 h-3.5" />
            <span>Difficulty:</span>
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#0F1218] border border-[#2A3142] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </Card>

      {/* Problems DataTable */}
      <Card className="bg-[#151923] border-[#2A3142] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#9AA3B5] space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading coding problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No problems found"
            description="Get started by creating your first coding problem with automated test cases."
            action={{
              label: 'Create Problem',
              onClick: () => router.push('/admin/problems/new'),
              icon: Plus,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1F2B] text-xs text-[#9AA3B5] uppercase border-b border-[#2A3142]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Title & Tags</th>
                  <th className="px-4 py-3.5 font-semibold">Difficulty</th>
                  <th className="px-4 py-3.5 font-semibold">Allowed Languages</th>
                  <th className="px-4 py-3.5 font-semibold">Submissions</th>
                  <th className="px-4 py-3.5 font-semibold">Target Group</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232938]">
                {problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-[#1A1F2B]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white hover:text-indigo-400 transition-colors">
                        <Link href={`/admin/problems/${prob.id}/edit`}>{prob.title}</Link>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {prob.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-[#0F1218] text-[#9AA3B5] px-2 py-0.5 rounded border border-[#2A3142]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">{getDifficultyBadge(prob.difficulty)}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-[#9AA3B5]">
                        {prob.allowedLanguages.map((l) => (
                          <span
                            key={l}
                            className="bg-[#0F1218] px-1.5 py-0.5 rounded text-[11px] font-mono border border-[#2A3142]"
                          >
                            {l === 'python'
                              ? 'Py'
                              : l === 'javascript'
                              ? 'JS'
                              : l === 'java'
                              ? 'Java'
                              : 'C++'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-[#9AA3B5]">
                      <div className="flex items-center space-x-1">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-white font-medium">{prob.totalSubmissions || 0}</span>
                        <span>submitted</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-[#9AA3B5]">
                      {prob.assignedGroupName || 'All Students'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link href={`/admin/problems/${prob.id}/testcases`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-8 px-2"
                            title="Manage Test Cases"
                          >
                            <Layers className="w-3.5 h-3.5 mr-1" /> Tests
                          </Button>
                        </Link>

                        <Link href={`/admin/problems/${prob.id}/submissions`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-8 px-2"
                            title="Submissions & Grading"
                          >
                            <FileCheck className="w-3.5 h-3.5 mr-1" /> Submissions
                          </Button>
                        </Link>

                        <Link href={`/admin/problems/${prob.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-[#9AA3B5] hover:text-white h-8 w-8 p-0"
                            title="Edit Problem"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(prob.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0"
                          title="Delete Problem"
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coding Problem?"
        description="Are you sure you want to delete this problem? All associated test cases and submission records will be permanently removed."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Problem'}
        variant="danger"
      />
    </div>
  );
}
