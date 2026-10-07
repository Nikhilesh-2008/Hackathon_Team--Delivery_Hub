import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  className,
}) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-[#4F46E5]",
    emerald: "bg-emerald-50 text-[#16A34A]",
    amber: "bg-amber-50 text-[#F59E0B]",
    sky: "bg-sky-50 text-[#0EA5E9]",
    rose: "bg-rose-50 text-[#DC2626]",
  };

  return (
    <Card className={cn("p-4 sm:p-5 flex items-center justify-between", className)}>
      <div>
        <p className="text-xs font-medium text-[#64748B] mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#172033] tracking-tight">{value}</p>
        {(trend || trendLabel) && (
          <p className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
            {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
            <span>{trendLabel}</span>
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorMap[color] || colorMap.indigo)}>
          <Icon size={22} />
        </div>
      )}
    </Card>
  );
};
