import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDashboardUser } from '@/lib/dashboard-auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const admin = await getDashboardUser([Role.MANDAL_ADMIN, Role.PANCHAYATH_ADMIN]);
  if (!admin || !admin.candidateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, password } = body;

  if (!id || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Authorization checks
    if (admin.role === Role.MANDAL_ADMIN) {
      // Mandal Admin can only edit Panchayath Admins in their constituency
      if (targetUser.role !== Role.PANCHAYATH_ADMIN || targetUser.constituencyId !== admin.constituencyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (admin.role === Role.PANCHAYATH_ADMIN) {
      // Panchayath Admin can only edit Booth Admins in their panchayath
      if (targetUser.role !== Role.BOOTH_ADMIN || targetUser.panchayathId !== admin.panchayathId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updateData: any = {
      name: name.trim(),
    };

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
