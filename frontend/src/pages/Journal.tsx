import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { statsApi, type JournalEntry } from '../api/habits'
import { useHabitStore } from '../store/habitStore'

const MOOD_EMOJIS: Record<number, string> = {
  5: '😄', 4: '😊', 3: '😐', 2: '😕', 1: '😫',
}

export default function Journal() {
  const { habits } = useHabitStore()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterHabitId, setFilterHabitId] = useState<number | undefined>()

  useEffect(() => {
    setLoading(true)
    statsApi.getJournal(filterHabitId, 50).then((res) => {
      setEntries(res.entries)
      setLoading(false)
    })
  }, [filterHabitId])

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-green-900">📖 习惯日记</h1>
        <p className="text-sm text-green-600 mt-0.5">
          每一次打卡的心情记录
        </p>
      </div>

      {/* Filter */}
      {habits.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setFilterHabitId(undefined)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              !filterHabitId
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            全部
          </button>
          {habits.filter((h) => !h.is_archived).map((h) => (
            <button
              key={h.id}
              onClick={() => setFilterHabitId(h.id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                filterHabitId === h.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {h.emoji} {h.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-3xl inline-block"
          >
            📖
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-500">还没有打卡笔记</p>
          <p className="text-sm text-gray-400 mt-1">
            打卡时写上你的感受，记录成长的足迹
          </p>
        </div>
      )}

      {/* Timeline entries */}
      {!loading && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card flex gap-3"
            >
              {/* Mood */}
              {entry.mood && (
                <div className="text-2xl flex-shrink-0">
                  {MOOD_EMOJIS[entry.mood]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{entry.habit_emoji}</span>
                  <span className="font-semibold text-sm text-gray-700">{entry.habit_name}</span>
                  {entry.is_mini && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      最小版
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 break-words">{entry.note}</p>
              </div>

              <div className="text-xs text-gray-400 flex-shrink-0">
                {new Date(entry.date).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
