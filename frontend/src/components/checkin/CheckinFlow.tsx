import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Habit } from '../../api/habits'

const MOODS = [
  { value: 5, emoji: '😄', label: '太棒了' },
  { value: 4, emoji: '😊', label: '不错' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 2, emoji: '😕', label: '勉强' },
  { value: 1, emoji: '😫', label: '艰难' },
]

interface Props {
  open: boolean
  onClose: () => void
  habit: Habit
  onConfirm: (isMini: boolean, note?: string, mood?: number) => void
}

export default function CheckinFlow({ open, onClose, habit, onConfirm }: Props) {
  const [step, setStep] = useState<'type' | 'mood' | 'note'>('type')
  const [isMini, setIsMini] = useState(false)
  const [mood, setMood] = useState<number | undefined>()
  const [note, setNote] = useState('')

  const handleTypeSelect = (mini: boolean) => {
    setIsMini(mini)
    setStep('mood')
  }

  const handleMoodSelect = (m: number) => {
    setMood(m)
    setStep('note')
  }

  const handleConfirm = () => {
    onConfirm(isMini, note || undefined, mood)
    // Reset
    setIsMini(false)
    setMood(undefined)
    setNote('')
    setStep('type')
  }

  const handleClose = () => {
    setStep('type')
    setIsMini(false)
    setMood(undefined)
    setNote('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="relative bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-6 pt-8 shadow-xl pb-24"
          >
            {step === 'type' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  {habit.emoji} {habit.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">今天完成了哪个版本？</p>
                <button
                  onClick={() => handleTypeSelect(false)}
                  className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all
                    bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600 active:scale-[0.98]`}
                >
                  ✅ 完整版打卡
                </button>
                {habit.mini_version_text && (
                  <button
                    onClick={() => handleTypeSelect(true)}
                    className="w-full py-3 rounded-2xl text-sm transition-all
                      bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100 active:scale-[0.98]"
                  >
                    🐣 最小版：{habit.mini_version_text}
                  </button>
                )}
                <button onClick={handleClose} className="w-full py-2 text-gray-400 hover:text-gray-600">
                  取消
                </button>
              </div>
            )}

            {step === 'mood' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">感觉如何？</h3>
                <div className="flex justify-center gap-3">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleMoodSelect(m.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 transition-all active:scale-90"
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-[10px] text-gray-500">{m.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep('note')}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  跳过
                </button>
              </div>
            )}

            {step === 'note' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">想记点什么？</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录此刻的心情或感受..."
                  className="input-field min-h-[80px] resize-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 btn-primary"
                  >
                    完成打卡 ✨
                  </button>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  跳过，直接打卡
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
