'use client';

import { useState, useEffect } from 'react';

type VoterMark = { serialNumber: number; candidateId: number; candidateAbbrev: string; hasVoted: boolean };

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

export function ReadOnlyVoterGrid({
  totalVoters,
  marks
}: {
  totalVoters: number;
  marks: Record<number, { candidateAbbrev: string; voted: boolean }>;
}) {
  const cols = useColumns();

  return (
    <div className="space-y-10 pb-16 pointer-events-none select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-8 text-[10px] uppercase font-black tracking-widest text-gray-400 px-4">
        <span className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 rounded-lg bg-emerald-600 shadow-lg shadow-emerald-500/20 border-2 border-emerald-400" />
          Polled
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 rounded-lg bg-white border-2 border-indigo-200" />
          Mapped
        </span>
        <span className="flex items-center gap-3 italic">(Read-Only Performance View)</span>
      </div>

      <div
        className="grid gap-2.5 p-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalVoters }, (_, i) => i + 1).map((serial) => {
          const m = marks[serial];
          const isMapped = !!m;
          const hasVoted = m?.voted;

          return (
            <div
              key={serial}
              className={`
                relative aspect-square rounded-[1.25rem] text-[0.6rem] font-black
                transition-all duration-300 flex flex-col items-center justify-center
                border-2 gap-0.5
                ${hasVoted
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/10'
                  : isMapped
                  ? 'bg-white border-indigo-200 text-indigo-600 shadow-xl shadow-indigo-600/5'
                  : 'bg-white border-gray-100 text-slate-300 font-semibold shadow-sm overflow-hidden'
                }
              `}
            >
              <span className={hasVoted ? 'text-white' : isMapped ? 'text-indigo-600' : 'text-slate-300'}>
                {serial}
              </span>
              {isMapped && (
                <span className={`text-[8px] font-black uppercase tracking-tighter ${hasVoted ? 'text-emerald-100/70' : 'text-indigo-400'}`}>
                   {m.candidateAbbrev}
                </span>
              )}
              {isMapped && !hasVoted && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
