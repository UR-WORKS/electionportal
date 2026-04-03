'use client';

import { useState, useEffect } from 'react';
import { SubUserModal } from '@/components/dashboard/SubUserModal';

type Booth = {
  id: number;
  number: number;
  name: string | null;
  totalVoters: number;
  users: { id: number; username: string; name: string }[];
  _count: { users: number }
};

export default function ManageBoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);

  useEffect(() => {
    fetchBooths();
  }, []);

  const fetchBooths = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/panchayath/booths');
      if (res.ok) {
        const data = await res.json();
        setBooths(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdminModal = (booth: Booth) => {
    setSelectedBooth(booth);
    setShowModal(true);
  };

  const filtered = booths.filter(w =>
    w.number.toString().includes(searchTerm) ||
    (w.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Manage Booths</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Booth-level control and administrative assignments.</p>
        </div>
      </div>

      <div className="px-4 max-w-md">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Filter Booths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm shadow-gray-200/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-black text-gray-300 uppercase tracking-widest text-[10px] animate-pulse">Initializing Data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w) => {
            const hasAdmin = w.users.length > 0;
            const admin = w.users[0];
            return (
              <div key={w.id} className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-emerald-600/20 shadow-sm transition-all space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📍</div>
                  <span className={`text-[10px] font-black ${hasAdmin ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'} px-3 py-1 rounded-full uppercase tracking-widest`}>
                    {hasAdmin ? 'Admin Assigned' : 'No Admin'}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Booth {w.number}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{w.name || 'General'} · {w.totalVoters} Voters</p>
                  {hasAdmin && <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest pt-1 opacity-70">Admin: {admin.name} ({admin.username})</p>}
                </div>
                <button
                  onClick={() => openAdminModal(w)}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${
                    hasAdmin 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/10'
                  }`}
                >
                  {hasAdmin ? 'Edit Admin' : 'Add Admin'}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No Matching Booths Found</p>
            </div>
          )}
        </div>
      )}

      {showModal && selectedBooth && (
        <SubUserModal
          role="BOOTH_ADMIN"
          initialUser={selectedBooth.users[0]} // If it exists
          boothId={selectedBooth.id}
          onSuccess={() => { setShowModal(false); fetchBooths(); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
