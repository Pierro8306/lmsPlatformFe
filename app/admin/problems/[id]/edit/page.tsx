'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProblemForm } from '@/components/admin/problem-form';
import { getProblem, updateProblem } from '@/services/problem.service';
import { toast } from 'sonner';
import type { Problem } from '@/types/problem';

export default function EditProblemPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProblem(id)
      .then((data) => setProblem(data))
      .catch((err) => {
        toast.error('Problem not found');
        router.push('/admin/problems');
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const handleUpdate = async (data: Partial<Problem>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateProblem(id, data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#9AA3B5] space-y-2">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Loading problem details...</p>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <ProblemForm
      initialData={problem}
      onSubmit={handleUpdate}
      isSubmitting={isSubmitting}
    />
  );
}
