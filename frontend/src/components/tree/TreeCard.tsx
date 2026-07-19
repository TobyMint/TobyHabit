import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TreeSVG from './TreeSVG'
import type { HabitListItem } from '../../api/habits'
import { STAGE_LABELS } from '../../utils/tree'

interface TreeCardProps {
  habit: HabitListItem
  index: number
}

export default function TreeCard({ habit, index }: TreeCardProps) {
  const navigate = useNavigate()
  const tree = habit.tree

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/habit/${habit.id}`)}
      className="card cursor-pointer flex flex-col items-center p-4 gap-2 hover:shadow-md transition-shadow"
    >
      <TreeSVG
        species={habit.tree_species}
        stage={tree?.stage ?? 0}
        health={tree?.health ?? 'good'}
        color={habit.color}
        size={120}
        animated={false}
      />

      <div className="text-center">
        <span className="text-lg mr-1.5">{habit.emoji}</span>
        <span className="font-semibold text-sm text-gray-800">{habit.name}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
          {tree ? STAGE_LABELS[tree.stage] : '种子'}
        </span>
        {tree && tree.current_streak > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
            🔥 {tree.current_streak}天
          </span>
        )}
      </div>

      {/* Health indicator */}
      {tree && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
          <motion.div
            className={`h-full rounded-full ${
              tree.health === 'excellent' ? 'bg-green-500' :
              tree.health === 'good' ? 'bg-green-400' :
              tree.health === 'okay' ? 'bg-yellow-400' :
              'bg-orange-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(tree.current_streak * 10, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  )
}
