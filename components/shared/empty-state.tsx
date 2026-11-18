'use client';

import * as React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-dashed border-border-DEFAULT bg-background-card/40',
        className
      )}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-accent-indigo/20 blur-xl rounded-full" />
        <div className="relative w-14 h-14 rounded-2xl bg-background-elevated border border-border-DEFAULT flex items-center justify-center text-accent-indigo shadow-lg shadow-accent-indigo/10">
          <Icon className="w-7 h-7" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>

      {action && (
        <Button onClick={action.onClick} variant="default" size="sm">
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
