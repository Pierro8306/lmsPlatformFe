'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
 * Card root
 * ---------------------------------------------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply glassmorphism backdrop blur effect */
  glass?: boolean;
}

/**
 * Card — dark surface container with optional glass effect.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-border-subtle bg-background-card text-text-primary',
        'shadow-lg shadow-black/20',
        glass && 'backdrop-blur-xl bg-background-card/70',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/* -------------------------------------------------------------------------
 * CardHeader
 * ---------------------------------------------------------------------- */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1 p-6 pb-0', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/* -------------------------------------------------------------------------
 * CardTitle
 * ---------------------------------------------------------------------- */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-text-primary font-heading',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/* -------------------------------------------------------------------------
 * CardDescription
 * ---------------------------------------------------------------------- */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/* -------------------------------------------------------------------------
 * CardContent
 * ---------------------------------------------------------------------- */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/* -------------------------------------------------------------------------
 * CardFooter
 * ---------------------------------------------------------------------- */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
