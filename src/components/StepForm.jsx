import { useStepData } from '../hooks/useStepData'
import { STEP_FIELDS } from '../lib/stepFields'
import { Loader2, Check } from 'lucide-react'

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
  const schema = STEP_FIELDS[step.step_number]
  const { data, update, saving, saved } = useStepData(step.id, step.step_data || {})

  if (!schema) return (
    <div className="px-4 py-3 text-[11px] text-info">Aucun champ défini pour cette étape.</div>
  )

  // Split fields: checkboxes full-width, others in a 2-col grid
  const checkboxFields = schema.fields.filter(f => f.type === 'checkbox')
  const otherFields    = schema.fields.filter(f => f.type !== 'checkbox')

  return (
    <div className="px-4 pt-1 pb-4 border-t border-border animate-fade-in">
      {/* Hint */}
      <p className="text-[11px] text-info mb-3 mt-2">{schema.hint}</p>

      {/* Save indicator */}
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

      {/* Checkboxes — full width, 2 columns */}
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

      {/* Other fields — 2-col grid */}
      {otherFields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {otherFields.map(field => {
            // Textareas span full width
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
