import React from 'react';
import {
  Settings,
  User,
  Shield,
  Cpu,
  Database,
  IndianRupee,
  Bot,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings & Configurations</h2>
        <p className="text-xs text-slate-400">
          Manage your user profile, currency preferences, and AI/ML model parameters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* User Profile Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-brand-400 mb-4">
            <User className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">User Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Satyajit Das'}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-xs text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'satyajit@example.com'}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-xs text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Base Currency</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-xs text-emerald-400 font-semibold">
                <IndianRupee className="h-4 w-4" />
                <span>INR (₹) — Indian Rupee (Default)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI & ML Architecture Configuration */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-indigo-400 mb-4">
            <Cpu className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              AI & Machine Learning Engine
            </h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Expense Categorizer Model</span>
                <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> TF-IDF + Logistic Regression
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trained on synthetic Indian financial merchant datasets. Auto-predicts categories on input.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Anomaly Detection Engine</span>
                <span className="flex items-center gap-1 rounded bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold text-brand-400">
                  <CheckCircle2 className="h-3 w-3" /> Isolation Forest
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Flags statistical anomalies without falsely labeling transactions as fraud.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">AI Assistant Provider</span>
                <span className="flex items-center gap-1 rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                  <Bot className="h-3 w-3" /> Configurable / Rule-based Fallback
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Gemini / OpenAI / Groq with 100% deterministic local calculation fallback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
