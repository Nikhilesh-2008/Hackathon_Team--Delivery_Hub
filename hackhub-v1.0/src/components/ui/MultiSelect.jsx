import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Searchable multi-select dropdown with checkbox options and removable chips.
 */
export const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search…',
  helperText,
  error,
  emptyMessage = 'No matches found',
  maxHeight = 'max-h-56',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
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

  const toggleOption = (option) => {
    const next = value.includes(option) ? value.filter((item) => item !== option) : [...value, option];
    onChange?.(next);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-[#172033]">{label}</label>}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className={cn(
            'w-full min-h-[42px] flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-left text-sm text-[#172033] transition-all',
            'focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className
          )}
        >
          {value.length === 0 ? (
            <span className="text-[#94A3B8]">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100"
              >
                {item}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${item}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(item);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleOption(item);
                    }
                  }}
                  className="rounded p-0.5 hover:bg-indigo-100"
                >
                  <X size={11} />
                </span>
              </span>
            ))
          )}
          <ChevronDown size={16} className="ml-auto shrink-0 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-40 mt-1.5 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[#172033] placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className={cn('overflow-y-auto py-1', maxHeight)}>
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-500">{emptyMessage}</p>
              ) : (
                filteredOptions.map((option) => {
                  const selected = value.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors',
                        selected ? 'bg-indigo-50/70 text-indigo-700 font-medium' : 'text-[#172033] hover:bg-slate-50'
                      )}
                    >
                      <span>{option}</span>
                      {selected && <Check size={14} className="text-indigo-600" />}
                    </button>
                  );
                })
              )}
            </div>

            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange?.([])}
                className="w-full border-t border-slate-100 px-3 py-2 text-left text-[11px] font-medium text-slate-500 hover:bg-slate-50"
              >
                Clear all ({value.length} selected)
              </button>
            )}
          </div>
        )}
      </div>

      {helperText && !error && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default MultiSelect;
