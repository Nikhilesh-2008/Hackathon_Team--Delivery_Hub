import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#172033]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#64748B] pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-sm text-[#172033] placeholder-[#94A3B8]",
            "transition-all duration-150 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            Icon && "pl-9",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#64748B]">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
