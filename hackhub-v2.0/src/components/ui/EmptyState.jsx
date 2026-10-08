import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-[#E2E8F0] my-4", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-3">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#172033] mb-1">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
