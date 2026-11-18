'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label displayed above the input */
  label?: string;
  /** Error message shown below the input */
  error?: string;
  /** Icon rendered on the left inside the input */
  leftIcon?: React.ReactNode;
  /** Icon rendered on the right inside the input */
  rightIcon?: React.ReactNode;
  /** Additional wrapper class */
  wrapperClassName?: string;
}

/**
 * Dark-themed Input component with label, error state, and icon slot support.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      wrapperClassName,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left icon slot */}
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              // Base dark styling
              'w-full h-10 rounded-xl bg-background-card',
              'border border-border-subtle text-text-primary text-sm',
              'placeholder:text-text-muted',
              // Focus ring
              'outline-none focus:ring-2 focus:ring-accent-indigo/50 focus:border-accent-indigo',
              'transition-all duration-200',
              // Padding adjustments for icons
              leftIcon ? 'pl-10 pr-4' : 'px-4',
              rightIcon ? 'pr-10' : '',
              // Error state
              error &&
                'border-status-danger focus:ring-status-danger/50 focus:border-status-danger',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {/* Right icon slot */}
          {rightIcon && (
            <span className="absolute right-3 flex items-center text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
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

Input.displayName = 'Input';

export { Input };
