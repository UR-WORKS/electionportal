import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function panchayathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser(['PANCHAYATH_ADMIN']);

  if (!user || user.role !== 'PANCHAYATH_ADMIN') {
    redirect('/login');
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard/panchayath', icon: '📊' },
    { label: 'Manage Booths', href: '/dashboard/panchayath/manage-booths', icon: '📍' },
  ];

  const headerTitle = user.panchayath?.name || 'panchayath Admin';
  const headerSubTitle = `${user.candidate?.abbrev} · Local Access`;

  return (
    <DashboardLayoutClient
      navItems={navItems}
      headerTitle={headerTitle}
      headerSubTitle={headerSubTitle}
    >
      {children}
    </DashboardLayoutClient>
  );
}
