'use client'

import { Plus } from 'lucide-react'

export default function FloatingUpload({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30">
      <button
        onClick={onOpen}
        aria-label="Upload new note"
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white shadow-xl shadow-slate-950/40 ring-4 ring-white/20 dark:ring-slate-900/80 hover-bounce transition-all active:scale-95 group"
      >
        <div className="w-6 h-6 rounded-full bg-slate-950/30 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 ring-1 ring-white/30 shrink-0">
          <Plus size={16} className="stroke-[3px] text-white" />
        </div>
        <span className="text-xs font-black tracking-wider font-display uppercase drop-shadow-xs">
          Upload Note
        </span>
      </button>
    </div>
  )
}


