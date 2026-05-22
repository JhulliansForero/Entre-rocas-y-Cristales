import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SectionEyebrow from '../components/SectionEyebrow'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,  setForm]  = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  function handle(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas')
    } finally {
      setBusy(false)
    }
  }

  return (
    // Split layout — imagen izquierda, formulario derecha
    <div className="rg-auth-split">
      {/* Left — imagen decorativa (oculto en móvil) */}
      <div className="rg-auth-deco ph-stripe" style={{
        background: 'linear-gradient(135deg, var(--color-forest), var(--color-bark))',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(47,62,28,.35), rgba(47,62,28,.78))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 56, color: 'var(--color-paper)',
        }}>
          <SectionEyebrow color="var(--color-fern)">Bienvenido de regreso</SectionEyebrow>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', margin: '18px 0 8px', lineHeight: 1.05 }}>
            La montaña te <span className="font-display-i">esperaba</span>.
          </h2>
          <p style={{ opacity: .85, maxWidth: 420, fontSize: 15 }}>
            Inicia sesión para administrar tu reserva, descargar el mapa de senderos o reservar una nueva estancia.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="rg-px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 32px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <SectionEyebrow>Acceso</SectionEyebrow>
          <h1 className="font-display" style={{ fontSize: 44, margin: '10px 0 8px' }}>Inicia sesión</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--color-moss)', fontWeight: 600 }}>Crear cuenta</Link>
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(184,57,43,.08)', border: '1px solid rgba(184,57,43,.2)', borderRadius: 12, fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="field-label">Correo electrónico</label>
              <input className="input input-lg" type="email" name="email" value={form.email}
                onChange={handle} required placeholder="tunombre@correo.co" />
            </div>
            <div>
              <label className="field-label">Contraseña</label>
              <input className="input input-lg" type="password" name="password" value={form.password}
                onChange={handle} required placeholder="••••••••" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" style={{ color: 'var(--color-moss)', fontFamily: 'var(--font-body)' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" disabled={busy} className="btn btn-primary btn-lg" style={{ marginTop: 10 }}>
              {busy ? 'Ingresando…' : 'Iniciar sesión'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-faint)', fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-bone)' }} />
              o continúa con
              <div style={{ flex: 1, height: 1, background: 'var(--color-bone)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" className="btn btn-secondary">Google</button>
              <button type="button" className="btn btn-secondary">Apple</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
