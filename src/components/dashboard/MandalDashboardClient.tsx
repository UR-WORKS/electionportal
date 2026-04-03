'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { ReportingButton } from './ReportingButton';

type panchayathData = {
  id: number;
  name: string;
  predicted: number;
  polled: number;
  percentage: string;
};

export function MandalDashboardClient({
  totalPredicted,
  totalPolled,
  totalElectorate,
  mandalName,
  candidateName,
  initialpanchayaths,
  trends,
}: {
  totalPredicted: number;
  totalPolled: number;
  totalElectorate: number;
  mandalName: string;
  candidateName: string;
  initialpanchayaths: panchayathData[];
  trends: { predicted: string; polled: string; pending: string };
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredpanchayaths = initialpanchayaths.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPredicted = searchTerm ? filteredpanchayaths.reduce((acc, p) => acc + p.predicted, 0) : totalPredicted;
  const filteredPolled = searchTerm ? filteredpanchayaths.reduce((acc, p) => acc + p.polled, 0) : totalPolled;
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
    title: `Election Performance Report - ${mandalName}`,
    candidateName: candidateName,
    metrics: {
      totalElectorate: totalElectorate,
      totalPolled: filteredPolled,
      pending: pending,
      percentage: percentage
    },
    tableHeader: ['panchayath Name', 'Predicted', 'Polled', 'Percentage'] as [string, string, string, string],
    tableData: filteredpanchayaths.map(p => ({
      name: p.name,
      total: p.predicted,
      polled: p.polled,
      percentage: p.percentage
    }))
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#0B1229] tracking-tight uppercase">Mandalam Dashboard</h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Aggregated Regional Performance for {candidateName}.</p>
        </div>
        <div className="flex items-center gap-4">
          <ReportingButton data={reportData} />
        </div>
      </div>

      {/* Stats and Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Predicted Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-[#0B1229]/5 flex items-center justify-center text-[#0B1229]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Predicted</p>
              <h3 className="text-4xl font-black text-[#0B1229] tracking-tighter">{filteredPredicted.toLocaleString()}</h3>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${Number(trends.predicted) >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {Number(trends.predicted) >= 0 ? '+' : ''}{trends.predicted}% from last hour
              </span>
            </div>
          </div>

          {/* Total Polled Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-[#0B1229]/5 flex items-center justify-center text-[#0B1229]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Polled</p>
              <h3 className="text-4xl font-black text-[#0B1229] tracking-tighter">{filteredPolled.toLocaleString()}</h3>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${Number(trends.polled) >= 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {Number(trends.polled) >= 0 ? '+' : ''}{trends.polled}% from last hour
              </span>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-[#0B1229]/5 flex items-center justify-center text-[#0B1229]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</p>
              <h3 className="text-4xl font-black text-[#0B1229] tracking-tighter">{pending.toLocaleString()}</h3>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${Number(trends.pending) <= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {Number(trends.pending) > 0 ? '+' : ''}{trends.pending}% from last hour
              </span>
            </div>
          </div>

          {/* Polling % Card - Highlighted */}
          <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/5 flex flex-col justify-between min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Polling %</p>
              <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{percentage}%</h3>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${Number(trends.polled) >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {Number(trends.polled) >= 0 ? '+' : ''}{trends.polled}% from last hour
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <PerformanceAnalytics
            polled={filteredPredicted}
            total={totalElectorate}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">panchayath Performance</h2>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search panchayaths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-[#0B1229] placeholder-gray-400 focus:ring-2 focus:ring-[#0B1229]/5 focus:border-[#0B1229] outline-none transition-all"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">panchayath Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Voters</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Polled</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-64">Polling %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredpanchayaths.map((p) => {
                const pPending = p.predicted - p.polled;
                const pPercentage = parseFloat(p.percentage);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/mandal/panchayath/${p.id}`}>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-[#0B1229] uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{p.name}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">{p.predicted.toLocaleString()}</td>
                    <td className="px-8 py-6 text-sm font-bold text-[#0B1229]">{p.polled.toLocaleString()}</td>
                    <td className="px-8 py-6 text-sm font-bold text-red-500">{pPending.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[#0B1229] w-10">{p.percentage}%</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredpanchayaths.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No matching panchayaths found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
