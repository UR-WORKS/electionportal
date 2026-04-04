'use client';

import { Vote } from 'lucide-react';
import { useActionState, useState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 text-[#0B1229] overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-emerald-200 opacity-20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 opacity-20 blur-3xl rounded-full" />

      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">

        {/* Brand Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30 text-white">
            <Vote size={40} strokeWidth={2.5} />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              VOTE<span className="text-emerald-600">-TRACK</span>
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3em]">
              Secure Election Management
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-[2.5rem] border border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl p-10 space-y-8 relative overflow-hidden">

          <form action={action} className="space-y-6">

            {/* Username */}
            <div className="relative">
              <input
                id="login-username"
                name="username"
                type="text"
                required
                placeholder=" "
                autoComplete="username"
                className="peer w-full rounded-2xl bg-gray-50 border border-gray-200 px-6 pt-6 pb-3 text-base text-gray-900 placeholder-transparent outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <label
                htmlFor="login-username"
                className="absolute left-5 top-3 text-gray-400 text-xs transition-all
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-300
                peer-focus:top-3 peer-focus:text-xs peer-focus:text-emerald-600"
              >
                Username
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                autoComplete="current-password"
                className="peer w-full rounded-2xl bg-gray-50 border border-gray-200 px-6 pt-6 pb-3 text-base text-gray-900 placeholder-transparent outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <label
                htmlFor="login-password"
                className="absolute left-5 top-3 text-gray-400 text-xs transition-all
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-300
                peer-focus:top-3 peer-focus:text-xs peer-focus:text-emerald-600"
              >
                Password
              </label>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029" />
                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      d="M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error */}
            {state?.error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-600 text-center">
                ⚠️ {state.error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 shadow-lg shadow-emerald-500/20 transition-all font-bold uppercase text-sm active:scale-95 flex items-center justify-center gap-3"
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

        {/* Footer */}
        <p className="text-center text-[10px] font-semibold text-gray-300 uppercase tracking-[0.3em] font-mono">
          Developed by: Uwais Othukkungal
        </p>

      </div>
    </div>
  );
}