import { LayoutDashboard, UserPlus, Mail, Webhook, Settings, HelpCircle } from 'lucide-react'

const ADMIN_NAV = [
  { id: 'pipeline',  label: 'Pipeline',        Icon: LayoutDashboard },
  { id: 'nouveau',   label: 'Nouveau client',  Icon: UserPlus },
  { id: 'emails',    label: 'Emails',          Icon: Mail },
  { id: 'api',       label: 'API & Exports',   Icon: Webhook },
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

      <nav className="flex-1 py-3 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {view === 'admin' ? (
            <>
              <div className="px-4 py-2 text-[10px] text-info tracking-widest uppercase">Admin</div>
              {ADMIN_NAV.map(({ id, label, Icon }) => (
                <NavItem key={id} id={id} label={label} Icon={Icon}
                  active={adminPage === id && !selectedClientId}
                  onClick={() => onAdminPage(id)} />
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
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#EE0669,#ff6b9d)' }}>
                    {c.initials}
                  </div>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Bottom nav — always visible */}
        <div>
          <div className="px-4 py-2 text-[10px] text-info tracking-widest uppercase border-t border-border mt-2 pt-4">Général</div>
          {BOTTOM_NAV.map(({ id, label, Icon }) => (
            <NavItem key={id} id={id} label={label} Icon={Icon}
              active={adminPage === id}
              onClick={() => onAdminPage(id)} />
          ))}
        </div>
      </nav>
    </aside>
  )
}

function NavItem({ id, label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[12px] border-l-[3px] transition-all text-left cursor-pointer ${
        active
          ? 'bg-pink-50 border-main font-semibold text-main'
          : 'border-transparent text-text-base hover:bg-pink-50 hover:text-main'
      }`}
    >
      <Icon size={15} className="opacity-70 flex-shrink-0" />
      {label}
    </button>
  )
}
