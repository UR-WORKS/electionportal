import { redirect, notFound } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import { ReadOnlyVoterGrid } from '@/components/booth/ReadOnlyVoterGrid';
import Link from 'next/link';

export default async function panchayathBoothView({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const boothId = parseInt(id);
  const user = await getDashboardUser(['PANCHAYATH_ADMIN']);
  if (!user || !user.panchayathId || !user.candidateId) redirect('/login');

  // Verify booth belongs to this panchayath
  const booth = await prisma.booth.findFirst({
    where: { id: boothId, panchayathId: user.panchayathId },
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

  if (!booth) return notFound();

  // Prepare marks for the grid with candidate abbrevs
  const marksMap: Record<number, { candidateAbbrev: string; voted: boolean }> = {};
  booth.voters.forEach(v => {
    const mark = v.marks[0];
    if (mark) {
      marksMap[v.serialNumber] = {
        candidateAbbrev: user.candidate?.abbrev || '?',
        voted: mark.hasVoted
      };
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex flex-col gap-1 text-left">
          <Link href="/dashboard/panchayath" className="group flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-all">
            <span>←</span> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mt-4">
            Booth {booth.number} · {booth.name || 'General'}
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            Performance View for {user.candidate?.abbrev}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm shadow-gray-200/50">
        <ReadOnlyVoterGrid
          totalVoters={booth.totalVoters}
          marks={marksMap}
        />
      </div>
    </div>
  );
}
