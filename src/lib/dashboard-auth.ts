import { cookies } from 'next/headers';
import { decrypt, SessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Verifies the current session and ensures the user has one of the allowed roles.
 * Returns the user record with their administrative context (booth, panchayath, or constituency).
 */
export async function getDashboardUser(allowedRoles: Role[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('election_session')?.value;
  const session = token ? await decrypt(token) : null;

  if (!session || !allowedRoles.includes(session.role as Role)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      candidate: { select: { name: true, abbrev: true } },
      booth: { select: { number: true, name: true, totalVoters: true } },
      panchayath: { select: { name: true, constituency: { select: { name: true } } } },
      constituency: { select: { name: true } },
    },
  });

  return user;
}
