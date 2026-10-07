import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-40 mt-2 w-56 rounded-xl bg-white border border-[#E2E8F0] shadow-lg py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === 'right' ? "right-0" : "left-0",
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, danger, icon: Icon, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center gap-2.5 transition-colors",
      danger
        ? "text-red-600 hover:bg-red-50"
        : "text-[#172033] hover:bg-slate-50 hover:text-indigo-600",
      className
    )}
  >
    {Icon && <Icon size={16} className="text-current" />}
    <span className="flex-1">{children}</span>
  </button>
);
