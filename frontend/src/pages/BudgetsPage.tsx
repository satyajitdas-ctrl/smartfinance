import React, { useState } from 'react';
import { PieChart, Plus, AlertTriangle, CheckCircle, TrendingUp, IndianRupee } from 'lucide-react';

interface LocalBudget {
  id: number;
  category: string;
  monthly_limit: number;
  spent_amount: number;
}

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<LocalBudget[]>([
    { id: 1, category: 'Food & Dining', monthly_limit: 15000, spent_amount: 12400 },
    { id: 2, category: 'Rent & Housing', monthly_limit: 18000, spent_amount: 18000 },
    { id: 3, category: 'Shopping', monthly_limit: 8000, spent_amount: 5100 },
    { id: 4, category: 'Transportation', monthly_limit: 5000, spent_amount: 4200 },
    { id: 5, category: 'Entertainment', monthly_limit: 4000, spent_amount: 3000 },
    { id: 6, category: 'Bills & Utilities', monthly_limit: 6000, spent_amount: 3850 },
  ]);

  const totalBudget = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent_amount, 0);
  const overallPercentage = ((totalSpent / totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Monthly Budgets & Limits</h2>
          <p className="text-xs text-slate-400">
            Monitor and allocate spending thresholds across expense categories
          </p>
        </div>

        <button
          onClick={() => alert('New budget limit modal will be fully interactive in Day 2!')}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:bg-brand-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Global Utilization Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Budget Utilization (November 2026)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                ₹{totalSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / ₹{totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span>{overallPercentage}% Utilized &bull; Under Budget</span>
          </div>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-950">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent_amount / b.monthly_limit) * 100));
          const isDanger = pct >= 90;
          const isWarning = pct >= 75 && pct < 90;

          return (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">{b.category}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    isDanger
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs mb-2">
                <span className="text-slate-400">
                  Spent: <strong className="text-slate-200">₹{b.spent_amount.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-slate-400">
                  Limit: <strong className="text-slate-200">₹{b.monthly_limit.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                {b.monthly_limit - b.spent_amount >= 0
                  ? `₹${(b.monthly_limit - b.spent_amount).toLocaleString('en-IN')} remaining this month`
                  : `Exceeded by ₹${Math.abs(b.monthly_limit - b.spent_amount).toLocaleString('en-IN')}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
