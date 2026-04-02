import { STATUS_CONFIG } from '../lib/constants'

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── SolutionChip ─────────────────────────────────────────────────────────────
const SOL_COLORS = {
  Email:   'bg-blue-100 text-blue-700',
  Display: 'bg-purple-100 text-purple-700',
  OnSite:  'bg-orange-100 text-orange-700',
  Acquisition: 'bg-teal-100 text-teal-700',
}
export function SolutionChip({ name }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mr-1 ${SOL_COLORS[name] || 'bg-gray-100 text-gray-600'}`}>
      {name}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.33, background: 'linear-gradient(135deg, #EE0669, #ff6b9d)' }}
    >
      {initials}
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: '#EE0669' }}
      />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white rounded-xl border border-border p-4 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, color = '#EE0669' }) {
  return (
    <div className="bg-secondary rounded-lg p-3 border border-border">
      <div className="text-[11px] text-info mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'default', size = 'md', onClick, className = '', disabled }) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50'
  const sizes = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-[12px]', lg: 'px-5 py-2 text-[13px]' }
  const variants = {
    default: 'bg-white text-text-base border-border hover:bg-bg',
    primary: 'bg-main text-white border-main hover:bg-main-dark',
    ghost:   'bg-transparent text-info border-transparent hover:bg-bg',
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">{label}</label>}
      <input
        className="w-full px-3 py-2 border border-border rounded-lg text-[12px] text-text-base bg-white outline-none focus:border-main transition-colors"
        {...props}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">{label}</label>}
      <select
        className="w-full px-3 py-2 border border-border rounded-lg text-[12px] text-text-base bg-white outline-none focus:border-main transition-colors cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[1rem] font-bold text-text-base">{title}</h2>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b-2 border-border mb-5 gap-0">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-[12px] font-semibold border-b-2 -mb-0.5 transition-all ${
            active === t.id ? 'text-main border-main' : 'text-info border-transparent hover:text-text-base'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── OwnerTag ─────────────────────────────────────────────────────────────────
export function OwnerTag({ name }) {
  return (
    <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">{name}</span>
  )
}
