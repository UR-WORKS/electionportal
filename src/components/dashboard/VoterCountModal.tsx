'use client';

import { useState } from 'react';

type Props = {
  boothId: number;
  onSuccess: () => void;
};

export function VoterCountModal({ boothId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voters, setVoters] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const count = parseInt(voters);
    if (isNaN(count) || count <= 0) {
      setError('Please enter a valid number of voters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/dashboard/booth/set-voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boothId, totalVoters: count }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to update voter count');
      }
    } catch (e) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />

        <div className="relative text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-4xl shadow-inner animate-bounce">📍</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-gray-900 leading-tight tracking-tight uppercase">
              Booth Initialization
            </h3>
            <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase opacity-80 tracking-widest px-4">
              Your booth's voter count hasn't been set. Please enter the total electorate for Booth {boothId}.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Total Voters in Booth</label>
              <input
                type="number"
                required
                value={voters}
                onChange={(e) => setVoters(e.target.value)}
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-8 py-6 text-2xl font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center"
                placeholder="0000"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 animate-pulse">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-20 rounded-[2rem] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 shadow-2xl shadow-emerald-600/20 transition-all font-black uppercase text-sm active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initializing...
                </span>
              ) : (
                <>
                  Save & Continue
                  <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase opacity-40">
            Note: This count can only be modified by a Super Admin after initialization.
          </p>
        </div>
      </div>
    </div>
  );
}
