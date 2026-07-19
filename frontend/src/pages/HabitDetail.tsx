import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TreeSVG from '../components/tree/TreeSVG'
import CalendarHeatmap from '../components/habit/CalendarHeatmap'
import CheckinFlow from '../components/checkin/CheckinFlow'
import CelebrationOverlay from '../components/shared/CelebrationOverlay'
import { habitsApi, type Habit, type CheckInResult, type CalendarDay } from '../api/habits'
import { useHabitStore } from '../store/habitStore'
import { MILESTONE_LABELS, STAGE_LABELS } from '../utils/tree'

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [habit, setHabit] = useState<Habit | null>(null)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [showCheckin, setShowCheckin] = useState(false)
  const [celebration, setCelebration] = useState<{
    milestones: number[]
    streak: number
  } | null>(null)
  const { fetchHabits, fetchStats } = useHabitStore()

  const loadData = useCallback(async () => {
    if (!id) return
    const hid = parseInt(id)
    const [h, cal] = await Promise.all([
      habitsApi.get(hid),
      habitsApi.getCalendar(hid),
    ])
    setHabit(h)
    setCalendar(cal.days)
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCheckIn = (isMini: boolean, note?: string, mood?: number) => {
    if (!habit) return
    habitsApi.checkIn(habit.id, { is_mini: isMini, note, mood }).then((result: CheckInResult) => {
      setShowCheckin(false)
      loadData().then(() => {
        fetchHabits()
        fetchStats()
      })
      // Show celebration if milestones reached
      if (result.milestone_reached.length > 0) {
        setCelebration({
          milestones: result.milestone_reached,
          streak: result.tree.current_streak,
        })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-5xl"
        >
          🌱
        </motion.div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">习惯不存在</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">返回森林</button>
      </div>
    )
  }

  const tree = habit.tree

  return (
    <div className="space-y-6 pb-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-green-700 hover:text-green-900 transition-colors"
      >
        <span>←</span> 返回森林
      </button>

      {/* Tree display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card flex flex-col items-center py-6"
      >
        <TreeSVG
          species={habit.tree_species}
          stage={tree?.stage ?? 0}
          health={tree?.health ?? 'good'}
          color={habit.color}
          size={220}
          animated={true}
        />

        <h1 className="text-xl font-bold text-gray-800 mt-4 flex items-center gap-2">
          {habit.emoji} {habit.name}
        </h1>

        {habit.description && (
          <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
            {habit.description}
          </p>
        )}

        {/* Tree stats */}
        {tree && (
          <div className="flex gap-4 mt-4 text-center">
            <div className="px-3 py-1.5 bg-green-50 rounded-xl">
              <div className="text-lg font-bold text-green-700">{tree.total_days}</div>
              <div className="text-xs text-green-600">累计天数</div>
            </div>
            <div className="px-3 py-1.5 bg-amber-50 rounded-xl">
              <div className="text-lg font-bold text-amber-700">🔥 {tree.current_streak}</div>
              <div className="text-xs text-amber-600">连续天数</div>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 rounded-xl">
              <div className="text-lg font-bold text-blue-700">{STAGE_LABELS[tree.stage]}</div>
              <div className="text-xs text-blue-600">生长阶段</div>
            </div>
            {tree.freeze_cards > 0 && (
              <div className="px-3 py-1.5 bg-purple-50 rounded-xl">
                <div className="text-lg font-bold text-purple-700">🛡️ {tree.freeze_cards}</div>
                <div className="text-xs text-purple-600">冻结卡</div>
              </div>
            )}
          </div>
        )}

        {/* Next milestone */}
        {tree && tree.next_milestone && (
          <div className="mt-4 w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>距离「{MILESTONE_LABELS[tree.next_milestone]}」</span>
              <span>还需 {tree.days_to_next_milestone} 天</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    ((tree.total_days % 100) / (tree.next_milestone - (tree.total_days - (tree.total_days % 100)))) * 100,
                    100
                  )}%`,
                }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Check-in button */}
      <div className="flex flex-col gap-2">
        {/* Today's progress */}
        <div className="card py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">今日进度</span>
            <span className={`text-sm font-bold ${
              habit.today_count >= habit.target_count_per_day ? 'text-green-600' : 'text-amber-600'
            }`}>
              {habit.today_count} / {habit.target_count_per_day}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <motion.div
              className={`h-full rounded-full ${
                habit.today_count >= habit.target_count_per_day
                  ? 'bg-green-500'
                  : 'bg-amber-400'
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((habit.today_count / habit.target_count_per_day) * 100, 100)}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {habit.today_count >= habit.target_count_per_day ? (
          <div className="card text-center py-3 bg-green-50 border-green-200">
            <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
              <span>🎉</span> 今日目标达成！
            </p>
            <p className="text-xs text-green-500 mt-1">
              已完成 {habit.today_count}/{habit.target_count_per_day} 次打卡
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowCheckin(true)}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              <span>✅</span> 今日打卡（{habit.today_count}/{habit.target_count_per_day}）
            </button>

            {/* Mini version button */}
            {habit.mini_version_text && habit.today_count === 0 && (
              <button
                onClick={() => handleCheckIn(true)}
                className="btn-secondary w-full py-3 text-sm"
              >
                🐣 最小版：{habit.mini_version_text}
              </button>
            )}
          </>
        )}
      </div>

      {/* Calendar heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="font-semibold text-gray-700 mb-3">📅 打卡日历</h3>
        <CalendarHeatmap days={calendar} color={habit.color} />
      </motion.div>

      {/* Modals */}
      <CheckinFlow
        open={showCheckin}
        onClose={() => setShowCheckin(false)}
        habit={habit}
        onConfirm={handleCheckIn}
      />

      <CelebrationOverlay
        open={!!celebration}
        milestones={celebration?.milestones || []}
        streak={celebration?.streak || 0}
        habitName={habit.name}
        onClose={() => setCelebration(null)}
      />
    </div>
  )
}
