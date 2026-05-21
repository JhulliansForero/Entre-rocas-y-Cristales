import { useState, useEffect, useCallback } from 'react'
import { getAnalytics } from '../services/reservations'

// ── Formatters ─────────────────────────────────────────────────────────────
function fmtCOP(v) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(v || 0)
}

/** Versión compacta para el eje Y: $1.2M, $800k, $0 */
function fmtShort(v) {
  if (v === 0) return '$0'
  if (v >= 1_000_000) {
    const m = v / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`
  return `$${Math.round(v)}`
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, barColor, formatAxis }) {
  const [hov, setHov] = useState(null)

  const W = 700, H = 240
  const P = { l: 72, r: 16, t: 32, b: 44 }
  const pW = W - P.l - P.r
  const pH = H - P.t - P.b

  const vals = data.map(d => Number(d[valueKey]) || 0)
  const rawMax = Math.max(...vals, 1)

  // Nice-round y-axis max
  const TICKS = 4
  const rawStep = rawMax / TICKS
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(rawStep, 1))))
  const niceStep = Math.max(Math.ceil(rawStep / magnitude) * magnitude, 1)
  const niceMax = niceStep * TICKS

  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => niceStep * i)

  const barStep = pW / Math.max(data.length, 1)
  const barW = Math.min(barStep * 0.6, 52)

  const yOf = v => P.t + pH - (Math.min(v, niceMax) / niceMax) * pH

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
    >
      {/* Grid + Y-axis labels */}
      {ticks.map((tick, i) => {
        const y = yOf(tick)
        return (
          <g key={i}>
            <line
              x1={P.l} y1={y} x2={W - P.r} y2={y}
              stroke={i === 0 ? '#c8c2ad' : '#e6e0d2'}
              strokeWidth={1}
              strokeDasharray={i === 0 ? 'none' : '4 5'}
            />
            <text
              x={P.l - 7} y={y + 4}
              textAnchor="end" fontSize={10} fill="#9a8f7a"
              fontFamily="system-ui,sans-serif"
            >
              {formatAxis ? formatAxis(tick) : tick}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0
        const bH  = val > 0 ? Math.max((val / niceMax) * pH, 3) : 2
        const x   = P.l + barStep * i + (barStep - barW) / 2
        const y   = yOf(val)
        const isHov = hov === i
        const tipLabel = formatAxis ? formatAxis(val) : String(val)
        const tipW = Math.max(tipLabel.length * 8 + 16, 52)
        const tx = Math.min(Math.max(x + barW / 2, P.l + tipW / 2), W - P.r - tipW / 2)

        return (
          <g
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: 'default' }}
          >
            {/* Hover column highlight */}
            <rect
              x={x - 4} y={P.t} width={barW + 8} height={pH}
              rx={6} fill={isHov ? 'rgba(74,102,80,0.05)' : 'transparent'}
            />
            {/* Bar */}
            <rect
              x={x} y={val > 0 ? y : P.t + pH - 2}
              width={barW} height={val > 0 ? bH : 2}
              rx={4}
              fill={val > 0 ? barColor : '#ddd8cc'}
              opacity={val > 0 ? (isHov ? 1 : 0.82) : 0.5}
              style={{ transition: 'opacity 0.15s' }}
            />
            {/* Tooltip bubble */}
            {isHov && val > 0 && (
              <g>
                <rect
                  x={tx - tipW / 2} y={y - 28}
                  width={tipW} height={22}
                  rx={6} fill={barColor}
                />
                <text
                  x={tx} y={y - 13}
                  textAnchor="middle"
                  fontSize={10} fontWeight={700} fill="white"
                  fontFamily="system-ui,sans-serif"
                >
                  {tipLabel}
                </text>
                {/* Arrow */}
                <polygon
                  points={`${tx - 5},${y - 6} ${tx + 5},${y - 6} ${tx},${y - 1}`}
                  fill={barColor}
                />
              </g>
            )}
            {/* X-axis label */}
            <text
              x={x + barW / 2} y={H - P.b + 15}
              textAnchor="middle"
              fontSize={data.length > 8 ? 9 : 11}
              fill={isHov ? '#5a5040' : '#9a8f7a'}
              fontWeight={isHov ? 600 : 400}
              fontFamily="system-ui,sans-serif"
            >
              {d[labelKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Cabin horizontal bar ───────────────────────────────────────────────────
function CabinBar({ cabin, value, max, metric }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 11, height: 11, borderRadius: '50%',
            background: cabin.accent_color, flexShrink: 0, display: 'inline-block',
            boxShadow: `0 0 0 3px ${cabin.accent_color}22`,
          }} />
          <span style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
          }}>
            {cabin.name}
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          {metric === 'bookings'
            ? `${value} ${value === 1 ? 'reserva' : 'reservas'}`
            : fmtCOP(value)}
        </span>
      </div>
      <div style={{
        height: 10, background: 'var(--color-faint)',
        borderRadius: 5, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(pct, pct > 0 ? 1 : 0)}%`,
          background: cabin.accent_color,
          borderRadius: 5,
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

// ── KPI Stat card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, bg }) {
  return (
    <div style={{
      background: bg || 'var(--color-snow)',
      border: '1px solid var(--color-bone)',
      borderRadius: 18,
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
        color: accent || 'var(--color-ink)', lineHeight: 1.1,
        fontFamily: 'var(--font-body)',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Toggle pill button ─────────────────────────────────────────────────────
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-body)',
        background: active ? 'var(--color-forest)' : 'transparent',
        color: active ? 'white' : 'var(--color-bark)',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function PillGroup({ children }) {
  return (
    <div style={{
      display: 'inline-flex', gap: 2,
      background: 'var(--color-faint)',
      borderRadius: 10, padding: 3,
    }}>
      {children}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyChart({ msg = 'Sin datos para este período' }) {
  return (
    <div style={{
      height: 160, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'var(--color-muted)', gap: 10,
    }}>
      <span style={{ fontSize: 34, opacity: 0.5 }}>📊</span>
      <span style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}>{msg}</span>
    </div>
  )
}

// ── Section card wrapper ───────────────────────────────────────────────────
function Section({ children, style }) {
  return (
    <div style={{
      background: 'var(--color-snow)',
      border: '1px solid var(--color-bone)',
      borderRadius: 20, padding: '26px 28px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, controls }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12, marginBottom: 24,
    }}>
      <h2 style={{
        margin: 0, fontSize: 16, fontWeight: 700,
        fontFamily: 'var(--font-body)', color: 'var(--color-ink)',
      }}>
        {title}
      </h2>
      {controls && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{controls}</div>}
    </div>
  )
}

// ── Main analytics page ────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [period,  setPeriod]  = useState('monthly')   // 'monthly' | 'annual'
  const [metric,  setMetric]  = useState('revenue')   // 'revenue' | 'bookings'
  const [cabinM,  setCabinM]  = useState('bookings')  // 'bookings' | 'revenue'
  const [year,    setYear]    = useState(new Date().getFullYear())

  const load = useCallback((yr) => {
    setLoading(true)
    setError(null)
    getAnalytics(yr)
      .then(r => setData(r.data))
      .catch(() => setError('No se pudo cargar el análisis. Verifica tu conexión.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(year) }, [year, load])

  // Chart data & helpers
  const chartData    = data ? (period === 'monthly' ? data.monthly : data.annual) : []
  const chartHasData = chartData.some(d => Number(d[metric]) > 0)
  const cabinMax     = data?.by_cabin?.length
    ? Math.max(...data.by_cabin.map(c => c[cabinM]))
    : 0

  const availYears = data?.years_available?.length > 0
    ? data.years_available
    : [new Date().getFullYear()]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 60px' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700,
          color: 'var(--color-ink)', margin: 0, marginBottom: 6,
        }}>
          Análisis de ventas
        </h1>
        <p style={{
          fontSize: 14, color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)', margin: 0,
        }}>
          Datos en tiempo real de todas las reservas confirmadas
        </p>
      </div>

      {/* ── Loading inicial ─────────────────────────────────────────────── */}
      {loading && !data && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          color: 'var(--color-muted)', fontFamily: 'var(--font-body)', fontSize: 14,
        }}>
          Cargando análisis…
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {data && (<>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          <StatCard
            icon="💰"
            label="Ingresos totales"
            value={fmtCOP(data.summary.total_revenue)}
            accent="var(--color-forest)"
          />
          <StatCard
            icon="📋"
            label="Reservas confirmadas"
            value={data.summary.total_bookings}
            sub={`${data.summary.active_bookings} activas · ${data.summary.completed_bookings} completadas`}
          />
          <StatCard
            icon="🎯"
            label="Ticket promedio"
            value={fmtCOP(data.summary.avg_booking_value)}
          />
          <StatCard
            icon="✕"
            label="Cancelaciones"
            value={data.summary.cancelled_bookings}
            accent={data.summary.cancelled_bookings > 0 ? 'var(--color-danger)' : 'var(--color-muted)'}
          />
        </div>

        {/* ── Gráfico de ingresos / reservas ────────────────────────────── */}
        <Section style={{ marginBottom: 24 }}>
          <SectionHeader
            title={
              metric === 'revenue'
                ? `Ingresos · ${period === 'monthly' ? `${year}` : 'Histórico anual'}`
                : `Reservas · ${period === 'monthly' ? `${year}` : 'Histórico anual'}`
            }
            controls={<>
              {/* Métrica */}
              <PillGroup>
                <Pill active={metric === 'revenue'}  onClick={() => setMetric('revenue')}>Ingresos</Pill>
                <Pill active={metric === 'bookings'} onClick={() => setMetric('bookings')}>Reservas</Pill>
              </PillGroup>

              {/* Período */}
              <PillGroup>
                <Pill active={period === 'monthly'} onClick={() => setPeriod('monthly')}>Mensual</Pill>
                <Pill active={period === 'annual'}  onClick={() => setPeriod('annual')}>Anual</Pill>
              </PillGroup>

              {/* Selector de año (solo mensual) */}
              {period === 'monthly' && (
                <select
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  style={{
                    padding: '6px 10px', borderRadius: 8,
                    border: '1px solid var(--color-bone)',
                    background: 'white',
                    fontSize: 13, fontFamily: 'var(--font-body)',
                    color: 'var(--color-ink)', cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {availYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
            </>}
          />

          {chartHasData ? (
            <BarChart
              data={chartData}
              valueKey={metric}
              labelKey="label"
              barColor={metric === 'revenue' ? '#4a6650' : '#5e7c34'}
              formatAxis={metric === 'revenue' ? fmtShort : v => String(Math.round(v))}
            />
          ) : (
            <EmptyChart
              msg={
                data.summary.total_bookings === 0
                  ? 'Aún no hay reservas registradas'
                  : 'Sin datos para este período'
              }
            />
          )}

          {loading && (
            <div style={{
              textAlign: 'center', fontSize: 12,
              color: 'var(--color-muted)', marginTop: 10,
              fontFamily: 'var(--font-body)',
            }}>
              Actualizando…
            </div>
          )}
        </Section>

        {/* ── Cabañas ───────────────────────────────────────────────────── */}
        <Section>
          <SectionHeader
            title={`Cabañas · ${cabinM === 'bookings' ? 'Por cantidad de reservas' : 'Por ingresos generados'}`}
            controls={
              <PillGroup>
                <Pill active={cabinM === 'bookings'} onClick={() => setCabinM('bookings')}>Reservas</Pill>
                <Pill active={cabinM === 'revenue'}  onClick={() => setCabinM('revenue')}>Ingresos</Pill>
              </PillGroup>
            }
          />

          {data.by_cabin.length > 0 ? (
            <>
              {data.by_cabin.map(cabin => (
                <CabinBar
                  key={cabin.id}
                  cabin={cabin}
                  value={cabin[cabinM]}
                  max={cabinMax}
                  metric={cabinM}
                />
              ))}

              {/* Tabla resumen */}
              <div style={{
                marginTop: 28, borderTop: '1px solid var(--color-bone)', paddingTop: 20,
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr repeat(3, auto)',
                  gap: '10px 24px',
                  fontSize: 12,
                }}>
                  {/* Header */}
                  {['Cabaña', 'Reservas', 'Ingresos', 'Ticket prom.'].map(h => (
                    <span key={h} style={{
                      fontWeight: 700, color: 'var(--color-muted)',
                      fontFamily: 'var(--font-body)', textTransform: 'uppercase',
                      letterSpacing: '0.06em', fontSize: 10,
                    }}>
                      {h}
                    </span>
                  ))}
                  {/* Rows */}
                  {data.by_cabin.map(cabin => (<>
                    <span key={`n-${cabin.id}`} style={{
                      fontFamily: 'var(--font-body)', color: 'var(--color-ink)',
                      fontWeight: 500, fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: cabin.accent_color, display: 'inline-block', flexShrink: 0,
                      }} />
                      {cabin.name}
                    </span>
                    <span key={`b-${cabin.id}`} style={{
                      fontFamily: 'var(--font-body)', color: 'var(--color-ink)', fontSize: 13,
                      textAlign: 'right',
                    }}>
                      {cabin.bookings}
                    </span>
                    <span key={`r-${cabin.id}`} style={{
                      fontFamily: 'var(--font-body)', color: 'var(--color-ink)', fontSize: 13,
                      textAlign: 'right',
                    }}>
                      {fmtCOP(cabin.revenue)}
                    </span>
                    <span key={`a-${cabin.id}`} style={{
                      fontFamily: 'var(--font-body)', color: 'var(--color-muted)', fontSize: 13,
                      textAlign: 'right',
                    }}>
                      {cabin.bookings > 0 ? fmtCOP(cabin.revenue / cabin.bookings) : '—'}
                    </span>
                  </>))}
                </div>
              </div>
            </>
          ) : (
            <EmptyChart msg="Aún no hay reservas para mostrar" />
          )}
        </Section>

      </>)}
    </div>
  )
}
