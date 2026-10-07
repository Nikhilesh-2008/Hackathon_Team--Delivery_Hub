import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const colors = {
    primary: "bg-[#4F46E5]",
    success: "bg-[#16A34A]",
    warning: "bg-[#F59E0B]",
    danger: "bg-[#DC2626]",
    accent: "bg-[#0EA5E9]",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#64748B] font-medium">
          <span>Progress</span>
          <span className="text-[#172033] font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
