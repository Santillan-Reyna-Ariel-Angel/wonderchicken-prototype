import React from 'react';
import { AppModal } from './AppModal';

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
  return (
    <AppModal
      isOpen={open}
      onClose={onCancel}
      icon={isDestructive ? 'warning' : 'help'}
      title={title}
      description={isDestructive ? 'Acción crítica irreversible' : 'Confirmación requerida'}
      maxWidth="md"
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      confirmIcon={isDestructive ? 'delete' : 'check'}
      confirmLoading={isLoading}
      confirmDisabled={isLoading}
      showCancel={true}
      cancelLabel={cancelLabel}
    >
      <div className="py-2">
        <p className="text-sm text-[#141b2b] leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </AppModal>
  );
};

