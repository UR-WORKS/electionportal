'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Search, 
  CheckCircle2, 
  ClipboardList, 
  Activity, 
  User, 
  Menu,
  X,
  Vote,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface MobileNavigationProps {
  role: 'super-admin' | 'mandal' | 'panchayath' | 'booth';
  navItems: { label: string; href: string; icon: React.ElementType }[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ role, navItems, isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed top-0 left-0 w-[280px] h-screen bg-white z-[70] transition-transform duration-300 ease-out shadow-2xl border-r border-slate-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-50">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <Vote size={18} />
              </div>
              <span className="text-base font-black tracking-tighter text-slate-900 uppercase">
                VOTE<span className="text-emerald-600">-TRACK</span>
              </span>
            </Link>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* User Profile - Compact */}
          <div className="p-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black border-2 border-white shadow-sm uppercase">
                {role ? role[0] : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">Admin User</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role?.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98] ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="text-sm uppercase tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-emerald-200' : 'text-slate-300'} />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/50">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl font-black text-sm transition-all active:scale-95 uppercase tracking-tight"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
