import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', end: true },
  { to: '/calendar', label: 'Calendar', end: false },
  { to: '/stats', label: 'Stats', end: false },
  { to: '/settings', label: 'Settings', end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex min-h-11 flex-1 items-center justify-center py-3 text-sm font-medium ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
