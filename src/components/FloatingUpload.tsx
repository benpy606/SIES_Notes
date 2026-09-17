'use client'

import { Plus } from 'lucide-react'

export default function FloatingUpload({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30">
      <button
        onClick={onOpen}
        aria-label="Upload new note"
        className="flex items-center gap-2.5 px-5 py-3.5 min-h-[48px] rounded-full bg-[#2563EB] hover:bg-[#3B82F6] text-white shadow-xl shadow-[#3B82F6]/30 ring-4 ring-black/40 hover-bounce transition-colors duration-200 active:scale-95 group cursor-pointer"
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


