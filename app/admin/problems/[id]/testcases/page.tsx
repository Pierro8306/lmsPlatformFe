'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Layers,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getProblem,
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  reorderTestCases,
} from '@/services/problem.service';
import type { Problem, TestCase } from '@/types/problem';

export default function AdminTestCasesPage() {
  const params = useParams();
  const problemId = params?.id as string;
  const router = useRouter();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTc, setEditingTc] = useState<TestCase | null>(null);
  const [formInput, setFormInput] = useState('');
  const [formOutput, setFormOutput] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formPoints, setFormPoints] = useState(20);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prob, tests] = await Promise.all([
        getProblem(problemId),
        getTestCases(problemId),
      ]);
      setProblem(prob);
      setTestCases(tests);
    } catch (err: any) {
      toast.error('Failed to load test cases');
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

  const openCreateModal = () => {
    setEditingTc(null);
    setFormInput('');
    setFormOutput('');
    setFormIsVisible(true);
    setFormPoints(20);
    setIsEditing(true);
  };

  const openEditModal = (tc: TestCase) => {
    setEditingTc(tc);
    setFormInput(tc.input);
    setFormOutput(tc.expectedOutput);
    setFormIsVisible(tc.isVisible);
    setFormPoints(tc.points);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTc) {
        await updateTestCase(problemId, editingTc.id, {
          input: formInput,
          expectedOutput: formOutput,
          isVisible: formIsVisible,
          points: Number(formPoints),
        });
        toast.success('Test case updated');
      } else {
        await createTestCase(problemId, {
          input: formInput,
          expectedOutput: formOutput,
          isVisible: formIsVisible,
          points: Number(formPoints),
        });
        toast.success('Test case created');
      }
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to save test case');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTestCase(problemId, deleteId);
      toast.success('Test case deleted');
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete test case');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= testCases.length) return;

    const updated = [...testCases];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setTestCases(updated);

    try {
      await reorderTestCases(
        problemId,
        updated.map((t) => t.id)
      );
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
      fetchData();
    }
  };

  const toggleVisibility = async (tc: TestCase) => {
    try {
      await updateTestCase(problemId, tc.id, { isVisible: !tc.isVisible });
      setTestCases((prev) =>
        prev.map((t) => (t.id === tc.id ? { ...t, isVisible: !t.isVisible } : t))
      );
      toast.success(tc.isVisible ? 'Test case is now hidden' : 'Test case is now visible');
    } catch (err) {
      toast.error('Failed to toggle visibility');
    }
  };

  const totalPointsSum = testCases.reduce((acc, tc) => acc + (tc.points || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232938]">
        <div className="flex items-center space-x-3">
          <Link href="/admin/problems">
            <Button variant="ghost" className="text-[#9AA3B5] hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center">
              <Layers className="w-5 h-5 text-indigo-400 mr-2" />
              Test Case Manager
            </h1>
            <p className="text-xs text-[#9AA3B5] mt-0.5">
              Problem: <span className="text-white font-medium">{problem?.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#151923] border border-[#2A3142] px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs">
            <span className="text-[#9AA3B5]">Total Allocated Points:</span>
            <span className="text-white font-bold">{totalPointsSum} pts</span>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Test Case
          </Button>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-[#9AA3B5]">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading test cases...</p>
          </div>
        ) : testCases.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No test cases yet"
            description="Add at least one sample test case and one hidden evaluation case."
            action={{
              label: 'Add First Test Case',
              onClick: openCreateModal,
              icon: Plus,
            }}
          />
        ) : (
          testCases.map((tc, idx) => (
            <Card
              key={tc.id}
              className="p-4 bg-[#151923] border-[#2A3142] hover:border-[#374151] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 text-[#6B7385] hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === testCases.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 text-[#6B7385] hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(tc)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1 border transition-colors ${
                          tc.isVisible
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {tc.isVisible ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" /> Visible Sample
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" /> Hidden Test
                          </>
                        )}
                      </button>

                      <span className="text-xs text-[#9AA3B5] bg-[#0F1218] px-2 py-0.5 rounded border border-[#2A3142]">
                        {tc.points} points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(tc)}
                    className="text-xs text-[#9AA3B5] hover:text-white h-7 px-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(tc.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>

              {/* Input & Output Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#232938]">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#6B7385] uppercase tracking-wider">
                    Standard Input
                  </span>
                  <pre className="bg-[#0F1218] border border-[#2A3142] text-zinc-300 font-mono text-xs p-2.5 rounded max-h-24 overflow-auto">
                    {tc.input || '<empty>'}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#6B7385] uppercase tracking-wider">
                    Expected Output
                  </span>
                  <pre className="bg-[#0F1218] border border-[#2A3142] text-emerald-300 font-mono text-xs p-2.5 rounded max-h-24 overflow-auto">
                    {tc.expectedOutput || '<empty>'}
                  </pre>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 bg-[#151923] border-[#2A3142] shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">
              {editingTc ? 'Edit Test Case' : 'Add New Test Case'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">
                  Input Data
                </label>
                <Textarea
                  rows={4}
                  value={formInput}
                  onChange={(e) => setFormInput(e.target.value)}
                  placeholder="e.g. nums = [2,7,11,15], target = 9"
                  className="bg-[#0F1218] border-[#2A3142] text-white font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">
                  Expected Output
                </label>
                <Textarea
                  rows={3}
                  value={formOutput}
                  onChange={(e) => setFormOutput(e.target.value)}
                  placeholder="e.g. [0,1]"
                  className="bg-[#0F1218] border-[#2A3142] text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">
                    Points Weight
                  </label>
                  <Input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="bg-[#0F1218] border-[#2A3142] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9AA3B5] mb-1.5">
                    Visibility Mode
                  </label>
                  <select
                    value={formIsVisible ? 'visible' : 'hidden'}
                    onChange={(e) => setFormIsVisible(e.target.value === 'visible')}
                    className="w-full bg-[#0F1218] border border-[#2A3142] text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="visible">Visible Sample Case</option>
                    <option value="hidden">Hidden Evaluation Case</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#232938]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[#9AA3B5]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {editingTc ? 'Save Changes' : 'Create Test Case'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Test Case?"
        description="Are you sure you want to remove this test case? Existing submissions will not be re-evaluated automatically."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Test Case'}
        variant="danger"
      />
    </div>
  );
}
