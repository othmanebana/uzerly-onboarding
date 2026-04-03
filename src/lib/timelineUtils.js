// ─── Date helpers ─────────────────────────────────────────────────────────────

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function diffDays(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000)
}

export function formatDate(date, fmt = 'short') {
  if (!date) return '—'
  const d = new Date(date)
  if (fmt === 'short') return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  if (fmt === 'day')   return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  if (fmt === 'full')  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  if (fmt === 'month') return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  if (fmt === 'iso')   return d.toISOString().split('T')[0]
  return d.toLocaleDateString('fr-FR')
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function isToday(date) { return isSameDay(date, new Date()) }
export function isPast(date)  { return startOfDay(date) < startOfDay(new Date()) }

// Build array of days between start and end (inclusive)
export function buildDayColumns(start, end) {
  const cols = []
  let cur = startOfDay(start)
  const last = startOfDay(end)
  while (cur <= last) {
    cols.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return cols
}

// Build array of week start dates
export function buildWeekColumns(start, end) {
  const cols = []
  let cur = startOfDay(start)
  // Go to Monday
  const day = cur.getDay()
  cur = addDays(cur, day === 0 ? -6 : 1 - day)
  while (cur <= end) {
    cols.push(new Date(cur))
    cur = addDays(cur, 7)
  }
  return cols
}

// ─── Step duration offsets (J0, J1…) ─────────────────────────────────────────
// step_number → { offset: days from J0, duration: days }
export const STEP_TIMING = {
  1: { offset: 0,  duration: 1  },
  2: { offset: 1,  duration: 1  },
  3: { offset: 1,  duration: 1  },
  4: { offset: 2,  duration: 1  },
  5: { offset: 3,  duration: 7  },
  6: { offset: 10, duration: 3  },
  7: { offset: 7,  duration: 1  },
  8: { offset: 8,  duration: 1  },
  9: { offset: 14, duration: 1  },
}

export function getStepDates(step, clientCreatedAt) {
  const j0 = startOfDay(new Date(clientCreatedAt))

  // Use stored planned dates if available, else compute from template
  const timing = STEP_TIMING[step.step_number] || { offset: step.step_number - 1, duration: 1 }

  const plannedStart = step.planned_start
    ? startOfDay(new Date(step.planned_start))
    : addDays(j0, timing.offset)

  const plannedEnd = step.planned_end
    ? startOfDay(new Date(step.planned_end))
    : addDays(plannedStart, timing.duration)

  const actualStart = step.started_at   ? startOfDay(new Date(step.started_at))   : null
  const actualEnd   = step.completed_at ? startOfDay(new Date(step.completed_at)) : null
  const dueDate     = step.due_date     ? startOfDay(new Date(step.due_date))     : plannedEnd

  const isLate    = isPast(dueDate) && step.status !== 'done'
  const isDone    = step.status === 'done'
  const isBlocked = step.status === 'blocked'

  return { plannedStart, plannedEnd, actualStart, actualEnd, dueDate, isLate, isDone, isBlocked }
}

// ─── Step colors ──────────────────────────────────────────────────────────────
export function getStepColor(step) {
  if (step.status === 'done')    return { bg: '#13d275', text: '#fff', border: '#0fa85e' }
  if (step.status === 'blocked') return { bg: '#ff4861', text: '#fff', border: '#e03050' }
  if (step.status === 'doing')   return { bg: '#EE0669', text: '#fff', border: '#cc0558' }
  if (step.status === 'wait')    return { bg: '#7f88ad', text: '#fff', border: '#6a738f' }
  return { bg: '#e0e7ff', text: '#4338ca', border: '#a5b4fc' }
}

// ─── Gradient colors per step (like screenshot) ───────────────────────────────
export const STEP_GRADIENTS = [
  'linear-gradient(90deg,#667eea,#764ba2)',
  'linear-gradient(90deg,#EE0669,#ff6b9d)',
  'linear-gradient(90deg,#f093fb,#f5576c)',
  'linear-gradient(90deg,#4facfe,#00f2fe)',
  'linear-gradient(90deg,#43e97b,#38f9d7)',
  'linear-gradient(90deg,#fa709a,#fee140)',
  'linear-gradient(90deg,#a18cd1,#fbc2eb)',
  'linear-gradient(90deg,#fda085,#f6d365)',
  'linear-gradient(90deg,#89f7fe,#66a6ff)',
]

export function getStepGradient(stepNumber) {
  return STEP_GRADIENTS[(stepNumber - 1) % STEP_GRADIENTS.length]
}
