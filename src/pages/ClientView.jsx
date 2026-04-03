import { useState, useMemo } from 'react'
import { Check, Upload, X, ChevronDown, ChevronRight, Download, FileText } from 'lucide-react'
import { Card, Tabs, SolutionChip, OwnerTag, StatusBadge, Button } from '../components/UI'
import SmartAssistant from '../components/SmartAssistant'
import StepForm from '../components/StepForm'
import { STATUS_CONFIG } from '../lib/constants'

const TABS = [
  { id: 'timeline', label: 'Ma Timeline' },
  { id: 'fichiers', label: 'Mes Fichiers' },
  { id: 'infos',    label: 'Mes Infos' },
]

// Fields from step_data that contain file links / URLs to surface in "Mes Fichiers"
const FILE_FIELD_MAP = [
  { key: 'bdc_url',         label: 'BDC signé',                 step: 1 },
  { key: 'guide_url',       label: 'Guide intégration',         step: 3 },
  { key: 'requis_url',      label: 'Requis graphiques',         step: 3 },
  { key: 'plan_taggage_url',label: 'Plan de taggage',           step: 5 },
  { key: 'plan_recu_url',   label: 'Plan taggage (retourné)',   step: 6 },
  { key: 'flux_url',        label: 'Flux produit CSV/XML',      step: 7 },
  { key: 'creas_url',       label: 'Créas / assets',            step: 7 },
  { key: 'recap_url',       label: 'Email récap call setup',    step: 8 },
  { key: 'stats_url',       label: 'Dashboard statistiques',    step: 9 },
]

function stepBg(status) {
  if (status === 'done')    return '#13d275'
  if (status === 'doing')   return '#EE0669'
  if (status === 'blocked') return '#ff4861'
  return '#D8DFE9'
}
function stepColor(status) {
  return ['todo', 'wait'].includes(status) ? '#7f88ad' : '#fff'
}

export default function ClientView({ client }) {
  const [tab,        setTab]        = useState('timeline')
  const [expandedId, setExpandedId] = useState(null)
  const [uploads,    setUploads]    = useState([])
  const [dragging,   setDragging]   = useState(false)

  const steps = client.steps ?? []
  const done  = steps.filter(s => s.status === 'done').length
  const pct   = steps.length ? Math.round((done / steps.length) * 100) : 0

  function toggleExpand(id) { setExpandedId(v => v === id ? null : id) }

  // ── Derive file list dynamically from step_data ──
  const dynamicFiles = useMemo(() => {
    const files = []
    for (const fieldDef of FILE_FIELD_MAP) {
      const step = steps.find(s => s.step_number === fieldDef.step)
      const url  = step?.step_data?.[fieldDef.key]
      if (url) {
        files.push({
          label:    fieldDef.label,
          url,
          stepNum:  fieldDef.step,
          stepName: step.title,
        })
      }
    }
    return files
  }, [steps])

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    setUploads(prev => [...prev, ...Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }))])
  }

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: 'linear-gradient(135deg,#EE0669 0%,#ff6b9d 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold">Bienvenue, {client.name} 👋</div>
            <div className="text-[12px] opacity-85">
              Votre onboarding est en cours · {done}/{steps.length} étapes complétées
            </div>
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

      <SmartAssistant clientName={client.name} />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Timeline ── */}
      {tab === 'timeline' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-[11px] text-info">
            Cliquez sur une étape pour voir le détail et renseigner les informations demandées.
          </div>
          {steps.map(step => {
            const isOpen = expandedId === step.id
            return (
              <div key={step.id} className="border-b border-border last:border-0">
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${isOpen ? 'bg-pink-50' : 'hover:bg-bg'}`}
                  onClick={() => toggleExpand(step.id)}
                >
                  <div className="flex-shrink-0 text-info w-4">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: stepBg(step.status), color: stepColor(step.status) }}
                  >
                    {step.status === 'done' ? <Check size={12} /> : step.step_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[12px]">{step.title}</span>
                      <StatusBadge status={step.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <OwnerTag name={step.owner} />
                      <span className="text-[10px] text-info">{step.duration_label}</span>
                    </div>
                  </div>
                </div>
                {isOpen && <StepForm step={step} />}
              </div>
            )
          })}
        </Card>
      )}

      {/* ── Fichiers ── */}
      {tab === 'fichiers' && (
        <div>
          {/* Dynamic files from step_data */}
          {dynamicFiles.length > 0 && (
            <Card className="mb-4">
              <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">
                Documents partagés & fournis
              </div>
              <div className="space-y-2">
                {dynamicFiles.map(f => (
                  <div key={f.label} className="flex items-center gap-3 p-2.5 bg-bg border border-border rounded-lg">
                    <FileText size={16} className="text-info flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[12px]">{f.label}</div>
                      <div className="text-[10px] text-info">Étape {f.stepNum} — {f.stepName}</div>
                    </div>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-main text-white rounded-lg text-[11px] font-bold hover:bg-main-dark transition-colors flex-shrink-0"
                    >
                      <Download size={11} /> Ouvrir
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {dynamicFiles.length === 0 && (
            <div className="text-center py-8 mb-4 bg-white border border-border rounded-xl">
              <FileText size={28} className="mx-auto mb-2 text-border" />
              <div className="text-[12px] text-info">Aucun document partagé pour l'instant.</div>
              <div className="text-[11px] text-info mt-1">Les fichiers apparaîtront ici au fur et à mesure de l'avancement.</div>
            </div>
          )}

          {/* Manual upload zone */}
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Uploader un document</div>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-3 ${dragging ? 'border-main bg-pink-50' : 'border-border hover:border-main hover:bg-pink-50'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('client-file').click()}
            >
              <Upload size={20} className="mx-auto mb-2 text-info" />
              <div className="font-semibold text-[12px]">Déposez un fichier ici</div>
              <div className="text-[10px] text-info mt-1">BDC, NDA, K-Bis, Logo HD…</div>
              <input id="client-file" type="file" multiple hidden
                onChange={e => setUploads(p => [...p, ...Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }))])} />
            </div>
            {uploads.map(f => (
              <div key={f.name} className="flex items-center gap-2 p-2 bg-bg border border-border rounded-lg mb-1.5 text-[11px]">
                <Check size={12} className="text-success flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{f.name}</span>
                <span className="text-info">{(f.size / 1024).toFixed(0)} Ko</span>
                <button onClick={() => setUploads(p => p.filter(x => x.name !== f.name))} className="text-error hover:opacity-70"><X size={12} /></button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Infos ── */}
      {tab === 'infos' && (
        <Card>
          <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Informations de la campagne</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            {[
              { label: 'AM assigné(e)',    value: client.am },
              { label: 'Sales',            value: client.sales },
              { label: 'Frais de setup',   value: (client.setup ?? 0).toLocaleString('fr-FR') + ' €' },
              { label: 'Min. facturation', value: (client.min_billing ?? 0).toLocaleString('fr-FR') + ' €/mois' },
              { label: 'Budget média',     value: (client.budget ?? 0).toLocaleString('fr-FR') + ' €/mois' },
              { label: 'Pays / Ville',     value: [client.country, client.city].filter(Boolean).join(' — ') },
            ].map(r => (
              <div key={r.label}>
                <div className="text-[10px] text-info uppercase tracking-wide">{r.label}</div>
                <div className="font-semibold text-[12px] mt-0.5">{r.value || '—'}</div>
              </div>
            ))}
          </div>
          {(client.client_main_contact_email || client.client_tech_contact_email) && (
            <>
              <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-2 border-t border-border pt-3">Contacts</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {client.client_main_contact_name && (
                  <div>
                    <div className="text-[10px] text-info">Contact principal</div>
                    <div className="font-semibold text-[12px]">{client.client_main_contact_name}</div>
                    <div className="text-[11px] text-info">{client.client_main_contact_email}</div>
                  </div>
                )}
                {client.client_tech_contact_name && (
                  <div>
                    <div className="text-[10px] text-info">Contact technique</div>
                    <div className="font-semibold text-[12px]">{client.client_tech_contact_name}</div>
                    <div className="text-[11px] text-info">{client.client_tech_contact_email}</div>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-[10px] text-info uppercase tracking-wide mb-1">Solutions</div>
            {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          </div>
        </Card>
      )}
    </div>
  )
}
