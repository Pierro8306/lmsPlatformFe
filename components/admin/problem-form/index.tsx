'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CodeEditor } from '@/components/shared/code-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  Code2,
  Eye,
  FileEdit,
  Save,
  ArrowLeft,
  Clock,
  Cpu,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Problem, Language, Difficulty } from '@/types/problem';

interface ProblemFormProps {
  initialData?: Problem;
  onSubmit: (data: Partial<Problem>) => Promise<void>;
  isSubmitting?: boolean;
}

const AVAILABLE_LANGUAGES: { key: Language; label: string }[] = [
  { key: 'python', label: 'Python 3' },
  { key: 'javascript', label: 'JavaScript (Node.js)' },
  { key: 'java', label: 'Java (OpenJDK 17)' },
  { key: 'cpp', label: 'C++ (GCC 13)' },
];

const DEFAULT_STARTER: Record<Language, string> = {
  python: `class Solution:\n    def solve(self) -> None:\n        # Write your code here\n        pass\n`,
  javascript: `/**\n * @return {void}\n */\nfunction solve() {\n    // Write your code here\n}\n`,
  java: `class Solution {\n    public void solve() {\n        // Write your code here\n    }\n}\n`,
  cpp: `#include <iostream>\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};\n`,
};

export function ProblemForm({ initialData, onSubmit, isSubmitting = false }: ProblemFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty || 'easy');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || 'Array, Algorithms');
  const [timeLimitMs, setTimeLimitMs] = useState(initialData?.timeLimitMs || 1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(initialData?.memoryLimitMb || 256);
  const [totalPoints, setTotalPoints] = useState(initialData?.totalPoints || 100);
  const [assignedGroupName, setAssignedGroupName] = useState(initialData?.assignedGroupName || 'Group Alpha (CS-2025)');
  const [deadline, setDeadline] = useState(initialData?.deadline ? initialData.deadline.slice(0, 16) : '2026-12-31T23:59');

  const [description, setDescription] = useState(
    initialData?.description ||
      `Given an input, solve the problem according to the specifications.\n\n### Constraints\n- $1 \\le N \\le 10^5$\n- Time Limit: 1.0s`
  );
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(
    initialData?.allowedLanguages || ['python', 'javascript']
  );
  const [activeCodeLang, setActiveCodeLang] = useState<Language>(
    selectedLanguages[0] || 'python'
  );
  const [starterCodes, setStarterCodes] = useState<Record<Language, string>>(
    initialData?.starterCode || DEFAULT_STARTER
  );

  const toggleLanguage = (lang: Language) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length === 1) {
        toast.error('At least one language must be enabled');
        return;
      }
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      if (activeCodeLang === lang) {
        const remaining = selectedLanguages.filter((l) => l !== lang);
        setActiveCodeLang(remaining[0]);
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleStarterCodeChange = (code: string) => {
    setStarterCodes((prev) => ({
      ...prev,
      [activeCodeLang]: code,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Problem title is required');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        title,
        difficulty,
        tags,
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb),
        totalPoints: Number(totalPoints),
        description,
        allowedLanguages: selectedLanguages,
        starterCode: starterCodes,
        assignedGroupName,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      toast.success(initialData ? 'Problem updated successfully' : 'Problem created successfully');
      router.push('/admin/problems');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save problem');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#232938]">
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/problems')}
            className="text-[#9AA3B5] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <h1 className="text-xl font-bold text-white">
            {initialData ? `Edit Problem: ${initialData.title}` : 'Create New Coding Problem'}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-500/20"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : initialData ? 'Update Problem' : 'Publish Problem'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info & Statement */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 text-indigo-400 mr-2" /> General Specifications
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">Problem Title</label>
              <Input
                placeholder="e.g. Reverse Linked List"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-[#0F1218] border border-[#2A3142] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">Total Points</label>
                <Input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  className="bg-[#0F1218] border-[#2A3142] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">
                Tags (comma separated)
              </label>
              <Input
                placeholder="Array, Hash Table, Two Pointers"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
            </div>
          </Card>

          {/* Statement Editor with Live Markdown Preview */}
          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                <FileEdit className="w-4 h-4 text-cyan-400 mr-2" /> Problem Statement (Markdown)
              </h2>

              <div className="flex rounded-lg bg-[#0F1218] p-0.5 border border-[#2A3142]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('edit')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    previewTab === 'edit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-[#9AA3B5] hover:text-white'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5 inline mr-1" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    previewTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-[#9AA3B5] hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
                </button>
              </div>
            </div>

            {previewTab === 'edit' ? (
              <Textarea
                rows={12}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, input format, output format, and constraints using standard Markdown..."
                className="bg-[#0F1218] border-[#2A3142] text-white font-mono text-sm leading-relaxed"
              />
            ) : (
              <div className="min-h-[280px] p-4 bg-[#0F1218] rounded-lg border border-[#2A3142] overflow-y-auto max-h-[400px]">
                <MarkdownRenderer content={description} />
              </div>
            )}
          </Card>

          {/* Starter Code Multi-Language Manager */}
          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
                  <Code2 className="w-4 h-4 text-emerald-400 mr-2" /> Starter Code Template
                </h2>
                <p className="text-xs text-[#9AA3B5] mt-0.5">
                  Pre-filled template code provided to students when they open this language.
                </p>
              </div>
            </div>

            {/* Language Selection Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.key);
                return (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => toggleLanguage(lang.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-[#0F1218] border-[#2A3142] text-[#6B7385] hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {lang.label}
                  </button>
                );
              })}
            </div>

            {/* Active Code Tab */}
            <div className="border border-[#2A3142] rounded-lg overflow-hidden bg-[#0B0D12]">
              <div className="flex items-center space-x-1 p-2 bg-[#1A1F2B] border-b border-[#2A3142]">
                {selectedLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveCodeLang(lang)}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                      activeCodeLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    {AVAILABLE_LANGUAGES.find((l) => l.key === lang)?.label}
                  </button>
                ))}
              </div>

              <div className="h-64">
                <CodeEditor
                  key={activeCodeLang}
                  language={activeCodeLang}
                  value={starterCodes[activeCodeLang] || ''}
                  onChange={handleStarterCodeChange}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Execution limits & Assignment metadata */}
        <div className="space-y-6">
          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 text-amber-400 mr-2" /> Sandbox Limits
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#6B7385]" /> Time Limit (ms)
              </label>
              <Input
                type="number"
                step="100"
                value={timeLimitMs}
                onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
              <span className="text-[11px] text-[#6B7385] mt-1 block">Default: 1000ms (1.0 second)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5 flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1 text-[#6B7385]" /> Memory Limit (MB)
              </label>
              <Input
                type="number"
                step="32"
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
              <span className="text-[11px] text-[#6B7385] mt-1 block">Default: 256 MB</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center">
              <Calendar className="w-4 h-4 text-cyan-400 mr-2" /> Assignment Target
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">Target Group</label>
              <Input
                value={assignedGroupName}
                onChange={(e) => setAssignedGroupName(e.target.value)}
                placeholder="e.g. Group Alpha (CS-2025)"
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">Due Date & Time</label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-[#0F1218] border-[#2A3142] text-white"
              />
            </div>
          </Card>

          <Card className="p-5 bg-[#151923] border-[#2A3142] space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1.5" /> Next Steps
            </h3>
            <p className="text-xs text-[#9AA3B5] leading-relaxed">
              After publishing this problem, configure sample and hidden test cases in the{' '}
              <strong className="text-white">Test Case Manager</strong>.
            </p>
          </Card>
        </div>
      </div>
    </form>
  );
}
