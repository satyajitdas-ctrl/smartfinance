import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  AlertTriangle,
  Calendar,
  Sparkles,
  RefreshCw,
  Database,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import type { Transaction } from '../types';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  seedTransactions,
  predictCategory,
  correctCategory,
  getModelInfo,
  CategoryPrediction
} from '../services/api';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form State
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ML Categorizer State
  const [mlPrediction, setMlPrediction] = useState<CategoryPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [correctionFeedback, setCorrectionFeedback] = useState<string | null>(null);
  const [modelTelemetry, setModelTelemetry] = useState<any>(null);

  const categories = [
    'All',
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
    'Salary',
    'Other',
  ];

  // Fetch ML Model Info on Mount
  useEffect(() => {
    getModelInfo()
      .then((info) => setModelTelemetry(info))
      .catch((err) => console.log('ML model info unavailable:', err));
  }, []);

  // Fetch transactions from FastAPI backend
  const fetchTxList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions({
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        transaction_type: selectedType !== 'all' ? selectedType : undefined,
      });
      setTransactions(data);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedType]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTxList();
    }, 250);
    return () => clearTimeout(debounce);
  }, [fetchTxList]);

  // ML Category Prediction Debounced
  useEffect(() => {
    if (formType !== 'expense' || !formDesc.trim() || formDesc.trim().length < 3) {
      setMlPrediction(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setPredicting(true);
        const res = await predictCategory(formDesc.trim());
        setMlPrediction(res);
        setFormCategory(res.predicted_category);
      } catch (err) {
        console.error('Failed to predict category:', err);
      } finally {
        setPredicting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formDesc, formType]);

  const handleCategoryChange = async (newCategory: string) => {
    setFormCategory(newCategory);

    // If user changed away from AI predicted category, log correction for model retraining
    if (mlPrediction && mlPrediction.predicted_category !== newCategory && formDesc.trim()) {
      try {
        await correctCategory({
          description: formDesc.trim(),
          original_category: mlPrediction.predicted_category,
          corrected_category: newCategory,
        });
        setCorrectionFeedback(`Feedback recorded: "${formDesc.trim()}" -> ${newCategory}`);
        setTimeout(() => setCorrectionFeedback(null), 4000);
      } catch (err) {
        console.error('Failed to record category correction:', err);
      }
    }
  };

  // Handle Create Transaction
  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || !formAmount) return;

    try {
      setSubmitting(true);
      setActionError(null);
      await createTransaction({
        description: formDesc.trim(),
        amount: parseFloat(formAmount),
        transaction_type: formType,
        category: formCategory,
        transaction_date: formDate,
      });
      setIsCreateOpen(false);
      resetForm();
      await fetchTxList();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Transaction
  const handleUpdateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !formDesc.trim() || !formAmount) return;

    try {
      setSubmitting(true);
      setActionError(null);
      await updateTransaction(editingTx.id, {
        description: formDesc.trim(),
        amount: parseFloat(formAmount),
        transaction_type: formType,
        category: formCategory,
        transaction_date: formDate,
      });
      setEditingTx(null);
      resetForm();
      await fetchTxList();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTx = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete transaction');
    }
  };

  // Handle Seeding initial transactions
  const handleSeedData = async () => {
    try {
      setLoading(true);
      const seeded = await seedTransactions();
      setTransactions(seeded);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to seed data');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormDesc(tx.description);
    setFormAmount(String(tx.amount));
    setFormType(tx.transaction_type);
    setFormCategory(tx.category);
    setFormDate(tx.transaction_date);
    setActionError(null);
  };

  const resetForm = () => {
    setFormDesc('');
    setFormAmount('');
    setFormType('expense');
    setFormCategory('Food');
    setFormDate(new Date().toISOString().split('T')[0]);
    setActionError(null);
    setMlPrediction(null);
    setCorrectionFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction Management</h2>
            {modelTelemetry && (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                <Cpu className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span>TF-IDF Classifier Active</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, add, edit, and filter your financial ledger with automatic ML category inference
          </p>
        </div>

        <div className="flex items-center gap-3">
          {transactions.length === 0 && !loading && (
            <button
              onClick={handleSeedData}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Seed Sample Data</span>
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:bg-brand-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 pl-10 pr-9 py-2 text-xs focus:border-brand-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-slate-800">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
                  selectedType === t
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchTxList()}
            className="rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white p-2 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400">
                <th className="px-6 py-4 font-semibold">Transaction</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 text-right font-semibold">Amount (₹)</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Loading transactions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p>No transactions found in database.</p>
                      <button
                        onClick={handleSeedData}
                        className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-500"
                      >
                        Populate with Sample Indian Transactions
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            tx.transaction_type === 'income'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.transaction_type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{tx.description}</p>
                          {tx.is_flagged_anomaly && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" /> {tx.anomaly_reason || 'Unusual spending detected'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 text-slate-700 border border-slate-200 dark:border-transparent dark:bg-slate-800/80 dark:text-slate-300 px-2.5 py-1 text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{tx.transaction_date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                          tx.transaction_type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        tx.transaction_type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-300 transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {(isCreateOpen || editingTx) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingTx ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enter transaction details in INR (₹). Records are immediately saved in your database.
            </p>

            {actionError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-300">
                {actionError}
              </div>
            )}

            <form onSubmit={editingTx ? handleUpdateTx : handleCreateTx} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      formType === 'expense'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      formType === 'income'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Swiggy Food Order, Uber Metro Commute, Amazon Purchase"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                />

                {/* ML Inference Status */}
                {predicting && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 animate-pulse">
                    <Sparkles className="h-3 w-3" />
                    <span>AI classifying transaction category using TF-IDF + Logistic Regression...</span>
                  </div>
                )}

                {mlPrediction && !predicting && (
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>
                        AI Suggested: <strong className="text-slate-900 dark:text-white">{mlPrediction.predicted_category}</strong>{' '}
                        ({Math.round(mlPrediction.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">v{mlPrediction.model_version}</span>
                  </div>
                )}

                {correctionFeedback && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{correctionFeedback}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="₹500"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category {mlPrediction && <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">(Auto-selected)</span>}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTx(null);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTx ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
