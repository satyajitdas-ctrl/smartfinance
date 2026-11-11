import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Calendar
} from 'lucide-react';
import {
  getBudgetsStatus,
  createOrUpdateBudget,
  updateBudgetLimit,
  deleteBudget,
  seedDefaultBudgets,
  BudgetStatusItem,
  BudgetStatusResponse,
} from '../services/api';

export const BudgetsPage: React.FC = () => {
  const [data, setData] = useState<BudgetStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetStatusItem | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState('Food');
  const [formLimit, setFormLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    'Food',
    'Shopping',
    'Transportation',
    'Education',
    'Healthcare',
    'Entertainment',
    'Rent',
    'Bills',
    'Travel',
    'Investments',
    'Other',
  ];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBudgetsStatus(currentMonth, currentYear);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(formLimit);
    if (!limitNum || limitNum <= 0) {
      setFormError('Please enter a valid positive monthly limit in ₹');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      if (editingBudget) {
        await updateBudgetLimit(editingBudget.id, limitNum);
      } else {
        await createOrUpdateBudget({
          category: formCategory,
          monthly_limit: limitNum,
          month: currentMonth,
          year: currentYear,
        });
      }

      setIsModalOpen(false);
      setEditingBudget(null);
      setFormLimit('');
      await fetchBudgets();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save budget limit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category budget?')) return;
    try {
      await deleteBudget(id);
      await fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete budget');
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      await seedDefaultBudgets(currentMonth, currentYear);
      await fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to populate default budgets');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setFormCategory('Food');
    setFormLimit('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BudgetStatusItem) => {
    setEditingBudget(b);
    setFormCategory(b.category);
    setFormLimit(String(b.monthly_limit));
    setFormError(null);
    setIsModalOpen(true);
  };

  const totalBudget = data?.total_budget || 0;
  const totalSpent = data?.total_spent || 0;
  const overallPercentage = Math.min(100, data?.overall_percentage_used || 0);
  const isOverallExceeded = data?.is_overall_exceeded || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Monthly Budgets & Limits</h2>
            <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <Calendar className="h-3 w-3 text-brand-500 dark:text-brand-400" />
              <span>{monthName} {currentYear}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Allocate and monitor spending thresholds with live transaction progress tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(!data?.budgets || data.budgets.length === 0) && !loading && (
            <button
              onClick={handleSeedDefaults}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Seed Standard Budgets</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:bg-brand-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {/* Global Utilization Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Budget Utilization ({monthName} {currentYear})
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                / ₹{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold ${
              isOverallExceeded
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : overallPercentage >= 85
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOverallExceeded ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>
              {overallPercentage}% Utilized &bull; {isOverallExceeded ? 'Budget Exceeded' : 'Under Control'}
            </span>
          </div>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-950">
          <div
            className={`h-full transition-all duration-500 ${
              isOverallExceeded
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : overallPercentage >= 85
                ? 'bg-gradient-to-r from-brand-500 to-amber-400'
                : 'bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-500 mb-2" />
          <span className="text-xs">Calculating live budget utilization from database...</span>
        </div>
      ) : !data?.budgets || data.budgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <Layers className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Budgets Configured Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Set spending thresholds for Food, Rent, Travel, etc., to receive automated warnings before exceeding limits.
          </p>
          <button
            onClick={handleSeedDefaults}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-500 transition-colors"
          >
            Seed Standard Category Budgets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.budgets.map((b) => {
            const pct = Math.round(b.percentage_used);
            const isDanger = b.is_exceeded || pct >= 90;
            const isWarning = pct >= 75 && pct < 90;

            return (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-lg dark:hover:border-slate-700/80"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                          isDanger
                            ? 'bg-rose-500/15 text-rose-600 border border-rose-500/20 dark:text-rose-400'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20 dark:text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>
                      Spent: <strong className="text-slate-900 dark:text-white">₹{b.spent_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span>Limit: ₹{b.monthly_limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-950">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDanger
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className={b.is_exceeded ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      {b.is_exceeded
                        ? `Exceeded by ₹${(b.spent_amount - b.monthly_limit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : `Remaining: ₹${b.remaining_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 flex items-center justify-end gap-1 border-t border-slate-100 pt-3 dark:border-slate-800/60">
                  <button
                    onClick={() => openEditModal(b)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-white"
                    title="Edit Monthly Limit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    title="Delete Budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm dark:bg-black/80">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingBudget ? `Edit Limit: ${editingBudget.category}` : 'Set Category Budget'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enter target threshold in INR (₹) for {monthName} {currentYear}.
            </p>

            {formError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBudget ? 'Update Limit' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
