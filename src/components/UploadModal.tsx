'use client'

import { useState, useEffect, useRef } from 'react'
import { createPost } from '@/app/actions'
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
    return safeSubjects.find((s) => s?.name === defaultSubject)?.id || safeSubjects[0]?.id || ''
  })
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image')
  
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus()
      const match = safeSubjects.find((s) => s?.name === defaultSubject)?.id || safeSubjects[0]?.id || ''
      if (match && (!subjectId || !safeSubjects.some((s) => s.id === subjectId))) {
        setSubjectId(match)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, subjects, defaultSubject])

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

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatusText, setUploadStatusText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId) {
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
    setUploadProgress(15)
    setUploadStatusText('Preparing note files...')

    try {
      const formData = new FormData()
      formData.set('subjectId', subjectId)
      formData.set('title', title || 'Class Note')
      formData.set('caption', caption)
      formData.set('fileType', fileType)

      if (fileType === 'image') {
        const total = selectedImages.length
        for (let i = 0; i < total; i++) {
          const item = selectedImages[i]
          setUploadStatusText(`Compressing page ${i + 1} of ${total}...`)
          setUploadProgress(20 + Math.floor(((i + 1) / total) * 50))
          try {
            const compressed = await compressImage(item.file)
            formData.append('images', compressed)
          } catch {
            formData.append('images', item.file)
          }
        }
      } else if (fileType === 'pdf' && pdfFile) {
        setUploadStatusText('Processing PDF document...')
        setUploadProgress(50)
        formData.set('pdf', pdfFile)
      }

      setUploadStatusText('Publishing to SIES Notes Vault...')
      setUploadProgress(85)
      await createPost(formData)
      setUploadProgress(100)
      onClose()
      setTitle('')
      setCaption('')
      setSelectedImages([])
      setPdfFile(null)
    } catch (err: any) {
      const msg =
        err?.message ||
        (typeof err === 'string'
          ? err
          : typeof err === 'object' && err !== null
          ? err.error_description || err.msg || JSON.stringify(err)
          : 'Upload failed')
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
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div className="w-full max-w-lg bg-slate-950 text-slate-100 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-800 animate-pop-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Sparkles size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="font-display font-black text-lg text-slate-50 leading-none">Upload Class Note</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Share single or multi-page handwritten notes or PDFs</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 focus-visible:ring-2 focus-visible:ring-amber-400"
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
          {/* Format Selector */}
          <div>
            <label className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Note Format
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFileType('image')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  fileType === 'image'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon size={14} className="stroke-[2.5]" />
                <span>Image Note(s)</span>
              </button>
              <button
                type="button"
                onClick={() => setFileType('pdf')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  fileType === 'pdf'
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={14} className="stroke-[2.5]" />
                <span>PDF Document</span>
              </button>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-3 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-inner"
              required
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select Subject...</option>
              {safeSubjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title / Topic */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Topic / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Trees, Chapter 3"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono-paper">
              Description / Remarks
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              placeholder="Add key highlights or tips..."
            />
          </div>

          {/* Multi-Image Upload Area */}
          {fileType === 'image' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono-paper">
                  Attach Note Photos *
                </label>
                {selectedImages.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-400 font-mono-paper flex items-center gap-1">
                    <Layers size={11} />
                    {selectedImages.length} / {MAX_IMAGES} Pages Selected
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />

              {selectedImages.length === 0 ? (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-400/80 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all hover-bounce group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={20} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-200">Choose Note Images</span>
                  <span className="text-[10px] text-slate-500 font-medium">Select up to 5 photos per note post</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Selected Thumbnail Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                    {selectedImages.map((img, idx) => (
                      <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 shadow-md group">
                        <Image src={img.preview} alt={`Page ${idx + 1}`} fill unoptimized className="object-cover" />
                        <div className="absolute top-1 left-1 bg-slate-950/90 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-slate-800">
                          P{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-lg border border-slate-900 transition-transform hover:scale-110"
                          title="Remove photo"
                        >
                          <X size={10} className="stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={selectedImages.length >= MAX_IMAGES}
                    onClick={() => imageInputRef.current?.click()}
                    className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedImages.length >= MAX_IMAGES
                        ? 'border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                        : 'border-slate-700 hover:border-amber-400 bg-slate-900 text-slate-300 hover:text-white hover-bounce'
                    }`}
                  >
                    <Plus size={14} className={selectedImages.length >= MAX_IMAGES ? 'text-slate-600' : 'text-amber-400 stroke-[3]'} />
                    <span>{selectedImages.length >= MAX_IMAGES ? `Max ${MAX_IMAGES} Photos Reached` : 'Add More Pages'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PDF Input */}
          {fileType === 'pdf' && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono-paper">
                Attach PDF Document *
              </label>
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm hover-bounce"
                >
                  <Upload size={16} className="text-amber-400 stroke-[2.5]" />
                  Select PDF
                </button>
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfChange}
                  accept="application/pdf"
                  className="hidden"
                />
                {pdfFile && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-bold">
                    <FileText size={16} className="text-amber-400 shrink-0 stroke-[2.5]" />
                    <span className="max-w-[130px] truncate font-mono-paper">{pdfFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {saving && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <div className="flex justify-between items-center text-[10px] font-mono-paper font-black">
                <span className="text-amber-400 uppercase tracking-widest">{uploadStatusText}</span>
                <span className="text-slate-300">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-300 progress-animated-striped shadow-md"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || isCompressing}
            className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 hover:from-orange-500 hover:to-rose-500 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-600/30 hover-bounce"
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
