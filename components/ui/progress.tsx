'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  /** Value 0–100 */
  value: number;
  /** Optional label displayed above */
  label?: string;
  /** Show percentage text on the right of label */
  showPercent?: boolean;
  /** Height class, default 'h-2' */
  heightClass?: string;
  className?: string;
}

/**
 * Progress — animated gradient bar (indigo → violet).
 */
function Progress({
  value,
  label,
  showPercent = false,
  heightClass = 'h-2',
  className,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm text-text-secondary">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-medium text-text-muted">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-background-elevated',
          heightClass
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-violet transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
