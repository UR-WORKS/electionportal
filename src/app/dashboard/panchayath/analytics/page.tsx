import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import PanchayathAnalyticsClient from '@/components/dashboard/PanchayathAnalyticsClient';
import { Role } from '@prisma/client';

export default async function PanchayathAnalyticsPage() {
  const user = await getDashboardUser([Role.PANCHAYATH_ADMIN]);
  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');

  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');
 
  // 1. Total Electorate for the entire Panchayath
  const sumResult = await prisma.booth.aggregate({
    where: { panchayathId: user.panchayathId },
    _sum: { totalVoters: true }
  });
  const totalElectorate = sumResult._sum.totalVoters || 0;

  const [candidates, booths] = await Promise.all([
    prisma.candidate.findMany({
      include: {
        marks: {
          where: {
            voter: { booth: { panchayathId: user.panchayathId } },
            hasVoted: true
          }
        },
        _count: {
          select: {
            marks: {
              where: {
                voter: { booth: { panchayathId: user.panchayathId } }
              }
            }
          }
        }
      }
    }),
    prisma.booth.findMany({
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
    })
  ]);

  const totalPolled = candidates.reduce((acc, c) => acc + c.marks.length, 0);
  const totalPredicted = candidates.reduce((acc, c) => acc + c._count.marks, 0);

  const allCandidates = candidates.map(c => ({
    id: c.id,
    name: c.name,
    party: c.abbrev,
    votes: c.marks.length,
    predicted: c._count.marks,
    percentage: totalElectorate > 0 ? ((c.marks.length / totalElectorate) * 100).toFixed(1) : '0.0',
    predictionPercentage: totalElectorate > 0 ? ((c._count.marks / totalElectorate) * 100).toFixed(1) : '0.0'
  }));

  const boothPerformance = booths.map(b => {
    let bPredicted = 0;
    let bPolled = 0;
    b.voters.forEach(v => {
      v.marks.forEach(m => {
        bPredicted++;
        if (m.hasVoted) bPolled++;
      });
    });
    return {
      id: b.id,
      number: `Booth ${b.number}`,
      name: b.name,
      predicted: bPredicted,
      polled: bPolled
    };
  }).sort((a, b) => b.predicted - a.predicted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PANCHAYATH ANALYTICS</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">Booth Performance</p>
      </div>
      <PanchayathAnalyticsClient 
        allCandidates={allCandidates} 
        boothPerformance={boothPerformance}
        candidateId={user.candidateId}
      />
    </div>
  );
}
