'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

// Declare pdfjsLib on window
declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string
      }
      getDocument: (src: string | { url: string; withCredentials?: boolean }) => {
        promise: Promise<{
          numPages: number
          getPage: (pageNumber: number) => Promise<{
            getViewport: (params: { scale: number }) => { width: number; height: number }
            render: (params: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> }
          }>
        }>
      }
    }
  }
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

let isScriptLoading = false
let scriptLoadedPromise: Promise<void> | null = null

function loadPdfJsScript(): Promise<void> {
  if (window.pdfjsLib) {
    return Promise.resolve()
  }

  if (scriptLoadedPromise) {
    return scriptLoadedPromise
  }

  scriptLoadedPromise = new Promise((resolve, reject) => {
    isScriptLoading = true
    const script = document.createElement('script')
    script.src = PDFJS_CDN
    script.async = true
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN
      }
      isScriptLoading = false
      resolve()
    }
    script.onerror = (err) => {
      isScriptLoading = false
      scriptLoadedPromise = null
      reject(err)
    }
    document.head.appendChild(script)
  })

  return scriptLoadedPromise
}

export default function PdfCanvasPreview({
  url,
  title,
  mode = 'thumbnail', // 'thumbnail' | 'interactive'
  className = '',
}: {
  url: string
  title?: string
  mode?: 'thumbnail' | 'interactive'
  className?: string
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(mode === 'thumbnail' ? 1.0 : 1.2)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderTaskRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    let isMounted = true

    async function renderPdfPage() {
      if (!url) return

      try {
        setLoading(true)
        setError(false)

        await loadPdfJsScript()

        if (!window.pdfjsLib) {
          throw new Error('PDF.js failed to load')
        }

        const loadingTask = window.pdfjsLib.getDocument({
          url,
        })

        const pdf = await loadingTask.promise
        if (!isMounted) return

        setNumPages(pdf.numPages)

        const page = await pdf.getPage(currentPage)
        if (!isMounted) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const viewport = page.getViewport({ scale })
        
        // Handle high DPI displays for crisp text
        const outputScale = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        ctx.scale(outputScale, outputScale)

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.warn('PDF.js canvas rendering fallback notice:', err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    renderPdfPage()

    return () => {
      isMounted = false
    }
  }, [url, currentPage, scale])

  if (error) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-200 ${className}`}>
        <div className="w-14 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400/50 flex flex-col items-center justify-center gap-1 shadow-xl">
          <FileText size={28} className="text-amber-400 stroke-[2.2]" />
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono-paper">PDF</span>
        </div>
        <span className="mt-3 text-xs font-extrabold text-slate-100 font-display line-clamp-1 max-w-[220px]">
          {title || 'PDF Note Document'}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-auto ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 bg-slate-950/90 flex flex-col items-center justify-center gap-2.5 text-slate-300">
          <RefreshCw size={24} className="animate-spin text-amber-400 stroke-[2.5]" />
          <span className="text-[10px] font-bold font-mono-paper text-amber-400 uppercase tracking-widest">
            Rendering PDF Canvas...
          </span>
        </div>
      )}

      {/* Render Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 w-full overflow-auto">
        <canvas ref={canvasRef} className="max-w-full shadow-2xl rounded-lg border border-slate-800 bg-white" />
      </div>

      {/* Interactive Toolbar for Modal Reader Mode */}
      {mode === 'interactive' && numPages > 0 && (
        <div className="sticky bottom-3 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-2xl text-slate-200">
          {/* Page Prev/Next */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400"
            title="Previous Page"
          >
            <ChevronLeft size={16} className="stroke-[3]" />
          </button>
          
          <span className="text-xs font-mono-paper font-bold text-slate-100">
            Page {currentPage} of {numPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400"
            title="Next Page"
          >
            <ChevronRight size={16} className="stroke-[3]" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
