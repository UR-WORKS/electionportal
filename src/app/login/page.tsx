'use client';

import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 text-[#0B1229]">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">

        {/* Brand Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-[#0B1229] shadow-2xl shadow-[#0B1229]/20 text-white text-4xl font-black">
            E
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Election Portal</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Secure Administrative Access</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50 p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50" />

          <form action={action} className="space-y-6 relative" id="login-form">
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
                placeholder="User ID"
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-base font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Password
              </label>
              <div className="relative group">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 text-base font-black text-gray-900 placeholder-gray-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-[10px] font-black text-rose-600 uppercase tracking-wider text-center animate-in shake-in duration-300 shadow-sm">
                ⚠️ {state.error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={pending}
              className="w-full h-16 rounded-[2rem] bg-[#0B1229] text-white hover:bg-gray-800 disabled:opacity-40 shadow-xl shadow-gray-900/10 transition-all font-black uppercase text-sm active:scale-95 flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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

        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] font-mono">
          Developed by:Uwais Othukkungal
        </p>
      </div>
    </div>
  );
}
