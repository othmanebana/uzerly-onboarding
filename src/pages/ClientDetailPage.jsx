import { useState, useEffect } from 'react'
import { ArrowLeft, LayoutList, GanttChart, ChevronDown, ChevronRight, Archive, ArchiveRestore, Loader2 } from 'lucide-react'
import { Button, Avatar, SolutionChip, StatusBadge, OwnerTag, Card, SectionHeader } from '../components/UI'
import SmartAssistant     from '../components/SmartAssistant'
import StepForm           from '../components/StepForm'
import HandoverModal      from '../components/HandoverModal'
import HorizontalTimeline from '../components/HorizontalTimeline'
import { STATUS_CONFIG }  from '../lib/constants'
import { archiveClient, unarchiveClient } from '../lib/supabase'

function stepBg(status) {
  if (status === 'done')    return '#13d275'
  if (status === 'doing')   return '#EE0669'
  if (status === 'blocked') return '#ff4861'
  return '#D8DFE9'
}
function stepColor(status) {
  return ['todo','wait'].includes(status) ? '#7f88ad' : '#fff'
}

export default function ClientDetailPage({ client, onBack, onUpdateStep, isAdmin = true }) {
  const steps = client.steps ?? []
  const done  = steps.filter(s => s.status === 'done').length
  const pct   = steps.length ? Math.round((done / steps.length) * 100) : 0

  const [timelineMode, setTimelineMode] = useState('vertical')
  const [expandedId,   setExpandedId]   = useState(null)
  const [handover,     setHandover]     = useState(null)

  // Archive state
  const [archived,        setArchived]        = useState(client.archived || false)
  const [archiving,       setArchiving]       = useState(false)
  const [showArchConfirm, setShowArchConfirm] = useState(false)
  const [archReason,      setArchReason]      = useState('')

  function toggleExpand(id) { setExpandedId(v => v === id ? null : id) }

  function handleStatusChange(step, newStatus) {
    if (newStatus === 'done') setHandover(step)
    onUpdateStep(client.id, step.id, newStatus)
  }

  async function handleArchive() {
    setArchiving(true)
    try {
      await archiveClient(client.id, archReason)
      setArchived(true)
      setShowArchConfirm(false)
    } catch (err) { console.error(err) }
    finally { setArchiving(false) }
  }

  async function handleUnarchive() {
    setArchiving(true)
    try {
      await unarchiveClient(client.id)
      setArchived(false)
    } catch (err) { console.error(err) }
    finally { setArchiving(false) }
  }

  return (
    <div className="animate-fade-in">

      {/* ── Bandeau archivé ── */}
      {archived && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Archive size={15} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-[12px] text-amber-700">Client archivé</span>
            {client.archived_reason && (
              <span className="text-[11px] text-amber-600 ml-2">· {client.archived_reason}</span>
            )}
            <p className="text-[10px] text-amber-600 mt-0.5">Ce client n'apparaît plus dans le pipeline principal.</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleUnarchive}
              disabled={archiving}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-700 bg-green-50 rounded-lg text-[11px] font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {archiving ? <Loader2 size={11} className="animate-spin" /> : <ArchiveRestore size={11} />}
              Réactiver
            </button>
          )}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Retour pipeline
        </Button>
        <Avatar initials={client.initials} size={34} />
        <div>
          <div className="font-bold text-[1rem]">{client.name}</div>
          <div className="text-[11px] text-info">AM : {client.am || '—'} · Sales : {client.sales || '—'}</div>
          {client.client_main_contact_email && (
            <div className="text-[10px] text-info mt-0.5">
              Client : {client.client_main_contact_name} ·{' '}
              <a href={`mailto:${client.client_main_contact_email}`} className="text-main hover:underline">
                {client.client_main_contact_email}
              </a>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {client.solutions.map(s => <SolutionChip key={s} name={s} />)}
          <span className="font-bold text-main text-[1.1rem]">{pct}%</span>

          {/* ── Bouton Archiver (admin only, non archivé) ── */}
          {isAdmin && !archived && (
            <div className="relative">
              {showArchConfirm ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={archReason}
                    onChange={e => setArchReason(e.target.value)}
                    placeholder="Raison (optionnelle)"
                    className="px-2 py-1.5 border border-border rounded-lg text-[11px] outline-none focus:border-amber-400 w-40"
                  />
                  <button
                    onClick={handleArchive}
                    disabled={archiving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[11px] font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {archiving ? <Loader2 size={11} className="animate-spin" /> : <Archive size={11} />}
                    Confirmer
                  </button>
                  <button
                    onClick={() => { setShowArchConfirm(false); setArchReason('') }}
                    className="px-2 py-1.5 border border-border rounded-lg text-[11px] text-info hover:bg-bg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowArchConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 text-amber-600 bg-amber-50 rounded-lg text-[11px] font-bold hover:bg-amber-100 transition-colors"
                >
                  <Archive size={12} /> Archiver
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Smart Assistant ── */}
      <SmartAssistant clientName={client.name} clientData={client} />

      {/* ── View toggle ── */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-[0.9rem]">Étapes d'onboarding</span>
        <div className="flex bg-bg rounded-lg p-0.5 gap-0.5 border border-border">
          <button
            onClick={() => setTimelineMode('vertical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-none ${timelineMode === 'vertical' ? 'bg-white text-main shadow-sm' : 'bg-transparent text-info hover:text-text-base'}`}
          >
            <LayoutList size={13} /> Liste
          </button>
          <button
            onClick={() => setTimelineMode('horizontal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border-none ${timelineMode === 'horizontal' ? 'bg-white text-main shadow-sm' : 'bg-transparent text-info hover:text-text-base'}`}
          >
            <GanttChart size={13} /> Timeline Gantt
          </button>
        </div>
      </div>

      {/* ── VERTICAL VIEW ── */}
      {timelineMode === 'vertical' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-bold text-[0.85rem]">Timeline verticale</span>
            <span className="text-[11px] text-info">Cliquez pour remplir · Passation automatique à "Terminé"</span>
          </div>

          {steps.length === 0 && (
            <div className="text-[12px] text-info text-center py-10">Aucune étape trouvée.</div>
          )}

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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: stepBg(step.status), color: stepColor(step.status) }}>
                    {step.step_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[12px]">{step.title}</span>
                      <StatusBadge status={step.status} />
                      <OwnerTag name={step.owner} />
                      <span className="text-[10px] text-info">{step.duration_label}</span>
                    </div>
                    <div className="text-[11px] text-info mt-0.5 truncate">{step.description}</div>
                  </div>
                  <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                    <select value={step.status}
                      onChange={e => handleStatusChange(step, e.target.value)}
                      className="px-2 py-1 text-[11px] border border-border rounded-lg bg-white outline-none cursor-pointer focus:border-main">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {isOpen && <StepForm step={step} />}
              </div>
            )
          })}
        </Card>
      )}

      {/* ── HORIZONTAL GANTT VIEW ── */}
      {timelineMode === 'horizontal' && (
        <HorizontalTimeline
          client={client}
          onUpdateStep={onUpdateStep}
        />
      )}

      {/* ── Handover Modal ── */}
      {handover && (
        <HandoverModal
          step={handover}
          client={client}
          onClose={() => setHandover(null)}
          onConfirmed={() => setHandover(null)}
        />
      )}
    </div>
  )
}
