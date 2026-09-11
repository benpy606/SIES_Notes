'use client'

import { useState, useRef, memo } from 'react'
import { deletePost, toggleUpvote, togglePinPost, toggleVerifyPost } from '@/app/actions'
import Image from 'next/image'
import {
  Heart,
  MoreHorizontal,
  Trash2,
  User,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  Shield,
  Pin,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react'
import { getPostSubject } from './PostList'
import dynamic from 'next/dynamic'

const PdfCanvasPreview = dynamic(() => import('./PdfCanvasPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-200">
      <FileText size={28} className="text-amber-400 stroke-[2.2] animate-pulse" />
      <span className="mt-2 text-[10px] font-mono-paper text-amber-400 uppercase tracking-widest">Loading PDF Preview...</span>
    </div>
  ),
})

type Subject = {
  id: string
  name: string
  color_code: string
}

type Lecture = {
  id?: string
  subject_id?: string
  date?: string
  lecture_number?: number
  topic?: string | null
  subject?: Subject | Subject[]
}

type PostWithRelations = {
  id: string
  user_id: string
  subject_id?: string
  title?: string
  image_url?: string | null
  image_urls?: string[] | null
  pdf_url?: string | null
  file_type?: string
  caption?: string
  is_pinned?: boolean
  is_verified?: boolean
  created_at: string
  subject?: Subject | Subject[]
  lecture?: Lecture | Lecture[]
  profiles: {
    id: string
    full_name: string
    is_admin: boolean
  }
  upvotes: { count: number }[]
}

function PostCardComponent({
  post,
  subjects,
  currentUserId,
  isAdmin,
  onImageClick,
  onPdfClick,
}: {
  post: PostWithRelations
  subjects: Subject[]
  currentUserId: string
  isAdmin: boolean
  onImageClick: (images: string[], index: number) => void
  onPdfClick: (url: string, title: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes?.[0]?.count ?? 0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const [isPinned, setIsPinned] = useState(!!post.is_pinned)
  const [isVerified, setIsVerified] = useState(!!post.is_verified)
  const [copied, setCopied] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)

  const isOwner = post.user_id === currentUserId
  const canDelete = isAdmin || isOwner

  // Resolve subject robustly
  const subjectObj = getPostSubject(post, subjects)
  const subjectName = subjectObj?.name || 'General'
  const rawSubjectColor = subjectObj?.color_code || '#F59E0B'

  // Ensure subject color is sufficiently bright for dark surfaces
  const getHighContrastColor = (color: string) => {
    if (!color || !color.startsWith('#') || color.length !== 7) return '#818CF8'
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    if (brightness < 110) return '#818CF8'
    return color
  }

  const subjectColor = getHighContrastColor(rawSubjectColor)

  const rawTitle =
    post.title ||
    (Array.isArray(post.lecture) ? post.lecture[0]?.topic : post.lecture?.topic)

  const topicTitle =
    rawTitle && rawTitle.trim().toLowerCase() !== 'lecture'
      ? rawTitle
      : post.caption && post.caption.trim().length > 0
      ? post.caption.trim().length > 35
        ? post.caption.trim().slice(0, 35) + '...'
        : post.caption.trim()
      : `${subjectName} Note`

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setIsDeleting(true)
    try {
      await deletePost(post.id)
    } catch (e: unknown) {
      console.error('Delete post error:', e)
      const msg = e instanceof Error ? e.message : 'Failed to delete post. Please try again.'
      alert(msg)
      setIsDeleting(false)
    }
  }

  const handleAdminPinToggle = async () => {
    try {
      await togglePinPost(post.id)
      setIsPinned(!isPinned)
      setShowAdminMenu(false)
    } catch (e) {
      console.error('Failed toggling pin status:', e)
    }
  }

  const handleAdminVerifyToggle = async () => {
    try {
      await toggleVerifyPost(post.id)
      setIsVerified(!isVerified)
      setShowAdminMenu(false)
    } catch (e) {
      console.error('Failed toggling verify status:', e)
    }
  }

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(`Post ID: ${post.id}\nAuthor ID: ${post.user_id}\nCreated: ${post.created_at}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setShowAdminMenu(false)
  }

  const handleUpvote = async () => {
    try {
      await toggleUpvote(post.id)
      setUpvoteCount((c) => (hasUpvoted ? c - 1 : c + 1))
      setHasUpvoted(!hasUpvoted)
    } catch (e) {
      console.error(e)
    }
  }

  const d = new Date(post.created_at)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedDate = isNaN(d.getTime())
    ? ''
    : `${MONTHS[d.getMonth()]} ${d.getDate()}`

  const isPdfFile =
    !!post.pdf_url ||
    (!!post.image_url && (post.image_url.includes('.pdf') || post.file_type === 'pdf'))

  const effectivePdfUrl = post.pdf_url || (isPdfFile ? post.image_url : null)
  
  // Extract all valid image URLs (handling array, comma-separated string, or single URL)
  let rawImagesList: string[] = []
  if (!isPdfFile) {
    const rawUrls = post.image_urls as unknown
    if (Array.isArray(rawUrls) && rawUrls.length > 0) {
      rawImagesList = rawUrls.map((u) => String(u))
    } else if (typeof rawUrls === 'string' && rawUrls.trim().length > 0) {
      try {
        if (rawUrls.startsWith('[')) {
          const parsed = JSON.parse(rawUrls)
          if (Array.isArray(parsed)) rawImagesList = parsed.map((u) => String(u))
        } else {
          rawImagesList = rawUrls.split(',').map((s: string) => s.trim())
        }
      } catch {
        rawImagesList = [rawUrls]
      }
    } else if (post.image_url && post.image_url.trim().length > 0) {
      rawImagesList = post.image_url.includes(',')
        ? post.image_url.split(',').map((s: string) => s.trim())
        : [post.image_url]
    }
  }

  const allImageUrls = rawImagesList.filter((url) => typeof url === 'string' && url.length > 0)

  const authorProfile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles

  const handleScroll = () => {
    if (!carouselRef.current) return
    const { scrollLeft, clientWidth } = carouselRef.current
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / clientWidth)
      setActiveImageIndex(index)
    }
  }

  const scrollToPage = (targetIndex: number) => {
    if (!carouselRef.current) return
    const container = carouselRef.current
    const width = container.clientWidth || container.offsetWidth || 0
    if (width > 0) {
      container.scrollTo({
        left: targetIndex * width,
        behavior: 'smooth',
      })
    }
    setActiveImageIndex(targetIndex)
  }

  return (
    <article
      style={{ contain: 'content' }}
      className={`paper-card bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border overflow-hidden flex flex-col group transition-all animate-slide-up shadow-md ${
        isPinned ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Pinned Note Banner */}
      {isPinned && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-mono-paper shadow-xs">
          <Pin size={12} className="fill-slate-950 stroke-none" />
          <span>Pinned Announcement Note</span>
        </div>
      )}

      {/* Card Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-200 dark:ring-white/30 shadow-xs shrink-0"
            style={{ backgroundColor: subjectColor }}
          />
          <span
            className="text-[11px] font-black tracking-wider uppercase font-mono-paper px-2.5 py-1 rounded-lg border shadow-xs"
            style={{
              color: subjectColor,
              borderColor: `${subjectColor}40`,
              backgroundColor: `${subjectColor}20`,
            }}
          >
            {subjectName}
          </span>
          {isVerified && (
            <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono-paper">
              <CheckCircle2 size={11} className="stroke-[2.5]" />
              Verified Note
            </span>
          )}
          <span
            suppressHydrationWarning
            className="text-[11px] text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1"
          >
            <Calendar size={12} className="text-amber-500 dark:text-amber-400" />
            {formattedDate}
          </span>
        </div>

        {/* Options / Admin Special Menu */}
        <div className="flex items-center gap-1.5">
          {/* Explicit Dedicated Admin Menu Button */}
          {isAdmin && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAdminMenu(!showAdminMenu)
                  setShowMenu(false)
                }}
                aria-label="Admin Special Menu"
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-500 dark:text-amber-400 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Shield size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline uppercase text-[10px] tracking-wider font-mono-paper">Admin Menu</span>
              </button>

              {/* Admin Special Dropdown Menu */}
              {showAdminMenu && (
                <div className="absolute right-0 top-10 w-52 bg-slate-950 text-slate-100 border border-amber-500/40 rounded-2xl shadow-2xl z-30 overflow-hidden animate-pop-in p-1.5 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono-paper flex items-center justify-between">
                    <span>Admin Controls</span>
                    <Shield size={12} />
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      onClick={handleAdminPinToggle}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900 rounded-xl transition-colors text-left"
                    >
                      <Pin size={14} className={`stroke-[2] ${isPinned ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      <span>{isPinned ? 'Unpin Note' : 'Pin to Top'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAdminVerifyToggle}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900 rounded-xl transition-colors text-left"
                    >
                      <CheckCircle2 size={14} className={`stroke-[2] ${isVerified ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{isVerified ? 'Remove Verification' : 'Mark as Verified'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMeta}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-900 rounded-xl transition-colors text-left"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                      <span>{copied ? 'Copied Meta!' : 'Copy Note ID'}</span>
                    </button>

                    <div className="border-t border-slate-800/80 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false)
                        handleDelete()
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors text-left"
                    >
                      <Trash2 size={14} className="stroke-[2]" />
                      <span>Delete Post (Admin)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post Options Menu for Owner or Admin */}
          {canDelete && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(!showMenu)
                  setShowAdminMenu(false)
                }}
                aria-label="Post Options"
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 w-40 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false)
                      handleDelete()
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors text-left"
                  >
                    <Trash2 size={14} />
                    <span>{isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete Post'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Title */}
      <div className="px-5 pb-3">
        <h3 className="font-display font-black text-lg text-slate-900 dark:text-white leading-snug tracking-tight">
          {topicTitle}
        </h3>
      </div>

      {/* Touch Swipeable Multi-Image Media Carousel */}
      {allImageUrls.length > 0 && (
        <div className="w-full bg-slate-100 dark:bg-slate-950 relative border-t border-b border-slate-200 dark:border-slate-800 overflow-hidden group/img">
          {/* Top Multi-Page Badge Overlay */}
          {allImageUrls.length > 1 && (
            <div className="absolute top-3 right-3 z-20 bg-slate-950/85 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700/80 shadow-lg flex items-center gap-1.5 font-mono-paper pointer-events-none">
              <Layers size={12} className="stroke-[2.5]" />
              <span>{activeImageIndex + 1} / {allImageUrls.length} Pages</span>
            </div>
          )}

          {/* Swipeable Scroll Container */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full"
          >
            {allImageUrls.map((url, idx) => (
              <div
                key={idx}
                className="w-full shrink-0 snap-center aspect-[4/3] relative cursor-zoom-in overflow-hidden"
                onClick={() => onImageClick(allImageUrls, idx)}
              >
                <Image
                  src={url}
                  alt={`Lecture note preview page ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  quality={82}
                  className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs pointer-events-none">
                  <span className="text-xs font-extrabold text-white bg-slate-950/80 px-4 py-2 rounded-full shadow-xl border border-white/20">
                    Tap to Expand Gallery
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Next / Prev Controls */}
          {allImageUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const prevIdx = activeImageIndex > 0 ? activeImageIndex - 1 : allImageUrls.length - 1
                  scrollToPage(prevIdx)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white/90 hover:text-amber-400 border border-slate-800 shadow-xl transition-all hover-bounce z-20"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} className="stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const nextIdx = activeImageIndex < allImageUrls.length - 1 ? activeImageIndex + 1 : 0
                  scrollToPage(nextIdx)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white/90 hover:text-amber-400 border border-slate-800 shadow-xl transition-all hover-bounce z-20"
                aria-label="Next image"
              >
                <ChevronRight size={18} className="stroke-[3]" />
              </button>

              {/* Swipe Dots Indicator */}
              <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none">
                {allImageUrls.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToPage(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                      idx === activeImageIndex
                        ? 'w-5 bg-amber-400 shadow-md'
                        : 'w-1.5 bg-slate-400/60 hover:bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* PDF Visual Preview */}
      {effectivePdfUrl && (
        <div className="w-full bg-slate-100 dark:bg-slate-900 relative border-t border-b border-slate-200 dark:border-slate-800 overflow-hidden group/pdf">
          <div
            className="w-full aspect-[4/5] relative cursor-pointer overflow-hidden bg-slate-950 flex flex-col items-center justify-start"
            onClick={() => onPdfClick(effectivePdfUrl!, topicTitle)}
          >
            {/* Live Canvas PDF First-Page Document Preview */}
            <PdfCanvasPreview
              url={effectivePdfUrl}
              title={topicTitle}
              mode="thumbnail"
              className="pointer-events-none select-none"
            />

            {/* Top Right Format Badge */}
            <div className="absolute top-3 right-3 z-10 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-slate-950/30 font-mono-paper pointer-events-none">
              <FileText size={12} className="stroke-[2.5]" />
              <span>PDF Document</span>
            </div>
          </div>

          {/* Quick PDF Action Bar */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <FileText size={18} className="text-amber-500 dark:text-amber-400 shrink-0 stroke-[2.2]" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate font-display">
                {topicTitle}.pdf
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onPdfClick(effectivePdfUrl!, topicTitle)}
                className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm transition-all hover-bounce"
              >
                <ExternalLink size={12} className="stroke-[2.5]" />
                <span>Fullscreen</span>
              </button>
              <a
                href={effectivePdfUrl}
                download={`${topicTitle.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`}
                className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm hover-bounce"
                title="Download PDF"
              >
                <Download size={12} className="stroke-[2.5]" />
                <span className="hidden xs:inline">Save</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-5 pt-3 pb-3">
          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
            {post.caption}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-auto transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-slate-800 dark:text-amber-400 font-mono-paper text-[11px] font-black flex items-center justify-center shadow-xs ring-1 ring-amber-500/40">
            {authorProfile?.full_name ? authorProfile.full_name.charAt(0) : <User size={12} />}
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
            {authorProfile?.full_name || 'Anonymous Student'}
          </span>
        </div>
        <button
          onClick={handleUpvote}
          aria-label="Upvote note"
          className={`min-h-[38px] px-3.5 rounded-full flex items-center gap-1.5 text-xs font-black transition-all hover-bounce ${
            hasUpvoted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-300 animate-heart-pulse'
              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
          }`}
        >
          <Heart size={15} className={hasUpvoted ? 'fill-white text-white' : 'text-slate-400 stroke-[2.2]'} />
          <span>{upvoteCount}</span>
        </button>
      </div>
    </article>
  )
}

const MemoizedPostCard = memo(PostCardComponent)
export default MemoizedPostCard
