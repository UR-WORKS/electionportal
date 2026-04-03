'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { ReportingButton } from './ReportingButton';

type BoothData = {
  id: number;
  number: number;
  name: string | null;
  predicted: number;
  polled: number;
  percentage: string;
};

export function PanchayathDashboardClient({
  totalPredicted,
  totalPolled,
  totalElectorate,
  panchayathName,
  candidateName,
  initialBooths,
}: {
  totalPredicted: number;
  totalPolled: number;
  totalElectorate: number;
  panchayathName: string;
  candidateName: string;
  initialBooths: BoothData[];
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooths = initialBooths.filter(w => {
    const term = searchTerm.toLowerCase();
    return w.number.toString().includes(term) || (w.name?.toLowerCase().includes(term));
  });

  const filteredPredicted = searchTerm ? filteredBooths.reduce((acc, w) => acc + w.predicted, 0) : totalPredicted;
  const filteredPolled = searchTerm ? filteredBooths.reduce((acc, w) => acc + w.polled, 0) : totalPolled;
  const pending = filteredPredicted - filteredPolled;
  const percentage = filteredPredicted > 0 ? ((filteredPolled / filteredPredicted) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: 'Total Predicted', value: filteredPredicted, icon: '📈', color: 'blue' },
    { label: 'Total Polled', value: filteredPolled, icon: '✅', color: 'emerald' },
    { label: 'Pending', value: pending, icon: '⏳', color: 'amber' },
    { label: 'Polling %', value: `${percentage}%`, icon: '📊', color: 'teal' },
  ];

  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    teal: 'text-teal-600 bg-teal-50',
  };

  const reportData = {
    title: `Election Performance Report - ${panchayathName} panchayath`,
    candidateName: candidateName,
    metrics: {
      totalElectorate: totalElectorate,
      totalPolled: filteredPolled,
      pending: pending,
      percentage: percentage
    },
    tableHeader: ['Booth Number/Name', 'Predicted', 'Polled', 'Percentage'] as [string, string, string, string],
    tableData: filteredBooths.map(w => ({
      name: `Booth ${w.number} ${w.name ? `(${w.name})` : ''}`,
      total: w.predicted,
      polled: w.polled,
      percentage: w.percentage
    }))
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">panchayath Dashboard</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Local Performance Summary for {candidateName}.</p>
        </div>
        <ReportingButton data={reportData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className={`text-2xl mb-6 p-3 rounded-2xl w-fit ${colorMap[stat.color]}`}>{stat.icon}</div>
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="xl:col-span-1">
          <PerformanceAnalytics
            polled={filteredPredicted}
            total={totalElectorate}
            label="Candidate vs Local Electorate"
          />
        </div>
      </div>

      <div className="pt-10 border-t border-gray-100 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Booth Performance</h2>
          <div className="relative w-full md:w-72 group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search Booths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-black uppercase text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBooths.map((w) => (
            <Link
              key={w.id}
              href={`/dashboard/panchayath/booth/${w.id}`}
              className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-emerald-600/20 shadow-sm transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Booth {w.number} {w.name && `· ${w.name}`}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{w.polled} / {w.predicted} Polled</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{w.percentage}%</span>
                </div>
              </div>
              <span className="text-2xl font-black text-gray-100 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all">→</span>
            </Link>
          ))}
          {filteredBooths.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No Matching Booths Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
