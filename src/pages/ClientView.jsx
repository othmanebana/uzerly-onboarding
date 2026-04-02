import { useState } from 'react'
import { Check, Upload, X } from 'lucide-react'
import { Card, Tabs, SolutionChip, ProgressBar, OwnerTag, StatusBadge, Button } from '../components/UI'
import SmartAssistant from '../components/SmartAssistant'
import { ONBOARDING_STEPS_TEMPLATE, STATUS_CONFIG } from '../lib/constants'

const TABS = [
  { id: 'timeline', label: 'Ma Timeline' },
  { id: 'fichiers', label: 'Mes Fichiers' },
  { id: 'infos',    label: 'Mes Infos' },
]

const REQUIRED_FILES = [
  { name: 'BDC signé',              required: true },
  { name: 'Attestation de mandat',  required: false },
  { name: 'NDA',                    required: false },
  { name: 'K-Bis',                  required: false },
]

function buildSteps() {
  const statuses = ['done','done','done','doing','doing','wait','todo','todo','todo']
  return ONBOARDING_STEPS_TEMPLATE.map((s, i) => ({ ...s, status: statuses[i] || 'todo' }))
}

export default function ClientView({ client }) {
  const [tab, setTab]       = useState('timeline')
  const [steps]             = useState(buildSteps)
  const [files, setFiles]   = useState([{ name: 'BDC_Signed.pdf', size: 1230000, done: true }])
  const [dragging, setDrag] = useState(false)

  const done = steps.filter(s => s.status === 'done').length
  const pct  = Math.round((done / steps.length) * 100)

  function handleDrop(e) {
    e.preventDefault(); setDrag(false)
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size, done: true }))
    setFiles(prev => [...prev, ...dropped])
  }

  function removeFile(name) { setFiles(prev => prev.filter(f => f.name !== name)) }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: 'linear-gradient(135deg,#EE0669 0%,#ff6b9d 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold">Bienvenue, {client.name} 👋</div>
            <div className="text-[12px] opacity-85">Votre onboarding est en cours · {done}/{steps.length} étapes complétées</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{pct}%</div>
            <div className="text-[10px] opacity-75">Progression</div>
          </div>
        </div>
        <div className="h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.3)' }}>
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: pct + '%' }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {client.solutions.map(s => (
            <span key={s} className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{s}</span>
          ))}
          <span className="text-[10px] opacity-75 ml-2">AM : {client.am}</span>
        </div>
      </div>

      {/* Smart Assistant */}
      <SmartAssistant clientName={client.name} />

      {/* Tabs */}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="space-y-0">
          {steps.map((step, i) => {
            const cfg = STATUS_CONFIG[step.status]
            const isLast = i === steps.length - 1
            return (
              <div key={step.id} className="flex gap-3">
                {/* Left rail */}
                <div className="flex flex-col items-center w-7 flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold z-10"
                    style={{
                      background: step.status === 'done' ? '#13d275'
                        : step.status === 'doing' ? '#EE0669'
                        : step.status === 'blocked' ? '#ff4861'
                        : '#D8DFE9',
                      color: ['todo','wait'].includes(step.status) ? '#7f88ad' : '#fff',
                    }}
                  >
                    {step.status === 'done' ? <Check size={12} /> : step.id}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border min-h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[12px]">{step.title}</span>
                    <StatusBadge status={step.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <OwnerTag name={step.owner} />
                    <span className="text-[10px] text-info">·</span>
                    <span className="text-[10px] text-info">{step.duration}</span>
                    <span className="text-[10px] text-info">·</span>
                    <span className="text-[10px] text-info">{step.desc}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Fichiers */}
      {tab === 'fichiers' && (
        <div>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${dragging ? 'border-main bg-pink-50' : 'border-border hover:border-main hover:bg-pink-50'}`}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('client-file').click()}
          >
            <Upload size={22} className="mx-auto mb-2 text-info" />
            <div className="font-semibold text-[12px]">Déposez vos fichiers ici</div>
            <div className="text-[10px] text-info mt-1">BDC (obligatoire) · NDA · K-Bis · Estimations</div>
            <input id="client-file" type="file" multiple hidden
              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, done: true }))])} />
          </div>

          {REQUIRED_FILES.map(rf => {
            const uploaded = files.find(f => f.name.toLowerCase().includes(rf.name.toLowerCase().split(' ')[0]))
            return (
              <div key={rf.name} className="flex items-center gap-2 p-2.5 bg-bg border border-border rounded-lg mb-2 text-[11px]">
                <span className="flex-1 font-medium">{rf.name}</span>
                {rf.required && <span className="text-[9px] bg-pink-100 text-main px-1.5 py-0.5 rounded-full font-bold">OBLIGATOIRE</span>}
                {uploaded
                  ? <span className="text-success font-bold flex items-center gap-1"><Check size={12} /> Reçu</span>
                  : <Button variant="default" size="sm">Upload</Button>}
              </div>
            )
          })}

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">Fichiers uploadés</div>
              {files.map(f => (
                <div key={f.name} className="flex items-center gap-2 p-2 bg-white border border-border rounded-lg text-[11px]">
                  <span className="text-[16px]">📄</span>
                  <span className="flex-1 truncate font-medium">{f.name}</span>
                  <span className="text-info">{(f.size / 1024).toFixed(0)} Ko</span>
                  <button onClick={() => removeFile(f.name)} className="text-error hover:opacity-70"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Infos */}
      {tab === 'infos' && (
        <Card>
          <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Informations de la campagne</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: 'AM assigné(e)', value: client.am },
              { label: 'Sales',         value: client.sales },
              { label: 'Frais de setup',value: client.setup?.toLocaleString('fr-FR') + ' €' },
              { label: 'Min. facturation', value: client.min_billing?.toLocaleString('fr-FR') + ' €/mois' },
              { label: 'Budget média',   value: client.budget?.toLocaleString('fr-FR') + ' €/mois' },
              { label: 'Pays',           value: client.country },
            ].map(r => (
              <div key={r.label}>
                <div className="text-[10px] text-info uppercase tracking-wide">{r.label}</div>
                <div className="font-semibold text-[12px] mt-0.5">{r.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="text-[10px] text-info uppercase tracking-wide mb-1">Solutions</div>
            {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          </div>
        </Card>
      )}
    </div>
  )
}
