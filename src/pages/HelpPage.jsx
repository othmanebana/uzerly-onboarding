import { useState, useEffect } from 'react'
import { Upload, Download, Pencil, Trash2, X, Check, Loader2, FileText, AlertCircle } from 'lucide-react'
import { Card, Button, Input, Select, SectionHeader } from '../components/UI'
import { getHelpDocuments, uploadHelpDocument, updateHelpDocument, deleteHelpDocument } from '../lib/supabase'

const CATEGORIES = ['Technique', 'Créa', 'Commercial', 'Général']

const CAT_COLORS = {
  Technique:   'bg-blue-100 text-blue-700',
  Créa:        'bg-purple-100 text-purple-700',
  Commercial:  'bg-pink-100 text-main',
  Général:     'bg-gray-100 text-gray-600',
}

const MIME_ICONS = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'image/': '🖼',
  default: '📁',
}

function mimeIcon(type = '') {
  for (const [key, icon] of Object.entries(MIME_ICONS)) {
    if (type.startsWith(key)) return icon
  }
  return MIME_ICONS.default
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024)        return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko'
  return (bytes / 1024 / 1024).toFixed(1) + ' Mo'
}

// ─── Upload / Edit Modal ──────────────────────────────────────────────────────
function DocModal({ doc, onClose, onSaved }) {
  const isEdit = !!doc?.id
  const [form,     setForm]     = useState({ title: doc?.title || '', description: doc?.description || '', category: doc?.category || 'Général' })
  const [file,     setFile]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.title) { setError('Le titre est obligatoire'); return }
    if (!isEdit && !file) { setError('Veuillez sélectionner un fichier'); return }
    setSaving(true); setError(null)
    try {
      if (isEdit) {
        await updateHelpDocument(doc.id, file, { ...form, file_url: doc.file_url, file_name: file?.name || doc.file_name, file_size: file?.size || doc.file_size, mime_type: file?.type || doc.mime_type })
      } else {
        await uploadHelpDocument(file, form)
      }
      onSaved()
    } catch (err) {
      setError('Erreur upload : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-border w-full max-w-md shadow-xl animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-bold text-[0.95rem]">{isEdit ? 'Modifier le document' : 'Ajouter un document'}</span>
          <button onClick={onClose} className="text-info hover:text-text-base transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[12px] text-error">
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <Input label="Titre *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Guide d'intégration technique" />
          <div>
            <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
              placeholder="Courte description du document…" />
          </div>
          <Select label="Catégorie" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Select>

          {/* File drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragging ? 'border-main bg-pink-50' : 'border-border hover:border-main hover:bg-pink-50'}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('help-file-input').click()}
          >
            {file ? (
              <div className="text-[12px] font-medium text-main">
                {mimeIcon(file.type)} {file.name} — {formatSize(file.size)}
              </div>
            ) : (
              <>
                <Upload size={18} className="mx-auto mb-1 text-info" />
                <div className="text-[12px] font-semibold">{isEdit ? 'Remplacer le fichier (optionnel)' : 'Choisir un fichier *'}</div>
                <div className="text-[10px] text-info mt-0.5">PDF, Excel, Word, Image…</div>
              </>
            )}
            <input id="help-file-input" type="file" hidden onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="default" size="sm" onClick={onClose}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={12} className="animate-spin" /> Upload…</> : <><Check size={12} /> {isEdit ? 'Mettre à jour' : 'Ajouter'}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main HelpPage ────────────────────────────────────────────────────────────
export default function HelpPage({ isAdmin = true }) {
  const [docs,       setDocs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)   // null | 'add' | doc object
  const [activeCategory, setActiveCategory] = useState('Tous')

  async function load() {
    setLoading(true)
    const data = await getHelpDocuments().catch(() => [])
    setDocs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Supprimer ce document ?')) return
    await deleteHelpDocument(id).catch(console.error)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const categories = ['Tous', ...CATEGORIES]
  const filtered   = activeCategory === 'Tous' ? docs : docs.filter(d => d.category === activeCategory)

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Aide & Ressources">
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={() => setModal('add')}>
            <Upload size={13} /> Ajouter un document
          </Button>
        )}
      </SectionHeader>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              activeCategory === cat ? 'bg-main text-white border-main' : 'bg-white text-info border-border hover:border-main'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <div className="text-[12px] text-info text-center py-12">Chargement…</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto mb-3 text-border" />
          <div className="font-semibold text-[13px] text-text-base mb-1">Aucun document</div>
          <div className="text-[11px] text-info">
            {isAdmin ? 'Ajoutez votre premier document avec le bouton ci-dessus.' : 'Aucun document disponible pour l\'instant.'}
          </div>
        </div>
      )}

      {/* Document cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white border border-border rounded-xl p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow">
            {/* Top */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl">{mimeIcon(doc.mime_type)}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                {doc.category}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="font-bold text-[13px] leading-tight mb-1">{doc.title}</div>
              {doc.description && <div className="text-[11px] text-info leading-relaxed">{doc.description}</div>}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-[10px] text-info">
              <span>{doc.file_name || 'Fichier'}</span>
              <span>·</span>
              <span>{formatSize(doc.file_size)}</span>
              {doc.download_count > 0 && <><span>·</span><span>{doc.download_count} téléchargements</span></>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-main text-white rounded-lg text-[11px] font-bold hover:bg-main-dark transition-colors"
                >
                  <Download size={12} /> Télécharger
                </a>
              ) : (
                <span className="flex-1 text-center text-[11px] text-info py-1.5 bg-bg rounded-lg">Pas encore de fichier</span>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => setModal(doc)} className="p-1.5 rounded-lg border border-border hover:bg-bg transition-colors text-info">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg border border-border hover:bg-red-50 transition-colors text-error">
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <DocModal
          doc={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
