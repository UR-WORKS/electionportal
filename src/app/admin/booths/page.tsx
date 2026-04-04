'use client';

import { useState, useEffect, useCallback } from 'react';

type panchayath = { id: number; name: string };
type Booth = { id: number; number: number; name: string | null; totalVoters: number; panchayathId: number; panchayath: { id: number; name: string } };

export default function BoothsPage() {
  const [items, setItems] = useState<Booth[]>([]);
  const [panchayaths, setPanchayaths] = useState<panchayath[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Booth | null>(null);
  const [form, setForm] = useState({ number: '', name: '', totalVoters: '0', panchayathId: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; created: number; skipped: number; errors: string[] } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [wRes, pRes] = await Promise.all([fetch('/api/admin/booths'), fetch('/api/admin/panchayaths')]);
    if (wRes.ok) setItems(await wRes.json());
    if (pRes.ok) setPanchayaths(await pRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() { setForm({ number: '', name: '', totalVoters: '0', panchayathId: '' }); setEditing(null); setError(''); setModal('add'); }
  function openEdit(item: Booth) { setForm({ number: String(item.number), name: item.name ?? '', totalVoters: String(item.totalVoters), panchayathId: String(item.panchayathId) }); setEditing(item); setError(''); setModal('edit'); }
  function closeModal() { setModal(null); setImportModal(false); setImportResult(null); setError(''); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const url = editing ? `/api/admin/booths/${editing.id}` : '/api/admin/booths';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: Number(form.number), name: form.name || null, totalVoters: Number(form.totalVoters), panchayathId: Number(form.panchayathId) }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error'); setSaving(false); return; }
    await fetchData(); closeModal(); setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this booth?')) return;
    const res = await fetch(`/api/admin/booths/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    fetchData();
  }

  const f = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">BOOTH REGISTRY</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Polling Units</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setImportModal(true)} 
            className="flex items-center gap-3 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            📂 Bulk Import
          </button>
          <button 
            onClick={openAdd} 
            className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-600/20 active:scale-95 transition-all w-fit"
          >
            <span className="text-xl leading-none">+</span> Add Booth
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Loading booths...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <span className="text-6xl mb-6 opacity-20">📍</span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No booths registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24"># No.</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Booth Name</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Panchayath</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Electorate</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-10 py-6">
                      <span className="text-sm font-mono font-black text-emerald-600">
                        {item.number.toString().padStart(3, '0')}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                        {item.name ?? 'Untitled Booth'}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="inline-flex px-3 py-1 rounded-lg bg-slate-50 text-slate-500 font-bold text-[9px] font-black uppercase border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100/50 transition-all">
                        {item.panchayath.name}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-700 tabular-nums">
                        {item.totalVoters.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
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

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="rounded-[3rem] bg-white p-10 w-full max-w-md shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
            <div className="relative space-y-8">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">BOOTH SETUP</h3>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{modal === 'add' ? 'New Entry' : 'Modify Record'}</h2>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Booth Number</label>
                    <input required type="number" min={1} value={form.number} onChange={e => f('number', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Total Electorate</label>
                    <input type="number" min={0} value={form.totalVoters} onChange={e => f('totalVoters', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Booth Name (Optional)</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="e.g. Market Square School" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Panchayath</label>
                  <select required value={form.panchayathId} onChange={e => f('panchayathId', e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                    <option value="">Select panchayath…</option>
                    {panchayaths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {error && <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-shake">⚠️ {error}</div>}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-[2rem] bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-[2] py-4 rounded-[2rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all">
                    {saving ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="rounded-[4rem] bg-white p-12 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="relative space-y-10">
              <div className="space-y-2 text-center">
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Bulk Management</h3>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Import Data</h2>
              </div>

              <div className="space-y-8">
                {!importResult ? (
                  <>
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 leading-relaxed text-center mb-6">
                        Upload an Excel file with columns:<br/>
                        <span className="text-emerald-600">panchayath, Number, Name, Total Voters</span>
                      </p>
                      <div className="flex justify-center">
                        <a href="/api/admin/booths/import-template" download className="inline-flex items-center gap-3 text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 transition-all">
                          📂 Download Template
                        </a>
                      </div>
                    </div>

                    <label className="block border-4 border-dashed border-slate-100 rounded-[3rem] p-12 hover:border-emerald-200 hover:bg-emerald-50/30 cursor-pointer transition-all group relative overflow-hidden">
                      <input type="file" accept=".xlsx,.xls" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setImporting(true); setError('');
                          const fd = new FormData(); fd.append('file', file);
                          const res = await fetch('/api/admin/booths/bulk-import', { method: 'POST', body: fd });
                          const data = await res.json();
                          setImporting(false);
                          if (!res.ok) setError(data.error ?? 'Upload failed');
                          else setImportResult({ success: true, created: data.createdCount, skipped: data.skippedCount, errors: data.errors });
                          if (res.ok) fetchData();
                        }} />
                      <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white shadow-xl border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-3xl">{importing ? '⏳' : '📄'}</span>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                          {importing ? 'Processing...' : 'Drop Excel File Here'}
                        </p>
                      </div>
                    </label>
                    {error && <div className="rounded-2xl bg-rose-50 border border-rose-100 px-6 py-4 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-shake">⚠️ {error}</div>}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                      <p className="text-4xl">🎉</p>
                      <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Import Complete</h3>
                      <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                        {importResult.created} Entries Created • {importResult.skipped} Skips
                      </p>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Conflict Logs:</p>
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {importResult.errors.map((err, i) => (
                            <li key={i} className="text-[10px] font-bold text-slate-500/80 leading-relaxed flex items-start gap-2">
                              <span className="text-slate-300">•</span> {err}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-center flex-col gap-4">
                  <button type="button" onClick={closeModal} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                    {importResult ? 'Finish' : 'Cancel Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
