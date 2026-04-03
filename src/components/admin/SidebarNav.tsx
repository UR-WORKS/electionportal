'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Candidates',
    href: '/admin/candidates',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Constituencies',
    href: '/admin/constituencies',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    label: 'Panchayaths',
    href: '/admin/panchayaths',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Booths',
    href: '/admin/booths',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

/* ─── Shared nav list ──────────────────────────────────────────────────── */
function NavList({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Brand block ──────────────────────────────────────────────────────── */
function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 shrink-0">
      <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-600/20">
        E
      </div>
      <div className="min-w-0">
        <p className="text-base font-black text-gray-900 leading-tight">ElectionPortal</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-0.5">Super Admin</p>
      </div>
    </div>
  );
}

/* ─── User + logout block ──────────────────────────────────────────────── */
function UserBlock({ userName }: { userName: string }) {
  return (
    <div className="px-4 py-5 border-t border-gray-100 shrink-0">
      <div className="flex items-center gap-3 px-1 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-900 border border-gray-200">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate">{userName}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Administrator</p>
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </form>
    </div>
  );
}

/* ─── Main export: adaptive shell ─────────────────────────────────────── */
export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900">
      {/* ── Desktop sidebar (fixed, hidden on mobile) ─────────────────── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30">
        <Brand />
        <NavList />
        <UserBlock userName={userName} />
      </aside>

      {/* ── Mobile overlay backdrop ────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-out sidebar ──────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 flex flex-col bg-white border-r border-gray-100 z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-2xl shadow-gray-900/10`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/20">E</div>
            <div>
              <p className="text-base font-black text-gray-900">ElectionPortal</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <NavList onItemClick={() => setMobileOpen(false)} />
        <UserBlock userName={userName} />
      </aside>

      {/* ── Mobile top header ─────────────────────────────────────────── */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-emerald-600/20">E</div>
          <span className="text-sm font-black text-gray-900 tracking-tight uppercase">ElectionPortal</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-xl text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
