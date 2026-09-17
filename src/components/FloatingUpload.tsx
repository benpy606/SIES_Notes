'use client'

import { Plus } from 'lucide-react'

export default function FloatingUpload({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30">
      <button
        onClick={onOpen}
        aria-label="Upload new note"
        className="flex items-center gap-2.5 px-5 py-3.5 min-h-[48px] rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30 ring-4 ring-slate-900/40 hover-bounce transition-all active:scale-95 group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 ring-1 ring-white/30 shrink-0">
          <Plus size={16} className="stroke-[3px] text-white" />
        </div>
        <span className="text-xs font-black tracking-wider font-display uppercase drop-shadow-xs">
          Upload Note
        </span>
      </button>
    </div>
  )
}


