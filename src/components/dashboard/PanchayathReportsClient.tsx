'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { Search, Download, FileText, ChevronRight } from 'lucide-react';

export default function PanchayathReportsClient({
  boothData,
  panchayathName,
  candidateName,
  candidateAbbrev
}: {
  boothData: any[];
  panchayathName: string;
  candidateName: string;
  candidateAbbrev: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = boothData.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.number.toString().includes(searchTerm) ||
    b.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Booth #", "Booth Name", "Admin", "Predicted", "Polled", "%"];
    const tableRows: any[] = [];

    filteredData.forEach(b => {
      const rowData = [
        b.number,
        b.name,
        b.adminName,
        b.predicted.toLocaleString(),
        b.polled.toLocaleString(),
        b.percentage + "%"
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(18);
    doc.text(`Panchayath Report: ${panchayathName}`, 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Candidate: ${candidateName} (${candidateAbbrev})`, 14, 22);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    try {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' } // Blue theme for panchayath reports
      });

      doc.save(`Report_${panchayathName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative group w-full max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search by booth name, number or admin..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>

        <button 
          onClick={downloadPDF}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10 font-bold text-sm"
        >
          <Download size={18} />
          <span>Export Booth Report</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booth Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Predicted</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Polled</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Yield %</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((b) => (
                <tr key={b.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        #{b.number}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                          Booth {b.number}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          Admin: {b.adminName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-gray-900">{b.predicted.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-blue-600 font-tabular-nums">{b.polled.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <span className={`text-sm font-black ${parseFloat(b.percentage) > 50 ? 'text-emerald-600' : 'text-blue-600'}`}>{b.percentage}%</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/dashboard/panchayath/booth/${b.id}`}
                      className="inline-flex p-2 rounded-xl text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 transition-all"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <FileText size={32} />
            </div>
            <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-[10px]">No booth records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
