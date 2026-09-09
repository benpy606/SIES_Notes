'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { compressImage } from '@/lib/compressor'

export async function createPost(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const caption = (formData.get('caption') as string) || ''
  const subjectId = formData.get('subjectId') as string
  const userTitle = (formData.get('title') as string) || ''
  const fileType = (formData.get('fileType') as string) || 'image' // 'image' | 'pdf'
  
  // Extract all attached images or single image file (capped at max 5 photos)
  const rawImageFiles = formData.getAll('images') as File[]
  const singleImage = formData.get('image') as File | null
  const extractedFiles = rawImageFiles.filter((f) => f && f.size > 0).length > 0
    ? rawImageFiles.filter((f) => f && f.size > 0)
    : singleImage && singleImage.size > 0
    ? [singleImage]
    : []
  const imageFiles = extractedFiles.slice(0, 5)

  const pdfFile = formData.get('pdf') as File | null

  if (!subjectId) throw new Error('Please select a subject')

  // Resolve subject name for a clean title fallback
  const { data: subObj } = await supabase
    .from('subjects')
    .select('name')
    .eq('id', subjectId)
    .maybeSingle()

  const defaultTitle = userTitle.trim() || caption.trim().slice(0, 35) || (subObj ? `${subObj.name} Note` : 'Class Note')

  let imageUrls: string[] = []
  let imageUrl: string | null = null
  let pdfUrl: string | null = null

  if (fileType === 'image' && imageFiles.length > 0) {
    for (const imgFile of imageFiles) {
      try {
        const compressed = await compressImage(imgFile)
        const ext = compressed.name.split('.').pop() || 'webp'
        const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('note-images')
          .upload(filePath, compressed, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Failed uploading single image in multi-image batch:', uploadError)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('note-images')
          .getPublicUrl(filePath)

        imageUrls.push(publicUrl)
      } catch (err) {
        console.error('Error processing image compression/upload:', err)
      }
    }

    if (imageUrls.length > 0) {
      imageUrl = imageUrls[0]
    }
  } else if (fileType === 'pdf' && pdfFile && pdfFile.size > 0) {
    const filePath = `${user.id}/${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Try uploading to 'note-pdfs' bucket first
    let bucketName = 'note-pdfs'
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      })

    // If 'note-pdfs' bucket not found, fallback to uploading to 'note-images' bucket
    if (uploadError && (uploadError.message?.toLowerCase().includes('bucket not found') || (uploadError as any).statusCode === '404')) {
      console.warn('note-pdfs bucket not found in Supabase, falling back to note-images bucket')
      bucketName = 'note-images'
      const fallbackResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, pdfFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        })
      uploadError = fallbackResult.error
    }

    if (uploadError) throw new Error(uploadError.message || 'Failed to upload PDF file')

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    pdfUrl = publicUrl
  }

  // Attempt direct post insertion
  const postPayload: Record<string, any> = {
    user_id: user.id,
    subject_id: subjectId,
    title: defaultTitle,
    image_url: imageUrl,
    image_urls: imageUrls,
    pdf_url: pdfUrl,
    file_type: fileType,
    caption: caption,
  }

  const { error: directInsertErr } = await supabase
    .from('posts')
    .insert(postPayload)

  // If direct insertion failed (e.g. image_urls / subject_id / pdf_url columns missing in remote DB)
  if (directInsertErr) {
    console.warn('Direct post insert failed, attempting fallback insert:', directInsertErr.message)

    // Try without image_urls if column missing
    delete postPayload.image_urls
    const { error: retryErr } = await supabase.from('posts').insert(postPayload)

    if (retryErr) {
      console.warn('Retry without image_urls failed, creating fallback lecture slot:', retryErr.message)
      const today = new Date().toISOString().split('T')[0]
      let lectureId: string | null = null

      // Create a new lecture slot with the custom title as topic
      const { data: newLecture, error: lecErr } = await supabase
        .from('lectures')
        .insert({
          subject_id: subjectId,
          date: today,
          lecture_number: Math.floor(Date.now() / 1000) % 10000,
          topic: defaultTitle,
        })
        .select('id')
        .single()

      if (!lecErr && newLecture) {
        lectureId = newLecture.id
      } else {
        const { data: existing } = await supabase
          .from('lectures')
          .select('id')
          .eq('subject_id', subjectId)
          .limit(1)
          .maybeSingle()
        if (existing) lectureId = existing.id
      }

      // Preserve media URL (image or PDF) in image_url so attachments are NEVER lost on legacy schema
      const mediaUrl = imageUrl || pdfUrl

      const fallbackPayload: Record<string, any> = {
        user_id: user.id,
        image_url: mediaUrl,
        caption: caption,
      }
      if (lectureId) fallbackPayload.lecture_id = lectureId

      const { error: fallbackErr } = await supabase
        .from('posts')
        .insert(fallbackPayload)

      if (fallbackErr) {
        throw new Error(fallbackErr.message || directInsertErr.message || 'Failed to save note')
      }
    }
  }

  revalidatePath('/')
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/')
}

async function deleteStorageFile(publicUrlStr: string | null | undefined, supabase: any) {
  if (!publicUrlStr) return
  try {
    const url = new URL(publicUrlStr)
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
    if (match) {
      const bucketName = match[1]
      const filePath = match[2]
      await supabase.storage.from(bucketName).remove([filePath])
    }
  } catch (err) {
    console.error('Failed to remove file from Supabase storage:', err)
  }
}

export async function deletePost(postId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: post } = await supabase
    .from('posts')
    .select('id, user_id, image_url, image_urls, pdf_url')
    .eq('id', postId)
    .maybeSingle()

  if (!post) {
    // Post has already been deleted; revalidate feed and return cleanly
    revalidatePath('/')
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isOwner = post.user_id === user.id
  const isAdmin = profile?.is_admin === true

  if (!isOwner && !isAdmin) throw new Error('Not authorized')

  // Remove files from Supabase storage buckets
  if (Array.isArray(post.image_urls) && post.image_urls.length > 0) {
    for (const url of post.image_urls) {
      await deleteStorageFile(url, supabase)
    }
  } else if (post.image_url) {
    await deleteStorageFile(post.image_url, supabase)
  }

  if (post.pdf_url) {
    await deleteStorageFile(post.pdf_url, supabase)
  }

  // Remove post from database
  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/')
}

export async function togglePinPost(postId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized as admin')

  const { data: post } = await supabase
    .from('posts')
    .select('id, is_pinned')
    .eq('id', postId)
    .maybeSingle()

  if (post) {
    const nextPinnedState = !post.is_pinned
    await supabase.from('posts').update({ is_pinned: nextPinnedState }).eq('id', postId)
  }
  revalidatePath('/')
}

export async function toggleVerifyPost(postId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized as admin')

  const { data: post } = await supabase
    .from('posts')
    .select('id, is_verified')
    .eq('id', postId)
    .maybeSingle()

  if (post) {
    const nextVerifiedState = !post.is_verified
    await supabase.from('posts').update({ is_verified: nextVerifiedState }).eq('id', postId)
  }
  revalidatePath('/')
}

export async function toggleUpvote(postId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('upvotes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    await supabase.from('upvotes').delete().eq('id', existing.id)
  } else {
    const { error: upvoteError } = await supabase.from('upvotes').insert({ user_id: user.id, post_id: postId })
    if (upvoteError && upvoteError.code !== '23505') throw upvoteError
  }

  revalidatePath('/')
}

export async function populateLectureSlots(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized')

  const subjectId = formData.get('subjectId') as string
  const date = formData.get('date') as string
  const topic = (formData.get('topic') as string) || 'General'

  const { error } = await supabase
    .from('lectures')
    .upsert({
      subject_id: subjectId,
      date,
      lecture_number: 1,
      topic,
    }, {
      onConflict: 'subject_id,date,lecture_number',
    })

  if (error) throw error

  revalidatePath('/')
}

export async function createLecture(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized')

  const subjectId = formData.get('subjectId') as string
  const date = formData.get('date') as string
  const lectureNumber = parseInt((formData.get('lectureNumber') as string) || '1')
  const topic = (formData.get('topic') as string) || 'General'

  const { error } = await supabase
    .from('lectures')
    .upsert({
      subject_id: subjectId,
      date,
      lecture_number: lectureNumber,
      topic,
    }, {
      onConflict: 'subject_id,date,lecture_number',
    })

  if (error) throw error

  revalidatePath('/')
}

const VIBRANT_SUBJECT_COLORS = [
  '#818CF8',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#F97316',
]

function randomMutedColor(): string {
  return VIBRANT_SUBJECT_COLORS[Math.floor(Math.random() * VIBRANT_SUBJECT_COLORS.length)]
}

export async function createSubject(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Not authorized')

  const name = formData.get('name') as string
  if (!name || !name.trim()) throw new Error('Subject name is required')

  const { data, error } = await supabase
    .from('subjects')
    .upsert({
      name: name.trim(),
      color_code: randomMutedColor(),
    }, {
      onConflict: 'name',
    })
    .select('id, name, color_code')
    .single()

  if (error) throw error

  revalidatePath('/')
  return data
}
