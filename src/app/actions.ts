'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

  const clientPdfUrl = formData.get('pdfUrl') as string | null
  const clientImageUrlsRaw = formData.get('imageUrls') as string | null

  const imageUrls: string[] = []
  let imageUrl: string | null = null
  let pdfUrl: string | null = null

  if (clientPdfUrl && clientPdfUrl.trim().length > 0) {
    pdfUrl = clientPdfUrl.trim()
  }

  if (clientImageUrlsRaw && clientImageUrlsRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(clientImageUrlsRaw)
      if (Array.isArray(parsed)) {
        imageUrls.push(...parsed.map((u) => String(u)))
        imageUrl = imageUrls.join(',')
      }
    } catch {
      // invalid JSON
    }
  }

  // If client-side upload didn't provide pdfUrl or imageUrls, execute server-side upload fallback
  if (!pdfUrl && !imageUrl) {
    if (fileType === 'image' && imageFiles.length > 0) {
      for (const imgFile of imageFiles) {
        try {
          const ext = imgFile.name.split('.').pop() || 'webp'
          const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

          const arrayBuffer = await imgFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const { error: uploadError } = await supabase.storage
            .from('note-images')
            .upload(filePath, buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: imgFile.type || 'image/webp',
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
          console.error('Error processing image upload:', err)
        }
      }

      if (imageUrls.length > 0) {
        imageUrl = imageUrls.join(',')
      }
    } else if (fileType === 'pdf' && pdfFile && pdfFile.size > 0) {
      const cleanFileName = (pdfFile.name || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`

      const pdfArrayBuffer = await pdfFile.arrayBuffer()
      const pdfBuffer = Buffer.from(pdfArrayBuffer)

      let bucketName = 'note-pdfs'
      let uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, pdfBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf',
        })

      let uploadError = uploadResult.error

      if (uploadError) {
        console.warn('Uploading to note-pdfs bucket failed, attempting fallback to note-images bucket:', uploadError.message)
        bucketName = 'note-images'
        const fallbackResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, pdfBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf',
          })
        uploadError = fallbackResult.error
      }

      if (uploadError) {
        console.error('Failed uploading PDF to storage:', uploadError)
        throw new Error(`Failed to upload PDF file: ${uploadError.message || 'Storage error'}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      pdfUrl = publicUrl
    }
  }

  // Attempt direct post insertion with all fields
  const postPayload: Record<string, unknown> = {
    user_id: user.id,
    subject_id: subjectId,
    title: defaultTitle,
    image_url: imageUrl || pdfUrl, // Fallback image_url ensures PDFs render on legacy DB schemas
    image_urls: imageUrls,
    pdf_url: pdfUrl,
    file_type: fileType,
    caption: caption,
  }

  const { error: directInsertErr } = await supabase
    .from('posts')
    .insert(postPayload)

  if (directInsertErr) {
    console.warn('Direct post insert failed, attempting fallback insert:', directInsertErr.message)

    // Try without image_urls if array column missing
    const sanitizedPayload: Record<string, unknown> = {
      user_id: user.id,
      subject_id: subjectId,
      title: defaultTitle,
      image_url: imageUrl || pdfUrl,
      pdf_url: pdfUrl,
      file_type: fileType,
      caption: caption,
    }

    const { error: retryErr } = await supabase.from('posts').insert(sanitizedPayload)

    if (retryErr) {
      console.warn('Retry without image_urls failed, attempting minimal legacy insert:', retryErr.message)
      
      const legacyPayload: Record<string, unknown> = {
        user_id: user.id,
        image_url: imageUrl || pdfUrl,
        caption: caption,
      }

      const { error: legacyErr } = await supabase.from('posts').insert(legacyPayload)

      if (legacyErr) {
        throw new Error(legacyErr.message || retryErr.message || directInsertErr.message || 'Failed to save note post')
      }
    }
  }

  revalidatePath('/')
  return { success: true }
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/')
}

async function deleteStorageFile(publicUrlStr: string | null | undefined, supabase: ReturnType<typeof createClient>) {
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

  // 1. Safely query post ownership without failing if optional schema columns are absent
  const { data: basicPost, error: basicErr } = await supabase
    .from('posts')
    .select('id, user_id')
    .eq('id', postId)
    .maybeSingle()

  if (basicErr || !basicPost) {
    console.warn('Post not found or basic select error:', basicErr?.message)
    revalidatePath('/')
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isOwner = basicPost.user_id === user.id
  const isAdmin = profile?.is_admin === true

  if (!isOwner && !isAdmin) throw new Error('Not authorized to delete this post')

  // 2. Fetch associated file URLs safely
  const { data: mediaData } = await supabase
    .from('posts')
    .select('image_url, image_urls, pdf_url')
    .eq('id', postId)
    .maybeSingle()

  const imageUrl = mediaData?.image_url
  const imageUrls = mediaData?.image_urls
  const pdfUrl = mediaData?.pdf_url

  // 3. Delete dependent rows in upvotes table first (prevents FK constraint violation)
  try {
    await supabase.from('upvotes').delete().eq('post_id', postId)
  } catch (upvErr) {
    console.warn('Notice deleting related upvotes:', upvErr)
  }

  // 4. Delete the post row
  const { error: deleteErr } = await supabase.from('posts').delete().eq('id', postId)
  if (deleteErr) {
    console.error('Failed deleting post from database:', deleteErr.message)
    throw new Error(deleteErr.message || 'Failed to delete post')
  }

  // 5. Cleanup storage files in background safely
  try {
    const urlsToDelete: string[] = []
    if (Array.isArray(imageUrls)) {
      urlsToDelete.push(...imageUrls)
    }
    if (typeof imageUrl === 'string') {
      urlsToDelete.push(...imageUrl.split(',').map((s) => s.trim()))
    }
    if (pdfUrl) {
      urlsToDelete.push(pdfUrl)
    }

    const uniqueUrls = Array.from(new Set(urlsToDelete.filter(Boolean)))
    for (const url of uniqueUrls) {
      await deleteStorageFile(url, supabase)
    }
  } catch (stErr) {
    console.warn('Non-fatal storage cleanup notice:', stErr)
  }

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
