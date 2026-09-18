'use client'

import { Sparkles, Menu, Plus, RefreshCw } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

type Profile = {
  id: string
  full_name: string
  is_admin: boolean
}

export default function Header({
  profile,
  onOpenSideMenu,
  onOpenUpload,
  isRefreshing = false,
  onRefresh,
}: {
  profile: Profile
  onOpenSideMenu?: () => void
  onOpenUpload?: () => void
  isRefreshing?: boolean
  onRefresh?: () => void
}) {
  const firstName = profile.full_name?.split(' ')[0] || 'Student'
  const initials =
    profile.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'S'

  return (
    <header className="sticky top-0 z-30 glass-header px-5 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        {onOpenSideMenu && (
          <button
            onClick={onOpenSideMenu}
            aria-label="Open navigation menu"
            className="p-2 min-w-[38px] min-h-[38px] rounded-xl text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors duration-200 flex items-center justify-center hover-bounce border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-800"
          >
            <Menu size={22} className="stroke-[2.2]" />
          </button>
        )}
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            Hello, {firstName}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-4 h-4 rounded-md bg-[#F59E0B] text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
              ⚡
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-wide font-display">
              {profile.is_admin ? 'Admin Member' : 'BSCIT Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title={isRefreshing ? 'Reloading feed...' : 'Reload feed'}
            aria-label="Reload page feed"
            className={`p-2 min-w-[36px] min-h-[36px] rounded-xl text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors duration-200 flex items-center justify-center border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-800 ${
              isRefreshing ? 'text-amber-500 dark:text-[#F59E0B] bg-amber-400/10' : ''
            }`}
          >
            <RefreshCw
              size={16}
              className={`stroke-[2.5] transition-transform ${
                isRefreshing ? 'animate-spin text-amber-500 dark:text-amber-400' : ''
              }`}
            />
          </button>
        )}

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white text-black font-extrabold text-xs shadow-sm border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors duration-200 active:scale-95 cursor-pointer"
            aria-label="Upload new note"
          >
            <Plus size={15} className="stroke-[3]" />
            <span className="hidden xs:inline uppercase text-[10px] tracking-wider font-mono-paper">Upload</span>
          </button>
        )}

        <ThemeToggle />

        <button
          onClick={onOpenSideMenu}
          aria-label="Profile options"
          className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-white hover:text-black dark:hover:text-black border border-slate-300 dark:border-zinc-800 font-extrabold text-xs flex items-center justify-center transition-colors duration-200 shadow-xs hover-bounce"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}


