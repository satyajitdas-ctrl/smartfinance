import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  RefreshCw
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
import {
  getMonthlyComparison,
  getCategoryBreakdown,
  type MonthlyComparisonItem,
  type CategoryBreakdownItem
} from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [comparison, setComparison] = useState<MonthlyComparisonItem[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [currMonthName, setCurrMonthName] = useState('Current Month');
  const [prevMonthName, setPrevMonthName] = useState('Previous Month');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [compRes, breakRes] = await Promise.all([
        getMonthlyComparison(),
        getCategoryBreakdown(),
      ]);

      setComparison(compRes.categories);
      setCurrMonthName(compRes.current_month);
      setPrevMonthName(compRes.previous_month);
      setBreakdown(breakRes.categories);
    } catch (err) {
      console.warn('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = comparison.map((item) => ({
    category: item.category,
    current: item.current_month,
    previous: item.previous_month,
  }));

  const topDecreased = [...comparison]
    .filter((c) => c.trend === 'decreased')
    .sort((a, b) => a.difference - b.difference)[0];

  const topIncreased = [...comparison]
    .filter((c) => c.trend === 'increased')
    .sort((a, b) => b.difference - a.difference)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Spending Analytics</h2>
          <p className="text-xs text-slate-400">
            Comparative analysis of spending behaviors and month-over-month variances
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Month-over-Month Comparison Chart */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Month-over-Month Category Comparison</h3>
            <p className="text-xs text-slate-400">
              {currMonthName} vs {prevMonthName} (INR ₹)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> {currMonthName}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> {prevMonthName}
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              No comparative expense data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name={currMonthName} />
                <Bar dataKey="previous" fill="#475569" radius={[4, 4, 0, 0]} name={prevMonthName} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <ArrowDownRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Reduced Category</h4>
          </div>
          <p className="text-xl font-extrabold text-white">
            {topDecreased ? `${topDecreased.category} (${topDecreased.percentage_change}%)` : 'No Reductions'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {topDecreased
              ? `Saved ₹${Math.abs(topDecreased.difference).toLocaleString('en-IN')} compared with previous period.`
              : 'Add more expense records to compute reduction patterns.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Increased Category</h4>
          </div>
          <p className="text-xl font-extrabold text-white">
            {topIncreased ? `${topIncreased.category} (+${topIncreased.percentage_change}%)` : 'No Increases'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {topIncreased
              ? `Increased by ₹${Math.abs(topIncreased.difference).toLocaleString('en-IN')} compared with previous period.`
              : 'Category expenditures remained flat or decreased.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-brand-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Active Categories</h4>
          </div>
          <p className="text-xl font-extrabold text-white">{breakdown.length} Categories</p>
          <p className="mt-1 text-xs text-slate-400">
            Expenditure spread across multiple lifestyle and essential sectors.
          </p>
        </div>
      </div>
    </div>
  );
};
