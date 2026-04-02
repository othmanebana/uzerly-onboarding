import { useState } from 'react'
import { Eye, GripVertical, RefreshCw } from 'lucide-react'
import { SectionHeader, Button, StatusBadge, SolutionChip, ProgressBar, Avatar, MetricCard } from '../components/UI'
import { LoadingSpinner, ErrorState, EmptyState } from '../components/States'

export default function PipelinePage({ clients, loading, error, onRefetch, onViewClient }) {
  const [list, setList]     = useState(null)   // null = use prop order
  const [dragIdx, setDragIdx] = useState(null)

  // Use local reordered list if dragged, otherwise use prop
  const displayed = list ?? clients

  function handleDrop(targetIdx) {
    if (dragIdx === null || dragIdx === targetIdx) return
    const arr = [...displayed]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(targetIdx, 0, moved)
    setList(arr)
    setDragIdx(null)
  }

  if (loading) return <LoadingSpinner message="Chargement des clients…" />
  if (error)   return <ErrorState message={error} onRetry={onRefetch} />
  if (!displayed.length) return (
    <EmptyState
      message="Aucun client en onboarding pour l'instant."
      action={<Button variant="primary" size="sm">+ Créer le premier client</Button>}
    />
  )

  const metrics = [
    { label: 'Clients en onboarding', value: displayed.length,                                         color: '#EE0669' },
    { label: 'En cours',              value: displayed.filter(c => c.status === 'doing').length,        color: '#f59e0b' },
    { label: 'Bloqués',               value: displayed.filter(c => c.status === 'blocked').length,      color: '#ff4861' },
    { label: 'Terminés',              value: displayed.filter(c => c.status === 'done').length,         color: '#13d275' },
  ]

  return (
    <div>
      <SectionHeader title="Pipeline Onboarding">
        <span className="text-[11px] text-info">↕ Drag & drop pour prioriser</span>
        <Button variant="default" size="sm" onClick={onRefetch}>
          <RefreshCw size={12} /> Actualiser
        </Button>
      </SectionHeader>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              {['', 'Client', 'Solutions', 'AM', 'Progression', 'Statut', 'Action'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-info uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((c, i) => (
              <tr
                key={c.id}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => setDragIdx(null)}
                className={`border-b border-border last:border-0 hover:bg-bg transition-colors ${dragIdx === i ? 'opacity-40' : ''}`}
              >
                <td className="px-2 py-3 cursor-grab text-info"><GripVertical size={14} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={c.initials} size={30} />
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[10px] text-info">
                        {c.city && `${c.city} · `}Setup: {(c.setup ?? 0).toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.solutions.length ? c.solutions.map(s => <SolutionChip key={s} name={s} />)
                    : <span className="text-[10px] text-info">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold">{c.am || '—'}</span>
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={c.progress} className="flex-1" />
                    <span className="font-bold min-w-[30px]">{c.progress}%</span>
                  </div>
                  <div className="text-[10px] text-info mt-0.5">{c.steps_done}/{c.steps_total} étapes</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <Button variant="primary" size="sm" onClick={() => onViewClient(c)}>
                    <Eye size={12} /> Voir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
