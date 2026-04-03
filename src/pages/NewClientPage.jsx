import { useState } from 'react'
import { ArrowLeft, Upload, X, Check, Loader2 } from 'lucide-react'
import { Button, Input, Select, Card } from '../components/UI'
import { useCreateClient } from '../hooks/useCreateClient'
import { supabase } from '../lib/supabase'

const SOLUTIONS = ['Email Retargeting', 'Display Retargeting', 'OnSite', 'Acquisition']

export default function NewClientPage({ onBack, onCreated, teamMembers = [] }) {
  const { submit, loading, error } = useCreateClient()

  const [form, setForm] = useState({
    name: '', country: 'France', city: '', phone: '',
    activity_desc: '', setup_fee: '', min_billing: '',
    am: '', sales: '', notes: '',
    // Contacts
    client_main_contact_name:  '',
    client_main_contact_email: '',
    client_tech_contact_name:  '',
    client_tech_contact_email: '',
    // Campaign
    sender_name: '', commission_type: '% sur vente',
    commission_value: '', monthly_budget: '',
    networks: '', excluded_networks: '',
  })
  const [solutions,    setSolutions]    = useState([])
  const [files,        setFiles]        = useState([])
  const [dragging,     setDragging]     = useState(false)
  const [fieldErrors,  setFieldErrors]  = useState({})

  const amList    = teamMembers.filter(m => m.role === 'AM')
  const salesList = teamMembers.filter(m => m.role === 'Sales')

  function set(key, value) { setForm(f => ({ ...f, [key]: value })) }
  function toggleSol(s)    { setSolutions(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]) }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Champ obligatoire'
    if (!solutions.length) errs.solutions = 'Sélectionnez au moins une solution'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    
    // 1. Création du client via le hook
    const client = await submit({ ...form, solutions })
    
    if (client && client.id) {
      try {
        // 2. Synchronisation immédiate avec l'Étape 1 (onboarding_steps)
        await supabase
          .from('onboarding_steps')
          .update({
            status: 'done', // On s'assure d'utiliser le bon tag de statut
            completed_at: new Date().toISOString(),
            step_data: {
              contact_info: {
                main_name: form.client_main_contact_name,
                main_email: form.client_main_contact_email,
                tech_name: form.client_tech_contact_name,
                tech_email: form.client_tech_contact_email
              },
              business_terms: {
                setup_fee: form.setup_fee,
                min_billing: form.min_billing,
                solutions: solutions
              },
              campaign_details: {
                sender: form.sender_name,
                budget: form.monthly_budget,
                commission: `${form.commission_value} ${form.commission_type}`,
                excluded: form.excluded_networks
              },
              assigned_team: { am: form.am, sales: form.sales },
              notes: form.notes,
              files_count: files.length
            }
          })
          .match({ client_id: client.id, step_number: 1 });

        // 3. Petit délai de sécurité pour la synchro BDD avant redirection
        setTimeout(() => {
          onCreated(client)
        }, 500)

      } catch (err) {
        console.error("Erreur synchro étape 1:", err)
        onCreated(client) 
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    setFiles(p => [...p, ...Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }))])
  }

  const hasEmail   = solutions.includes('Email Retargeting')
  const hasDisplay = solutions.includes('Display Retargeting')

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={14} /> Retour</Button>
        <h1 className="text-[1rem] font-bold">Nouveau Client</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-error font-medium">
          ⚠ Erreur : {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* ── Col gauche ── */}
        <div className="space-y-4">
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Informations Client</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="Nom client *" placeholder="Décathlon FR" value={form.name} onChange={e => set('name', e.target.value)} />
                {fieldErrors.name && <p className="text-[10px] text-error -mt-2 mb-2">{fieldErrors.name}</p>}
              </div>
              <Input label="Pays" value={form.country} onChange={e => set('country', e.target.value)} />
              <Input label="Ville" value={form.city} onChange={e => set('city', e.target.value)} />
              <Input label="Téléphone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 1 00 00 00 00" />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Descriptif activité</label>
              <textarea rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
                value={form.activity_desc} onChange={e => set('activity_desc', e.target.value)} placeholder="E-commerce mode, 2M visiteurs/mois…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Frais setup (€)" type="number" value={form.setup_fee} onChange={e => set('setup_fee', e.target.value)} placeholder="1200" />
              <Input label="Min. facturation (€)" type="number" value={form.min_billing} onChange={e => set('min_billing', e.target.value)} placeholder="500" />
            </div>
          </Card>

          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Contacts Client</div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Contact principal — Nom"  value={form.client_main_contact_name}  onChange={e => set('client_main_contact_name',  e.target.value)} placeholder="Marie Dupont" />
              <Input label="Contact principal — Email" type="email" value={form.client_main_contact_email} onChange={e => set('client_main_contact_email', e.target.value)} placeholder="marie@client.fr" />
              <Input label="Contact technique — Nom"  value={form.client_tech_contact_name}  onChange={e => set('client_tech_contact_name',  e.target.value)} placeholder="Jean Martin" />
              <Input label="Contact technique — Email" type="email" value={form.client_tech_contact_email} onChange={e => set('client_tech_contact_email', e.target.value)} placeholder="jean@client.fr" />
            </div>
          </Card>

          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Équipe Uzerly</div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="AM assigné(e)" value={form.am} onChange={e => set('am', e.target.value)}>
                <option value="">— Choisir —</option>
                {amList.length
                  ? amList.map(m => <option key={m.id} value={m.name}>{m.name}</option>)
                  : ['Julie M.','Marc T.','Nadia K.'].map(v => <option key={v} value={v}>{v}</option>)
                }
              </Select>
              <Select label="Sales" value={form.sales} onChange={e => set('sales', e.target.value)}>
                <option value="">— Choisir —</option>
                {salesList.length
                  ? salesList.map(m => <option key={m.id} value={m.name}>{m.name}</option>)
                  : ['Pierre R.','Sophie L.','Tom B.'].map(v => <option key={v} value={v}>{v}</option>)
                }
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Notes deal</label>
              <textarea rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
                value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Contexte particulier, points à retenir…" />
            </div>
          </Card>
        </div>

        {/* ── Col droite ── */}
        <div className="space-y-4">
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Solutions choisies *</div>
            {fieldErrors.solutions && <p className="text-[10px] text-error mb-2">{fieldErrors.solutions}</p>}
            <div className="space-y-1.5 mb-3">
              {SOLUTIONS.map(s => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-bg transition-colors">
                  <input type="checkbox" className="accent-main" checked={solutions.includes(s)} onChange={() => toggleSol(s)} />
                  <span className="text-[12px]">{s}</span>
                </label>
              ))}
            </div>

            {hasEmail && (
              <div className="bg-pink-50 rounded-xl p-3 mb-2">
                <div className="text-[10px] font-bold text-main uppercase tracking-wide mb-2">Config Email Retargeting</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Sender Name" placeholder="Votre Marque" value={form.sender_name} onChange={e => set('sender_name', e.target.value)} />
                  <Select label="Type commission" value={form.commission_type} onChange={e => set('commission_type', e.target.value)}>
                    {['% sur vente','Fixe / vente','CPC','Mensuel fixe'].map(v => <option key={v}>{v}</option>)}
                  </Select>
                  <Input label="Valeur commission" placeholder="15" value={form.commission_value} onChange={e => set('commission_value', e.target.value)} />
                </div>
              </div>
            )}

            {hasDisplay && (
              <div className="bg-purple-50 rounded-xl p-3 mb-2">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide mb-2">Config Display</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Budget mensuel (€)" placeholder="3000" value={form.monthly_budget} onChange={e => set('monthly_budget', e.target.value)} />
                  <Input label="Réseaux exclus" placeholder="ex. SEM" value={form.excluded_networks} onChange={e => set('excluded_networks', e.target.value)} />
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Documents</div>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-3 ${dragging ? 'border-main bg-pink-50' : 'border-border hover:border-main hover:bg-pink-50'}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('new-file-input').click()}
            >
              <Upload size={20} className="mx-auto mb-2 text-info" />
              <div className="font-semibold text-[12px]">BDC obligatoire · Drag & drop</div>
              <div className="text-[10px] text-info mt-1">NDA, K-Bis, Attestation — optionnels</div>
              <input id="new-file-input" type="file" multiple hidden
                onChange={e => setFiles(p => [...p, ...Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }))])} />
            </div>
            {files.map(f => (
              <div key={f.name} className="flex items-center gap-2 p-2 bg-bg border border-border rounded-lg mb-1.5 text-[11px]">
                <Check size={12} className="text-success flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{f.name}</span>
                <span className="text-info">{(f.size / 1024).toFixed(0)} Ko</span>
                <button onClick={() => setFiles(p => p.filter(x => x.name !== f.name))} className="text-error hover:opacity-70"><X size={12} /></button>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
        <Button variant="default" onClick={onBack} disabled={loading}>Annuler</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><Loader2 size={13} className="animate-spin" /> Création & synchro…</>
            : 'Créer le client & démarrer l\'onboarding →'}
        </Button>
      </div>
    </div>
  )
}
