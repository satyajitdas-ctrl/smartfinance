import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const anomalies = [
    {
      id: 1,
      description: 'Annual Cloud Infrastructure Billing',
      amount: 14999,
      category: 'Bills',
      date: '2026-10-28',
      anomalyScore: 0.88,
      reason: 'Transaction is 4.2x above your 90-day moving average for Bills (₹3,500).',
      status: 'unreviewed',
    },
  ];

  const insights = [
    {
      id: 1,
      type: 'positive',
      title: 'Food Expenses Decreased by 16.2%',
      message: 'Great discipline! Your food expenditures dropped from ₹14,800 to ₹12,400 this month.',
      date: 'November 05, 2026',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Approaching Rent Budget Threshold',
      message: 'Rent is at 100% of its ₹18,000 threshold. No remaining budget allocated for housing this month.',
      date: 'November 02, 2026',
    },
    {
      id: 3,
      type: 'info',
      title: 'Optimal Savings Velocity Detected',
      message: 'Your current savings rate is 62.7%, outperforming the recommended 50/30/20 guideline.',
      date: 'November 01, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">AI Insights & Anomaly Detection</h2>
        <p className="text-xs text-slate-400">
          Machine Learning models monitoring spending patterns, outliers, and monthly projections
        </p>
      </div>

      {/* Unusually High / Flagged Transactions Section */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-amber-400 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Unusual Transactions Flagged for Review
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          *Important Notice: Flagged transactions are statistical outliers detected by Scikit-learn Isolation Forest, not confirmed fraud.
        </p>

        <div className="space-y-3">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{anom.description}</h4>
                  <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                    Outlier Score: {anom.anomalyScore}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{anom.reason}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>Category: {anom.category}</span>
                  <span>&bull;</span>
                  <span>Date: {anom.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-white">
                  ₹{anom.amount.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => alert('Anomaly marked as verified!')}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Mark Verified
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Behavioral Insights Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                {ins.type === 'positive' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                {ins.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                {ins.type === 'info' && <Sparkles className="h-4 w-4 text-brand-400" />}
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {ins.date}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{ins.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{ins.message}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 cursor-pointer">
                View related transactions &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecasting Section */}
      <div className="rounded-2xl border border-brand-500/30 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 text-brand-400 mb-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Machine Learning Monthly Spending Forecast
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Based on 6 months of historical transactions and day-of-month spending velocity:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">Projected Month-End Expenses</p>
            <p className="text-xl font-extrabold text-white mt-1">₹48,200</p>
            <p className="text-[11px] text-emerald-400 mt-1">&darr; 4.8% below ₹50,600 monthly limit</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">Forecasted Net Savings</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">₹76,800</p>
            <p className="text-[11px] text-slate-400 mt-1">Projected savings rate: 61.4%</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">Confidence Metric</p>
            <p className="text-xl font-extrabold text-brand-400 mt-1">94.5%</p>
            <p className="text-[11px] text-slate-400 mt-1">Algorithm: Moving Window Regression</p>
          </div>
        </div>

        <p className="mt-4 text-[11px] italic text-slate-500">
          Disclaimer: Forecasts are algorithmic estimates based on historical spending habits and mathematical probability, not guaranteed financial guarantees.
        </p>
      </div>
    </div>
  );
};
