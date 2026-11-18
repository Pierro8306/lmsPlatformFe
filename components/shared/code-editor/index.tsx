'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Code2 } from 'lucide-react';
import type { Language } from '@/types/problem';

interface CodeEditorProps {
  value: string;
  language: Language;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  height?: string | number;
  highlightedLines?: Array<{ lineNumber: number; severity: 'suggestion' | 'issue' | 'critical' }>;
  onLineClick?: (lineNumber: number) => void;
  onRunShortcut?: () => void;
  onSubmitShortcut?: () => void;
}

const MonacoWrapper = dynamic(
  () => import('./monaco-wrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] bg-[#0B0D12] flex flex-col p-4 space-y-3 justify-center items-center">
        <div className="flex items-center space-x-2 text-[#9AA3B5] text-sm animate-pulse mb-3">
          <Code2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Initializing Monaco Code Environment...</span>
        </div>
        <div className="w-full space-y-2 opacity-30">
          <Skeleton className="h-4 w-3/4 bg-[#1A1F2B]" />
          <Skeleton className="h-4 w-1/2 bg-[#1A1F2B]" />
          <Skeleton className="h-4 w-5/6 bg-[#1A1F2B]" />
          <Skeleton className="h-4 w-2/3 bg-[#1A1F2B]" />
        </div>
      </div>
    ),
  }
);

export function CodeEditor(props: CodeEditorProps) {
  return <MonacoWrapper {...props} />;
}

export default CodeEditor;
