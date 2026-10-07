import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  size = 'md',
  ...props
}) => {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3.5 text-[#64748B] pointer-events-none" size={size === 'lg' ? 20 : 18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-9 text-[#172033] placeholder-[#94A3B8]",
          "transition-all duration-150 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100",
          size === 'lg' ? "py-3 text-base pl-11" : "py-2 text-sm"
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
