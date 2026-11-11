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
import { useTheme } from '../context/ThemeContext';

export const AnalyticsPage: React.FC = () => {
  const { isDark } = useTheme();
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

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    borderRadius: '0.75rem',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
  };
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';
  const prevBarFill = isDark ? '#475569' : '#94a3b8';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Spending Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparative analysis of spending behaviors and month-over-month variances
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Month-over-Month Comparison Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Month-over-Month Category Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currMonthName} vs {prevMonthName} (INR ₹)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> {currMonthName}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" /> {prevMonthName}
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
              No comparative expense data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="category" stroke={axisStroke} tickLine={false} />
                <YAxis
                  stroke={axisStroke}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name={currMonthName} />
                <Bar dataKey="previous" fill={prevBarFill} radius={[4, 4, 0, 0]} name={prevMonthName} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-lg">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <ArrowDownRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Reduced Category</h4>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {topDecreased ? `${topDecreased.category} (${topDecreased.percentage_change}%)` : 'No Reductions'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {topDecreased
              ? `Saved ₹${Math.abs(topDecreased.difference).toLocaleString('en-IN')} compared with previous period.`
              : 'Add more expense records to compute reduction patterns.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-lg">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Top Increased Category</h4>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {topIncreased ? `${topIncreased.category} (+${topIncreased.percentage_change}%)` : 'No Increases'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {topIncreased
              ? `Increased by ₹${Math.abs(topIncreased.difference).toLocaleString('en-IN')} compared with previous period.`
              : 'Category expenditures remained flat or decreased.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-lg">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
            <TrendingUp className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Active Categories</h4>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{breakdown.length} Categories</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Expenditure spread across multiple lifestyle and essential sectors.
          </p>
        </div>
      </div>

      {/* Category Breakdown Table & Share List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Category Spending Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Detailed share of expenditures by lifestyle category for {currMonthName}
        </p>

        {breakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No category distribution data recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color || '#6366f1' }}
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">{item.category}</span>
                    <span className="text-[11px] text-slate-400">({item.count} items)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">{item.percentage}%</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-950">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || '#6366f1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
