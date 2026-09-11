'use client'

import { memo } from 'react'

type Subject = {
  id: string
  name: string
  color_code: string
}

function SubjectCarousel({
  subjects,
  selected,
  onSelect,
}: {
  subjects: Subject[]
  selected: string
  onSelect: (name: string) => void
}) {
  return (
    <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-[61px] z-20 transition-colors px-4 py-3">
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5 items-center">
        <button
          onClick={() => onSelect('All')}
          className={`min-h-[40px] px-4 rounded-xl text-xs font-black transition-all shrink-0 flex items-center justify-center hover-bounce font-display ${
            selected === 'All'
              ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 shadow-xs'
          }`}
        >
          ✨ All Subjects
        </button>
        {subjects.map((sub) => {
          const isSelected = selected === sub.name
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.name)}
              className={`min-h-[40px] px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 hover-bounce font-display ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 shadow-xs'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full ring-2 ring-slate-400/40 dark:ring-white/30 shadow-xs transition-transform"
                style={{ backgroundColor: sub.color_code || '#EA580C' }}
              />
              {sub.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default memo(SubjectCarousel)
