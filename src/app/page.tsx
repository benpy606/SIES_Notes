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

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch {
    // Supabase unreachable or invalid
  }

  if (!session) {
    redirect('/login')
  }

  let profile = null
  let subjects: SubjectModel[] = []
  let posts: PostModel[] = []

  try {
    // 1. Fetch current profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
    profile = prof

    // 2. Fetch subjects
    const { data: subs } = await supabase
      .from('subjects')
      .select('*')
      .order('name')
    subjects = (subs as SubjectModel[]) || []

    // 3. Fetch raw posts with nested objects or simple select
    let rawPosts: PostModel[] = []
    
    // Try nested query first
    const { data: pst, error: postErr } = await supabase
      .from('posts')
      .select(`
        *,
        subject:subjects(*),
        lecture:lectures(*, subject:subjects(*)),
        upvotes:upvotes(count)
      `)
      .order('created_at', { ascending: false })

    if (pst && !postErr) {
      rawPosts = pst as PostModel[]
    } else {
      console.warn('Nested post query warning:', postErr?.message)
      // Fallback: simple post select if foreign key relations fail
      const { data: simplePosts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      rawPosts = (simplePosts as PostModel[]) || []
    }

    // 4. Enrich author profiles for all fetched posts
    const userIds = Array.from(new Set(rawPosts.map((p) => p.user_id).filter(Boolean)))
    let profilesMap: Record<string, { id: string; full_name: string; is_admin: boolean }> = {}
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
      if (profs) {
        profilesMap = Object.fromEntries(profs.map((pr) => [pr.id, pr]))
      }
    }

    // 5. Enrich subjects for posts missing subject object
    const subjectsMap = Object.fromEntries(subjects.map((s) => [s.id, s]))

    // 6. Enrich lectures if needed
    const lectureIds = Array.from(new Set(rawPosts.map((p) => p.lecture_id).filter(Boolean))) as string[]
    let lecturesMap: Record<string, { id: string; subject_id?: string; subject?: SubjectModel }> = {}
    if (lectureIds.length > 0) {
      const { data: lecs } = await supabase
        .from('lectures')
        .select('*, subject:subjects(*)')
        .in('id', lectureIds)
      if (lecs) {
        lecturesMap = Object.fromEntries(lecs.map((l) => [l.id, l]))
      }
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
        upvotes: p.upvotes || [{ count: 0 }],
      } as PostModel
    })
  } catch (err) {
    console.error('Error assembling feed posts:', err)
  }

  return (
    <Feed
      profile={
        profile || {
          id: session.user.id,
          full_name: session.user.email || 'Student',
          is_admin: false,
        }
      }
      subjects={subjects}
      posts={posts}
    />
  )
}
