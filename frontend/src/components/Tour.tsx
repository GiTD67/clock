import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TourStep {
  icon: string
  title: string
  desc: string
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: '👋',
    title: 'Welcome to SwiftShift!',
    desc: "You're in. Let's take a 60-second tour of the key features so you can hit the ground running.",
  },
  {
    icon: '⏱',
    title: 'Time Clock',
    desc: 'Clock in and out with one click. Your earnings update in real time — every second counts. Track breaks too.',
  },
  {
    icon: '📋',
    title: 'Timesheet',
    desc: 'All your time entries in one place. Add, edit, and submit your weekly timesheet with ease.',
  },
  {
    icon: '🏆',
    title: 'Rewards',
    desc: 'Stay consistent and earn streak rewards. Watch your real-time earnings climb on the Odometer.',
  },
  {
    icon: '💳',
    title: 'Payroll & Reports',
    desc: 'View pay details, export reports, and track your analytics — all in one dashboard.',
  },
  {
    icon: '💰',
    title: 'AI Tax Filing — Swifty',
    desc: 'Upload your W-2 or 1099 and Swifty fills out your Form 1040 instantly. No accountant needed.',
  },
  {
    icon: '🤖',
    title: 'AI Assistant — Swifty',
    desc: 'Ask Swifty anything — leave policies, HR questions, company info. Instant, intelligent answers.',
  },
  {
    icon: '⚡',
    title: 'InstaApply',
    desc: 'Upload your resume once. SwiftShift matches you to jobs and applies in seconds.',
  },
  {
    icon: '✅',
    title: "You're all set!",
    desc: "That covers the highlights. Start by clocking in — your first session is just one click away.",
  },
]

interface TourProps {
  onClose: () => void
  accentHex?: string
}

export function Tour({ onClose, accentHex = '#D7FE51' }: TourProps) {
  const [step, setStep] = useState(0)
  const current = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1
  const isDark = accentHex === '#D7FE51' || accentHex === '#E5E7EB' || accentHex === '#51FEFE' || accentHex === '#FE51D7'

  const next = () => {
    if (isLast) onClose()
    else setStep(s => s + 1)
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="glass w-full max-w-[420px] rounded-3xl p-8 border border-white/10 mx-4"
          style={{ boxShadow: `0 0 80px -20px ${accentHex}35, 0 28px 72px -14px rgba(0,0,0,0.85)` }}
        >
          {/* Progress bar */}
          <div className="h-1 rounded-full bg-white/10 mb-6 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accentHex }}
              animate={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Step counter */}
          <div className="text-xs tracking-[2px] text-zinc-500 mb-5 uppercase">
            Step {step + 1} <span className="text-zinc-700">/ {TOUR_STEPS.length}</span>
          </div>

          {/* Icon */}
          <div className="text-5xl mb-4 leading-none">{current.icon}</div>

          {/* Title */}
          <h2
            className="text-2xl font-semibold tracking-tight mb-3"
            style={{ color: step === 0 || isLast ? accentHex : 'white' }}
          >
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            {current.desc}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="px-4 py-2 rounded-xl border border-white/10 text-sm text-zinc-400 hover:bg-white/5 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] hover:opacity-90"
                style={{
                  background: accentHex,
                  color: isDark ? '#000' : '#fff',
                }}
              >
                {isLast ? 'Get started →' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-6 justify-center">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === step ? '16px' : '6px',
                  height: '6px',
                  backgroundColor: i === step ? accentHex : i < step ? `${accentHex}55` : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
