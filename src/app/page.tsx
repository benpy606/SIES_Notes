import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Feed from '@/components/Feed'

export const metadata: Metadata = {
  title: 'SIES_Notes — Classroom Social Tracker',
  description: 'Classroom notes social tracker for BScIT, SIES Nerul.',
}

type SubjectModel = {
  id: string
  name: string
  color_code: string
}

type PostModel = {
  id: string
  user_id: string
  subject_id?: string
  lecture_id?: string
  title?: string
  image_url?: string | null
  image_urls?: string[] | null
  pdf_url?: string | null
  file_type?: string
  caption?: string
  created_at: string
  subject?: SubjectModel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lecture?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any
  upvotes: { count: number }[]
}

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let userId: string | null = null
  let userEmail: string | null = null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      userEmail = user.email || null
    }
  } catch (authErr) {
    console.warn('Auth user check notice:', authErr)
  }

  if (!userId) {
    redirect('/login')
  }

  let profile = null
  let subjects: SubjectModel[] = []
  let posts: PostModel[] = []

  try {
    // 1. Concurrently fetch profile, subjects, and posts in parallel
    const [profileRes, subjectsRes, postsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, is_admin')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('subjects')
        .select('id, name, color_code')
        .order('name'),
      supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    profile = profileRes.data
    subjects = (subjectsRes.data as SubjectModel[]) || []

    if (postsRes.error) {
      console.error('Error fetching posts:', postsRes.error.message)
    }

    const rawPosts: PostModel[] = (postsRes.data as PostModel[]) || []

    const postIds = rawPosts.map((p) => p.id).filter(Boolean)
    const userIds = Array.from(new Set(rawPosts.map((p) => p.user_id).filter(Boolean)))
    const lectureIds = Array.from(new Set(rawPosts.map((p) => p.lecture_id).filter(Boolean))) as string[]

    // 2. Concurrently fetch upvotes, author profiles, and lectures in parallel
    const [upvotesRes, profilesRes, lecturesRes] = await Promise.all([
      postIds.length > 0
        ? supabase.from('upvotes').select('post_id').in('post_id', postIds)
        : Promise.resolve({ data: null }),
      userIds.length > 0
        ? supabase.from('profiles').select('id, full_name, is_admin').in('id', userIds)
        : Promise.resolve({ data: null }),
      lectureIds.length > 0
        ? supabase.from('lectures').select('id, subject_id, date, lecture_number, topic, subject:subjects(id, name, color_code)').in('id', lectureIds)
        : Promise.resolve({ data: null }),
    ])

    // Build upvotes count map
    const upvotesCountMap: Record<string, number> = {}
    if (upvotesRes.data) {
      upvotesRes.data.forEach((uv) => {
        if (uv.post_id) {
          upvotesCountMap[uv.post_id] = (upvotesCountMap[uv.post_id] || 0) + 1
        }
      })
    }

    // Build profiles map
    let profilesMap: Record<string, { id: string; full_name: string; is_admin: boolean }> = {}
    if (profilesRes.data) {
      profilesMap = Object.fromEntries(profilesRes.data.map((pr) => [pr.id, pr]))
    }

    // Build subjects map
    const subjectsMap = Object.fromEntries(subjects.map((s) => [s.id, s]))

    // Build lectures map
    let lecturesMap: Record<string, { id: string; subject_id?: string; subject?: SubjectModel }> = {}
    if (lecturesRes.data) {
      lecturesMap = Object.fromEntries(lecturesRes.data.map((l) => [l.id, l]))
    }

    // Combine enriched post models
    posts = rawPosts.map((p) => {
      const author = p.profiles || profilesMap[p.user_id] || {
        id: p.user_id,
        full_name: 'Student',
        is_admin: false,
      }

      const lecId = p.lecture_id
      const subId = p.subject_id
      const lecObj = p.lecture as { subject?: SubjectModel; subject_id?: string } | undefined

      const subjectObj =
        p.subject ||
        (subId ? subjectsMap[subId] : null) ||
        lecObj?.subject ||
        (lecId ? lecturesMap[lecId]?.subject : null) ||
        (lecId && lecturesMap[lecId]?.subject_id ? subjectsMap[lecturesMap[lecId].subject_id!] : null)

      const lectureObj = p.lecture || (lecId ? lecturesMap[lecId] : null)

      return {
        ...p,
        profiles: author,
        subject: subjectObj,
        lecture: lectureObj,
        upvotes: [{ count: upvotesCountMap[p.id] ?? 0 }],
      } as PostModel
    })
  } catch (err) {
    console.error('Error assembling feed posts:', err)
  }

  return (
    <Feed
      profile={
        profile || {
          id: userId!,
          full_name: userEmail || 'Student',
          is_admin: false,
        }
      }
      subjects={subjects}
      posts={posts}
    />
  )
}
