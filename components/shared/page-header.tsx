'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  className?: string;
  gradientTitle?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  backHref,
  onBack,
  children,
  className,
  gradientTitle = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {(backHref || onBack) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 rounded-lg text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <h1
            className={cn(
              'text-2xl sm:text-3xl font-bold font-heading tracking-tight',
              gradientTitle
                ? 'bg-gradient-to-r from-text-primary via-accent-indigo to-accent-violet bg-clip-text text-transparent'
                : 'text-text-primary'
            )}
          >
            {title}
          </h1>

          {badge && <div className="ml-2">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-sm text-text-secondary max-w-2xl">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}
