'use client'

import { Plus } from 'lucide-react'

export default function FloatingUpload({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30">
      <button
        onClick={onOpen}
        aria-label="Upload new note"
        className="flex items-center gap-2.5 px-5 py-3.5 min-h-[48px] rounded-full bg-white hover:bg-slate-200 text-black shadow-lg ring-2 ring-white/10 hover-bounce transition-colors duration-200 active:scale-95 group cursor-pointer border border-white/10"
      >
        <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 shrink-0">
          <Plus size={16} className="stroke-[3px] text-black" />
        </div>
        <span className="text-xs font-black tracking-wider font-display uppercase">
          Upload Note
        </span>
      </button>
    </div>
  )
}
