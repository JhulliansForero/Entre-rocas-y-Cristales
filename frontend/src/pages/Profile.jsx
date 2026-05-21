import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReservations, cancelReservation } from '../services/reservations'
import { updateProfile } from '../services/auth'
import { fmtCOP, fmtDate } from '../utils/format'
import StatusPill from '../components/StatusPill'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'
import Footer from '../components/Footer'

export default function Profile() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const [reservations, setReservations] = useState([])
  const [loadingRes,   setLoadingRes]   = useState(true)
  const [editMode,     setEditMode]     = useState(false)
  const [form,         setForm]         = useState({ first_name: '', last_name: '', phone: '' })
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')
  const [cancelId,     setCancelId]     = useState(null)

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name ?? '', last_name: user.last_name ?? '', phone: user.phone ?? '' })
  }, [user])

  useEffect(() => {
    getReservations()
      .then(r => setReservations(r.data.results ?? r.data))
      .catch(() => {})
      .finally(() => setLoadingRes(false))
  }, [])

  function handleFormChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSaveProfile(e) {
    e.preventDefault(); setSaving(true); setSaveError('')
    try {
      const r = await updateProfile(form)
      setUser(r.data); setEditMode(false)
    } catch { setSaveError('No se pudo guardar los cambios') }
    finally { setSaving(false) }
  }

  async function handleCancel(id) {
    try {
      await cancelReservation(id)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    } catch { alert('No se pudo cancelar la reserva') }
    finally { setCancelId(null) }
  }

  const active = reservations.filter(r => r.status === 'active')
  const past   = reservations.filter(r => r.status !== 'active')

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean).map(s => s[0].toUpperCase()).join('')

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 0' }}>

        {/* Header */}
        <SectionEyebrow>Mi cuenta</SectionEyebrow>
        <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 52px)', margin: '12px 0 40px' }}>
          Mi <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>perfil</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 36, alignItems: 'start' }}>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile card */}
            <div className="card" style={{ padding: 28 }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-forest), var(--color-moss))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <span className="font-display" style={{ fontSize: 26, color: 'var(--color-paper)' }}>
                  {initials || '?'}
                </span>
              </div>

              {!editMode ? (
                <>
                  <h2 className="font-display" style={{ fontSize: 22, margin: '0 0 2px' }}>
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 6px' }}>
                    {user?.email}
                  </p>
                  {user?.phone && (
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
                      {user.phone}
                    </p>
                  )}
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    ✎ Editar perfil
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {saveError && (
                    <p style={{ fontSize: 12, color: 'var(--color-danger)', fontFamily: 'var(--font-body)', margin: 0 }}>
                      {saveError}
                    </p>
                  )}
                  <div>
                    <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>Nombre</label>
                    <input className="input" name="first_name" value={form.first_name} onChange={handleFormChange} placeholder="Nombre" />
                  </div>
                  <div>
                    <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>Apellido</label>
                    <input className="input" name="last_name" value={form.last_name} onChange={handleFormChange} placeholder="Apellido" />
                  </div>
                  <div>
                    <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>Teléfono</label>
                    <input className="input" type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="+57 310 000 0000" />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => setEditMode(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
                      {saving ? '…' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick links */}
            <div className="card" style={{ padding: '12px 0' }}>
              {[
                { label: '← Volver al inicio', to: '/' },
                { label: 'Explorar cabañas', to: '/cabinas' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  display: 'block', padding: '10px 20px',
                  fontSize: 13, color: 'var(--color-moss)', fontFamily: 'var(--font-body)',
                  textDecoration: 'none', fontWeight: 500,
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Main: reservations ── */}
          <main>
            <h2 className="font-display" style={{ fontSize: 28, marginBottom: 24 }}>Mis reservas</h2>

            {loadingRes ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>
            ) : reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>
                  Aún no tienes reservas.
                </p>
                <Link to="/cabinas" className="btn btn-primary">
                  Explorar cabañas →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {active.length > 0 && (
                  <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--color-faint)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                    Próximas
                  </p>
                )}
                {active.map(r => (
                  <ReservationCard key={r.id} r={r} onCancel={() => setCancelId(r.id)} />
                ))}

                {past.length > 0 && (
                  <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--color-faint)', fontFamily: 'var(--font-body)', fontWeight: 700, marginTop: 12 }}>
                    Historial
                  </p>
                )}
                {past.map(r => (
                  <ReservationCard key={r.id} r={r} past />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {/* Cancel confirmation modal */}
      {cancelId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(47,62,28,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 16px',
        }}>
          <div className="card" style={{ padding: 36, maxWidth: 400, width: '100%' }}>
            <h3 className="font-display" style={{ fontSize: 26, marginBottom: 12 }}>¿Cancelar reserva?</h3>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginBottom: 28, lineHeight: 1.6 }}>
              Esta acción no se puede deshacer. La reserva quedará marcada como cancelada.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setCancelId(null)} className="btn btn-ghost" style={{ flex: 1, padding: '12px 0' }}>
                Volver
              </button>
              <button
                onClick={() => handleCancel(cancelId)}
                className="btn btn-danger"
                style={{ flex: 1, padding: '12px 0' }}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReservationCard({ r, onCancel, past }) {
  return (
    <div className="card" style={{ padding: '20px 24px', opacity: past ? .65 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="font-display" style={{ fontSize: 20 }}>{r.cabin_name ?? r.cabin}</span>
            <StatusPill status={r.status} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>
            {r.reservation_id} · {r.guests_count} huéspede{r.guests_count !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            <span style={{ color: 'var(--color-muted)' }}>
              Entrada: <strong style={{ color: 'var(--color-ink)' }}>{fmtDate(r.check_in)}</strong>
            </span>
            <span style={{ color: 'var(--color-muted)' }}>
              Salida: <strong style={{ color: 'var(--color-ink)' }}>{fmtDate(r.check_out)}</strong>
            </span>
            <span style={{ color: 'var(--color-muted)' }}>
              Total: <strong style={{ color: 'var(--color-forest)' }}>{fmtCOP(r.total_price)}</strong>
            </span>
          </div>
        </div>

        {r.status === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <Link
              to={`/reservas/${r.id}/editar`}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ✎ Editar
            </Link>
            <button
              onClick={onCancel}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ✕ Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
