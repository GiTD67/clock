import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface LevelUpModalProps {
  levelUp: { level: number; title: string } | null
  onDismiss: () => void
  accentColor?: string
}

export function LevelUpModal({ levelUp, onDismiss, accentColor = '#D7FE51' }: LevelUpModalProps) {
  useEffect(() => {
    if (!levelUp) return
    const fire = (x: number, angle: number) =>
      confetti({ particleCount: 80, spread: 60, angle, origin: { x, y: 0.6 }, colors: [accentColor, '#fff', '#39FF14'] })
    fire(0.3, 75)
    setTimeout(() => fire(0.7, 105), 150)
    setTimeout(() => fire(0.5, 90), 300)
  }, [levelUp, accentColor])

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <motion.div
            className="relative glass rounded-3xl p-10 text-center border shadow-2xl max-w-sm mx-4"
            style={{ borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)` }}
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ boxShadow: `0 0 80px 20px color-mix(in srgb, ${accentColor} 25%, transparent)` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              🏆
            </motion.div>

            <div className="text-sm uppercase tracking-[3px] text-zinc-400 mb-2">Level Up!</div>

            <motion.div
              className="text-7xl font-bold mb-2"
              style={{ color: accentColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 400, delay: 0.15 }}
            >
              {levelUp.level}
            </motion.div>

            <div className="text-2xl font-semibold mb-6">{levelUp.title}</div>

            <button
              onClick={onDismiss}
              className="px-8 py-3 rounded-2xl font-bold text-black text-sm transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Let's go!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
