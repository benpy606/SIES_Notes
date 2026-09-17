'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Server Component Error caught by error.tsx boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-black">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-900 rounded-3xl p-7 text-center shadow-2xl space-y-5 animate-pop-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle size={28} className="stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-display font-black text-lg text-white">Something went wrong</h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            {error?.message && !error.message.includes('Server Components render')
              ? error.message
              : 'A server rendering issue occurred while loading the page. You may need to sign in or refresh.'}
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-xl bg-black border border-zinc-900 text-[10px] font-mono-paper text-zinc-500">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-black text-xs font-black flex items-center justify-center gap-2 transition-all hover-bounce shadow-md"
          >
            <RefreshCw size={14} className="stroke-[2.5]" />
            <span>Try Again</span>
          </button>
          <a
            href="/login"
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-zinc-800 hover-bounce"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </a>
        </div>
      </div>
    </div>
  )
}
