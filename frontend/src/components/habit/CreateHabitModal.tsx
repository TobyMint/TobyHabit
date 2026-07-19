import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../../store/habitStore'
import { SPECIES_COLORS, STAGE_LABELS } from '../../utils/tree'

const TREE_SPECIES = [
  { value: 'oak', label: '橡树', emoji: '🌳' },
  { value: 'pine', label: '松树', emoji: '🌲' },
  { value: 'cherry', label: '樱花', emoji: '🌸' },
  { value: 'bamboo', label: '竹子', emoji: '🎋' },
  { value: 'maple', label: '枫树', emoji: '🍁' },
  { value: 'cactus', label: '仙人掌', emoji: '🌵' },
]

const PRESET_COLORS = [
  '#4CAF50', '#2E7D32', '#EC4899', '#F97316', '#8B5CF6', '#06B6D4', '#EF4444', '#84CC16',
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateHabitModal({ open, onClose }: Props) {
  const createHabit = useHabitStore((s) => s.createHabit)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌱')
  const [description, setDescription] = useState('')
  const [targetCount, setTargetCount] = useState(1)
  const [miniVersion, setMiniVersion] = useState('')
  const [color, setColor] = useState('#4CAF50')
  const [species, setSpecies] = useState('oak')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    await createHabit({
      name: name.trim(),
      emoji,
      description: description || null,
      target_count_per_day: targetCount,
      mini_version_text: miniVersion || null,
      color,
      tree_species: species,
    })
    setSubmitting(false)
    onClose()
    // Reset form
    setName('')
    setEmoji('🌱')
    setDescription('')
    setTargetCount(1)
    setMiniVersion('')
    setColor('#4CAF50')
    setSpecies('oak')
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-6 pt-8 max-h-[80vh] overflow-y-auto shadow-xl pb-24"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">🌱 种下一颗种子</h2>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                习惯名称 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：每天运动"
                className="input-field"
                autoFocus
              />
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                图标 Emoji
              </label>
              <div className="flex gap-2 flex-wrap">
                {['🏃', '📚', '🧘', '💪', '✍️', '🎸', '💤', '🥗', '💧', '🧠', '🎯', '🌟'].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                      emoji === e ? 'bg-green-100 scale-110 ring-2 ring-green-400' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                为什么要养成这个习惯？
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="给自己一个坚持的理由"
                className="input-field"
              />
            </div>

            {/* Target per day */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                每天目标次数
              </label>
              <select
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value))}
                className="input-field"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n} 次/天</option>
                ))}
              </select>
            </div>

            {/* Mini version */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                🐣 最小版本（状态不好的时候，做到这个也算打卡）
              </label>
              <input
                type="text"
                value={miniVersion}
                onChange={(e) => setMiniVersion(e.target.value)}
                placeholder="例如：做 1 个俯卧撑"
                className="input-field"
              />
            </div>

            {/* Tree species */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                树种
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TREE_SPECIES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpecies(s.value)}
                    className={`p-2 rounded-xl text-sm flex items-center gap-1 justify-center transition-all ${
                      species === s.value
                        ? 'bg-green-100 ring-2 ring-green-400 font-semibold'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                主题色
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? 'scale-125 ring-2 ring-offset-2 ring-green-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? '种下中...' : '🌱 种下种子'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
