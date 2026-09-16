import React, { useEffect } from 'react';

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmIcon?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  showCancel?: boolean;
  cancelLabel?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  footerExtra?: React.ReactNode;
  customFooter?: React.ReactNode;
  hideFooter?: boolean;
}

export const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  icon = 'info',
  title,
  description,
  children,
  onConfirm,
  confirmLabel = 'Confirmar',
  confirmIcon,
  confirmDisabled = false,
  confirmLoading = false,
  showCancel = true,
  cancelLabel = 'Cancelar',
  maxWidth = 'lg',
  footerExtra,
  customFooter,
  hideFooter = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#293040]/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
    >
      <div
        className={`bg-white w-full ${maxWidthClasses} rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e2e8f0] max-h-[92vh]`}
      >
        {/* 1. Cabecera (Header): Rojo institucional con Icono, Título, Descripción opcional y Botón Cerrar (x) */}
        <div className="bg-[#d32f2f] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 select-none shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px] text-white">
                  {icon}
                </span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h2 className="text-base sm:text-lg font-bold leading-tight truncate text-white">
                {title}
              </h2>
              {description && (
                <span className="font-mono text-xs text-white/85 leading-normal line-clamp-2">
                  {description}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white shrink-0 ml-3"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 2. Cuerpo (Body): Blanco con UI y lógica específica de la tarea */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto flex-1 bg-white text-[#141b2b]">
          {children}
        </div>

        {/* 3. Pie (Footer): Gris claro con Botón de Confirmación y Botón de Cierre opcional */}
        {!hideFooter && (
          <div className="bg-[#f8f9fc] px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 border-t border-[#e2e8f0] shrink-0">
            {customFooter ? (
              customFooter
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  {footerExtra}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                  {showCancel && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-white text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-[#cbd5e1] font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      {cancelLabel}
                    </button>
                  )}

                  {onConfirm && (
                    <button
                      type="button"
                      disabled={confirmDisabled || confirmLoading}
                      onClick={onConfirm}
                      className="px-5 py-2.5 rounded-xl bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirmLoading ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                      ) : confirmIcon ? (
                        <span className="material-symbols-outlined text-[18px]">
                          {confirmIcon}
                        </span>
                      ) : null}
                      <span>{confirmLoading ? 'Procesando...' : confirmLabel}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
