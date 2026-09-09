'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Lightbox({
  url,
  images,
  initialIndex = 0,
  onClose,
}: {
  url?: string | null
  images?: string[]
  initialIndex?: number
  onClose: () => void
}) {
  const imageList = (images && images.length > 0)
    ? images
    : url
    ? [url]
    : []

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, images, url])

  useEffect(() => {
    // Focus close button on mount
    closeBtnRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && imageList.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
      } else if (e.key === 'ArrowRight' && imageList.length > 1) {
        setCurrentIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imageList.length, onClose])

  if (imageList.length === 0) return null

  const currentUrl = imageList[currentIndex] || imageList[0]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox preview"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar / Close & Page Count */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-50">
        <div className="bg-slate-900/80 border border-slate-800 text-amber-400 font-mono-paper text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {imageList.length > 1 ? `Page ${currentIndex + 1} of ${imageList.length}` : 'Note Photo'}
        </div>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-colors shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Close image viewer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Image View */}
      <div className="w-full h-full flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
        <Image
          src={currentUrl}
          alt={`Note image page ${currentIndex + 1}`}
          fill
          unoptimized
          className="object-contain p-2 sm:p-6"
        />

        {/* Previous / Next Controls */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-400 shadow-2xl transition-all hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} className="stroke-[2.5]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-400 shadow-2xl transition-all hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Next page"
            >
              <ChevronRight size={24} className="stroke-[2.5]" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
