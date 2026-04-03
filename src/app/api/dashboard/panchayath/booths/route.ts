import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { Role } from '@prisma/client';

export async function GET() {
  const user = await getDashboardUser([Role.PANCHAYATH_ADMIN]);
  if (!user || !user.panchayathId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const booths = await prisma.booth.findMany({
    where: { panchayathId: user.panchayathId },
    include: {
      users: {
        where: {
          role: 'BOOTH_ADMIN',
          candidateId: user.candidateId
        },
        select: {
          id: true,
          username: true,
          name: true
        }
      },
      _count: {
        select: { users: { where: { candidateId: user.candidateId } } }
      }
    },
    orderBy: { number: 'asc' }
  });

  return NextResponse.json(booths);
}
