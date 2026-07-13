import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ full_name: '', email: '', password: '', role: 'admin', organization: '' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.login(loginForm)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.register(regForm)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none placeholder:text-muted focus:border-accent/40'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="cold-grid fixed inset-0" />
      <div className="noise fixed inset-0" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[20px] border border-accent/30 bg-accent/10 shadow-[0_0_32px_rgba(54,215,255,0.25)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#36D7FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-text">RipeCrate</h1>
          <p className="mt-1 text-sm text-muted">AI-powered cold chain intelligence</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-[22px] border border-white/10 bg-[#071224]/74 p-1">
          <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 rounded-[18px] py-2.5 text-sm font-semibold transition ${tab === 'login' ? 'bg-accent text-background' : 'text-muted hover:text-text'}`}>
            Sign In
          </button>
          <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 rounded-[18px] py-2.5 text-sm font-semibold transition ${tab === 'register' ? 'bg-accent text-background' : 'text-muted hover:text-text'}`}>
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-[18px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {/* Login */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="panel rounded-[34px] p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Welcome back</p>
            <input
              required type="email" placeholder="Email"
              value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls}
            />
            <input
              required type="password" placeholder="Password"
              value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              className={inputCls}
            />
            <button type="submit" disabled={loading} className="ripple w-full rounded-[22px] bg-accent py-4 text-sm font-bold text-background disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p className="text-center text-xs text-muted">
              No account?{' '}
              <button type="button" onClick={() => setTab('register')} className="text-accent hover:underline">Register here</button>
            </p>
          </form>
        )}

        {/* Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="panel rounded-[34px] p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Create account</p>
            <input
              required placeholder="Full name"
              value={regForm.full_name} onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputCls}
            />
            <input
              required type="email" placeholder="Work email"
              value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
              className={inputCls}
            />
            <input
              required type="password" placeholder="Password (min 8 chars)" minLength={8}
              value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
              className={inputCls}
            />
            <input
              placeholder="Organization (optional)"
              value={regForm.organization} onChange={e => setRegForm(f => ({ ...f, organization: e.target.value }))}
              className={inputCls}
            />
            <select
              value={regForm.role} onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}
              className={inputCls}
            >
              <option value="admin">Admin</option>
              <option value="manager">Warehouse Manager</option>
              <option value="operator">Operator</option>
            </select>
            <button type="submit" disabled={loading} className="ripple w-full rounded-[22px] bg-accent py-4 text-sm font-bold text-background disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="text-center text-xs text-muted">
              Have an account?{' '}
              <button type="button" onClick={() => setTab('login')} className="text-accent hover:underline">Sign in</button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
