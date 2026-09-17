'use client'

import { useEffect, useRef, memo } from 'react'
import { X, LogOut, BookOpen, Upload, FileText, Image as ImageIcon, User, Filter, Sparkles } from 'lucide-react'
import { signOut } from '@/app/actions'

type Profile = {
  id: string
  full_name: string
  is_admin: boolean
}

type Subject = {
  id: string
  name: string
  color_code: string
}

function SideMenu({
  isOpen,
  onClose,
  profile,
  subjects,
  selectedSubject,
  onSelectSubject,
  fileTypeFilter,
  onSelectFileType,
  onOpenUpload,
}: {
  isOpen: boolean
  onClose: () => void
  profile: Profile
  subjects: Subject[]
  selectedSubject: string
  onSelectSubject: (subject: string) => void
  fileTypeFilter: 'all' | 'image' | 'pdf'
  onSelectFileType: (type: 'all' | 'image' | 'pdf') => void
  onOpenUpload: () => void
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className="fixed inset-0 z-50 flex animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-84 max-w-[88vw] bg-[#0D0F18] border-r border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-slide-up overflow-y-auto no-scrollbar">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0D0F18]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20 ring-2 ring-white/20">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm text-white line-clamp-1">
                {profile.full_name || 'Student User'}
              </span>
              <span className="text-[11px] font-bold text-amber-300 mt-0.5 font-mono-paper">
                BSCIT Student
              </span>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => {
              onClose()
              onOpenUpload()
            }}
            className="w-full py-3 px-4 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover-bounce uppercase tracking-wider cursor-pointer"
          >
            <Upload size={16} className="stroke-[2.5]" />
            <span>Upload New Note</span>
          </button>
        </div>

        {/* Content Type Filter */}
        <div className="px-5 py-4 border-b border-slate-800/80">
          <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest font-mono-paper mb-2.5 flex items-center gap-1.5">
            <Filter size={12} className="text-amber-400" /> Format Filter
          </h4>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectFileType('all')}
              className={`py-2 px-2 min-h-[38px] rounded-lg text-xs font-black transition-all cursor-pointer ${
                fileTypeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onSelectFileType('image')}
              className={`py-2 px-2 min-h-[38px] rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                fileTypeFilter === 'image'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ImageIcon size={12} /> Images
            </button>
            <button
              onClick={() => onSelectFileType('pdf')}
              className={`py-2 px-2 min-h-[38px] rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                fileTypeFilter === 'pdf'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText size={12} /> PDFs
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono-paper mb-3 flex items-center gap-1.5">
            <BookOpen size={12} className="text-blue-400" /> Subjects
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onSelectSubject('All')
                onClose()
              }}
              className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                selectedSubject === 'All'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={14} className={selectedSubject === 'All' ? 'text-blue-400' : 'text-slate-500'} />
                <span className="font-display">All Subjects</span>
              </div>
            </button>

            {subjects.map((sub) => {
              const isSelected = selectedSubject === sub.name
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectSubject(sub.name)
                    onClose()
                  }}
                  className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-xs shrink-0"
                      style={{ backgroundColor: sub.color_code }}
                    />
                    <span className="truncate font-display">{sub.name}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800/90 bg-slate-950/60 flex flex-col gap-3">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full py-2.5 px-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
          <div className="text-center pt-2 border-t border-slate-800/60 space-y-1">
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <a href="/privacy" className="hover:text-blue-400 transition-colors font-bold">Privacy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-blue-400 transition-colors font-bold">Terms</a>
            </div>
            <span className="text-[10px] font-mono-paper font-bold text-slate-400 block">
              Built with ⚡ by <span className="text-amber-400 font-extrabold">@benpy606</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(SideMenu)
