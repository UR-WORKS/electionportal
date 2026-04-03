'use client';

import { useState } from 'react';

type Candidate = { id: number; name: string; abbrev: string };

type Props = {
  serialNumber: number;
  candidates: Candidate[];
  initialCandidateId?: number;
  title?: string;
  saveLabel?: string;
  onSave: (candidateId: number) => void;
  onCancel: () => void;
  isSaving?: boolean;
};

export function VoterMarkModal({
  serialNumber,
  candidates,
  initialCandidateId,
  title = `Map Voter #${serialNumber}`,
  saveLabel = 'Save Mapping',
  onSave,
  onCancel,
  isSaving = false,
}: Props) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(initialCandidateId || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight tracking-tight uppercase">{title}</h3>
        <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed">
          Assign a political affiliation to this voter. Selected candidate will be used for polling records.
        </p>

        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Candidate Selection</label>
            <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {candidates.map((c) => {
                const isSelected = selectedCandidate === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCandidate(c.id)}
                    className={`
                      relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300
                      ${isSelected 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95' 
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className={`text-base font-black tracking-widest uppercase ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {c.abbrev}
                    </span>
                    <span className={`text-[0.6rem] font-bold truncate w-full text-center mt-1 uppercase ${isSelected ? 'text-emerald-100/70' : 'text-gray-400'}`}>
                      {c.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-[10px] text-white/50 animate-pulse">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => selectedCandidate && onSave(selectedCandidate)}
              disabled={isSaving || !selectedCandidate}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all font-black uppercase text-base disabled:opacity-30 disabled:shadow-none active:scale-95"
            >
              {isSaving ? 'Saving…' : saveLabel}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all font-black uppercase text-base active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
