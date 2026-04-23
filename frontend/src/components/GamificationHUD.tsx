import { motion, AnimatePresence } from 'framer-motion'

interface GamificationHUDProps {
  level: number
  levelTitle: string
  xpThisLevel: number
  xpToNextLevel: number
  xpPopups: Array<{ id: number; amount: number; label: string }>
  onOpenAchievements: () => void
}

export function GamificationHUD({ level, levelTitle, xpThisLevel, xpToNextLevel, xpPopups, onOpenAchievements }: GamificationHUDProps) {
  const pct = Math.min(100, (xpThisLevel / xpToNextLevel) * 100)

  return (
    <div className="relative flex items-center gap-3">
      {/* XP pop-up toasts */}
      <AnimatePresence>
        {xpPopups.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -32, scale: 1 }}
            exit={{ opacity: 0, y: -56, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-full right-0 mb-1 pointer-events-none z-50"
          >
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}
            >
              +{p.amount} XP
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Level badge + XP bar */}
      <button
        onClick={onOpenAchievements}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
        title="View achievements"
      >
        {/* Level badge */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}
        >
          {level}
        </div>

        {/* Level title + progress bar */}
        <div className="hidden sm:flex flex-col gap-0.5 min-w-[90px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--accent-color)' }}>
              {levelTitle}
            </span>
            <span className="text-[9px] text-zinc-500">
              {xpThisLevel}/{xpToNextLevel}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden w-full">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent-color)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Trophy icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 hidden sm:block">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      </button>
    </div>
  )
}
