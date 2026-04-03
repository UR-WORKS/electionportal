import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const candidates = await prisma.candidate.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(candidates);
}

export async function POST(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, abbrev } = await request.json();
  if (!name || !abbrev) return NextResponse.json({ error: 'Name and abbreviation are required.' }, { status: 400 });
  try {
    const candidate = await prisma.candidate.create({ data: { name: name.trim(), abbrev: abbrev.trim().toUpperCase() } });
    return NextResponse.json(candidate, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Name or abbreviation already exists.' }, { status: 409 });
  }
}
