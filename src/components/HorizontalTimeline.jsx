import { useRef, useState, useCallback } from 'react'
import { Calendar, Users, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, isToday, isSameDay, diffDays, addDays, startOfDay } from '../lib/timelineUtils'
import StepBlock        from './StepBlock'
import HandoverArrows   from './HandoverArrows'
import StepDetailDrawer from './StepDetailDrawer'
import ActivityLogPanel from './ActivityLogPanel'
import { useTimeline }  from '../hooks/useTimeline'
import { STATUS_CONFIG } from '../lib/constants'

const ROW_HEIGHT   = 48   // px per step row
const HEADER_H     = 80   // px for date header
const LEFT_COL_W   = 180  // px for step label column

const MODE_LABELS = { day: 'Jour', week: 'Semaine' }

export default function HorizontalTimeline({ client, onUpdateStep }) {
  const scrollRef = useRef(null)
  const {
    mode, setMode, colWidth,
    columns, rangeStart,
    steps, setSteps,
    activityLog, allUsers, logLoading,
    filterUser, setFilterUser,
    showLog, setShowLog,
    expandedStep, setExpandedStep,
    updateDates, dragStep, addLog,
  } = useTimeline(client)

  const [userFilter, setUserFilter] = useState('Tous')

  // Steps filtered by userFilter (owner)
  const visibleSteps = userFilter === 'Tous'
    ? steps
    : steps.filter(s => s.owner?.toLowerCase().includes(userFilter.toLowerCase()))

  const totalWidth = columns.length * colWidth

  // Today line position
  const todayOffset = diffDays(rangeStart, new Date()) * colWidth

  // Scroll helpers
  function scrollLeft()  { scrollRef.current?.scrollBy({ left: -colWidth * 7, behavior: 'smooth' }) }
  function scrollRight() { scrollRef.current?.scrollBy({ left:  colWidth * 7, behavior: 'smooth' }) }
  function scrollToday() {
    const x = todayOffset - 200
    scrollRef.current?.scrollTo({ left: Math.max(0, x), behavior: 'smooth' })
  }

  // Build unique owners for filter
  const owners = ['Tous', ...new Set(steps.map(s => s.owner).filter(Boolean))]

  // Group columns by month for header
  const months = columns.reduce((acc, col) => {
    const key = col.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = { label: key, count: 0 }
    acc[key].count++
    return acc
  }, {})

  function handleDrag(stepId, delta) {
    dragStep(stepId, delta, 'Admin')
    addLog({ step_id: stepId, user_name: 'Admin', action: 'drag_move', new_value: `${delta > 0 ? '+' : ''}${delta} jours` })
  }

  function handleUpdateDates(stepId, dates) {
    return updateDates(stepId, dates, 'Admin')
  }

  function handleUpdateStatus(stepId, status) {
    onUpdateStep?.(client.id, stepId, status)
    const step = steps.find(s => s.id === stepId)
    addLog({
      step_id: stepId, step_number: step?.step_number,
      user_name: 'Admin', action: 'status_change',
      old_value: step?.status, new_value: status,
    })
    if (status === 'done') {
      updateDates(stepId, { completed_at: new Date().toISOString() }, 'Admin')
    }
    if (status === 'doing' && !step?.started_at) {
      updateDates(stepId, { started_at: new Date().toISOString() }, 'Admin')
    }
  }

  return (
    <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-white" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-shrink-0 bg-white flex-wrap">
        {/* Mode toggle */}
        <div className="flex bg-bg rounded-lg p-0.5 gap-0.5">
          {Object.entries(MODE_LABELS).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border-none ${mode === m ? 'bg-white text-main shadow-sm' : 'bg-transparent text-info'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Nav arrows + Today */}
        <div className="flex items-center gap-1">
          <button onClick={scrollLeft}  className="p-1.5 rounded-lg border border-border hover:bg-bg transition-colors cursor-pointer"><ChevronLeft  size={14} /></button>
          <button onClick={scrollToday} className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-bold hover:bg-bg transition-colors cursor-pointer">Aujourd'hui</button>
          <button onClick={scrollRight} className="p-1.5 rounded-lg border border-border hover:bg-bg transition-colors cursor-pointer"><ChevronRight size={14} /></button>
        </div>

        {/* Owner filter */}
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-info" />
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
            className="text-[11px] border border-border rounded-lg px-2 py-1 outline-none focus:border-main bg-white cursor-pointer">
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto">
          {[['done','#13d275','Terminé'],['doing','#EE0669','En cours'],['wait','#7f88ad','Attente'],['blocked','#ff4861','Bloqué'],['todo','#D8DFE9','À faire']].map(([,color,label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-[10px] text-info">{label}</span>
            </div>
          ))}
        </div>

        {/* Activity log toggle */}
        <button
          onClick={() => setShowLog(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${showLog ? 'border-main bg-pink-50 text-main' : 'border-border hover:bg-bg text-info'}`}
        >
          <Clock size={13} /> Journal
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: step labels */}
        <div className="flex-shrink-0 bg-white border-r border-border" style={{ width: LEFT_COL_W }}>
          {/* Header spacer */}
          <div style={{ height: HEADER_H }} className="border-b border-border" />
          {/* Step rows */}
          {visibleSteps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 px-3 border-b border-border" style={{ height: ROW_HEIGHT }}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{
                  background: step.status === 'done' ? '#13d275' : step.status === 'doing' ? '#EE0669' : step.status === 'blocked' ? '#ff4861' : '#D8DFE9',
                  color: ['todo','wait'].includes(step.status) ? '#7f88ad' : '#fff',
                }}
              >
                {step.step_number}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold truncate leading-tight">{step.title}</div>
                <div className="text-[9px] text-info truncate">{step.owner} · {step.duration_label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: scrollable Gantt */}
        <div className="flex-1 overflow-auto relative" ref={scrollRef}>
          <div style={{ width: totalWidth, minWidth: totalWidth }} className="relative">

            {/* ── Date header ── */}
            <div className="sticky top-0 bg-white border-b border-border z-20" style={{ height: HEADER_H }}>
              {/* Month row */}
              <div className="flex border-b border-border" style={{ height: 28 }}>
                {Object.entries(months).map(([key, { label, count }]) => (
                  <div key={key} className="flex-shrink-0 flex items-center px-3 border-r border-border overflow-hidden"
                    style={{ width: count * colWidth, height: 28 }}>
                    <span className="text-[11px] font-bold capitalize text-text-base">{label}</span>
                  </div>
                ))}
              </div>
              {/* Day row */}
              <div className="flex" style={{ height: HEADER_H - 28 }}>
                {columns.map((col, i) => {
                  const today   = isToday(col)
                  const weekend = col.getDay() === 0 || col.getDay() === 6
                  return (
                    <div key={i}
                      className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-border text-[10px] ${weekend ? 'bg-gray-50' : ''} ${today ? 'bg-pink-50' : ''}`}
                      style={{ width: colWidth, height: HEADER_H - 28 }}
                    >
                      <span className={`font-bold ${today ? 'text-main' : 'text-info'}`}>
                        {col.toLocaleDateString('fr-FR', { weekday: 'short' })[0].toUpperCase()}
                      </span>
                      <span className={`text-[11px] font-bold ${today ? 'text-main' : 'text-text-base'}`}>
                        {col.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Grid + Blocks ── */}
            <div className="relative" style={{ height: visibleSteps.length * ROW_HEIGHT }}>

              {/* Column grid */}
              <div className="absolute inset-0 flex pointer-events-none">
                {columns.map((col, i) => {
                  const weekend = col.getDay() === 0 || col.getDay() === 6
                  const today   = isToday(col)
                  return (
                    <div key={i} className={`flex-shrink-0 border-r border-border/50 ${weekend ? 'bg-gray-50/50' : ''} ${today ? 'bg-pink-50/30' : ''}`}
                      style={{ width: colWidth, height: '100%' }} />
                  )
                })}
              </div>

              {/* Row dividers */}
              {visibleSteps.map((_, i) => (
                <div key={i} className="absolute left-0 right-0 border-b border-border/40"
                  style={{ top: (i + 1) * ROW_HEIGHT }} />
              ))}

              {/* Today vertical line */}
              {todayOffset > 0 && todayOffset < totalWidth && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-main z-10 pointer-events-none"
                  style={{ left: todayOffset }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-main" />
                </div>
              )}

              {/* Handover arrows */}
              <HandoverArrows
                steps={visibleSteps}
                colWidth={colWidth}
                rangeStart={rangeStart}
                rowHeight={ROW_HEIGHT}
              />

              {/* Step blocks */}
              {visibleSteps.map((step, rowIdx) => (
                <div key={step.id} className="absolute left-0 right-0" style={{ top: rowIdx * ROW_HEIGHT, height: ROW_HEIGHT }}>
                  <StepBlock
                    step={step}
                    colWidth={colWidth}
                    rangeStart={rangeStart}
                    onDragDelta={(id, delta) => handleDrag(id, delta)}
                    onClick={s => setExpandedStep(expandedStep?.id === s.id ? null : s)}
                    isExpanded={expandedStep?.id === step.id}
                  />
                </div>
              ))}
            </div>

            {/* ── Expanded step drawer (below grid) ── */}
            {expandedStep && (
              <div className="border-t-2 border-main">
                <StepDetailDrawer
                  step={steps.find(s => s.id === expandedStep.id) || expandedStep}
                  client={client}
                  onClose={() => setExpandedStep(null)}
                  onUpdateDates={handleUpdateDates}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Activity Log Panel (right) ── */}
        {showLog && (
          <ActivityLogPanel
            log={activityLog}
            loading={logLoading}
            users={allUsers}
            filterUser={filterUser}
            onFilterUser={setFilterUser}
            onClose={() => setShowLog(false)}
          />
        )}
      </div>
    </div>
  )
}
