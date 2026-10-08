import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Content Container */}
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full z-10 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col",
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between p-5 border-b border-[#E2E8F0]">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-[#172033]">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#172033] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
