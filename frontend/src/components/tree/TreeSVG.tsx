import { motion } from 'framer-motion'
import { HEALTH_COLORS, type TreeInfo as TreeInfoType } from '../../utils/tree'

interface TreeSVGProps {
  species: string
  stage: number
  health: string
  color: string
  size?: number
  animated?: boolean
  className?: string
}

export default function TreeSVG({
  species,
  stage,
  health,
  color,
  size = 200,
  animated = true,
  className = '',
}: TreeSVGProps) {
  const hc = HEALTH_COLORS[health] || HEALTH_COLORS.good
  const scale = 0.4 + stage * 0.08

  const MotionSVG = animated ? motion.svg : 'svg'
  const MotionGroup = animated ? motion.g : 'g'
  const MotionCircle = animated ? motion.circle : 'circle'

  const animProps = animated
    ? {
        initial: stage === 0 ? { scale: 0.3, opacity: 0 } : { scale: 1, opacity: 1 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 200, damping: 20 },
      }
    : {}

  return (
    <MotionSVG
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`drop-shadow-lg ${className}`}
      {...animProps}
    >
      {/* Ground */}
      <ellipse cx="100" cy="185" rx="80" ry="10" fill="#d4a373" opacity="0.3" />

      {/* Glow effect for excellent health */}
      {health === 'excellent' && stage >= 3 && (
        <MotionCircle
          cx="100"
          cy="80"
          r="70"
          fill={hc.glow}
          opacity="0.15"
          animate={{ r: [70, 75, 70], opacity: [0.15, 0.2, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {stage === 0 ? (
        <SeedStage animated={animated} health={health} />
      ) : (
        <MotionGroup
          style={{ transformOrigin: '100px 180px' }}
          animate={health === 'excellent' ? { rotate: [0, 0.5, 0, -0.5, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Trunk */}
          <Trunk stage={stage} health={health} species={species} />

          {/* Foliage based on species */}
          {renderFoliage(species, stage, hc.foliage, hc.trunk)}

          {/* Flowers for stage 5+ */}
          {stage >= 5 && <Flowers stage={stage} color={color} />}

          {/* Fruits for stage 6+ */}
          {stage >= 6 && <Fruits stage={stage} />}

          {/* Special effects for stage 7 */}
          {stage >= 7 && <GlowEffect />}
        </MotionGroup>
      )}

      {/* Wilting leaves on ground */}
      {(health === 'wilting' || health === 'wilted') && stage >= 2 && (
        <FallenLeaves health={health} />
      )}
    </MotionSVG>
  )
}

function SeedStage({ animated, health }: { animated: boolean; health: string }) {
  const isDead = health === 'wilted'
  return (
    <>
      {/* Soil mound */}
      <ellipse cx="100" cy="170" rx="35" ry="12" fill="#8B6914" />
      <ellipse cx="100" cy="168" rx="30" ry="8" fill="#A0522D" />
      {/* Seed */}
      <motion.ellipse
        cx="100" cy="160" rx="8" ry="12"
        fill={isDead ? '#9CA3AF' : '#92400e'}
        animate={isDead ? {} : { y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {!isDead && (
        <motion.path
          d="M100 148 Q102 140 100 135"
          stroke="#4ade80"
          strokeWidth="1.5"
          fill="none"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      )}
    </>
  )
}

function Trunk({ stage, health, species }: { stage: number; health: string; species: string }) {
  const hc = HEALTH_COLORS[health] || HEALTH_COLORS.good
  const trunkWidth = 6 + stage * 1.5
  const trunkHeight = 50 + stage * 8

  if (species === 'bamboo') {
    return (
      <g>
        {[0, 1, 2, 3].slice(0, Math.min(stage + 1, 4)).map((i) => (
          <g key={i}>
            <rect
              x={95 - i * 3}
              y={170 - i * 30}
              width={6 + trunkWidth * 0.3}
              height={35}
              rx={3}
              fill={hc.trunk}
            />
            <line
              x1={92 - i * 3}
              y1={185 - i * 30}
              x2={105 + i * 2}
              y2={185 - i * 30}
              stroke="#65A30D"
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        ))}
      </g>
    )
  }

  if (species === 'cactus') {
    return (
      <g>
        <rect x="93" y={160 - trunkHeight} width={trunkWidth + 4} height={trunkHeight} rx="15" fill="#65A30D" />
        {stage >= 3 && (
          <>
            <path d={`M${93 + trunkWidth + 4} ${170 - trunkHeight * 0.5} Q120 ${170 - trunkHeight * 0.5} 120 ${170 - trunkHeight * 0.5 - 15} L120 ${170 - trunkHeight * 0.5 - 40}`} stroke="#65A30D" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d={`M93 ${170 - trunkHeight * 0.3} Q70 ${170 - trunkHeight * 0.3} 70 ${170 - trunkHeight * 0.3 - 15} L70 ${170 - trunkHeight * 0.3 - 35}`} stroke="#65A30D" strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
    )
  }

  // Regular tree trunk
  return (
    <path
      d={`M${100 - trunkWidth / 2} 180
          Q${100 - trunkWidth / 2 - 2} ${180 - trunkHeight / 2}
           ${100 - trunkWidth / 4} ${180 - trunkHeight}
          Q100 ${180 - trunkHeight - 5}
           ${100 + trunkWidth / 4} ${180 - trunkHeight}
          Q${100 + trunkWidth / 2 + 2} ${180 - trunkHeight / 2}
           ${100 + trunkWidth / 2} 180 Z`}
      fill={hc.trunk}
    />
  )
}

function renderFoliage(species: string, stage: number, foliageColor: string, trunkColor: string) {
  if (stage < 1) return null

  const baseY = 160
  const canopySize = 20 + stage * 8
  const layers = stage <= 2 ? 1 : stage <= 4 ? 2 : 3

  if (species === 'pine') {
    // Triangular pine canopy
    return (
      <g>
        {Array.from({ length: layers }, (_, i) => {
          const layerSize = canopySize - i * 10
          const y = baseY - 30 - i * 25
          return (
            <polygon
              key={i}
              points={`100,${y - layerSize} ${100 - layerSize - 5},${y + 5} ${100 + layerSize + 5},${y + 5}`}
              fill={foliageColor}
              opacity={0.85 - i * 0.1}
            />
          )
        })}
      </g>
    )
  }

  if (species === 'cherry') {
    // Round canopy like cherry blossom
    return (
      <g>
        {Array.from({ length: layers }, (_, i) => (
          <motion.ellipse
            key={i}
            cx={100 + (i === 1 ? -15 : i === 2 ? 15 : 0)}
            cy={baseY - 40 - i * 15}
            rx={canopySize - i * 5}
            ry={canopySize - i * 8}
            fill={foliageColor}
            opacity={0.8 - i * 0.15}
            animate={i === 1 ? { x: [-1, 1, -1] } : i === 2 ? { x: [1, -1, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
        ))}
      </g>
    )
  }

  if (species === 'maple') {
    // Star-like maple canopy
    const crownCenter = { x: 100, y: baseY - 40 }
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180)
          const cx = crownCenter.x + Math.cos(angle) * canopySize * 0.5
          const cy = crownCenter.y + Math.sin(angle) * canopySize * 0.5
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={canopySize * 0.45}
              ry={canopySize * 0.45}
              fill={foliageColor}
              opacity={0.75}
            />
          )
        })}
        <ellipse cx={crownCenter.x} cy={crownCenter.y} rx={canopySize * 0.6} ry={canopySize * 0.6} fill={foliageColor} opacity={0.85} />
      </g>
    )
  }

  if (species === 'bamboo') {
    // Bamboo leaves at top
    return (
      <g>
        {Array.from({ length: stage + 2 }, (_, i) => {
          const angle = i * 30 - 60
          const rad = angle * (Math.PI / 180)
          const leafLen = 15 + stage * 2
          const cx = 100 + Math.cos(rad) * 10
          const cy = 140 - stage * 8
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy + i * 2}
              rx={leafLen}
              ry={leafLen * 0.2}
              fill={foliageColor}
              transform={`rotate(${angle}, ${cx}, ${cy})`}
              opacity={0.8}
            />
          )
        })}
      </g>
    )
  }

  if (species === 'cactus') {
    return stage >= 4 ? (
      <circle cx="100" cy={baseY - 80} r="6" fill="#FBBF24" opacity="0.8" />
    ) : null
  }

  // Default: Oak - classic rounded canopy made of clustered circles
  const crownY = baseY - 25 - (stage - 1) * 5
  return (
    <g>
      {/* Main canopy clusters */}
      <motion.ellipse
        cx={100}
        cy={crownY - 5}
        rx={canopySize}
        ry={canopySize * 0.7}
        fill={foliageColor}
        opacity="0.85"
        animate={{ ry: [canopySize * 0.7, canopySize * 0.73, canopySize * 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {stage >= 2 && (
        <>
          <ellipse cx={100 - canopySize * 0.4} cy={crownY} rx={canopySize * 0.6} ry={canopySize * 0.5} fill={foliageColor} opacity="0.7" />
          <ellipse cx={100 + canopySize * 0.45} cy={crownY - 5} rx={canopySize * 0.55} ry={canopySize * 0.55} fill={foliageColor} opacity="0.7" />
        </>
      )}
      {stage >= 4 && (
        <ellipse cx={100} cy={crownY - canopySize * 0.3} rx={canopySize * 0.7} ry={canopySize * 0.45} fill={foliageColor} opacity="0.6" />
      )}
    </g>
  )
}

function Flowers({ stage, color }: { stage: number; color: string }) {
  const positions = [
    { x: 70, y: 95 }, { x: 90, y: 80 }, { x: 110, y: 85 },
    { x: 130, y: 95 }, { x: 80, y: 110 }, { x: 120, y: 110 },
    { x: 100, y: 75 },
  ]

  return (
    <g>
      {positions.slice(0, 3 + stage).map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4 + Math.random() * 3}
          fill={color}
          opacity="0.8"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </g>
  )
}

function Fruits({ stage }: { stage: number }) {
  const positions = [
    { x: 75, y: 105 }, { x: 95, y: 90 }, { x: 115, y: 95 }, { x: 125, y: 105 }, { x: 85, y: 115 },
  ]
  const colors = ['#F97316', '#EF4444', '#EAB308']

  return (
    <g>
      {positions.slice(0, 3 + stage - 6).map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill={colors[i % colors.length]}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
        />
      ))}
    </g>
  )
}

function GlowEffect() {
  return (
    <motion.circle
      cx="100" cy="100" r="60"
      fill="none"
      stroke="#FBBF24"
      strokeWidth="1"
      opacity="0.4"
      animate={{ r: [60, 70, 60], opacity: [0.4, 0.2, 0.4] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  )
}

function FallenLeaves({ health }: { health: string }) {
  const count = health === 'wilted' ? 5 : 2
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <ellipse
          key={i}
          cx={70 + i * 15}
          cy={182 + i * 4}
          rx={6}
          ry={3}
          fill="#d4a373"
          opacity={0.5}
          transform={`rotate(${30 + i * 20}, ${70 + i * 15}, ${182 + i * 4})`}
        />
      ))}
    </g>
  )
}
