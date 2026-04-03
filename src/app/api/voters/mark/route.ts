import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

/** Resolve session and verify BOOTH_ADMIN role; returns user record. */
async function resolveBoothAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('election_session')?.value;
  const session = token ? await decrypt(token) : null;
  if (!session || session.role !== 'BOOTH_ADMIN') return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, boothId: true, candidateId: true },
  });
  if (!user || !user.boothId || !user.candidateId) return null;
  return user as { id: number; boothId: number; candidateId: number };
}

/** 
 * GET /api/voters/mark
 * Returns all marks for the current admin's booth.
 */
export async function GET(request: Request) {
  const user = await resolveBoothAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const boothId = searchParams.get('boothId') ? Number(searchParams.get('boothId')) : user.boothId;

  if (boothId !== user.boothId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const marks = await prisma.voterMark.findMany({
    where: { voter: { boothId } },
    select: {
      candidateId: true,
      hasVoted: true,
      voter: { select: { serialNumber: true } }
    },
  });

  const formatted = marks.map((m) => ({
    serialNumber: m.voter.serialNumber,
    candidateId: m.candidateId,
    hasVoted: m.hasVoted
  }));

  return NextResponse.json({ marks: formatted });
}

/** 
 * POST /api/voters/mark
 * Unified handler for all marking operations.
 */
export async function POST(request: Request) {
  const user = await resolveBoothAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action, serialNumber, boothId, targetCandidateId } = body;

  if (!action || !serialNumber || !boothId) {
    return NextResponse.json({ error: 'action, serialNumber, and boothId are required.' }, { status: 400 });
  }

  if (Number(boothId) !== user.boothId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Ensure Voter exists
  const voter = await prisma.voter.upsert({
    where: { serialNumber_boothId: { serialNumber: Number(serialNumber), boothId: Number(boothId) } },
    create: { serialNumber: Number(serialNumber), boothId: Number(boothId) },
    update: {},
  });

  if (action === 'AFFILIATE') {
    if (!targetCandidateId) return NextResponse.json({ error: 'targetCandidateId required for AFFILIATE' }, { status: 400 });
    
    // Clear and set new affiliation for this admin group
    await prisma.voterMark.deleteMany({
      where: { voterId: voter.id, user: { candidateId: user.candidateId } }
    });
    
    const mark = await prisma.voterMark.create({
      data: {
        voterId: voter.id,
        candidateId: Number(targetCandidateId),
        markedBy: user.id,
      }
    });

    // Smart Refresh Trigger
    await prisma.dashboardPulse.upsert({
      where: { id: 1 },
      update: { lastPulse: new Date() },
      create: { id: 1, lastPulse: new Date() }
    });

    return NextResponse.json(mark, { status: 201 });
  }

  if (action === 'POLL') {
    // Already mapped -> Toggle or set hasVoted
    const existingMark = await prisma.voterMark.findFirst({
        where: { voterId: voter.id, user: { candidateId: user.candidateId } }
    });

    if (!existingMark) return NextResponse.json({ error: 'Not mapped to your candidate' }, { status: 400 });

    const updated = await prisma.voterMark.update({
      where: { id: existingMark.id },
      data: { hasVoted: !existingMark.hasVoted }
    });

    return NextResponse.json(updated);
  }

  if (action === 'MAP_AND_POLL') {
    if (!targetCandidateId) return NextResponse.json({ error: 'targetCandidateId required for MAP_AND_POLL' }, { status: 400 });

    await prisma.voterMark.deleteMany({
      where: { voterId: voter.id, user: { candidateId: user.candidateId } }
    });

    const mark = await prisma.voterMark.create({
      data: {
        voterId: voter.id,
        candidateId: Number(targetCandidateId),
        markedBy: user.id,
        hasVoted: true
      }
    });

    // Smart Refresh Trigger
    await prisma.dashboardPulse.upsert({
      where: { id: 1 },
      update: { lastPulse: new Date() },
      create: { id: 1, lastPulse: new Date() }
    });

    return NextResponse.json(mark, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
