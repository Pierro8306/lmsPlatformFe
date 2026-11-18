'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Countdown } from '@/components/ui/countdown';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Code2,
  Search,
  CheckCircle2,
  Clock,
  CircleDashed,
  ArrowRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProblems } from '@/services/problem.service';
import type { Problem, Difficulty, ProblemStatus } from '@/types/problem';

export default function StudentProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    getProblems({ search, difficulty: difficultyFilter })
      .then((data) => {
        let filtered = data;
        if (statusFilter !== 'all') {
          filtered = data.filter((p) => p.userStatus === statusFilter);
        }
        setProblems(filtered);
      })
      .catch(() => toast.error('Failed to load problems'))
      .finally(() => setIsLoading(false));
  }, [search, difficultyFilter, statusFilter]);

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

  const getStatusBadge = (status?: ProblemStatus) => {
    switch (status) {
      case 'solved':
        return (
          <span className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Solved</span>
          </span>
        );
      case 'attempted':
        return (
          <span className="flex items-center space-x-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
            <Clock className="w-3 h-3" />
            <span>Attempted</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 text-xs text-[#6B7385] bg-[#0F1218] px-2 py-0.5 rounded-full border border-[#2A3142] font-medium">
            <CircleDashed className="w-3 h-3" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  const solvedCount = problems.filter((p) => p.userStatus === 'solved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Arena"
        subtitle="Solve algorithm challenges, test your solutions in our isolated sandbox, and receive line-level instructor code reviews."
      />

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#151923] to-[#1A1F2B] border-[#2A3142] flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{problems.length}</div>
            <div className="text-xs text-[#9AA3B5]">Total Challenges</div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#151923] to-[#1A1F2B] border-[#2A3142] flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{solvedCount}</div>
            <div className="text-xs text-[#9AA3B5]">Problems Solved</div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#151923] to-[#1A1F2B] border-[#2A3142] flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {problems.length ? Math.round((solvedCount / problems.length) * 100) : 0}%
            </div>
            <div className="text-xs text-[#9AA3B5]">Completion Rate</div>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-[#151923] border-[#2A3142] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6B7385] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search problems, topics, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0F1218] border-[#2A3142] text-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#9AA3B5]">Difficulty:</span>
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

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#9AA3B5]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0F1218] border border-[#2A3142] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unsolved">Not Started</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Problem Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#9AA3B5] space-y-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading problems...</p>
        </div>
      ) : problems.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No problems found"
          description="Try adjusting your search criteria or difficulty filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((prob) => (
            <Card
              key={prob.id}
              className="p-5 bg-[#151923] border-[#2A3142] hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getDifficultyBadge(prob.difficulty)}
                  {getStatusBadge(prob.userStatus)}
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                    <Link href={`/student/problems/${prob.id}`}>{prob.title}</Link>
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prob.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-[#0F1218] text-[#9AA3B5] px-2 py-0.5 rounded border border-[#2A3142]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {prob.deadline && (
                  <div className="text-xs text-[#9AA3B5] bg-[#0F1218] p-2.5 rounded-lg border border-[#2A3142] flex items-center justify-between">
                    <span className="text-[#6B7385]">Deadline:</span>
                    <Countdown targetDate={prob.deadline} className="text-amber-400 font-mono font-medium" />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#232938] flex items-center justify-between">
                <div className="text-xs text-[#6B7385]">
                  Score: <strong className="text-white">{prob.userBestScore || 0}/10</strong>
                </div>

                <Link href={`/student/problems/${prob.id}`}>
                  <Button
                    size="sm"
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs transition-all h-8"
                  >
                    Solve Challenge <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
