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
 * POST /api/voters/mark/affiliation
 * Sets the predicted candidate affiliation and optional vote status.
 */
export async function POST(request: Request) {
  const user = await resolveBoothAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { serialNumber, boothId, targetCandidateId, hasVoted } = body;

  if (!serialNumber || !boothId || !targetCandidateId) {
    return NextResponse.json(
      { error: 'serialNumber, boothId, and targetCandidateId are required.' },
      { status: 400 }
    );
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

  // 1. Clear any existing marks for this voter made by this admin's candidate group
  // This ensures one "opinion" per voter per candidate.
  await prisma.voterMark.deleteMany({
    where: {
      voterId: voter.id,
      user: { candidateId: user.candidateId }
    }
  });

  // 2. Create new mark with the selected candidate affiliation
  const mark = await prisma.voterMark.create({
    data: {
      voterId: voter.id,
      candidateId: Number(targetCandidateId),
      markedBy: user.id,
      hasVoted: Boolean(hasVoted)
    }
  });

  return NextResponse.json(mark, { status: 201 });
}
