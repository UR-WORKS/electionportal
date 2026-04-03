import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { name, abbrev } = await request.json();
  try {
    const candidate = await prisma.candidate.update({
      where: { id: Number(id) },
      data: { name: name.trim(), abbrev: abbrev.trim().toUpperCase() },
    });
    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.candidate.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Cannot delete — candidate is in use.' }, { status: 409 });
  }
}
