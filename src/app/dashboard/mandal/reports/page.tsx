import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import MandalReportsClient from '@/components/dashboard/MandalReportsClient';
import { Role } from '@prisma/client';

export default async function MandalReportsPage() {
  const user = await getDashboardUser(['MANDAL_ADMIN']);
  if (!user || !user.constituencyId || !user.candidateId) redirect('/login');

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

  const panchayathData = panchayaths.map(p => {
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
      predicted: pPredicted,
      polled: pPolled,
      percentage: pPredicted > 0 ? ((pPolled / pPredicted) * 100).toFixed(1) : '0.0'
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">REPORTS ENGINE</h2>
        <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">Election Reports</p>
      </div>
      <MandalReportsClient 
        panchayathData={panchayathData}
        mandalName={user.constituency?.name || 'Mandalam'}
        candidateName={user.candidate?.name || 'Unknown'}
        candidateAbbrev={user.candidate?.abbrev || ''}
      />
    </div>
  );
}
