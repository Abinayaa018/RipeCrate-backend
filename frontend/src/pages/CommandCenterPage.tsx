import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  chainSteps,
  recommendations,
  sensorFeed,
  spoilagePrediction,
  timelineEvents,
  warehouseNodes,
} from '../data/dashboard'
import { api } from '../services/api'

const statusClass = {
  green: 'bg-accent2 text-accent2',
  yellow: 'bg-warning text-warning',
  red: 'bg-danger text-danger',
} as const
type StatusKey = keyof typeof statusClass

const chartTooltip = {
  backgroundColor: '#0E1830',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  color: '#F8FAFC',
  fontSize: 12,
} as const

export default function CommandCenterPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouseNodes[0])
  const [liveTick, setLiveTick] = useState(0)
  const [briefing, setBriefing] = useState('')
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  async function generateBriefing() {
    setBriefingLoading(true)
    setBriefing('')
    try {
      const res = await api.ask('Give me a full operational briefing: critical batches, expiring produce, warehouse wastage, and top recommendations.')
      setBriefing(res.answer)
    } catch {
      setBriefing('Could not generate briefing — make sure you are logged in.')
    } finally {
      setBriefingLoading(false)
    }
  }

  async function exportSnapshot() {
    try {
      const batches = await api.batches()
      api.downloadCsv(batches)
      setExportMsg('Snapshot exported!')
      setTimeout(() => setExportMsg(''), 2000)
    } catch {
      setExportMsg('Export failed — log in first.')
      setTimeout(() => setExportMsg(''), 2000)
    }
  }

  useEffect(() => {
    const t = window.setInterval(() => setLiveTick(x => x + 1), 4000)
    return () => window.clearInterval(t)
  }, [])

  const forecastSeries = useMemo(() => {
    const drift = (liveTick % 9) * 0.5
    return spoilagePrediction.map(p => ({ ...p, value: Math.max(0, p.value + drift / 2) }))
  }, [liveTick])

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="panel rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.44em] text-accent">Command Center</p>
            <h1 className="font-display mt-2 text-3xl font-bold text-text sm:text-4xl">
              Cold Chain Control Room
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Monitor live warehouse telemetry, sensor health, AI predictions, alerts and inventory
              status in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setLiveTick(x => x + 1)}
              className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/30"
            >
              Refresh Telemetry
            </button>
            <button onClick={generateBriefing} disabled={briefingLoading} className="ripple rounded-[18px] border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-60">
              {briefingLoading ? 'Generating…' : 'Generate AI Briefing'}
            </button>
            <button onClick={exportSnapshot} className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/30">
              {exportMsg || 'Export Snapshot'}
            </button>
            <button onClick={() => api.evaluateAlerts().catch(() => {})} className="ripple rounded-[18px] border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20">
              Evaluate Alerts
            </button>
          </div>
        </div>

        {/* Live status bar */}
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[18px] border border-white/[0.06] bg-[#071224]/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="status-dot h-2 w-2 rounded-full bg-accent2 text-accent2" />
            <span className="text-xs font-semibold text-accent2">Telemetry Live</span>
          </div>
          <span className="text-xs text-muted">Tick {liveTick}</span>
          <div className="ml-auto flex flex-wrap gap-4 text-xs text-muted">
            <span>12 warehouses online</span>
            <span>418 active batches</span>
            <span>2 escalations pending</span>
          </div>
        </div>

        {briefing && (
          <div className="mt-4 rounded-[18px] border border-accent/20 bg-accent/5 px-5 py-4">
            <p className="text-[10px] uppercase tracking-wider text-accent">AI Briefing</p>
            <p className="mt-2 text-sm leading-7 text-text">{briefing}</p>
          </div>
        )}
      </div>
      <div className="panel rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.36em] text-muted">Live Warehouse Map</p>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-wider text-accent">
            Interactive
          </span>
        </div>
        <div className="relative mt-4 h-[380px] overflow-hidden rounded-[20px] border border-white/10 bg-[#071224]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(54,215,255,0.14),transparent_36%),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_100%,56px_56px,56px_56px]" />
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M17 48 C32 25, 52 28, 67 42 S78 42, 82 36" fill="none" stroke="rgba(54,215,255,0.35)" strokeWidth="0.4" />
            <path d="M36 64 C42 52, 52 50, 67 42" fill="none" stroke="rgba(124,255,107,0.28)" strokeWidth="0.4" />
            <path d="M43 33 C32 44, 31 57, 36 64" fill="none" stroke="rgba(255,184,77,0.24)" strokeWidth="0.4" />
          </svg>
          {warehouseNodes.map(node => (
            <button
              key={node.label}
              type="button"
              onClick={() => setSelectedWarehouse(node)}
              style={{ top: node.y, left: node.x }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
            >
              <span className={`status-dot block h-3.5 w-3.5 rounded-full ${statusClass[node.status as StatusKey]}`} />
              <span className="mt-2 block min-w-[110px] rounded-[14px] border border-white/10 bg-[#06101f]/90 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted shadow-soft">
                {node.label}
              </span>
            </button>
          ))}
          <div className="absolute bottom-4 left-4 right-4 rounded-[18px] border border-white/10 bg-[#06101f]/92 p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-accent">{selectedWarehouse.region}</p>
                <p className="font-display mt-0.5 text-xl font-bold text-text">{selectedWarehouse.label}</p>
              </div>
              <div className="flex gap-2">
                {[selectedWarehouse.temp, selectedWarehouse.humidity, `${selectedWarehouse.batches} lots`].map(v => (
                  <span key={v} className="rounded-[12px] bg-white/[0.04] px-3 py-1.5 text-xs text-muted">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Cards + AI Predictions — equal height */}
      <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        {/* Real-time Sensor Cards */}
        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">Real-time Sensors</p>
            <span className="status-dot h-2 w-2 rounded-full bg-accent2 text-accent2" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sensorFeed.map(sensor => (
              <div
                key={`${sensor.time}-${sensor.type}`}
                className="flex flex-col gap-2 rounded-[18px] border border-white/[0.06] bg-[#050c18]/80 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-[0.22em] ${
                      sensor.status === 'critical'
                        ? 'text-danger'
                        : sensor.status === 'warning'
                          ? 'text-warning'
                          : 'text-accent2'
                    }`}
                  >
                    {sensor.type}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{sensor.time}</span>
                </div>
                <p className="text-xs text-muted">{sensor.label}</p>
                <p className="font-display text-2xl font-bold text-text">{sensor.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Predictions */}
        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">AI Predictions</p>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-[10px] uppercase tracking-wider text-warning">
              Live
            </span>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastSeries}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#9AB2D1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="baseline" fill="#FF5C5C18" stroke="#FF5C5C" strokeWidth={2} />
                <Line type="monotone" dataKey="value" stroke="#FFB84D" strokeWidth={3} dot={{ r: 4, fill: '#FFB84D' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {recommendations.slice(0, 2).map(item => (
              <button
                key={item.title}
                onClick={() => setLiveTick(x => x + 1)}
                className="ripple rounded-[16px] border border-white/[0.06] bg-[#0b1a31]/60 p-3 text-left transition hover:border-accent/20"
              >
                <p className="text-xs font-semibold text-text">{item.title}</p>
                <p className="mt-1 text-[10px] text-muted">{item.hint}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Alerts + Cold Chain Timeline — equal height */}
      <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        {/* Live Alerts */}
        <div className="panel rounded-[24px] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.36em] text-muted">Live Alerts</p>
            <span className="rounded-full bg-danger/10 px-3 py-1 text-[10px] uppercase tracking-wider text-danger">
              Critical Events
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {timelineEvents.map(event => (
              <div
                key={event.title}
                className={`rounded-[16px] border border-white/[0.06] bg-[#0b1a31]/60 p-4 ${event.type === 'critical' ? 'blink-slow' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        event.type === 'critical'
                          ? 'bg-danger'
                          : event.type === 'warning'
                            ? 'bg-warning'
                            : event.type === 'resolved'
                              ? 'bg-accent2'
                              : 'bg-accent'
                      }`}
                    />
                    <p className="text-sm font-semibold text-text">{event.title}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted">
                    {event.time}
                  </span>
                </div>
                <p className="mt-1.5 pl-4 text-xs leading-5 text-muted">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Chain Timeline */}
        <div className="panel rounded-[24px] p-5">
          <p className="text-xs uppercase tracking-[0.36em] text-muted">Cold Chain Timeline</p>
          <div className="relative mt-4 space-y-3">
            <div className="absolute left-5 top-5 h-[calc(100%-40px)] w-px bg-gradient-to-b from-accent via-accent2 to-warning" />
            {chainSteps.map((step, index) => (
              <div key={step.label} className="relative flex gap-4">
                <div
                  className={`status-dot z-10 grid h-10 w-10 shrink-0 place-items-center rounded-[14px] text-xs font-bold ${statusClass[step.status as StatusKey]}`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 rounded-[16px] border border-white/[0.06] bg-[#0b1a31]/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text">{step.label}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted">{step.delay}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{step.detail}</p>
                  <div className="mt-2 flex gap-2 text-[10px] text-muted">
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5">{step.temp}</span>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5">{step.humidity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Activity Feed */}
      <div className="panel rounded-[24px] p-5">
        <p className="text-xs uppercase tracking-[0.36em] text-muted">Warehouse Activity Feed</p>
        <div className="mt-4 overflow-x-auto rounded-[18px] border border-white/[0.06] bg-[#050c18]/80 p-3">
          {sensorFeed.map((sensor, index) => (
            <div
              key={`feed-${sensor.time}-${sensor.type}`}
              className="terminal-row grid grid-cols-[70px_68px_1fr_auto] gap-3 rounded-[12px] px-3 py-2.5 text-xs text-muted hover:bg-white/[0.04]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="text-accent">{sensor.time}</span>
              <span
                className={
                  sensor.status === 'critical'
                    ? 'text-danger'
                    : sensor.status === 'warning'
                      ? 'text-warning'
                      : 'text-accent2'
                }
              >
                {sensor.type}
              </span>
              <span className="truncate">{sensor.label}</span>
              <span className="font-semibold text-text">{sensor.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
