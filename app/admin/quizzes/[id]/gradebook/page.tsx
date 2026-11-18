'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { quizService } from '@/services/quiz.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { StudentQuizResult } from '@/types/quiz';

export default function AdminQuizGradebookPage() {
  const params = useParams();
  const quizId = Number(params.id) || 1;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'passed' | 'failed'>('all');
  const [selectedGroup, setSelectedGroup] = React.useState<string>('all');

  const { data: quiz } = useQuery({
    queryKey: ['admin', 'quiz-detail', quizId],
    queryFn: () => quizService.getQuizById(quizId),
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['admin', 'quiz-gradebook', quizId],
    queryFn: () => quizService.getQuizStudentResults(quizId),
  });

  // Filter results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'passed'
        ? r.passed
        : !r.passed;

    const matchesGroup =
      selectedGroup === 'all' ? true : r.group === selectedGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    if (results.length === 0) {
      toast.error('No student records to export');
      return;
    }

    const headers = [
      'Student ID',
      'Name',
      'Email',
      'Cohort/Group',
      'Best Score',
      'Max Score',
      'Percentage (%)',
      'Completion (%)',
      'Attempts Count',
      'Time Taken (s)',
      'Status',
      'Last Attempt Date',
    ];

    const rows = filteredResults.map((r) => [
      r.studentId,
      `"${r.studentName}"`,
      r.studentEmail,
      r.group || 'N/A',
      r.bestScore,
      r.maxScore,
      r.bestPercentage,
      r.completionPercentage,
      r.attempts,
      r.timeTaken,
      r.passed ? 'PASSED' : 'FAILED',
      r.lastAttemptAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Gradebook_${quiz?.title?.replace(/\s+/g, '_') || 'Quiz'}_${format(
        new Date(),
        'yyyy-MM-dd'
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Gradebook exported to CSV successfully');
  };

  const totalPassed = results.filter((r) => r.passed).length;
  const avgScore =
    results.length > 0
      ? (
          results.reduce((acc, curr) => acc + curr.bestPercentage, 0) /
          results.length
        ).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Gradebook: ${quiz?.title || 'Assessment'}`}
        subtitle="Performance analytics, completion rates, and individual student attempt metrics"
        backHref="/admin/quizzes"
        gradientTitle
      >
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-accent-indigo/40 hover:bg-accent-indigo hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </PageHeader>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80">
          <p className="text-xs text-text-muted">Total Examinees</p>
          <p className="text-2xl font-bold font-heading text-text-primary mt-1">
            {results.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80">
          <p className="text-xs text-text-muted">Passing Rate</p>
          <p className="text-2xl font-bold font-heading text-status-success mt-1">
            {results.length > 0
              ? `${Math.round((totalPassed / results.length) * 100)}%`
              : '0%'}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80">
          <p className="text-xs text-text-muted">Average Percentage</p>
          <p className="text-2xl font-bold font-heading text-accent-indigo mt-1">
            {avgScore}%
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-card/80">
          <p className="text-xs text-text-muted">Passing Threshold</p>
          <p className="text-2xl font-bold font-heading text-accent-cyan mt-1">
            {quiz?.passingScore || 70}%
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background-card/60 p-3 rounded-2xl border border-border-DEFAULT">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examinee by name or email..."
            className="pl-9 bg-background-elevated/80 border-border-subtle h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cohort Selector */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background-elevated border border-border-subtle text-xs text-text-secondary focus:border-accent-indigo focus:outline-none"
          >
            <option value="all">All Cohorts</option>
            <option value="Group Alpha">Group Alpha</option>
            <option value="Group Beta">Group Beta</option>
            <option value="Group Gamma">Group Gamma</option>
          </select>

          {/* Pass/Fail Selector */}
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
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'passed'
                  ? 'bg-status-success text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-status-danger text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="rounded-2xl border border-border-DEFAULT bg-background-card overflow-hidden shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-background-elevated/70 border-b border-border-DEFAULT text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-5 py-3.5 font-medium">Examinee</th>
              <th className="px-5 py-3.5 font-medium">Group</th>
              <th className="px-5 py-3.5 font-medium">Score</th>
              <th className="px-5 py-3.5 font-medium">Percentage</th>
              <th className="px-5 py-3.5 font-medium">Completion %</th>
              <th className="px-5 py-3.5 font-medium">Attempts</th>
              <th className="px-5 py-3.5 font-medium">Time Taken</th>
              <th className="px-5 py-3.5 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-primary">
            {filteredResults.map((result) => {
              const minutes = Math.floor(result.timeTaken / 60);
              const seconds = result.timeTaken % 60;

              return (
                <tr
                  key={result.studentId}
                  className="hover:bg-background-elevated/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text-primary">{result.studentName}</p>
                    <p className="text-xs text-text-muted">{result.studentEmail}</p>
                  </td>

                  <td className="px-5 py-4 text-xs text-text-secondary">
                    {result.group || '—'}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs font-semibold text-accent-cyan">
                    {result.bestScore} / {result.maxScore}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs font-bold">
                    {result.bestPercentage}%
                  </td>

                  <td className="px-5 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-background-elevated overflow-hidden">
                        <div
                          className="h-full bg-accent-indigo rounded-full"
                          style={{ width: `${result.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">{result.completionPercentage}%</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-background-elevated border border-border-subtle text-text-secondary font-mono">
                      {result.attempts} attempt(s)
                    </span>
                  </td>

                  <td className="px-5 py-4 text-xs font-mono text-text-muted">
                    {minutes}m {seconds}s
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Badge
                      variant={result.passed ? 'success' : 'danger'}
                      className="text-xs py-0.5 font-medium"
                    >
                      {result.passed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Passed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                  </td>
                </tr>
              );
            })}

            {filteredResults.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-text-muted">
                  No examinee records matched your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
