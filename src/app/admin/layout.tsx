import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Candidates', href: '/admin/candidates', icon: '👥' },
    { label: 'Locations', href: '/admin/constituencies', icon: '📍' },
    { label: 'Panchayaths', href: '/admin/panchayaths', icon: '🏘️' },
    { label: 'Booths', href: '/admin/booths', icon: '🗳️' },
    { label: 'Users', href: '/admin/users', icon: '👤' },
  ];

  return (
    <DashboardLayoutClient 
      navItems={navItems}
      headerTitle="Super Admin Portal"
      role="SUPER_ADMIN"
    >
      {children}
    </DashboardLayoutClient>
  );
}
