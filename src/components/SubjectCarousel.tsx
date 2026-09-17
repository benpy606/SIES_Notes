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
    <div className="bg-[#05050B]/95 dark:bg-[#05050B]/95 backdrop-blur-md sticky top-[61px] z-20 transition-colors px-4 py-3 border-b border-slate-800/80">
      <div
        role="tablist"
        aria-label="Filter notes by subject"
        className="bg-white dark:bg-[#0F111E] text-slate-900 dark:text-slate-100 rounded-full p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        <button
          role="tab"
          aria-selected={selected === 'All'}
          onClick={() => onSelect('All')}
          className={`min-h-[42px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce cursor-pointer ${
            selected === 'All'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          }`}
        >
          All
        </button>
        {subjects.map((sub) => {
          const isSelected = selected === sub.name
          return (
            <button
              key={sub.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(sub.name)}
              className={`min-h-[42px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
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
