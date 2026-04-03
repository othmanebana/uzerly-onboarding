import { useState, useEffect } from 'react'
import { X, Send, Loader2, Check, Users } from 'lucide-react'
import { logHandover, getTeamMembers } from '../lib/supabase'

export default function HandoverModal({ step, client, onClose, onConfirmed }) {
  const [team,    setTeam]    = useState([])
  const [toMember, setToMember] = useState('')
  const [toEmail,  setToEmail]  = useState('')
  const [notes,   setNotes]   = useState('')
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    getTeamMembers().then(members => {
      setTeam(members)
      // Pre-select next logical owner based on step owner hint
      const next = members.find(m => step.owner?.includes(m.role))
      if (next) { setToMember(next.name); setToEmail(next.email) }
    }).catch(() => {})
  }, [step])

  // Also include client contacts as recipients
  const recipients = [
    ...team.map(m => ({ label: `${m.name} (${m.role})`, name: m.name, email: m.email })),
    ...(client.client_main_contact_email ? [{
      label: `${client.client_main_contact_name || 'Contact client'} (Client)`,
      name:  client.client_main_contact_name || 'Contact client',
      email: client.client_main_contact_email,
    }] : []),
    ...(client.client_tech_contact_email ? [{
      label: `${client.client_tech_contact_name || 'Tech client'} (Client Tech)`,
      name:  client.client_tech_contact_name || 'Tech client',
      email: client.client_tech_contact_email,
    }] : []),
  ]

  function selectRecipient(e) {
    const selected = recipients.find(r => r.email === e.target.value)
    if (selected) { setToMember(selected.name); setToEmail(selected.email) }
  }

  async function handleSend() {
    setSending(true)
    try {
      // Log the handover in DB
      await logHandover({
        client_id:   client.id,
        step_id:     step.id,
        step_number: step.step_number,
        from_member: client.am || 'Équipe Uzerly',
        to_member:   toMember,
        to_email:    toEmail,
        notes,
        notified:    true,  // simulated
      })

      // Simulate email notification (console + future real send)
      console.info(`📧 [HANDOVER SIMULÉ] 
Destinataire : ${toMember} <${toEmail}>
Objet : [Uzerly] Dossier ${client.name} — Étape ${step.step_number} "${step.title}" terminée
Corps :
  Bonjour ${toMember},
  
  L'étape "${step.title}" du dossier "${client.name}" vient d'être marquée comme Terminée.
  
  ${notes ? `Notes de transfert :\n  ${notes}` : ''}
  
  Vous pouvez consulter le dossier sur la plateforme Uzerly.
  
  Bonne continuation,
  L'équipe Uzerly`)

      setDone(true)
      setTimeout(() => { onConfirmed(); onClose() }, 1500)
    } catch (err) {
      console.error('Handover error:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-border w-full max-w-md shadow-xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center">
              <Check size={14} strokeWidth={3} className="text-white" />
            </div>
            <span className="font-bold text-[0.9rem]">Étape terminée — Passation</span>
          </div>
          <button onClick={onClose} className="text-info hover:text-text-base transition-colors"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Recap */}
          <div className="bg-bg rounded-xl p-3 text-[12px]">
            <div className="text-info mb-1">Étape validée</div>
            <div className="font-bold">#{step.step_number} — {step.title}</div>
            <div className="text-info mt-0.5">Client : {client.name}</div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">
              <Users size={11} className="inline mr-1" /> À qui passer la main ?
            </label>
            <select
              value={toEmail}
              onChange={selectRecipient}
              className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main bg-white cursor-pointer"
            >
              <option value="">— Sélectionner un destinataire —</option>
              {recipients.map(r => (
                <option key={r.email} value={r.email}>{r.label}</option>
              ))}
            </select>
            {toEmail && (
              <div className="mt-1 text-[10px] text-info">Email : {toEmail}</div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-info uppercase tracking-wide mb-1">Notes de transfert</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Points importants, blocages résolus, actions attendues du prochain…"
              className="w-full px-3 py-2 border border-border rounded-lg text-[12px] outline-none focus:border-main resize-none"
            />
          </div>

          {/* Simulation notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
            📧 L'envoi d'email est simulé (log console). Branchez un vrai service email (Resend, SendGrid) pour les notifications réelles.
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] font-semibold border border-border rounded-lg bg-white hover:bg-bg transition-colors cursor-pointer">
            Ignorer
          </button>
          <button
            onClick={handleSend}
            disabled={sending || done || !toEmail}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold rounded-lg text-white transition-all cursor-pointer disabled:opacity-50"
            style={{ background: done ? '#13d275' : '#EE0669' }}
          >
            {done    ? <><Check size={13} /> Passation confirmée</> :
             sending ? <><Loader2 size={13} className="animate-spin" /> Envoi…</> :
             <><Send size={13} /> Notifier & confirmer</>}
          </button>
        </div>
      </div>
    </div>
  )
}
