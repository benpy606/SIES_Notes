'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/app/actions'
import { compressImage } from '@/lib/compressor'
import { X, Upload, FileText, Image as ImageIcon, Check, Sparkles } from 'lucide-react'
import Image from 'next/image'

type Subject = {
  id: string
  name: string
  color_code: string
}

export default function UploadModal({
  isOpen,
  onClose,
  subjects,
  defaultSubject,
}: {
  isOpen: boolean
  onClose: () => void
  subjects: Subject[]
  defaultSubject?: string
}) {
  const initialSubjectId =
    subjects.find((s) => s.name === defaultSubject)?.id || subjects[0]?.id || ''

  const [subjectId, setSubjectId] = useState(initialSubjectId)
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRawFile(file)
    setError(null)

    // Render preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const compressed = await compressImage(file)
      setImageFile(compressed)
    } catch {
      setImageFile(file)
    }
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
    if (!subjectId) {
      setError('Please select a subject')
      return
    }

    const fileToUpload = imageFile || rawFile
    if (fileType === 'image' && !fileToUpload) {
      setError('Please attach an image photo for your note')
      return
    }

    if (fileType === 'pdf' && !pdfFile) {
      setError('Please select a PDF file to upload')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('subjectId', subjectId)
      formData.set('title', title || 'Class Note')
      formData.set('caption', caption)
      formData.set('fileType', fileType)

      if (fileType === 'image' && fileToUpload) {
        formData.set('image', fileToUpload)
      } else if (fileType === 'pdf' && pdfFile) {
        formData.set('pdf', pdfFile)
      }

      await createPost(formData)
      onClose()
      setTitle('')
      setCaption('')
      setImageFile(null)
      setRawFile(null)
      setImagePreview(null)
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
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-950 text-slate-100 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-800 animate-pop-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Sparkles size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-50 leading-none">Upload Class Note</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Share handwritten notes or PDFs with your cohort</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
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
                <span>Image Note</span>
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
              {subjects.map((s) => (
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

          {/* Image Input */}
          {fileType === 'image' && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono-paper">
                Attach Note Image *
              </label>
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm hover-bounce"
                >
                  <Upload size={16} className="text-amber-400 stroke-[2.5]" />
                  Choose Photo
                </button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview && (
                  <div className="w-14 h-14 rounded-2xl border-2 border-amber-400 overflow-hidden relative shadow-md">
                    <Image src={imagePreview} className="w-full h-full object-cover" alt="Preview" unoptimized fill />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                        setRawFile(null)
                      }}
                      className="absolute -top-1 -right-1 bg-slate-950 text-white rounded-full p-1 shadow-md border border-slate-700"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
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

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 hover:from-orange-500 hover:to-rose-500 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-600/30 hover-bounce"
          >
            {saving ? (
              <span>Uploading Note...</span>
            ) : (
              <>
                <Check size={16} className="stroke-[3]" />
                <span>Publish Note</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

