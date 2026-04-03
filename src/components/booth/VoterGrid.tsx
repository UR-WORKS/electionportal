'use client';

import { useState, useEffect, useCallback } from 'react';
import { logout } from '@/app/actions/auth';

/* ─── Responsive column count ──────────────────────────────────────────────── */
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

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Props = {
  boothId: number;
  boothNumber: number;
  boothName: string | null;
  totalVoters: number;
  candidateName: string;
  candidateAbbrev: string;
  panchayathName: string;
  userName: string;
  initialMarked: number[];
};

/* ─── Component ─────────────────────────────────────────────────────────────── */
export function VoterGrid({
  boothId,
  boothNumber,
  boothName,
  totalVoters,
  candidateName,
  candidateAbbrev,
  panchayathName,
  userName,
  initialMarked,
}: Props) {
  const cols = useColumns();
  const [marked, setMarked] = useState<Set<number>>(new Set(initialMarked));
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(
    async (serial: number) => {
      if (pending.has(serial)) return; // already in flight

      const wasMarked = marked.has(serial);

      // Optimistic update
      setMarked((prev) => {
        const next = new Set(prev);
        wasMarked ? next.delete(serial) : next.add(serial);
        return next;
      });
      setPending((prev) => new Set(prev).add(serial));

      try {
        const res = await fetch('/api/voters/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serialNumber: serial, boothId }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? 'Failed to update mark');
          // Revert
          setMarked((prev) => {
            const next = new Set(prev);
            wasMarked ? next.add(serial) : next.delete(serial);
            return next;
          });
        } else {
          setError(null);
        }
      } catch {
        setError('Network error — please retry.');
        setMarked((prev) => {
          const next = new Set(prev);
          wasMarked ? next.add(serial) : next.delete(serial);
          return next;
        });
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(serial);
          return next;
        });
      }
    },
    [marked, pending, boothId]
  );

  const markedCount = marked.size;
  const pct = totalVoters > 0 ? Math.round((markedCount / totalVoters) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── Top header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {candidateAbbrev.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Booth {boothNumber}{boothName ? ` · ${boothName}` : ''} — <span className="text-indigo-400">{candidateName}</span>
              </p>
              <p className="text-xs text-slate-500 truncate">{panchayathName} · {userName}</p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </form>
        </div>

        {/* Progress bar + stats */}
        <div className="max-w-screen-2xl mx-auto px-4 pb-3 flex items-center gap-4">
          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
            <span className="text-emerald-400 font-semibold">{markedCount}</span>
            {' / '}{totalVoters}
            <span className="text-slate-600"> ({pct}%)</span>
          </span>
        </div>
      </header>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-3">✕</button>
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
          Marked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-800 border border-slate-700" />
          Not marked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-500/20 border border-amber-500/50 animate-pulse" />
          Updating…
        </span>
      </div>

      {/* ── Voter grid ───────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 pb-8">
        {totalVoters === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <span className="text-4xl mb-3">📋</span>
            <p>This booth has no voters configured yet.</p>
            <p className="text-sm mt-1">Set Total Voters in the admin panel.</p>
          </div>
        ) : (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: totalVoters }, (_, i) => i + 1).map((serial) => {
              const isMarked = marked.has(serial);
              const isPending = pending.has(serial);
              return (
                <button
                  key={serial}
                  onClick={() => toggle(serial)}
                  disabled={isPending}
                  title={`Voter #${serial}${isMarked ? ' — marked' : ''}`}
                  className={`
                      relative aspect-square rounded-md text-xs font-mono font-medium
                      transition-all duration-150 select-none
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-950
                      ${isPending
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 cursor-wait animate-pulse'
                      : isMarked
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 active:scale-95'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 active:scale-95'
                    }
                    `}
                >
                  {serial}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
