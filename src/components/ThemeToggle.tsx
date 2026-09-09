'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('sies_notes_theme')
    const root = document.documentElement
    if (storedTheme === 'light') {
      setIsDark(false)
      root.classList.add('light')
      root.classList.remove('dark')
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    } else {
      setIsDark(true)
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    }
  }, [])

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
      <div className={`w-9.5 h-9.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${className}`} />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className={`p-2 min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center transition-all hover-bounce border shadow-xs ${
        isDark
          ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
          : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={18} className="stroke-[2.5] text-amber-400 animate-pop-in" />
      ) : (
        <Moon size={18} className="stroke-[2.5] text-slate-900 animate-pop-in" />
      )}
    </button>
  )
}
