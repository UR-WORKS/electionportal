import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import MandalAnalyticsClient from '@/components/dashboard/MandalAnalyticsClient';
import { Role } from '@prisma/client';

export default async function MandalAnalyticsPage() {
  const user = await getDashboardUser(['MANDAL_ADMIN']);
  if (!user || !user.constituencyId || !user.candidateId) redirect('/login');
 
  // 1. Total Electorate for the entire Mandal
  const sumResult = await prisma.booth.aggregate({
    where: { panchayath: { constituencyId: user.constituencyId } },
    _sum: { totalVoters: true }
  });
  const totalElectorate = sumResult._sum.totalVoters || 0;

  const [candidates, panchayaths] = await Promise.all([
    prisma.candidate.findMany({
      include: {
        marks: {
          where: {
            voter: { booth: { panchayath: { constituencyId: user.constituencyId } } },
            hasVoted: true
          }
        },
        _count: {
          select: {
            marks: {
              where: {
                voter: { booth: { panchayath: { constituencyId: user.constituencyId } } }
              }
            }
          }
        }
      }
    }),
    prisma.panchayath.findMany({
      where: { constituencyId: user.constituencyId },
      include: {
        booths: {
          include: {
            voters: {
              include: {
                marks: {
                  where: { candidateId: user.candidateId }
                }
              }
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

  const panchayathPerformance = panchayaths.map(p => {
    let pPredicted = 0;
    let pPolled = 0;
    p.booths.forEach(w => {
      w.voters.forEach(v => {
        v.marks.forEach(m => {
          pPredicted++;
          if (m.hasVoted) pPolled++;
        });
      });
    });
    return {
      name: p.name,
      predicted: pPredicted,
      polled: pPolled
    };
  }).sort((a, b) => b.predicted - a.predicted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ANALYTICS ENGINE</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">Performance Analytics</p>
      </div>
      <MandalAnalyticsClient 
        allCandidates={allCandidates} 
        panchayathPerformance={panchayathPerformance}
        candidateId={user.candidateId}
      />
    </div>
  );
}
