import { useStepData } from '../hooks/useStepData'
import { STEP_FIELDS } from '../lib/stepFields'
import { Loader2, Check, User, ShieldCheck, Info } from 'lucide-react'

// ─── Individual field renderers ───────────────────────────────────────────────

function FieldText({ field, value, onChange }) {
  return (
    <input
      type={field.type === 'url' ? 'url' : 'text'}
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white transition-colors"
    />
  )
}

function FieldDate({ field, value, onChange }) {
  return (
    <input
      type="date"
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white transition-colors"
    />
  )
}

function FieldTextarea({ field, value, onChange }) {
  return (
    <textarea
      rows={3}
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white resize-none transition-colors"
    />
  )
}

function FieldSelect({ field, value, onChange }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white cursor-pointer transition-colors"
    >
      <option value="">— Sélectionner —</option>
      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function FieldCheckbox({ field, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(field.key, !value)}
        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
          value ? 'border-main bg-main' : 'border-border bg-white'
        }`}
        style={{ cursor: 'pointer' }}
      >
        {value && <Check size={11} strokeWidth={3} className="text-white" />}
      </div>
      <span className="text-[12px] text-text-base">{field.label}</span>
    </label>
  )
}

// ─── Main StepForm ─────────────────────────────────────────────────────────────

export default function StepForm({ step }) {
  const schema = STEP_FIELDS[_number]
  const { data, update, saving, saved } = useStepData(step.id, step.step_data || {})

  // --- LOGIQUE SPECIFIQUE ETAPE 1 (Affichage des données synchronisées) ---
  if (Number(step.step_number) === 1) {
    const syncData = step.step_data || {}
    
    return (
      <div className="px-4 py-4 space-y-4 animate-fade-in">
        {/* Section Contacts */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3 text-slate-800 border-b border-slate-200 pb-2">
            <User size={14} className="text-main" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider">Contacts Client</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">Principal</p>
              <p className="text-[12px] font-semibold">{syncData.contact_info?.main_name || '—'}</p>
              <p className="text-[11px] text-info truncate">{syncData.contact_info?.main_email || 'Pas d\'email'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">Technique</p>
              <p className="text-[12px] font-semibold">{syncData.contact_info?.tech_name || '—'}</p>
              <p className="text-[11px] text-info truncate">{syncData.contact_info?.tech_email || 'Pas d\'email'}</p>
            </div>
          </div>
        </div>

        {/* Section Config */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3 text-slate-800 border-b border-slate-200 pb-2">
            <ShieldCheck size={14} className="text-main" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider">Configuration Business</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">Solutions</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {syncData.business_terms?.solutions?.map(s => (
                  <span key={s} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-medium">{s}</span>
                )) || '—'}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">Budget Mensuel</p>
              <p className="text-[12px] font-semibold">{syncData.campaign_details?.budget ? `${syncData.campaign_details.budget} €` : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">Commission</p>
              <p className="text-[12px] font-semibold">{syncData.campaign_details?.commission || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-info uppercase font-bold tracking-tight">AM Assigné</p>
              <p className="text-[12px] font-semibold text-main">{syncData.assigned_team?.am || '—'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-700 leading-tight">
            Informations récupérées automatiquement du formulaire de création.
          </p>
        </div>
      </div>
    )
  }

  // --- RENDU STANDARD POUR LES AUTRES ETAPES ---
  if (!schema) return (
    <div className="px-4 py-3 text-[11px] text-info">Aucun champ défini pour cette étape.</div>
  )

  const checkboxFields = schema.fields.filter(f => f.type === 'checkbox')
  const otherFields    = schema.fields.filter(f => f.type !== 'checkbox')

  return (
    <div className="px-4 pt-1 pb-4 border-t border-border animate-fade-in">
      <p className="text-[11px] text-info mb-3 mt-2">{schema.hint}</p>

      <div className="flex justify-end mb-2 h-5">
        {saving && (
          <span className="flex items-center gap-1 text-[10px] text-info">
            <Loader2 size={11} className="animate-spin" /> Sauvegarde…
          </span>
        )}
        {saved && !saving && (
          <span className="flex items-center gap-1 text-[10px] text-success font-semibold">
            <Check size={11} /> Sauvegardé
          </span>
        )}
      </div>

      {checkboxFields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {checkboxFields.map(field => (
            <FieldCheckbox
              key={field.key}
              field={field}
              value={data[field.key]}
              onChange={update}
            />
          ))}
        </div>
      )}

      {otherFields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {otherFields.map(field => {
            const isWide = field.type === 'textarea'
            return (
              <div key={field.key} className={isWide ? 'col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-1">
                  {field.label}
                </label>
                {field.type === 'textarea' && <FieldTextarea field={field} value={data[field.key]} onChange={update} />}
                {field.type === 'date'     && <FieldDate     field={field} value={data[field.key]} onChange={update} />}
                {field.type === 'select'   && <FieldSelect   field={field} value={data[field.key]} onChange={update} />}
                {(field.type === 'text' || field.type === 'url') && (
                  <FieldText field={field} value={data[field.key]} onChange={update} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
