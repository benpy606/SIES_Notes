'use client'

type PostWithRelations = {
  id: string
  user_id: string
  lecture_id: string
  image_url: string | null
  caption: string
  created_at: string
  lecture: {
    id: string
    subject_id: string
    date: string
    lecture_number: number
    topic: string | null
    subject: {
      id: string
      name: string
      color_code: string
    }
  }
  profiles: {
    id: string
    full_name: string
  }
  upvotes: { count: number }[]
}

export default function CalendarRow({
  selectedDate,
  onSelect,
  posts,
}: {
  selectedDate: string
  onSelect: (date: string) => void
  posts: PostWithRelations[]
}) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const getCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return posts.filter((p) => p.lecture.date === dateStr).length
  }

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  }

  const formatDateNum = (date: Date) => {
    return date.getDate().toString()
  }

  return (
    <div className="bg-white/80 backdrop-blur-md px-3 py-3 border-b border-stone-200/80">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = day.toISOString().split('T')[0]
          const isSelected = selectedDate === dateStr
          const isToday = today.toISOString().split('T')[0] === dateStr
          const count = getCount(day)

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className="flex flex-col items-center py-1.5 focus:outline-none group hover-bounce rounded-xl transition-all"
            >
              <span className={`text-[10px] font-bold tracking-wider mb-1 transition-colors ${
                isSelected ? 'text-[#2563EB]' : 'text-stone-400 group-hover:text-stone-600'
              }`}>
                {formatDay(day)}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white shadow-md shadow-blue-900/20 ring-2 ring-blue-400/30'
                    : isToday
                    ? 'bg-blue-100/80 text-[#2563EB] font-extrabold ring-1 ring-blue-300'
                    : 'text-stone-800 hover:bg-stone-100/90'
                }`}
              >
                {formatDateNum(day)}
              </div>
              <div className="h-4 mt-1 flex items-center justify-center">
                {count > 0 ? (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-100 text-[#2563EB]' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {count}
                  </span>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

