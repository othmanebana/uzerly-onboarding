import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, ArrowRight } from 'lucide-react'
import { Button, SectionHeader, Card } from '../components/UI'
import { EMAIL_TEMPLATES } from '../lib/constants'

export default function EmailsPage() {
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing]   = useState(null)

  function toggle(id) { setExpanded(v => v === id ? null : id) }

  return (
    <div>
      <SectionHeader title="Gestionnaire d'Emails">
        <Button variant="primary" size="sm"><Plus size={13} /> Nouveau template</Button>
      </SectionHeader>

      {/* Scenario flow */}
      <Card className="mb-5">
        <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-3">Scénario de relance automatique</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {EMAIL_TEMPLATES.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 flex-shrink-0">
              <div
                className="border border-border rounded-xl p-3 min-w-[130px] cursor-pointer hover:border-main transition-colors"
                onClick={() => toggle(t.id)}
              >
                <div className="inline-block bg-pink-50 text-main text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">{t.tag}</div>
                <div className="font-semibold text-[11px] mb-1 leading-tight">{t.label}</div>
                <div className="text-[10px] text-info">{t.delay}</div>
              </div>
              {i < EMAIL_TEMPLATES.length - 1 && (
                <ArrowRight size={16} className="text-border flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Templates list */}
      <div className="space-y-2">
        {EMAIL_TEMPLATES.map(t => (
          <div key={t.id} className="bg-white border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-bg transition-colors"
              onClick={() => toggle(t.id)}
            >
              <div className="flex items-center gap-3">
                <span className="bg-pink-50 text-main text-[10px] font-bold px-2 py-0.5 rounded-full">{t.tag}</span>
                <span className="font-semibold text-[12px]">{t.label}</span>
                <span className="text-[10px] text-info">{t.delay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={e => { e.stopPropagation(); setEditing(t.id) }}>Éditer</Button>
                {expanded === t.id ? <ChevronUp size={15} className="text-info" /> : <ChevronDown size={15} className="text-info" />}
              </div>
            </div>

            {/* Expanded body */}
            {expanded === t.id && (
              <div className="border-t border-border px-4 py-3 bg-bg animate-fade-in">
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-info uppercase tracking-wide">Objet</span>
                  <div className="text-[12px] font-medium mt-0.5">{t.subject}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-info uppercase tracking-wide">Corps du mail</span>
                  {editing === t.id ? (
                    <textarea
                      defaultValue={t.body}
                      rows={8}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-[11px] font-mono outline-none focus:border-main resize-none"
                    />
                  ) : (
                    <pre className="mt-1 text-[11px] text-text-base whitespace-pre-wrap leading-relaxed">{t.body}</pre>
                  )}
                </div>
                {editing === t.id && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="primary" size="sm" onClick={() => setEditing(null)}>Sauvegarder</Button>
                    <Button variant="default" size="sm" onClick={() => setEditing(null)}>Annuler</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
