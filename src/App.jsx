import { useState } from 'react'
import Sidebar           from './components/Sidebar'
import PipelinePage      from './pages/PipelinePage'
import NewClientPage     from './pages/NewClientPage'
import EmailsPage        from './pages/EmailsPage'
import APIPage           from './pages/APIPage'
import ClientDetailPage  from './pages/ClientDetailPage'
import ClientView        from './pages/ClientView'
import { useClients }    from './hooks/useClients'

const PAGE_TITLES = {
  pipeline: 'Pipeline Onboarding',
  nouveau:  'Nouveau Client',
  emails:   'Gestionnaire d\'Emails',
  api:      'API & Exports',
}

export default function App() {
  const { clients, loading, error, refetch, updateStep } = useClients()

  const [view,           setView]           = useState('admin')
  const [adminPage,      setAdminPage]      = useState('pipeline')
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientViewSel,  setClientViewSel]  = useState(null)

  // Keep selectedClient & clientViewSel in sync with fresh data
  const freshSelected    = selectedClient ? clients.find(c => c.id === selectedClient.id) ?? selectedClient : null
  const freshClientView  = clientViewSel  ? clients.find(c => c.id === clientViewSel.id)  ?? clientViewSel  : clients[0] ?? null

  function handleAdminPage(page) {
    setAdminPage(page)
    setSelectedClient(null)
  }

  function handleClientCreated(newClient) {
    refetch()
    setAdminPage('pipeline')
  }

  function handleUpdateStep(clientId, stepId, status) {
    updateStep(clientId, stepId, status)
    // Also refresh freshSelected ref
  }

  function renderAdmin() {
    if (freshSelected) {
      return (
        <ClientDetailPage
          client={freshSelected}
          onBack={() => setSelectedClient(null)}
          onUpdateStep={handleUpdateStep}
        />
      )
    }
    switch (adminPage) {
      case 'pipeline':
        return (
          <PipelinePage
            clients={clients}
            loading={loading}
            error={error}
            onRefetch={refetch}
            onViewClient={c => setSelectedClient(c)}
          />
        )
      case 'nouveau':
        return <NewClientPage onBack={() => setAdminPage('pipeline')} onCreated={handleClientCreated} />
      case 'emails':
        return <EmailsPage />
      case 'api':
        return <APIPage clients={clients} />
      default:
        return null
    }
  }

  const topbarTitle = view === 'admin'
    ? (freshSelected ? freshSelected.name : PAGE_TITLES[adminPage])
    : `Onboarding · ${freshClientView?.name ?? '…'}`

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        view={view}
        adminPage={adminPage}
        clients={clients}
        selectedClientId={freshSelected?.id}
        onAdminPage={handleAdminPage}
        onSelectClient={c => setClientViewSel(c)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-border px-6 flex items-center justify-between flex-shrink-0" style={{ height: 52 }}>
          <span className="font-bold text-[0.95rem]">{topbarTitle}</span>
          <div className="flex items-center gap-3">
            {view === 'admin'
              ? <span className="text-[10px] bg-pink-50 text-main font-bold px-2.5 py-1 rounded-full">Vue Admin</span>
              : <span className="text-[10px] bg-indigo-50 text-indigo-500 font-bold px-2.5 py-1 rounded-full">Vue Client</span>
            }
            <div className="flex bg-bg rounded-lg p-0.5 gap-0.5">
              {['admin', 'client'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border-none ${
                    view === v ? 'bg-white text-main shadow-sm' : 'bg-transparent text-info'
                  }`}
                >
                  {v === 'admin' ? 'Admin' : 'Client'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'admin'
            ? renderAdmin()
            : freshClientView
              ? <ClientView client={freshClientView} />
              : <div className="text-[12px] text-info text-center py-20">Sélectionnez un client dans la sidebar.</div>
          }
        </main>
      </div>
    </div>
  )
}
