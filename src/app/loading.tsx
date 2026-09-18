import { Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-amber-400">
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-slate-900 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 progress-animated-striped animate-pulse w-full shadow-lg shadow-blue-500/50" />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-pop-in relative z-10 backdrop-blur-md">
        {/* Pulsing Brand Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-amber-500 rounded-3xl blur-md opacity-70 animate-pulse-glow" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-xl">
            <Sparkles className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="font-display text-xl font-black text-white tracking-tight flex items-center gap-2">
          SIES<span className="text-blue-500 font-extrabold">_Notes</span>
        </h2>
        <p className="text-xs text-slate-400 font-bold mt-1 animate-pulse">
          Loading classroom notes vault...
        </p>

        {/* Skeleton Post Card Simulation */}
        <div className="w-full mt-6 space-y-3">
          <div className="h-4 bg-slate-800 rounded-lg w-3/4 animate-shimmer" />
          <div className="h-32 bg-slate-800/60 rounded-2xl animate-shimmer" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 w-20 bg-slate-800 rounded-full animate-shimmer" />
            <div className="h-6 w-12 bg-slate-800 rounded-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
