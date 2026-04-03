'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportData = {
  title: string;
  candidateName: string;
  metrics: {
    totalElectorate: number;
    totalPolled: number;
    pending: number;
    percentage: string;
  };
  tableData: {
    name: string;
    total: number;
    polled: number;
    percentage: string;
  }[];
  tableHeader: [string, string, string, string];
};

export function ReportingButton({ data }: { data: ReportData }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.text(data.title, 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-400
      doc.text(`Report Generated At: ${timestamp}`, 14, 30);
      doc.text(`Candidate: ${data.candidateName}`, 14, 36);

      // Summary Metrics Cards (Drawn as a table for layout)
      autoTable(doc, {
        startY: 45,
        head: [['Electorate', 'Total Polled', 'Pending', 'Percentage']],
        body: [[
          data.metrics.totalElectorate.toLocaleString(),
          data.metrics.totalPolled.toLocaleString(),
          data.metrics.pending.toLocaleString(),
          `${data.metrics.percentage}%`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // Emerald-600
        styles: { fontSize: 12, halign: 'center', cellPadding: 8 }
      });

      // Data Table
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81); // Gray-700
      doc.text('Breakdown Analysis', 14, (doc as any).lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [data.tableHeader],
        body: data.tableData.map(row => [
          row.name, 
          row.total.toLocaleString(), 
          row.polled.toLocaleString(), 
          `${row.percentage}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [55, 65, 81], textColor: 255 }, // Gray-700
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
      });

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`ElectionPortal.io - Secure Performance Reporting - Page ${i} of ${pageCount}`, 14, 285);
      }

      doc.save(`${data.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95 disabled:opacity-50"
    >
      <span className="text-xl">📊</span>
      <span className="text-xs font-black uppercase tracking-widest">{generating ? 'Generating...' : 'Download Report'}</span>
    </button>
  );
}
