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

export function ElectionCountingGrid({
  boothId,
  totalVoters,
  initialMarks,
  adminCandidateId,
  candidates
}: {
  boothId: number;
  totalVoters: number;
  initialMarks: VoterMark[];
  adminCandidateId: number;
  candidates: Candidate[];
}) {
  const cols = useColumns();
  const [marks, setMarks] = useState<Record<number, { candidateId: number; voted: boolean }>>(
    initialMarks.reduce((acc, m) => ({ ...acc, [m.serialNumber]: { candidateId: m.candidateId, voted: m.hasVoted } }), {})
  );
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [modalVoter, setModalVoter] = useState<number | null>(null);
  const [unpollVoter, setUnpollVoter] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [fastEntry, setFastEntry] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleFastEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(fastEntry);
    if (isNaN(num) || num < 1 || num > totalVoters) {
      showToast('Invalid Serial Number', 'error');
      return;
    }
    handleClickVoter(num);
    setFastEntry('');
  };

  const handleClickVoter = (serial: number) => {
    const m = marks[serial];
    if (m) {
      if (!m.voted) {
        // Case B: Mapped & Not Polled -> Instant toggle to true
        toggleVote(serial);
      } else {
        // Case C: Mapped & Already Polled -> Confirmation for Unpoll
        setUnpollVoter(serial);
      }
    } else {
      // Case A: Unmapped -> Trigger Modal
      setModalVoter(serial);
    }
  };

  const toggleVote = async (serial: number) => {
    if (pending.has(serial)) return;
    const current = marks[serial];
    if (!current) return;

    const nextVotedState = !current.voted;

    setMarks(prev => ({
      ...prev,
      [serial]: { ...current, voted: nextVotedState }
    }));
    setPending(prev => {
      const next = new Set(prev);
      next.add(serial);
      return next;
    });

    try {
      const res = await fetch('/api/voters/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'POLL', serialNumber: serial, boothId }),
      });
      if (res.ok) {
        showToast(nextVotedState ? `Voter ${serial} marked polled.` : `Voter ${serial} unmarked.`);
      } else {
        setMarks(prev => ({ ...prev, [serial]: current }));
        showToast('Operation failed.', 'error');
      }
    } catch (e) {
      setMarks(prev => ({ ...prev, [serial]: current }));
      showToast('Connection error.', 'error');
    } finally {
      setPending(prev => {
        const next = new Set(prev);
        next.delete(serial);
        return next;
      });
    }
  };

  const handleMapAndVote = async (candidateId: number) => {
    if (!modalVoter) return;
    setSaving(true);
    try {
      const res = await fetch('/api/voters/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MAP_AND_POLL',
          serialNumber: modalVoter,
          boothId,
          targetCandidateId: candidateId
        }),
      });
      if (res.ok) {
        setMarks(prev => ({ ...prev, [modalVoter]: { candidateId, voted: true } }));
        showToast(`Voter ${modalVoter} mapped & marked polled.`);
        setModalVoter(null);
      } else showToast('Mapping failed.', 'error');
    } catch (e) {
      showToast('Connection error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-500 border-2 ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'
          }`}>
          <div className="flex items-center gap-3 font-black uppercase text-xs tracking-widest">
            {toast.type === 'success' ? '⚡' : '⚠️'} {toast.message}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Unpoll */}
      {unpollVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-10 shadow-2xl animate-in zoom-in duration-300 transform-gpu transition-all">
            <div className="text-4xl mb-6 text-emerald-600 animate-bounce">🤔</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight uppercase tracking-tight">Unmark Vote?</h3>
            <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed">
              Voter {unpollVoter} is already marked as polled. Are you sure you want to unmark this vote?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { toggleVote(unpollVoter); setUnpollVoter(null); }}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all font-black uppercase text-base active:scale-95"
              >
                Yes, Unmark
              </button>
              <button
                onClick={() => setUnpollVoter(null)}
                className="w-full py-4 rounded-2xl bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all font-black uppercase text-base"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Fast Polling Entry</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Type a serial number and hit submit for instant turnout recording.</p>
          </div>

          <form onSubmit={handleFastEntrySubmit} className="flex gap-3">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              max={totalVoters}
              placeholder=""
              value={fastEntry}
              onChange={(e) => setFastEntry(e.target.value)}
              className="flex-1 md:w-48 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-4 text-base font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-base shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8 text-[10px] uppercase font-black tracking-widest text-gray-400 px-4">
        <span className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 rounded-lg bg-emerald-600 shadow-lg shadow-emerald-500/20 border-2 border-emerald-400" />
          Polled
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 rounded-lg bg-white border-2 border-gray-300" />
          Mapped
        </span>
      </div>

      <div
        className="grid gap-2.5 p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalVoters }, (_, i) => i + 1).map((serial) => {
          const m = marks[serial];
          const isMapped = !!m;
          const hasVoted = m?.voted;
          const isPending = pending.has(serial);

          return (
            <button
              key={serial}
              disabled={isPending}
              onClick={() => handleClickVoter(serial)}
              className={`
                relative aspect-square rounded-[1.25rem] text-[0.65rem] font-black
                transition-all duration-300 flex items-center justify-center
                active:scale-90 border-2
                ${hasVoted
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/10'
                  : isMapped
                    ? 'bg-white border-indigo-200 text-indigo-600 hover:border-indigo-400 shadow-xl shadow-indigo-600/5'
                    : 'bg-white border-gray-300 text-slate-700 font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                }
                ${isPending ? 'opacity-30' : ''}
              `}
            >
              {serial}
              {isMapped && !hasVoted && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {modalVoter && (
        <VoterMarkModal
          serialNumber={modalVoter}
          candidates={candidates}
          initialCandidateId={adminCandidateId}
          onSave={handleMapAndVote}
          onCancel={() => setModalVoter(null)}
          isSaving={saving}
          title={`Map & Mark Polled ${modalVoter}`}
          saveLabel="Save & Mark Polled"
        />
      )}
    </div>
  );
}
