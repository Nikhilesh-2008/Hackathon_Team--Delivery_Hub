import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    default: "bg-slate-100 text-[#172033] border border-slate-200",
    primary: "bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200",
    success: "bg-[#DCFCE7] text-[#16A34A] border border-green-200",
    warning: "bg-[#FEF3C7] text-[#D97706] border border-amber-200",
    danger: "bg-[#FEE2E2] text-[#DC2626] border border-red-200",
    info: "bg-[#E0F2FE] text-[#0284C7] border border-sky-200",
    outline: "bg-transparent text-[#64748B] border border-[#E2E8F0]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-lg font-medium",
    md: "px-2.5 py-1 text-xs rounded-lg font-medium",
    lg: "px-3 py-1.5 text-sm rounded-xl font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 leading-none tracking-tight",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
