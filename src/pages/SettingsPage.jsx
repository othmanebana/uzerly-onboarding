import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, Check, GripVertical, Pencil, X } from 'lucide-react'
import { Card, Button, Input, Select, Tabs, SectionHeader } from '../components/UI'
import {
  getStepTemplate, saveStepTemplate,
  getTeamMembers, createTeamMember, deleteTeamMember,
  getClients, upsertRelanceRules,
} from '../lib/supabase'

const SETTING_TABS = [
  { id: 'timeline', label: 'Master Timeline' },
  { id: 'team',     label: 'Équipe' },
  { id: 'relance',  label: 'Règles de relance' },
]

const ROLES = ['Sales', 'AM', 'Tech', 'Graphiste', 'Super Admin']

// ─── Sub-page: Master Timeline Editor ────────────────────────────────────────
function TimelineEditor() {
  const [steps,   setSteps]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [dragIdx, setDragIdx] = useState(null)

  useEffect(() => {
    getStepTemplate().then(s => { setSteps(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function updateStep(idx, key, value) {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s))
  }

  function handleDrop(targetIdx) {
    if (dragIdx === null || dragIdx === targetIdx) return
    const arr = [...steps]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(targetIdx, 0, moved)
    // Re-number
    const renumbered = arr.map((s, i) => ({ ...s, step_number: i + 1 }))
    setSteps(renumbered)
    setDragIdx(null)
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    try {
      await saveStepTemplate(steps)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-[12px] text-info py-10 text-center">Chargement du template…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-info">
          Ces étapes seront appliquées à tous les nouveaux clients. Drag & drop pour réordonner.
        </p>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving  ? <><Loader2 size={12} className="animate-spin" /> Sauvegarde…</> :
           saved   ? <><Check size={12} /> Sauvegardé</> :
           <><Save size={12} /> Sauvegarder</>}
        </Button>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div
            key={step.step_number}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => setDragIdx(null)}
            className={`bg-white border border-border rounded-xl p-3 transition-all ${dragIdx === idx ? 'opacity-40' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <div className="mt-2 cursor-grab text-info flex-shrink-0"><GripVertical size={14} /></div>

              {/* Step number */}
              <div className="w-6 h-6 rounded-full bg-main text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1.5">
                {step.step_number}
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-0.5">Titre</label>
                  <input
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main"
                    value={step.title}
                    onChange={e => updateStep(idx, 'title', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-0.5">Responsable</label>
                  <input
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main"
                    value={step.owner}
                    onChange={e => updateStep(idx, 'owner', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-0.5">Délai</label>
                  <input
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main"
                    value={step.duration_label}
                    onChange={e => updateStep(idx, 'duration_label', e.target.value)}
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-0.5">Description</label>
                  <input
                    className="w-full px-2 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main"
                    value={step.description}
                    onChange={e => updateStep(idx, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-info mt-3 text-center">
        ⚠ Les clients déjà créés ne sont pas affectés — uniquement les nouveaux.
      </p>
    </div>
  )
}

// ─── Sub-page: Team CRUD ──────────────────────────────────────────────────────
function TeamManager() {
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'AM' })
  const [saving,  setSaving]    = useState(false)

  useEffect(() => {
    getTeamMembers().then(m => { setMembers(m); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleAdd() {
    if (!newMember.name || !newMember.email) return
    setSaving(true)
    try {
      const m = await createTeamMember(newMember)
      setMembers(prev => [...prev, m])
      setNewMember({ name: '', email: '', role: 'AM' })
      setShowAdd(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    await deleteTeamMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const roleColors = {
    Sales: 'bg-pink-100 text-main',
    AM:    'bg-indigo-100 text-indigo-600',
    Tech:  'bg-amber-100 text-amber-700',
    Graphiste: 'bg-green-100 text-green-700',
    'Super Admin': 'bg-gray-200 text-gray-700',
  }

  if (loading) return <div className="text-[12px] text-info py-10 text-center">Chargement…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-info">{members.length} membres actifs</p>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(v => !v)}>
          <Plus size={13} /> Ajouter un membre
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="mb-4 bg-pink-50 border-main/20">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Input label="Nom" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} placeholder="Julie M." />
            <Input label="Email" type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} placeholder="julie@uzerly.com" />
            <Select label="Rôle" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Confirmer
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              {['Nom','Email','Rôle','Action'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-info uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg">
                <td className="px-4 py-2.5 font-semibold">{m.name}</td>
                <td className="px-4 py-2.5 text-info">{m.email}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[m.role] || 'bg-gray-100 text-gray-600'}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button onClick={() => handleDelete(m.id)} className="text-error hover:opacity-70 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Sub-page: Relance Rules ──────────────────────────────────────────────────
function RelanceRules() {
  const [clients,  setClients]  = useState([])
  const [selected, setSelected] = useState(null)
  const [rules,    setRules]    = useState({ paused: false, pause_until: '', pause_reason: '', delay_e2: 3, delay_e3: 7, delay_e4: 10, delay_e5: 14 })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    getClients().then(c => { setClients(c); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function selectClient(client) {
    setSelected(client)
    const r = client.relance
    if (r) setRules({ paused: r.paused, pause_until: r.pause_until || '', pause_reason: r.pause_reason || '', delay_e2: r.delay_e2 ?? 3, delay_e3: r.delay_e3 ?? 7, delay_e4: r.delay_e4 ?? 10, delay_e5: r.delay_e5 ?? 14 })
    else setRules({ paused: false, pause_until: '', pause_reason: '', delay_e2: 3, delay_e3: 7, delay_e4: 10, delay_e5: 14 })
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true); setSaved(false)
    try {
      await upsertRelanceRules(selected.id, rules)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-[12px] text-info py-10 text-center">Chargement…</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Client list */}
      <div className="col-span-1">
        <p className="text-[10px] font-bold text-info uppercase tracking-wide mb-2">Sélectionner un client</p>
        <div className="space-y-1">
          {clients.map(c => (
            <button
              key={c.id}
              onClick={() => selectClient(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] border transition-all ${
                selected?.id === c.id ? 'bg-pink-50 border-main text-main font-semibold' : 'bg-white border-border hover:bg-bg'
              }`}
            >
              {c.name}
              {c.relance?.paused && <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">EN PAUSE</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Rules editor */}
      <div className="col-span-2">
        {!selected ? (
          <div className="flex items-center justify-center h-40 text-[12px] text-info">
            ← Sélectionnez un client
          </div>
        ) : (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-[0.9rem]">{selected.name}</span>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <><Check size={12} /> OK</> : <><Save size={12} /> Sauvegarder</>}
              </Button>
            </div>

            {/* Pause toggle */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <div
                  onClick={() => setRules(r => ({ ...r, paused: !r.paused }))}
                  className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${rules.paused ? 'bg-amber-500' : 'bg-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${rules.paused ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="font-semibold text-[12px]">Mettre les relances en pause</span>
              </label>
            </div>

            {rules.paused && (
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-amber-50 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-1">Pause jusqu'au</label>
                  <input type="date" value={rules.pause_until} onChange={e => setRules(r => ({ ...r, pause_until: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-info uppercase tracking-wide mb-1">Raison</label>
                  <input value={rules.pause_reason} onChange={e => setRules(r => ({ ...r, pause_reason: e.target.value }))}
                    placeholder="Vacances, restructuration…"
                    className="w-full px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white" />
                </div>
              </div>
            )}

            {/* Delay customization */}
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-2">Fréquence personnalisée (jours)</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'delay_e2', label: 'Email 2 — Relance douce' },
                { key: 'delay_e3', label: 'Email 3 — Relance progression' },
                { key: 'delay_e4', label: 'Email 4 — Relance blocage' },
                { key: 'delay_e5', label: 'Email 5 — Dernier appel' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] text-info mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={60} value={rules[key]}
                      onChange={e => setRules(r => ({ ...r, [key]: parseInt(e.target.value) || 1 }))}
                      className="w-16 px-2 py-1.5 border border-border rounded-lg text-[12px] font-bold text-center outline-none focus:border-main" />
                    <span className="text-[11px] text-info">jours après création</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState('timeline')
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Configuration" />
      <Tabs tabs={SETTING_TABS} active={tab} onChange={setTab} />
      {tab === 'timeline' && <TimelineEditor />}
      {tab === 'team'     && <TeamManager />}
      {tab === 'relance'  && <RelanceRules />}
    </div>
  )
}
