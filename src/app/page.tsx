import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Feed from '@/components/Feed'

export const metadata: Metadata = {
  title: 'SIES_Notes — Classroom Social Tracker',
  description: 'Classroom notes social tracker for BScIT, SIES Nerul.',
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
  let subjects: any[] = []
  let posts: any[] = []

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
    subjects = subs || []

    // 3. Fetch raw posts with nested objects or simple select
    let rawPosts: any[] = []
    
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
      rawPosts = pst
    } else {
      console.warn('Nested post query warning:', postErr?.message)
      // Fallback: simple post select if foreign key relations fail
      const { data: simplePosts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      rawPosts = simplePosts || []
    }

    // 4. Enrich author profiles for all fetched posts
    const userIds = Array.from(new Set(rawPosts.map((p) => p.user_id).filter(Boolean)))
    let profilesMap: Record<string, any> = {}
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
    const lectureIds = Array.from(new Set(rawPosts.map((p) => p.lecture_id).filter(Boolean)))
    let lecturesMap: Record<string, any> = {}
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

      const subjectObj =
        p.subject ||
        subjectsMap[p.subject_id] ||
        p.lecture?.subject ||
        lecturesMap[p.lecture_id]?.subject ||
        (p.lecture_id ? subjectsMap[lecturesMap[p.lecture_id]?.subject_id] : null)

      const lectureObj = p.lecture || lecturesMap[p.lecture_id]

      return {
        ...p,
        profiles: author,
        subject: subjectObj,
        lecture: lectureObj,
        upvotes: p.upvotes || [{ count: 0 }],
      }
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
