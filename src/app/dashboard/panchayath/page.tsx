import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import { PanchayathDashboardClient } from '@/components/dashboard/PanchayathDashboardClient';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Role } from '@prisma/client';

export default async function PanchayaythDashboard() {
  const user = await getDashboardUser([Role.PANCHAYATH_ADMIN]);
  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');

  // 1. Total Electorate for the entire panchayath
  const sumResult = await prisma.booth.aggregate({
    where: { panchayathId: user.panchayathId },
    _sum: { totalVoters: true }
  });
  const totalElectorate = sumResult._sum.totalVoters || 0;

  // 2. Aggregate Stats for the entire panchayath
  const [totalPredicted, totalPolled] = await Promise.all([
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayathId: user.panchayathId } },
        candidateId: user.candidateId
      }
    }),
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayathId: user.panchayathId } },
        candidateId: user.candidateId,
        hasVoted: true
      }
    })
  ]);

  // 3. Breakdown by Booth
  const booths = await prisma.booth.findMany({
    where: { panchayathId: user.panchayathId },
    include: {
      voters: {
        include: {
          marks: {
            where: { candidateId: user.candidateId }
          }
        }
      }
    }
  });

  const initialBooths = booths.map(w => {
    let wPredicted = 0;
    let wPolled = 0;
    w.voters.forEach(v => {
      v.marks.forEach(m => {
        wPredicted++;
        if (m.hasVoted) wPolled++;
      });
    });
    return {
      id: w.id,
      number: w.number,
      name: w.name,
      predicted: wPredicted,
      polled: wPolled,
      percentage: wPredicted > 0 ? ((wPolled / wPredicted) * 100).toFixed(1) : '0.0'
    };
  });

  return (
    <>
      <DashboardHeader 
        title="Panchayath Overview" 
        subtitle={`${user.candidate?.name || 'Candidate'} · ${user.panchayath?.name || 'Panchayath'}\nTotal Electorate: ${totalElectorate}`} 
      />
      <PanchayathDashboardClient
        totalPredicted={totalPredicted}
        totalPolled={totalPolled}
        totalElectorate={totalElectorate}
        panchayathName={user.panchayath?.name || 'panchayath'}
        candidateName={user.candidate?.name || 'Unknown Candidate'}
        initialBooths={initialBooths}
      />
    </>
  );
}
