'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
 * Root + Trigger (passthrough)
 * ---------------------------------------------------------------------- */
const ModalRoot = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

/* -------------------------------------------------------------------------
 * Overlay — dark blur background
 * ---------------------------------------------------------------------- */
const ModalOverlay = React.forwardRef<
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
ModalOverlay.displayName = 'ModalOverlay';

/* -------------------------------------------------------------------------
 * Modal (Dialog.Content)
 *
 * FIX 1: Căn giữa bằng flex wrapper thay vì `-translate-x/y-1/2`.
 *        framer-motion ghi đè thuộc tính `transform` inline (scale + y) nên
 *        class translate của Tailwind bị mất -> modal lệch xuống dưới/phải.
 * FIX 2: Giới hạn chiều cao theo viewport + cho phần thân cuộn được,
 *        header/footer luôn hiển thị -> không còn bị cắt mất nội dung.
 * ---------------------------------------------------------------------- */
interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Max width class override, default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Hide the default close (X) button */
  hideClose?: boolean;
}

const sizeMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, size = 'md', hideClose = false, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    {/* Wrapper căn giữa: click xuyên xuống overlay nên bấm ra ngoài vẫn đóng được */}
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'pointer-events-auto relative flex w-full flex-col overflow-hidden',
            'max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]',
            sizeMap[size],
            'rounded-2xl bg-background-elevated border border-border-DEFAULT',
            'shadow-2xl shadow-black/50',
            'focus:outline-none',
            className
          )}
        >
          {children}

          {!hideClose && (
            <DialogPrimitive.Close
              className={cn(
                'absolute right-3 top-3 rounded-lg p-1.5',
                'text-text-muted hover:text-text-primary hover:bg-background-card',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-accent-indigo'
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </div>
  </ModalPortal>
));
ModalContent.displayName = 'ModalContent';

/* -------------------------------------------------------------------------
 * Section sub-components (gọn hơn: padding nhỏ hơn, header không bị co)
 * ---------------------------------------------------------------------- */
function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-0.5 px-5 pb-3 pt-4 pr-12 border-b border-border-subtle',
        className
      )}
      {...props}
    />
  );
}
ModalHeader.displayName = 'ModalHeader';

function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto px-5 py-4',
        '[scrollbar-width:thin] [scrollbar-color:theme(colors.border.DEFAULT)_transparent]',
        className
      )}
      {...props}
    />
  );
}
ModalBody.displayName = 'ModalBody';

function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end gap-2 px-5 py-3 border-t border-border-subtle',
        className
      )}
      {...props}
    />
  );
}
ModalFooter.displayName = 'ModalFooter';

/* -------------------------------------------------------------------------
 * Convenience title + description
 * ---------------------------------------------------------------------- */
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-base font-semibold text-text-primary font-heading', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-xs leading-relaxed text-text-secondary', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

/* -------------------------------------------------------------------------
 * Composed <Modal> component for simple use cases
 * ---------------------------------------------------------------------- */
interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalContentProps['size'];
  hideClose?: boolean;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  /** Nút Cancel/Save ghim cố định ở đáy modal (tùy chọn) */
  footer?: React.ReactNode;
  /**
   * Không tự bọc children bằng ModalBody (padding + cuộn).
   * Dùng khi children đã tự dùng ModalHeader/ModalBody/ModalFooter (vd: ConfirmDialog).
   */
  bare?: boolean;
  /** Class thêm cho vùng thân (body) */
  bodyClassName?: string;
}

function Modal({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  size,
  hideClose,
  children,
  trigger,
  footer,
  bare = false,
  bodyClassName,
}: ModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <ModalRoot open={open} onOpenChange={handleOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <AnimatePresence>
        {open && (
          <ModalContent size={size} hideClose={hideClose}>
            {(title || description) && (
              <ModalHeader>
                {title && <ModalTitle>{title}</ModalTitle>}
                {description && <ModalDescription>{description}</ModalDescription>}
              </ModalHeader>
            )}
            {bare ? (
              children
            ) : (
              <ModalBody className={bodyClassName}>{children}</ModalBody>
            )}
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </ModalContent>
        )}
      </AnimatePresence>
    </ModalRoot>
  );
}

export {
  Modal,
  ModalRoot,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};