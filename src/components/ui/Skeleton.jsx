import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-slate-200/80 rounded-xl", className)}
      {...props}
    />
  );
};
