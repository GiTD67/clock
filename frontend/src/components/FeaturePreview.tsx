import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '⏱', title: 'Time Clock', desc: 'Clock in/out with one click. Real-time earnings display and break tracking.' },
  { icon: '📋', title: 'Timesheet', desc: 'View, edit, and submit all your time entries. Track hours by project and task.' },
  { icon: '🏆', title: 'Rewards', desc: 'Gamified daily streaks and real-time earnings Odometer for every second worked.' },
  { icon: '💳', title: 'Payroll & Reports', desc: 'Full pay details, analytics dashboards, and exportable reports.' },
  { icon: '💰', title: 'AI Tax Filing', desc: 'Upload your W-2 or 1099 and Swifty AI fills out your 1040 instantly.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Chat with Swifty for instant HR answers, leave policy info, and more.' },
  { icon: '⚡', title: 'InstaApply', desc: 'Upload your resume once — get matched to jobs and apply in seconds.' },
  { icon: '🛡', title: 'Insurance & Benefits', desc: 'Browse and manage your health, dental, and vision benefits.' },
  { icon: '📊', title: 'Org Chart', desc: 'Visualize your entire company structure at a glance.' },
]

interface FeaturePreviewProps {
  onClose: () => void
  accentHex?: string
}

export function FeaturePreview({ onClose, accentHex = '#D7FE51' }: FeaturePreviewProps) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25 }}
        className="glass w-full max-w-[560px] rounded-3xl border border-white/10 overflow-hidden"
        style={{ boxShadow: `0 0 60px -20px ${accentHex}25, 0 28px 72px -14px rgba(0,0,0,0.85)` }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs tracking-[3px] uppercase" style={{ color: accentHex }}>
              Product Tour
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
              aria-label="Close feature preview"
            >
              ×
            </button>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">Everything you need.</h2>
          <p className="text-zinc-500 text-sm">SwiftShift is your all-in-one AI-powered HR platform.</p>
        </div>

        {/* Feature grid */}
        <div className="px-8 pb-6 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/8 p-4 hover:border-white/15 transition-colors"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div className="text-2xl mb-2 leading-none">{f.icon}</div>
                <div className="font-semibold text-sm mb-1 text-white">{f.title}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 border-t border-white/8">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: accentHex, color: accentHex === '#D7FE51' || accentHex === '#E5E7EB' || accentHex === '#51FEFE' || accentHex === '#FE51D7' ? '#000' : '#fff' }}
          >
            Got it — let's go
          </button>
        </div>
      </motion.div>
    </div>
  )
}
