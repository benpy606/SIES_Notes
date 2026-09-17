'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

const emptySubscribe = () => () => {}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sies_notes_theme')
      return stored !== 'light'
    }
    return true
  })

  useEffect(() => {
    const root = document.documentElement
    if (!isDark) {
      root.classList.add('light')
      root.classList.remove('dark')
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    }
  }, [isDark])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    const root = document.documentElement
    if (nextDark) {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.classList.add('dark')
      document.body.classList.remove('light')
      localStorage.setItem('sies_notes_theme', 'dark')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      document.body.classList.add('light')
      document.body.classList.remove('dark')
      localStorage.setItem('sies_notes_theme', 'light')
    }
  }

  if (!mounted) {
    return (
      <div className={`w-9.5 h-9.5 rounded-xl bg-[#121215] border border-zinc-800 shrink-0 ${className}`} />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className={`p-2 min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center transition-all hover-bounce border shadow-xs ${
        isDark
          ? 'bg-[#121215] text-[#F59E0B] border-zinc-800 hover:bg-white/10'
          : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={18} className="stroke-[2.5] text-[#F59E0B] animate-pop-in" />
      ) : (
        <Moon size={18} className="stroke-[2.5] text-slate-900 animate-pop-in" />
      )}
    </button>
  )
}
