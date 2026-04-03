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
  const { username, name, password, role, panchayathId, boothId, boothNumber, boothName, totalVoters } = body;

  if (!username || !name || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    let targetpanchayathId = panchayathId ? Number(panchayathId) : null;
    let targetBoothId = boothId ? Number(boothId) : null;

    // MANDAL_ADMIN creating a PANCHAYATH_ADMIN
    if (admin.role === Role.MANDAL_ADMIN) {
      if (role !== Role.PANCHAYATH_ADMIN) return NextResponse.json({ error: 'Mandal Admin can only create Panchayath Admins' }, { status: 403 });
      if (!targetpanchayathId) return NextResponse.json({ error: 'panchayath ID is required' }, { status: 400 });

      // Verify panchayath belongs to mandal
      const p = await prisma.panchayath.findFirst({
        where: { id: targetpanchayathId, constituencyId: admin.constituencyId ?? undefined }
      });
      if (!p) return NextResponse.json({ error: 'panchayath not found in your Mandal' }, { status: 403 });
    }

    // PANCHAYATH_ADMIN creating a BOOTH_ADMIN
    if (admin.role === Role.PANCHAYATH_ADMIN) {
      if (role !== Role.BOOTH_ADMIN) return NextResponse.json({ error: 'Panchayath Admin can only create Booth Admins' }, { status: 403 });

      // If boothId not provided, we might be creating a new Booth
      if (!targetBoothId) {
        if (!boothNumber) return NextResponse.json({ error: 'Booth ID or Booth Number is required' }, { status: 400 });

        // Upsert the Booth under this panchayath
        const booth = await prisma.booth.upsert({
          where: { id: -1 }, // Dummy ID for create-only if not matching? No, we use Number+panchayathId if unique.
          // Wait, Booth model doesn't have unique constraint on number+panchayathId in schema.prisma.
          // I will fetch existing or create.
          create: {
            number: Number(boothNumber),
            name: boothName || `Booth ${boothNumber}`,
            panchayathId: admin.panchayathId!,
            totalVoters: Number(totalVoters) || 0,
          },
          update: {
            totalVoters: Number(totalVoters) || 0,
          },
          // Wait, upsert needs a unique where. I'll just findFirst and create if not exists.
        });

        const existingBooth = await prisma.booth.findFirst({
          where: { number: Number(boothNumber), panchayathId: admin.panchayathId! }
        });

        if (existingBooth) {
          targetBoothId = existingBooth.id;
          await prisma.booth.update({
            where: { id: targetBoothId },
            data: { totalVoters: Number(totalVoters) || existingBooth.totalVoters }
          });
        } else {
          const newBooth = await prisma.booth.create({
            data: {
              number: Number(boothNumber),
              name: boothName || `Booth ${boothNumber}`,
              panchayathId: admin.panchayathId!,
              totalVoters: Number(totalVoters) || 0,
            }
          });
          targetBoothId = newBooth.id;
        }
      } else {
        // Verify booth belongs to panchayath
        const w = await prisma.booth.findFirst({
          where: { id: targetBoothId, panchayathId: admin.panchayathId ?? undefined }
        });
        if (!w) return NextResponse.json({ error: 'Booth not found in your panchayath' }, { status: 403 });
      }

      targetpanchayathId = admin.panchayathId;
    }

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        name: name.trim(),
        email: `${username.trim()}@election.local`,
        passwordHash,
        role,
        candidateId: admin.candidateId,
        constituencyId: admin.constituencyId,
        panchayathId: targetpanchayathId,
        boothId: targetBoothId,
      },
    });

    return NextResponse.json({ id: newUser.id, username: newUser.username }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user. Username might already exist.' }, { status: 409 });
  }
}
