import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { name, constituencyId } = await req.json();
  try {
    const item = await prisma.panchayath.update({
      where: { id: Number(id) },
      data: { name: name.trim(), constituencyId: Number(constituencyId) },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Update failed.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.panchayath.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Cannot delete — in use.' }, { status: 409 });
  }
}
