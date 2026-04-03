import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.panchayath.findMany({
    include: { constituency: { select: { id: true, name: true } } },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, constituencyId } = await request.json();
  if (!name || !constituencyId) return NextResponse.json({ error: 'Name and constituency are required.' }, { status: 400 });
  const item = await prisma.panchayath.create({ data: { name: name.trim(), constituencyId: Number(constituencyId) } });
  return NextResponse.json(item, { status: 201 });
}
