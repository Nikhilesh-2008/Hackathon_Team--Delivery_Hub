import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Searchable single-select dropdown. When allowCustom is enabled, typed text that
 * matches no option can be committed as a free-form value.
 */
export const SearchSelect = ({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No matches found',
  helperText,
  error,
  allowCustom = false,
  maxHeight = 'max-h-60',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  const select = (next) => {
    onChange?.(next);
    setIsOpen(false);
    setQuery('');
  };

  const customCandidate = query.trim();
  const canCommitCustom =
    allowCustom &&
    customCandidate.length > 1 &&
    !options.some((option) => option.toLowerCase() === customCandidate.toLowerCase());

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-[#172033]">{label}</label>}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-left text-sm transition-all',
            value ? 'text-[#172033]' : 'text-[#94A3B8]',
            'focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown size={16} className="shrink-0 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-40 mt-1.5 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canCommitCustom) {
                    event.preventDefault();
                    select(customCandidate);
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[#172033] placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className={cn('overflow-y-auto py-1', maxHeight)}>
              {canCommitCustom && (
                <button
                  type="button"
                  onClick={() => select(customCandidate)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  <span>Use “{customCandidate}”</span>
                </button>
              )}
              {filteredOptions.length === 0 && !canCommitCustom ? (
                <p className="px-3 py-3 text-xs text-slate-500">{emptyMessage}</p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => select(option)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors',
                      option === value ? 'bg-indigo-50/70 font-medium text-indigo-700' : 'text-[#172033] hover:bg-slate-50'
                    )}
                  >
                    <span>{option}</span>
                    {option === value && <Check size={14} className="text-indigo-600" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default SearchSelect;
