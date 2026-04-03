import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { VoterCountPrompt } from '@/components/dashboard/VoterCountPrompt';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Booth Dashboard | ElectionPortal',
  description: 'Real-time statistics for the booth.',
};

export default async function BoothDashboard() {
  const session = await getSession();

  if (!session) redirect('/login');
  if (session.role !== 'BOOTH_ADMIN') redirect('/admin');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      boothId: true,
      candidateId: true,
      booth: {
        select: {
          id: true,
          number: true,
          name: true,
          totalVoters: true,
          panchayath: { select: { name: true } },
        },
      },
      candidate: { select: { name: true, abbrev: true } },
    },
  });

  if (!user?.boothId || !user.booth || !user.candidateId || !user.candidate) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 text-center">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 max-w-md">
          <div className="text-5xl mb-6">⚠️</div>
          <h1 className="text-xl font-black text-amber-900 mb-2 uppercase tracking-tight">Account Configuration Error</h1>
          <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
            Your account is missing a Booth or Candidate assignment. Please contact the Super Admin.
          </p>
        </div>
      </div>
    );
  }

  const [boothVotedCount, candidateMarks, allCandidates] = await Promise.all([
    prisma.voterMark.findMany({
      where: { voter: { boothId: user.boothId }, hasVoted: true },
      select: { voterId: true },
    }).then(marks => new Set(marks.map(m => m.voterId)).size),
    prisma.voterMark.findMany({
      where: { voter: { boothId: user.boothId } },
      select: { hasVoted: true, candidateId: true },
    }),
    prisma.candidate.findMany({ select: { id: true, name: true, abbrev: true } })
  ]);

  const predictedForUs = candidateMarks.filter(m => m.candidateId === user.candidateId).length;
  const votedForUs = candidateMarks.filter(m => m.candidateId === user.candidateId && m.hasVoted).length;

  const totalVotersVal = user.booth.totalVoters;
  const predictedCount = predictedForUs;
  const votedCount = votedForUs;
  const pendingCount = predictedCount - votedCount;
  const pollingPercentage = totalVotersVal > 0 ? ((boothVotedCount / totalVotersVal) * 100).toFixed(1) : '0.0';

  // Comparative report data
  const comparisonData = allCandidates.map(c => {
    const marks = candidateMarks.filter(m => m.candidateId === c.id);
    const count = marks.length;
    const voted = marks.filter(m => m.hasVoted).length;
    return {
      ...c,
      count,
      voted,
      predictionPercentage: totalVotersVal > 0 ? ((count / totalVotersVal) * 100).toFixed(1) : '0.0',
      votingPercentage: totalVotersVal > 0 ? ((voted / totalVotersVal) * 100).toFixed(1) : '0.0'
    };
  }).sort((a, b) => b.count - a.count);

  const stats = [
    { label: 'Booth Polled', value: boothVotedCount, icon: '📮', color: 'gray' },
    { label: 'Predicted (Us)', value: predictedCount, icon: '📈', color: 'blue' },
    { label: 'Voted (Us)', value: votedCount, icon: '✅', color: 'emerald' },
    { label: 'Pending (Us)', value: pendingCount, icon: '⏳', color: 'amber' },
    { label: 'Polling %', value: `${pollingPercentage}%`, icon: '📊', color: 'teal' },
  ];

  const colorMap: any = {
    gray: 'text-gray-600 bg-gray-100',
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    teal: 'text-teal-600 bg-teal-50',
  };

  return (
    <div className="space-y-12">
      <VoterCountPrompt boothId={user.boothId} initialTotalVoters={user.booth.totalVoters} />
      
      <DashboardHeader 
        title="Dashboard Overview" 
        subtitle={`Booth ${user.booth.number} · ${user.candidate.abbrev}\n${user.booth.name}`} 
      />

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
          >
            <div className={`text-2xl mb-6 p-3 rounded-2xl w-fit ${colorMap[stat.color]}`}>{stat.icon}</div>
            <div className="text-4xl font-black text-gray-900 mb-1 tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Comparative Prediction Report */}
        <div className="rounded-[2.5rem] bg-[#0B1229] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5 h-full">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Predicted Affiliation Report</h2>
              <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest leading-relaxed">
                Comparison of predicted voter base strengths relative to total electorate ({totalVotersVal}).
              </p>
            </div>

            <div className="space-y-8">
              {comparisonData.map((cand) => {
                const isUs = cand.id === user.candidateId;
                return (
                  <div key={cand.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${isUs ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isUs ? 'text-white' : 'text-gray-400'}`}>
                          {cand.abbrev} {isUs && '(US)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-400">{cand.count} Mapped ({cand.predictionPercentage}%)</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isUs ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-700'}`}
                        style={{ width: `${cand.predictionPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Election Counting Summary */}
        <div className="rounded-[2.5rem] bg-white p-10 text-gray-900 shadow-xl border border-gray-100 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-50" />
          <div className="relative space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Election Polling Summary</h2>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">
                Live turnout statistics for each candidate based on reported polled voters.
              </p>
            </div>

            <div className="space-y-8">
              {comparisonData.sort((a, b) => b.voted - a.voted).map((cand) => {
                const isUs = cand.id === user.candidateId;
                return (
                  <div key={cand.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${isUs ? 'bg-indigo-400 animate-pulse' : 'bg-gray-300'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isUs ? 'text-gray-900' : 'text-gray-400'}`}>
                          {cand.abbrev} {isUs && '(US)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-indigo-600">{cand.voted} Polled ({cand.votingPercentage}%)</span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isUs ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        style={{ width: `${cand.votingPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {[
          {
            title: 'Candidate Update',
            desc: "Map your candidate's voters and predicted affiliations.",
            href: '/dashboard/booth/candidate-update',
            icon: '📝',
            accent: 'blue'
          },
          {
            title: 'Election Counting',
            desc: "Monitor live voter turnout and record polled citizens.",
            href: '/dashboard/booth/election-counting',
            icon: '🗳️',
            accent: 'emerald'
          }
        ].map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-emerald-600/20 hover:bg-gray-50/50 transition-all flex items-center justify-between overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-emerald-900/5"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-16 w-16 rounded-3xl bg-gray-50 flex items-center justify-center text-3xl group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-sm">{link.icon}</div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{link.title}</h3>
                <p className="text-xs font-bold text-gray-400 group-hover:text-gray-500 max-w-[200px] leading-relaxed uppercase tracking-wider">{link.desc}</p>
              </div>
            </div>
            <span className="text-2xl font-black text-gray-200 group-hover:text-emerald-600 group-hover:translate-x-3 transition-all duration-500 select-none relative z-10">→</span>
            {/* Hover Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
