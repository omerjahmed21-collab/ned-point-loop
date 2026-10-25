import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const NAV = {
  student: [
    { to: '/map', label: 'Live map', icon: '🗺️' },
    { to: '/routes', label: 'Routes', icon: '🚏' },
    { to: '/fee', label: 'Fee receipt', icon: '🧾' },
  ],
  driver: [
    { to: '/driver', label: 'Trip', icon: '🚌', end: true },
    { to: '/driver/check', label: 'Check student', icon: '🪪' },
  ],
  admin: [
    { to: '/admin-info', label: 'Admin', icon: '🛠️' },
    { to: '/map', label: 'Live map', icon: '🗺️' },
    { to: '/routes', label: 'Routes', icon: '🚏' },
  ],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = NAV[user.role] || []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="no-print text-white bg-gradient-to-r from-brand-900 via-brand-700 to-brand-800 border-b-4 border-accent-400">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/ned-logo.png" alt="NED University" className="w-9 h-9 object-contain" />
            <span className="font-extrabold tracking-tight">NED Point <span className="text-accent-400">Loop</span></span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white/15' : 'text-white/80 hover:text-white'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-white/80">
              {user.first_name || user.username} · <span className="capitalize">{user.role}</span>
            </span>
            <button onClick={handleLogout} className="text-sm font-medium text-accent-400 hover:text-accent-500">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 pb-24 sm:pb-6">{children}</main>

      {/* Bottom tab bar on phones */}
      <nav className="no-print sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex-1 py-2.5 flex flex-col items-center text-xs font-medium ${isActive ? 'text-brand-600' : 'text-stone-500'}`
            }
          >
            <span className="text-lg leading-none mb-0.5">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
