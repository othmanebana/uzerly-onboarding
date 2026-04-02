import { ArrowLeft } from 'lucide-react'
import { Button, Avatar, SolutionChip, StatusBadge, OwnerTag, Card, SectionHeader } from '../components/UI'
import SmartAssistant from '../components/SmartAssistant'
import { STATUS_CONFIG } from '../lib/constants'

export default function ClientDetailPage({ client, onBack, onUpdateStep }) {
  const steps = client.steps ?? []
  const done  = steps.filter(s => s.status === 'done').length
  const pct   = steps.length ? Math.round((done / steps.length) * 100) : 0

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
          <div className="text-[11px] text-info">AM : {client.am || '—'} · Sales : {client.sales || '—'}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          <span className="font-bold text-main text-[1rem]">{pct}%</span>
        </div>
      </div>

      {/* Smart Assistant */}
      <SmartAssistant clientName={client.name} clientData={client} />

      {/* Steps with override */}
      <Card>
        <SectionHeader title="Timeline Admin — Override">
          <span className="text-[11px] text-info">Modifiez les statuts directement</span>
        </SectionHeader>

        {steps.length === 0 && (
          <div className="text-[12px] text-info text-center py-8">Aucune étape trouvée pour ce client.</div>
        )}

        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id} className="flex items-start gap-3 p-3 bg-bg rounded-lg border border-border">
              {/* Step number */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{
                  background:
                    step.status === 'done'    ? '#13d275' :
                    step.status === 'doing'   ? '#EE0669' :
                    step.status === 'blocked' ? '#ff4861' : '#D8DFE9',
                  color: ['todo','wait'].includes(step.status) ? '#7f88ad' : '#fff',
                }}
              >
                {step.step_number}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[12px]">{step.title}</span>
                  <StatusBadge status={step.status} />
                  <OwnerTag name={step.owner} />
                  <span className="text-[10px] text-info">{step.duration_label}</span>
                </div>
                <div className="text-[11px] text-info mt-0.5">{step.description}</div>
              </div>

              {/* Override select — persists to Supabase via onUpdateStep */}
              <select
                value={step.status}
                onChange={e => onUpdateStep(client.id, step.id, e.target.value)}
                className="px-2 py-1 text-[11px] border border-border rounded-lg bg-white outline-none cursor-pointer focus:border-main flex-shrink-0"
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
