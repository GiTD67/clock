import { motion, AnimatePresence } from 'framer-motion'
import { Achievement, DailyChallenge } from '../hooks/useGamification'

interface AchievementsPanelProps {
  isOpen: boolean
  onClose: () => void
  level: number
  levelTitle: string
  xp: number
  xpThisLevel: number
  xpToNextLevel: number
  achievements: Achievement[]
  dailyChallenges: DailyChallenge[]
}

export function AchievementsPanel({
  isOpen, onClose, level, levelTitle, xp, xpThisLevel, xpToNextLevel, achievements, dailyChallenges,
}: AchievementsPanelProps) {
  const unlocked = achievements.filter(a => a.unlockedAt)
  const locked = achievements.filter(a => !a.unlockedAt)
  const pct = Math.min(100, (xpThisLevel / xpToNextLevel) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-3xl p-6 border border-white/15 shadow-2xl mx-4"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}
                >
                  {level}
                </div>
                <div>
                  <div className="font-semibold text-xl">{levelTitle}</div>
                  <div className="text-xs text-zinc-400">{xp.toLocaleString()} total XP</div>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm">
                ✕
              </button>
            </div>

            {/* XP Progress */}
            <div className="glass rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Level {level}</span>
                <span>{xpThisLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP to Level {level + 1}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="mb-6">
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span style={{ color: 'var(--accent-color)' }}>📋 Daily Challenges</span>
                <span className="text-zinc-500 text-xs font-normal">Resets midnight</span>
              </div>
              <div className="space-y-2">
                {dailyChallenges.map(c => (
                  <div key={c.id} className={`rounded-2xl p-3 flex items-center gap-3 border ${c.completed ? 'border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5' : 'border-white/10 bg-white/5'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${c.completed ? '' : 'bg-white/10'}`}
                      style={c.completed ? { backgroundColor: 'var(--accent-color)', color: '#000' } : undefined}>
                      {c.completed ? '✓' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="text-xs text-zinc-500">{c.description}</div>
                      {!c.completed && c.goal > 1 && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(c.progress / c.goal) * 100}%`, backgroundColor: 'var(--accent-color)' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-semibold flex-shrink-0" style={{ color: c.completed ? 'var(--accent-color)' : undefined }}>
                      +{c.xpReward} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlocked achievements */}
            {unlocked.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-semibold mb-3" style={{ color: 'var(--accent-color)' }}>
                  🏆 Unlocked ({unlocked.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {unlocked.map(a => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl p-3 flex items-center gap-3 border"
                      style={{ borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--accent-color) 5%, transparent)' }}
                    >
                      <div className="text-2xl flex-shrink-0">{a.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{a.name}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{a.description}</div>
                        <div className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--accent-color)' }}>+{a.xpReward} XP</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked achievements */}
            {locked.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-3 text-zinc-400">
                  🔒 Locked ({locked.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {locked.map(a => (
                    <div
                      key={a.id}
                      className="rounded-2xl p-3 flex items-center gap-3 border border-white/5 bg-white/3 opacity-50"
                    >
                      <div className="text-2xl flex-shrink-0 grayscale">{a.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-zinc-400">{a.name}</div>
                        <div className="text-[10px] text-zinc-600 truncate">{a.description}</div>
                        <div className="text-[10px] text-zinc-600 mt-0.5">+{a.xpReward} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
