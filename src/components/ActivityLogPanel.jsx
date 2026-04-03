import { X, Filter, Loader2, Clock, User, ArrowRight } from 'lucide-react'
import { formatDate } from '../lib/timelineUtils'

const ACTION_CONFIG = {
  status_change:    { label: 'Statut modifié',     color: '#EE0669', icon: '🔄' },
  field_update:     { label: 'Champ mis à jour',   color: '#7f88ad', icon: '✏️' },
  handover:         { label: 'Passation',           color: '#5a5fad', icon: '🤝' },
  due_date_change:  { label: 'Date modifiée',       color: '#f59e0b', icon: '📅' },
  step_created:     { label: 'Étape créée',         color: '#13d275', icon: '✅' },
  client_created:   { label: 'Client créé',         color: '#13d275', icon: '🎉' },
  file_upload:      { label: 'Fichier ajouté',      color: '#4facfe', icon: '📎' },
  relance_sent:     { label: 'Relance envoyée',     color: '#fa709a', icon: '📧' },
  drag_move:        { label: 'Bloc déplacé',        color: '#a18cd1', icon: '↔️' },
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)   return 'À l\'instant'
  if (mins  < 60)  return `Il y a ${mins} min`
  if (hours < 24)  return `Il y a ${hours}h`
  if (days  < 7)   return `Il y a ${days}j`
  return formatDate(dateStr, 'short')
}

export default function ActivityLogPanel({ log, loading, users, filterUser, onFilterUser, onClose }) {
  const grouped = log.reduce((acc, entry) => {
    const day = new Date(entry.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(entry)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full bg-white border-l border-border" style={{ width: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={15} style={{ color: '#EE0669' }} />
          <span className="font-bold text-[13px]">Journal d'activité</span>
        </div>
        <button onClick={onClose} className="text-info hover:text-text-base transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Filter by user */}
      <div className="px-4 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-info flex-shrink-0" />
          <select
            value={filterUser}
            onChange={e => onFilterUser(e.target.value)}
            className="flex-1 text-[11px] border border-border rounded-lg px-2 py-1 outline-none focus:border-main bg-white cursor-pointer"
          >
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-info" />
          </div>
        )}

        {!loading && log.length === 0 && (
          <div className="text-center py-10 text-[12px] text-info">
            Aucune activité enregistrée.
          </div>
        )}

        {!loading && Object.entries(grouped).map(([day, entries]) => (
          <div key={day} className="mb-4">
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-2 sticky top-0 bg-white py-1">
              {day}
            </div>
            <div className="space-y-2">
              {entries.map(entry => {
                const cfg = ACTION_CONFIG[entry.action] || { label: entry.action, color: '#7f88ad', icon: '•' }
                return (
                  <div key={entry.id} className="flex gap-2.5">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 bg-bg border border-border">
                        {cfg.icon}
                      </div>
                      <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: 8 }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-[10px] text-info flex-shrink-0">{formatRelative(entry.created_at)}</span>
                      </div>

                      {entry.step_number && (
                        <div className="text-[10px] text-info">Étape {entry.step_number}</div>
                      )}

                      <div className="flex items-center gap-1 mt-0.5">
                        <User size={9} className="text-info" />
                        <span className="text-[10px] text-info">{entry.user_name}</span>
                        {entry.user_role && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">{entry.user_role}</span>
                        )}
                      </div>

                      {(entry.old_value || entry.new_value) && (
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          {entry.old_value && <span className="text-error bg-red-50 px-1.5 py-0.5 rounded">{entry.old_value}</span>}
                          {entry.old_value && entry.new_value && <ArrowRight size={10} className="text-info" />}
                          {entry.new_value && <span className="text-success bg-green-50 px-1.5 py-0.5 rounded">{entry.new_value}</span>}
                        </div>
                      )}

                      {entry.meta?.notes && (
                        <div className="text-[10px] text-info mt-1 italic">"{entry.meta.notes}"</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
