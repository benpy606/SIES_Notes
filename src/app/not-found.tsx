import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The requested note document or page could not be found on SIES_Notes.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md w-full text-center space-y-6 bg-[#121215]/90 border border-zinc-900 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        {/* Animated 404 Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-3xl font-extrabold shadow-inner">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Note or Page Not Found
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The study note, document URL, or page you were looking for might have been moved, deleted, or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Home Feed
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-900/80 text-xs text-zinc-400 flex items-center justify-between">
          <span>SIES_Notes BScIT</span>
          <span className="text-indigo-400 font-medium">Dev: @benpy606</span>
        </div>
      </div>
    </div>
  )
}
