import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initial financial telemetry data (Day 1 baseline, populated with realistic initial numbers)
  const financialSummary = {
    currentBalance: 78450,
    totalIncome: 125000,
    totalExpenses: 46550,
    totalSavings: 78450,
    savingsRate: 62.7,
    budgetUtilized: 58.2,
  };

  // Spending trends over recent months
  const monthlyTrendsData = [
    { month: 'Jun', income: 110000, expenses: 52000, savings: 58000 },
    { month: 'Jul', income: 115000, expenses: 48000, savings: 67000 },
    { month: 'Aug', income: 115000, expenses: 54000, savings: 61000 },
    { month: 'Sep', income: 120000, expenses: 49000, savings: 71000 },
    { month: 'Oct', income: 120000, expenses: 51200, savings: 68800 },
    { month: 'Nov', income: 125000, expenses: 46550, savings: 78450 },
  ];

  // Category breakdown for expenses
  const categoryData = [
    { name: 'Food & Dining', value: 12400, color: '#f59e0b' },
    { name: 'Rent & Housing', value: 18000, color: '#6366f1' },
    { name: 'Transportation', value: 4200, color: '#06b6d4' },
    { name: 'Shopping', value: 5100, color: '#ec4899' },
    { name: 'Bills & Utilities', value: 3850, color: '#8b5cf6' },
    { name: 'Entertainment', value: 3000, color: '#10b981' },
  ];

  // Recent transactions preview
  const recentTransactions = [
    {
      id: 1,
      description: 'Monthly Salary Credit',
      category: 'Salary',
      type: 'income',
      amount: 125000,
      date: '2026-11-01',
    },
    {
      id: 2,
      description: 'Apartment Rent Transfer',
      category: 'Rent',
      type: 'expense',
      amount: 18000,
      date: '2026-11-02',
    },
    {
      id: 3,
      description: 'Swiggy Gourmet Order',
      category: 'Food',
      type: 'expense',
      amount: 850,
      date: '2026-11-04',
    },
    {
      id: 4,
      description: 'Uber Office Commute',
      category: 'Transportation',
      type: 'expense',
      amount: 320,
      date: '2026-11-05',
    },
    {
      id: 5,
      description: 'Amazon Electronics Purchase',
      category: 'Shopping',
      type: 'expense',
      amount: 4200,
      date: '2026-11-06',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FinWise AI Intelligence Core Active</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
              Welcome back, {user?.name || 'Explorer'}!
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Your financial health score is <span className="text-emerald-400 font-semibold">92/100 (Optimal)</span>. Monthly expense rate is 12% lower than your projected budget target.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/assistant')}
              className="flex items-center gap-2 rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2.5 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AI Assistant</span>
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:bg-brand-500 active:scale-95"
            >
              <span>View All Transactions</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Balance"
          amount={financialSummary.currentBalance}
          subtitle="Available liquid funds"
          trend={{ value: '+14.2%', isPositive: true }}
          icon={Wallet}
          colorScheme="brand"
        />
        <MetricCard
          title="Total Income"
          amount={financialSummary.totalIncome}
          subtitle="Earned this month"
          trend={{ value: '+4.1%', isPositive: true }}
          icon={ArrowUpRight}
          colorScheme="emerald"
        />
        <MetricCard
          title="Total Expenses"
          amount={financialSummary.totalExpenses}
          subtitle="Spent this month"
          trend={{ value: '-8.5%', isPositive: true }}
          icon={ArrowDownRight}
          colorScheme="rose"
        />
        <MetricCard
          title="Total Savings"
          amount={financialSummary.totalSavings}
          subtitle={`Savings rate: ${financialSummary.savingsRate}%`}
          trend={{ value: '+18.0%', isPositive: true }}
          icon={PiggyBank}
          colorScheme="indigo"
        />
      </div>

      {/* Primary Analytics Section: Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Bar Chart */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Cash Flow Telemetry</h3>
              <p className="text-xs text-slate-400">Comparing Income vs Actual Spending in INR (₹)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
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
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Expense Distribution</h3>
            <p className="text-xs text-slate-400">Category-wise breakdown for November</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {categoryData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate text-slate-400">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spending Trends Area Chart */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Net Savings Growth Trajectory</h3>
            <p className="text-xs text-slate-400">Cumulative monthly savings acceleration over time</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>On Track to Goal</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendsData}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
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
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Savings']}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions & AI Insight Alert */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest recorded credits and debits</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              Manage All &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 text-right font-semibold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                    <td className="py-3">
                      <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">{tx.date}</td>
                    <td className={`py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Financial Alert Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Financial Insight</h3>
            </div>
            <p className="text-base font-bold text-white">
              Spending trend is 8.5% below budget!
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Machine learning models detect a significant decrease in Food & Dining expenses this week compared to last month. If this rate continues, you will save an additional <span className="font-semibold text-emerald-400">₹6,200</span> by month end.
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Monthly Budget Utilized</span>
                <span className="font-bold text-white">58.2%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400" style={{ width: '58.2%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/insights')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
          >
            <span>Explore All AI Insights</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
