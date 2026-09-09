'use client'

import PostCardComponent from './PostCard'
import { FileQuestion } from 'lucide-react'

type Subject = {
  id: string
  name: string
  color_code: string
}

type Profile = {
  id: string
  full_name: string
  is_admin: boolean
}

type PostWithRelations = {
  id: string
  user_id: string
  subject_id?: string
  title?: string
  image_url?: string | null
  pdf_url?: string | null
  file_type?: string
  caption?: string
  created_at: string
  subject?: Subject | Subject[]
  lecture?: any
  profiles: Profile
  upvotes: { count: number }[]
}

export function getPostSubject(p: any, subjects: Subject[]): Subject | undefined {
  if (!p) return undefined

  // 1. Direct subject relation object or array
  const directSub = Array.isArray(p.subject) ? p.subject[0] : p.subject
  if (directSub && directSub.name) return directSub

  // 2. Direct subject_id match
  if (p.subject_id) {
    const found = subjects.find((s) => s.id === p.subject_id)
    if (found) return found
  }

  // 3. Lecture relation object or array
  const lectureObj = Array.isArray(p.lecture) ? p.lecture[0] : p.lecture
  if (lectureObj) {
    const lecSub = Array.isArray(lectureObj.subject) ? lectureObj.subject[0] : lectureObj.subject
    if (lecSub && lecSub.name) return lecSub

    if (lectureObj.subject_id) {
      const found = subjects.find((s) => s.id === lectureObj.subject_id)
      if (found) return found
    }
  }

  return undefined
}

export default function PostList({
  posts,
  subjects,
  selectedSubject,
  fileTypeFilter = 'all',
  onImageClick,
  onPdfClick,
  currentUserId,
  isAdmin,
}: {
  posts: PostWithRelations[]
  subjects: Subject[]
  selectedSubject: string
  fileTypeFilter?: 'all' | 'image' | 'pdf'
  onImageClick: (url: string) => void
  onPdfClick: (url: string, title: string) => void
  currentUserId: string
  isAdmin: boolean
}) {
  const filteredPosts = posts.filter((p) => {
    const subjectObj = getPostSubject(p, subjects)
    const subjectName = subjectObj?.name || 'General'

    const matchesSubject =
      selectedSubject === 'All' ||
      subjectName.trim().toLowerCase() === selectedSubject.trim().toLowerCase() ||
      (subjectObj && subjects.find((s) => s.name.trim().toLowerCase() === selectedSubject.trim().toLowerCase())?.id === subjectObj.id)

    const isPdf = !!p.pdf_url || p.file_type === 'pdf'
    const isImage = !!p.image_url || p.file_type === 'image' || (!isPdf && !!p.image_url)

    let matchesType = true
    if (fileTypeFilter === 'image') matchesType = isImage
    if (fileTypeFilter === 'pdf') matchesType = isPdf

    return matchesSubject && matchesType
  })

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-center shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <FileQuestion size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 font-display">No notes found</h4>
          <p className="text-xs text-stone-500 max-w-xs">
            {selectedSubject !== 'All'
              ? `No notes uploaded for ${selectedSubject} yet.`
              : 'Be the first to upload handwritten notes or a PDF document!'}
          </p>
        </div>
      )}
      {filteredPosts.map((post) => (
        <PostCardComponent
          key={post.id}
          post={post}
          subjects={subjects}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onImageClick={onImageClick}
          onPdfClick={onPdfClick}
        />
      ))}
      <div className="pt-6 pb-2 text-center">
        <span className="text-[10px] font-mono-paper font-bold text-slate-400 tracking-wider uppercase">
          SIES_Notes • Dev <span className="text-orange-600 font-extrabold">@benpy606</span>
        </span>
      </div>
    </div>
  )
}
