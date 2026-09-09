'use client'

import { useState, useRef } from 'react'
import { deletePost, toggleUpvote } from '@/app/actions'
import Image from 'next/image'
import { Heart, MoreHorizontal, Trash2, User, FileText, Download, ExternalLink, Calendar, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { getPostSubject } from './PostList'

type Subject = {
  id: string
  name: string
  color_code: string
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
  created_at: string
  subject?: any
  lecture?: any
  profiles: {
    id: string
    full_name: string
    is_admin: boolean
  }
  upvotes: { count: number }[]
}

export default function PostCardComponent({
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
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes?.[0]?.count ?? 0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const carouselRef = useRef<HTMLDivElement>(null)

  const canDelete = isAdmin || post.user_id === currentUserId

  // Resolve subject robustly
  const subjectObj = getPostSubject(post, subjects)
  const subjectName = subjectObj?.name || 'General'
  const subjectColor = subjectObj?.color_code || '#EA580C'

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
    if (!confirm('Delete this post?')) return
    setIsDeleting(true)
    try {
      await deletePost(post.id)
    } catch (e) {
      console.error(e)
      setIsDeleting(false)
    }
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
  
  // Extract all valid image URLs
  const allImageUrls: string[] = isPdfFile
    ? []
    : Array.isArray(post.image_urls) && post.image_urls.length > 0
    ? post.image_urls
    : post.image_url
    ? [post.image_url]
    : []

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
    const width = carouselRef.current.clientWidth
    carouselRef.current.scrollTo({
      left: targetIndex * width,
      behavior: 'smooth',
    })
    setActiveImageIndex(targetIndex)
  }

  return (
    <article className="paper-card overflow-hidden flex flex-col group transition-all animate-slide-up">
      {/* Card Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs shrink-0"
            style={{ backgroundColor: subjectColor }}
          />
          <span
            className="text-[11px] font-black tracking-wider uppercase font-mono-paper px-2.5 py-1 rounded-lg border shadow-xs"
            style={{
              color: subjectColor,
              borderColor: `${subjectColor}50`,
              backgroundColor: `${subjectColor}20`,
            }}
          >
            {subjectName}
          </span>
          <span
            suppressHydrationWarning
            className="text-[11px] text-slate-300 font-bold flex items-center gap-1"
          >
            <Calendar size={12} className="text-amber-400" />
            {formattedDate}
          </span>
        </div>

        {canDelete && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Options"
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 w-36 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in p-1">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Title */}
      <div className="px-5 pb-3">
        <h3 className="font-display font-black text-lg text-white leading-snug tracking-tight">
          {topicTitle}
        </h3>
      </div>

      {/* Touch Swipeable Multi-Image Media Carousel */}
      {allImageUrls.length > 0 && (
        <div className="w-full bg-slate-900 relative border-t border-b border-slate-800 overflow-hidden group/img">
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
                  unoptimized
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

      {/* PDF Visual Preview (Picture-like container) */}
      {effectivePdfUrl && (
        <div className="w-full bg-slate-900 relative border-t border-b border-slate-800 overflow-hidden group/pdf">
          <div
            className="w-full aspect-[4/3] relative cursor-pointer overflow-hidden bg-slate-950 flex flex-col items-center justify-center"
            onClick={() => onPdfClick(effectivePdfUrl!, topicTitle)}
          >
            {/* Embedded PDF page preview */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(effectivePdfUrl)}&embedded=true`}
              className="w-full h-full border-0 pointer-events-none opacity-90 scale-[1.02] origin-top"
              title="PDF Note Document Preview"
            />

            {/* Top Right Format Badge */}
            <div className="absolute top-3 right-3 z-10 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-slate-950/30">
              <FileText size={12} className="stroke-[2.5]" />
              <span>PDF Document</span>
            </div>

            {/* Hover / Tap to Expand Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/pdf:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
              <span className="text-xs font-extrabold text-white bg-slate-950/90 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-white/20">
                <ExternalLink size={14} className="stroke-[2.5]" />
                Tap to Open Full PDF Viewer
              </span>
            </div>
          </div>

          {/* Quick PDF Action Bar */}
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <FileText size={18} className="text-amber-400 shrink-0 stroke-[2.2]" />
              <span className="text-xs font-extrabold text-slate-100 truncate font-display">
                {topicTitle}.pdf
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onPdfClick(effectivePdfUrl!, topicTitle)}
                className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm transition-all hover-bounce"
              >
                <ExternalLink size={12} className="stroke-[2.5]" />
                <span>Fullscreen</span>
              </button>
              <a
                href={effectivePdfUrl}
                download
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-sm hover-bounce"
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
          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-medium">
            {post.caption}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between mt-auto transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-950 text-[11px] font-black text-amber-400 flex items-center justify-center shadow-xs ring-1 ring-white/20">
            {authorProfile?.full_name ? authorProfile.full_name.charAt(0) : <User size={12} />}
          </div>
          <span className="text-xs font-bold text-white font-display">
            {authorProfile?.full_name || 'Anonymous Student'}
          </span>
        </div>
        <button
          onClick={handleUpvote}
          aria-label="Upvote note"
          className={`min-h-[38px] px-3.5 rounded-full flex items-center gap-1.5 text-xs font-black transition-all hover-bounce ${
            hasUpvoted
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-300 animate-heart-pulse'
              : 'bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 shadow-xs'
          }`}
        >
          <Heart size={15} className={hasUpvoted ? 'fill-white text-white' : 'text-slate-400 stroke-[2.2]'} />
          <span>{upvoteCount}</span>
        </button>
      </div>
    </article>
  )
}
