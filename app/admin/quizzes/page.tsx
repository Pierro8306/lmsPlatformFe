'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileQuestion,
  Plus,
  Search,
  Clock,
  Calendar,
  Sparkles,
  Users,
  Award,
  MoreVertical,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { quizService } from '@/services/quiz.service';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { EmptyState } from '@/components/shared/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import type { Quiz, Question, ExtractedQuestion } from '@/types/quiz';
import type { QuestionFormValues } from '@/lib/validators';

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modals
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);
  const [editingQuiz, setEditingQuiz] = React.useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = React.useState<Quiz | null>(null);

  // Question Management & AI Extraction Modal
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = React.useState<Quiz | null>(null);
  const [activeQuestionTab, setActiveQuestionTab] = React.useState<'manual' | 'ai-extract'>('manual');

  // Quiz Form states
  const [formTitle, setFormTitle] = React.useState('');
  const [formOpenTime, setFormOpenTime] = React.useState(
    new Date().toISOString().slice(0, 16)
  );
  const [formCloseTime, setFormCloseTime] = React.useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );
  const [formDuration, setFormDuration] = React.useState<number>(20);
  const [formAttemptLimit, setFormAttemptLimit] = React.useState<number>(3);
  const [formTargetGroups, setFormTargetGroups] = React.useState('Group Alpha, Group Beta');

  // Manual Question Authoring form states
  const [qText, setQText] = React.useState('');
  const [qPoints, setQPoints] = React.useState<number>(5);
  const [qExplanation, setQExplanation] = React.useState('');
  const [qOptions, setQOptions] = React.useState([
    { text: 'Option A', isCorrect: true },
    { text: 'Option B', isCorrect: false },
    { text: 'Option C', isCorrect: false },
    { text: 'Option D', isCorrect: false },
  ]);

  // AI Extraction states
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractionProgress, setExtractionProgress] = React.useState(0);
  const [extractedList, setExtractedList] = React.useState<ExtractedQuestion[]>([]);

  // Fetch quizzes
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['admin', 'quizzes'],
    queryFn: () => quizService.getAllQuizzes(),
  });

  // Fetch questions for active quiz
  const { data: questions = [], refetch: refetchQuestions } = useQuery({
    queryKey: ['admin', 'quiz-questions', selectedQuizForQuestions?.id],
    queryFn: () =>
      selectedQuizForQuestions
        ? quizService.getQuizQuestions(selectedQuizForQuestions.id)
        : Promise.resolve([]),
    enabled: !!selectedQuizForQuestions,
  });

  // Save Quiz mutation
  const saveQuizMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formTitle,
        openTime: new Date(formOpenTime).toISOString(),
        closeTime: new Date(formCloseTime).toISOString(),
        duration: formDuration,
        timeLimit: formDuration,
        maxAttempts: formAttemptLimit,
        attemptLimit: formAttemptLimit,
        allowedGroups: formTargetGroups.split(',').map((g) => g.trim()),
        isPublished: true,
      };

      if (editingQuiz) {
        return quizService.updateQuiz(editingQuiz.id, payload);
      } else {
        return quizService.createQuiz(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success(editingQuiz ? 'Quiz updated' : 'Quiz created successfully');
      handleCloseQuizModal();
    },
    onError: () => {
      toast.error('Failed to save quiz');
    },
  });

  // Delete Quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: (id: number) => quizService.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success('Quiz deleted');
      setQuizToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete quiz');
    },
  });

  // Create single question mutation
  const createQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuizForQuestions) return;
      const payload: QuestionFormValues = {
        text: qText,
        type: 'multiple_choice',
        points: qPoints,
        explanation: qExplanation || undefined,
        options: qOptions,
      };
      return quizService.createQuestion(selectedQuizForQuestions.id, payload);
    },
    onSuccess: () => {
      refetchQuestions();
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success('Multiple choice question added');
      // Reset question form
      setQText('');
      setQExplanation('');
      setQOptions([
        { text: 'Option A', isCorrect: true },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: false },
        { text: 'Option D', isCorrect: false },
      ]);
    },
    onError: () => {
      toast.error('Failed to add question');
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: number) => quizService.deleteQuestion(qId),
    onSuccess: () => {
      refetchQuestions();
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success('Question removed');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingQuiz(null);
    setFormTitle('');
    setFormOpenTime(new Date().toISOString().slice(0, 16));
    setFormCloseTime(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));
    setFormDuration(20);
    setFormAttemptLimit(3);
    setFormTargetGroups('Group Alpha, Group Beta');
    setIsQuizModalOpen(true);
  };

  const handleOpenEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormTitle(quiz.title);
    setFormOpenTime(
      quiz.openTime
        ? new Date(quiz.openTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setFormCloseTime(
      quiz.closeTime
        ? new Date(quiz.closeTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setFormDuration(quiz.duration || quiz.timeLimit || 20);
    setFormAttemptLimit(quiz.maxAttempts || 3);
    setFormTargetGroups((quiz.allowedGroups || []).join(', ') || 'Group Alpha');
    setIsQuizModalOpen(true);
  };

  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
    setEditingQuiz(null);
  };

  // AI Extraction process simulation
  const handlePdfUpload = async (file: File) => {
    setIsExtracting(true);
    setExtractionProgress(15);
    const pInterval = setInterval(() => {
      setExtractionProgress((prev) => (prev < 90 ? prev + 18 : prev));
    }, 300);

    try {
      const extracted = await quizService.extractQuestionsFromPdf(file);
      clearInterval(pInterval);
      setExtractionProgress(100);
      setExtractedList(extracted);
      toast.success(`Extracted ${extracted.length} questions from ${file.name}`);
    } catch {
      clearInterval(pInterval);
      toast.error('Failed to parse PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save extracted questions into the quiz
  const handleSaveExtractedQuestions = async () => {
    if (!selectedQuizForQuestions) return;
    for (const eq of extractedList) {
      await quizService.createQuestion(selectedQuizForQuestions.id, {
        text: eq.text,
        type: 'multiple_choice',
        points: eq.points,
        explanation: eq.explanation,
        options: eq.options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      });
    }
    refetchQuestions();
    queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
    toast.success(`Saved ${extractedList.length} AI questions to quiz!`);
    setExtractedList([]);
    setActiveQuestionTab('manual');
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz Management & AI Exam Engine"
        subtitle="Schedule automated examinations, parse syllabus PDFs with AI question extraction, and inspect student gradebooks"
        gradientTitle
      >
        <Button onClick={handleOpenCreateModal} className="shadow-lg shadow-accent-indigo/25">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Quiz
        </Button>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-background-card/60 p-3 rounded-2xl border border-border-DEFAULT">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes..."
            className="pl-9 bg-background-elevated/80 border-border-subtle h-9 text-xs"
          />
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-text-primary">{filteredQuizzes.length}</strong> quizzes
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-background-card/50 border border-border-DEFAULT animate-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No quizzes available"
          description="Create your first timed quiz and author questions manually or import via PDF."
          action={{
            label: 'Create Quiz',
            onClick: handleOpenCreateModal,
            icon: Plus,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border-DEFAULT bg-background-card hover:border-accent-indigo/40 hover:shadow-card-hover transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={
                      quiz.status === 'open'
                        ? 'success'
                        : quiz.status === 'upcoming'
                        ? 'indigo'
                        : 'default'
                    }
                    className="capitalize text-xs font-semibold"
                  >
                    {quiz.status || 'Active'}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-lg hover:bg-background-elevated text-text-muted hover:text-text-primary">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEditModal(quiz)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Setup
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedQuizForQuestions(quiz)}>
                        <Layers className="w-4 h-4 mr-2 text-accent-indigo" />
                        Manage Questions & AI
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/quizzes/${quiz.id}/gradebook`}>
                          <Award className="w-4 h-4 mr-2 text-accent-cyan" />
                          View Gradebook
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setQuizToDelete(quiz)}
                        className="text-status-danger focus:text-status-danger focus:bg-status-danger/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Comprehensive multiple choice assessment.'}
                  </p>
                </div>

                {/* Timing details */}
                <div className="space-y-1.5 pt-1 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Duration: <strong>{quiz.duration || quiz.timeLimit || 20} mins</strong></span>
                    <span>•</span>
                    <span>Max Attempts: <strong>{quiz.maxAttempts || 3}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span>
                      {quiz.openTime
                        ? format(new Date(quiz.openTime), 'MMM d, h:mm a')
                        : 'Open'} —{' '}
                      {quiz.closeTime
                        ? format(new Date(quiz.closeTime), 'MMM d, h:mm a')
                        : 'Indefinite'}
                    </span>
                  </div>

                  {quiz.allowedGroups && quiz.allowedGroups.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-text-muted">Target:</span>
                      {quiz.allowedGroups.map((g, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background-elevated border border-border-subtle text-accent-indigo"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedQuizForQuestions(quiz)}
                  className="flex-1 h-8 text-xs border-accent-indigo/40 hover:bg-accent-indigo hover:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-accent-indigo" />
                  <span>Questions ({quiz.questionCount})</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-8 text-xs text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <Link href={`/admin/quizzes/${quiz.id}/gradebook`}>
                    <Award className="w-3.5 h-3.5 mr-1" />
                    Gradebook
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QUIZ SETUP FORM MODAL */}
      <Modal
        open={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        title={editingQuiz ? 'Edit Quiz Setup' : 'Setup New Quiz'}
        description="Configure timing window, duration, attempt limits, and allowed cohort groups."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Quiz Title</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Midterm: React Architecture & TypeScript"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Open Time</label>
              <Input
                type="datetime-local"
                value={formOpenTime}
                onChange={(e) => setFormOpenTime(e.target.value)}
                className="bg-background-elevated"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Close Time</label>
              <Input
                type="datetime-local"
                value={formCloseTime}
                onChange={(e) => setFormCloseTime(e.target.value)}
                className="bg-background-elevated"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Duration (Minutes)</label>
              <Input
                type="number"
                min={5}
                max={180}
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Attempt Limit</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formAttemptLimit}
                onChange={(e) => setFormAttemptLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Allowed Target Group(s) (Comma-separated)
            </label>
            <Input
              value={formTargetGroups}
              onChange={(e) => setFormTargetGroups(e.target.value)}
              placeholder="e.g. Group Alpha, Group Beta"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
            <Button variant="ghost" onClick={handleCloseQuizModal}>
              Cancel
            </Button>
            <Button
              onClick={() => saveQuizMutation.mutate()}
              disabled={!formTitle.trim() || saveQuizMutation.isPending}
            >
              {saveQuizMutation.isPending ? 'Saving...' : editingQuiz ? 'Update Setup' : 'Create Quiz'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* QUESTION MANAGEMENT & AI EXTRACTION MODAL */}
      <Modal
        open={!!selectedQuizForQuestions}
        onClose={() => {
          setSelectedQuizForQuestions(null);
          setExtractedList([]);
        }}
        title={`Questions: ${selectedQuizForQuestions?.title || ''}`}
        description="Add multiple-choice questions manually or drag & drop course syllabus PDFs for instant AI extraction."
        size="xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Tab selector */}
          <div className="flex items-center bg-background-elevated rounded-xl p-1 border border-border-subtle">
            <button
              onClick={() => setActiveQuestionTab('manual')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeQuestionTab === 'manual'
                  ? 'bg-accent-indigo text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Question Pool ({questions.length})</span>
            </button>
            <button
              onClick={() => setActiveQuestionTab('ai-extract')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeQuestionTab === 'ai-extract'
                  ? 'bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-md'
                  : 'text-accent-indigo hover:text-accent-violet'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Question Extraction (PDF)</span>
            </button>
          </div>

          {/* TAB 1: MANUAL QUESTION MANAGEMENT */}
          {activeQuestionTab === 'manual' && (
            <div className="space-y-6">
              {/* List of existing questions */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-semibold text-text-muted tracking-wider">
                  Configured Questions ({questions.length})
                </h4>

                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-border-DEFAULT bg-background-card/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-accent-indigo/20 text-accent-indigo text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{q.text}</p>
                          <span className="text-[11px] text-accent-cyan font-mono">
                            Points: {q.points}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                        className="h-7 w-7 p-0 text-text-muted hover:text-status-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border ${
                            opt.isCorrect
                              ? 'bg-status-success/10 border-status-success/40 text-status-success font-medium'
                              : 'bg-background-elevated/40 border-border-subtle text-text-secondary'
                          }`}
                        >
                          {opt.isCorrect ? (
                            <Check className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border-DEFAULT shrink-0" />
                          )}
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-text-muted pl-8 italic">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-6">
                    No questions created yet. Use the form below or the AI tab to populate.
                  </p>
                )}
              </div>

              {/* Add New Question Form */}
              <div className="p-4 rounded-2xl border border-border-DEFAULT bg-background-elevated/50 space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-accent-indigo" />
                  Add Multiple-Choice Question
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Question Text</label>
                  <Input
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="e.g. Which hook executes after every DOM repaint?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">
                    Options (Select the radio to mark the correct answer)
                  </label>
                  <div className="space-y-2">
                    {qOptions.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            setQOptions((prev) =>
                              prev.map((o, i) => ({
                                ...o,
                                isCorrect: i === optIdx,
                              }))
                            );
                          }}
                          className="w-4 h-4 text-accent-indigo cursor-pointer"
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQOptions((prev) =>
                              prev.map((o, i) => (i === optIdx ? { ...o, text: val } : o))
                            );
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          className="h-8 text-xs bg-background-card"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">
                    Explanation (Displayed to student after quiz closes)
                  </label>
                  <Input
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="e.g. useEffect runs asynchronously after rendering..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => createQuestionMutation.mutate()}
                    disabled={!qText.trim() || createQuestionMutation.isPending}
                    className="bg-accent-indigo hover:bg-accent-violet"
                  >
                    Add Question to Quiz
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI QUESTION EXTRACTION */}
          {activeQuestionTab === 'ai-extract' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-accent-indigo/30 bg-accent-indigo/10 text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-accent-indigo flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Automated Question Extraction Engine
                </p>
                <p>
                  Upload your syllabus, lecture slides, or textbook PDF. Our neural model will extract
                  key concepts, draft multiple-choice questions, generate distractors, and allow you
                  to review and edit before saving.
                </p>
              </div>

              {/* Drag & drop PDF upload zone */}
              <FileUpload
                onFileSelect={handlePdfUpload}
                isLoading={isExtracting}
                progress={extractionProgress}
                helperText="Upload Course PDF / Exam Material (up to 10MB)"
              />

              {/* Review & Edit Extracted Questions List */}
              {extractedList.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <h4 className="text-sm font-heading font-bold text-text-primary">
                      Review Extracted Questions ({extractedList.length})
                    </h4>
                    <span className="text-xs text-text-muted">
                      You can edit option text or correct answers before saving
                    </span>
                  </div>

                  <div className="space-y-4">
                    {extractedList.map((eq, eqIdx) => (
                      <div
                        key={eq.id}
                        className="p-4 rounded-2xl border border-border-DEFAULT bg-background-elevated/60 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-accent-indigo">
                            Question #{eqIdx + 1}
                          </span>
                          <span className="text-xs text-text-muted">{eq.points} Points</span>
                        </div>

                        <Input
                          value={eq.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExtractedList((prev) =>
                              prev.map((item, i) => (i === eqIdx ? { ...item, text: val } : item))
                            );
                          }}
                          className="font-medium text-xs bg-background-card"
                        />

                        {/* Options */}
                        <div className="space-y-2">
                          {eq.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`extracted-${eq.id}`}
                                checked={opt.isCorrect}
                                onChange={() => {
                                  setExtractedList((prev) =>
                                    prev.map((item, i) =>
                                      i === eqIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o, oi) => ({
                                              ...o,
                                              isCorrect: oi === oIdx,
                                            })),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-4 h-4 text-accent-indigo cursor-pointer"
                              />
                              <Input
                                value={opt.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExtractedList((prev) =>
                                    prev.map((item, i) =>
                                      i === eqIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o, oi) =>
                                              oi === oIdx ? { ...o, text: val } : o
                                            ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="h-8 text-xs bg-background-card"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save All Extracted CTA */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                    <Button variant="ghost" onClick={() => setExtractedList([])}>
                      Discard
                    </Button>
                    <Button
                      onClick={handleSaveExtractedQuestions}
                      className="bg-gradient-to-r from-accent-indigo to-accent-violet hover:brightness-110 shadow-lg shadow-accent-indigo/25"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Save Extracted Questions to Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Quiz Dialog */}
      <ConfirmDialog
        open={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        onConfirm={() => {
          if (quizToDelete) deleteQuizMutation.mutate(quizToDelete.id);
        }}
        title="Delete Quiz Assessment"
        description={`Are you sure you want to delete "${quizToDelete?.title}"? All student attempts and grade history will be purged.`}
        confirmText="Delete Quiz"
        variant="danger"
        isLoading={deleteQuizMutation.isPending}
      />
    </div>
  );
}
