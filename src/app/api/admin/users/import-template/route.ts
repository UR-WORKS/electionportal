import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import * as XLSX from 'xlsx';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch reference data and current users
    const [candidates, constituencies, panchayaths, booths, existingUsers] = await Promise.all([
      prisma.candidate.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
      prisma.constituency.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
      prisma.panchayath.findMany({ select: { name: true, constituency: { select: { name: true } } }, orderBy: { name: 'asc' } }),
      prisma.booth.findMany({ select: { number: true, name: true, panchayath: { select: { name: true } } }, orderBy: [{ panchayathId: 'asc' }, { number: 'asc' }] }),
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          candidate: { select: { name: true } },
          constituency: { select: { name: true } },
          panchayath: { select: { name: true } },
          booth: { 
            select: { 
              number: true,
              panchayath: {
                select: {
                  name: true,
                  constituency: { select: { name: true } }
                }
              }
            } 
          }
        },
        orderBy: { id: 'asc' }
      })
    ]);

    // 2. Create workbook
    const wb = XLSX.utils.book_new();

    // -- Users Sheet (Template + Current Data) --
    const headers = [
      'Username',
      'Full Name',
      'Password',
      'Role',
      'Candidate Name',
      'Constituency Name',
      'Panchayath Name',
      'Booth Number'
    ];
    
    // Map existing users to rows
    const dataRows = existingUsers.map(u => {
      // Fallback: If direct links are missing, use the booth's hierarchy
      const panchayathName = u.panchayath?.name || u.booth?.panchayath?.name || '';
      const constituencyName = u.constituency?.name || u.booth?.panchayath?.constituency?.name || '';

      return [
        u.username,
        u.name,
        '', // Password left empty for existing users
        u.role,
        u.candidate?.name || '',
        constituencyName,
        panchayathName,
        u.booth?.number || ''
      ];
    });

    // Add one example empty row at the bottom if no users exist
    if (dataRows.length === 0) {
      dataRows.push(['admin_example', 'Example Name', 'password123', 'PANCHAYATH_ADMIN', candidates[0]?.name || '', constituencies[0]?.name || '', panchayaths[0]?.name || '', '']);
    }

    const wsUsers = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Users Import');

    // -- Reference Sheet: Roles --
    const rolesData = [
      ['Valid Role Names'],
      ['MANDAL_ADMIN'],
      ['PANCHAYATH_ADMIN'],
      ['BOOTH_ADMIN']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rolesData), 'Role Reference');

    // -- Reference Sheet: Candidates --
    const candidateData = [['Candidate Name']];
    candidates.forEach(c => candidateData.push([c.name]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(candidateData), 'Candidate Reference');

    // -- Reference Sheet: Locations --
    const locationData = [['Constituency Name', 'Panchayath Name']];
    panchayaths.forEach(p => locationData.push([p.constituency.name, p.name]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(locationData), 'Region Reference');

    // -- Reference Sheet: Booths --
    const boothData = [['Panchayath Name', 'Booth Number', 'Booth Name']];
    booths.forEach(w => boothData.push([w.panchayath.name, String(w.number), w.name || '']));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(boothData), 'Booth Reference');

    // 3. Generate and return buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="users_import_template.xlsx"'
      }
    });

  } catch (error) {
    console.error('User template generation error:', error);
    return NextResponse.json({ error: 'Failed to generate user template' }, { status: 500 });
  }
}
