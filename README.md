# SwiftShift Master Project Document

**The Workday Killer** — A lightning-fast, zero-friction timesheet app for modern teams.

## 1. Product Overview & Pitch

**The One-Sentence Pitch:**
SwiftShift is a frictionless, AI-powered timesheet application that replaces clunky legacy HR portals with hardware-integrated clock-ins and a gamified, real-time financial dashboard designed to protect employee flow state.

**Presentation Hooks (Intro Options):**
* **The Hardware Flex:** *(Press the Action Button. Siri announces: "Successfully clocked in.")* "That took zero seconds of screen time. No passwords. No drop-down menus. Right now, brilliant minds are losing their flow state fighting with legacy software just to tell HR they did their jobs. Workday doesn't just waste time; it kills momentum. Meet SwiftShift."
* **The Cultural Mismatch:** "Imagine hiring a Formula 1 driver, putting them on the track, and forcing them to drive a 2012 Toyota Camry with 106,000 miles on it. That is what happens when you hire elite engineers and force them to use administrative software built in 2004. It’s time our internal tools actually looked and felt like the future."
* **The Financial Hemorrhage:** "When you factor in the 3.5x login failure rate, the 23 minutes it takes to regain deep-work focus after a timeout, and the hours managers spend chasing missing entries, legacy software costs thousands of hours of high-impact output. SwiftShift is an automated, zero-friction financial ledger that protects our most expensive asset: human focus."
* **The Casino Vault (Gamification):** "How do you get elite talent to care about corporate compliance? You addict them. We took the most boring task in the corporate world and injected it with the exact same behavioral loops as a high-end video game. We replaced static grids with real-time slot machine tickers and liquid glass aesthetics. We aren't just tracking time; we are gamifying compensation."

---

## 2. Core Principles (System Tenets)

1.  **First principles thinking** — Find the *best possible* solution, not just a good one. Start from fundamentals, not existing patterns.
2.  **Question every assumption** — Shake up established processes. If something has always been done a certain way, that's exactly where opportunity lives.
3.  **Delete the unnecessary** — Remove parts of the process that add no value. If a step can be eliminated, eliminate it.
4.  **Simplify and optimize** — Difficult problems require simple solutions. Complexity is a bug, not a feature.
5.  **Accelerate 5×** — Don't aim for 10% better. Ask: *how can this be 5× faster or better?* Think in orders of magnitude.
6.  **Automate everything** — Reduce manual effort to zero. Manual work is the biggest bottleneck.

---

## 3. Master Feature Checklist (The PRD)

### Core Architecture (The Workday Killers)
- [ ] **Zero-Login Persistence:** Biometric tokens and FaceID background authentication.
- [ ] **No-Menu Navigation:** Three-icon navigation capsule (Clock, Reward, Hourglass).
- [ ] **Action Button Integration:** Direct hardware trigger for clocking in/out.
- [ ] **Dynamic Island / Live Activities:** Real-time timer on the iOS lock screen.
- [ ] **Liquid Glass Aesthetic:** Deep Black (RGB 27, 24, 14) with Electric Green (RGB 207, 246, 78) accents.

### The Home HUD (Present State)
- [ ] **One-Tap Clock In:** A massive, shimmering Electric Green focal button.
- [ ] **The Target Ring:** A segmented, futuristic speedometer tracking the 8-hour daily goal.
- [ ] **Active HUD Morph:** UI fluidly transforms from "Resting" to "Active" state upon clocking in.
- [ ] **On-Time Streak Badge:** A glowing flame icon tracking the "Zero-Edit" and Punctuality streak.

### The Casino Vault (Reward Tab)
- [ ] **Real-Time Earnings Ticker:** 3D mechanical slot-machine odometers showing gross pay increasing by the second.
- [ ] **The Haptic Ticker:** Micro-vibrations (Taptic Engine) syncing with every cent earned.
- [ ] **Freedom Meter:** Spinning odometer for PTO accruals showing fractional hours gained in real-time.
- [ ] **Overtime Overdrive:** Entire UI shifts to Gold with 1.5x ticker speed when exceeding 40 hours.
- [ ] **Zero-Search Vault:** Instant, one-tap access to the latest Payslip and W-2.
- [ ] **End-of-Day Loot Drop:** 3D animation where the day's earnings "drop" into the vault upon clocking out.

### The Continuum (Insight Tab)
- [ ] **Heatmap Timeline:** A scrubbable, frosted-glass horizontal bar for visual history.
- [ ] **Temporal Analysis:** AI-synthesized insights explaining work patterns and suggesting optimizations.
- [ ] **Predictive Forecasting:** AI drafts the entire upcoming week based on history.
- [ ] **One-Tap Pre-Approval:** Approve next week's 40 hours in advance.

### InstaApply (Job Portal Bypass)
- [ ] **1TapApply / ApplyOnce:** Upload resume once → semantic match against open roles.
- [ ] **AI Semantic Scoring:** Jobs sort by fit: Best Match (≥90), Strong Match (≥80), Good Match (≥70). 

---

## 4. UI/UX "Vibe Coding" Prompts

**1. The Master Tech Stack & Aesthetic**
> "Initialize a Next.js 14 project using TypeScript, Tailwind CSS, and Framer Motion. Set up a Supabase client for a real-time PostgreSQL backend. Our theme uses RGB(27,24,14) for backgrounds and RGB(207,246,78) for primary accents. Apply a glassmorphism design system for all components."

**2. The Earnings Odometer (Casino Vault)**
> "Build the 'Earnings Odometer' React component. Background: `rgb(27, 24, 14)`. Main card: glassmorphism (`bg-white/5`, `backdrop-blur-xl`, `border-white/10`) with an Electric Green `rgb(207, 246, 78)` drop shadow. Use a library like `react-odometerjs` or Framer Motion to build a mechanical odometer effect. The container should simulate a physical cutout in the glass using inner shadows (`shadow-inner`, `bg-black/40`). The final digits representing cents must continuously scroll upward vertically, clipping at the bounds to create the illusion of a spinning physical dial."

**3. The Target Ring (Home HUD)**
> "Build the 'Target Ring' circular progress component. Parent container is a glassmorphism card. Build the ring using an SVG `<svg>`. The track is `stroke-white/10`. The active progress stroke is exactly `rgb(207, 246, 78)` with a `drop-shadow` filter for a neon glow. Make the stroke segmented using `strokeDasharray`. Use Framer Motion's `motion.circle` to animate `strokeDashoffset` from 0% to current progress. Center text displays elapsed time ('00:14:05') in large white text, and remaining time below it in muted gray."

**4. The Punctuality Streak Badge**
> "Build a React component `PunctualityStreakBadge`. It accepts props: `expectedStartTime`, `actualPunchTime`, and `currentStreakCount`. Logic: If the user clocks in before or within a 5-minute grace period of their target time, they secure the streak (freeze logic on weekends). UI is a pill-shaped Liquid Glass badge. Active Streak: Show a glowing Electric Green flame icon (`drop-shadow-[0_0_8px_rgba(207,246,78,0.8)]`) with a Framer Motion burst on mount. Broken Streak: Flame turns into a muted gray cinder, glass loses neon glow."

---

## 5. Hardware Integration: Siri Shortcut & Webhook Guide

To enable "Hey Siri, clock me in" and map the physical Action Button:

1.  **Create the API Route (Next.js):**
    * Route: `/api/siri-punch`
    * Functionality: Accepts a POST request, finds the user ID in the Supabase DB, logs the timestamp, returns JSON `{"message": "Successfully clocked in."}`.
2.  **Create the Apple Shortcut:**
    * Open Shortcuts app, create new, name it "Clock me in".
    * Add Action: **"Get Contents of URL"**
    * Paste API Link: `https://your-deployed-app.com/api/siri-punch` (Use `ngrok` for local testing).
    * Set Method to POST, add JSON body (e.g., `{"userId": "123"}`).
3.  **Add Siri Voice Confirmation:**
    * Add Action: **"Date"** (Current Date).
    * Add Action: **"Format Date"** (Date: None, Time: Short).
    * Add Action: **"Speak Text"** -> `"Successfully clocked in at [Formatted Date]"`
4.  **Polish (Optional):**
    * Add **"Set Focus"** to instantly turn on "Do Not Disturb" / "Deep Work" mode when the button is pressed.
    * Add **"Choose from Menu"** at the top of the shortcut to select specific Project Codes before the API payload is sent.

---

## 6. AI Workflows & Tech Stack

### AI Workflows
* **AI Assistant (RAG):** Uses ChromaDB to index user documents. Queries top 5 relevant chunks (cosine similarity < 1.5), injects into the LLM system prompt. Enables context-aware responses regarding hours, PTO, and HR policies.
* **Smart Tax (Agentic):** Uses an agentic loop with tool calling (`list_files`, `extract_file`, `reconcile`, `calculate_tax`) to autonomously calculate Form 1040 without human guidance.
* **InstaApply (Semantic Match):** Extracts resume text via pypdf/python-docx. AI scores jobs 0–100 for fit, rendering colored match badges on the frontend.

### Tech Stack
| Layer | Tech |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript, Next.js 14 / Vite, Tailwind CSS |
| **UI Components** | Framer Motion, canvas-confetti, Sonner toasts |
| **Backend** | Supabase (PostgreSQL + Realtime) / Flask (Python) |
| **AI Integration** | Advanced LLM SDK (`api/ai/chat`) |
| **Infrastructure** | Vercel (Edge Functions) / S3 for document storage |

---

## 7. Database Schema & API Endpoints

### Database Schema (PostgreSQL)
* **users:** `id` (SERIAL PK), `first_name`, `last_name`, `email` (UNIQUE), `password_hash`, `job_role`, `manager_name`
* **clock_sessions:** `id` (INTEGER PK), `employee_id` (INTEGER), `clock_in` (TEXT), `clock_out` (TEXT), `duration_minutes` (INTEGER), `notes` (TEXT)
* **time_entries:** `id` (INTEGER PK), `employee_id` (INTEGER), `date`, `project`, `task`, `start_time`, `end_time`, `duration_minutes`, `description`
* **jobs:** `job_id` (SERIAL PK), `description`, `hiring_manager_id`, `date_posted`, `date_expiry`, `salary`, `location`

### Core API Endpoints
* `POST /api/auth/signin` — Login
* `GET/POST /api/clock-sessions` — Clock in/out, list sessions
* `POST /api/siri-punch` — Webhook for iOS Shortcut hardware trigger
* `POST /api/ai/chat` — AI Assistant interactions
* `GET/POST /api/jobs` — Post and list jobs

---

**Built by:** Trevor Dixon, CEO/Owner
