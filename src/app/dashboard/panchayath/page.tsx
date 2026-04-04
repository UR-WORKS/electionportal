import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import { PanchayathDashboardClient } from '@/components/dashboard/PanchayathDashboardClient';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Role } from '@prisma/client';

export default async function PanchayathDashboard() {
  const user = await getDashboardUser([Role.PANCHAYATH_ADMIN]);
  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');

  // 1. Total Electorate for the entire panchayath
  const sumResult = await prisma.booth.aggregate({
    where: { panchayathId: user.panchayathId },
    _sum: { totalVoters: true }
  });
  const totalElectorate = sumResult._sum.totalVoters || 0;

  // 2. Aggregate Stats for the entire panchayath and all candidates
  const [totalPredicted, totalPolled, candidates] = await Promise.all([
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
    }),
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
    })
  ]);

  // Aggregate candidate performance
  const allCandidates = candidates.map(c => ({
    id: c.id,
    name: c.name,
    party: c.abbrev,
    votes: c.marks.length,
    predicted: c._count.marks,
    percentage: totalPolled > 0 ? ((c.marks.length / totalPolled) * 100).toFixed(1) : '0.0',
    predictionPercentage: totalPredicted > 0 ? ((c._count.marks / totalPredicted) * 100).toFixed(1) : '0.0'
  })).sort((a, b) => b.votes - a.votes);

  // 3. Breakdown by Booth
  const booths = await prisma.booth.findMany({
    where: { panchayathId: user.panchayathId },
    include: {
      users: {
        where: { role: Role.BOOTH_ADMIN },
        select: { name: true, username: true }
      },
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
    
    const admin = w.users[0];
    
    return {
      id: w.id,
      number: w.number,
      name: w.name,
      totalVoters: w.totalVoters,
      adminName: admin?.name || 'N/A',
      adminUsername: admin?.username || 'N/A',
      predicted: wPredicted,
      polled: wPolled,
      percentage: wPredicted > 0 ? ((wPolled / wPredicted) * 100).toFixed(1) : '0.0'
    };
  });

  return (
    <>
      <DashboardHeader
        title="Panchayath Overview"
        subtitle={`${user.candidate?.name || 'Candidate'} · ${user.panchayath?.name || 'Panchayath'}`}
      />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PanchayathDashboardClient
          totalPredicted={totalPredicted}
          totalPolled={totalPolled}
          totalElectorate={totalElectorate}
          panchayathName={user.panchayath?.name || 'panchayath'}
          candidateName={user.candidate?.name || 'Unknown Candidate'}
          candidateId={user.candidateId}
          initialBooths={initialBooths}
          allCandidates={allCandidates}
        />
      </div>
    </>
  );
}
