'use client'

import Image from 'next/image'
import { X } from 'lucide-react'

export default function Lightbox({ url, onClose }: { url: string | null; onClose: () => void }) {
  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-50"
      >
        <X size={24} />
      </button>
      <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <Image
          src={url}
          alt="Full size"
          fill
          className="object-contain"
        />
      </div>
    </div>
  )
}
