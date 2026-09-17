'use client'

import { useState } from 'react'
import { populateLectureSlots, createSubject } from '@/app/actions'
import { Plus, Loader2 } from 'lucide-react'

type Subject = {
  id: string
  name: string
  color_code: string
}

export default function AdminBar({
  subjects,
  selectedDate,
  selectedSubject,
  onSubjectCreated,
}: {
  subjects: Subject[]
  selectedDate: string
  selectedSubject: string
  onSubjectCreated?: (subject: Subject) => void
}) {
  const [populating, setPopulating] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [creating, setCreating] = useState(false)

  const handlePopulate = async () => {
    setPopulating(true)
    try {
      const subject = subjects.find((s) => s.name === selectedSubject)
      if (!subject) return
      const formData = new FormData()
      formData.set('subjectId', subject.id)
      formData.set('date', selectedDate)
      formData.set('topic', 'General')
      await populateLectureSlots(formData)
    } catch (e) {
      console.error(e)
    } finally {
      setPopulating(false)
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    setCreating(true)
    try {
      const formData = new FormData()
      formData.set('name', newSubjectName.trim())
      const newSubject = await createSubject(formData)
      setNewSubjectName('')
      onSubjectCreated?.(newSubject)
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-5 py-3 bg-[#FCFCFA] border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          <span className="text-blue-600">⚡</span>
          <span>Admin Mode</span>
        </div>
        <button
          onClick={handlePopulate}
          disabled={populating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-600/30 bg-blue-950 text-[10px] font-bold text-[#60A5FA] hover:bg-blue-900/50 transition-colors disabled:opacity-50"
        >
          {populating ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Plus size={10} />
          )}
          Populate Slots
        </button>
      </div>
      <form onSubmit={handleCreateSubject} className="flex gap-2">
        <input
          type="text"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="New subject name"
          className="flex-1 border border-[#EAEAEA] rounded-sm bg-white px-3 py-1.5 text-xs text-[#1A1A18] placeholder:text-gray-400 focus:outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={creating || !newSubjectName.trim()}
          className="px-3 py-1.5 border border-[#EAEAEA] rounded-sm bg-white text-[10px] font-mono font-bold text-[#1A1A18] hover:border-neutral-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {creating ? '...' : 'Create'}
        </button>
      </form>
    </div>
  )
}
