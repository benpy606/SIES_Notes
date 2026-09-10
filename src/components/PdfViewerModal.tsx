'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Download, FileText, RefreshCw, Eye, Globe } from 'lucide-react'

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
  const [viewerMode, setViewerMode] = useState<'google' | 'native'>('google')
  const [hasError, setHasError] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  if (url !== prevUrl) {
    setPrevUrl(url)
    setIsReady(false)
    setHasError(false)
  }

  useEffect(() => {
    if (url) {
      closeBtnRef.current?.focus()
      const timer = setTimeout(() => setIsReady(true), 2000)
      return () => clearTimeout(timer)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && url) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [url, viewerMode, onClose])

  if (!url) return null

  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`

  const handleReload = () => {
    setIsReady(false)
    setHasError(false)
    setTimeout(() => setIsReady(true), 1500)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-2 sm:p-6 animate-fade-in select-none"
    >
      {/* Modal Toolbar Header */}
      <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between bg-slate-950 text-slate-100 px-3.5 sm:px-5 py-3 rounded-t-3xl border-b border-slate-800 gap-2.5 shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span id="pdf-modal-title" className="font-display font-black text-xs sm:text-sm text-slate-50 truncate max-w-[180px] sm:max-w-xs">
              {title || 'PDF Note Document'}
            </span>
            <span className="text-[10px] font-mono-paper uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
              <Globe size={10} />
              {viewerMode === 'google' ? 'Mobile Cloud Reader' : 'Native Browser Reader'}
            </span>
          </div>
        </div>

        {/* Controls & Engine Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setViewerMode('google')
                setIsReady(false)
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                viewerMode === 'google'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cloud Engine (Works on iOS & Android)"
            >
              <Globe size={12} />
              <span className="font-mono-paper uppercase">Mobile Engine</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewerMode('native')
                setIsReady(false)
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                viewerMode === 'native'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Native Engine (Desktop Browser)"
            >
              <Eye size={12} />
              <span className="hidden xs:inline font-mono-paper uppercase">Direct</span>
            </button>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-800 hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Open in Browser New Tab"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline font-display">New Tab</span>
          </a>

          <a
            href={url}
            download={`${(title || 'Note').replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors shadow-md hover-bounce focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Download PDF file"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span className="hidden sm:inline font-display">Save</span>
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
        {!isReady && !hasError && (
          <div className="absolute inset-0 z-10 bg-slate-950/95 flex flex-col items-center justify-center gap-3 text-slate-300 p-4 text-center">
            <RefreshCw size={28} className="animate-spin text-amber-400 stroke-[2.5]" />
            <span className="text-xs font-bold font-mono-paper text-amber-400 uppercase tracking-widest">
              Rendering Mobile PDF Reader...
            </span>
            <span className="text-[11px] text-slate-400 max-w-xs">
              Optimizing document for mobile screen viewing.
            </span>
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-200 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <FileText size={32} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h4 className="font-display font-extrabold text-base text-white">Unable to render PDF inline</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your mobile browser prevented embedded preview. You can view the document directly or save it to your device.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
              <button
                type="button"
                onClick={handleReload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw size={14} />
                <span>Retry Engine</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md"
              >
                <ExternalLink size={14} />
                <span>Open PDF Directly</span>
              </a>
            </div>
          </div>
        ) : viewerMode === 'google' ? (
          <iframe
            src={googleDocsViewerUrl}
            className="w-full h-full border-0 bg-slate-900"
            title="PDF Mobile Reader"
            onLoad={() => setIsReady(true)}
            onError={() => setHasError(true)}
          />
        ) : (
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full border-0 bg-slate-900"
            onLoad={() => setIsReady(true)}
            onError={() => setHasError(true)}
          >
            <iframe
              src={url}
              className="w-full h-full border-0 bg-slate-900"
              title="PDF Direct Viewer"
              onLoad={() => setIsReady(true)}
              onError={() => setHasError(true)}
            />
          </object>
        )}
      </div>
    </div>
  )
}

