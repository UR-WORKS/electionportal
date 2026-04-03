import { redirect, notFound } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MandalpanchayathView({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const pId = parseInt(id);
  const user = await getDashboardUser(['MANDAL_ADMIN']);
  if (!user || !user.constituencyId || !user.candidateId) redirect('/login');

  // Verify panchayath belongs to this mandal
  const panchayath = await prisma.panchayath.findFirst({
    where: { id: pId, constituencyId: user.constituencyId },
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
  });

  if (!panchayath) return notFound();

  const boothStats = panchayath.booths.map(w => {
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
    <div className="space-y-12">
      <div className="flex flex-col gap-1 px-4">
        <Link href="/dashboard/mandal" className="group flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:translate-x-[-4px] transition-transform">
          <span>←</span> Back to Mandalam Dashboard
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mt-2">
          {panchayath.name} Performance
        </h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
          Booth-by-booth breakdown for {user.candidate?.abbrev}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {boothStats.map((w) => (
          <div key={w.id} className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Booth {w.number} · {w.name}</h3>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{w.polled} / {w.predicted} Polled</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{w.percentage}%</span>
              </div>
            </div>
            {/* Note: Mandal Admin doesn't necessarily need voter-level high-speed grid access as much as a panchayath Admin, 
                but we could add it if requested. For now, this is a clean performance summary. */}
          </div>
        ))}
      </div>
    </div>
  );
}
