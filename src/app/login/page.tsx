'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">

        {/* Brand Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-emerald-600 shadow-2xl shadow-emerald-500/30 text-white text-4xl font-black">
            E
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">ElectionPortal</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Secure Administrative Access</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50 p-10 space-y-8">
          <form action={action} className="space-y-6" id="login-form">
            <div className="space-y-2">
              <label htmlFor="login-username" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Username
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder=""
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-base font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder=""
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-base font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {state?.error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-3 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-in shake-in duration-300">
                {state.error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={pending}
              className="w-full h-16 rounded-[2rem] bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 shadow-xl shadow-emerald-600/20 transition-all font-black uppercase text-sm active:scale-95 flex items-center justify-center gap-3"
            >
              {pending ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Voter Tracking System
        </p>
      </div>
    </div>
  );
}
