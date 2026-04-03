import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { username, name, password, role, candidateId, constituencyId, panchayathId, boothId } = await req.json();
  const updateData: Record<string, unknown> = {
    username: username.trim(),
    email: `${username.trim()}@election.local`,
    name: name.trim(),
    role,
    candidateId: candidateId ? Number(candidateId) : null,
    constituencyId: constituencyId ? Number(constituencyId) : null,
    panchayathId: panchayathId ? Number(panchayathId) : null,
    boothId: boothId ? Number(boothId) : null
  };
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.update({ where: { id: Number(id) }, data: updateData });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, ...safe } = user;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: 'Username already exists or update failed.' }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Cannot delete user.' }, { status: 409 });
  }
}
