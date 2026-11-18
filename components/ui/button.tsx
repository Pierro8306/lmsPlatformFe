'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button variants using class-variance-authority.
 * Supports gradient primary, secondary surface, ghost, danger, outline, and link styles.
 */
const buttonVariants = cva(
  // Base styles shared across all variants
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-xl font-medium text-sm transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-background-base',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        /** Gradient indigo → violet — primary CTA */
        default: [
          'bg-gradient-to-r from-accent-indigo to-accent-violet text-white',
          'shadow-lg shadow-accent-indigo/25',
          'hover:shadow-accent-indigo/40 hover:brightness-110',
        ],
        /** Muted surface background */
        secondary: [
          'bg-background-elevated text-text-primary border border-border-DEFAULT',
          'hover:bg-background-card hover:border-border-subtle',
        ],
        /** Transparent, shows on hover */
        ghost: [
          'text-text-secondary hover:bg-background-elevated hover:text-text-primary',
        ],
        /** Destructive / danger action */
        danger: [
          'bg-status-danger text-white',
          'shadow-lg shadow-status-danger/25',
          'hover:bg-status-danger/90 hover:shadow-status-danger/40',
        ],
        /** Border only */
        outline: [
          'border border-border-DEFAULT text-text-primary bg-transparent',
          'hover:bg-background-elevated hover:border-accent-indigo hover:text-accent-indigo',
        ],
        /** Underline link style */
        link: [
          'text-accent-indigo underline-offset-4 hover:underline',
          'h-auto p-0',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (Radix Slot pattern) */
  asChild?: boolean;
  /** Show loading spinner and disable interaction */
  isLoading?: boolean;
  /** Text shown next to spinner during loading */
  loadingText?: string;
}

/**
 * EduFlow primary Button component.
 * Supports all CVA variants, loading state, and asChild (Slot) composition.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
