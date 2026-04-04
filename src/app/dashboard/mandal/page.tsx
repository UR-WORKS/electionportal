import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import { MandalDashboardClient } from '@/components/dashboard/MandalDashboardClient';
import { Role } from '@prisma/client';

export default async function MandalDashboard() {
  const user = await getDashboardUser(['MANDAL_ADMIN']);
  if (!user || !user.constituencyId || !user.candidateId) redirect('/login');

  // 1. Total Electorate for the entire Mandal
  const sumResult = await prisma.booth.aggregate({
    where: { panchayath: { constituencyId: user.constituencyId } },
    _sum: { totalVoters: true }
  });
  const totalElectorate = sumResult._sum.totalVoters || 0;

  // 2. Aggregate Stats for the entire Mandal (Constituency)
  const oneHourAgo = new Date(Date.now() - 3600000);

  const [totalPredicted, totalPolled, predictedLastHour, polledLastHour, candidates] = await Promise.all([
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayath: { constituencyId: user.constituencyId } } },
        candidateId: user.candidateId
      }
    }),
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayath: { constituencyId: user.constituencyId } } },
        candidateId: user.candidateId,
        hasVoted: true
      }
    }),
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayath: { constituencyId: user.constituencyId } } },
        candidateId: user.candidateId,
        createdAt: { gte: oneHourAgo }
      }
    }),
    prisma.voterMark.count({
      where: {
        voter: { booth: { panchayath: { constituencyId: user.constituencyId } } },
        candidateId: user.candidateId,
        hasVoted: true,
        updatedAt: { gte: oneHourAgo }
      }
    }),
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
    })
  ]);

  // Aggregate candidate counts
  const allCandidates = candidates.map(c => ({
    id: c.id,
    name: c.name,
    party: c.abbrev,
    votes: c.marks.length,
    predicted: c._count.marks,
    percentage: totalElectorate > 0 ? ((c.marks.length / totalElectorate) * 100).toFixed(1) : '0.0',
    predictionPercentage: totalElectorate > 0 ? ((c._count.marks / totalElectorate) * 100).toFixed(1) : '0.0'
  })).sort((a, b) => b.votes - a.votes);

  // Calculate Trends
  const calculateTrend = (current: number, change: number) => {
    const previous = current - change;
    if (previous <= 0) return change > 0 ? 100 : 0;
    return (change / previous) * 100;
  };

  const trends = {
    predicted: calculateTrend(totalPredicted, predictedLastHour).toFixed(1),
    polled: calculateTrend(totalPolled, polledLastHour).toFixed(1),
    pending: calculateTrend(totalPredicted - totalPolled, predictedLastHour - polledLastHour).toFixed(1),
  };

  // 3. Breakdown by panchayath
  const panchayaths = await prisma.panchayath.findMany({
    where: { constituencyId: user.constituencyId },
    include: {
      users: {
        where: { role: Role.PANCHAYATH_ADMIN },
        select: { name: true, username: true }
      },
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
  });

  const initialpanchayaths = panchayaths.map(p => {
    let pPredicted = 0;
    let pPolled = 0;
    let pTotalVoters = 0;
    
    p.booths.forEach(w => {
      pTotalVoters += w.totalVoters;
      w.voters.forEach(v => {
        v.marks.forEach(m => {
          pPredicted++;
          if (m.hasVoted) pPolled++;
        });
      });
    });

    const admin = p.users[0];
    
    return {
      id: p.id,
      name: p.name,
      totalVoters: pTotalVoters,
      adminName: admin?.name || 'N/A',
      adminUsername: admin?.username || 'N/A',
      predicted: pPredicted,
      polled: pPolled,
      percentage: pTotalVoters > 0 ? ((pPolled / pTotalVoters) * 100).toFixed(1) : '0.0'
    };
  });

  return (
    <>
      <MandalDashboardClient
        totalPredicted={totalPredicted}
        totalPolled={totalPolled}
        totalElectorate={totalElectorate}
        mandalName={user.constituency?.name || 'Mandalam'}
        candidateName={user.candidate?.name || 'Unknown Candidate'}
        candidateId={user.candidateId}
        initialpanchayaths={initialpanchayaths}
        trends={trends}
        allCandidates={allCandidates}
      />
    </>
  );
}
