'use client'

import { useEffect, useRef } from 'react'
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

export default function SideMenu({
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
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-84 max-w-[88vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-slide-up overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/90 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md shadow-orange-500/20 ring-2 ring-white/20">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-50 line-clamp-1">
                {profile.full_name || 'Student User'}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono-paper">
                BSCIT Student
              </span>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
          <button
            onClick={() => {
              onClose()
              onOpenUpload()
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all hover-bounce uppercase tracking-wider"
          >
            <Upload size={16} className="stroke-[2.5]" />
            <span>Upload New Note</span>
          </button>
        </div>

        {/* Content Type Filter */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
          <h4 className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono-paper mb-2.5 flex items-center gap-1.5">
            <Filter size={12} className="text-amber-500 dark:text-amber-400" /> Format Filter
          </h4>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onSelectFileType('all')}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all ${
                fileTypeFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onSelectFileType('image')}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                fileTypeFilter === 'image'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ImageIcon size={12} /> Images
            </button>
            <button
              onClick={() => onSelectFileType('pdf')}
              className={`py-1.5 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                fileTypeFilter === 'pdf'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText size={12} /> PDFs
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="flex-1 p-5 overflow-y-auto">
          <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono-paper mb-3 flex items-center gap-1.5">
            <BookOpen size={12} className="text-orange-500" /> Subjects
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onSelectSubject('All')
                onClose()
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                selectedSubject === 'All'
                  ? 'bg-amber-400/20 text-slate-900 dark:text-amber-400 border border-amber-500/40 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={14} className={selectedSubject === 'All' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'} />
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
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 text-slate-900 dark:text-amber-400 border border-amber-500/40 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full ring-2 ring-slate-300 dark:ring-white/20 shadow-xs shrink-0"
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/60 flex flex-col gap-3">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full py-2.5 px-3 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
          <div className="text-center pt-1 border-t border-slate-200 dark:border-slate-800/60">
            <span className="text-[10px] font-mono-paper font-bold text-slate-500 dark:text-slate-400">
              Built with ⚡ by <span className="text-amber-600 dark:text-amber-400 font-extrabold">@benpy606</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
