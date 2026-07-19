import { useMemo } from 'react'
import { type CalendarDay } from '../../api/habits'

interface Props {
  days: CalendarDay[]
  color?: string
}

export default function CalendarHeatmap({ days, color = '#4CAF50' }: Props) {
  const weeks = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83) // ~12 weeks

    // Build a map
    const dayMap = new Map<string, CalendarDay>()
    days.forEach((d) => dayMap.set(d.date, d))

    const result: { date: Date; day: CalendarDay | null }[][] = []
    let currentWeek: { date: Date; day: CalendarDay | null }[] = []

    const d = new Date(startDate)
    while (d <= today) {
      const dateStr = d.toISOString().slice(0, 10)
      currentWeek.push({
        date: new Date(d),
        day: dayMap.get(dateStr) || null,
      })

      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
      d.setDate(d.getDate() + 1)
    }
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [days])

  const getColor = (day: CalendarDay | null) => {
    if (!day) return 'bg-gray-100'
    if (day.is_mini) return 'bg-amber-200'
    return 'bg-green-400'
  }

  const getColorStyle = (day: CalendarDay | null) => {
    if (!day) return { backgroundColor: '#f3f4f6' }
    if (day.is_mini) return { backgroundColor: '#fde68a' }
    return { backgroundColor: color, opacity: 0.7 }
  }

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="w-5 h-[11px] flex items-center justify-center text-[9px] text-gray-400"
            >
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell, di) => (
              <div
                key={di}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={getColorStyle(cell.day)}
                title={
                  cell.day
                    ? `${cell.day.date} ${cell.day.is_mini ? '(最小版)' : ''}`
                    : `${cell.date.toISOString().slice(0, 10)} 未打卡`
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
        <span>少</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-amber-200" title="最小版" />
        <div className="w-[11px] h-[11px] rounded-[2px] opacity-40" style={{ backgroundColor: color }} />
        <div className="w-[11px] h-[11px] rounded-[2px] opacity-70" style={{ backgroundColor: color }} />
        <div className="w-[11px] h-[11px] rounded-[2px] opacity-100" style={{ backgroundColor: color }} />
        <span>多</span>
      </div>
    </div>
  )
}
