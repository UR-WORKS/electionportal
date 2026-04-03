import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

/** Resolve session and verify BOOTH_ADMIN role; returns full user record. */
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
  return user as { id: number, boothId: number, candidateId: number };
}

/** 
 * POST /api/voters/mark/vote
 * Toggles the 'hasVoted' status for a voter's mark for the current admin's candidate.
 */
export async function POST(request: Request) {
  const user = await resolveBoothAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { serialNumber, boothId } = body;

  if (!serialNumber || !boothId) {
    return NextResponse.json({ error: 'serialNumber and boothId are required.' }, { status: 400 });
  }

  // Security: BOOTH_ADMIN can only toggle in their own booth
  if (Number(boothId) !== user.boothId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Ensure the Voter record exists
  const voter = await prisma.voter.upsert({
    where: { serialNumber_boothId: { serialNumber: Number(serialNumber), boothId: Number(boothId) } },
    create: { serialNumber: Number(serialNumber), boothId: Number(boothId) },
    update: {},
  });

  // Toggle or Create
  const existingMark = await prisma.voterMark.findUnique({
    where: { voterId_candidateId: { voterId: voter.id, candidateId: user.candidateId } }
  });

  if (existingMark) {
    // Toggle existing status
    const updated = await prisma.voterMark.update({
      where: { id: existingMark.id },
      data: { hasVoted: !existingMark.hasVoted }
    });
    return NextResponse.json({ action: 'toggled', hasVoted: updated.hasVoted });
  } else {
    // Create new mark for admin's candidate as "Voted" (it acts as a default mapping too)
    const newMark = await prisma.voterMark.create({
      data: {
        voterId: voter.id,
        candidateId: user.candidateId,
        markedBy: user.id,
        hasVoted: true
      }
    });
    return NextResponse.json({ action: 'created', hasVoted: newMark.hasVoted });
  }
}
