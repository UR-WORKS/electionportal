import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function BoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Guard: must be logged in and BOOTH_ADMIN
  if (!session || session.role !== 'BOOTH_ADMIN') {
    redirect('/login');
  }

  // Fetch full user record with booth + candidate details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      candidateId: true,
      booth: {
        select: {
          number: true,
          name: true,
        },
      },
      candidate: {
        select: {
          abbrev: true,
        },
      },
    },
  });

  if (!user?.booth || !user.candidate) {
    // If not configured, show a simple fallback.
    return <div className="p-10 text-center font-bold text-gray-400">Account Configuration Error. Contact Admin.</div>;
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard/booth', icon: '📊' },
    { label: 'Candidate Update', href: '/dashboard/booth/candidate-update', icon: '👤' },
    { label: 'Election Counting', href: '/dashboard/booth/election-counting', icon: '🗳️' },
  ];

  return (
    <DashboardLayoutClient 
      navItems={navItems}
      headerTitle={`Booth ${user.booth.number}`}
      role="BOOTH_ADMIN"
    >
      {children}
    </DashboardLayoutClient>
  );
}
