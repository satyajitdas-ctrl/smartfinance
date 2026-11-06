import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const comparisonData = [
    { category: 'Food', thisMonth: 12400, lastMonth: 14800 },
    { category: 'Shopping', thisMonth: 5100, lastMonth: 8200 },
    { category: 'Transport', thisMonth: 4200, lastMonth: 3900 },
    { category: 'Entertainment', thisMonth: 3000, lastMonth: 4500 },
    { category: 'Bills', thisMonth: 3850, lastMonth: 3800 },
    { category: 'Rent', thisMonth: 18000, lastMonth: 18000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Spending Analytics</h2>
        <p className="text-xs text-slate-400">
          In-depth comparative analysis of spending behaviors, velocity, and trends
        </p>
      </div>

      {/* Month-over-Month Comparison Chart */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Month-over-Month Category Comparison</h3>
            <p className="text-xs text-slate-400">November 2026 vs October 2026 (INR ₹)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Current Month
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Previous Month
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" tickLine={false} />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
              />
              <Bar dataKey="thisMonth" fill="#6366f1" radius={[4, 4, 0, 0]} name="November" />
              <Bar dataKey="lastMonth" fill="#475569" radius={[4, 4, 0, 0]} name="October" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <ArrowDownRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Decreased Category</h4>
          </div>
          <p className="text-xl font-extrabold text-white">Shopping (-37.8%)</p>
          <p className="mt-1 text-xs text-slate-400">
            Saved ₹3,100 this month compared to October by reducing impulse tech purchases.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Increased Category</h4>
          </div>
          <p className="text-xl font-extrabold text-white">Transportation (+7.6%)</p>
          <p className="mt-1 text-xs text-slate-400">
            Office commutes slightly increased due to prime-time surge rates.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-brand-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Daily Spending Velocity</h4>
          </div>
          <p className="text-xl font-extrabold text-white">₹1,551 / day</p>
          <p className="mt-1 text-xs text-slate-400">
            Average daily expenditure across the past 30 days is well within healthy parameters.
          </p>
        </div>
      </div>
    </div>
  );
};
