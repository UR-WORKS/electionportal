import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await prisma.constituency.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  try {
    const item = await prisma.constituency.create({ data: { name: name.trim() } });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Constituency already exists.' }, { status: 409 });
  }
}
