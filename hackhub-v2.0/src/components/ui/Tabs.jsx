import React from 'react';
import { cn } from '../../utils/cn';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className,
  variant = 'underline', // 'underline' | 'pills'
}) => {
  return (
    <div className={cn(
      "flex items-center overflow-x-auto no-scrollbar",
      variant === 'underline' ? "border-b border-[#E2E8F0] gap-6" : "bg-slate-100 p-1 rounded-xl gap-1",
      className
    )}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                isActive
                  ? "bg-white text-[#172033] shadow-xs font-semibold"
                  : "text-[#64748B] hover:text-[#172033] hover:bg-slate-200/60"
              )}
            >
              {Icon && <Icon size={16} className={isActive ? "text-[#4F46E5]" : "text-slate-400"} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 pb-3 pt-1 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer",
              isActive
                ? "border-[#4F46E5] text-[#4F46E5] font-semibold"
                : "border-transparent text-[#64748B] hover:text-[#172033] hover:border-slate-300"
            )}
          >
            {Icon && <Icon size={16} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
