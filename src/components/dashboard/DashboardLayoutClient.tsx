'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

type NavItem = { label: string; href: string; icon: string };

export function DashboardLayoutClient({ 
  children,
  navItems,
  headerTitle,
  headerSubTitle,
}: { 
  children: React.ReactNode;
  navItems: NavItem[];
  headerTitle: string;
  headerSubTitle: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-gray-900 flex flex-col font-sans">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[#0B1229] shadow-lg shadow-black/10">
        <div className="mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-24">
            {/* Brand Area */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight text-white uppercase leading-none">
                  {headerTitle}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  IUML · REGIONAL ACCESS · ELECTIONPORTAL
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-bold transition-all py-1 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-cyan-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-bold text-gray-300 hover:text-white transition-all ml-4"
                >
                  Sign Out
                </button>
              </form>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-2xl text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-all"
              >
                <span className="sr-only">Open main menu</span>
                <svg className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-white/5 bg-[#0B1229] animate-in slide-in-from-top duration-300`}>
          <div className="px-6 pt-4 pb-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-base font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <form action={logout} className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-base font-bold text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto py-12 px-6 lg:px-12">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="mx-auto px-12">
          <p className="text-center text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
            ElectionPortal · Secure Voter Management
          </p>
        </div>
      </footer>
    </div>
  );
}
