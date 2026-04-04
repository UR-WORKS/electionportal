'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCcw,
  Menu,
  ShieldCheck,
  BarChart3,
  UserCheck,
  X,
  Clock,
  Calendar,
  Vote
} from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  role: 'super-admin' | 'mandal' | 'panchayath' | 'booth';
  onMenuClick?: () => void;
}

export default function DashboardHeader({ title, role, onMenuClick }: DashboardHeaderProps) {
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate sync delay
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsSyncing(false);
    }, 800);
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'super-admin': return <ShieldCheck size={18} />;
      case 'mandal':
      case 'panchayath': return <BarChart3 size={18} />;
      case 'booth': return <UserCheck size={18} />;
      default: return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'mandal': return 'Mandalam Admin';
      case 'panchayath': return 'Panchayath Admin';
      case 'booth': return 'Booth Admin';
      default: return 'User';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] z-30 h-[72px] glass-header flex items-center justify-between px-6 lg:px-8 transition-all duration-300 ease-in-out gap-4">

      {/* Left: App Branding (Mobile/Desktop Title) */}
      <div className="flex items-center gap-4 flex-1 lg:flex-none">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-emerald-600 transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col lg:ml-4">
          {/* Mobile Only: App Name */}
          <div className="lg:hidden flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Vote size={14} />
            </div>
            <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">
              VOTE<span className="text-emerald-600">-TRACK</span>
            </span>
          </div>

          <h1 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight leading-none uppercase">
            {title}
          </h1>

          <div className="lg:hidden flex items-center gap-1.5 mt-1">
            <span className="text-emerald-600">{getRoleIcon()}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              {getRoleLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Date, Time, Sync, Profile */}
      <div className="flex items-center gap-2 lg:gap-6">

        {/* Last Synced Info (Desktop only) */}
        <div className="hidden xl:flex items-center gap-4 px-5 py-2.5 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm transition-all">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-gray-400 mb-0.5">
              <Clock size={12} strokeWidth={3} className="text-emerald-600/50" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Last Synced</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-gray-900 tabular-nums">
                {lastSyncTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {lastSyncTime.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Data Action */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        {/* Desktop Role Badge */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100/50 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
            {getRoleIcon()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-tight leading-none">
              {getRoleLabel()}
            </span>
            <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest leading-none">
              Active Session
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}
