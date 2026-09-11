'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Lightweight privacy-friendly route tracking without third-party tracking bloat
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Log anonymous route visits for performance verification
      console.log(`[SIES_Notes Analytics] Route view: ${pathname}`)
    }
  }, [pathname])

  return null
}
