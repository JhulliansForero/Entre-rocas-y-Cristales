import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getReservation } from '../services/reservations'
import { fmtCOP, fmtDate } from '../utils/format'
import Spinner from '../components/Spinner'
import SectionEyebrow from '../components/SectionEyebrow'

export default function Payment() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [res,     setRes]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    getReservation(id)
      .then(r => setRes(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  function copyId() {
    navigator.clipboard.writeText(res.reservation_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!res) return null

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '72px 32px 80px', textAlign: 'center' }}>

        {/* Success check */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(83, 140, 78, .12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            ✓
          </div>
        </div>

        <SectionEyebrow>Confirmación</SectionEyebrow>
        <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 52px)', margin: '12px 0 8px' }}>
          ¡Reserva <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>confirmada</span>!
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginBottom: 36 }}>
          Tu reserva ha sido registrada exitosamente. Guarda tu código de confirmación.
        </p>

        {/* Reservation ID */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14,
          background: 'var(--color-snow)', border: '1px solid var(--color-bone)',
          borderRadius: 16, padding: '16px 24px', marginBottom: 32,
        }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--color-faint)', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 4 }}>
              Código de reserva
            </div>
            <div className="font-display" style={{ fontSize: 28, color: 'var(--color-forest)', letterSpacing: '.05em' }}>
              {res.reservation_id}
            </div>
          </div>
          <button
            onClick={copyId}
            title="Copiar código"
            style={{
              border: 0, background: 'transparent', cursor: 'pointer', padding: 8,
              fontSize: 18, color: copied ? 'var(--color-fern)' : 'var(--color-muted)',
              transition: 'color .15s',
            }}
          >
            {copied ? '✓' : '⧉'}
          </button>
        </div>

        {/* Detail card */}
        <div className="card" style={{ padding: 0, marginBottom: 24, textAlign: 'left' }}>
          {[
            { label: 'Cabaña',      value: res.cabin_name ?? res.cabin },
            { label: 'Check-in',    value: fmtDate(res.check_in) },
            { label: 'Check-out',   value: fmtDate(res.check_out) },
            { label: 'Huéspedes',   value: res.guests_count },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 24px',
              borderBottom: '1px solid var(--color-bone)',
              fontSize: 14, fontFamily: 'var(--font-body)',
            }}>
              <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
              <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px',
            fontSize: 15, fontFamily: 'var(--font-body)', fontWeight: 700,
          }}>
            <span style={{ color: 'var(--color-ink)' }}>Total pagado</span>
            <span style={{ color: 'var(--color-forest)' }}>{fmtCOP(res.total_price)}</span>
          </div>
        </div>

        {/* Payment instructions */}
        <div style={{
          background: 'rgba(165, 130, 60, .08)', border: '1px solid rgba(165, 130, 60, .2)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 32,
          fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textAlign: 'left',
        }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Instrucciones de pago</strong>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            El pago se realiza a la llegada o mediante transferencia bancaria.
            Te enviaremos los detalles al correo registrado en tu cuenta.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/perfil" className="btn btn-primary btn-lg">
            Ver mis reservas →
          </Link>
          <Link to="/" className="btn btn-ghost btn-lg">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
