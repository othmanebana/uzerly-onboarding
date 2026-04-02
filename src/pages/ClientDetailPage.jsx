import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { Button, Avatar, SolutionChip, StatusBadge, OwnerTag, Card, SectionHeader } from '../components/UI'
import SmartAssistant from '../components/SmartAssistant'
import StepForm from '../components/StepForm'
import { STATUS_CONFIG } from '../lib/constants'

// Color for the step number circle
function stepBg(status) {
  if (status === 'done')    return '#13d275'
  if (status === 'doing')   return '#EE0669'
  if (status === 'blocked') return '#ff4861'
  return '#D8DFE9'
}
function stepColor(status) {
  return ['todo', 'wait'].includes(status) ? '#7f88ad' : '#fff'
}

export default function ClientDetailPage({ client, onBack, onUpdateStep }) {
  const steps = client.steps ?? []
  const done  = steps.filter(s => s.status === 'done').length
  const pct   = steps.length ? Math.round((done / steps.length) * 100) : 0

  // Which step is expanded (inline)
  const [expandedId, setExpandedId] = useState(null)
  function toggleExpand(id) { setExpandedId(v => v === id ? null : id) }

  return (
    <div className="animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Retour pipeline
        </Button>
        <Avatar initials={client.initials} size={34} />
        <div>
          <div className="font-bold text-[1rem]">{client.name}</div>
          <div className="text-[11px] text-info">
            AM : {client.am || '—'} · Sales : {client.sales || '—'}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          <span className="font-bold text-main text-[1.1rem]">{pct}%</span>
        </div>
      </div>

      {/* ── Smart Assistant ── */}
      <SmartAssistant clientName={client.name} clientData={client} />

      {/* ── Steps ── */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-bold text-[0.85rem]">Timeline — Étapes d'onboarding</span>
          <span className="text-[11px] text-info">
            Cliquez sur une étape pour remplir ses informations
          </span>
        </div>

        {steps.length === 0 && (
          <div className="text-[12px] text-info text-center py-10">
            Aucune étape trouvée pour ce client.
          </div>
        )}

        {steps.map(step => {
          const isOpen = expandedId === step.id

          return (
            <div key={step.id} className="border-b border-border last:border-0">

              {/* ── Step row (always visible) ── */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
                  isOpen ? 'bg-pink-50' : 'hover:bg-bg'
                }`}
                onClick={() => toggleExpand(step.id)}
              >
                {/* Expand chevron */}
                <div className="flex-shrink-0 text-info w-4">
                  {isOpen
                    ? <ChevronDown size={14} />
                    : <ChevronRight size={14} />}
                </div>

                {/* Step number circle */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: stepBg(step.status), color: stepColor(step.status) }}
                >
                  {step.step_number}
                </div>

                {/* Title + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[12px]">{step.title}</span>
                    <StatusBadge status={step.status} />
                    <OwnerTag name={step.owner} />
                    <span className="text-[10px] text-info">{step.duration_label}</span>
                  </div>
                  <div className="text-[11px] text-info mt-0.5 truncate">{step.description}</div>
                </div>

                {/* Quick status select — stop propagation so it doesn't toggle expand */}
                <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                  <select
                    value={step.status}
                    onChange={e => onUpdateStep(client.id, step.id, e.target.value)}
                    className="px-2 py-1 text-[11px] border border-border rounded-lg bg-white outline-none cursor-pointer focus:border-main"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Inline expanded form ── */}
              {isOpen && (
                <StepForm step={step} />
              )}

            </div>
          )
        })}
      </Card>
    </div>
  )
}
