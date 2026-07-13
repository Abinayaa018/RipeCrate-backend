import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts'
import { featureImportance, predictionHistory } from '../data/dashboard'
import { PageHeader } from '../components/ui'
import { api, type PredictionResponse } from '../services/api'

const PRODUCE_OPTIONS = ['Tomatoes', 'Berries', 'Leafy greens', 'Avocados', 'Dairy', 'Strawberries', 'Mangoes']
const PACKAGING_OPTIONS = ['Ventilated crate', 'MAP sealed', 'Wax carton', 'Reusable tote', 'None']
const STORAGE_OPTIONS = ['Cold storage', 'Reefer truck', 'Retail dock', 'Ripening room', 'Ambient']
const WAREHOUSE_OPTIONS = ['North Hub', 'South Vault', 'East Cold', 'Port Gate', 'EU Relay']

const RISK_COLORS: Record<string, string> = { Low: '#7CFF6B', Medium: '#FFB84D', High: '#FF5C5C', Critical: '#FF5C5C' }

function todayMinus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export default function PredictionPage() {
  const [form, setForm] = useState({
    produce_name: 'Tomatoes',
    harvest_date: todayMinus(3),
    temperature_c: 4.8,
    humidity_pct: 89,
    packaging: 'Ventilated crate',
    storage_type: 'Cold storage',
    warehouse_location: 'North Hub',
    transportation_time_hrs: 9,
    quantity_kg: 420,
  })
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }))
    setResult(null)
  }

  async function runPrediction() {
    setLoading(true)
    setError('')
    try {
      const res = await api.predict({
        ...form,
        temperature_c: Number(form.temperature_c),
        humidity_pct: Number(form.humidity_pct),
        transportation_time_hrs: Number(form.transportation_time_hrs),
        quantity_kg: Number(form.quantity_kg),
      })
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Prediction failed. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  function saveScenario() {
    const key = `rc_scenario_${Date.now()}`
    localStorage.setItem(key, JSON.stringify({ form, result }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const confidence = result ? Math.round(result.confidence_score * 100) : 92
  const spoilagePercent = result ? Math.round(result.spoilage_probability * 100) : 14
  const shelfLife = result ? result.predicted_shelf_life_days.toFixed(1) : '—'
  const riskLevel = result?.risk_level ?? 'Low'
  const expiry = result?.estimated_expiry_date ?? '—'
  const confidenceData = [{ name: 'confidence', value: confidence, fill: '#7CFF6B' }]
  const riskSeries = predictionHistory.map(item => ({ ...item, risk: Math.min(72, item.risk + Math.round(spoilagePercent / 5)) }))

  return (
    <div className="page-enter space-y-6">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Prediction Lab"
          title="AI Shelf-Life Forecast"
          description="Tune operating conditions and watch the model update remaining shelf life, spoilage probability, confidence, risk factors, and recommended storage actions."
          actions={
            <>
              <button onClick={saveScenario} className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text hover:border-accent/30">
                {saved ? '✓ Saved' : 'Save scenario'}
              </button>
              <button onClick={runPrediction} disabled={loading} className="ripple rounded-[18px] border border-accent/30 bg-accent px-4 py-2.5 text-sm font-bold text-background disabled:opacity-60">
                {loading ? 'Running…' : 'Run prediction'}
              </button>
            </>
          }
        />

        {error && (
          <div className="mt-4 rounded-[18px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          {/* Input controls */}
          <div className="panel-soft rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.36em] text-muted">Input controls</p>
              <span className="rounded-full bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-muted">Live</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Produce */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Produce</span>
                <select value={form.produce_name} onChange={e => set('produce_name', e.target.value)} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                  {PRODUCE_OPTIONS.map(o => <option key={o} className="bg-[#071224]">{o}</option>)}
                </select>
              </label>
              {/* Harvest date */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Harvest date</span>
                <input type="date" value={form.harvest_date} onChange={e => set('harvest_date', e.target.value)} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
              </label>
              {/* Temperature */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Temperature</span>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" step="0.1" value={form.temperature_c} onChange={e => set('temperature_c', e.target.value)} className="w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
                  <span className="text-xs text-muted">°C</span>
                </div>
              </label>
              {/* Humidity */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Humidity</span>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" step="1" value={form.humidity_pct} onChange={e => set('humidity_pct', e.target.value)} className="w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
                  <span className="text-xs text-muted">%</span>
                </div>
              </label>
              {/* Packaging */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Packaging</span>
                <select value={form.packaging} onChange={e => set('packaging', e.target.value)} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                  {PACKAGING_OPTIONS.map(o => <option key={o} className="bg-[#071224]">{o}</option>)}
                </select>
              </label>
              {/* Storage type */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Storage type</span>
                <select value={form.storage_type} onChange={e => set('storage_type', e.target.value)} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                  {STORAGE_OPTIONS.map(o => <option key={o} className="bg-[#071224]">{o}</option>)}
                </select>
              </label>
              {/* Transport time */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Transport time</span>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" step="0.5" value={form.transportation_time_hrs} onChange={e => set('transportation_time_hrs', e.target.value)} className="w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
                  <span className="text-xs text-muted">h</span>
                </div>
              </label>
              {/* Warehouse */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Warehouse</span>
                <select value={form.warehouse_location} onChange={e => set('warehouse_location', e.target.value)} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                  {WAREHOUSE_OPTIONS.map(o => <option key={o} className="bg-[#071224]">{o}</option>)}
                </select>
              </label>
              {/* Quantity */}
              <label className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Quantity</span>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" step="10" value={form.quantity_kg} onChange={e => set('quantity_kg', e.target.value)} className="w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
                  <span className="text-xs text-muted">kg</span>
                </div>
              </label>
            </div>
            <button onClick={runPrediction} disabled={loading} className="ripple mt-6 w-full rounded-[24px] bg-accent py-3 text-sm font-bold text-background disabled:opacity-60">
              {loading ? 'Analysing…' : '▶ Run AI Prediction'}
            </button>
          </div>

          {/* Results */}
          <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Remaining shelf life</p>
                <p className="font-display mt-3 text-5xl font-bold text-accent">{shelfLife}{result ? 'd' : ''}</p>
                <p className="mt-2 text-xs text-muted">Expiry: {expiry}</p>
              </div>
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Spoilage probability</p>
                <p className="font-display mt-3 text-5xl font-bold text-warning">{spoilagePercent}%</p>
                <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                  <div className="h-2 rounded-full bg-warning transition-all duration-700" style={{ width: `${spoilagePercent}%` }} />
                </div>
              </div>
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Recommended action</p>
                {result?.recommendations?.[0] ? (
                  <>
                    <p className="mt-3 text-base font-semibold leading-6 text-text">{result.recommendations[0].title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">{result.recommendations[0].reason.slice(0, 80)}…</p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted">Run a prediction to see recommendations.</p>
                )}
              </div>
            </div>

            {/* Model diagnosis */}
            <div className="panel-soft rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.36em] text-muted">Model diagnosis</p>
                  <h3 className="font-display mt-1 text-xl font-bold text-text">AI Results</h3>
                </div>
                <span className="rounded-full bg-accent2/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-accent2">v2.4.8</span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Confidence radial */}
                <div className="rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Confidence score</p>
                  <div className="relative mt-3 flex items-center justify-center">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="68%" outerRadius="100%" data={confidenceData} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'rgba(255,255,255,0.06)' }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <p className="font-display text-3xl font-bold text-accent2">{confidence}%</p>
                    </div>
                  </div>
                </div>

                {/* Risk level */}
                <div className="rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Risk level</p>
                  <div className="mt-3 space-y-2">
                    {(['Low', 'Medium', 'High'] as const).map(label => (
                      <div key={label} className={`rounded-[12px] px-3 py-2 text-sm font-semibold transition-all ${
                        label === riskLevel
                          ? `bg-[${RISK_COLORS[label]}]/15 text-[${RISK_COLORS[label]}]`
                          : label === riskLevel
                            ? 'bg-warning/15 text-warning'
                            : 'bg-white/[0.04] text-muted'
                      } ${label === riskLevel ? 'ring-1 ring-inset ring-white/10' : ''}`}
                        style={label === riskLevel ? { background: `${RISK_COLORS[label]}22`, color: RISK_COLORS[label] } : {}}>
                        {label} {label === riskLevel && result ? '← current' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature importance */}
              <div className="mt-4 rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">Feature importance</p>
                <div className="mt-3 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportance} layout="vertical" margin={{ left: 8, right: 12 }}>
                      <CartesianGrid stroke="#ffffff12" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={128} tick={{ fill: '#9AB2D1', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0E1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#F8FAFC' }} />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                        {featureImportance.map((item, i) => (
                          <Cell key={item.name} fill={i < 2 ? '#36D7FF' : i === 2 ? '#FFB84D' : '#7CFF6B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations list */}
              {result?.recommendations && result.recommendations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">All recommendations</p>
                  {result.recommendations.map((r, i) => (
                    <div key={i} className={`rounded-[14px] border px-4 py-3 text-sm ${
                      r.priority === 'high' ? 'border-danger/20 bg-danger/10 text-danger' :
                      r.priority === 'medium' ? 'border-warning/20 bg-warning/10 text-warning' :
                      'border-white/10 bg-white/[0.04] text-muted'
                    }`}>
                      <p className="font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-xs opacity-80">{r.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* History + quick actions */}
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Prediction history</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskSeries}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0E1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="risk" stroke="#FFB84D" strokeWidth={3} fill="#FFB84D22" />
                <Area type="monotone" dataKey="confidence" stroke="#7CFF6B" strokeWidth={3} fill="#7CFF6B11" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Quick actions</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Reduce humidity by 4%', action: () => set('humidity_pct', Math.max(0, Number(form.humidity_pct) - 4)) },
              { label: 'Lower temperature 1°C', action: () => set('temperature_c', Math.max(0, Number(form.temperature_c) - 1)) },
              { label: 'Switch to MAP sealed', action: () => set('packaging', 'MAP sealed') },
              { label: 'Move to Cold storage', action: () => set('storage_type', 'Cold storage') },
            ].map(item => (
              <button key={item.label} onClick={item.action} className="ripple lift-card rounded-[24px] border border-white/10 bg-[#0b1a31]/80 p-5 text-left text-sm font-semibold text-text hover:border-accent/20">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
