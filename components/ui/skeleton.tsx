'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
 * Shimmer keyframe is defined in tailwind.config.ts as 'shimmer'
 * ---------------------------------------------------------------------- */

interface SkeletonBaseProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base skeleton block — shimmer animation over dark card surface.
 */
function Skeleton({ className, ...props }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-background-elevated',
        // Shimmer sweep via pseudo-element
        'before:absolute before:inset-0',
        'before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------
 * Skeleton shape presets
 * ---------------------------------------------------------------------- */

/** Single text line */
function SkeletonLine({
  className,
  ...props
}: SkeletonBaseProps) {
  return <Skeleton className={cn('h-4 w-full rounded-md', className)} {...props} />;
}

/** Circle (avatar) */
function SkeletonCircle({
  size = 40,
  className,
  style,
  ...props
}: SkeletonBaseProps & { size?: number }) {
  return (
    <Skeleton
      className={cn('shrink-0 rounded-full', className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

/** Card-shaped block */
function SkeletonCard({ className, ...props }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle bg-background-card p-6 space-y-4',
        className
      )}
      {...props}
    >
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

/** Table row skeleton */
function SkeletonTableRow({
  columns = 5,
  className,
  ...props
}: SkeletonBaseProps & { columns?: number }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-border-subtle',
        className
      )}
      {...props}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ maxWidth: i === 0 ? '10%' : undefined }}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonLine, SkeletonCircle, SkeletonCard, SkeletonTableRow };
