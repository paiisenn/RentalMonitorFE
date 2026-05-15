import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'XÁC NHẬN',
  cancelLabel = 'HỦY',
  variant = 'danger',
  isLoading
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-500">
           <AlertTriangle size={32} />
        </div>
        <div>
          <p className="text-[12px] text-zinc-300 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant} className="flex-1 shadow-lg" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
