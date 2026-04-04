import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import PanchayathReportsClient from '@/components/dashboard/PanchayathReportsClient';
import { Role } from '@prisma/client';

export default async function PanchayathReportsPage() {
  const user = await getDashboardUser([Role.PANCHAYATH_ADMIN]);
  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');

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

  const boothData = booths.map(b => {
    let bPredicted = 0;
    let bPolled = 0;
    b.voters.forEach(v => {
      v.marks.forEach(m => {
        bPredicted++;
        if (m.hasVoted) bPolled++;
      });
    });

    const admin = b.users[0];
    
    return {
      id: b.id,
      number: b.number,
      name: b.name,
      adminName: admin?.name || 'N/A',
      predicted: bPredicted,
      polled: bPolled,
      percentage: bPredicted > 0 ? ((bPolled / bPredicted) * 100).toFixed(1) : '0.0',
      totalVoters: b.totalVoters
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PANCHAYATH REPORTS</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">Booth-wise Performance</p>
      </div>
      <PanchayathReportsClient 
        boothData={boothData}
        panchayathName={user.panchayath?.name || 'Panchayath'}
        candidateName={user.candidate?.name || 'Unknown'}
        candidateAbbrev={user.candidate?.abbrev || ''}
      />
    </div>
  );
}
