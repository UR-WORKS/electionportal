'use client';

import { useState, useEffect, useCallback } from 'react';

type panchayath = { id: number; name: string };
type Booth = { id: number; number: number; name: string | null; totalVoters: number; panchayathId: number; panchayath: { id: number; name: string } };

export default function BoothsPage() {
  const [items, setItems] = useState<Booth[]>([]);
  const [panchayath, setpanchayath] = useState<panchayath[]>([]);
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
    if (pRes.ok) setpanchayath(await pRes.json());
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Booths</h1><p className="text-slate-400 mt-1">Manage booths and their panchayath</p></div>
        <div className="flex gap-3">
          <button onClick={() => setImportModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            📂 Import Excel
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <span className="text-lg leading-none">+</span> Add Booth
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-16 text-slate-500">Loading…</div>
          : items.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-slate-500"><span className="text-4xl mb-3">📍</span><p>No booths yet.</p></div>
            : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-6 py-3 font-medium">Booth #</th>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">panchayath</th>
                  <th className="text-left px-6 py-3 font-medium">Total Voters</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-indigo-400">{item.number}</td>
                      <td className="px-6 py-4 font-medium text-white">{item.name ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-300">{item.panchayath.name}</td>
                      <td className="px-6 py-4 text-slate-300">{item.totalVoters.toLocaleString()}</td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">{modal === 'add' ? 'Add Booth' : 'Edit Booth'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Booth Number</label>
                  <input required type="number" min={1} value={form.number} onChange={e => f('number', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Total Voters</label>
                  <input type="number" min={0} value={form.totalVoters} onChange={e => f('totalVoters', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Booth Name (optional)</label>
                <input value={form.name} onChange={e => f('name', e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="e.g. Market Booth" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">panchayath</label>
                <select required value={form.panchayathId} onChange={e => f('panchayathId', e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                  <option value="">Select panchayath…</option>
                  {panchayath.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {importModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">Bulk Import Booths</h2>
            <div className="space-y-4">
              {!importResult ? (
                <>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Upload an Excel file (.xlsx or .xls) with columns:
                    <code className="text-indigo-400 px-1 font-mono">panchayath</code>,
                    <code className="text-indigo-400 px-1 font-mono">Number</code>,
                    <code className="text-indigo-400 px-1 font-mono">Name</code>,
                    <code className="text-indigo-400 px-1 font-mono">Total Voters</code>.
                  </p>
                  <div className="flex justify-start">
                    <a href="/api/admin/booths/import-template" download className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all">
                      <span>📥</span> Download Excel Template (with panchayath Names)
                    </a>
                  </div>
                  <label className="block border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group">
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
                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-slate-300">
                      <span className="text-3xl">📄</span>
                      {importing ? 'Processing file...' : 'Choose Excel file to upload'}
                    </div>
                  </label>
                  {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">{error}</p>}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    Successfully imported <strong>{importResult.created}</strong> booths.
                    {importResult.skipped > 0 && ` ${importResult.skipped} rows skipped.`}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="p-3 bg-red-500/5 border border-slate-800 rounded-lg max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-slate-400 mb-2">Errors / Skips:</p>
                      <ul className="space-y-1">
                        {importResult.errors.map((err, i) => <li key={i} className="text-[11px] text-red-400/80">• {err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">
                  {importResult ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
