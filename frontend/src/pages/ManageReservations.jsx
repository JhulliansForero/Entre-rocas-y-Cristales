import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getReservations } from '../services/reservations'
import { getCabins } from '../services/cabins'
import { fmtCOP, fmtDate } from '../utils/format'
import StatusPill from '../components/StatusPill'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'
import Footer from '../components/Footer'

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--color-faint)', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 10 }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 28 }}>{value}</div>
    </div>
  )
}

export default function ManageReservations() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [cabins,       setCabins]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [cabinFilter,  setCabinFilter]  = useState('')
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    const p = { page }
    if (statusFilter) p.status = statusFilter
    if (cabinFilter)  p.cabin  = cabinFilter
    if (search)       p.search = search
    getReservations(p)
      .then(r => {
        const data = r.data
        if (data.results) {
          setReservations(data.results)
          setTotalPages(Math.ceil(data.count / 20))
        } else {
          setReservations(data)
          setTotalPages(1)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, statusFilter, cabinFilter, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    getCabins({ page_size: 100 }).then(r => setCabins(r.data.results ?? r.data)).catch(() => {})
  }, [])

  const active    = reservations.filter(r => r.status === 'active').length
  const cancelled = reservations.filter(r => r.status === 'cancelled').length
  const revenue   = reservations.filter(r => r.status === 'active').reduce((s, r) => s + Number(r.total_price), 0)

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 56 }} className="rg-px">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <SectionEyebrow>Panel administrador</SectionEyebrow>
            <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 52px)', margin: '12px 0 0' }}>
              Gestión de <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>reservas</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={load}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              ↻ Actualizar
            </button>
            <button
              onClick={() => navigate('/admin/reservas/nueva')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              + Nueva reserva
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="rg-stats4">
          <StatCard label="Total en página" value={reservations.length} />
          <StatCard label="Activas"         value={active} />
          <StatCard label="Canceladas"      value={cancelled} />
          <StatCard label="Ingresos activas" value={fmtCOP(revenue)} />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              className="input"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por código o nombre…"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <select className="field-select" style={{ width: 'auto' }} value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
          </select>
          <select className="field-select" style={{ width: 'auto' }} value={cabinFilter}
            onChange={e => { setCabinFilter(e.target.value); setPage(1) }}>
            <option value="">Todas las cabañas</option>
            {cabins.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>No hay reservas que coincidan.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-bone)' }}>
                      {['Código', 'Huésped', 'Cabaña', 'Check-in', 'Check-out', 'Total', 'Estado', ''].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', textAlign: 'left',
                          fontSize: 10, fontWeight: 700, color: 'var(--color-faint)',
                          textTransform: 'uppercase', letterSpacing: '.1em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r, i) => (
                      <tr key={r.id} style={{
                        borderBottom: i < reservations.length - 1 ? '1px solid var(--color-bone)' : 'none',
                      }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-forest)', whiteSpace: 'nowrap' }}>
                          {r.reservation_id}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>
                          {r.guest_name ?? r.guest}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>
                          {r.cabin_name ?? r.cabin}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {fmtDate(r.check_in)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {fmtDate(r.check_out)}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>
                          {fmtCOP(r.total_price)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusPill status={r.status} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {r.status === 'active' && (
                            <Link
                              to={`/reservas/${r.id}/editar`}
                              className="btn btn-ghost btn-sm"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              Editar →
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, marginBottom: 40 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost btn-sm"
                  style={{ opacity: page === 1 ? .4 : 1 }}
                >
                  ← Anterior
                </button>
                <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-ghost btn-sm"
                  style={{ opacity: page === totalPages ? .4 : 1 }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
