import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Zap,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency] = useState('INR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, enterDirectly, quickRegisterNewUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your name');
        await register(name, email, password, currency);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      await enterDirectly();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Instant access failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickNewUser = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickRegisterNewUser(name || 'Personal User');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Quick registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('satyajit@example.com');
    setPassword('SecurePassword123!');
    setName('Satyajit Das');
    setIsRegister(false);
    setError(null);
  };

  const fillUatAccount = () => {
    setEmail('uat.tester@finwise.ai');
    setPassword('UatTesting2026!');
    setName('UAT SDLC Tester');
    setIsRegister(false);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 selection:bg-brand-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/25 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">FinWise AI</h1>
          <p className="mt-1 text-sm text-slate-400">
            Intelligent Personal Finance & Machine Learning Platform
          </p>
        </div>

        {/* 1-Click Frictionless Instant Access Hero Card */}
        <div className="mb-5 overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instant Personal Access</h3>
                <p className="text-[11px] text-emerald-400/80">Skip typing credentials &bull; 1-click enter</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              Personal Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={handleInstantAccess}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>Enter as Satyajit</span>
            </button>

            <button
              type="button"
              onClick={handleQuickNewUser}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4 text-brand-400" />
              <span>New Fresh User</span>
            </button>
          </div>
        </div>

        {/* Detailed Credentials Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-800/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                !isRegister
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                isRegister
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Satyajit Das"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="satyajit@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-500 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{isRegister ? 'Register & Enter Workspace' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo & UAT Helpers */}
          <div className="mt-6 border-t border-slate-800/80 pt-5 space-y-2">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="flex w-full items-center justify-between rounded-xl border border-brand-500/30 bg-brand-500/5 px-3.5 py-2.5 text-xs font-medium text-brand-300 hover:bg-brand-500/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-brand-400" />
                <span>Fill Pre-Populated Demo (Satyajit)</span>
              </span>
              <span className="font-semibold text-brand-400">&rarr;</span>
            </button>

            <button
              type="button"
              onClick={fillUatAccount}
              className="flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Fill Clean UAT Testing Account (Tester)</span>
              </span>
              <span className="font-semibold text-emerald-400">&rarr;</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          FinWise AI &bull; Secure JWT Authentication &bull; Automatic Personal Session
        </p>
      </div>
    </div>
  );
};
