'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label displayed above the textarea */
  label?: string;
  /** Error message shown below the textarea */
  error?: string;
  /** Additional wrapper class */
  wrapperClassName?: string;
}

/**
 * Dark-themed Textarea component with label and error state.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, wrapperClassName, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[100px] rounded-xl bg-background-card',
            'border border-border-subtle text-text-primary text-sm',
            'placeholder:text-text-muted px-4 py-3',
            'outline-none focus:ring-2 focus:ring-accent-indigo/50 focus:border-accent-indigo',
            'transition-all duration-200 resize-y',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error &&
              'border-status-danger focus:ring-status-danger/50 focus:border-status-danger',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-status-danger"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
