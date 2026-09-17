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
    <div className="bg-[#05050B]/90 dark:bg-[#05050B]/90 light:bg-slate-100/90 backdrop-blur-md sticky top-[61px] z-20 transition-colors px-4 py-3 border-b border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
      <div className="bg-white dark:bg-white text-slate-900 rounded-full p-1.5 shadow-lg flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelect('All')}
          className={`min-h-[38px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce ${
            selected === 'All'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-transparent text-slate-900 hover:bg-slate-100'
          }`}
        >
          All
        </button>
        {subjects.map((sub) => {
          const isSelected = selected === sub.name
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.name)}
              className={`min-h-[38px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-transparent text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sub.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default memo(SubjectCarousel)
