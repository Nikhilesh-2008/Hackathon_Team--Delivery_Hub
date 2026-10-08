import React from 'react';
import { cn } from '../../utils/cn';

export const PageHeader = ({
  title,
  subtitle,
  children,
  badge,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6", className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};
