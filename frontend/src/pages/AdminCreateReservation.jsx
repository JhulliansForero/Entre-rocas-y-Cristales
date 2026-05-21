import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCabins } from '../services/cabins'
import { adminCreateReservation } from '../services/reservations'

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtCOP(v) {
  if (!v) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(v)
}

function nightsBetween(a, b) {
  if (!a || !b) return 0
  const diff = (new Date(b) - new Date(a)) / 86_400_000
  return diff > 0 ? diff : 0
}

// ── Field components ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1px solid var(--color-bone)',
  borderRadius: 10, fontSize: 14,
  fontFamily: 'var(--font-body)', color: 'var(--color-ink)',
  background: 'white', outline: 'none', boxSizing: 'border-box',
}

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
        marginBottom: 7,
      }}>
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 5, fontFamily: 'var(--font-body)' }}>{hint}</div>}
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'ok' ? 'var(--color-forest)' : 'var(--color-danger)',
      color: 'white', padding: '12px 20px', borderRadius: 12,
      fontSize: 14, fontFamily: 'var(--font-body)',
      boxShadow: '0 4px 20px rgba(0,0,0,.25)', maxWidth: 380,
    }}>
      {msg}
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--color-snow)',
      border: '1px solid var(--color-bone)',
      borderRadius: 18, padding: '24px 28px',
      marginBottom: 20,
    }}>
      <h3 style={{
        margin: '0 0 20px', fontSize: 14, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminCreateReservation() {
  const navigate = useNavigate()
  const [cabins,  setCabins]  = useState([])
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  const [form, setForm] = useState({
    // Guest
    guest_email: '',
    guest_name:  '',
    guest_phone: '',
    // Reservation
    cabin:          '',
    check_in:       '',
    check_out:      '',
    guests_count:   1,
    payment_method: 'efectivo',
    status:         'active',
    total_price:    '',
    notes:          '',
  })

  useEffect(() => {
    getCabins({ page_size: 100 })
      .then(r => setCabins(r.data.results ?? r.data))
      .catch(() => {})
  }, [])

  // Auto-compute price when cabin + dates change
  useEffect(() => {
    const cabin = cabins.find(c => c.id === form.cabin)
    if (!cabin || !form.check_in || !form.check_out) return
    const nights = nightsBetween(form.check_in, form.check_out)
    if (nights > 0) {
      setForm(prev => ({
        ...prev,
        total_price: Math.round(Number(cabin.price_per_night) * nights),
      }))
    }
  }, [form.cabin, form.check_in, form.check_out, cabins])

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.guest_email) return showToast('El email del huésped es obligatorio.', 'err')
    if (!form.cabin)       return showToast('Selecciona una cabaña.', 'err')
    if (!form.check_in || !form.check_out) return showToast('Las fechas son obligatorias.', 'err')
    if (nightsBetween(form.check_in, form.check_out) <= 0) {
      return showToast('La fecha de salida debe ser posterior a la de entrada.', 'err')
    }

    setSaving(true)
    try {
      const res = await adminCreateReservation({
        guest_email:    form.guest_email.trim().toLowerCase(),
        guest_name:     form.guest_name.trim(),
        guest_phone:    form.guest_phone.trim(),
        cabin:          form.cabin,
        check_in:       form.check_in,
        check_out:      form.check_out,
        guests_count:   Number(form.guests_count),
        payment_method: form.payment_method,
        status:         form.status,
        total_price:    form.total_price || undefined,
        notes:          form.notes.trim(),
      })
      showToast(`Reserva ${res.data.reservation_id} creada correctamente.`, 'ok')
      setTimeout(() => navigate('/admin/reservas'), 1500)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? (typeof data === 'string' ? data : Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' · '))
        : 'Error al crear la reserva.'
      showToast(msg, 'err')
    } finally {
      setSaving(false)
    }
  }

  const selectedCabin = cabins.find(c => c.id === form.cabin)
  const nights        = nightsBetween(form.check_in, form.check_out)

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate('/admin/reservas')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Volver a reservas
          </button>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            color: 'var(--color-ink)', margin: 0, marginBottom: 6,
          }}>
            Nueva reserva manual
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Registra una reserva para un cliente que llegó por teléfono, WhatsApp u otro canal.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Datos del huésped ──────────────────────────────────────── */}
          <Section title="Datos del huésped">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Email" required>
                <input
                  type="email" value={form.guest_email}
                  onChange={e => set('guest_email', e.target.value)}
                  placeholder="cliente@email.com"
                  style={inputStyle}
                />
              </Field>
              <Field label="Nombre completo">
                <input
                  value={form.guest_name}
                  onChange={e => set('guest_name', e.target.value)}
                  placeholder="Nombre Apellido"
                  style={inputStyle}
                />
              </Field>
              <Field label="Teléfono / WhatsApp" hint="Opcional">
                <input
                  value={form.guest_phone}
                  onChange={e => set('guest_phone', e.target.value)}
                  placeholder="+57 300 000 0000"
                  style={inputStyle}
                />
              </Field>
            </div>
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--color-faint)', borderRadius: 10, fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
              💡 Si el email ya existe en el sistema, la reserva se vinculará a esa cuenta. Si no, se creará una nueva automáticamente.
            </div>
          </Section>

          {/* ── Cabaña y fechas ────────────────────────────────────────── */}
          <Section title="Cabaña y fechas">
            <Field label="Cabaña" required>
              <select
                value={form.cabin}
                onChange={e => set('cabin', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">— Selecciona una cabaña —</option>
                {cabins.map(c => (
                  <option key={c.id} value={c.id} disabled={!c.is_available}>
                    {c.name} · {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.price_per_night)}/noche
                    {!c.is_available ? ' (no disponible)' : ''}
                  </option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Check-in" required>
                <input
                  type="date" value={form.check_in}
                  onChange={e => set('check_in', e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Check-out" required>
                <input
                  type="date" value={form.check_out}
                  onChange={e => set('check_out', e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Huéspedes">
                <input
                  type="number" min="1" max={selectedCabin?.capacity || 10}
                  value={form.guests_count}
                  onChange={e => set('guests_count', e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center' }}
                />
              </Field>
            </div>

            {/* Resumen de fechas */}
            {nights > 0 && selectedCabin && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '14px 18px', background: 'var(--color-faint)',
                borderRadius: 12, fontSize: 13, fontFamily: 'var(--font-body)',
                color: 'var(--color-ink)',
              }}>
                <span>🌙 <strong>{nights}</strong> {nights === 1 ? 'noche' : 'noches'}</span>
                <span>·</span>
                <span>🏕 {selectedCabin.name}</span>
                <span>·</span>
                <span>👥 máx. {selectedCabin.capacity} personas</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-forest)' }}>
                  Base: {fmtCOP(Number(selectedCabin.price_per_night) * nights)}
                </span>
              </div>
            )}
          </Section>

          {/* ── Pago y estado ──────────────────────────────────────────── */}
          <Section title="Pago y estado">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Método de pago">
                <select
                  value={form.payment_method}
                  onChange={e => set('payment_method', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="tarjeta">Tarjeta de crédito/débito</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>

              <Field label="Estado inicial">
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="active">Activa</option>
                  <option value="completed">Completada</option>
                </select>
              </Field>

              <Field label="Precio total (COP)" hint="Se calcula automáticamente. Edita si negociaste un precio distinto.">
                <input
                  type="number" min="0" step="1000"
                  value={form.total_price}
                  onChange={e => set('total_price', e.target.value)}
                  placeholder="Auto"
                  style={inputStyle}
                />
              </Field>
            </div>
          </Section>

          {/* ── Notas ─────────────────────────────────────────────────── */}
          <Section title="Notas internas">
            <Field label="Notas" hint="Visible solo para el admin. Ej: llegada a las 3pm, mascota incluida, pedido especial...">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                style={{
                  ...inputStyle, resize: 'vertical', lineHeight: 1.5,
                }}
                placeholder="Notas adicionales sobre la reserva o el cliente..."
              />
            </Field>
          </Section>

          {/* ── Acciones ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => navigate('/admin/reservas')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : '✓ Crear reserva'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
