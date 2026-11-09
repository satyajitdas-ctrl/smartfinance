import React, { useState, useEffect, Suspense } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PageSkeleton } from '../components/PageSkeleton';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  TrendingUp,
  Sparkles,
  Bot,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Activity,
  IndianRupee,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../services/api';
import type { SystemHealth } from '../types';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check failed:', err));
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Spending Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Insights', path: '/insights', icon: Sparkles },
    { name: 'AI Finance Assistant', path: '/assistant', icon: Bot },
    { name: 'Reports & Import', path: '/reports', icon: FileSpreadsheet },
    { name: 'Settings & Profile', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 shadow-lg shadow-brand-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">FinWise</span>
                <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-xs font-semibold text-brand-400">AI</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Intelligent Personal Finance</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-white/80" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-800/50 p-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 font-semibold text-brand-400">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email || 'user@finwise.ai'}</p>
              </div>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Online" />
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-200">
                FinWise AI Workspace
              </h1>
              <p className="text-xs text-slate-400">
                Autonomous Financial Analytics & Machine Learning Core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/40 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <IndianRupee className="h-3.5 w-3.5" />
              <span>INR (₹)</span>
            </div>

            {/* Backend connection status */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-300">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>API: {health?.status === 'healthy' ? 'Connected' : 'Checking...'}</span>
            </div>

            {/* Quick action button */}
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition-transform hover:bg-brand-500 active:scale-95"
            >
              <span>+ Add Transaction</span>
            </button>

            {/* User Profile Avatar Pill */}
            <div
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-700 transition-colors cursor-pointer"
              title="View Profile & Settings"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-[11px] font-bold text-white shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline font-medium text-slate-200">
                {user?.name ? user.name.split(' ')[0] : 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div key={location.pathname} className="mx-auto max-w-7xl animate-fade-in">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
