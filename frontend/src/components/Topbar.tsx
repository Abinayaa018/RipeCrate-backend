import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChartIcon,
  BellIcon,
  BoxIcon,
  CalendarIcon,
  ChevronRightIcon,
  DashboardIcon,
  GearIcon,
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  PieChartIcon,
  PlusIcon,
  ReaderIcon,
  RocketIcon,
  StarIcon,
  Cross2Icon,
  ExitIcon,
} from '@radix-ui/react-icons'
import AddBatchModal from './AddBatchModal'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/command-center': 'Command Center',
  '/prediction': 'Prediction Lab',
  '/inventory': 'Inventory',
  '/warehouses': 'Warehouses',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

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

function Breadcrumb() {
  const location = useLocation()
  const label = routeLabels[location.pathname] ?? 'Dashboard'
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
      <span className="text-muted/60">RipeCrate</span>
      <ChevronRightIcon className="h-3 w-3 text-muted/40" />
      <span className="font-semibold text-text">{label}</span>
    </nav>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()
  if (!open) return null
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#06101f]/98 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-[12px] border border-accent/30 bg-accent/10 text-accent">
              <RocketIcon className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-bold text-text">RipeCrate</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-[10px] text-muted hover:bg-white/[0.06] hover:text-text"
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'border border-accent/20 bg-accent/10 text-accent'
                    : 'border border-transparent text-muted hover:bg-white/[0.05] hover:text-text'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-muted'}`} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-3">
          <button className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-danger/10 hover:text-danger">
            <ExitIcon className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addBatchOpen, setAddBatchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-white/10 bg-[#06101f]/92 px-4 backdrop-blur-2xl sm:px-6">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="ripple mr-3 grid h-9 w-9 place-items-center rounded-[14px] text-muted transition hover:bg-white/[0.06] hover:text-text lg:hidden"
          aria-label="Open menu"
        >
          <HamburgerMenuIcon className="h-4 w-4" />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex shrink-0 items-center gap-3 mr-6">
          <div className="grid h-8 w-8 place-items-center rounded-[12px] border border-accent/30 bg-accent/10 text-accent shadow-glow">
            <RocketIcon className="h-4 w-4" />
          </div>
          <span className="hidden font-display text-sm font-bold tracking-wide text-text sm:block">
            RipeCrate
          </span>
        </Link>

        {/* Divider */}
        <div className="mr-6 hidden h-5 w-px bg-white/10 lg:block" />

        {/* Breadcrumb */}
        <div className="hidden lg:block">
          <Breadcrumb />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Global Search */}
        <div className="relative mr-3 hidden md:block">
          {searchOpen ? (
            <input
              autoFocus
              onBlur={() => setSearchOpen(false)}
              placeholder="Search batches, reports, commands…"
              className="h-9 w-72 rounded-[18px] border border-accent/30 bg-[#0b1a31] px-4 text-sm text-text outline-none placeholder:text-muted"
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="ripple flex h-9 items-center gap-2 rounded-[18px] border border-white/10 bg-[#0b1a31]/90 px-4 text-sm text-muted transition hover:border-accent/30 hover:text-text"
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-accent" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="ml-1 hidden rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider lg:inline">
                Ctrl K
              </kbd>
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <button onClick={() => setAddBatchOpen(true)} className="ripple mr-2 hidden h-9 items-center gap-2 rounded-[18px] border border-accent/30 bg-accent/10 px-3 text-xs font-semibold text-accent transition hover:bg-accent/20 xl:flex">
          <PlusIcon className="h-4 w-4" />
          Add Batch
        </button>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button
            className="ripple grid h-9 w-9 place-items-center rounded-[14px] text-muted transition hover:bg-white/[0.06] hover:text-text"
            title="Calendar"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>

          <button
            className="ripple bell-wiggle relative grid h-9 w-9 place-items-center rounded-[14px] text-muted transition hover:bg-white/[0.06] hover:text-warning"
            title="Notifications"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>

          <Link
            to="/settings"
            className="ripple grid h-9 w-9 place-items-center rounded-[14px] text-muted transition hover:bg-white/[0.06] hover:text-text"
            title="Settings"
          >
            <GearIcon className="h-4 w-4" />
          </Link>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-white/10" />

          {/* Avatar */}
          <Link
            to="/profile"
            className="ripple flex h-9 items-center gap-2 rounded-[18px] border border-white/10 bg-[#0b1a31]/90 px-3 text-sm font-semibold text-text transition hover:border-accent/30"
          >
            <div className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-accent">
              <PersonIcon className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline">Ops Manager</span>
          </Link>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AddBatchModal open={addBatchOpen} onClose={() => setAddBatchOpen(false)} />
    </>
  )
}
