import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from './UI'

function getLocalResponse(question, clientName) {
  const q = question.toLowerCase()
  if (q.includes('bloque') || q.includes('problème') || q.includes('stop') || q.includes('arrêt')) {
    return `Pour ${clientName}, l'étape bloquante actuelle est "Récupération du plan taggage" — en attente client depuis J+3. Relance automatique E2 envoyée. Prochain déclencheur : E3 à J+7.`
  }
  if (q.includes('prochaine') || q.includes('tâche') || q.includes('suite') || q.includes('étape')) {
    return `Prochaine action pour ${clientName} : Setup des serveurs (Tech) → puis envoi accès plateforme + plan taggage (AM). Deadline recommandée : J+2.`
  }
  if (q.includes('temps') || q.includes('durée') || q.includes('restant') || q.includes('délai')) {
    return `${clientName} est à J+5 du processus. Durée estimée restante : ~9 jours si le client répond rapidement. Étapes critiques restantes : 4.`
  }
  if (q.includes('responsable') || q.includes('qui') || q.includes('contact') || q.includes('am')) {
    return `AM assignée : Julie M. | Sales : Pierre R. Pour relancer le client, utilisez le lien Calendly dans l'email E3 ou E4.`
  }
  if (q.includes('email') || q.includes('relance') || q.includes('envoy')) {
    return `5 emails de relance sont configurés : E1 (bienvenue, J+0), E2 (relance douce, J+3), E3 (progression, J+7), E4 (blocage, J+10), E5 (dernier appel, J+14). Tous sont personnalisables dans l'onglet Emails.`
  }
  return `Je n'ai pas de données précises sur ça pour ${clientName}. Je vous recommande de consulter la timeline détaillée ou de contacter l'AM assignée directement.`
}

export default function SmartAssistant({ clientName = 'ce client' }) {
  const [msgs, setMsgs] = useState([
    {
      from: 'ai',
      text: `Bonjour ! Je suis l'assistant onboarding pour ${clientName}. Posez-moi une question : "Où ça bloque ?", "Quelle est la prochaine tâche ?" ou "Combien de temps restant ?"`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function send() {
    const q = input.trim()
    if (!q) return
    setInput('')
    setMsgs(m => [...m, { from: 'user', text: q }])
    setLoading(true)
    setTimeout(() => {
      setMsgs(m => [...m, { from: 'ai', text: getLocalResponse(q, clientName) }])
      setLoading(false)
    }, 700)
  }

  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-main" style={{ animation: 'pulse 1.5s infinite' }} />
        <span className="font-bold text-[12px]" style={{ color: '#EE0669' }}>Smart Assistant Uzerly</span>
        <span className="text-[10px] text-info ml-auto">Alimenté par les données onboarding</span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 max-h-44 overflow-y-auto mb-3 pr-1">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
              m.from === 'ai'
                ? 'bg-pink-50 text-text-base self-start rounded-bl-sm'
                : 'text-white self-end rounded-br-sm'
            }`}
            style={m.from === 'user' ? { background: '#EE0669' } : {}}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="max-w-[85%] px-3 py-2 rounded-xl text-[12px] bg-pink-50 text-info self-start opacity-60">
            En train de chercher…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-[12px] outline-none focus:border-main transition-colors"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ex: Où ça bloque ? Quelle est la prochaine tâche ?"
        />
        <Button variant="primary" size="sm" onClick={send}>
          <Send size={13} />
        </Button>
      </div>
    </div>
  )
}
