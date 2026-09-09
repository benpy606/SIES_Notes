'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Download, FileText, RefreshCw } from 'lucide-react'

export default function PdfViewerModal({
  url,
  title,
  onClose,
}: {
  url: string | null
  title?: string
  onClose: () => void
}) {
  const [prevUrl, setPrevUrl] = useState(url)
  const [isReady, setIsReady] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  if (url !== prevUrl) {
    setPrevUrl(url)
    setIsReady(false)
  }

  useEffect(() => {
    if (url) {
      closeBtnRef.current?.focus()
      const timer = setTimeout(() => setIsReady(true), 1500)
      return () => clearTimeout(timer)
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
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-6 animate-fade-in"
    >
      {/* Modal Toolbar Header */}
      <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between bg-slate-950 text-slate-100 px-4 py-3.5 rounded-t-3xl border-b border-slate-800 gap-3 shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span id="pdf-modal-title" className="font-display font-black text-xs sm:text-sm text-slate-50 truncate">
              {title || 'PDF Note Document'}
            </span>
            <span className="text-[10px] font-mono-paper uppercase tracking-wider text-amber-400 font-bold">
              PDF Document Reader
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-800 hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline font-display">New Tab</span>
          </a>

          <a
            href={url}
            download={`${(title || 'Note').replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors shadow-md hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span className="hidden sm:inline font-display">Download</span>
          </a>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-800 focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Close PDF Viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 bg-slate-950 rounded-b-3xl overflow-hidden shadow-2xl relative flex flex-col border border-slate-800">
        {!isReady && (
          <div className="absolute inset-0 z-10 bg-slate-950/90 flex flex-col items-center justify-center gap-3 text-slate-300">
            <RefreshCw size={26} className="animate-spin text-amber-400 stroke-[2.5]" />
            <span className="text-xs font-bold font-mono-paper text-amber-400 uppercase tracking-widest">Loading PDF Document...</span>
          </div>
        )}
        <object
          data={url}
          type="application/pdf"
          className="w-full h-full border-0 bg-slate-900"
          onLoad={() => setIsReady(true)}
        >
          <iframe
            src={url}
            className="w-full h-full border-0 bg-slate-900"
            title="PDF Document Viewer"
            onLoad={() => setIsReady(true)}
          />
        </object>
      </div>
    </div>
  )
}
