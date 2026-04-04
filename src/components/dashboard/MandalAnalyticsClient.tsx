'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, Badge } from './MandalDashboardClient'; // Reusing some base components if possible, or I'll define them here

const CustomCard = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) => (
  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
    <div className="mb-6">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
      {subtitle && <p className="text-sm font-bold text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function MandalAnalyticsClient({
  allCandidates,
  panchayathPerformance,
  candidateId
}: {
  allCandidates: any[];
  panchayathPerformance: any[];
  candidateId: number;
}) {
  const chartData = allCandidates.map(c => ({
    name: c.party,
    fullName: c.name,
    votes: c.votes,
    predicted: c.predicted,
    percentage: parseFloat(c.percentage)
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Candidate Vote Share (Polled) */}
        <CustomCard title="VOTE SHARE (POLLED)" subtitle="Distribution of currently recorded votes">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="votes"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{d.name}: {d.percentage}%</span>
              </div>
            ))}
          </div>
        </CustomCard>

        {/* Polled vs Predicted Comparison */}
        <CustomCard title="POLLED VS PREDICTED" subtitle="Comparing actual turnout against predicted support">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94A3B8' }} 
                />
                <Tooltip 
                   cursor={{ fill: '#F8FAFC' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="predicted" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Predicted" />
                <Bar dataKey="votes" fill="#10B981" radius={[4, 4, 0, 0]} name="Polled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CustomCard>
      </div>

      {/* Panchayath-wise Support Distribution (Our Candidate) */}
      <CustomCard title="PANCHAYATH SUPPORT DISTRIBUTION" subtitle="Predicted vs Polled performance for our candidate across all panchayaths">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={panchayathPerformance} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'black', fill: '#1E293B' }} 
                width={100}
              />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="predicted" fill="#BFDBFE" radius={[0, 4, 4, 0]} name="Predicted Support" />
              <Bar dataKey="polled" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Actual Polled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CustomCard>
    </div>
  );
}
