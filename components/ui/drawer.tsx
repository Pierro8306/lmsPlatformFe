'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DrawerRoot = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;
const DrawerPortal = DialogPrimitive.Portal;

/* -------------------------------------------------------------------------
 * Overlay
 * ---------------------------------------------------------------------- */
const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

/* -------------------------------------------------------------------------
 * DrawerContent — slides in from right or left
 * ---------------------------------------------------------------------- */
interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right';
  /** Width tailwind class, default 'w-[400px]' */
  widthClass?: string;
  title?: string;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      className,
      children,
      side = 'right',
      widthClass = 'w-[400px]',
      title,
      ...props
    },
    ref
  ) => {
    const variants = {
      hidden: { x: side === 'right' ? '100%' : '-100%', opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: side === 'right' ? '100%' : '-100%', opacity: 0 },
    };

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DialogPrimitive.Content ref={ref} asChild {...props}>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed top-0 z-50 h-full flex flex-col',
              side === 'right' ? 'right-0' : 'left-0',
              widthClass,
              'bg-background-elevated border-border-DEFAULT shadow-2xl shadow-black/50',
              side === 'right'
                ? 'border-l rounded-l-2xl'
                : 'border-r rounded-r-2xl',
              'focus:outline-none',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              {title ? (
                <DialogPrimitive.Title className="text-lg font-semibold text-text-primary font-heading">
                  {title}
                </DialogPrimitive.Title>
              ) : (
                <DialogPrimitive.Title className="sr-only">
                  Drawer
                </DialogPrimitive.Title>
              )}
              <DrawerClose className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-background-card transition-colors">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </DialogPrimitive.Content>
      </DrawerPortal>
    );
  }
);
DrawerContent.displayName = 'DrawerContent';

/* -------------------------------------------------------------------------
 * Composed Drawer component
 * ---------------------------------------------------------------------- */
interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  title?: string;
  widthClass?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

function Drawer({
  open,
  onOpenChange,
  side = 'right',
  title,
  widthClass,
  children,
  trigger,
}: DrawerProps) {
  return (
    <DrawerRoot open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <AnimatePresence>
        {open && (
          <DrawerContent side={side} title={title} widthClass={widthClass}>
            {children}
          </DrawerContent>
        )}
      </AnimatePresence>
    </DrawerRoot>
  );
}

export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
};
