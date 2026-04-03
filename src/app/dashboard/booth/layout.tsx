import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { BoothLayoutClient } from '@/components/booth/BoothLayoutClient';

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

  return (
    <BoothLayoutClient 
      boothInfo={{ number: user.booth.number, name: user.booth.name }} 
      candidateAbbrev={user.candidate.abbrev}
    >
      {children}
    </BoothLayoutClient>
  );
}
