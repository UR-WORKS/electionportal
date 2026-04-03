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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidates</h1>
          <p className="text-slate-400 mt-1">Manage candidates</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <span className="text-lg leading-none">+</span> Add Candidate
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">Loading…</div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <span className="text-4xl mb-3">🏛️</span>
            <p>No candidates yet. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Abbreviation</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs">{c.abbrev}</span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">Delete</button>
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
            <h2 className="text-lg font-bold text-white mb-5">{modal === 'add' ? 'Add Candidate' : 'Edit Candidate'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Candidate Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="e.g. John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Abbreviation</label>
                <input required value={form.abbrev} onChange={e => setForm(f => ({ ...f, abbrev: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="e.g. JS" maxLength={10} />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
