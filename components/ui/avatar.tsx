'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
 * Size variants
 * ---------------------------------------------------------------------- */
const avatarVariants = cva('relative inline-flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

/* -------------------------------------------------------------------------
 * AvatarRoot
 * ---------------------------------------------------------------------- */
interface AvatarRootProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /** Show green online indicator dot */
  online?: boolean;
}

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarRootProps
>(({ className, size, online = false, children, ...props }, ref) => (
  <span className="relative inline-flex">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>

    {online && (
      <span
        className={cn(
          'absolute bottom-0 right-0 block rounded-full bg-status-success ring-2 ring-background-base',
          size === 'xs' && 'h-1.5 w-1.5',
          size === 'sm' && 'h-2 w-2',
          (size === 'md' || size === undefined) && 'h-2.5 w-2.5',
          size === 'lg' && 'h-3 w-3',
          size === 'xl' && 'h-3.5 w-3.5',
        )}
      />
    )}
  </span>
));
AvatarRoot.displayName = 'AvatarRoot';

/* -------------------------------------------------------------------------
 * AvatarImage
 * ---------------------------------------------------------------------- */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/* -------------------------------------------------------------------------
 * AvatarFallback — gradient background with initials
 * ---------------------------------------------------------------------- */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full',
      'bg-gradient-to-br from-accent-indigo to-accent-violet',
      'text-white font-semibold tracking-wide',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/* -------------------------------------------------------------------------
 * Composed Avatar component
 * ---------------------------------------------------------------------- */
interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  /** Initials shown when image fails (e.g. "JD") */
  fallback?: string;
  online?: boolean;
  className?: string;
}

/**
 * Avatar — user profile image with fallback initials and online indicator.
 */
function Avatar({ src, alt, fallback, online, size, className }: AvatarProps) {
  return (
    <AvatarRoot size={size} online={online} className={className}>
      {src && <AvatarImage src={src} alt={alt ?? fallback ?? 'Avatar'} />}
      <AvatarFallback delayMs={src ? 600 : 0}>
        {fallback ?? '?'}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback, avatarVariants };
