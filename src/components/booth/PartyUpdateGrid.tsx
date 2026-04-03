'use client';

import { useState, useEffect } from 'react';
import { VoterMarkModal } from './VoterMarkModal';

type Candidate = { id: number; name: string; abbrev: string };
type VoterMark = { serialNumber: number; candidateId: number; hasVoted: boolean };

function useColumns() {
  const [cols, setCols] = useState(5);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 20 : w >= 1024 ? 15 : w >= 640 ? 10 : 5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

export function PartyUpdateGrid({
  boothId,
  totalVoters,
  initialMarks,
  candidates
}: {
  boothId: number;
  totalVoters: number;
  initialMarks: VoterMark[];
  candidates: Candidate[];
}) {
  const cols = useColumns();
  const [marks, setMarks] = useState<Record<number, number>>(
    initialMarks.reduce((acc, m) => ({ ...acc, [m.serialNumber]: m.candidateId }), {})
  );
  const [modalVoter, setModalVoter] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleSaveAffiliation = async (candidateId: number) => {
    if (!modalVoter) return;
    setSaving(true);
    try {
      const res = await fetch('/api/voters/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'AFFILIATE',
          serialNumber: modalVoter,
          boothId,
          targetCandidateId: Number(candidateId)
        }),
      });
      if (res.ok) {
        setMarks(prev => ({ ...prev, [modalVoter!]: Number(candidateId) }));
        showToast(`Voter #${modalVoter} mapped successfully.`);
        setModalVoter(null);
      } else showToast('Mapping failed.', 'error');
    } catch (e) {
      showToast('Connection error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Voters
  const filteredVoters = Array.from({ length: totalVoters }, (_, i) => i + 1)
    .filter(serial => serial.toString().includes(searchTerm));

  return (
    <div className="space-y-10 pb-16">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-500 border-2 ${
          toast.type === 'success' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-rose-600 border-rose-400 text-white'
        }`}>
          <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
            {toast.type === 'success' ? '✨' : '⚠️'} {toast.message}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Pre-Election Mapping</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Map your booth&apos;s political landscape by assigning predicted candidate affiliations.</p>
        </div>

        {/* Search Input Area */}
        <div className="max-w-md">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Search Voter Serial Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-6 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-[10px] uppercase font-black tracking-widest text-gray-400 px-4">
           <span className="flex items-center gap-3">
            <span className="inline-block h-5 w-5 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20 border-2 border-indigo-400" />
            Mapped
          </span>
          <span className="flex items-center gap-3">
            <span className="inline-block h-5 w-5 rounded-lg bg-white border-2 border-gray-300" />
            No Mapping
          </span>
        </div>
      </div>

      <div
        className="grid gap-2.5 p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {filteredVoters.map((serial) => {
          const candidateId = marks[serial];
          const candidate = candidates.find(c => c.id === candidateId);

          return (
            <button
              key={serial}
              onClick={() => setModalVoter(serial)}
              className={`
                relative aspect-square rounded-[1.25rem] text-[0.65rem] font-black
                transition-all duration-300 flex flex-col items-center justify-center
                active:scale-90 border-2
                ${candidateId
                  ? 'bg-white border-indigo-200 text-indigo-600 hover:border-indigo-400 shadow-xl shadow-indigo-600/5'
                  : 'bg-white border-gray-300 text-slate-700 font-semibold hover:bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              #{serial}
              {candidate && (
                <span className="mt-1 leading-none text-[0.6rem] uppercase tracking-widest text-gray-900">
                  {candidate.abbrev}
                </span>
              )}
            </button>
          );
        })}
        {filteredVoters.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Results for &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>

      {modalVoter && (
        <VoterMarkModal
          serialNumber={modalVoter}
          candidates={candidates}
          initialCandidateId={marks[modalVoter]}
          onSave={handleSaveAffiliation}
          onCancel={() => setModalVoter(null)}
          isSaving={saving}
          title={`Map Voter #${modalVoter}`}
          saveLabel="Save Mapping"
        />
      )}
    </div>
  );
}
