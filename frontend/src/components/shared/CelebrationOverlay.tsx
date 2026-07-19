import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MILESTONE_LABELS } from '../../utils/tree'

interface Props {
  open: boolean
  milestones: number[]
  streak: number
  habitName: string
  onClose: () => void
}

export default function CelebrationOverlay({ open, milestones, streak, habitName, onClose }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (open) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 500)
      }, 4000)
      return () => clearTimeout(timer)
    }
    return () => {}
  }, [open])

  // Generate confetti particles
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    color: ['#4CAF50', '#22C55E', '#FBBF24', '#EC4899', '#8B5CF6', '#06B6D4'][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <AnimatePresence>
      {open && show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { setShow(false); setTimeout(onClose, 500) }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          {/* Confetti */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x: (p.x - 50) * 8,
                y: -200 - Math.random() * 300,
                opacity: [1, 1, 0],
                rotate: p.rotation + 360,
                scale: [1, 1.5, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Celebration card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-7xl mb-4"
            >
              🎉
            </motion.div>

            <h2 className="text-2xl font-bold text-green-800 mb-2">
              太棒了！
            </h2>

            <p className="text-gray-600 mb-1">
              <strong>{habitName}</strong>
            </p>

            {milestones.map((m) => (
              <p key={m} className="text-lg font-semibold text-green-700 mt-2">
                🏆 达成「{MILESTONE_LABELS[m]}」里程碑！
              </p>
            ))}

            <p className="text-sm text-gray-400 mt-3">
              已经连续坚持了 <strong className="text-amber-600">{streak}</strong> 天 🔥
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-green-500 mt-4 font-medium"
            >
              继续加油，下一阶段就在前方 🌱
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
