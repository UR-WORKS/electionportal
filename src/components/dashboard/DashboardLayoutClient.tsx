'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import MobileNavigation from './MobileNavigation';
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
  CheckCircle2,
  Building2,
  FolderTree
} from 'lucide-react';

type NavItem = { label: string; href: string; icon: string | React.ElementType };

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  navItems: NavItem[];
  headerTitle: string;
  headerSubTitle?: string;
  role?: string;
}

export function DashboardLayoutClient({ 
  children,
  navItems,
  headerTitle,
  role = 'MANDAL_ADMIN',
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map internal database roles to UI roles
  const mapRole = (r: string): 'super-admin' | 'mandal' | 'panchayath' | 'booth' => {
    const roleUpper = r.toUpperCase();
    if (roleUpper.includes('SUPER')) return 'super-admin';
    if (roleUpper.includes('MANDAL')) return 'mandal';
    if (roleUpper.includes('PANCHAYATH') || roleUpper.includes('WARD')) return 'panchayath';
    if (roleUpper.includes('BOOTH')) return 'booth';
    return 'mandal';
  };

  const uiRole = mapRole(role);

  // Map icons to Lucide components if they are strings/emojis
  const mappedNavItems = navItems.map(item => {
    if (typeof item.icon !== 'string') return item as any;
    
    // Simple heuristic-based mapping for existing string icons
    let Icon = LayoutDashboard;
    const label = item.label.toLowerCase();
    if (label.includes('dashboard') || label.includes('overview')) Icon = LayoutDashboard;
    else if (label.includes('panchayath')) Icon = Building2;
    else if (label.includes('mandal')) Icon = FolderTree;
    else if (label.includes('candidate')) Icon = Users;
    else if (label.includes('location')) Icon = MapPin;
    else if (label.includes('setting')) Icon = Settings;
    else if (label.includes('report')) Icon = FileText;
    else if (label.includes('analytic')) Icon = BarChart3;
    else if (label.includes('vote') || label.includes('mark')) Icon = CheckCircle2;
    else if (label.includes('counting')) Icon = Activity;
    else if (label.includes('profile')) Icon = User;
    
    return { ...item, icon: Icon };
  });

  if (!mounted) return <div className="min-h-screen bg-[#F9FAFB]" />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        role={uiRole} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        navItems={mappedNavItems}
      />

      {/* Main Content Area */}
      <div 
        className={`main-content min-h-screen flex flex-col ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Top Header */}
        <DashboardHeader 
          title={headerTitle} 
          role={uiRole} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        {/* Content Wrapper */}
        <main className="flex-1 p-4 lg:p-6 bg-[#F9FAFB]">
          <div className="w-full h-full">
            {/* Main Content Surface */}
            <div className="relative rounded-3xl bg-white shadow-sm border border-gray-200/50 p-6 lg:p-8 min-h-[calc(100vh-140px)] w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Footer (Simplified for dashboard) */}
        <footer className="p-8 mt-auto hidden lg:block">
          <p className="text-center text-[10px] font-black text-gray-300 tracking-[0.4em] uppercase">
            VOTE-TRACK · Secure Election Management · (c) 2026
          </p>
        </footer>
        
        {/* Mobile Spacer (for bottom nav) */}
        {uiRole === 'booth' && <div className="h-28 lg:hidden" />}
      </div>

      {/* Mobile Navigation (Drawer or Bottom Nav) */}
      <MobileNavigation 
        role={uiRole}
        navItems={mappedNavItems}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
