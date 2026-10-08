import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]",
        hover && "transition-all duration-150 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.06)] hover:border-slate-300",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("font-semibold text-base sm:text-lg text-[#172033] tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-xs sm:text-sm text-[#64748B]", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("flex items-center pt-4 border-t border-[#E2E8F0] mt-4", className)} {...props}>
    {children}
  </div>
);
