'use client'

import { useState, useTransition, useRef, TouchEvent } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from './Header'
import SubjectCarousel from './SubjectCarousel'
import PostList from './PostList'
import SideMenu from './SideMenu'
import { RefreshCw } from 'lucide-react'

const UploadModal = dynamic(() => import('./UploadModal'), { ssr: false })
const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false })
const PdfViewerModal = dynamic(() => import('./PdfViewerModal'), { ssr: false })

type Profile = {
  id: string
  full_name: string
  is_admin: boolean
}

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
  subject?: Subject
  lecture?: {
    id: string
    subject_id: string
    date: string
    lecture_number: number
    topic: string | null
    subject?: Subject
  }
  profiles: Profile
  upvotes: { count: number }[]
}

export default function Feed({
  profile,
  subjects: initialSubjects,
  posts,
}: {
  profile: Profile
  subjects: Subject[]
  posts: PostWithRelations[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshingState, setIsRefreshingState] = useState(false)

  const [subjects] = useState<Subject[]>(initialSubjects)
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'image' | 'pdf'>('all')

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lightboxData, setLightboxData] = useState<{ images: string[]; initialIndex: number } | null>(null)
  const [pdfModalData, setPdfModalData] = useState<{ url: string; title: string } | null>(null)

  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isRefreshing = isPending || isRefreshingState

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshingState(true)
    setPullDistance(0)
    startTransition(() => {
      router.refresh()
    })
    setTimeout(() => setIsRefreshingState(false), 1200)
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY
    } else {
      startYRef.current = null
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (startYRef.current !== null && !isRefreshing) {
      const currentY = e.touches[0].clientY
      const distance = currentY - startYRef.current
      if (distance > 0) {
        // Prevent default only if we are at the top and pulling down
        if (e.cancelable) {
          e.preventDefault()
        }
        setPullDistance(Math.min(distance * 0.5, 100)) // Dampening factor and max height
      }
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handleRefresh()
    }
    setPullDistance(0)
    startYRef.current = null
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-black text-slate-900 dark:text-slate-100 flex justify-center selection:bg-[#3B82F6] selection:text-white">
      <div
        className="w-full max-w-md relative flex flex-col min-h-screen h-screen overflow-y-auto border-x border-slate-300/60 dark:border-zinc-800/60 bg-[var(--background)] text-[var(--foreground)] shadow-2xl shadow-slate-950/80 z-10 transition-colors duration-200"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-all z-20 pointer-events-none"
          style={{ height: isRefreshing ? '60px' : `${pullDistance}px`, opacity: pullDistance > 10 || isRefreshing ? 1 : 0 }}
        >
          <div
            className="flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-lg p-2 transform transition-transform"
            style={{
              transform: `scale(${isRefreshing ? 1 : Math.min(pullDistance / 60, 1)})`,
            }}
          >
            <RefreshCw
              size={20}
              className={`text-[#3B82F6] ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${pullDistance * 2}deg)` }}
            />
          </div>
        </div>

        <Header
          profile={profile}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          onOpenUpload={() => setIsModalOpen(true)}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />

        <SubjectCarousel
          subjects={subjects}
          selected={selectedSubject}
          onSelect={setSelectedSubject}
        />

        <PostList
          posts={posts}
          subjects={subjects}
          selectedSubject={selectedSubject}
          fileTypeFilter={fileTypeFilter}
          onImageClick={(images, index) => setLightboxData({ images, initialIndex: index })}
          onPdfClick={(url, title) => setPdfModalData({ url, title })}
          currentUserId={profile.id}
          isAdmin={profile.is_admin}
        />

        <SideMenu
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
          profile={profile}
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          fileTypeFilter={fileTypeFilter}
          onSelectFileType={setFileTypeFilter}
          onOpenUpload={() => setIsModalOpen(true)}
        />

        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subjects={subjects}
          defaultSubject={selectedSubject !== 'All' ? selectedSubject : undefined}
        />

        <Lightbox
          images={lightboxData?.images}
          initialIndex={lightboxData?.initialIndex ?? 0}
          onClose={() => setLightboxData(null)}
        />

        <PdfViewerModal
          url={pdfModalData?.url || null}
          title={pdfModalData?.title}
          onClose={() => setPdfModalData(null)}
        />
      </div>
    </div>
  )
}
