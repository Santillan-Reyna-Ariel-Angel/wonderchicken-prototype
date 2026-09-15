import React from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  isLoading = false,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#141b2b]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-[#e1e8fd] flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-100 text-[#ba1a1a]'
                : 'bg-amber-100 text-[#b45309]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-base text-[#141b2b]">{title}</h3>
            <p className="text-xs text-[#5b403d] mt-1">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f3ff]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg cursor-pointer disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isDestructive
                ? 'bg-[#ba1a1a] hover:bg-[#93000a]'
                : 'bg-[#d32f2f] hover:bg-[#af101a]'
            }`}
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            <span>{isLoading ? 'Procesando...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
