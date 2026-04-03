import { useState } from 'react'
import { X, Save, Loader2, Check } from 'lucide-react'
import StepForm from './StepForm'
import { formatDate } from '../lib/timelineUtils'

export default function StepDetailDrawer({ step, client, onClose, onUpdateDates, onUpdateStatus }) {
  const d = step._dates
  const [dueDate,   setDueDate]   = useState(d?.dueDate ? formatDate(d.dueDate, 'iso') : '')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  async function saveDueDate() {
    if (!dueDate) return
    setSaving(true)
    try {
      await onUpdateDates(step.id, { due_date: dueDate, planned_end: dueDate })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <div className="border-t border-border bg-white animate-fade-in">
      {/* Drawer header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: '#EE0669' }}
          >
            {step.step_number}
          </div>
          <span className="font-bold text-[13px]">{step.title}</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold">{step.owner}</span>
        </div>
        <button onClick={onClose} className="text-info hover:text-text-base transition-colors p-1">
          <X size={14} />
        </button>
      </div>

      {/* Dates section */}
      <div className="px-4 py-3 border-b border-border bg-bg/50">
        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">Début planifié</div>
            <div className="text-[12px] font-semibold">{formatDate(d?.plannedStart)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">Fin planifiée</div>
            <div className="text-[12px] font-semibold">{formatDate(d?.plannedEnd)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">
              Date limite
              {d?.isLate && <span className="ml-1 text-error">⚠ En retard</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-2 py-1 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white"
              />
              <button
                onClick={saveDueDate}
                disabled={saving}
                className="p-1.5 rounded-lg text-white transition-colors flex-shrink-0 disabled:opacity-50"
                style={{ background: saved ? '#13d275' : '#EE0669' }}
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Save size={11} />}
              </button>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">Statut</div>
            <select
              value={step.status}
              onChange={e => onUpdateStatus?.(step.id, e.target.value)}
              className="px-2 py-1 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white cursor-pointer"
            >
              {[['todo','À faire'],['doing','En cours'],['wait','En attente'],['blocked','Bloqué'],['done','Terminé']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reuse existing StepForm for data fields */}
      <div className="max-h-72 overflow-y-auto">
        <StepForm step={step} />
      </div>
    </div>
  )
}
