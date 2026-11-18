'use client';

import React, { useState } from 'react';
import { ProblemForm } from '@/components/admin/problem-form';
import { createProblem } from '@/services/problem.service';
import type { Problem } from '@/types/problem';

export default function NewProblemPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: Partial<Problem>) => {
    setIsSubmitting(true);
    try {
      await createProblem(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ProblemForm onSubmit={handleCreate} isSubmitting={isSubmitting} />;
}
