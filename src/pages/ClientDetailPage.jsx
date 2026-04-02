import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button, Avatar, SolutionChip, StatusBadge, OwnerTag, Card, SectionHeader } from '../components/UI'
import SmartAssistant from '../components/SmartAssistant'
import { ONBOARDING_STEPS_TEMPLATE, STATUS_CONFIG } from '../lib/constants'

function buildSteps(client) {
  const statuses = ['done','done','done','doing','doing','wait','todo','todo','todo']
  return ONBOARDING_STEPS_TEMPLATE.map((s, i) => ({ ...s, status: statuses[i] || 'todo' }))
}

export default function ClientDetailPage({ client, onBack }) {
  const [steps, setSteps] = useState(() => buildSteps(client))

  function setStatus(id, status) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const done = steps.filter(s => s.status === 'done').length
  const pct  = Math.round((done / steps.length) * 100)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Retour pipeline
        </Button>
        <Avatar initials={client.initials} size={34} />
        <div>
          <div className="font-bold text-[1rem]">{client.name}</div>
          <div className="text-[11px] text-info">AM : {client.am} · Sales : {client.sales}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          <span className="font-bold text-main text-[1rem]">{pct}%</span>
        </div>
      </div>

      {/* Smart Assistant */}
      <SmartAssistant clientName={client.name} />

      {/* Steps */}
      <Card>
        <SectionHeader title="Timeline Admin — Override">
          <span className="text-[11px] text-info">Modifiez les statuts directement</span>
        </SectionHeader>
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className="flex items-start gap-3 p-3 bg-bg rounded-lg border border-border">
              {/* Number */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{
                  background: step.status === 'done' ? '#13d275'
                    : step.status === 'doing' ? '#EE0669'
                    : step.status === 'blocked' ? '#ff4861'
                    : '#D8DFE9',
                  color: ['todo','wait'].includes(step.status) ? '#7f88ad' : '#fff',
                }}
              >
                {step.id}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[12px]">{step.title}</span>
                  <StatusBadge status={step.status} />
                  <OwnerTag name={step.owner} />
                  <span className="text-[10px] text-info">{step.duration}</span>
                </div>
                <div className="text-[11px] text-info mt-0.5">{step.desc}</div>
              </div>

              {/* Override select */}
              <select
                value={step.status}
                onChange={e => setStatus(step.id, e.target.value)}
                className="px-2 py-1 text-[11px] border border-border rounded-lg bg-white outline-none cursor-pointer focus:border-main"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
