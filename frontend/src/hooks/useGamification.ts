import { useState, useCallback, useEffect } from 'react'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: string
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  xpReward: number
  progress: number
  goal: number
  completed: boolean
}

export interface GamificationState {
  xp: number
  level: number
  levelTitle: string
  xpToNextLevel: number
  xpThisLevel: number
  achievements: Achievement[]
  dailyChallenges: DailyChallenge[]
  totalActionsToday: Record<string, number>
}

const LEVELS = [
  { level: 1, title: 'Recruit', xpRequired: 0 },
  { level: 2, title: 'Associate', xpRequired: 500 },
  { level: 3, title: 'Analyst', xpRequired: 1500 },
  { level: 4, title: 'Specialist', xpRequired: 3500 },
  { level: 5, title: 'Senior', xpRequired: 7500 },
  { level: 6, title: 'Lead', xpRequired: 15000 },
  { level: 7, title: 'Principal', xpRequired: 30000 },
  { level: 8, title: 'Director', xpRequired: 60000 },
  { level: 9, title: 'VP', xpRequired: 100000 },
  { level: 10, title: 'Legend', xpRequired: 200000 },
]

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_clock_in', name: 'First Punch', description: 'Clock in for the very first time', icon: '⏱️', xpReward: 100 },
  { id: 'early_bird', name: 'Early Bird', description: 'Clock in before 9:00 AM', icon: '🌅', xpReward: 75 },
  { id: 'night_owl', name: 'Night Owl', description: 'Work past 8:00 PM', icon: '🦉', xpReward: 75 },
  { id: 'perfect_day', name: 'Perfect Day', description: 'Work exactly 8 hours in a day', icon: '⭐', xpReward: 200 },
  { id: 'overtime', name: 'Overtime Warrior', description: 'Work more than 10 hours in a day', icon: '⚡', xpReward: 150 },
  { id: 'streak_3', name: 'On a Roll', description: 'Maintain a 3-day clock-in streak', icon: '🔥', xpReward: 150 },
  { id: 'streak_7', name: 'On Fire', description: 'Maintain a 7-day clock-in streak', icon: '🚀', xpReward: 350 },
  { id: 'streak_30', name: 'Unstoppable', description: 'Maintain a 30-day clock-in streak', icon: '💎', xpReward: 1000 },
  { id: 'timesheet_submit', name: 'Timesheet Pro', description: 'Submit a timesheet', icon: '📋', xpReward: 100 },
  { id: 'timesheet_3', name: 'Consistent Logger', description: 'Submit 3 timesheets', icon: '🗂️', xpReward: 300 },
  { id: 'ai_chat', name: 'AI Whisperer', description: 'Send your first message to Swifty', icon: '🤖', xpReward: 50 },
  { id: 'ai_chat_10', name: 'Swifty BFF', description: 'Have 10 conversations with Swifty', icon: '💬', xpReward: 200 },
  { id: 'tax_filing', name: 'Tax Wizard', description: 'Complete an AI tax filing', icon: '🧾', xpReward: 300 },
  { id: 'resume_upload', name: 'Resume Ready', description: 'Upload your resume to InstaApply', icon: '📄', xpReward: 75 },
  { id: 'job_apply', name: 'Go-Getter', description: 'Apply to a job opening', icon: '💼', xpReward: 100 },
  { id: 'org_explorer', name: 'Org Explorer', description: 'View the company org chart', icon: '🗺️', xpReward: 25 },
]

function computeLevel(xp: number): { level: number; title: string; xpToNextLevel: number; xpThisLevel: number } {
  let currentLevel = LEVELS[0]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i]
      break
    }
  }
  const nextLevel = LEVELS.find(l => l.xpRequired > xp)
  const xpThisLevel = xp - currentLevel.xpRequired
  const xpToNextLevel = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 1
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpToNextLevel,
    xpThisLevel,
  }
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getDailyChallenges(todayKey: string, actionsToday: Record<string, number>): DailyChallenge[] {
  // Rotate challenges based on day-of-year so they change daily
  const day = new Date(todayKey)
  const dayOfYear = Math.floor((day.getTime() - new Date(day.getFullYear(), 0, 0).getTime()) / 86400000)

  const allChallenges: DailyChallenge[] = [
    {
      id: 'daily_clock_in',
      title: 'Clock In Today',
      description: 'Start your workday by clocking in',
      xpReward: 50,
      progress: Math.min(actionsToday['clock_in'] || 0, 1),
      goal: 1,
      completed: (actionsToday['clock_in'] || 0) >= 1,
    },
    {
      id: 'daily_early',
      title: 'Early Bird',
      description: 'Clock in before 9 AM',
      xpReward: 75,
      progress: Math.min(actionsToday['early_clock_in'] || 0, 1),
      goal: 1,
      completed: (actionsToday['early_clock_in'] || 0) >= 1,
    },
    {
      id: 'daily_chat',
      title: 'Ask Swifty',
      description: 'Send a message to the AI assistant',
      xpReward: 40,
      progress: Math.min(actionsToday['chat_message'] || 0, 1),
      goal: 1,
      completed: (actionsToday['chat_message'] || 0) >= 1,
    },
    {
      id: 'daily_3h',
      title: 'Three-Hour Hustle',
      description: 'Work at least 3 hours today',
      xpReward: 100,
      progress: Math.min(actionsToday['hours_worked'] || 0, 3),
      goal: 3,
      completed: (actionsToday['hours_worked'] || 0) >= 3,
    },
    {
      id: 'daily_8h',
      title: 'Full Day',
      description: 'Complete a full 8-hour workday',
      xpReward: 200,
      progress: Math.min(actionsToday['hours_worked'] || 0, 8),
      goal: 8,
      completed: (actionsToday['hours_worked'] || 0) >= 8,
    },
    {
      id: 'daily_timesheet',
      title: 'Log Your Time',
      description: 'Update your timesheet today',
      xpReward: 60,
      progress: Math.min(actionsToday['timesheet_update'] || 0, 1),
      goal: 1,
      completed: (actionsToday['timesheet_update'] || 0) >= 1,
    },
  ]

  // Pick 3 challenges based on day rotation
  const indices = [
    dayOfYear % allChallenges.length,
    (dayOfYear + 2) % allChallenges.length,
    (dayOfYear + 4) % allChallenges.length,
  ]
  const unique = [...new Set(indices)]
  while (unique.length < 3) unique.push((unique[unique.length - 1] + 1) % allChallenges.length)
  return unique.slice(0, 3).map(i => allChallenges[i])
}

export function useGamification() {
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('gam_xp') || '0', 10))
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('gam_unlocked') || '[]') } catch { return [] }
  })
  const [actionsToday, setActionsToday] = useState<Record<string, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gam_actions_today') || '{}')
      if (saved.date !== getTodayKey()) return { date: getTodayKey() }
      return saved
    } catch { return { date: getTodayKey() } }
  })
  const [pendingLevelUp, setPendingLevelUp] = useState<{ level: number; title: string } | null>(null)
  const [xpPopups, setXpPopups] = useState<Array<{ id: number; amount: number; label: string }>>([])

  const levelInfo = computeLevel(xp)

  const achievements: Achievement[] = ALL_ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedAt: unlockedIds.includes(a.id) ? (localStorage.getItem(`gam_ach_${a.id}`) || undefined) : undefined,
  }))

  const dailyChallenges = getDailyChallenges(getTodayKey(), actionsToday)

  const unlockAchievement = useCallback((id: string, bonusXp?: number) => {
    setUnlockedIds(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      localStorage.setItem('gam_unlocked', JSON.stringify(next))
      localStorage.setItem(`gam_ach_${id}`, new Date().toISOString())
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === id)
      if (ach) {
        const reward = bonusXp ?? ach.xpReward
        setXp(prevXp => {
          const oldLevel = computeLevel(prevXp).level
          const newXp = prevXp + reward
          const newLevel = computeLevel(newXp).level
          localStorage.setItem('gam_xp', String(newXp))
          if (newLevel > oldLevel) {
            const info = computeLevel(newXp)
            setPendingLevelUp({ level: newLevel, title: info.title })
          }
          return newXp
        })
      }
      return next
    })
  }, [])

  const addXp = useCallback((amount: number, label: string = '') => {
    setXp(prev => {
      const oldLevel = computeLevel(prev).level
      const newXp = prev + amount
      const newLevel = computeLevel(newXp).level
      localStorage.setItem('gam_xp', String(newXp))
      if (newLevel > oldLevel) {
        const info = computeLevel(newXp)
        setPendingLevelUp({ level: newLevel, title: info.title })
      }
      return newXp
    })
    const id = Date.now() + Math.random()
    setXpPopups(prev => [...prev, { id, amount, label }])
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 2000)
  }, [])

  const trackAction = useCallback((action: string, value: number = 1) => {
    setActionsToday(prev => {
      const today = getTodayKey()
      const base = prev.date === today ? prev : { date: today }
      const next = { ...base, [action]: (base[action] || 0) + value }
      localStorage.setItem('gam_actions_today', JSON.stringify(next))
      return next
    })
  }, [])

  // Award XP for completing daily challenges when they become complete
  const completedChallengeKey = dailyChallenges.filter(c => c.completed).map(c => c.id).join(',')
  useEffect(() => {
    if (!completedChallengeKey) return
    const key = `gam_done_${getTodayKey()}`
    const done: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    const ids = completedChallengeKey.split(',').filter(Boolean)
    let changed = false
    ids.forEach(id => {
      if (!done.includes(id)) {
        const challenge = getDailyChallenges(getTodayKey(), actionsToday).find(c => c.id === id)
        if (challenge) {
          done.push(id)
          changed = true
          addXp(challenge.xpReward, `Challenge: ${challenge.title}`)
        }
      }
    })
    if (changed) localStorage.setItem(key, JSON.stringify(done))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedChallengeKey])

  const dismissLevelUp = useCallback(() => setPendingLevelUp(null), [])

  return {
    xp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpToNextLevel: levelInfo.xpToNextLevel,
    xpThisLevel: levelInfo.xpThisLevel,
    achievements,
    dailyChallenges,
    actionsToday,
    pendingLevelUp,
    xpPopups,
    addXp,
    trackAction,
    unlockAchievement,
    dismissLevelUp,
  }
}
