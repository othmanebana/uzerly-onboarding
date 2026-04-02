import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import { Button, SectionHeader, MetricCard } from '../components/UI'
import { LoadingSpinner } from '../components/States'

function CodeBlock({ json }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative mt-2">
      <pre className="bg-[#1e1e2e] text-[#cdd6f4] rounded-xl p-4 text-[10px] font-mono overflow-x-auto leading-relaxed">
        {JSON.stringify(json, null, 2)}
      </pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  )
}

export default function APIPage({ clients = [] }) {
  if (!clients.length) return <LoadingSpinner message="Chargement des données…" />

  const totalSetup    = clients.reduce((s, c) => s + (c.setup ?? 0), 0)
  const totalBudget   = clients.reduce((s, c) => s + (c.budget ?? 0), 0)
  const avgMinBilling = Math.round(clients.reduce((s, c) => s + (c.min_billing ?? 0), 0) / clients.length)

  const metrics = [
    { label: 'Revenus setup total',     value: totalSetup.toLocaleString('fr-FR') + ' €',       color: '#EE0669' },
    { label: 'Budget média total/mois', value: (totalBudget / 1000).toFixed(1) + 'k €',          color: '#7f88ad' },
    { label: 'Min. facturation moyen',  value: avgMinBilling.toLocaleString('fr-FR') + ' €',     color: '#13d275' },
    { label: 'Clients actifs',          value: clients.length,                                    color: '#f59e0b' },
  ]

  const payload = clients.map(c => ({
    id: c.id, name: c.name, solutions: c.solutions,
    am: c.am, sales: c.sales,
    setup_fee: c.setup, min_billing: c.min_billing, monthly_budget: c.budget,
    progress_pct: c.progress, status: c.status,
  }))

  function exportJSON() {
    const b = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'uzerly_clients.json'; a.click()
  }

  function exportCSV() {
    const keys = Object.keys(payload[0])
    const rows = [
      keys.join(','),
      ...payload.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(',')),
    ].join('\n')
    const b = new Blob([rows], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'uzerly_clients.csv'; a.click()
  }

  return (
    <div>
      <SectionHeader title="Centre d'API & Exports">
        <Button variant="primary" size="sm">Configurer webhooks</Button>
      </SectionHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="text-[10px] font-bold text-info uppercase tracking-wide mb-1">Webhook Compta / RH</div>
        <div className="text-[11px] text-info mb-2">Payload JSON — envoyé automatiquement à chaque update d'onboarding</div>
        <div className="text-[10px] bg-bg px-3 py-1.5 rounded-lg border border-border font-mono text-info mb-2">
          POST https://api.uzerly.com/webhooks/onboarding-update
        </div>
        <CodeBlock json={payload[0]} />
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border text-[10px] font-bold text-info uppercase tracking-wide">
          Données clés — {clients.length} clients
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              {['Client','Solutions','Setup','Min. fact.','Budget/mois','Progression'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-info uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg">
                <td className="px-4 py-2.5 font-semibold">{c.name}</td>
                <td className="px-4 py-2.5 text-info">{c.solutions.join(', ') || '—'}</td>
                <td className="px-4 py-2.5">{(c.setup ?? 0).toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-2.5">{(c.min_billing ?? 0).toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-2.5">{(c.budget ?? 0).toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: '#EE0669' }}>{c.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button variant="default" onClick={exportJSON}><Download size={13} /> Export JSON</Button>
        <Button variant="default" onClick={exportCSV}><Download size={13} /> Export CSV</Button>
      </div>
    </div>
  )
}
