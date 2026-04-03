import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import * as XLSX from 'xlsx';

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

    // Pre-fetch all panchayath for name-to-id mapping
    const panchayath = await prisma.panchayath.findMany({ select: { id: true, name: true } });
    const panchayathMap = new Map(panchayath.map(p => [p.name.toLowerCase().trim(), p.id]));

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process rows sequentially or in a transaction
    // Using a loop to handle potential per-row errors gracefully
    for (const [index, row] of rows.entries()) {
      const pName = String(row['panchayath'] || row['panchayath'] || '').toLowerCase().trim();
      const number = parseInt(row['Number'] || row['number'] || row['Booth Number'] || row['Table Number']);
      const name = row['Name'] || row['name'] || row['Booth Name'] || null;
      const totalVoters = parseInt(row['Total Voters'] || row['total_voters'] || row['Voters'] || '0');

      const panchayathId = panchayathMap.get(pName);

      if (!panchayathId) {
        errors.push(`Row ${index + 2}: panchayath "${pName}" not found.`);
        skippedCount++;
        continue;
      }

      if (isNaN(number)) {
        errors.push(`Row ${index + 2}: Invalid booth number.`);
        skippedCount++;
        continue;
      }

      try {
        await prisma.booth.create({
          data: {
            number,
            name: name ? String(name).trim() : null,
            totalVoters: isNaN(totalVoters) ? 0 : totalVoters,
            panchayathId
          }
        });
        createdCount++;
      } catch (err: any) {
        errors.push(`Row ${index + 2}: Failed to create booth (likely duplicate number).`);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      createdCount,
      skippedCount,
      errors: errors.slice(0, 10), // Limit errors to 10 for UI
      totalErrors: errors.length
    });

  } catch (error: any) {
    console.error('Bulk Import Error:', error);
    return NextResponse.json({ error: 'Failed to process Excel file.' }, { status: 500 });
  }
}
