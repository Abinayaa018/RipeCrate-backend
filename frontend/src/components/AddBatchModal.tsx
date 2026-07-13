import { useState } from 'react'
import { api } from '../services/api'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function AddBatchModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    produce_name: 'Tomatoes',
    quantity_kg: 100,
    harvest_date: todayStr(),
    warehouse_location: 'North Hub',
    temperature_c: 4.5,
    humidity_pct: 88,
    packaging: 'Ventilated crate',
    storage_type: 'Cold storage',
    transportation_time_hrs: 6,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(k: string, v: string | number) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.addBatch({
        ...form,
        quantity_kg: Number(form.quantity_kg),
        temperature_c: Number(form.temperature_c),
        humidity_pct: Number(form.humidity_pct),
        transportation_time_hrs: Number(form.transportation_time_hrs),
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
        onClose()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add batch. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[#06101f]/98 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Inventory</p>
            <h2 className="font-display mt-1 text-xl font-bold text-text">Add New Batch</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/[0.06] hover:text-text">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {error && <div className="mt-4 rounded-[14px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
        {success && <div className="mt-4 rounded-[14px] border border-accent2/20 bg-accent2/10 px-4 py-3 text-sm text-accent2">✓ Batch added successfully!</div>}

        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Produce', key: 'produce_name', type: 'select', options: ['Tomatoes', 'Berries', 'Leafy greens', 'Avocados', 'Dairy', 'Strawberries', 'Mangoes'] },
            { label: 'Warehouse', key: 'warehouse_location', type: 'select', options: ['North Hub', 'South Vault', 'East Cold', 'Port Gate', 'EU Relay'] },
            { label: 'Packaging', key: 'packaging', type: 'select', options: ['Ventilated crate', 'MAP sealed', 'Wax carton', 'Reusable tote', 'None'] },
            { label: 'Storage type', key: 'storage_type', type: 'select', options: ['Cold storage', 'Reefer truck', 'Retail dock', 'Ripening room', 'Ambient'] },
            { label: 'Harvest date', key: 'harvest_date', type: 'date' },
            { label: 'Quantity (kg)', key: 'quantity_kg', type: 'number', step: '1' },
            { label: 'Temperature (°C)', key: 'temperature_c', type: 'number', step: '0.1' },
            { label: 'Humidity (%)', key: 'humidity_pct', type: 'number', step: '1' },
            { label: 'Transport time (h)', key: 'transportation_time_hrs', type: 'number', step: '0.5' },
          ].map(f => (
            <label key={f.key} className="rounded-[18px] border border-white/10 bg-[#071224]/72 p-3">
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted">{f.label}</span>
              {f.type === 'select' ? (
                <select value={String(form[f.key as keyof typeof form])} onChange={e => set(f.key, e.target.value)} className="mt-2 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                  {f.options?.map(o => <option key={o} className="bg-[#071224]">{o}</option>)}
                </select>
              ) : (
                <input type={f.type} step={f.step} value={String(form[f.key as keyof typeof form])} onChange={e => set(f.key, e.target.value)} className="mt-2 w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
              )}
            </label>
          ))}

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-[18px] border border-white/10 py-3 text-sm font-semibold text-muted hover:text-text">
              Cancel
            </button>
            <button type="submit" disabled={loading || success} className="flex-1 rounded-[18px] bg-accent py-3 text-sm font-bold text-background disabled:opacity-60">
              {loading ? 'Adding…' : 'Add Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
