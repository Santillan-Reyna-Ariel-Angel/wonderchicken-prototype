import React, { useState } from 'react';

export interface ActionModalProps {
  triggerLabel?: string;
  triggerIcon?: string;
  dialogTitle: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerColor?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  triggerLabel = 'Abrir',
  triggerIcon,
  dialogTitle,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  triggerColor = 'primary',
  disabled = false,
  isLoading = false,
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

      {open && (
        <div className="fixed inset-0 z-50 bg-[#141b2b]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#e1e8fd] flex flex-col max-h-[90vh]">
            <div className="bg-[#f1f3ff] px-5 py-3.5 border-b border-[#e1e8fd] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#141b2b]">{dialogTitle}</h3>
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-full hover:bg-white text-[#5b403d] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">{children}</div>

            <div className="p-4 bg-[#f9f9ff] border-t border-[#e1e8fd] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleClose}
                className="px-4 py-2 bg-white border border-[#e1e8fd] text-[#5b403d] hover:text-[#141b2b] font-mono text-xs font-bold rounded-lg cursor-pointer disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleConfirm}
                className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isLoading && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>{isLoading ? 'Guardando...' : confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
