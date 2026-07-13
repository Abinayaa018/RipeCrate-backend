import { useEffect, useRef, useState } from 'react'
import { api, auth } from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  text: string
  ts: string
}

const QUICK = [
  'Which batches expire this week?',
  'Which warehouse has the most wastage?',
  'Show me critical batches',
  'How can I reduce spoilage?',
  'What is the model accuracy?',
  'Total inventory summary',
]

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi! I\'m the RipeCrate AI assistant. Ask me about expiring produce, spoilage risk, warehouse wastage, or inventory status.', ts: now() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim(), ts: now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      if (!auth.isLoggedIn()) {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Please log in to use the AI assistant.', ts: now() }])
        return
      }
      const res = await api.ask(text.trim())
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer, ts: now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t reach the server. Make sure you\'re logged in and the backend is running.', ts: now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-[0_0_24px_rgba(54,215,255,0.45)] transition hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="#071224" strokeWidth="2.5" strokeLinecap="round"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4.97 4.58 2.56 6.2L3 21l4.12-1.3A10.1 10.1 0 0012 20c5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="#071224"/><circle cx="8" cy="11" r="1.2" fill="#36D7FF"/><circle cx="12" cy="11" r="1.2" fill="#36D7FF"/><circle cx="16" cy="11" r="1.2" fill="#36D7FF"/></svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-24px)] flex-col rounded-[28px] border border-white/10 bg-[#06101f]/95 shadow-[0_8px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          style={{ height: 520 }}>
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-[28px] border-b border-white/[0.06] bg-[#0b1a31]/80 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4.97 4.58 2.56 6.2L3 21l4.12-1.3A10.1 10.1 0 0012 20c5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="#36D7FF"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text">RipeCrate AI</p>
              <p className="text-[10px] uppercase tracking-wider text-accent2">● Online</p>
            </div>
            <button onClick={() => setMessages([{ role: 'assistant', text: 'Conversation cleared. How can I help?', ts: now() }])}
              className="rounded-full p-1.5 text-muted hover:bg-white/[0.06]" title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${m.role === 'assistant' ? 'bg-accent/15 text-accent' : 'bg-white/10 text-muted'}`}>
                  {m.role === 'assistant' ? 'AI' : 'U'}
                </div>
                <div className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-sm leading-6 ${m.role === 'assistant' ? 'bg-[#0b1a31] text-text' : 'bg-accent/15 text-accent'}`}>
                  {m.text}
                  <p className="mt-1 text-[10px] text-muted">{m.ts}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">AI</div>
                <div className="rounded-[18px] bg-[#0b1a31] px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="h-2 w-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none">
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-muted hover:border-accent/30 hover:text-accent transition">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 rounded-b-[28px] border-t border-white/[0.06] bg-[#0b1a31]/80 px-4 py-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask about inventory, spoilage, alerts…"
              className="flex-1 border-none bg-transparent text-sm text-text outline-none placeholder:text-muted"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent disabled:opacity-40 transition hover:bg-accent/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#071224" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
