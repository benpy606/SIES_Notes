'use client'

import { useState, useEffect, useRef } from 'react'
import { createPost } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'
import { compressImage } from '@/lib/compressor'
import { X, Upload, FileText, Image as ImageIcon, Check, Sparkles, Plus, Layers } from 'lucide-react'
import Image from 'next/image'

type Subject = {
  id: string
  name: string
  color_code: string
}

type SelectedImage = {
  id: string
  file: File
  preview: string
}

export default function UploadModal({
  isOpen,
  onClose,
  subjects = [],
  defaultSubject,
}: {
  isOpen: boolean
  onClose: () => void
  subjects?: Subject[]
  defaultSubject?: string
}) {
  const safeSubjects = Array.isArray(subjects) ? subjects : []

  const [subjectId, setSubjectId] = useState<string>(() => {
    return safeSubjects.find((s) => s?.name === defaultSubject)?.id || ''
  })

  function formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image')
  
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatusText, setUploadStatusText] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus()
      setSubjectId('')
      setTitle('')
      setCaption('')
      setSelectedImages([])
      setPdfFile(null)
      setError(null)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const MAX_IMAGES = 5

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)

    const currentCount = selectedImages.length
    if (currentCount >= MAX_IMAGES) {
      setError(`Maximum limit of ${MAX_IMAGES} photos per post reached.`)
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }

    setIsCompressing(true)

    const availableSlots = MAX_IMAGES - currentCount
    const filesToProcess = Array.from(files).slice(0, availableSlots)

    if (files.length > availableSlots) {
      setError(`Only ${availableSlots} more photo(s) added. Maximum limit is ${MAX_IMAGES} photos per post.`)
    }

    const newItems: SelectedImage[] = []
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i]
      const preview = URL.createObjectURL(file)
      newItems.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview,
      })
    }

    setSelectedImages((prev) => [...prev, ...newItems])
    setIsCompressing(false)

    // Reset input value so the same file can be re-selected if needed
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      // Revoke memory URL for removed item
      const removedItem = prev.find((img) => img.id === id)
      if (removedItem) URL.revokeObjectURL(removedItem.preview)
      return filtered
    })
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file')
      return
    }
    setPdfFile(file)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const activeSubjectId = subjectId || safeSubjects[0]?.id || ''
    if (!activeSubjectId) {
      setError('Please select a subject')
      return
    }

    if (fileType === 'image' && selectedImages.length === 0) {
      setError('Please attach at least one note photo')
      return
    }

    if (fileType === 'pdf' && !pdfFile) {
      setError('Please select a PDF file to upload')
      return
    }

    setSaving(true)
    setError(null)
    setUploadProgress(10)
    setUploadStatusText('Preparing note upload...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to upload notes.')

      const formData = new FormData()
      formData.set('subjectId', activeSubjectId)
      formData.set('title', title.trim())
      formData.set('caption', caption.trim())
      formData.set('fileType', fileType)

      let uploadedPdfUrl: string | null = null
      const uploadedImageUrls: string[] = []

      // 1. Direct Client-to-Supabase Storage Upload for PDF
      if (fileType === 'pdf' && pdfFile) {
        setUploadStatusText('Uploading PDF document...')
        setUploadProgress(35)

        const cleanFileName = (pdfFile.name || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${user.id}/${Date.now()}_${cleanFileName}`

        // Try uploading to 'note-pdfs' bucket
        let bucketUsed = 'note-pdfs'
        let { error: storageErr } = await supabase.storage
          .from(bucketUsed)
          .upload(filePath, pdfFile, { cacheControl: '3600', upsert: false, contentType: 'application/pdf' })

        if (storageErr) {
          console.warn('note-pdfs bucket failed, falling back to note-images:', storageErr.message)
          bucketUsed = 'note-images'
          const fallbackRes = await supabase.storage
            .from(bucketUsed)
            .upload(filePath, pdfFile, { cacheControl: '3600', upsert: false, contentType: 'application/pdf' })
          storageErr = fallbackRes.error
        }

        if (storageErr) {
          throw new Error(`Storage Upload Failed: ${storageErr.message || 'Failed to upload PDF'}`)
        }

        const { data: pubData } = supabase.storage.from(bucketUsed).getPublicUrl(filePath)
        uploadedPdfUrl = pubData.publicUrl
        formData.set('pdfUrl', uploadedPdfUrl)
        setUploadProgress(75)
      }

      // 2. Direct Client-to-Supabase Storage Upload for Images
      if (fileType === 'image' && selectedImages.length > 0) {
        const total = selectedImages.length
        for (let i = 0; i < total; i++) {
          const item = selectedImages[i]
          setUploadStatusText(`Compressing & uploading page ${i + 1} of ${total}...`)
          setUploadProgress(15 + Math.floor(((i + 1) / total) * 60))

          let fileBlob: Blob = item.file
          try {
            fileBlob = await compressImage(item.file)
          } catch {
            fileBlob = item.file
          }

          const ext = item.file.name.split('.').pop() || 'webp'
          const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

          const { error: imgErr } = await supabase.storage
            .from('note-images')
            .upload(filePath, fileBlob, { cacheControl: '3600', upsert: false })

          if (!imgErr) {
            const { data: pubData } = supabase.storage.from('note-images').getPublicUrl(filePath)
            uploadedImageUrls.push(pubData.publicUrl)
          } else {
            // Fall back to sending raw image in formData if direct storage upload failed
            formData.append('images', item.file)
          }
        }

        if (uploadedImageUrls.length > 0) {
          formData.set('imageUrls', JSON.stringify(uploadedImageUrls))
        }
      }

      setUploadStatusText('Publishing to SIES Notes Vault...')
      setUploadProgress(85)
      await createPost(formData)
      setUploadProgress(100)
      onClose()
      setSubjectId('')
      setTitle('')
      setCaption('')
      setSelectedImages([])
      setPdfFile(null)
    } catch (err: unknown) {
      console.error('Upload note error:', err)
      const errObj = err as Record<string, unknown>
      let msg =
        (errObj?.message as string) ||
        (typeof err === 'string'
          ? err
          : typeof err === 'object' && err !== null
          ? (errObj?.error_description as string) || (errObj?.msg as string) || JSON.stringify(err)
          : 'Upload failed')

      if (msg.includes('Server Components render') || msg.includes('omitted in production')) {
        msg = 'Upload failed. Please check your network connection or try a smaller file.'
      }

      setError(msg)
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121215] text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-zinc-800 animate-pop-in"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black">
              <Sparkles size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="font-display font-black text-lg text-white leading-none">Upload Class Note</h3>
              <p className="text-[11px] text-zinc-400 font-bold mt-1">Share single or multi-page handwritten notes or PDFs</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors duration-200 border border-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot Fields for Spam Protection */}
          <div className="hidden aria-hidden=true" tabIndex={-1}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            <input type="text" name="botField" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          {/* Format Selector */}
          <div>
            <label className="block text-[10px] font-black text-[#F59E0B] uppercase tracking-widest mb-1.5 font-mono-paper">
              Note Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setFileType('image')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors duration-200 ${
                  fileType === 'image'
                    ? 'bg-[#3B82F6] text-white shadow-md scale-[1.01]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon size={14} className="stroke-[2.5]" />
                <span>Image Note(s)</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('pdf')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors duration-200 ${
                  fileType === 'pdf'
                    ? 'bg-[#3B82F6] text-white shadow-md scale-[1.01]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText size={14} className="stroke-[2.5]" />
                <span>PDF Document</span>
              </button>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent shadow-inner transition-colors duration-200"
              required
            >
              <option value="" disabled className="bg-[#121215] text-zinc-400">Select a subject...</option>
              {safeSubjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121215] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title / Topic */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Topic / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Trees, Chapter 3"
              className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs font-bold text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-inner transition-colors duration-200"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Description / Remarks
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-inner transition-colors duration-200"
              placeholder="Add key highlights or tips..."
            />
          </div>

          {/* Multi-Image Upload Area */}
          {fileType === 'image' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono-paper">
                  Attach Note Photos *
                </label>
                {selectedImages.length > 0 && (
                  <span className="text-[10px] font-bold text-[#F59E0B] font-mono-paper flex items-center gap-1">
                    <Layers size={11} />
                    {selectedImages.length} / {MAX_IMAGES} Pages Selected
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="image-file-input"
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />

              {selectedImages.length === 0 ? (
                <label
                  htmlFor="image-file-input"
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[#3B82F6] bg-black/50 hover:bg-[#121215] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 hover-bounce group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={20} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-white">Choose Note Images</span>
                  <span className="text-[10px] text-zinc-400 font-medium">Select up to 5 photos per note post</span>
                </label>
              ) : (
                <div className="space-y-3">
                  {/* Selected Thumbnail Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 bg-black/40 rounded-2xl border border-zinc-800/80">
                    {selectedImages.map((img, idx) => (
                      <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 shadow-md group">
                        <Image src={img.preview} alt={`Page ${idx + 1}`} fill unoptimized className="object-cover" />
                        <div className="absolute top-1 left-1 bg-black/90 text-[#F59E0B] text-[9px] font-black px-1.5 py-0.5 rounded-md border border-zinc-800">
                          P{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-lg border border-black transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          title="Remove photo"
                          aria-label={`Remove photo ${idx + 1}`}
                        >
                          <X size={10} className="stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {selectedImages.length < MAX_IMAGES && (
                    <label
                      htmlFor="image-file-input"
                      className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-[#3B82F6] bg-black text-zinc-400 hover:text-white hover-bounce text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                    >
                      <Plus size={14} className="text-[#3B82F6] stroke-[3]" />
                      <span>Add More Pages</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PDF Input */}
          {fileType === 'pdf' && (
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 font-mono-paper">
                Attach PDF Document *
              </label>

              <input
                id="pdf-file-input"
                type="file"
                ref={pdfInputRef}
                onChange={handlePdfChange}
                accept="application/pdf"
                className="hidden"
              />

              {!pdfFile ? (
                <label
                  htmlFor="pdf-file-input"
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[#3B82F6] bg-black/50 hover:bg-[#121215] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 hover-bounce group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={20} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-white">Choose PDF Document</span>
                  <span className="text-[10px] text-zinc-400 font-medium">Upload handwritten or typed PDF notes</span>
                </label>
              ) : (
                <div className="p-4 rounded-2xl bg-black border border-zinc-800 text-white flex items-center justify-between gap-3 shadow-lg animate-pop-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center shrink-0 shadow-xs">
                      <FileText size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold text-white truncate max-w-[170px] sm:max-w-[230px] font-display">
                        {pdfFile.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono-paper font-black text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-md border border-[#F59E0B]/20">
                          {formatFileSize(pdfFile.size)}
                        </span>
                        <span className="text-[10px] text-[#10B981] font-bold flex items-center gap-1 font-mono-paper">
                          <Check size={11} className="stroke-[3]" /> Ready to Publish
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null)
                      if (pdfInputRef.current) pdfInputRef.current.value = ''
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    title="Remove PDF"
                    aria-label="Remove PDF"
                  >
                    <X size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          )}

          {saving && (
            <div className="space-y-2 pt-2 animate-fade-in" aria-live="polite">
              <div className="flex justify-between items-center text-[10px] font-mono-paper font-black">
                <span className="text-[#3B82F6] uppercase tracking-widest">{uploadStatusText}</span>
                <span className="text-zinc-400">{uploadProgress}%</span>
              </div>
              <div
                className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-zinc-800 p-0.5 shadow-inner"
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
              >
                <div
                  className="h-full bg-[#3B82F6] rounded-full transition-all duration-300 progress-animated-striped shadow-md"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || isCompressing}
            className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors duration-200 disabled:opacity-50 shadow-lg hover-bounce"
          >
            {saving ? (
              <span>Publishing Note... ({uploadProgress}%)</span>
            ) : (
              <>
                <Check size={16} className="stroke-[3]" />
                <span>Publish Note ({fileType === 'image' ? `${selectedImages.length} ${selectedImages.length === 1 ? 'Page' : 'Pages'}` : 'PDF'})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
