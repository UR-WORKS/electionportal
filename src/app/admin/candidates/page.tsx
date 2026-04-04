'use client';

import { useState, useEffect, useCallback } from 'react';

type Candidate = { id: number; name: string; abbrev: string };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [form, setForm] = useState({ name: '', abbrev: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/candidates');
    if (res.ok) setCandidates(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  function openAdd() { setForm({ name: '', abbrev: '' }); setEditing(null); setError(''); setModal('add'); }
  function openEdit(c: Candidate) { setForm({ name: c.name, abbrev: c.abbrev }); setEditing(c); setError(''); setModal('edit'); }
  function closeModal() { setModal(null); setEditing(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const url = editing ? `/api/admin/candidates/${editing.id}` : '/api/admin/candidates';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error'); setSaving(false); return; }
    await fetchCandidates();
    closeModal();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this candidate?')) return;
    const res = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    fetchCandidates();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">CANDIDATE MANAGEMENT</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Registry</h1>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/20 active:scale-95 transition-all w-fit"
        >
          <span className="text-xl leading-none">+</span> Add Candidate
        </button>
      </div>

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <span className="text-6xl mb-6 opacity-20">🏛️</span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No candidates registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifier</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {candidates.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                        {c.name}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="inline-flex px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-mono text-[11px] font-black uppercase border border-emerald-100/50">
                        {c.abbrev}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEdit(c)} 
                          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                          title="Edit Candidate"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)} 
                          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                          title="Delete Candidate"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="rounded-[3rem] bg-white p-10 w-full max-w-md shadow-2xl shadow-slate-900/20 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
            
            <div className="relative space-y-8">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">CANDIDATE SETUP</h3>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {modal === 'add' ? 'New Entry' : 'Modify Record'}
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Candidate Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="e.g. John Smith" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Abbreviation</label>
                  <input required value={form.abbrev} onChange={e => setForm(f => ({ ...f, abbrev: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono"
                    placeholder="e.g. JS" maxLength={10} />
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-[2rem] bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-[2] py-4 rounded-[2rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all">
                    {saving ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
