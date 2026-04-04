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
      percentage: w.totalVoters > 0 ? ((wPolled / w.totalVoters) * 100).toFixed(1) : '0.0'
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boothStats.map((w) => (
          <div key={w.id} className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <span className="text-xs font-black">#{w.number}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{w.percentage}%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Polling Yield</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-emerald-700 transition-colors">{w.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Booth Station {w.number}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">{w.polled} POLLED</span>
                  <span className="text-emerald-600">{w.predicted} PREDICTED</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                    style={{ width: `${w.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          </div>
        ))}

        {boothStats.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <p className="text-gray-300 font-black uppercase tracking-[0.3em] text-xs">No booths configured for this panchayath</p>
          </div>
        )}
      </div>
    </div>
  );
}
