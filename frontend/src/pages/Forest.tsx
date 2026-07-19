import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import TreeCard from '../components/tree/TreeCard'
import CreateHabitModal from '../components/habit/CreateHabitModal'
import HabitEditModal from '../components/habit/HabitEditModal'
import type { Habit, HabitUpdate } from '../api/habits'

export default function Forest() {
  const { habits, stats, fetchHabits, fetchStats, loading } = useHabitStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchHabits()
    fetchStats()
  }, [])

  const activeHabits = habits.filter((h) => !h.is_archived)
  const archivedHabits = habits.filter((h) => h.is_archived)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-green-900 flex items-center gap-2">
            🌳 我的森林
          </h1>
          <p className="text-sm text-green-600 mt-0.5">
            {stats && `${stats.active_habits} 棵树 · 森林健康度 ${stats.forest_health_pct}%`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-1 px-5 py-2.5 text-sm"
        >
          <span className="text-lg">+</span> 种下种子
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex justify-around py-3 px-2"
        >
          <StatItem value={stats.total_checkins} label="总打卡" />
          <StatItem value={stats.total_days_tracked} label="追踪天数" />
          <StatItem value={stats.best_streak} label="最佳连续" />
          <StatItem value={`${stats.forest_health_pct}%`} label="森林健康" />
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && activeHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🌰</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">这里还是一片空地</h2>
          <p className="text-green-600 mb-6">种下你的第一颗种子，开始养成一个好习惯吧</p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            🌱 种下第一颗种子
          </button>
        </motion.div>
      )}

      {/* Active habits grid */}
      {activeHabits.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {activeHabits.map((habit, i) => (
              <div key={habit.id} className="relative group">
                <TreeCard habit={habit} index={i} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    useHabitStore.getState().getHabit(habit.id).then(setEditingHabit)
                  }}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ⚙️
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Archived habits */}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            {showArchived ? '收起' : '查看'}已归档的习惯 ({archivedHabits.length})
          </button>
          {showArchived && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 opacity-50">
              {archivedHabits.map((habit, i) => (
                <TreeCard key={habit.id} habit={habit} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-green-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl inline-block"
          >
            🌱
          </motion.div>
          <p className="mt-2">森林加载中...</p>
        </div>
      )}

      {/* Modals */}
      <CreateHabitModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      {editingHabit && (
        <HabitEditModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  )
}

function StatItem({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-green-800">{value}</div>
      <div className="text-xs text-green-600">{label}</div>
    </div>
  )
}
