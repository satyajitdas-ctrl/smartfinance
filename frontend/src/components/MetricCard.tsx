import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  colorScheme?: 'brand' | 'emerald' | 'rose' | 'amber' | 'indigo';
  prefix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  trend,
  icon: Icon,
  colorScheme = 'brand',
  prefix = '₹',
}) => {
  const schemeStyles = {
    brand: {
      border: 'hover:border-brand-500/50',
      iconBg: 'bg-brand-500/15 text-brand-600 dark:text-brand-400',
      glow: 'group-hover:shadow-brand-500/10',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      glow: 'group-hover:shadow-rose-500/10',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
    },
    indigo: {
      border: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      glow: 'group-hover:shadow-indigo-500/10',
    },
  }[colorScheme];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/70 p-5 shadow-lg dark:shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${schemeStyles.border} ${schemeStyles.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {prefix && <span className="text-lg font-bold text-slate-400 dark:text-slate-400">{prefix}</span>}
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}
            </h3>
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className={`rounded-xl p-3 shadow-inner ${schemeStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
          <div
            className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
};
