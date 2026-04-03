import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.booth.findMany({
    include: { panchayath: { select: { id: true, name: true } } },
    orderBy: [{ panchayathId: 'asc' }, { number: 'asc' }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { number, name, totalVoters, panchayathId } = await request.json();
  if (!number || !panchayathId) return NextResponse.json({ error: 'Booth number and panchayath are required.' }, { status: 400 });
  const item = await prisma.booth.create({
    data: {
      number: Number(number),
      name: name?.trim() || null,
      totalVoters: Number(totalVoters) || 0,
      panchayathId: Number(panchayathId),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
