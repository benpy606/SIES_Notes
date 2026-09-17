'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, RefreshCw, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react'

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

let scriptLoadedPromise: Promise<void> | null = null

function loadPdfJsScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.pdfjsLib) {
    return Promise.resolve()
  }

  if (scriptLoadedPromise) {
    return scriptLoadedPromise
  }

  scriptLoadedPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = PDFJS_CDN
    script.async = true
    script.onload = () => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN
      }
      resolve()
    }
    script.onerror = (err) => {
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
  
  // Free Zoom & Pan States for Interactive Viewer
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const pinchDistRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Reset pan and zoom on page change
  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    let isMounted = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activeRenderTask: any = null

    async function renderPdfPage() {
      if (!url) return

      try {
        setLoading(true)
        setError(false)

        await loadPdfJsScript()

        if (!window.pdfjsLib) {
          throw new Error('PDF.js failed to load')
        }

        const loadingTask = window.pdfjsLib.getDocument({ url })
        const pdf = await loadingTask.promise
        if (!isMounted) return

        setNumPages(pdf.numPages)

        const page = await pdf.getPage(currentPage)
        if (!isMounted) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Baseline render scale: 1.0x for feed thumbnails (fast, lightweight memory), 2.0x for interactive modal viewer
        const renderScale = mode === 'thumbnail' ? 1.0 : 2.0
        const viewport = page.getViewport({ scale: renderScale })

        const rawDpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
        // Cap output DPR at 1.5 for thumbnails to avoid GPU texture bloat
        const outputScale = mode === 'thumbnail' ? Math.min(rawDpr, 1.5) : Math.min(rawDpr, 2.0)

        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)

        if (mode === 'thumbnail') {
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
          canvas.style.objectFit = 'cover'
          canvas.style.objectPosition = 'top'
        } else {
          canvas.style.width = '100%'
          canvas.style.maxWidth = '100%'
          canvas.style.height = 'auto'
        }

        ctx.scale(outputScale, outputScale)

        activeRenderTask = page.render({
          canvasContext: ctx,
          viewport,
        })

        await activeRenderTask.promise

        if (isMounted) {
          setLoading(false)
        }
      } catch (err: unknown) {
        const isCancel = err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException'
        if (!isCancel) {
          console.warn('PDF.js canvas rendering notice:', err)
          if (isMounted) {
            setError(true)
            setLoading(false)
          }
        }
      }
    }

    renderPdfPage()

    return () => {
      isMounted = false
      if (activeRenderTask) {
        try {
          activeRenderTask.cancel()
        } catch {
          // ignore task cancellation errors
        }
      }
      if (canvasRef.current) {
        // Clear canvas dimensions to release browser GPU memory
        canvasRef.current.width = 0
        canvasRef.current.height = 0
      }
    }
  }, [url, currentPage, mode])

  // Mouse & Touch Pan / Zoom Handlers for Interactive Reader Mode
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (mode !== 'interactive') return
    setIsDragging(true)
    dragStartRef.current = {
      x: clientX - pan.x,
      y: clientY - pan.y,
    }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (mode !== 'interactive' || !isDragging) return
    setPan({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y,
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    pinchDistRef.current = null
  }

  // Touch specific multi-touch pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'interactive') return
    if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      pinchDistRef.current = dist
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (mode !== 'interactive') return
    if (e.touches.length === 1 && isDragging) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
    } else if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const delta = dist - pinchDistRef.current
      pinchDistRef.current = dist

      setZoom((prev) => Math.min(4.0, Math.max(0.6, prev + delta * 0.008)))
    }
  }

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (mode !== 'interactive') return
    e.stopPropagation()
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15
    setZoom((prev) => Math.min(4.0, Math.max(0.6, prev + zoomDelta)))
  }

  if (error) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black text-zinc-200 ${className}`}>
        <div className="w-14 h-16 rounded-2xl bg-[#121215] border-2 border-blue-500/50 flex flex-col items-center justify-center gap-1 shadow-xl">
          <FileText size={28} className="text-blue-500 stroke-[2.2]" />
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest font-mono-paper">PDF</span>
        </div>
        <span className="mt-3 text-xs font-extrabold text-zinc-100 font-display line-clamp-1 max-w-[220px]">
          {title || 'PDF Note Document'}
        </span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
      className={`relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none ${
        mode === 'interactive' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
      } ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-2.5 text-zinc-300 pointer-events-none">
          <RefreshCw size={24} className="animate-spin text-blue-500 stroke-[2.5]" />
          <span className="text-[10px] font-bold font-mono-paper text-blue-500 uppercase tracking-widest">
            Rendering PDF Canvas...
          </span>
        </div>
      )}

      {/* Free Zoomable & Movable Canvas Stage */}
      <div
        className="flex-1 w-full h-full flex items-center justify-center p-2 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg border border-zinc-900 bg-white"
        />
      </div>

      {/* Interactive Controls Bar for Reader Mode */}
      {mode === 'interactive' && numPages > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="sticky bottom-3 z-30 bg-[#121215]/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-zinc-900 flex items-center gap-2 sm:gap-3 shadow-2xl text-zinc-200"
        >
          {/* Page Prev/Next */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1))
              resetView()
            }}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-blue-500 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} className="stroke-[3]" />
          </button>
          
          <span className="text-[11px] sm:text-xs font-mono-paper font-bold text-zinc-100 whitespace-nowrap">
            {currentPage} / {numPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(numPages, p + 1))
              resetView()
            }}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-blue-500 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} className="stroke-[3]" />
          </button>

          <div className="h-4 w-px bg-zinc-900 my-auto" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom((s) => Math.max(0.6, s - 0.25))}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <span className="text-[10px] font-mono-paper font-bold text-blue-500 min-w-[35px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((s) => Math.min(4.0, s + 0.25))}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 transition-colors"
            title="Reset Pan & Zoom"
          >
            <RotateCcw size={15} />
          </button>

          <div className="hidden xs:flex items-center gap-1 text-[10px] font-mono-paper text-zinc-400 pl-1 border-l border-zinc-900">
            <Move size={12} className="text-blue-500" />
            <span>Drag to Pan</span>
          </div>
        </div>
      )}
    </div>
  )
}

