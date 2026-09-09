'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Sparkles, ArrowRight, ShieldCheck, FileText, Zap } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })
        if (error) throw error
        if (data?.session) {
          router.push('/')
          router.refresh()
        } else {
          setSuccessMessage('Account registered successfully! You can now sign in directly.')
          setIsSignUp(false)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to reach Supabase backend. Please check your internet connection or verify NEXT_PUBLIC_SUPABASE_URL in .env.local.')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred during authentication.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative ${plusJakartaSans.variable}`}>
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Main Clean Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl relative z-10 animate-pop-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center ring-2 ring-slate-800 mb-3 hover-bounce shadow-sm">
            <Sparkles className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            SIES<span className="text-orange-500 font-black">_Notes</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 font-extrabold tracking-wider border border-amber-400/30 uppercase">
              BSCIT
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 max-w-xs">
            {isSignUp
              ? 'Join the social notes tracker for SIES Nerul'
              : 'Sign in to access handwritten notes & PDFs'}
          </p>

          {/* Quick Feature Badges */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-[10px] font-black text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1">
              <Zap size={10} className="text-amber-400" /> Instant Notes
            </span>
            <span className="text-[10px] font-black text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1">
              <FileText size={10} className="text-orange-400" /> PDF Reader
            </span>
            <span className="text-[10px] font-black text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1">
              <ShieldCheck size={10} className="text-emerald-400" /> SIES Verified
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs font-bold text-emerald-300 text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs font-bold text-rose-300 text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ touchAction: 'manipulation' }}>
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 font-mono-paper">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
                placeholder="e.g. Ben Python"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
              placeholder="you@sies.edu.in or email"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 hover:from-orange-500 hover:to-rose-500 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-600/30 hover-bounce"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Student Account' : 'Sign In To Vault'}</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center space-y-3">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-xs text-amber-400 font-extrabold hover:text-amber-300 transition-colors"
          >
            {isSignUp ? 'Already registered? Sign in here' : "Need an account? Sign up now"}
          </button>
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-[10px] font-mono-paper font-bold text-slate-400">
              Developed by <span className="text-amber-400 font-black">@benpy606</span> • SIES Nerul
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

