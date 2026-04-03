import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'BOOTH_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { boothId, totalVoters } = await request.json();

  if (!boothId || !totalVoters || isNaN(totalVoters) || totalVoters <= 0) {
    return NextResponse.json({ error: 'Invalid voter count' }, { status: 400 });
  }

  try {
    // 1. Verify this user owns this booth
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { boothId: true }
    });

    if (!user || user.boothId !== Number(boothId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Only allow if currently 0
    const booth = await prisma.booth.findUnique({
      where: { id: Number(boothId) }
    });

    if (!booth || booth.totalVoters !== 0) {
      return NextResponse.json({ error: 'Voter count already initialized. Contact Super Admin for changes.' }, { status: 400 });
    }

    // 3. Update
    await prisma.booth.update({
      where: { id: Number(boothId) },
      data: { totalVoters: Number(totalVoters) }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
