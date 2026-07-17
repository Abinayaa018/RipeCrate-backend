const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// ── Token storage ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'rc_token'

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

async function req<T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  const token = auth.getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, detail?.detail ?? res.statusText)
  }
  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { full_name: string; email: string; password: string; role?: string; organization?: string }
export interface TokenResponse { access_token: string; user: UserOut }
export interface UserOut { id: string; full_name: string; email: string; role: string; organization?: string }

export interface PredictionRequest {
  produce_name: string
  harvest_date: string        // ISO date string
  temperature_c: number
  humidity_pct: number
  packaging: string
  transportation_time_hrs: number
  storage_type: string
  warehouse_location: string
  quantity_kg: number
}
export interface RecommendationItem { title: string; reason: string; priority: string }
export interface PredictionResponse {
  predicted_shelf_life_days: number
  spoilage_probability: number
  confidence_score: number
  risk_level: string
  estimated_expiry_date: string
  recommendations: RecommendationItem[]
}

export interface BatchItem {
  id: string
  batch_code: string
  produce_name: string
  quantity_kg: number
  warehouse_location: string
  status: string
  temperature_c?: number
  humidity_pct?: number
  spoilage_probability?: number
  predicted_expiry_date?: string
}

export interface AlertItem {
  id: string
  type: string
  severity: string
  message: string
  is_read: boolean
  resolved: boolean
  created_at: string
  batch_id?: string
}

export interface DashboardData {
  total_batches: number
  healthy_batches: number
  critical_batches: number
  expiring_soon: number
  total_weight_kg: number
  avg_spoilage_probability: number
  recent_alerts: AlertItem[]
}

export interface AnalyticsData {
  total_batches: number
  total_weight_kg: number
  avg_spoilage_probability: number
  financial_loss_prevented_usd: number
  carbon_emission_savings_kg: number
  most_wasted_produce: { produce: string; wasted_kg: number }[]
  warehouse_comparison: { warehouse: string; total_weight_kg: number; avg_spoilage_probability: number; batch_count: number }[]
}

export interface AddBatchPayload {
  produce_name: string
  quantity_kg: number
  harvest_date: string
  warehouse_location: string
  temperature_c: number
  humidity_pct: number
  packaging: string
  storage_type: string
  transportation_time_hrs: number
}

// ── API surface ───────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: (p: LoginPayload) =>
    req<TokenResponse>('/api/auth/login', 'POST', p).then(r => { auth.setToken(r.access_token); return r }),
  register: (p: RegisterPayload) =>
    req<TokenResponse>('/api/auth/register', 'POST', p).then(r => { auth.setToken(r.access_token); return r }),
  logout: () => auth.clearToken(),
  me: () => req<UserOut>('/api/auth/me'),

  // Dashboard
  dashboard: () => req<DashboardData>('/api/dashboard/summary'),

  // Inventory / Batches
  batches: () => req<BatchItem[]>('/api/inventory').then((r: any) => r.items ?? r),
  addBatch: (p: AddBatchPayload) => req<BatchItem>('/api/inventory', 'POST', p),
  deleteBatch: (id: string) => req<void>(`/api/inventory/${id}`, 'DELETE'),

  // Predictions
  predict: (p: PredictionRequest) => req<PredictionResponse>('/api/predictions', 'POST', p),

  // Alerts
  alerts: (unreadOnly = false) => req<AlertItem[]>(`/api/alerts${unreadOnly ? '?unread_only=true' : ''}`),
  resolveAlert: (id: string) => req<{ id: string; resolved: boolean }>(`/api/alerts/${id}/resolve`, 'POST'),
  resolveAllAlerts: () => req<{ resolved: number }>('/api/alerts/resolve-all', 'POST'),
  evaluateAlerts: () => req<{ created: number }>('/api/alerts/evaluate', 'POST'),
  markAlertRead: (id: string) => req<AlertItem>(`/api/alerts/${id}/read`, 'PATCH'),

  // Analytics
  analytics: () => req<AnalyticsData>('/api/analytics/overview'),

  // Reports
  downloadPdf: () => {
    const token = auth.getToken()
    const url = `${BASE}/api/reports/summary-pdf`
    const a = document.createElement('a')
    a.href = url
    a.download = 'ripecrate_report.pdf'
    // Fetch with auth then trigger download
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        a.href = blobUrl
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
  },
  downloadCsv: (batches: BatchItem[]) => {
    const header = 'id,batch_code,produce_name,quantity_kg,warehouse_location,status,temperature_c,humidity_pct,spoilage_probability,predicted_expiry_date'
    const rows = batches.map(b =>
      [b.id, b.batch_code, b.produce_name, b.quantity_kg, b.warehouse_location, b.status,
       b.temperature_c ?? '', b.humidity_pct ?? '', b.spoilage_probability ?? '', b.predicted_expiry_date ?? ''].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ripecrate_inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  },

  // AI Assistant
  ask: (question: string) => req<{ question: string; answer: string }>('/api/assistant/ask', 'POST', { question }),

  // Health
  health: () => req<{ status: string; service: string }>('/api/health'),
}
