'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from '@/components/ui/resizable';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Countdown } from '@/components/ui/countdown';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { CodeEditor } from '@/components/shared/code-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Settings,
  Terminal,
  FileText,
  History,
  MessageSquare,
  Clock,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getProblem,
  getTestCases,
  getSubmissions,
  runCode,
  submitCode,
} from '@/services/problem.service';
import type {
  Problem,
  TestCase,
  Submission,
  Language,
  JudgeResult,
  Verdict,
} from '@/types/problem';

const AVAILABLE_LANGUAGES: { key: Language; label: string }[] = [
  { key: 'python', label: 'Python 3' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'java', label: 'Java' },
  { key: 'cpp', label: 'C++' },
];

export default function StudentProblemWorkspacePage() {
  const params = useParams();
  const problemId = params?.id as string;
  const router = useRouter();

  // Core Data
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor State
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(14);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Left Pane Active Tab
  const [leftTab, setLeftTab] = useState<'description' | 'submissions' | 'feedback'>('description');

  // Bottom Console State
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'custom' | 'output'>('testcases');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>('');

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [judgeProgress, setJudgeProgress] = useState<'IDLE' | 'IN_QUEUE' | 'RUNNING' | 'FINISHED'>('IDLE');
  const [lastResult, setLastResult] = useState<JudgeResult | null>(null);

  // Dialogs
  const [showLangChangeConfirm, setShowLangChangeConfirm] = useState<Language | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Exam Mode
  const [examMode, setExamMode] = useState(false);
  const [examDurationSec, setExamDurationSec] = useState(1800); // 30 mins
  const [examEndTime, setExamEndTime] = useState<string | null>(null);

  // Inspected Old Submission
  const [viewingOldSubmission, setViewingOldSubmission] = useState<Submission | null>(null);

  // Load problem details
  useEffect(() => {
    if (!problemId) return;
    setIsLoading(true);

    Promise.all([
      getProblem(problemId),
      getTestCases(problemId),
      getSubmissions(problemId),
    ])
      .then(([prob, tests, subs]) => {
        setProblem(prob);
        setTestCases(tests);
        setSubmissions(subs);

        // Load autosaved draft from localStorage if present
        const savedDraft = localStorage.getItem(`draft_${problemId}_${language}`);
        if (savedDraft) {
          setCode(savedDraft);
        } else {
          setCode(prob.starterCode[language] || '');
        }
      })
      .catch((err) => {
        toast.error('Problem not found');
        router.push('/student/problems');
      })
      .finally(() => setIsLoading(false));
  }, [problemId]);

  // Debounced Autosave to localStorage
  useEffect(() => {
    if (!problemId || !code) return;
    setIsSaved(false);

    const timer = setTimeout(() => {
      localStorage.setItem(`draft_${problemId}_${language}`, code);
      setIsSaved(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [code, problemId, language]);

  // Warn before leaving if running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || !isSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, isSaved]);

  // Switch Language with safety check
  const handleLanguageSelect = (newLang: Language) => {
    if (newLang === language) return;

    const savedDraft = localStorage.getItem(`draft_${problemId}_${newLang}`);
    const starter = problem?.starterCode[newLang] || '';

    // Check if current code is modified from starter
    const currentStarter = problem?.starterCode[language] || '';
    if (code.trim() !== currentStarter.trim()) {
      setShowLangChangeConfirm(newLang);
    } else {
      setLanguage(newLang);
      setCode(savedDraft || starter);
    }
  };

  const confirmLanguageSwitch = () => {
    if (!showLangChangeConfirm) return;
    const target = showLangChangeConfirm;
    const savedDraft = localStorage.getItem(`draft_${problemId}_${target}`);
    const starter = problem?.starterCode[target] || '';

    setLanguage(target);
    setCode(savedDraft || starter);
    setShowLangChangeConfirm(null);
  };

  const handleResetToStarter = () => {
    if (!problem) return;
    const starter = problem.starterCode[language] || '';
    setCode(starter);
    localStorage.removeItem(`draft_${problemId}_${language}`);
    setShowResetConfirm(false);
    toast.success('Code reset to default starter');
  };

  // Run Code (sample tests or custom input)
  const handleRun = async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleTab('output');
    setJudgeProgress('IN_QUEUE');

    try {
      const result = await runCode(
        {
          problemId: problem.id,
          language,
          code,
          customInput: consoleTab === 'custom' ? customInput : undefined,
        },
        {
          onStatusChange: (status) => setJudgeProgress(status),
        }
      );

      setLastResult(result);
      if (result.verdict === 'ACCEPTED') {
        toast.success('Sample tests passed!');
      } else {
        toast.error(`Run finished: ${result.verdict}`);
      }
    } catch (err: any) {
      toast.error('Execution failed');
    } finally {
      setIsRunning(false);
      setJudgeProgress('IDLE');
    }
  };

  // Submit Code (full judge)
  const handleSubmit = async () => {
    if (!problem || isRunning) return;
    setShowSubmitConfirm(false);
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleTab('output');
    setJudgeProgress('IN_QUEUE');

    try {
      const result = await submitCode(
        {
          problemId: problem.id,
          language,
          code,
        },
        {
          onStatusChange: (status) => setJudgeProgress(status),
        }
      );

      setLastResult(result);

      if (result.verdict === 'ACCEPTED') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success('Accepted! All test cases passed!');
      } else {
        toast.error(`Evaluation Result: ${result.verdict}`);
      }

      // Refresh submissions
      const updatedSubs = await getSubmissions(problem.id);
      setSubmissions(updatedSubs);
    } catch (err: any) {
      toast.error('Submission failed');
    } finally {
      setIsRunning(false);
      setJudgeProgress('IDLE');
    }
  };

  // Restore old submission version
  const handleRestoreVersion = (sub: Submission) => {
    setCode(sub.code);
    setLanguage(sub.language);
    setViewingOldSubmission(null);
    setLeftTab('description');
    toast.success(`Restored version from ${new Date(sub.submittedAt).toLocaleTimeString()}`);
  };

  if (isLoading || !problem) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-3 text-[#9AA3B5]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Setting up Coding Arena & Monaco Environment...</p>
      </div>
    );
  }

  const visibleTestCases = testCases.filter((tc) => tc.isVisible);
  const currentSample = visibleTestCases[selectedTestCaseIdx] || visibleTestCases[0];

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] -m-6 bg-[#0B0D12] overflow-hidden text-[#E6E9F0]">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-[#232938] bg-[#0F1218] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/student/problems">
            <Button variant="ghost" size="sm" className="text-[#9AA3B5] hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Arena
            </Button>
          </Link>

          <div className="h-4 w-px bg-[#232938]" />

          <h1 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>{problem.title}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                problem.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : problem.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {problem.difficulty.toUpperCase()}
            </span>
          </h1>

          {/* Autosave Status */}
          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-[#6B7385]">
            {isSaved ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <span>Saving draft...</span>
            )}
          </div>
        </div>

        {/* Center: Exam Mode Banner if active */}
        {examMode && examEndTime && (
          <div className="hidden md:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300 font-mono animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>EXAM TIMER:</span>
            <Countdown targetDate={examEndTime} onExpire={handleSubmit} />
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Exam Mode Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (!examMode) {
                const end = new Date(Date.now() + examDurationSec * 1000).toISOString();
                setExamEndTime(end);
                setExamMode(true);
                toast.info('Exam mode activated! Timer is running.');
              } else {
                setExamMode(false);
                setExamEndTime(null);
                toast.info('Exam mode deactivated.');
              }
            }}
            className={`text-xs h-8 px-2.5 ${
              examMode ? 'bg-amber-500/20 text-amber-300' : 'text-[#9AA3B5] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            {examMode ? 'Exit Exam' : 'Exam Mode'}
          </Button>

          {/* Run Button */}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="bg-[#1A1F2B] hover:bg-[#232938] text-white border border-[#2A3142] text-xs h-8 px-3"
            title="Ctrl/Cmd + Enter"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400 fill-emerald-400" />
            Run
          </Button>

          {/* Submit Button */}
          <Button
            size="sm"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isRunning}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold h-8 px-4 shadow-lg shadow-indigo-500/20"
            title="Ctrl/Cmd + Shift + Enter"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Resizable Workspace */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* LEFT PANE: Description / Submissions / Feedback */}
          <Panel defaultSize={42} minSize={25} className="flex flex-col bg-[#0F1218] border-r border-[#232938]">
            {/* Left Tabs Header */}
            <div className="flex items-center border-b border-[#232938] bg-[#151923] px-2 h-10 shrink-0">
              <button
                type="button"
                onClick={() => setLeftTab('description')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  leftTab === 'description'
                    ? 'bg-[#1A1F2B] text-white'
                    : 'text-[#9AA3B5] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Description</span>
              </button>

              <button
                type="button"
                onClick={() => setLeftTab('submissions')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  leftTab === 'submissions'
                    ? 'bg-[#1A1F2B] text-white'
                    : 'text-[#9AA3B5] hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Submissions ({submissions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeftTab('feedback')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  leftTab === 'feedback'
                    ? 'bg-[#1A1F2B] text-white'
                    : 'text-[#9AA3B5] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Instructor Notes</span>
              </button>
            </div>

            {/* Left Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {leftTab === 'description' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{problem.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] bg-[#1A1F2B] text-[#9AA3B5] px-2 py-0.5 rounded border border-[#2A3142]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <MarkdownRenderer content={problem.description} />

                  {problem.examples && problem.examples.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Examples
                      </h3>
                      {problem.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#151923] rounded-lg border border-[#2A3142] space-y-1.5 text-xs"
                        >
                          <div className="text-white font-medium">Example {idx + 1}:</div>
                          <div className="font-mono text-[#9AA3B5]">
                            <strong className="text-[#6B7385]">Input:</strong> {ex.input}
                          </div>
                          <div className="font-mono text-emerald-300">
                            <strong className="text-[#6B7385]">Output:</strong> {ex.output}
                          </div>
                          {ex.explanation && (
                            <div className="text-[#9AA3B5] italic pt-1">
                              Explanation: {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Constraints
                      </h3>
                      <div className="p-3 bg-[#151923] rounded-lg border border-[#2A3142] text-xs">
                        <MarkdownRenderer content={problem.constraints} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {leftTab === 'submissions' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#232938]">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Submission History
                    </span>
                    <span className="text-xs text-[#9AA3B5]">{submissions.length} attempts</span>
                  </div>

                  {submissions.length === 0 ? (
                    <p className="text-xs text-[#6B7385] italic p-4 text-center">
                      No submissions made yet. Click &quot;Submit&quot; to test all cases!
                    </p>
                  ) : (
                    submissions.map((sub) => (
                      <Card
                        key={sub.id}
                        className="p-3.5 bg-[#151923] border-[#2A3142] hover:border-indigo-500/40 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <VerdictBadge verdict={sub.verdict} size="sm" />
                          <span className="text-xs font-bold text-white bg-[#0F1218] px-2 py-0.5 rounded border border-[#2A3142]">
                            {sub.score}/10
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#9AA3B5]">
                          <span>{sub.language}</span>
                          <span>{sub.executionTimeMs} ms</span>
                          <span>{(sub.memoryKb / 1024).toFixed(1)} MB</span>
                          <span>{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                        </div>

                        <div className="pt-2 border-t border-[#232938] flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingOldSubmission(sub)}
                            className="text-[11px] text-[#9AA3B5] hover:text-white h-7 px-2"
                          >
                            View Code
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRestoreVersion(sub)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 px-2"
                          >
                            Restore Version
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {leftTab === 'feedback' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Instructor Review Notes
                  </h3>

                  {submissions.some((s) => s.feedback) ? (
                    submissions
                      .filter((s) => s.feedback)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-3.5 bg-[#151923] rounded-lg border border-indigo-500/30 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-indigo-300">
                              Feedback on {s.language} attempt
                            </span>
                            <span className="text-[#6B7385]">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-[#E6E9F0]">{s.feedback}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-[#6B7385] italic p-4 text-center">
                      No instructor notes attached yet. Check back after assignment review!
                    </p>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* RESIZE HANDLE */}
          <PanelResizeHandle className="w-1.5 bg-[#232938] hover:bg-indigo-500 transition-colors cursor-col-resize" />

          {/* RIGHT PANE: Code Editor & Collapsible Console */}
          <Panel defaultSize={58} minSize={30} className="flex flex-col bg-[#0B0D12]">
            {/* Editor Toolbar */}
            <div className="h-10 border-b border-[#232938] bg-[#151923] px-3 flex items-center justify-between shrink-0">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageSelect(e.target.value as Language)}
                  className="bg-[#0F1218] border border-[#2A3142] text-xs text-white rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang.key} value={lang.key}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-[#9AA3B5] hover:text-white h-7 px-2"
                  title="Reset code to original starter"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
              </div>

              {/* Font Size & Settings */}
              <div className="flex items-center space-x-2 text-xs text-[#9AA3B5]">
                <span>Font:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-[#0F1218] border border-[#2A3142] text-xs text-white rounded px-2 py-0.5"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative overflow-hidden bg-[#0B0D12]">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                fontSize={fontSize}
                onRunShortcut={handleRun}
                onSubmitShortcut={() => setShowSubmitConfirm(true)}
              />
            </div>

            {/* Bottom Collapsible Console */}
            <div
              className={`border-t border-[#232938] bg-[#0F1218] flex flex-col transition-all ${
                isConsoleOpen ? 'h-64' : 'h-9'
              }`}
            >
              {/* Console Tabs Header */}
              <div className="h-9 border-b border-[#232938] bg-[#151923] px-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConsoleTab('testcases');
                      setIsConsoleOpen(true);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                      consoleTab === 'testcases' && isConsoleOpen
                        ? 'bg-[#1A1F2B] text-white'
                        : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>Test Cases</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConsoleTab('custom');
                      setIsConsoleOpen(true);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                      consoleTab === 'custom' && isConsoleOpen
                        ? 'bg-[#1A1F2B] text-white'
                        : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-amber-400" />
                    <span>Custom Input</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConsoleTab('output');
                      setIsConsoleOpen(true);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                      consoleTab === 'output' && isConsoleOpen
                        ? 'bg-[#1A1F2B] text-white'
                        : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Output {lastResult && `(${lastResult.verdict})`}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {judgeProgress !== 'IDLE' && (
                    <span className="text-xs text-cyan-400 animate-pulse font-mono">
                      {judgeProgress === 'IN_QUEUE' ? 'In Queue...' : 'Running Judge...'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className="p-1 text-[#6B7385] hover:text-white"
                  >
                    {isConsoleOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Console Body */}
              {isConsoleOpen && (
                <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
                  {/* Test Cases Tab */}
                  {consoleTab === 'testcases' && (
                    <div className="space-y-3">
                      {/* Case selector pills */}
                      <div className="flex items-center space-x-2">
                        {visibleTestCases.map((tc, idx) => (
                          <button
                            key={tc.id}
                            type="button"
                            onClick={() => setSelectedTestCaseIdx(idx)}
                            className={`px-3 py-1 rounded text-xs transition-colors font-medium ${
                              selectedTestCaseIdx === idx
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#151923] text-[#9AA3B5] hover:text-white border border-[#2A3142]'
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {currentSample && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-[11px] text-[#6B7385] uppercase">Input:</span>
                            <pre className="bg-[#151923] p-2.5 rounded border border-[#2A3142] text-zinc-300 mt-1 overflow-x-auto">
                              {currentSample.input}
                            </pre>
                          </div>

                          <div>
                            <span className="text-[11px] text-[#6B7385] uppercase">Expected Output:</span>
                            <pre className="bg-[#151923] p-2.5 rounded border border-[#2A3142] text-emerald-300 mt-1 overflow-x-auto">
                              {currentSample.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Input Tab */}
                  {consoleTab === 'custom' && (
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#6B7385] uppercase">Standard Input (stdin):</span>
                      <Textarea
                        rows={5}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input arguments to test with your solution..."
                        className="bg-[#151923] border-[#2A3142] text-white font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* Output Tab */}
                  {consoleTab === 'output' && (
                    <div className="space-y-3">
                      {!lastResult ? (
                        <p className="text-[#6B7385] italic">
                          Click &quot;Run&quot; or &quot;Submit&quot; to execute code and view output.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#232938]">
                            <VerdictBadge verdict={lastResult.verdict} size="md" />

                            <div className="flex items-center space-x-3 text-xs text-[#9AA3B5]">
                              <span>
                                Passed: <strong className="text-white">{lastResult.passedTests}/{lastResult.totalTests}</strong>
                              </span>
                              <span>
                                Runtime: <strong className="text-white">{lastResult.executionTimeMs} ms</strong>
                              </span>
                              <span>
                                Memory: <strong className="text-white">{(lastResult.memoryKb / 1024).toFixed(1)} MB</strong>
                              </span>
                            </div>
                          </div>

                          {/* Compile error output */}
                          {lastResult.compileOutput && (
                            <div>
                              <span className="text-rose-400 font-bold uppercase block mb-1">
                                Compilation Output:
                              </span>
                              <pre className="bg-[#151923] text-rose-300 p-3 rounded border border-rose-500/30 overflow-x-auto">
                                {lastResult.compileOutput}
                              </pre>
                            </div>
                          )}

                          {/* Stderr */}
                          {lastResult.stderr && (
                            <div>
                              <span className="text-amber-400 font-bold uppercase block mb-1">
                                Stderr / Exception:
                              </span>
                              <pre className="bg-[#151923] text-amber-300 p-3 rounded border border-amber-500/30 overflow-x-auto">
                                {lastResult.stderr}
                              </pre>
                            </div>
                          )}

                          {/* Stdout */}
                          {lastResult.stdout && (
                            <div>
                              <span className="text-[#9AA3B5] font-bold uppercase block mb-1">
                                Stdout:
                              </span>
                              <pre className="bg-[#151923] text-zinc-300 p-3 rounded border border-[#2A3142] overflow-x-auto">
                                {lastResult.stdout}
                              </pre>
                            </div>
                          )}

                          {/* Test case breakdown list */}
                          {lastResult.testResults && (
                            <div className="space-y-2 pt-2">
                              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                                Test Case Breakdown:
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {lastResult.testResults.map((tr, idx) => (
                                  <div
                                    key={tr.testCaseId || idx}
                                    className={`p-2.5 rounded border flex items-center justify-between ${
                                      tr.passed
                                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {tr.passed ? (
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                      ) : (
                                        <XCircle className="w-4 h-4 shrink-0" />
                                      )}
                                      <span>
                                        Test #{idx + 1} {tr.isVisible ? '(Sample)' : '(Hidden)'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-[#9AA3B5]">
                                      {tr.executionTimeMs} ms
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Language Switch Confirm Dialog */}
      <ConfirmDialog
        open={!!showLangChangeConfirm}
        onClose={() => setShowLangChangeConfirm(null)}
        onConfirm={confirmLanguageSwitch}
        title="Switch Programming Language?"
        description="You have made edits in your current solution. Switching languages will switch to that language's template or your saved draft for it. Do you want to proceed?"
        confirmText="Switch Language"
        variant="warning"
      />

      {/* Reset Code Confirm Dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetToStarter}
        title="Reset Code to Default Template?"
        description="Are you sure you want to discard your edits and revert back to the initial starter code for this language?"
        confirmText="Reset Code"
        variant="danger"
      />

      {/* Submit Solution Confirm Dialog */}
      <ConfirmDialog
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        title="Submit Solution for Full Evaluation?"
        description="Your code will be evaluated against all test cases (including hidden evaluation tests) and recorded on your grade history."
        confirmText="Submit Solution"
        variant="default"
      />

      {/* View Old Submission Modal */}
      {viewingOldSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-[#151923] border-[#2A3142] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Historical Attempt: {new Date(viewingOldSubmission.submittedAt).toLocaleString()}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <VerdictBadge verdict={viewingOldSubmission.verdict} size="sm" />
                  <span className="text-xs text-[#9AA3B5]">{viewingOldSubmission.language}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOldSubmission(null)}
                className="text-[#6B7385] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="h-64 border border-[#2A3142] rounded-lg overflow-hidden bg-[#0B0D12]">
              <CodeEditor
                language={viewingOldSubmission.language}
                value={viewingOldSubmission.code}
                readOnly={true}
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setViewingOldSubmission(null)}
                className="text-xs text-[#9AA3B5]"
              >
                Close
              </Button>
              <Button
                onClick={() => handleRestoreVersion(viewingOldSubmission)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
              >
                Restore This Code into Editor
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
