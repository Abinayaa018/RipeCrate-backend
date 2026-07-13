import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { analyticsTrend, alertCenter, inventoryBatches, timelineEvents } from '../data/dashboard'
import { StatusChip } from '../components/ui'
import { api, auth, type DashboardData, type AlertItem, type BatchItem } from '../services/api'

const chartTooltip = {
  backgroundColor: '#0E1830',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  color: '#F8FAFC',
  fontSize: 12,
}

const healthPie = [
  { name: 'Healthy', value: 76, fill: '#7CFF6B' },
  { name: 'Warning', value: 16, fill: '#FFB84D' },
  { name: 'Critical', value: 8, fill: '#FF5C5C' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [batches, setBatches] = useState<BatchItem[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    if (!auth.isLoggedIn()) { navigate('/auth'); return }
    api.dashboard().then(setData).catch(() => {})
    api.batches().then(setBatches).catch(() => {})
    api.alerts().then(setAlerts).catch(() => {})
  }, [])

  const kpis = data ? [
    { label: 'Total Batches', value: String(data.total_batches), sub: 'active batches', tone: 'text-accent' },
    { label: 'Healthy Produce', value: String(data.healthy_batches ?? 0), sub: 'healthy batches', tone: 'text-accent2' },
    { label: 'High Risk', value: String(data.critical_batches ?? 0), sub: 'critical batches', tone: 'text-danger' },
    { label: 'Expiring Soon', value: String(data.expiring_soon ?? 0), sub: 'within 3 days', tone: 'text-warning' },
    { label: 'Total Weight', value: `${((data.total_weight_kg ?? 0) / 1000).toFixed(1)}t`, sub: 'across all sites', tone: 'text-accent2' },
    { label: 'Avg Spoilage', value: `${((data.avg_spoilage_probability ?? 0) * 100).toFixed(1)}%`, sub: 'risk score', tone: 'text-warning' },
  ] : [
    { label: 'Total Inventory', value: '—', sub: 'loading…', tone: 'text-accent' },
    { label: 'Healthy Produce', value: '—', sub: 'loading…', tone: 'text-accent2' },
    { label: 'High Risk Batches', value: '—', sub: 'loading…', tone: 'text-danger' },
    { label: "Today's Predictions", value: '—', sub: 'loading…', tone: 'text-accent' },
    { label: 'Active Warehouses', value: '—', sub: 'loading…', tone: 'text-accent2' },
    { label: 'Model Accuracy', value: '92.8%', sub: 'ensemble v2.4.8', tone: 'text-warning' },
  ]

  // Use live alerts if available, else static
  const displayAlerts = alerts.length > 0
    ? alerts.slice(0, 4).map(a => ({
        id: a.id,
        title: a.message,
        source: a.type.replace(/_/g, ' '),
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'Warning' : 'Info',
      }))
    : alertCenter.slice(0, 4)

  // Use live batches if available, else static
  const displayBatches = batches.length > 0
    ? batches.slice(0, 5).map(b => ({
        code: b.batch_code,
        produce: b.produce_name,
        shelf: b.predicted_expiry_date ? `${Math.max(0, Math.ceil((new Date(b.predicted_expiry_date).getTime() - Date.now()) / 86400000))}d` : '—',
        freshness: Math.round((1 - (b.spoilage_probability ?? 0)) * 100),
        status: b.status === 'healthy' ? 'Healthy' : b.status === 'critical' ? 'Critical' : b.status === 'at_risk' ? 'At risk' : b.status,
      }))
    : inventoryBatches.slice(0, 5)

  return (
    <div className="page-enter space-y-6">
      {/* Hero */}
      <div className="panel rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.44em] text-accent">Executive Overview</p>
            <h1 className="font-display mt-3 text-3xl font-bold text-text sm:text-4xl">Welcome to RipeCrate</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              AI-powered cold-chain intelligence that predicts spoilage, monitors produce health,
              and reduces food waste through machine learning and real-time analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/prediction" className="ripple rounded-[18px] border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20">
              Predict Shelf Life
            </Link>
            <Link to="/inventory" className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/30">
              View Inventory
            </Link>
            <Link to="/command-center" className="ripple rounded-[18px] border border-accent/30 bg-accent px-4 py-2.5 text-sm font-bold text-background transition hover:bg-accent/90">
              Command Center
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="lift-card panel-soft flex flex-col rounded-[20px] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">{kpi.label}</p>
            <p className={`font-display mt-3 text-3xl font-bold leading-none ${kpi.tone}`}>{kpi.value}</p>
            <p className="mt-2 text-[11px] text-muted">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-[1fr_280px] xl:items-stretch">
        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">Spoilage Trend</p>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-[10px] uppercase tracking-wider text-warning">6 months</span>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrend}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="spoilage" stroke="#FF5C5C" strokeWidth={2} fill="#FF5C5C18" />
                <Area type="monotone" dataKey="prevented" stroke="#7CFF6B" strokeWidth={2} fill="#7CFF6B18" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Spoilage</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent2" /> Prevented</span>
          </div>
        </div>

        <div className="panel flex flex-col rounded-[24px] p-5">
          <p className="text-xs uppercase tracking-[0.36em] text-muted">Inventory Health</p>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={healthPie} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {healthPie.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-accent2">87</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">score</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {healthPie.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.fill }} />{item.name}
                </span>
                <span className="font-semibold text-text">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Predictions + Alerts */}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr] xl:items-stretch">
        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">Recent Batches</p>
            <Link to="/inventory" className="text-[10px] uppercase tracking-wider text-accent hover:underline">View all</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.28em] text-muted">
                  <th className="pb-3 pr-4">Batch</th>
                  <th className="pb-3 pr-4">Produce</th>
                  <th className="pb-3 pr-4">Shelf Life</th>
                  <th className="pb-3 pr-4">Freshness</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayBatches.map(batch => (
                  <tr key={batch.code} className="border-t border-white/[0.06]">
                    <td className="py-3 pr-4 font-mono text-xs text-accent">{batch.code}</td>
                    <td className="py-3 pr-4 text-text">{batch.produce}</td>
                    <td className="py-3 pr-4 font-semibold text-accent">{batch.shelf}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.06]">
                          <div className={`h-1.5 rounded-full ${batch.freshness > 70 ? 'bg-accent2' : batch.freshness > 35 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${batch.freshness}%` }} />
                        </div>
                        <span className="text-xs text-muted">{batch.freshness}%</span>
                      </div>
                    </td>
                    <td className="py-3"><StatusChip label={batch.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">Recent Alerts</p>
            <Link to="/alerts" className="text-[10px] uppercase tracking-wider text-accent hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-2">
            {displayAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 rounded-[16px] border border-white/[0.06] bg-[#0b1a31]/60 p-3">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${alert.severity === 'Critical' ? 'bg-danger' : alert.severity === 'Warning' ? 'bg-warning' : 'bg-accent'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{alert.source} · {alert.time}</p>
                </div>
                <StatusChip label={alert.severity} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="panel rounded-[24px] p-5">
        <p className="text-xs uppercase tracking-[0.36em] text-muted">Recent Activity</p>
        <div className="relative mt-4 space-y-3 pl-5">
          <div className="absolute bottom-2 left-1.5 top-2 w-px bg-white/10" />
          {timelineEvents.map(event => (
            <div key={event.title} className="relative flex gap-4">
              <span className={`absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-[#06101f] ${event.type === 'critical' ? 'bg-danger' : event.type === 'warning' ? 'bg-warning' : event.type === 'resolved' ? 'bg-accent2' : 'bg-accent'}`} />
              <div className="min-w-0 flex-1 rounded-[16px] border border-white/[0.06] bg-[#0b1a31]/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-text">{event.title}</p>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted">{event.time}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
