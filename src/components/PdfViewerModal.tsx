'use client'

import { useEffect, useRef } from 'react'
import { X, ExternalLink, Download, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'

const PdfCanvasPreview = dynamic(() => import('./PdfCanvasPreview'), {
  ssr: false,
})

export default function PdfViewerModal({
  url,
  title,
  onClose,
}: {
  url: string | null
  title?: string
  onClose: () => void
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (url) {
      closeBtnRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && url) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [url, onClose])

  if (!url) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-2 sm:p-6 animate-fade-in select-none"
    >
      {/* Modal Toolbar Header */}
      <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between bg-black text-zinc-100 px-3.5 sm:px-5 py-3.5 rounded-t-3xl border-b border-zinc-900 gap-3 shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-black flex items-center justify-center shrink-0 shadow-md">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span id="pdf-modal-title" className="font-display font-black text-xs sm:text-sm text-zinc-50 truncate max-w-[200px] sm:max-w-md">
              {title || 'PDF Note Document'}
            </span>
            <span className="text-[10px] font-mono-paper uppercase tracking-wider text-blue-500 font-bold">
              PDF Interactive Reader
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-xs font-black flex items-center gap-1.5 transition-colors shadow-md hover-bounce focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Open Original PDF File"
          >
            <ExternalLink size={14} className="stroke-[2.5]" />
            <span className="font-display">Open PDF</span>
          </a>

          <a
            href={url}
            download={`${(title || 'Note').replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`}
            className="p-2 rounded-xl bg-[#121215] hover:bg-zinc-900 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-900 hover-bounce focus-visible:ring-2 focus-visible:ring-blue-500"
            title="Download PDF file"
          >
            <Download size={14} />
            <span className="hidden sm:inline font-display">Save</span>
          </a>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#121215] text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close PDF Viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 bg-black rounded-b-3xl overflow-hidden shadow-2xl relative flex flex-col border border-zinc-900">
        <PdfCanvasPreview url={url} title={title} mode="interactive" className="w-full h-full" />
      </div>
    </div>
  )
}


