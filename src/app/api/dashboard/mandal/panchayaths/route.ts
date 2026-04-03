import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDashboardUser } from '@/lib/dashboard-auth';

export async function GET() {
  const user = await getDashboardUser(['MANDAL_ADMIN']);
  if (!user || !user.constituencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const panchayaths = await prisma.panchayath.findMany({
    where: { constituencyId: user.constituencyId },
    include: {
      users: {
        where: {
          role: 'PANCHAYATH_ADMIN'
        },
        select: {
          id: true,
          username: true,
          name: true,
          candidateId: true
        }
      },
      _count: {
        select: { users: { where: { candidateId: user.candidateId } }, booths: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({
    currentCandidateId: user.candidateId,
    panchayaths
  });
}
