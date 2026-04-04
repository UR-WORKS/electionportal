'use client';

import { useState } from 'react';
import Link from 'next/link';

type panchayathData = {
  id: number;
  name: string;
  totalVoters: number;
  adminName: string;
  adminUsername: string;
  predicted: number;
  polled: number;
  percentage: string;
};

// --- Icons (Inline SVGs) ---
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

const Card = ({ children, title, action, className = "" }: { children: React.ReactNode, title?: string, action?: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 ${className}`}>
    {(title || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        {title && <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export function MandalDashboardClient({
  totalPredicted,
  totalPolled,
  totalElectorate,
  mandalName,
  candidateName,
  candidateId,
  initialpanchayaths,
  trends,
  allCandidates,
}: {
  totalPredicted: number;
  totalPolled: number;
  totalElectorate: number;
  mandalName: string;
  candidateName: string;
  candidateId: number;
  initialpanchayaths: panchayathData[];
  trends: { predicted: string; polled: string; pending: string };
  allCandidates: { id: number; name: string; party: string; votes: number; predicted: number; percentage: string; predictionPercentage: string }[];
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredpanchayaths = initialpanchayaths.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPredicted = searchTerm ? filteredpanchayaths.reduce((acc, p) => acc + p.predicted, 0) : totalPredicted;
  const filteredPolled = searchTerm ? filteredpanchayaths.reduce((acc, p) => acc + p.polled, 0) : totalPolled;
  const pending = filteredPredicted - filteredPolled;
  const percentage = filteredPredicted > 0 ? ((filteredPolled / filteredPredicted) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: 'TOTAL PREDICTED', value: filteredPredicted.toLocaleString(), icon: '📊', trend: trends.predicted },
    { label: 'TOTAL POLLED', value: filteredPolled.toLocaleString(), icon: '✅', trend: trends.polled },
    { label: 'PENDING', value: pending.toLocaleString(), icon: '⏳', trend: trends.pending },
    { label: 'POLLING %', value: `${percentage}%`, icon: '📈', color: 'emerald', border: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`${stat.border ? 'border-emerald-200 ring-4 ring-emerald-50' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <span className="text-3xl filter grayscale opacity-20">{stat.icon}</span>
              {stat.trend && (
                <Badge className={`${Number(stat.trend) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {Number(stat.trend) >= 0 ? '+' : ''}{stat.trend}% from last hour
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h4 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h4>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Performance - Polled Results */}
        <Card title="CANDIDATE PERFORMANCE">
          <div className="space-y-8">
            {allCandidates.sort((a, b) => b.votes - a.votes).map((c, i) => {
              const bgColors = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-slate-400'];
              const color = bgColors[i % bgColors.length];
              const isUs = c.id === candidateId;
              
              return (
                <div key={c.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        {c.name} {isUs && <Badge className="bg-emerald-50 text-emerald-600 ml-2">US</Badge>}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{c.party}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{c.votes.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{c.percentage}%</p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isUs ? 'bg-emerald-600' : color} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]`} 
                      style={{ width: `${c.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Predicted Affiliation Report */}
        <Card title="PREDICTED AFFILIATION REPORT">
          <div className="space-y-8">
            {allCandidates.sort((a, b) => b.predicted - a.predicted).map((cand, i) => {
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-slate-400'];
              const color = colors[i % colors.length];
              const isUs = cand.id === candidateId;
              
              return (
                <div key={cand.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        {cand.name} {isUs && <Badge className="bg-emerald-50 text-emerald-600 ml-2">US</Badge>}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{cand.party}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{cand.predicted.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{cand.predictionPercentage}%</p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isUs ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : color} transition-all duration-1000`} 
                      style={{ width: `${cand.predictionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PANCHAYATH PERFORMANCE</h2>
            <p className="text-xl font-black text-slate-900 tracking-tight uppercase">Panchayath-Level Breakdown</p>
          </div>

          <div className="relative group min-w-[280px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <IconSearch />
            </span>
            <input 
              type="text" 
              placeholder="Search panchayath..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredpanchayaths.map((p) => (
            <Link 
              key={p.id} 
              href={`/dashboard/mandal/panchayath/${p.id}`}
              className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase group-hover:text-emerald-600 transition-colors">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin: {p.adminName}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">@{p.adminUsername}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">ELECTORATE</p>
                    <p className="text-sm font-black text-slate-900">{p.totalVoters.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${p.percentage}%` }}></div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{p.polled.toLocaleString()} / {p.predicted.toLocaleString()} POLLED</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.25 w-1.25 bg-emerald-500 rounded-full"></span>
                  <span className="text-[11px] font-black text-emerald-600 tracking-tighter">{p.percentage}%</span>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredpanchayaths.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">No Matching Panchayaths Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
