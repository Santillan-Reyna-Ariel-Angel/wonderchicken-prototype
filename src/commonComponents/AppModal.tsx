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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
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
    xl: 'max-w-xl lg:max-w-[min(36rem,60vw)]',
    '2xl': 'max-w-2xl lg:max-w-[min(42rem,60vw)]',
    '3xl': 'max-w-3xl lg:max-w-[min(46rem,60vw)]',
    '4xl': 'max-w-4xl lg:max-w-[min(50rem,60vw)]',
    '5xl': 'max-w-5xl lg:max-w-[min(54rem,60vw)]',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#293040]/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto overflow-x-hidden animate-fade-in"
    >
      <div
        className={`bg-white dark:bg-[#131b2e] w-full max-w-[calc(100vw-1.5rem)] ${maxWidthClasses} min-w-[280px] sm:min-w-[320px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e2e8f0] dark:border-[#263554] max-h-[min(90vh,calc(100vh-2rem))] my-auto relative transition-colors duration-200`}
      >
        {/* 1. Cabecera (Header): Rojo institucional con Icono, Título, Descripción opcional y Botón Cerrar (x) */}
        <div className="bg-[#d32f2f] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 select-none shadow-xs min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px] text-white">
                  {icon}
                </span>
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <h2
                className="text-base sm:text-lg font-bold leading-tight truncate text-white"
                title={typeof title === 'string' ? title : undefined}
              >
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
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer text-white shrink-0 ml-2 sm:ml-3"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 2. Cuerpo (Body): Blanco / Dark Paper con scroll vertical y horizontal independiente */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto overflow-x-auto min-h-0 flex-1 bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] transition-colors duration-200">
          {children}
        </div>

        {/* 3. Pie (Footer): Gris claro / Dark Bottom con contención garantizada para botones y textos largos */}
        {!hideFooter && (
          <div className="bg-[#f8f9fc] dark:bg-[#0f1626] px-4 sm:px-6 py-3 sm:py-3.5 border-t border-[#e2e8f0] dark:border-[#263554] shrink-0 min-w-0 w-full transition-colors duration-200">
            {customFooter ? (
              <div className="w-full min-w-0 overflow-x-auto">
                {customFooter}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
                {footerExtra ? (
                  <div className="flex items-center gap-3 min-w-0 flex-wrap shrink-0">
                    {footerExtra}
                  </div>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-2.5 min-w-0 ml-auto max-w-full">
                  {showCancel && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-[#cbd5e1] font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      {cancelLabel}
                    </button>
                  )}

                  {onConfirm && (
                    <button
                      type="button"
                      disabled={confirmDisabled || confirmLoading}
                      onClick={onConfirm}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed max-w-full text-center"
                      title={typeof confirmLabel === 'string' ? confirmLabel : undefined}
                    >
                      {confirmLoading ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin shrink-0">
                          progress_activity
                        </span>
                      ) : confirmIcon ? (
                        <span className="material-symbols-outlined text-[18px] shrink-0">
                          {confirmIcon}
                        </span>
                      ) : null}
                      <span className="text-center sm:text-left break-words leading-tight">
                        {confirmLoading ? 'Procesando...' : confirmLabel}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
