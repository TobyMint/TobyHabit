// Tree stage thresholds (aligned with backend)
export const STAGE_THRESHOLDS = [0, 1, 7, 21, 66, 100, 200, 365]

export const STAGE_LABELS: Record<number, string> = {
  0: '种子',
  1: '嫩芽',
  2: '树苗',
  3: '小树',
  4: '大树',
  5: '开花',
  6: '结果',
  7: '古树',
}

export const MILESTONES = [7, 21, 66, 100, 200, 365]

export const MILESTONE_LABELS: Record<number, string> = {
  7: '一周坚持',
  21: '习惯初成',
  66: '习惯稳固',
  100: '百日筑基',
  200: '厚积薄发',
  365: '一年之约',
}

export function getStage(totalDays: number): number {
  let stage = 0
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (totalDays >= STAGE_THRESHOLDS[i]) {
      stage = i
    }
  }
  return stage
}

export function getNextMilestone(totalDays: number): { days: number; label: string } | null {
  for (const m of MILESTONES) {
    if (totalDays < m) {
      return { days: m, label: MILESTONE_LABELS[m] }
    }
  }
  return null
}

export const HEALTH_COLORS: Record<string, { foliage: string; trunk: string; glow: string }> = {
  excellent: { foliage: '#22c55e', trunk: '#92400e', glow: '#86efac' },
  good: { foliage: '#4ade80', trunk: '#92400e', glow: '#bbf7d0' },
  okay: { foliage: '#a3e635', trunk: '#a16207', glow: '#d9f99d' },
  wilting: { foliage: '#fbbf24', trunk: '#a16207', glow: '#fde68a' },
  wilted: { foliage: '#d4a373', trunk: '#78716c', glow: '#e7e5e4' },
}

export const SPECIES_COLORS: Record<string, string> = {
  oak: '#4CAF50',
  pine: '#2E7D32',
  cherry: '#EC4899',
  bamboo: '#84CC16',
  maple: '#F97316',
  cactus: '#65A30D',
}
