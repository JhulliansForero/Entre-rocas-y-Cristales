import { useState } from 'react'

// Lunes primero, como en el diseño
const DAYS = ['L','M','X','J','V','S','D']

function toYMD(date) { return date.toISOString().slice(0, 10) }

export default function Calendar({ value, onChange, monthOffset = 0, occupied = [] }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [view, setView] = useState(() => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + monthOffset)
    return d
  })

  const monthName = view.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const firstDay  = new Date(view.getFullYear(), view.getMonth(), 1)
  const lastDay   = new Date(view.getFullYear(), view.getMonth() + 1, 0)
  // Monday-first: (0=Sun → 6, 1=Mon → 0, ...)
  const startWeekday = (firstDay.getDay() + 6) % 7

  const days = []
  for (let i = 0; i < startWeekday; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(view.getFullYear(), view.getMonth(), d))

  const isSame = (a, b) => a && b && a.toDateString() === b.toDateString()
  const inRange = (d) => value?.start && value?.end && d > value.start && d < value.end
  const isOcc   = (d) => occupied.some(o => {
    const oc = o instanceof Date ? o : new Date(o + 'T00:00:00')
    return isSame(oc, d)
  })
  const isPast  = (d) => d < today

  function pick(d) {
    if (isPast(d) || isOcc(d)) return
    if (!value?.start || (value.start && value.end)) {
      onChange({ start: d, end: null })
    } else if (d < value.start) {
      onChange({ start: d, end: null })
    } else {
      onChange({ start: value.start, end: d })
    }
  }

  return (
    <div style={{ background: 'var(--color-snow)', border: '1px solid var(--color-bone)', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className="btn btn-icon btn-ghost"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          style={{ fontSize: 18 }}>‹</button>
        <span className="font-display" style={{ fontSize: 18, textTransform: 'capitalize', letterSpacing: '.02em' }}>
          {monthName}
        </span>
        <button className="btn btn-icon btn-ghost"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          style={{ fontSize: 18 }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, fontSize: 11, color: 'var(--color-faint)', marginBottom: 6, textAlign: 'center', fontWeight: 600, letterSpacing: '.08em' }}>
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {days.map((d, i) => {
          if (!d) return <div key={`b${i}`} />
          const selStart = isSame(d, value?.start)
          const selEnd   = isSame(d, value?.end)
          const between  = inRange(d)
          const past = isPast(d)
          const occ  = isOcc(d)

          let bg = 'transparent', color = 'var(--color-ink)'
          if (selStart || selEnd)  { bg = 'var(--color-forest)'; color = 'var(--color-paper)' }
          else if (between)        { bg = 'var(--color-fern)';   color = 'var(--color-forest)' }
          else if (occ)            { bg = 'rgba(184,57,43,.08)'; color = 'var(--color-danger)' }
          else if (past)           { color = 'var(--color-faint)' }

          return (
            <button key={i} disabled={past || occ} onClick={() => pick(d)}
              style={{
                aspectRatio: '1', border: 0, borderRadius: 10,
                background: bg, color,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                cursor: past || occ ? 'not-allowed' : 'pointer',
                textDecoration: occ ? 'line-through' : 'none',
                transition: 'background .12s ease',
              }}
              onMouseEnter={(e) => { if (!past && !occ && !selStart && !selEnd && !between) e.currentTarget.style.background = 'var(--color-paper)' }}
              onMouseLeave={(e) => { if (!past && !occ && !selStart && !selEnd && !between) e.currentTarget.style.background = 'transparent' }}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
