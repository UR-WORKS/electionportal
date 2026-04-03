import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const excludeId = searchParams.get('excludeId');

  if (!username) return NextResponse.json({ available: true });

  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: username },
      id: excludeId ? { not: Number(excludeId) } : undefined,
    },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
