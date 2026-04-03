import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { Role } from '@/generated/prisma/client';

export async function POST(request: Request) {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    if (rows.length === 0) return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });

    console.log(`[Bulk Import] Starting processing of ${rows.length} rows`);

    // 1. Pre-fetch all reference data for mapping
    const [candidates, constituencies, panchayaths, booths] = await Promise.all([
      prisma.candidate.findMany({ select: { id: true, name: true } }),
      prisma.constituency.findMany({ select: { id: true, name: true } }),
      prisma.panchayath.findMany({ select: { id: true, name: true, constituencyId: true } }),
      prisma.booth.findMany({ select: { id: true, number: true, panchayathId: true, panchayath: { select: { constituencyId: true } } } })
    ]);

    const candidateMap = new Map(candidates.map(c => [c.name.toLowerCase().trim(), c.id]));
    const constituencyMap = new Map(constituencies.map(c => [c.name.toLowerCase().trim(), c.id]));
    const panchayathMap = new Map(panchayaths.map(p => [p.name.toLowerCase().trim(), p.id]));
    const boothMapByPanchayath = new Map<number, Map<number, { id: number; panchayathId: number; constituencyId: number }>>();
    booths.forEach(w => {
      if (!boothMapByPanchayath.has(w.panchayathId)) {
        boothMapByPanchayath.set(w.panchayathId, new Map());
      }
      boothMapByPanchayath.get(w.panchayathId)?.set(w.number, { 
        id: w.id, 
        panchayathId: w.panchayathId, 
        constituencyId: w.panchayath.constituencyId 
      });
    });

    const validRoles = Object.values(Role);
    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // 2. Process rows
    for (const [index, row] of rows.entries()) {
      const username = String(row['Username'] || '').trim();
      const name = String(row['Full Name'] || '').trim();
      const password = String(row['Password'] || 'admin@123').trim();
      const roleStr = String(row['Role'] || '').toUpperCase().trim();
      const candidateName = String(row['Candidate Name'] || row['Candidate'] || '').toLowerCase().trim();
      const constituencyName = String(row['Constituency Name'] || row['Constituency'] || '').toLowerCase().trim();
      const panchayathName = String(row['Panchayath Name'] || row['Panchayath'] || '').toLowerCase().trim();
      const boothNumberStr = String(row['Booth Number'] || row['Booth'] || '').trim();
      const boothNumber = parseInt(boothNumberStr);

      if (!username || !name || !roleStr) {
        errors.push(`Row ${index + 2}: Username, Full Name, and Role are required.`);
        skippedCount++;
        continue;
      }

      // Check role
      if (!validRoles.includes(roleStr as Role)) {
        errors.push(`Row ${index + 2}: Invalid Role "${roleStr}".`);
        skippedCount++;
        continue;
      }

      // Candidate mapping
      const candidateId = candidateName ? candidateMap.get(candidateName) : null;
      if (candidateName && !candidateId) {
        errors.push(`Row ${index + 2}: Candidate "${candidateName}" not found.`);
      }
      
      // Constituency mapping
      const constituencyId = constituencyName ? constituencyMap.get(constituencyName) : null;
      if (constituencyName && !constituencyId) {
        errors.push(`Row ${index + 2}: Constituency "${constituencyName}" not found.`);
      }

      // Panchayath mapping
      const panchayathId = panchayathName ? panchayathMap.get(panchayathName) : null;
      if (panchayathName && !panchayathId) {
        errors.push(`Row ${index + 2}: Panchayath "${panchayathName}" not found.`);
      }

      // Booth mapping
      let boothId = null;
      let inferredPanchayathId = panchayathId;
      let inferredConstituencyId = constituencyId;

      // Handle fallback for updates if Excel is missing location columns
      try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        
        // If Excel is missing Panchayath but user already has one, use it for booth lookup
        if (!inferredPanchayathId && existingUser?.panchayathId) {
          inferredPanchayathId = existingUser.panchayathId;
        }
        if (!inferredConstituencyId && existingUser?.constituencyId) {
          inferredConstituencyId = existingUser.constituencyId;
        }

        if (!isNaN(boothNumber) && inferredPanchayathId) {
          const boothRef = boothMapByPanchayath.get(inferredPanchayathId)?.get(boothNumber);
          if (boothRef) {
            boothId = boothRef.id;
            inferredPanchayathId = boothRef.panchayathId;
            inferredConstituencyId = boothRef.constituencyId;
          } else if (boothNumberStr) {
            errors.push(`Row ${index + 2}: Booth #${boothNumber} not found in Panchayath ID ${inferredPanchayathId}.`);
          }
        } else if (existingUser?.boothId && !boothNumberStr) {
          // If no booth number in Excel, but user already has one, keep it
          boothId = existingUser.boothId;
        }

        const userData: any = {
          name,
          email: `${username}@election.local`,
          role: roleStr as Role,
          candidateId: candidateId || (existingUser?.candidateId ?? null),
          constituencyId: inferredConstituencyId,
          panchayathId: inferredPanchayathId,
          boothId
        };

        // Only hash and update password if provided
        const passwordValue = String(row['Password'] || '').trim();
        if (passwordValue) {
          userData.passwordHash = await bcrypt.hash(passwordValue, 10);
        } else if (!existingUser) {
          // Default password for new users if none provided
          userData.passwordHash = await bcrypt.hash('admin@123', 10);
        }

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: userData
          });
        } else {
          await prisma.user.create({
            data: {
              username,
              ...userData
            }
          });
        }
        createdCount++;
        if (createdCount % 10 === 0) console.log(`[Bulk Import] Processed ${createdCount} rows...`);
      } catch (err: any) {
        console.error('Row execution error:', err);
        errors.push(`Row ${index + 2}: Failed to process user (${err.message}).`);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      createdCount,
      skippedCount,
      errors: errors.slice(0, 10), // Limit to 10 for UI
      totalErrors: errors.length
    });

  } catch (error: any) {
    console.error('Bulk User Import Error:', error);
    return NextResponse.json({ error: 'Failed to process user Excel file.' }, { status: 500 });
  }
}
