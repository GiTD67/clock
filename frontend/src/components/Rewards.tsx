import { useEffect, useState, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'

interface RewardsProps {
  totalHours: number
  elapsedSeconds: number
  isClockedIn: boolean
  theme?: 'green' | 'white' | 'orange' | 'cyan' | 'pink' | 'purple'
  user?: any
  onFocus?: () => void
}

// Compute hourly rate from user: if salary set (salaried), hourly = salary/2080, else use pay (default $65)
function computeHourlyRate(user: any): number {
  const salary = Number(user?.salary) || 0
  if (salary > 0) {
    return salary / 2080
  }
  const pay = Number(user?.pay)
  return pay > 0 ? pay : 65
}

export function Rewards({ totalHours, elapsedSeconds, isClockedIn, theme = 'green', user, onFocus }: RewardsProps) {
  const [hourlyRate, setHourlyRate] = useState(() => computeHourlyRate(user))
  const [ptoAccrualRate, setPtoAccrualRate] = useState(1 / 30) // 1 hour per 30 hours worked
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false)
  const prevCentsRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const liveTodayEarnings = isClockedIn
    ? (elapsedSeconds / 3600) * hourlyRate
    : 0

  const earnedToday = liveTodayEarnings
  const totalEarnings = totalHours * hourlyRate
  const accruedPTO = totalHours * ptoAccrualRate
  const isOvertime = totalHours > 8

  const themeColors: Record<'green' | 'white' | 'orange' | 'cyan' | 'pink' | 'purple', string> = {
    green: '#D7FE51',
    white: '#E5E7EB',
    orange: '#F97316',
    cyan: '#51FEFE',
    pink: '#FE51D7',
    purple: '#9B51FE',
  }
  const confettiColor = isOvertime ? '#FFAA00' : themeColors[theme]

  // Paycheck date helpers: 2nd Friday and last Friday of each month
  const getPaycheckDates = (year: number, month: number) => {
    let day = 1
    while (new Date(year, month, day).getDay() !== 5) day++
    const secondFriday = new Date(year, month, day + 7)
    const lastDay = new Date(year, month + 1, 0).getDate()
    let lastFridayDate = lastDay
    while (new Date(year, month, lastFridayDate).getDay() !== 5) lastFridayDate--
    const lastFriday = new Date(year, month, lastFridayDate)
    return { secondFriday, lastFriday }
  }

  const getNextPaycheck = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const year = today.getFullYear()
    const month = today.getMonth()
    const { secondFriday, lastFriday } = getPaycheckDates(year, month)

    if (today <= secondFriday) return secondFriday
    if (today <= lastFriday) return lastFriday
    const { secondFriday: nextSecond } = getPaycheckDates(year, month + 1)
    return nextSecond
  }

  const daysUntilNextPaycheck = () => {
    const next = getNextPaycheck()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const estimatedPaycheck = totalEarnings

  // Haptic ticker: fire vibration on each cent increment
  const triggerHaptic = useCallback((currentCents: number) => {
    if (currentCents !== prevCentsRef.current && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10)
      } catch {
        // Ignore if not supported
      }
    }
    prevCentsRef.current = currentCents
  }, [])

  useEffect(() => {
    if (!isClockedIn) return
    const cents = Math.floor(earnedToday * 100) % 100
    triggerHaptic(cents)
  }, [earnedToday, isClockedIn, triggerHaptic])

  // Neon green confetti from bottom when rewards tab focuses
  useEffect(() => {
    if (onFocus && !hasFiredConfetti) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 180,
          spread: 90,
          origin: { x: 0.5, y: 0.95 },
          colors: [confettiColor, '#39FF14', '#00CC00'],
        })
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 70,
            angle: 75,
            origin: { x: 0.3, y: 0.9 },
            colors: [confettiColor, '#39FF14'],
          })
        }, 120)
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 70,
            angle: 105,
            origin: { x: 0.7, y: 0.9 },
            colors: [confettiColor, '#00CC00'],
          })
        }, 240)
        setHasFiredConfetti(true)
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [onFocus, hasFiredConfetti])

  useEffect(() => {
    return () => setHasFiredConfetti(false)
  }, [])

  return (
    <div ref={containerRef} className="max-w-[1200px] mx-auto">
      <div className="glass rounded-3xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-semibold neon-green">Rewards</div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Rate:</span>
              <div className="flex items-center bg-zinc-900 rounded-xl px-3 py-1.5">
                <span className="text-zinc-400">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 bg-transparent text-right font-mono focus:outline-none"
                  min="1"
                />
                <span className="text-zinc-400">/hr</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">PTO:</span>
              <div className="flex items-center bg-zinc-900 rounded-xl px-3 py-1.5">
                <span className="text-zinc-400">1 hr /</span>
                <input
                  type="number"
                  value={(1 / ptoAccrualRate).toFixed(0)}
                  onChange={(e) => setPtoAccrualRate(Math.max(0.001, 1 / Math.max(1, parseFloat(e.target.value) || 30)))}
                  className="w-12 bg-transparent text-right font-mono focus:outline-none"
                  min="1"
                />
                <span className="text-zinc-400">hrs</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-500">Weekly earnings</div>
              <div className="font-semibold tabular-nums neon-green">${totalEarnings.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Three modules side-by-side */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-3xl p-6 flex-1">
            <div className="text-sm uppercase tracking-[2px] text-white mb-2">Today's Earnings</div>
            <div className="text-4xl font-medium mb-1.5 neon-green">{isClockedIn ? `$${earnedToday.toFixed(2)}` : 'CLOCK IN'}</div>
            <div className="text-sm text-zinc-400 mb-3">Real time earnings</div>
          </div>
          <div className="glass rounded-3xl p-6 flex-1">
            <div className="text-sm uppercase tracking-[2px] text-white mb-2">Today's Accrued PTO</div>
            <div className="text-4xl font-medium mb-1.5 neon-green">{isClockedIn ? `${accruedPTO.toFixed(2)} hrs` : 'CLOCK IN'}</div>
            <div className="text-sm text-zinc-400 mb-3">Real Time PTO Earned</div>
          </div>
          <div className="glass rounded-3xl p-6 flex-1">
            <div className="text-sm uppercase tracking-[2px] text-white mb-2">Estimated Next Paycheck</div>
            <div className="text-4xl font-medium mb-1.5 neon-green">${estimatedPaycheck.toFixed(0)}</div>
            <div className="text-sm text-zinc-400 mb-3">{daysUntilNextPaycheck()} days until next paycheck</div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500 pt-6">
          SwiftShift - Instant gratification for your hard work.
        </div>
      </div>
    </div>
  )
}
