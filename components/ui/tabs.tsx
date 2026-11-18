'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const TabsRoot = TabsPrimitive.Root;

/* -------------------------------------------------------------------------
 * TabsList — horizontal pill row with active underline indicator
 * ---------------------------------------------------------------------- */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'relative flex items-center gap-1',
      'bg-background-card rounded-xl p-1',
      'border border-border-subtle',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/* -------------------------------------------------------------------------
 * TabsTrigger — individual tab with active indicator line at bottom
 * ---------------------------------------------------------------------- */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
      'rounded-lg px-4 py-2 text-sm font-medium',
      'text-text-secondary transition-all duration-200',
      'outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo',
      'disabled:pointer-events-none disabled:opacity-50',
      // Active state: bright text + background highlight + indigo underline
      'data-[state=active]:text-text-primary data-[state=active]:bg-background-elevated',
      'data-[state=active]:shadow-sm',
      // Underline indicator via after pseudo-element
      'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full',
      'after:scale-x-0 after:bg-gradient-to-r after:from-accent-indigo after:to-accent-violet',
      'after:transition-transform after:duration-200',
      'data-[state=active]:after:scale-x-100',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* -------------------------------------------------------------------------
 * TabsContent
 * ---------------------------------------------------------------------- */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 outline-none',
      'focus-visible:ring-2 focus-visible:ring-accent-indigo rounded-lg',
      // Fade-in animation
      'data-[state=active]:animate-in data-[state=active]:fade-in-0',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/* -------------------------------------------------------------------------
 * Composed Tabs convenience component
 * ---------------------------------------------------------------------- */
interface TabsProps {
  tabs: Array<{ value: string; label: React.ReactNode; content: React.ReactNode }>;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  listClassName?: string;
}

function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
}: TabsProps) {
  return (
    <TabsRoot
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList className={listClassName}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent };
