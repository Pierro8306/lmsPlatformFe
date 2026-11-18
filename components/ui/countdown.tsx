'use client';

import * as React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  initialSeconds?: number;
  targetDate?: string | Date;
  onExpire?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  warnThresholdSeconds?: number; // e.g. 300 (5 mins)
  dangerThresholdSeconds?: number; // e.g. 60 (1 min)
  variant?: 'inline' | 'card' | 'badge';
}

export function Countdown({
  initialSeconds,
  targetDate,
  onExpire,
  className,
  size = 'md',
  showIcon = true,
  warnThresholdSeconds = 300,
  dangerThresholdSeconds = 60,
  variant = 'badge',
}: CountdownProps) {
  const calculateRemaining = React.useCallback((): number => {
    if (typeof initialSeconds === 'number') {
      return initialSeconds;
    }
    if (targetDate) {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      return diff;
    }
    return 0;
  }, [initialSeconds, targetDate]);

  const [secondsLeft, setSecondsLeft] = React.useState<number>(calculateRemaining);
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    setSecondsLeft(calculateRemaining());
    expiredRef.current = false;
  }, [calculateRemaining]);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  // Format time components
  const days = Math.floor(secondsLeft / (3600 * 24));
  const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const isDanger = secondsLeft > 0 && secondsLeft <= dangerThresholdSeconds;
  const isWarning =
    secondsLeft > dangerThresholdSeconds && secondsLeft <= warnThresholdSeconds;
  const isExpired = secondsLeft === 0;

  const colorClasses = isExpired
    ? 'text-text-muted bg-background-elevated border-border-subtle'
    : isDanger
    ? 'text-status-danger bg-status-danger/10 border-status-danger/40 animate-pulse'
    : isWarning
    ? 'text-status-warning bg-status-warning/10 border-status-warning/40'
    : 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30';

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border font-mono',
          colorClasses,
          className
        )}
      >
        {showIcon && (
          <div className="p-2 rounded-xl bg-background-card/60">
            {isDanger ? (
              <AlertTriangle className="w-5 h-5 text-status-danger" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-lg font-bold">
          {days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span>{pad(days)}</span>
                <span className="text-[10px] font-sans font-normal text-text-muted">d</span>
              </div>
              <span>:</span>
            </>
          )}
          <div className="flex flex-col items-center">
            <span>{pad(hours)}</span>
            <span className="text-[10px] font-sans font-normal text-text-muted">h</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{pad(minutes)}</span>
            <span className="text-[10px] font-sans font-normal text-text-muted">m</span>
          </div>
          <span>:</span>
          <div className="flex flex-col items-center">
            <span>{pad(seconds)}</span>
            <span className="text-[10px] font-sans font-normal text-text-muted">s</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-medium tracking-wide transition-colors',
        size === 'sm' && 'text-xs px-2.5 py-0.5 rounded-lg',
        size === 'md' && 'text-sm px-3 py-1',
        size === 'lg' && 'text-base px-4 py-1.5 rounded-2xl font-bold',
        colorClasses,
        className
      )}
    >
      {showIcon && (
        isDanger ? (
          <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        ) : (
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        )
      )}
      <span>
        {days > 0 && `${days}d `}
        {hours > 0 || days > 0 ? `${pad(hours)}:` : ''}
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
