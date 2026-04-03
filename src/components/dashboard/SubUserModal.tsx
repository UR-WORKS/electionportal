'use client';

import { useState, useEffect } from 'react';

type Props = {
  role: 'PANCHAYATH_ADMIN' | 'BOOTH_ADMIN';
  panchayathId?: number;
  panchayaths?: { id: number; name: string }[];
  booths?: { id: number; number: number; name: string | null }[];
  initialUser?: { id: number; name: string; username: string };
  boothId?: number;
  onSuccess: () => void;
  onCancel: () => void;
};

export function SubUserModal({ role, panchayathId, panchayaths, booths, initialUser, boothId, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialUser;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    try {
      const endpoint = isEdit ? '/api/dashboard/subusers/update' : '/api/dashboard/subusers/create';
      const body = isEdit ? { ...data, id: initialUser.id } : { ...data, role, boothId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        setError(err.error || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (e) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight tracking-tight uppercase">
          {isEdit ? 'Update' : 'Create'} {role === 'PANCHAYATH_ADMIN' ? 'panchayath' : 'Booth'} Admin
        </h3>
        <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed uppercase opacity-60 tracking-wider font-mono">
          {isEdit ? 'Modify administrative details for this account.' : 'Assign administrative control and inherit candidate records.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
              <input
                name="name"
                required
                defaultValue={initialUser?.name || ''}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                placeholder="Enter name" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username (Login ID)</label>
              <input 
                name="username" 
                required 
                disabled={isEdit}
                defaultValue={initialUser?.username || ''}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono disabled:opacity-50" 
                placeholder="0001" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isEdit ? 'New Password (Optional)' : 'Initial Password'}</label>
              <input 
                name="password" 
                type="password" 
                required={!isEdit} 
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {!isEdit && role === 'PANCHAYATH_ADMIN' && panchayaths && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Assigned panchayath</label>
                <select name="panchayathId" required className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                  {panchayaths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            {!isEdit && role === 'BOOTH_ADMIN' && !boothId && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Booth Number</label>
                  <input name="boothNumber" type="number" required className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono" placeholder="1" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Total Voters</label>
                  <input name="totalVoters" type="number" required className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-sm font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono" placeholder="1200" />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-center text-[10px] font-black text-rose-600 uppercase tracking-widest px-2 animate-pulse">{error}</p>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-[2rem] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 shadow-xl shadow-emerald-600/20 transition-all font-black uppercase text-sm active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? 'Processing...' : `${isEdit ? 'Update' : 'Create'} Account`}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Cancel Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
