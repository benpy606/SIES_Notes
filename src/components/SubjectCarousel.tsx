'use client'

import { memo } from 'react'

type Subject = {
  id: string
  name: string
  color_code: string
}

const getVibrantColor = (name: string, defaultColor: string) => {
  if (name.includes('Computation')) return '#A855F7'
  if (name.includes('Arch')) return '#10B981'
  if (name.includes('Networks')) return '#06B6D4'
  if (name.includes('Imperative')) return '#3B82F6'
  if (name.includes('Indian')) return '#64748B'
  return defaultColor
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
    <div className="bg-black/95 dark:bg-black/95 backdrop-blur-md sticky top-[61px] z-20 transition-colors duration-200 px-4 py-3 border-b border-zinc-800/80">
      <div
        role="tablist"
        aria-label="Filter notes by subject"
        className="bg-white dark:bg-[#121215] text-[#121215] dark:text-white rounded-full p-1.5 shadow-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        <button
          role="tab"
          aria-selected={selected === 'All'}
          onClick={() => onSelect('All')}
          className={`min-h-[42px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce cursor-pointer ${
            selected === 'All'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/30'
              : 'bg-transparent text-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
          }`}
        >
          All
        </button>
        {subjects.map((sub) => {
          const isSelected = selected === sub.name
          const vibrantColor = getVibrantColor(sub.name, sub.color_code)
          return (
            <button
              key={sub.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(sub.name)}
              style={isSelected ? { backgroundColor: vibrantColor, boxShadow: `0 4px 6px -1px ${vibrantColor}4D` } : undefined}
              className={`min-h-[42px] px-5 rounded-full text-xs font-black transition-all shrink-0 flex items-center justify-center font-display hover-bounce cursor-pointer ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'bg-transparent text-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
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
