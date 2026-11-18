'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total record count for display */
  totalItems?: number;
  /** Items per page for display */
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Generate page number array with ellipsis markers.
 */
function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | 'ellipsis'> = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

/**
 * Pagination — page number list with prev/next and total display.
 */
function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = getPageNumbers(page, totalPages);

  const rangeStart = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const rangeEnd = pageSize ? Math.min(page * pageSize, totalItems ?? 0) : undefined;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4',
        className
      )}
    >
      {/* Count display */}
      {totalItems !== undefined && (
        <p className="text-sm text-text-muted">
          {pageSize
            ? `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`
            : `${totalItems} items`}
        </p>
      )}

      {/* Page buttons */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-text-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={p !== page ? 'text-text-secondary' : ''}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}

export { Pagination };
