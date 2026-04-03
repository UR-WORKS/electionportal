'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard/booth', icon: '📊' },
  { label: 'Candidate Update', href: '/dashboard/booth/candidate-update', icon: '📝' },
  { label: 'Election Counting', href: '/dashboard/booth/election-counting', icon: '🗳️' },
];

export function BoothLayoutClient({ 
  children,
  boothInfo,
  candidateAbbrev
}: { 
  children: React.ReactNode;
  boothInfo: { number: number; name: string | null };
  candidateAbbrev: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-900/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Dynamic Brand/Booth Info */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                E
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="text-base font-black tracking-tight text-gray-900 uppercase">
                  Booth {boothInfo.number}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  {candidateAbbrev} · Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-bold transition-all px-4 py-2.5 rounded-xl border-2 ${
                    pathname === item.href
                      ? 'bg-emerald-600/5 text-emerald-600 border-emerald-500/20'
                      : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-100 mx-3" />
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </form>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-2xl text-gray-900 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-all active:scale-95"
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
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-300`}>
          <div className="px-6 pt-4 pb-8 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-black transition-all border-2 ${
                  pathname === item.href
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'text-gray-500 border-gray-50 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <form action={logout} className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-black text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
              >
                <span className="text-xl">🚪</span> Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-10 px-6 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100 mt-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <p className="text-center text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase">
            ElectionPortal · Secure Voter Management
          </p>
        </div>
      </footer>
    </div>
  );
}
