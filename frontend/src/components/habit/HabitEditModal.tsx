import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../../store/habitStore'
import { habitsApi, type Habit, type HabitUpdate } from '../../api/habits'

interface Props {
  habit: Habit
  onClose: () => void
}

export default function HabitEditModal({ habit, onClose }: Props) {
  const { fetchHabits, fetchStats } = useHabitStore()
  const [name, setName] = useState(habit.name)
  const [description, setDescription] = useState(habit.description || '')
  const [miniVersion, setMiniVersion] = useState(habit.mini_version_text || '')
  const [submitting, setSubmitting] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    const data: HabitUpdate = {}
    if (name !== habit.name) data.name = name
    if (description !== (habit.description || '')) data.description = description || null
    if (miniVersion !== (habit.mini_version_text || '')) data.mini_version_text = miniVersion || null
    await habitsApi.update(habit.id, data)
    await fetchHabits()
    setSubmitting(false)
    onClose()
  }

  const handleArchive = async () => {
    if (!confirm(`确定要归档「${habit.name}」吗？归档后可以随时恢复。`)) return
    setArchiving(true)
    await habitsApi.update(habit.id, { is_archived: true })
    await Promise.all([fetchHabits(), fetchStats()])
    setArchiving(false)
    onClose()
  }

  const handleRestore = async () => {
    setArchiving(true)
    await habitsApi.update(habit.id, { is_archived: false })
    await Promise.all([fetchHabits(), fetchStats()])
    setArchiving(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-6 pt-8 shadow-xl pb-24"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {habit.emoji} 编辑习惯
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">习惯名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">最小版本</label>
            <input
              type="text"
              value={miniVersion}
              onChange={(e) => setMiniVersion(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 mb-3">
            <button onClick={onClose} className="flex-1 btn-secondary">取消</button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || submitting}
              className="flex-1 btn-primary"
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>

          {habit.is_archived ? (
            <button
              onClick={handleRestore}
              disabled={archiving}
              className="w-full py-2 text-sm text-green-600 hover:bg-green-50 rounded-xl transition-colors"
            >
              🔄 恢复习惯
            </button>
          ) : (
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="w-full py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              📦 归档这个习惯
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
