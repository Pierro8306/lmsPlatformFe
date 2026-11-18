'use strict';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCode,
  Loader2,
  Cpu,
} from 'lucide-react';
import type { Verdict } from '@/types/problem';

interface VerdictBadgeProps {
  verdict: Verdict;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VerdictBadge({
  verdict,
  showIcon = true,
  className = '',
  size = 'md',
}: VerdictBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  switch (verdict) {
    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          Accepted
        </span>
      );

    case 'WRONG_ANSWER':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          Wrong Answer
        </span>
      );

    case 'TIME_LIMIT_EXCEEDED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          Time Limit Exceeded
        </span>
      );

    case 'MEMORY_LIMIT_EXCEEDED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          Memory Limit Exceeded
        </span>
      );

    case 'RUNTIME_ERROR':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />}
          Runtime Error
        </span>
      );

    case 'COMPILE_ERROR':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-zinc-500/15 text-zinc-300 border border-zinc-600/30 ${sizeClasses} ${className}`}
        >
          {showIcon && <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          Compile Error
        </span>
      );

    case 'RUNNING':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse ${sizeClasses} ${className}`}
        >
          {showIcon && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />}
          Running...
        </span>
      );

    case 'IN_QUEUE':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ${sizeClasses} ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          In Queue
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 ${sizeClasses} ${className}`}
        >
          {verdict}
        </span>
      );
  }
}
