'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  useEffect(() => {
    setLastRefreshed(new Date().toLocaleString());
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    
    // Update the timestamp
    setLastRefreshed(new Date().toLocaleString());

    // Simulate a brief loading state for visual feedback
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl ring-1 ring-black/5">
      <div className="mb-4 md:mb-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 bg-clip-text text-transparent tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest whitespace-pre-line leading-relaxed">
            {subtitle}
          </p>
          {lastRefreshed && (
            <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1.5 mt-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              Last Refreshed: {lastRefreshed}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleManualRefresh}
          className={`group flex items-center gap-2.5 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all duration-300 shadow-sm shadow-emerald-500/5 active:scale-95 ${isRefreshing ? 'opacity-50 cursor-wait' : ''}`}
        >
          <span className={`text-sm ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
            {isRefreshing ? '⌛' : '🔄'}
          </span>
          <span className="text-xs font-black uppercase tracking-[0.1em]">
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </span>
        </button>

        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">Live Status</span>
        </div>
      </div>
    </div>
  );
}
