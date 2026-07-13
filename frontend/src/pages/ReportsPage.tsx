import { useEffect, useState } from 'react'
import { api, type BatchItem } from '../services/api'
import { reports } from '../data/dashboard'
import { EmptyState, PageHeader, SearchBar, StatusChip } from '../components/ui'

export default function ReportsPage() {
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [batches, setBatches] = useState<BatchItem[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)

  useEffect(() => {
    api.batches().then(setBatches).catch(() => {})
  }, [])

  async function downloadPdf() {
    setPdfLoading(true)
    try {
      api.downloadPdf()
    } finally {
      setTimeout(() => setPdfLoading(false), 2000)
    }
  }

  async function downloadCsv() {
    setCsvLoading(true)
    try {
      const data = batches.length > 0 ? batches : await api.batches().catch(() => [])
      api.downloadCsv(data)
    } finally {
      setTimeout(() => setCsvLoading(false), 1000)
    }
  }

  const filteredReports = reports.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Reports"
          title="Automated report generation"
          description="Generate PDF and CSV reports with historical analysis, date filtering, sustainability metrics, and executive-ready summaries."
          actions={
            <div className="flex flex-wrap gap-3">
              <button onClick={downloadCsv} disabled={csvLoading} className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text disabled:opacity-60">
                {csvLoading ? 'Exporting…' : 'Download CSV'}
              </button>
              <button onClick={downloadPdf} disabled={pdfLoading} className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background disabled:opacity-60">
                {pdfLoading ? 'Generating…' : 'Generate PDF'}
              </button>
            </div>
          }
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <SearchBar placeholder="Search reports" value={search} onChange={setSearch} />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label="Start date" className="rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3 text-sm text-text outline-none" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End date" className="rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3 text-sm text-text outline-none" />
        </div>
      </section>

      <section className="panel rounded-[34px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="text-left text-[10px] uppercase tracking-[0.32em] text-muted">
              <tr>{['Report', 'Type', 'Range', 'Owner', 'Status', 'Actions'].map(col => <th key={col} className="px-4 py-4">{col}</th>)}</tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.name} className="border-t border-white/10">
                  <td className="px-4 py-5 font-semibold text-text">{report.name}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.type}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.range}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.owner}</td>
                  <td className="px-4 py-5"><StatusChip label={report.status} /></td>
                  <td className="px-4 py-5">
                    <button
                      onClick={report.type === 'PDF' ? downloadPdf : downloadCsv}
                      className="ripple rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-text hover:border-accent/30"
                    >
                      {report.type === 'PDF' ? 'Download PDF' : 'Download CSV'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {batches.length > 0 && (
        <section className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Live inventory snapshot — {batches.length} batches</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total batches', value: batches.length },
              { label: 'Total weight', value: `${batches.reduce((s, b) => s + b.quantity_kg, 0).toFixed(0)}kg` },
              { label: 'Critical', value: batches.filter(b => b.status === 'critical').length },
              { label: 'Avg spoilage', value: `${(batches.reduce((s, b) => s + (b.spoilage_probability ?? 0), 0) / batches.length * 100).toFixed(1)}%` },
            ].map(m => (
              <div key={m.label} className="rounded-[20px] border border-white/10 bg-[#0b1a31]/60 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted">{m.label}</p>
                <p className="font-display mt-2 text-2xl font-bold text-accent">{m.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <EmptyState title="Historical archive connected" description="Use date filters to retrieve generated reports from SQLite in development or PostgreSQL in production." />
    </div>
  )
}
