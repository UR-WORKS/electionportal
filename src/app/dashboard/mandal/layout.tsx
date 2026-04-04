import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function MandalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser(['MANDAL_ADMIN']);

  if (!user || user.role !== 'MANDAL_ADMIN') {
    redirect('/login');
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard/mandal', icon: '📊' },
    { label: 'Analytics', href: '/dashboard/mandal/analytics', icon: '📈' },
    { label: 'Reports', href: '/dashboard/mandal/reports', icon: '📄' },
  ];

  const headerTitle = user.constituency?.name || 'Mandalam Admin';
  const headerSubTitle = `${user.candidate?.abbrev} · Regional Access`;

  return (
    <DashboardLayoutClient
      navItems={navItems}
      headerTitle={headerTitle}
      role="MANDAL_ADMIN"
    >
      {children}
    </DashboardLayoutClient>
  );
}
