import type { ReactNode } from 'react'

type Tone = 'accent' | 'accent2' | 'warning' | 'danger' | 'muted'

const toneClass: Record<Tone, string> = {
  accent: 'text-accent',
  accent2: 'text-accent2',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted',
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.44em] text-accent">{eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-normal text-text sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, caption, tone = 'accent' }: { label: string; value: string; caption: string; tone?: Tone }) {
  return (
    <div className="lift-card panel rounded-[30px] p-6">
      <p className="text-xs uppercase tracking-[0.34em] text-muted">{label}</p>
      <p className={`font-display mt-4 text-4xl font-bold ${toneClass[tone]}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{caption}</p>
    </div>
  )
}

export function ChartCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel rounded-[34px] p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">{title}</p>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function StatusChip({ label }: { label: string }) {
  const cls = label === 'Critical' || label === 'Offline'
    ? 'border-danger/20 bg-danger/15 text-danger'
    : label === 'Warning' || label === 'At risk' || label === 'Scheduled'
      ? 'border-warning/20 bg-warning/15 text-warning'
      : label === 'Healthy' || label === 'Ready' || label === 'Online'
        ? 'border-accent2/20 bg-accent2/15 text-accent2'
        : 'border-accent/20 bg-accent/15 text-accent'

  return <span className={`rounded-full border px-3 py-2 text-xs font-semibold ${cls}`}>{label}</span>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <p className="font-display text-xl font-bold text-text">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

export function SkeletonLoader() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-5 rounded-full" />
      <div className="skeleton h-5 w-4/5 rounded-full" />
      <div className="skeleton h-5 w-2/3 rounded-full" />
    </div>
  )
}

export function SearchBar({ placeholder = 'Search', value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3">
      <span className="text-accent">⌕</span>
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full border-none bg-transparent text-sm text-text outline-none placeholder:text-muted"
      />
    </label>
  )
}
