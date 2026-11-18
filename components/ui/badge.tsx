'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        /** Indigo — default accent */
        default:
          'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30',
        indigo:
          'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30',
        cyan:
          'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30',
        /** Green — success / active */
        success:
          'bg-status-success/20 text-status-success border border-status-success/30',
        /** Amber — warning / pending */
        warning:
          'bg-status-warning/20 text-status-warning border border-status-warning/30',
        /** Red — danger / error */
        danger:
          'bg-status-danger/20 text-status-danger border border-status-danger/30',
        /** Muted secondary */
        secondary:
          'bg-background-elevated text-text-secondary border border-border-DEFAULT',
        /** Transparent border only */
        outline:
          'bg-transparent text-text-primary border border-border-DEFAULT',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge — small status/label chip with semantic colour variants.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
