import { useState } from 'react'
import Sidebar from './components/Sidebar'
import PipelinePage    from './pages/PipelinePage'
import NewClientPage   from './pages/NewClientPage'
import EmailsPage      from './pages/EmailsPage'
import APIPage         from './pages/APIPage'
import ClientDetailPage from './pages/ClientDetailPage'
import ClientView      from './pages/ClientView'
import { MOCK_CLIENTS } from './lib/constants'

const PAGE_TITLES = {
  pipeline: 'Pipeline Onboarding',
  nouveau:  'Nouveau Client',
  emails:   'Gestionnaire d\'Emails',
  api:      'API & Exports',
}

export default function App() {
  const [view,           setView]           = useState('admin')   // 'admin' | 'client'
  const [adminPage,      setAdminPage]      = useState('pipeline')
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientViewSel,  setClientViewSel]  = useState(MOCK_CLIENTS[0])

  function handleAdminPage(page) {
    setAdminPage(page)
    setSelectedClient(null)
  }

  function renderAdmin() {
    if (selectedClient) {
      return <ClientDetailPage client={selectedClient} onBack={() => setSelectedClient(null)} />
    }
    switch (adminPage) {
      case 'pipeline': return <PipelinePage clients={MOCK_CLIENTS} onViewClient={setSelectedClient} />
      case 'nouveau':  return <NewClientPage onBack={() => setAdminPage('pipeline')} />
      case 'emails':   return <EmailsPage />
      case 'api':      return <APIPage />
      default:         return null
    }
  }

  const topbarTitle = view === 'admin'
    ? (selectedClient ? selectedClient.name : PAGE_TITLES[adminPage])
    : `Onboarding · ${clientViewSel.name}`

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        view={view}
        adminPage={adminPage}
        clients={MOCK_CLIENTS}
        selectedClientId={selectedClient?.id}
        onAdminPage={handleAdminPage}
        onSelectClient={c => { setClientViewSel(c) }}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-border px-6 h-13 flex items-center justify-between flex-shrink-0" style={{ height: 52 }}>
          <span className="font-bold text-[0.95rem]">{topbarTitle}</span>
          <div className="flex items-center gap-3">
            {view === 'admin'
              ? <span className="text-[10px] bg-pink-50 text-main font-bold px-2.5 py-1 rounded-full">Vue Admin</span>
              : <span className="text-[10px] bg-indigo-50 text-indigo-500 font-bold px-2.5 py-1 rounded-full">Vue Client</span>
            }
            {/* Toggle */}
            <div className="flex bg-bg rounded-lg p-0.5 gap-0.5">
              {['admin','client'].map(v => (
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'admin'
            ? renderAdmin()
            : <ClientView client={clientViewSel} />
          }
        </main>
      </div>
    </div>
  )
}
