import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-slate-800/80" />
          <div className="h-4 w-96 rounded-lg bg-slate-800/50" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-slate-800/70" />
          <div className="h-10 w-36 rounded-xl bg-slate-800/70" />
        </div>
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-28 rounded bg-slate-800" />
              <div className="h-10 w-10 rounded-xl bg-slate-800/80" />
            </div>
            <div className="h-8 w-36 rounded-lg bg-slate-800 mb-3" />
            <div className="h-3 w-48 rounded bg-slate-800/50" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="h-6 w-48 rounded-lg bg-slate-800 mb-6" />
          <div className="h-72 w-full rounded-xl bg-slate-800/40" />
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="h-6 w-36 rounded-lg bg-slate-800 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-slate-800" />
                <div className="h-4 w-16 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
