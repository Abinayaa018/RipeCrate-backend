import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChartIcon,
  BellIcon,
  BoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  ExitIcon,
  GearIcon,
  LightningBoltIcon,
  PieChartIcon,
  ReaderIcon,
  RocketIcon,
  StarIcon,
} from '@radix-ui/react-icons'
import { api } from '../services/api'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/command-center', label: 'Command Center', icon: RocketIcon },
  { path: '/prediction', label: 'Prediction Lab', icon: PieChartIcon },
  { path: '/inventory', label: 'Inventory', icon: BoxIcon },
  { path: '/warehouses', label: 'Warehouses', icon: StarIcon },
  { path: '/analytics', label: 'Analytics', icon: BarChartIcon },
  { path: '/reports', label: 'Reports', icon: ReaderIcon },
  { path: '/alerts', label: 'Alerts', icon: BellIcon },
  { path: '/settings', label: 'Settings', icon: GearIcon },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function logout() {
    api.logout()
    navigate('/auth')
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-white/10 bg-[#06101f]/90 backdrop-blur-2xl transition-all duration-300 lg:flex ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {/* Collapse toggle */}
        <div className={`mb-2 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="grid h-7 w-7 place-items-center rounded-[10px] text-muted transition hover:bg-white/[0.06] hover:text-text"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon
            const active =
              location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'border border-transparent text-muted hover:bg-white/[0.05] hover:text-text'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-muted group-hover:text-text'}`}
                />
                {!collapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-3">
        <button
          onClick={logout}
          className={`group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-danger/10 hover:text-danger ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <ExitIcon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
