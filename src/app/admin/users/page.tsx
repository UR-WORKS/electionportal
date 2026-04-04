'use client';

import { useState, useEffect, useCallback } from 'react';

type Candidate = { id: number; name: string };
type Constituency = { id: number; name: string };
type panchayath = { id: number; name: string };
type Booth = { id: number; number: number; name: string | null };
type User = {
  id: number; username: string; name: string; email: string; role: string;
  candidate: { id: number; name: string } | null;
  constituency: { id: number; name: string } | null;
  panchayath: { id: number; name: string } | null;
  booth: { id: number; number: number; name: string | null } | null;
};

const ROLE_LABELS: Record<string, string> = {
  MANDAL_ADMIN: 'Mandalam Admin',
  PANCHAYATH_ADMIN: 'Panchayath Admin',
  BOOTH_ADMIN: 'Booth Admin',
};

const ROLE_COLORS: Record<string, string> = {
  MANDAL_ADMIN: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  PANCHAYATH_ADMIN: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  BOOTH_ADMIN: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

type FormType = {
  username: string; name: string; password: string;
  role: string; candidateId: string;
  constituencyId: string; panchayathId: string; boothId: string;
};

const EMPTY_FORM: FormType = {
  username: '', name: '', password: '',
  role: '', candidateId: '',
  constituencyId: '', panchayathId: '', boothId: '',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [panchayaths, setPanchayaths] = useState<panchayath[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormType>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameConflict, setUsernameConflict] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; created: number; skipped: number; errors: string[] } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [uRes, cRes, constRes, panRes, wRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/candidates'),
      fetch('/api/admin/constituencies'),
      fetch('/api/admin/panchayaths'),
      fetch('/api/admin/booths'),
    ]);
    if (uRes.ok) setUsers(await uRes.json());
    if (cRes.ok) setCandidates(await cRes.json());
    if (constRes.ok) setConstituencies(await constRes.json());
    if (panRes.ok) setPanchayaths(await panRes.json());
    if (wRes.ok) setBooths(await wRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Debounced username check
  useEffect(() => {
    if (!modal || !form.username || form.username.length < 3) {
      setUsernameConflict(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const query = new URLSearchParams({ username: form.username });
        if (editing) query.set('excludeId', String(editing.id));
        const res = await fetch(`/api/admin/users/check-username?${query.toString()}`);
        const data = await res.json();
        setUsernameConflict(!data.available);
      } catch (err) {
        console.error('Failed to check username', err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.username, modal, editing]);

  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setError(''); setModal('add'); }
  function openEdit(u: User) {
    setForm({
      username: u.username, name: u.name, password: '',
      role: u.role, candidateId: u.candidate ? String(u.candidate.id) : '',
      constituencyId: u.constituency ? String(u.constituency.id) : '',
      panchayathId: u.panchayath ? String(u.panchayath.id) : '',
      boothId: u.booth ? String(u.booth.id) : '',
    });
    setEditing(u); setError(''); setModal('edit');
  }
  function closeModal() { setModal(null); setImportModal(false); setImportResult(null); setError(''); }
  const f = (k: keyof FormType, v: string) => { setForm(prev => ({ ...prev, [k]: v })); setError(''); };

  function handleRoleChange(role: string) {
    setForm(prev => ({ ...prev, role, constituencyId: '', panchayathId: '', boothId: '' }));
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const body: Record<string, unknown> = {
      username: form.username,
      name: form.name, role: form.role,
      candidateId: form.candidateId || null,
      constituencyId: form.role === 'MANDAL_ADMIN' ? (form.constituencyId || null) : null,
      panchayathId: form.role === 'PANCHAYATH_ADMIN' ? (form.panchayathId || null) : null,
      boothId: form.role === 'BOOTH_ADMIN' ? (form.boothId || null) : null,
    };
    if (!editing) { body.password = form.password; }
    else if (form.password) { body.password = form.password; }

    const url = editing ? `/api/admin/users/${editing.id}` : '/api/admin/users';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? 'Error';
      setError(msg);
      if (res.status === 409) alert(msg);
      setSaving(false); return;
    }
    await fetchAll(); closeModal(); setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    fetchAll();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">ACCESS CONTROL</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Staff Accounts</h1>
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
            <span className="text-xl leading-none">+</span> Add Staff
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Loading staff database...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <span className="text-6xl mb-6 opacity-20">👥</span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No staff accounts configured yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Role</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Affiliation</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jurisdiction</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-slate-50/30 transition-all">
                    <td className="px-10 py-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{u.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">@{u.username}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-lg font-black text-[9px] uppercase border tracking-widest ${
                        u.role === 'MANDAL_ADMIN' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                        u.role === 'PANCHAYATH_ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide italic">
                        {u.candidate?.name ?? 'Neutral'}
                      </p>
                    </td>
                    <td className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {u.constituency?.name ?? u.panchayath?.name ?? (u.booth ? `Booth ${u.booth.number}${u.booth.name ? ` · ${u.booth.name}` : ''}` : 'Global')}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
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
          <div className="rounded-[3rem] bg-white p-10 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
            <div className="relative space-y-8">
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ACCOUNT SETUP</h3>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{modal === 'add' ? 'New Account' : 'Modify Access'}</h2>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input required value={form.name} onChange={e => f('name', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
                    <div className="relative">
                      <input required value={form.username} onChange={e => f('username', e.target.value)}
                        className={`w-full rounded-2xl bg-slate-50 border px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 transition-all pr-12 ${usernameConflict ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-100 focus:ring-emerald-500/10 focus:border-emerald-500'}`} placeholder="admin" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isCheckingUsername ? <div className="w-4 h-4 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" /> : usernameConflict ? '⚠️' : form.username.length >= 3 ? '✅' : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{editing ? 'Reset Password (Optional)' : 'Secure Password'}</label>
                  <input type="password" required={!editing} value={form.password} onChange={e => f('password', e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="••••••••" minLength={8} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Administrative Role</label>
                    <select required value={form.role} onChange={e => handleRoleChange(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                      <option value="">Select role…</option>
                      <option value="MANDAL_ADMIN">Mandal Admin</option>
                      <option value="PANCHAYATH_ADMIN">Panchayath Admin</option>
                      <option value="BOOTH_ADMIN">Booth Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Candidate Affiliation</label>
                    <select value={form.candidateId} onChange={e => f('candidateId', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                      <option value="">No candidate</option>
                      {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Jurisdiction Selectors */}
                {form.role === 'MANDAL_ADMIN' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Constituency Jurisdiction</label>
                    <select value={form.constituencyId} onChange={e => f('constituencyId', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                      <option value="">Select constituency…</option>
                      {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {form.role === 'PANCHAYATH_ADMIN' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Panchayath Jurisdiction</label>
                    <select value={form.panchayathId} onChange={e => f('panchayathId', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                      <option value="">Select panchayath…</option>
                      {panchayaths.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                {form.role === 'BOOTH_ADMIN' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Booth Jurisdiction</label>
                    <select value={form.boothId} onChange={e => f('boothId', e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                      <option value="">Select booth…</option>
                      {booths.map(w => <option key={w.id} value={w.id}>Booth {w.number}{w.name ? ` · ${w.name}` : ''}</option>)}
                    </select>
                  </div>
                )}

                {error && <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-shake">⚠️ {error}</div>}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-[2rem] bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                  <button type="submit" disabled={saving || usernameConflict} className="flex-[2] py-4 rounded-[2rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all">
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
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Import Users</h2>
              </div>

              <div className="space-y-8">
                {!importResult ? (
                  <>
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 leading-relaxed text-center mb-6">
                        Upload an Excel file with columns:<br/>
                        <span className="text-emerald-600">Username, Full Name, Role, Candidate, Jurisdiction</span>
                      </p>
                      <div className="flex justify-center">
                        <a href="/api/admin/users/import-template" download className="inline-flex items-center gap-3 text-[10px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 transition-all">
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
                          const res = await fetch('/api/admin/users/bulk-import', { method: 'POST', body: fd });
                          const data = await res.json();
                          setImporting(false);
                          if (!res.ok) setError(data.error || 'Upload failed');
                          else setImportResult({ success: true, created: data.createdCount, skipped: data.skippedCount, errors: data.errors });
                          if (res.ok) fetchAll();
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
                        {importResult.created} Accounts Created • {importResult.skipped} Skips
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
