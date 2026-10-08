import React from 'react';
import { cn } from '../../utils/cn';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = 'User',
  size = 'md',
  className,
  status,
}) => {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (str) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-sky-100 text-sky-700 border-sky-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="relative inline-block select-none">
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn(
            "rounded-xl object-cover border border-[#E2E8F0]",
            sizes[size],
            className
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-xl font-semibold flex items-center justify-center border",
            sizes[size],
            getColorFromName(name),
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            status === 'online' && "bg-emerald-500",
            status === 'busy' && "bg-amber-500",
            status === 'offline' && "bg-slate-400",
            size === 'xs' ? "w-1.5 h-1.5" : "w-2.5 h-2.5"
          )}
        />
      )}
    </div>
  );
};
