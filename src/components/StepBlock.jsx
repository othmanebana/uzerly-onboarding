import { useState, useRef } from 'react'
import { MoreHorizontal, GripHorizontal, AlertTriangle } from 'lucide-react'
import { formatDate, getStepGradient, getStepColor, diffDays, startOfDay } from '../lib/timelineUtils'

export default function StepBlock({
  step,
  colWidth,
  rangeStart,
  onDragDelta,
  onClick,
  isExpanded,
  showHandoverArrow,
}) {
  const { _dates: d } = step
  if (!d) return null

  const [dragging, setDragging]     = useState(false)
  const [showMenu,  setShowMenu]    = useState(false)
  const dragStartX = useRef(null)
  const dragStartDay = useRef(null)

  // Position on canvas
  const leftDays  = diffDays(rangeStart, d.plannedStart)
  const widthDays = Math.max(1, diffDays(d.plannedStart, d.plannedEnd))
  const left  = leftDays  * colWidth
  const width = widthDays * colWidth - 4

  // Clamp to visible area
  if (left < -200 || width < 4) return null

  const gradient = d.isDone
    ? 'linear-gradient(90deg,#13d275,#0fa85e)'
    : d.isLate
    ? 'linear-gradient(90deg,#ff4861,#e03050)'
    : d.isBlocked
    ? 'linear-gradient(90deg,#ff4861,#ff8c00)'
    : getStepGradient(step.step_number)

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleMouseDown(e) {
    if (e.target.closest('.no-drag')) return
    e.preventDefault()
    dragStartX.current   = e.clientX
    dragStartDay.current = 0
    setDragging(true)

    function onMove(ev) {
      const deltaPx  = ev.clientX - dragStartX.current
      const deltaDays = Math.round(deltaPx / colWidth)
      if (deltaDays !== dragStartDay.current) {
        dragStartDay.current = deltaDays
        onDragDelta?.(step.id, deltaDays)
        dragStartX.current = ev.clientX
      }
    }
    function onUp() {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  const tooltipText = `${step.title}
Début : ${formatDate(d.plannedStart)}
Fin planifiée : ${formatDate(d.plannedEnd)}
${d.isLate ? '⚠ En retard !' : ''}
Statut : ${step.status}`

  return (
    <div
      className={`absolute flex items-center rounded-xl text-white select-none group transition-shadow ${dragging ? 'shadow-xl z-30 scale-y-105' : 'shadow-sm z-10 hover:shadow-md hover:z-20'} ${isExpanded ? 'ring-2 ring-white ring-offset-1' : ''}`}
      style={{
        left,
        width:      Math.max(width, 40),
        height:     36,
        background: gradient,
        cursor:     dragging ? 'grabbing' : 'grab',
        top:        2,
      }}
      onMouseDown={handleMouseDown}
      onClick={e => { if (!dragging) { e.stopPropagation(); onClick?.(step) } }}
      title={tooltipText}
    >
      {/* Drag grip */}
      <div className="flex-shrink-0 px-1.5 opacity-60">
        <GripHorizontal size={12} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-[11px] font-bold truncate leading-tight">
          {width > 80 ? step.title : `E${step.step_number}`}
        </span>
        {d.isLate && (
          <AlertTriangle size={11} className="flex-shrink-0 text-yellow-200" />
        )}
      </div>

      {/* Owner tag */}
      {width > 120 && step.owner && (
        <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full mr-1 flex-shrink-0 truncate max-w-[60px]">
          {step.owner}
        </span>
      )}

      {/* Menu */}
      <button
        className="no-drag flex-shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20"
        onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
      >
        <MoreHorizontal size={12} />
      </button>

      {/* Pause indicators (like screenshot) */}
      {step.status === 'wait' && (
        <>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70 rounded-full" style={{ left: 6 }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70 rounded-full" style={{ left: 10 }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70 rounded-full" style={{ right: 6 }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70 rounded-full" style={{ right: 10 }} />
        </>
      )}

      {/* Dropdown menu */}
      {showMenu && (
        <div
          className="no-drag absolute top-10 right-0 bg-white border border-border rounded-xl shadow-xl z-50 py-1 min-w-[160px]"
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: 'Ouvrir les détails', action: () => { onClick?.(step); setShowMenu(false) } },
            { label: 'Marquer En cours',   action: () => setShowMenu(false) },
            { label: 'Marquer Terminé',    action: () => setShowMenu(false) },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-bg transition-colors text-text-base">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
