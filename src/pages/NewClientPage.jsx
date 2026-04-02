import { useState } from 'react'
import { ArrowLeft, Upload, X, Check } from 'lucide-react'
import { Button, Input, Select, Card, SectionHeader } from '../components/UI'

const SOLUTIONS = ['Email Retargeting', 'Display Retargeting', 'OnSite', 'Acquisition']

export default function NewClientPage({ onBack }) {
  const [solutions, setSolutions]   = useState([])
  const [files, setFiles]           = useState([])
  const [dragging, setDragging]     = useState(false)

  function toggleSol(s) {
    setSolutions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }))
    setFiles(prev => [...prev, ...dropped])
  }

  function handleFileInput(e) {
    const picked = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }))
    setFiles(prev => [...prev, ...picked])
  }

  function removeFile(name) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  const hasEmail   = solutions.includes('Email Retargeting')
  const hasDisplay = solutions.includes('Display Retargeting')

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={14} /> Retour</Button>
        <h1 className="text-[1rem] font-bold">Nouveau Client</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left col */}
        <div className="space-y-4">
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Informations Client</div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom client *" placeholder="Décathlon FR" />
              <Input label="Pays" placeholder="France" />
              <Input label="Ville" placeholder="Paris" />
              <Input label="Téléphone" placeholder="+33 1 00 00 00 00" type="tel" />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Descriptif activité</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
                placeholder="E-commerce mode, 2M visiteurs/mois…"
              />
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Frais</div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Setup (€)" type="number" placeholder="1200" />
                <Input label="Min. facturation (€)" type="number" placeholder="500" />
                <Input label="Frais créa (€)" type="number" placeholder="0" />
                <Input label="Durée test (mois)" type="number" placeholder="4" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Informations AM / Sales</div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="AM assigné(e)">
                <option>Julie M.</option>
                <option>Marc T.</option>
                <option>Nadia K.</option>
              </Select>
              <Select label="Sales">
                <option>Pierre R.</option>
                <option>Sophie L.</option>
                <option>Tom B.</option>
              </Select>
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Notes deal</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
                placeholder="Contexte particulier, points à retenir…"
              />
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Solutions choisies</div>
            <div className="space-y-2 mb-3">
              {SOLUTIONS.map(s => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={solutions.includes(s)}
                    onChange={() => toggleSol(s)}
                    className="accent-main"
                  />
                  <span className="text-[12px]">{s}</span>
                </label>
              ))}
            </div>

            {/* Email config */}
            {hasEmail && (
              <div className="bg-pink-50 rounded-lg p-3 mb-2">
                <div className="text-[10px] font-bold text-main uppercase tracking-wide mb-2">Config Email Retargeting</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Sender Name" placeholder="Votre Marque" />
                  <Select label="Type commission">
                    <option>% sur vente</option>
                    <option>Fixe / vente</option>
                    <option>CPC</option>
                    <option>Mensuel fixe</option>
                  </Select>
                  <Input label="Valeur commission" placeholder="ex. 15" />
                  <Input label="Min. facturation email" placeholder="400" />
                </div>
              </div>
            )}

            {/* Display config */}
            {hasDisplay && (
              <div className="bg-purple-50 rounded-lg p-3 mb-2">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide mb-2">Config Display</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Budget mensuel (€)" placeholder="3000" />
                  <Input label="Réseaux exclus" placeholder="ex. SEM" />
                </div>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Documents</div>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all mb-3 ${
                dragging ? 'border-main bg-pink-50' : 'border-border hover:border-main hover:bg-pink-50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              style={{ cursor: 'pointer' }}
            >
              <Upload size={20} className="mx-auto mb-2 text-info" />
              <div className="font-semibold text-[12px]">BDC obligatoire · Drag & drop</div>
              <div className="text-[10px] text-info mt-1">NDA, K-Bis, Attestation mandat — optionnels</div>
              <input id="file-input" type="file" multiple hidden onChange={handleFileInput} />
            </div>

            {/* Mandatory list */}
            {[{ name: 'BDC signé', required: true }, { name: 'Attestation de mandat', required: false }, { name: 'Autre (NDA, K-Bis…)', required: false }].map(f => {
              const uploaded = files.some(uf => uf.name.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]))
              return (
                <div key={f.name} className="flex items-center gap-2 p-2 bg-bg rounded-lg mb-1.5 text-[11px]">
                  <span className="flex-1">{f.name}</span>
                  {f.required && <span className="text-[9px] bg-pink-100 text-main px-1.5 py-0.5 rounded-full font-bold">OBLIGATOIRE</span>}
                  {uploaded
                    ? <span className="text-success font-bold flex items-center gap-1"><Check size={12} /> OK</span>
                    : <span className="text-info">En attente</span>}
                </div>
              )
            })}

            {/* Uploaded files list */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map(f => (
                  <div key={f.name} className="flex items-center gap-2 p-2 bg-white border border-border rounded-lg text-[11px]">
                    <span className="flex-1 truncate font-medium">{f.name}</span>
                    <span className="text-info">{(f.size / 1024).toFixed(0)} Ko</span>
                    <button onClick={() => removeFile(f.name)} className="text-error hover:opacity-70"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
        <Button variant="default" onClick={onBack}>Annuler</Button>
        <Button variant="primary">
          Créer le client & démarrer l'onboarding →
        </Button>
      </div>
    </div>
  )
}
