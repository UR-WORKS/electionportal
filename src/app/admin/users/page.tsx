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
  MANDAL_ADMIN: 'Mandal Admin',
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
  const [panchayath, setpanchayath] = useState<panchayath[]>([]);
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
    if (panRes.ok) setpanchayath(await panRes.json());
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

  // When role changes, clear location fields
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Admin Users</h1><p className="text-slate-400 mt-1">Manage admin accounts and their permissions</p></div>
        <div className="flex gap-3">
          <button onClick={() => setImportModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            📂 Import Excel
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <span className="text-lg leading-none">+</span> Add User
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-16 text-slate-500">Loading…</div>
          : users.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-slate-500"><span className="text-4xl mb-3">👥</span><p>No admin users yet.</p></div>
            : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Username</th>
                  <th className="text-left px-6 py-3 font-medium">Role</th>
                  <th className="text-left px-6 py-3 font-medium">Candidate</th>
                  <th className="text-left px-6 py-3 font-medium">Location</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">@{u.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md border text-xs font-medium ${ROLE_COLORS[u.role] ?? 'text-slate-400'}`}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{u.candidate?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-300 text-xs">
                        {u.constituency?.name ?? u.panchayath?.name ?? (u.booth ? `Booth ${u.booth.number}${u.booth.name ? ` · ${u.booth.name}` : ''}` : '—')}
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors">Edit</button>
                        <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-5">{modal === 'add' ? 'Add Admin User' : 'Edit User'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input required value={form.name} onChange={e => f('name', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="e.g. Ravi Kumar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <input required value={form.username} onChange={e => f('username', e.target.value)}
                    className={`w-full rounded-lg bg-slate-800 border ${usernameConflict ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'} px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 transition`} placeholder="username" />
                  {isCheckingUsername && <p className="text-[10px] text-slate-500 mt-1 animate-pulse">Checking availability…</p>}
                  {usernameConflict && <p className="text-[10px] text-red-400 mt-1">Username already taken</p>}
                  {!isCheckingUsername && !usernameConflict && form.username.length >= 3 && <p className="text-[10px] text-emerald-500 mt-1">Username available</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" required={!editing} value={form.password} onChange={e => f('password', e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="••••••••" minLength={8} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                  <select required value={form.role} onChange={e => handleRoleChange(e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <option value="">Select role…</option>
                    <option value="MANDAL_ADMIN">Mandal Admin</option>
                    <option value="PANCHAYATH_ADMIN">Panchayath Admin</option>
                    <option value="BOOTH_ADMIN">Booth Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Candidate</label>
                  <select value={form.candidateId} onChange={e => f('candidateId', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <option value="">No candidate</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Conditional location dropdown */}
              {form.role === 'MANDAL_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Constituency</label>
                  <select value={form.constituencyId} onChange={e => f('constituencyId', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <option value="">Select constituency…</option>
                    {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {form.role === 'PANCHAYATH_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Panchayath</label>
                  <select value={form.panchayathId} onChange={e => f('panchayathId', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <option value="">Select panchayath…</option>
                    {panchayath.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {form.role === 'BOOTH_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Booth</label>
                  <select value={form.boothId} onChange={e => f('boothId', e.target.value)}
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <option value="">Select booth…</option>
                    {booths.map(w => <option key={w.id} value={w.id}>Booth {w.number}{w.name ? ` — ${w.name}` : ''}</option>)}
                  </select>
                </div>
              )}

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
            <h2 className="text-lg font-bold text-white mb-5">Bulk Import Users</h2>
            <div className="space-y-4">
              {!importResult ? (
                <>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Upload an Excel file (.xlsx or .xls) with columns like 
                    <code className="text-indigo-400 px-1 font-mono">Username</code>, 
                    <code className="text-indigo-400 px-1 font-mono">Full Name</code>, 
                    <code className="text-indigo-400 px-1 font-mono">Role</code>, etc.
                  </p>
                  <div className="flex justify-start">
                    <a href="/api/admin/users/import-template" download className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all">
                      <span>📥</span> Download Excel Template
                    </a>
                  </div>
                  <label className="block border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group">
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
                    Successfully imported <strong>{importResult.created}</strong> users.
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
