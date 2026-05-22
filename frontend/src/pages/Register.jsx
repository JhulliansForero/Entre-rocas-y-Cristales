import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SectionEyebrow from '../components/SectionEyebrow'

const LABELS = {
  first_name:       'Nombre',
  last_name:        'Apellido',
  email:            'Correo electrónico',
  phone:            'Teléfono',
  password:         'Contraseña',
  confirm_password: 'Confirmar contraseña',
}

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  // ⚠ El backend espera "confirm_password", no "password2"
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', password: '', confirm_password: '',
  })
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [busy,        setBusy]        = useState(false)

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (fieldErrors[e.target.name]) setFieldErrors(fe => ({ ...fe, [e.target.name]: null }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: ['Las contraseñas no coinciden'] })
      setError('Confirmar contraseña: Las contraseñas no coinciden')
      return
    }
    setError(''); setFieldErrors({}); setBusy(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setFieldErrors(data)
        const firstKey = Object.keys(data)[0]
        const firstMsg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        const label    = LABELS[firstKey]
        setError(label ? `${label}: ${firstMsg}` : firstMsg)
      } else {
        setError('Error al crear la cuenta')
      }
    } finally { setBusy(false) }
  }

  function FieldError({ name }) {
    const e = fieldErrors[name]
    if (!e) return null
    const msg = Array.isArray(e) ? e[0] : e
    return (
      <div style={{ marginTop: 5, fontSize: 12, color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
        ⚠ {msg}
      </div>
    )
  }

  const hasErr = name => !!fieldErrors[name]

  return (
    <div className="rg-px" style={{ maxWidth: 1080, margin: '0 auto', paddingTop: 56, paddingBottom: 56 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <SectionEyebrow>Únete a la familia</SectionEyebrow>
        <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', margin: '12px 0 6px' }}>
          Crea tu <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>cuenta</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: 460, margin: '0 auto' }}>
          Te enviaremos novedades sobre fechas con descuento, nuevas cabañas y experiencias estacionales. Sin spam.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(184,57,43,.08)', border: '1px solid rgba(184,57,43,.2)', borderRadius: 12, fontSize: 14, color: 'var(--color-danger)', fontFamily: 'var(--font-body)', maxWidth: 740, margin: '0 auto 20px' }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={submit} className="card" style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
        <div className="rg-form-2col">

          <Field label="Nombre">
            <input
              className="input input-lg" name="first_name" value={form.first_name}
              onChange={handle} required placeholder="Tu nombre"
              style={hasErr('first_name') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="first_name" />
          </Field>

          <Field label="Apellido">
            <input
              className="input input-lg" name="last_name" value={form.last_name}
              onChange={handle} required placeholder="Tu apellido"
              style={hasErr('last_name') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="last_name" />
          </Field>

          <Field label="Correo electrónico">
            <input
              className="input input-lg" type="email" name="email" value={form.email}
              onChange={handle} required placeholder="tunombre@correo.co"
              style={hasErr('email') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="email" />
          </Field>

          <Field label="Teléfono">
            <input
              className="input input-lg" type="tel" name="phone" value={form.phone}
              onChange={handle} placeholder="+57 310 482 9134"
              style={hasErr('phone') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="phone" />
          </Field>

          <Field label="Contraseña" hint="Mínimo 8 caracteres.">
            <input
              className="input input-lg" type="password" name="password" value={form.password}
              onChange={handle} required minLength={8} placeholder="••••••••"
              style={hasErr('password') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="password" />
          </Field>

          <Field label="Confirmar contraseña">
            <input
              className="input input-lg" type="password" name="confirm_password" value={form.confirm_password}
              onChange={handle} required placeholder="••••••••"
              style={hasErr('confirm_password') ? { outline: '2px solid var(--color-danger)' } : {}}
            />
            <FieldError name="confirm_password" />
          </Field>

        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
            Acepto los <a href="#" style={{ color: 'var(--color-moss)' }}>términos del servicio</a> y la{' '}
            <a href="#" style={{ color: 'var(--color-moss)' }}>política de privacidad</a>.
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
            Quiero recibir el boletín estacional con disponibilidad anticipada.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--color-bone)' }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-moss)', fontWeight: 600 }}>Inicia sesión</Link>
          </span>
          <button type="submit" disabled={busy} className="btn btn-primary btn-lg">
            {busy ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && <div style={{ fontSize: 12, color: 'var(--color-faint)', marginTop: 6, fontFamily: 'var(--font-body)' }}>{hint}</div>}
    </div>
  )
}
