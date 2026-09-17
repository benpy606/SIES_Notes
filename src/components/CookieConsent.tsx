'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('sies_notes_cookie_consent')
      if (!consent) {
        setIsVisible(true)
      }
    } catch {
      // localStorage disabled or error
    }
  }, [])

  const acceptCookies = () => {
    try {
      localStorage.setItem('sies_notes_cookie_consent', 'accepted')
    } catch {}
    setIsVisible(false)
  }

  const acceptEssentialOnly = () => {
    try {
      localStorage.setItem('sies_notes_cookie_consent', 'essential')
    } catch {}
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 rounded-2xl bg-[#121215]/95 dark:bg-black/95 border border-zinc-800/80 shadow-2xl backdrop-blur-md text-zinc-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-1 text-xs leading-relaxed text-zinc-300">
          <p className="font-semibold text-zinc-100 text-sm">Cookie & Privacy Preferences</p>
          <p>
            We use essential cookies to maintain your login session and secure your notes. See our{' '}
            <Link href="/privacy" className="underline text-indigo-400 hover:text-indigo-300 transition-colors">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="underline text-indigo-400 hover:text-indigo-300 transition-colors">
              Terms of Use
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={acceptEssentialOnly}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          Essential Only
        </button>
        <button
          onClick={acceptCookies}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
        >
          Accept All
        </button>
      </div>
    </aside>
  )
}
