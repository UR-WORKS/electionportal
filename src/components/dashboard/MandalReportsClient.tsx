'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';
import { Search, Download, FileText, ChevronRight } from 'lucide-react';

export default function MandalReportsClient({
  panchayathData,
  mandalName,
  candidateName,
  candidateAbbrev
}: {
  panchayathData: any[];
  mandalName: string;
  candidateName: string;
  candidateAbbrev: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = panchayathData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Panchayath Name", "Total Voters", "Predicted", "Polled", "Percentage"];
    const tableRows: any[] = [];

    filteredData.forEach(p => {
      const rowData = [
        p.name,
        p.totalVoters.toLocaleString(),
        p.predicted.toLocaleString(),
        p.polled.toLocaleString(),
        p.percentage + "%"
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(18);
    doc.text(`Election Report: ${mandalName}`, 14, 15);
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
        headStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' }
      });

      doc.save(`Election_Report_${mandalName}_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search by panchayath or admin..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
        </div>

        <button 
          onClick={downloadPDF}
          className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/10 font-bold text-sm"
        >
          <Download size={18} />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Panchayath Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Electorate</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Predicted Support</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actual Polled</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Yield %</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((p) => (
                <tr key={p.id} className="group hover:bg-emerald-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 uppercase group-hover:text-emerald-700 transition-colors tracking-tight">{p.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Admin: {p.adminName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-gray-900">{p.totalVoters.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-gray-900">{p.predicted.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-emerald-600 font-tabular-nums">{p.polled.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <span className={`text-sm font-black ${parseFloat(p.percentage) > 50 ? 'text-emerald-600' : 'text-blue-600'}`}>{p.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/dashboard/mandal/panchayath/${p.id}`}
                      className="inline-flex p-2 rounded-xl text-gray-300 hover:text-emerald-600 hover:bg-emerald-100/50 transition-all"
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
            <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-[10px]">No records found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
