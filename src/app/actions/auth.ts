'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { Role } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  const user = await prisma.user.findUnique({ where: { username }, include: { candidate: true, panchayath: true } });

  if (!user) {
    return { error: 'Invalid username or password.' };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { error: 'Invalid username or password.' };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  const destination =
    user.role === Role.BOOTH_ADMIN ? '/dashboard/booth'
      : user.role === Role.PANCHAYATH_ADMIN ? '/dashboard/panchayath'
        : user.role === Role.MANDAL_ADMIN ? '/dashboard/mandal'
          : '/admin';

  redirect(destination);
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
