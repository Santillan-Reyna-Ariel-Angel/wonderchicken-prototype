import React, { useState } from 'react';
import { AppModal } from './AppModal';

export interface ActionModalProps {
  triggerLabel?: string;
  triggerIcon?: string;
  dialogTitle: string;
  dialogDescription?: string;
  dialogIcon?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  confirmIcon?: string;
  cancelLabel?: string;
  triggerColor?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ActionModal: React.FC<ActionModalProps> = ({
  triggerLabel = 'Abrir',
  triggerIcon,
  dialogTitle,
  dialogDescription,
  dialogIcon = 'tune',
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Aceptar',
  confirmIcon = 'check',
  cancelLabel = 'Cancelar',
  triggerColor = 'primary',
  disabled = false,
  isLoading = false,
  maxWidth = 'lg',
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const triggerColorClasses = {
    primary: 'bg-[#d32f2f] hover:bg-[#af101a] text-white',
    secondary: 'bg-[#141b2b] hover:bg-[#293040] text-white',
    outline: 'border border-[#e1e8fd] bg-white text-[#141b2b] hover:bg-[#f1f3ff]',
    ghost: 'bg-transparent text-[#5b403d] hover:bg-[#f1f3ff] hover:text-[#141b2b]',
  }[triggerColor];

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${triggerColorClasses}`}
      >
        {triggerIcon && (
          <span className="material-symbols-outlined text-[16px]">{triggerIcon}</span>
        )}
        <span>{triggerLabel}</span>
      </button>

      <AppModal
        isOpen={open}
        onClose={handleClose}
        icon={dialogIcon}
        title={dialogTitle}
        description={dialogDescription}
        maxWidth={maxWidth}
        onConfirm={handleConfirm}
        confirmLabel={confirmLabel}
        confirmIcon={confirmIcon}
        confirmLoading={isLoading}
        confirmDisabled={isLoading}
        showCancel={true}
        cancelLabel={cancelLabel}
      >
        {children}
      </AppModal>
    </>
  );
};

