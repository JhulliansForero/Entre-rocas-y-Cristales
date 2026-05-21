import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getCabin } from '../services/cabins'
import { createReservation } from '../services/reservations'
import { fmtCOP, fmtDate, nightsBetween, calcTotal } from '../utils/format'
import CabinBadge from '../components/CabinBadge'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'

export default function CreateReservation() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()

  const cabinSlug = params.get('cabin')
  const checkIn   = params.get('check_in')
  const checkOut  = params.get('check_out')
  const guests    = Number(params.get('guests') ?? 1)

  const [cabin,      setCabin]   = useState(null)
  const [loading,    setLoading] = useState(true)
  const [submitting, setSub]     = useState(false)
  const [error,      setError]   = useState('')
  const [notes,      setNotes]   = useState('')

  useEffect(() => {
    if (!cabinSlug || !checkIn || !checkOut) { navigate('/cabinas'); return }
    getCabin(cabinSlug)
      .then(r => setCabin(r.data))
      .catch(() => navigate('/cabinas'))
      .finally(() => setLoading(false))
  }, [cabinSlug, checkIn, checkOut, navigate])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!cabin) return null

  const nights = nightsBetween(checkIn, checkOut)
  const totals = calcTotal(Number(cabin.price_per_night), nights)

  async function handleConfirm() {
    setSub(true); setError('')
    try {
      const res = await createReservation({
        cabin:        cabinSlug,
        check_in:     checkIn,
        check_out:    checkOut,
        guests_count: guests,
        notes,
      })
      navigate(`/reservas/${res.data.id}/pago`)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat()[0] : 'No se pudo crear la reserva')
      setSub(false)
    }
  }

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <SectionEyebrow>Paso final</SectionEyebrow>
          <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 52px)', margin: '12px 0 0' }}>
            Confirma tu <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>reserva</span>
          </h1>
        </div>

        {error && (
          <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(184,57,43,.08)', border: '1px solid rgba(184,57,43,.2)', borderRadius: 12, fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* ── Left: form ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Cabin summary */}
            <div className="card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center' }}>
              <CabinBadge cabin={cabin} size={100} />
              <div>
                <div className="font-display" style={{ fontSize: 24 }}>{cabin.name}</div>
                <div className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 14, marginTop: 2 }}>{cabin.tagline}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginTop: 6 }}>
                  {cabin.capacity} personas máx.
                </div>
              </div>
            </div>

            {/* Dates + guests */}
            <div className="card" style={{ padding: 24 }}>
              <h3 className="font-display" style={{ fontSize: 18, marginBottom: 16 }}>Detalles de la estancia</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                <div>
                  <div className="field-label">Check-in</div>
                  <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--color-ink)' }}>{fmtDate(checkIn)}</div>
                </div>
                <div>
                  <div className="field-label">Check-out</div>
                  <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--color-ink)' }}>{fmtDate(checkOut)}</div>
                </div>
                <div>
                  <div className="field-label">Noches</div>
                  <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--color-ink)' }}>{nights}</div>
                </div>
                <div>
                  <div className="field-label">Huéspedes</div>
                  <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--color-ink)' }}>{guests}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: 24 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 10 }}>
                Notas adicionales <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--color-faint)' }}>(opcional)</span>
              </label>
              <textarea
                className="field-textarea"
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Alergias, horario de llegada, peticiones especiales…"
              />
            </div>

            {/* Policies */}
            <div style={{ background: 'var(--color-snow)', border: '1px solid var(--color-bone)', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Cancelación gratuita hasta 7 días antes del check-in', 'Check-in: 3:00 PM — Check-out: 11:00 AM', 'No mascotas · No fumar dentro de la cabaña'].map(p => (
                  <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--color-fern)', fontWeight: 700 }}>✓</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: price summary ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 className="font-display" style={{ fontSize: 22, marginBottom: 22 }}>Resumen del pago</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                  <span>{fmtCOP(cabin.price_per_night)} × {nights} noche{nights !== 1 ? 's' : ''}</span>
                  <span>{fmtCOP(totals.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                  <span>Tarifa de limpieza</span>
                  <span>{fmtCOP(totals.cleaning)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                  <span>Impuestos (8%)</span>
                  <span>{fmtCOP(totals.taxes)}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontWeight: 700,
                  color: 'var(--color-ink)', fontSize: 16,
                  borderTop: '1px solid var(--color-bone)', paddingTop: 14, marginTop: 4,
                }}>
                  <span>Total a pagar</span>
                  <span>{fmtCOP(totals.total)}</span>
                </div>
              </div>

              <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(165, 130, 60, .08)', border: '1px solid rgba(165, 130, 60, .2)', borderRadius: 12, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-bark)' }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>Instrucciones de pago</strong>
                El pago se realiza a la llegada o mediante transferencia bancaria. Recibirás los detalles en tu correo.
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 20 }}
              >
                {submitting ? 'Procesando…' : 'Confirmar reserva →'}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: 10 }}
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
