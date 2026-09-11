'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import SubjectCarousel from './SubjectCarousel'
import PostList from './PostList'
import UploadModal from './UploadModal'
import Lightbox from './Lightbox'
import PdfViewerModal from './PdfViewerModal'
import FloatingUpload from './FloatingUpload'
import SideMenu from './SideMenu'

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

  const isRefreshing = isPending || isRefreshingState

  const handleRefresh = () => {
    setIsRefreshingState(true)
    startTransition(() => {
      router.refresh()
    })
    setTimeout(() => setIsRefreshingState(false), 1200)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md relative flex flex-col min-h-screen border-x border-slate-200/90 dark:border-slate-800/80 bg-[var(--background)] text-[var(--foreground)] shadow-2xl shadow-slate-950/40 z-10 transition-colors">
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

        <FloatingUpload onOpen={() => setIsModalOpen(true)} />
      </div>
    </div>
  )
}
