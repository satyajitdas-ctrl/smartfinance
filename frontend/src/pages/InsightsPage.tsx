import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import {
  getAnomalies,
  triggerAnomalyScan,
  reviewAnomaly,
  getExpenseForecast,
  getMonthlyComparison,
  getCategoryBreakdown,
  AnomalyItem,
  ForecastResponse,
  MonthlyComparisonItem,
} from '../services/api';

export const InsightsPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [monthlyComparisons, setMonthlyComparisons] = useState<MonthlyComparisonItem[]>([]);
  const [topCategory, setTopCategory] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [anomRes, forecastRes, compRes, catRes] = await Promise.allSettled([
        getAnomalies(),
        getExpenseForecast(),
        getMonthlyComparison(),
        getCategoryBreakdown(),
      ]);

      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value);
      if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value);
      if (compRes.status === 'fulfilled') setMonthlyComparisons(compRes.value.categories || []);
      if (catRes.status === 'fulfilled' && catRes.value.categories?.length > 0) {
        setTopCategory(catRes.value.categories[0].category);
      }
    } catch (err: any) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTriggerScan = async () => {
    try {
      setScanning(true);
      setScanMessage(null);
      const res = await triggerAnomalyScan();
      setScanMessage(res.message);
      // Refresh list
      const updated = await getAnomalies();
      setAnomalies(updated);
      setTimeout(() => setScanMessage(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Anomaly scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleReviewAnomaly = async (id: number) => {
    try {
      setReviewingId(id);
      await reviewAnomaly(id, 'confirmed_ok');
      setAnomalies((prev) =>
        prev.map((a) => (a.transaction_id === id ? { ...a, review_status: 'confirmed_ok' } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to review transaction');
    } finally {
      setReviewingId(null);
    }
  };

  // Generate dynamic behavioral insights from real database metrics
  const generatedInsights = [];

  if (topCategory) {
    generatedInsights.push({
      id: 'top-cat',
      type: 'info',
      title: `${topCategory} is Your Highest Spending Category`,
      message: `The majority of your current monthly expenses are allocated toward ${topCategory}. Consider reviewing individual receipts for optimization.`,
    });
  }

  const increasedCat = monthlyComparisons.find((c) => c.trend === 'increased' && c.percentage_change > 10);
  if (increasedCat) {
    generatedInsights.push({
      id: 'increased-cat',
      type: 'warning',
      title: `${increasedCat.category} Increased by ${increasedCat.percentage_change}%`,
      message: `Spending in ${increasedCat.category} rose from ₹${increasedCat.previous_month.toLocaleString('en-IN')} to ₹${increasedCat.current_month.toLocaleString('en-IN')} compared to last month.`,
    });
  }

  const decreasedCat = monthlyComparisons.find((c) => c.trend === 'decreased' && c.percentage_change < -10);
  if (decreasedCat) {
    generatedInsights.push({
      id: 'decreased-cat',
      type: 'positive',
      title: `${decreasedCat.category} Expenses Decreased`,
      message: `Excellent discipline! Expenditures in ${decreasedCat.category} dropped by ${Math.abs(decreasedCat.percentage_change)}% this month.`,
    });
  }

  if (forecast?.is_budget_exceeded) {
    generatedInsights.push({
      id: 'forecast-alert',
      type: 'warning',
      title: 'Projected Spending May Exceed Allocated Budget',
      message: `Machine learning estimates expected monthly expenses of ₹${forecast.total_predicted_expense.toLocaleString('en-IN')}, exceeding your ₹${forecast.current_budget.toLocaleString('en-IN')} threshold by ₹${Math.abs(forecast.budget_variance).toLocaleString('en-IN')}.`,
    });
  } else if (forecast && forecast.current_budget > 0) {
    generatedInsights.push({
      id: 'forecast-positive',
      type: 'positive',
      title: 'Current Velocity Within Safe Budget Margins',
      message: `Projected month-end expenses are ₹${Math.abs(forecast.budget_variance).toLocaleString('en-IN')} under your target monthly limit.`,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AI Insights & Anomaly Detection</h2>
          <p className="text-xs text-slate-400">
            Machine Learning models monitoring spending patterns, outliers, and monthly projections
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={scanning}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-transform hover:bg-purple-500 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Running Isolation Forest...' : 'Scan Outliers with ML'}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs text-purple-300">
          <CheckCircle2 className="h-4 w-4 text-purple-400" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Unusually High / Flagged Transactions Section */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-2">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Unusual Transactions Flagged for Review
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Algorithm: Scikit-learn Isolation Forest + Category Z-Score
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          *Important Notice: Flagged transactions are statistical outliers detected by Scikit-learn Isolation Forest, not confirmed fraud.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            <span>Scanning transaction history for anomalies...</span>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 py-8 text-center">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-xs font-semibold text-white">No Statistical Anomalies Detected</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Your spending history matches normal Gaussian distribution thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.transaction_id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center hover:border-amber-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{anom.description}</h4>
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                      Outlier Score: {anom.anomaly_score}
                    </span>
                    {anom.review_status === 'confirmed_ok' ? (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Verified OK
                      </span>
                    ) : (
                      <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
                        Unreviewed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{anom.anomaly_reason}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>Category: <strong className="text-slate-300">{anom.category}</strong></span>
                    <span>&bull;</span>
                    <span>Date: {anom.transaction_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-white">
                    ₹{anom.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {anom.review_status !== 'confirmed_ok' ? (
                    <button
                      onClick={() => handleReviewAnomaly(anom.transaction_id)}
                      disabled={reviewingId === anom.transaction_id}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      {reviewingId === anom.transaction_id ? 'Saving...' : 'Mark Verified'}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automated Behavioral Insights Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Algorithmic Financial Insights
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {generatedInsights.length === 0 ? (
            <div className="col-span-3 rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
              Record more transactions to populate automated behavioral insights.
            </div>
          ) : (
            generatedInsights.map((ins) => (
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
                      Calculated from Ledger
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{ins.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ins.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ML Forecasting Section */}
      <div className="rounded-2xl border border-brand-500/30 bg-slate-900/70 p-6 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-2">
          <div className="flex items-center gap-2 text-brand-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              ML Monthly Spending Forecast ({forecast?.forecast_month || 'Next Month'})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Time-Series Moving Average + Polynomial Trend Regression
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Projects category commitments for {forecast?.forecast_month || 'upcoming month'} based on spending velocity and historical patterns:
        </p>

        {forecast && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Projected Expenses</p>
              <p className="text-xl font-extrabold text-white mt-1">
                ₹{forecast.total_predicted_expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-[11px] mt-1 ${forecast.is_budget_exceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                {forecast.is_budget_exceeded
                  ? `↑ ₹${Math.abs(forecast.budget_variance).toLocaleString('en-IN')} over budget`
                  : `↓ ₹${Math.abs(forecast.budget_variance).toLocaleString('en-IN')} below allocated budget`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Current Monthly Budget</p>
              <p className="text-xl font-extrabold text-slate-200 mt-1">
                ₹{forecast.current_budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Sum of active category thresholds</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs text-slate-400">Algorithm Status</p>
              <p className="text-xl font-extrabold text-brand-400 mt-1">Operational</p>
              <p className="text-[11px] text-slate-400 mt-1">Weighted WMA + Linear Polyfit</p>
            </div>
          </div>
        )}

        {/* Category-wise Forecast Breakdown */}
        {forecast && forecast.categories.length > 0 && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Category-Wise Spending Projections
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {forecast.categories.map((c) => (
                <div
                  key={c.category}
                  className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/60 p-3"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{c.category}</span>
                    <p className="text-[11px] text-slate-400">
                      Hist. Avg: ₹{c.historical_avg.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-300">
                      ₹{c.predicted_amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[10px]">
                      {c.trend === 'increasing' ? (
                        <span className="text-rose-400 flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" /> Rising
                        </span>
                      ) : c.trend === 'decreasing' ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" /> Falling
                        </span>
                      ) : (
                        <span className="text-slate-400">Stable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-[11px] italic text-slate-500">
          Disclaimer: {forecast?.disclaimer || 'Forecasts are algorithmic estimates based on historical spending habits and mathematical probability, not guaranteed financial outcomes.'}
        </p>
      </div>
    </div>
  );
};
