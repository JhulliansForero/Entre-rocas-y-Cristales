import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReservation, updateReservation } from '../services/reservations'
import { getCabin, getAvailability } from '../services/cabins'
import { fmtCOP, fmtDate, nightsBetween, calcTotal } from '../utils/format'
import Calendar from '../components/Calendar'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'

export default function UpdateReservation() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [res,        setRes]    = useState(null)
  const [cabin,      setCabin]  = useState(null)
  const [blocked,    setBlocked]= useState([])
  const [loading,    setLoading]= useState(true)
  const [submitting, setSub]    = useState(false)
  const [error,      setError]  = useState('')

  const [dates,  setDates]  = useState({ start: null, end: null })
  const [guests, setGuests] = useState(1)
  const [notes,  setNotes]  = useState('')

  useEffect(() => {
    getReservation(id)
      .then(async r => {
        const reservation = r.data
        setRes(reservation)
        setDates({
          start: reservation.check_in  ? new Date(reservation.check_in  + 'T00:00:00') : null,
          end:   reservation.check_out ? new Date(reservation.check_out + 'T00:00:00') : null,
        })
        setGuests(reservation.guests_count)
        setNotes(reservation.notes ?? '')

        const [cr, ar] = await Promise.all([
          getCabin(reservation.cabin),
          getAvailability(reservation.cabin),
        ])
        setCabin(cr.data)
        setBlocked(ar.data.blocked_dates?.filter(d => {
          const dt = new Date(d + 'T00:00:00')
          return !(dt >= new Date(reservation.check_in + 'T00:00:00') && dt < new Date(reservation.check_out + 'T00:00:00'))
        }) ?? [])
      })
      .catch(() => navigate('/perfil'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!res || !cabin) return null
  if (res.status !== 'active') { navigate('/perfil'); return null }

  const checkIn  = dates.start ? dates.start.toISOString().slice(0, 10) : null
  const checkOut = dates.end   ? dates.end.toISOString().slice(0, 10)   : null
  const nights   = nightsBetween(checkIn, checkOut)
  const totals   = nights > 0 ? calcTotal(Number(cabin.price_per_night), nights) : null

  async function handleUpdate(e) {
    e.preventDefault()
    setSub(true); setError('')
    try {
      await updateReservation(id, { check_in: checkIn, check_out: checkOut, guests_count: guests, notes })
      navigate('/perfil')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat()[0] : 'No se pudo actualizar la reserva')
      setSub(false)
    }
  }

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 32px 80px' }}>

        <SectionEyebrow>Reserva · {res.reservation_id}</SectionEyebrow>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 4vw, 48px)', margin: '12px 0 4px' }}>
          Modificar <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>reserva</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 36px' }}>
          {cabin.name} · Código: <strong style={{ color: 'var(--color-forest)' }}>{res.reservation_id}</strong>
        </p>

        {error && (
          <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(184,57,43,.08)', border: '1px solid rgba(184,57,43,.2)', borderRadius: 12, fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* ── Left: form ── */}
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Calendar */}
            <div className="card" style={{ padding: 24 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 14 }}>Nuevas fechas</label>
              <Calendar value={dates} onChange={setDates} occupied={blocked} />
              {checkIn && checkOut && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                  {fmtDate(checkIn)} → {fmtDate(checkOut)} · <strong style={{ color: 'var(--color-ink)' }}>{nights} noches</strong>
                </p>
              )}
            </div>

            {/* Guests */}
            <div className="card" style={{ padding: 24 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 10 }}>Huéspedes</label>
              <select className="field-select" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                {Array.from({ length: cabin.capacity }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: 24 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 10 }}>Notas</label>
              <textarea
                className="field-textarea"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Peticiones especiales…"
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => navigate('/perfil')} className="btn btn-ghost" style={{ flex: 1, padding: '14px 0' }}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !checkIn || !checkOut}
                className="btn btn-primary"
                style={{ flex: 2, padding: '14px 0' }}
              >
                {submitting ? 'Guardando…' : 'Guardar cambios →'}
              </button>
            </div>
          </form>

          {/* ── Right: summary ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 className="font-display" style={{ fontSize: 20, marginBottom: 20 }}>Nuevo resumen</h3>

              <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 16, color: 'var(--color-muted)' }}>
                <strong style={{ color: 'var(--color-ink)', display: 'block', marginBottom: 2 }}>Fechas actuales</strong>
                {fmtDate(res.check_in)} → {fmtDate(res.check_out)}
              </div>

              {totals ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>{fmtCOP(cabin.price_per_night)} × {nights} noche{nights !== 1 ? 's' : ''}</span>
                    <span>{fmtCOP(totals.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>Limpieza</span><span>{fmtCOP(totals.cleaning)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>Impuestos (8%)</span><span>{fmtCOP(totals.taxes)}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontWeight: 700,
                    color: 'var(--color-ink)', fontSize: 16,
                    borderTop: '1px solid var(--color-bone)', paddingTop: 12, marginTop: 2,
                  }}>
                    <span>Nuevo total</span><span>{fmtCOP(totals.total)}</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-faint)', fontFamily: 'var(--font-body)' }}>
                  Selecciona nuevas fechas para ver el resumen
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
