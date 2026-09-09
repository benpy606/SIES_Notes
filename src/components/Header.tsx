'use client'

import { Sparkles, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

type Profile = {
  id: string
  full_name: string
  is_admin: boolean
}

export default function Header({
  profile,
  onOpenSideMenu,
}: {
  profile: Profile
  onOpenSideMenu?: () => void
}) {
  const initials =
    profile.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-30 glass-header px-4 py-3 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        {onOpenSideMenu && (
          <button
            onClick={onOpenSideMenu}
            aria-label="Open navigation menu"
            className="p-2 min-w-[38px] min-h-[38px] rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors flex items-center justify-center hover-bounce border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700"
          >
            <Menu size={22} className="stroke-[2.2]" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 via-amber-500 to-rose-600 flex items-center justify-center shadow-md hover-bounce ring-2 ring-orange-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display text-base font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
              <span className="flex items-center">
                SIES<span className="text-orange-500 font-black">_Notes</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-extrabold tracking-wider border border-amber-400/30 shadow-xs uppercase">
                BSCIT
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          onClick={onOpenSideMenu}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all shadow-sm hover-bounce"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-[10px] font-black text-slate-950 flex items-center justify-center ring-1 ring-white/40 shadow-xs">
            {initials}
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 max-w-[85px] truncate hidden xs:inline font-display">
            {profile.full_name?.split(' ')[0] || 'User'}
          </span>
        </button>
      </div>
    </header>
  )
}

