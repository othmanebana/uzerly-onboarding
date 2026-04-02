import { LayoutDashboard, UserPlus, Mail, Webhook, Settings, HelpCircle, Users } from 'lucide-react'

const ADMIN_NAV = [
  { id: 'pipeline', label: 'Pipeline',        Icon: LayoutDashboard },
  { id: 'nouveau',  label: 'Nouveau client',  Icon: UserPlus },
  { id: 'emails',   label: 'Emails',          Icon: Mail },
  { id: 'api',      label: 'API & Exports',   Icon: Webhook },
]

const BOTTOM_NAV = [
  { id: 'settings', label: 'Configuration', Icon: Settings },
  { id: 'help',     label: 'Aide',          Icon: HelpCircle },
]

export default function Sidebar({ view, adminPage, clients, selectedClientId, onAdminPage, onSelectClient }) {
  return (
    <aside className="w-[220px] bg-white border-r border-border flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="font-bold text-[1.1rem]" style={{ color: '#EE0669' }}>uzerly</div>
        <div className="text-[10px] text-info tracking-widest uppercase">Onboarding Platform</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {view === 'admin' ? (
          <>
            <div className="px-4 py-2 text-[10px] text-info tracking-widest uppercase">Admin</div>
            {ADMIN_NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => onAdminPage(id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[12px] border-l-[3px] transition-all text-left cursor-pointer ${
                  adminPage === id && !selectedClientId
                    ? 'bg-pink-50 border-main font-semibold text-main'
                    : 'border-transparent text-text-base hover:bg-pink-50 hover:text-main'
                }`}
              >
                <Icon size={15} className="opacity-70" />
                {label}
              </button>
            ))}
          </>
        ) : (
          <>
            <div className="px-4 py-2 text-[10px] text-info tracking-widest uppercase">Clients</div>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectClient(c)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-[11px] border-l-[3px] transition-all text-left cursor-pointer ${
                  selectedClientId === c.id
                    ? 'bg-pink-50 border-main font-semibold text-main'
                    : 'border-transparent text-text-base hover:bg-pink-50 hover:text-main'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#EE0669,#ff6b9d)' }}
                >
                  {c.initials}
                </div>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </>
        )}

        {/* Bottom */}
        <div className="px-4 py-2 mt-4 text-[10px] text-info tracking-widest uppercase">Général</div>
        {BOTTOM_NAV.map(({ id, label, Icon }) => (
          <button key={id} className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] border-l-[3px] border-transparent text-text-base hover:bg-pink-50 hover:text-main transition-all text-left cursor-pointer">
            <Icon size={15} className="opacity-70" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
