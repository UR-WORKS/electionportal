import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import * as XLSX from 'xlsx';

export async function GET() {
  const s = await requireAdmin();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Fetch all panchayath for reference
    const panchayath = await prisma.panchayath.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });

    // Create workbook and main sheet
    const wb = XLSX.utils.book_new();

    // Booths Sheet (Empty with headers)
    const boothsData = [
      ['panchayath', 'Number', 'Name', 'Total Voters'],
      [panchayath[0]?.name || 'Example panchayath', '1', 'Primary School Booth', '850']
    ];
    const wsBooths = XLSX.utils.aoa_to_sheet(boothsData);
    XLSX.utils.book_append_sheet(wb, wsBooths, 'Booths');

    // Reference Sheet with panchayath Names
    const panchayathList = [['Valid panchayath Names']];
    panchayath.forEach(p => panchayathList.push([p.name]));
    const wsRef = XLSX.utils.aoa_to_sheet(panchayathList);
    XLSX.utils.book_append_sheet(wb, wsRef, 'panchayath Reference');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="booth_import_template.xlsx"'
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
