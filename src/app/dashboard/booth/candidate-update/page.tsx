import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PartyUpdateGrid } from '@/components/booth/PartyUpdateGrid';

export default async function CandidateUpdatePage() {
  const session = await getSession();
  if (!session || session.role !== 'BOOTH_ADMIN') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, boothId: true, candidateId: true }
  });

  if (!user?.boothId) return <div>Booth not assigned.</div>;

  const [totalVoters, candidates, initialMarks] = await Promise.all([
    prisma.booth.findUnique({ where: { id: user.boothId }, select: { totalVoters: true } }),
    prisma.candidate.findMany({ select: { id: true, name: true, abbrev: true } }),
    prisma.voterMark.findMany({
      where: { 
        voter: { boothId: user.boothId },
        user: { candidateId: user.candidateId } // Filter to our candidate's effort
      },
      select: { voter: { select: { serialNumber: true } }, candidateId: true, hasVoted: true }
    })
  ]);

  const formattedMarks = initialMarks.map(m => ({
    serialNumber: m.voter.serialNumber,
    candidateId: m.candidateId,
    hasVoted: m.hasVoted
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Candidate Update</h1>
        <p className="text-slate-400 text-sm">Assign predicted candidate affiliations to voters in your booth.</p>
      </div>
      <PartyUpdateGrid 
        boothId={user.boothId} 
        totalVoters={totalVoters?.totalVoters ?? 0} 
        candidates={candidates} 
        initialMarks={formattedMarks} 
      />
    </div>
  );
}
