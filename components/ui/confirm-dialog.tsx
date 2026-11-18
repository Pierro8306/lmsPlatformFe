'use client';

import * as React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalDescription } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'default' | 'danger' | 'warning';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: React.ReactNode; iconClass: string; confirmVariant: 'default' | 'danger' }
> = {
  default: {
    icon: <CheckCircle2 className="h-6 w-6" />,
    iconClass: 'text-accent-indigo bg-accent-indigo/10',
    confirmVariant: 'default',
  },
  danger: {
    icon: <AlertCircle className="h-6 w-6" />,
    iconClass: 'text-status-danger bg-status-danger/10',
    confirmVariant: 'danger',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconClass: 'text-status-warning bg-status-warning/10',
    confirmVariant: 'default',
  },
};

/**
 * ConfirmDialog — reusable confirmation modal with danger/warning/default variants.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmText,
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const { icon, iconClass, confirmVariant } = variantConfig[variant];
  const finalConfirmLabel = confirmText || confirmLabel;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange} onClose={onClose} size="sm" hideClose>
      <ModalHeader>
        <div className="flex items-start gap-4">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconClass)}>
            {icon}
          </div>
          <div className="flex flex-col gap-1">
            <ModalTitle>{title}</ModalTitle>
            {description && <ModalDescription>{description}</ModalDescription>}
          </div>
        </div>
      </ModalHeader>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={() => (onOpenChange ? onOpenChange(false) : onClose?.())}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={handleConfirm}
          isLoading={isLoading}
          className={
            variant === 'warning'
              ? 'bg-status-warning hover:bg-status-warning/90 text-black shadow-status-warning/25'
              : undefined
          }
        >
          {finalConfirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export { ConfirmDialog };
export type { ConfirmVariant };
