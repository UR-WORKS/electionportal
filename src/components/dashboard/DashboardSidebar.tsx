'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Settings, 
  BarChart3, 
  PieChart, 
  FileText, 
  ClipboardList, 
  Activity, 
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Vote,
  Building2,
  UserCheck
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  role: 'super-admin' | 'mandal' | 'panchayath' | 'booth';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  navItems: { label: string; href: string; icon: React.ElementType }[];
}

export default function DashboardSidebar({ role, isCollapsed, setIsCollapsed, navItems }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      } hidden lg:flex`}
    >
      {/* Logo Section */}
      <div className="h-[72px] flex items-center px-6 border-b border-gray-50 bg-white sticky top-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Vote size={24} />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-gray-900">
              VOTE<span className="text-emerald-600">-TRACK</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={22} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[88px] w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
            {role[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">Admin User</p>
              <p className="text-[10px] font-medium text-gray-500 truncate uppercase">{role.replace('-', ' ')}</p>
            </div>
          )}
        </div>
        
        <form action={logout} className="mt-4">
          <button
            type="submit"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-medium transition-all hover:bg-red-50 hover:text-red-600 group ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
