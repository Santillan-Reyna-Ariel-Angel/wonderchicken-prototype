import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#e1e8fd]">
      <div className="w-12 h-12 rounded-full bg-[#f1f3ff] text-[#af101a] flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[26px]">{icon}</span>
      </div>
      <h3 className="font-bold text-sm text-[#141b2b]">{title}</h3>
      {description && (
        <p className="text-xs text-[#5b403d] max-w-sm mt-1 mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
