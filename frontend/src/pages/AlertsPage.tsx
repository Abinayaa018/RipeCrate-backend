import { useEffect, useMemo, useState } from 'react'
import { api, type AlertItem } from '../services/api'
import { alertCenter } from '../data/dashboard'
import { PageHeader, SearchBar, StatusChip } from '../components/ui'

function severityFromApi(s: string) {
  if (s === 'critical') return 'Critical'
  if (s === 'warning') return 'Warning'
  return 'Info'
}

function toDisplayAlert(a: AlertItem) {
  return {
    id: a.id.slice(0, 8).toUpperCase(),
    rawId: a.id,
    title: a.message,
    source: a.type.replace(/_/g, ' '),
    time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: severityFromApi(a.severity),
    status: a.resolved ? 'Resolved' : a.is_read ? 'Read' : 'Unread',
    resolved: a.resolved,
  }
}

export default function AlertsPage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [apiAlerts, setApiAlerts] = useState<ReturnType<typeof toDisplayAlert>[]>([])
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)

  // Merge static demo data as fallback
  const staticAlerts = alertCenter.map(a => ({
    id: a.id, rawId: a.id, title: a.title, source: a.source,
    time: a.time, severity: a.severity, status: a.status, resolved: false,
  }))

  const displayAlerts = apiAlerts.length > 0 ? apiAlerts : staticAlerts

  async function fetchAlerts() {
    setLoading(true)
    try {
      const data = await api.alerts()
      setApiAlerts(data.map(toDisplayAlert))
    } catch {
      // silently fall back to static data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlerts() }, [])

  async function resolve(rawId: string) {
    setResolving(rawId)
    try {
      await api.resolveAlert(rawId)
      setApiAlerts(prev => prev.map(a => a.rawId === rawId ? { ...a, status: 'Resolved', resolved: true } : a))
    } catch {
      // ignore if static data
    } finally {
      setResolving(null)
    }
  }

  async function resolveAll() {
    setLoading(true)
    try {
      await api.resolveAllAlerts()
      setApiAlerts(prev => prev.map(a => ({ ...a, status: 'Resolved', resolved: true })))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function evaluate() {
    setLoading(true)
    try {
      const res = await api.evaluateAlerts()
      await fetchAlerts()
      alert(`Alert evaluation complete. ${res.created} new alert(s) created.`)
    } catch {
      alert('Evaluation failed — make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => displayAlerts.filter(a => {
    const matchFilter = filter === 'All' || a.severity === filter || a.status === filter
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  }), [displayAlerts, filter, search])

  const unreadCount = displayAlerts.filter(a => a.status === 'Unread').length

  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Alerts"
          title="Real-time notification center"
          description="Prioritize unread alerts, filter by severity, resolve incidents, and keep warehouse teams focused on operational risk."
          actions={
            <div className="flex flex-wrap gap-3">
              <button onClick={evaluate} disabled={loading} className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text disabled:opacity-60">
                Evaluate alerts
              </button>
              <button onClick={resolveAll} disabled={loading} className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background disabled:opacity-60">
                Resolve all {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          }
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_auto]">
          <SearchBar placeholder="Search alerts and sources" value={search} onChange={setSearch} />
          <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/10 bg-[#071224]/74 p-2">
            {['All', 'Unread', 'Critical', 'Warning', 'Info'].map(item => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-[18px] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] ${filter === item ? 'bg-accent text-background' : 'text-muted hover:bg-white/[0.05]'}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel rounded-[34px] p-6">
        {loading && <p className="mb-4 text-xs text-muted">Loading alerts…</p>}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No alerts match the current filter.</p>
          )}
          {filtered.map(alert => (
            <article key={alert.id} className={`lift-card grid gap-4 rounded-[24px] border bg-[#0b1a31]/78 p-5 lg:grid-cols-[140px_1fr_120px_110px_auto] lg:items-center ${alert.resolved ? 'border-white/[0.04] opacity-60' : 'border-white/10'}`}>
              <p className="font-mono text-sm text-accent">{alert.id}</p>
              <div>
                <p className="font-semibold text-text">{alert.title}</p>
                <p className="mt-1 text-sm text-muted">{alert.source} · {alert.time}</p>
              </div>
              <StatusChip label={alert.severity} />
              <StatusChip label={alert.status} />
              <button
                onClick={() => resolve(alert.rawId)}
                disabled={alert.resolved || resolving === alert.rawId}
                className="ripple rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-text hover:border-accent/30 disabled:opacity-40"
              >
                {resolving === alert.rawId ? '…' : alert.resolved ? 'Resolved' : 'Resolve'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
