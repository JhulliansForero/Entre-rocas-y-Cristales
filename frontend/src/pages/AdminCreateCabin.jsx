import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCabin, uploadCover } from '../services/cabins'

// ── Helpers ────────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function hexToTint(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 'rgba(74,102,80,.08)'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},.08)`
}

// ── Field label ────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
      marginBottom: 7,
    }}>
      {children} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
    </label>
  )
}

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Label required={required}>{label}</Label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 5, fontFamily: 'var(--font-body)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1px solid var(--color-bone)',
  borderRadius: 10, fontSize: 14,
  fontFamily: 'var(--font-body)', color: 'var(--color-ink)',
  background: 'white', outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical', minHeight: 100,
  lineHeight: 1.5,
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
      boxShadow: '0 4px 20px rgba(0,0,0,.25)',
      maxWidth: 360,
    }}>
      {msg}
    </div>
  )
}

// ── Cover drop zone ────────────────────────────────────────────────────────
function CoverDrop({ file, onChange }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault(); setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f?.type.startsWith('image/')) onChange(f)
      }}
      style={{
        border: `2px dashed ${drag ? 'var(--color-moss)' : 'var(--color-bone)'}`,
        borderRadius: 14, cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 160, overflow: 'hidden',
        background: drag ? 'var(--color-faint)' : 'white',
        position: 'relative', transition: 'all 0.15s',
      }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files[0]; if (f) onChange(f) }} />
      {preview ? (
        <img src={preview} alt="preview"
          style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 13 }}>Arrastra o haz clic para seleccionar la foto de portada</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Opcional — puedes añadirla después</div>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminCreateCabin() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState(null)
  const [cover,  setCover]  = useState(null)
  const [slugManual, setSlugManual] = useState(false) // ¿el admin editó el slug manualmente?

  const [form, setForm] = useState({
    id:              '',
    name:            '',
    short_name:      '',
    tagline:         '',
    description:     '',
    location:        'Ráquira · Boyacá',
    capacity:        2,
    bedrooms:        1,
    bathrooms:       1,
    size_sqm:        20,
    price_per_night: '',
    accent_color:    '#4a6650',
    is_available:    true,
    amenities_raw:   '',
    experiences_raw: '',
  })

  function set(key, val) {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      // Auto-slug from name (unless admin manually edited it)
      if (key === 'name' && !slugManual) {
        next.id = toSlug(val)
      }
      // Auto-sync short_name from name (unless already different)
      if (key === 'name' && !prev.short_name) {
        next.short_name = val
      }
      return next
    })
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.id) return showToast('El ID (slug) es obligatorio.', 'err')
    if (!form.name) return showToast('El nombre es obligatorio.', 'err')
    if (!form.price_per_night) return showToast('El precio por noche es obligatorio.', 'err')
    if (!form.description) return showToast('La descripción es obligatoria.', 'err')

    setSaving(true)
    try {
      const amenities   = form.amenities_raw.split('\n').map(s => s.trim()).filter(Boolean)
      const experiences = form.experiences_raw.split('\n').map(s => s.trim()).filter(Boolean)

      const payload = {
        id:              form.id,
        name:            form.name,
        short_name:      form.short_name || form.name,
        tagline:         form.tagline,
        description:     form.description,
        location:        form.location,
        capacity:        Number(form.capacity),
        bedrooms:        Number(form.bedrooms),
        bathrooms:       Number(form.bathrooms),
        size_sqm:        Number(form.size_sqm),
        price_per_night: form.price_per_night,
        accent_color:    form.accent_color,
        tint:            hexToTint(form.accent_color),
        is_available:    form.is_available,
        amenities,
        experiences,
      }

      await createCabin(payload)

      // Upload cover if selected
      if (cover) {
        try { await uploadCover(form.id, cover) } catch (_) {}
      }

      showToast(`¡Cabaña "${form.name}" creada!`, 'ok')
      setTimeout(() => navigate(`/admin/cabanas/${form.id}`), 1200)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? (typeof data === 'string' ? data : Object.values(data).flat().join(' · '))
        : 'Error al crear la cabaña.'
      showToast(msg, 'err')
    } finally {
      setSaving(false)
    }
  }

  const inp = (key, extra = {}) => ({
    value: form[key],
    onChange: e => set(key, e.target.value),
    style: { ...inputStyle, ...extra },
  })

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="rg-px" style={{ maxWidth: 860, margin: '0 auto', paddingTop: 48, paddingBottom: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <button onClick={() => navigate('/admin/cabanas')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Volver a cabañas
          </button>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            color: 'var(--color-ink)', margin: 0, marginBottom: 6,
          }}>
            Nueva cabaña
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
            Completa los datos. Podrás añadir fotos de galería después de guardar.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rg-form-2col" style={{ gap: 32 }}>

            {/* Columna izquierda */}
            <div>
              {/* Foto de portada */}
              <Field label="Foto de portada" hint="Recomendado 1200 × 800 px. Puedes añadirla ahora o después.">
                <CoverDrop file={cover} onChange={setCover} />
                {cover && (
                  <button type="button" onClick={() => setCover(null)}
                    style={{ marginTop: 8, fontSize: 12, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    × Quitar foto
                  </button>
                )}
              </Field>

              {/* ID / Slug */}
              <Field label="ID (slug)" required hint="URL de la cabaña. Solo letras minúsculas, números y guiones.">
                <input
                  {...inp('id')}
                  placeholder="ej: la-gruta-nueva"
                  onChange={e => { setSlugManual(true); set('id', e.target.value.replace(/\s/g, '-').toLowerCase()) }}
                />
              </Field>

              {/* Nombre */}
              <Field label="Nombre" required>
                <input {...inp('name')} placeholder="ej: La Gruta Esmeralda" />
              </Field>

              {/* Nombre corto */}
              <Field label="Nombre corto" hint="Para tarjetas y encabezados compactos">
                <input {...inp('short_name')} placeholder="ej: La Gruta" />
              </Field>

              {/* Tagline */}
              <Field label="Tagline">
                <input {...inp('tagline')} placeholder="ej: Duerme dentro de la roca viva" />
              </Field>

              {/* Ubicación */}
              <Field label="Ubicación">
                <input {...inp('location')} />
              </Field>
            </div>

            {/* Columna derecha */}
            <div>
              {/* Descripción */}
              <Field label="Descripción" required>
                <textarea {...inp('description')} style={textareaStyle} rows={6}
                  placeholder="Descripción completa de la cabaña..." />
              </Field>

              {/* Precio */}
              <Field label="Precio por noche (COP)" required>
                <input {...inp('price_per_night')} type="number" min="0" step="1000"
                  placeholder="ej: 390000" />
              </Field>

              {/* Métricas */}
              <div className="rg-metrics" style={{ marginBottom: 22 }}>
                {[
                  { label: 'Capacidad', key: 'capacity', min: 1 },
                  { label: 'Camas', key: 'bedrooms', min: 1 },
                  { label: 'Baños', key: 'bathrooms', min: 1 },
                  { label: 'm²', key: 'size_sqm', min: 1 },
                ].map(({ label, key, min }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <input type="number" min={min} value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      style={{ ...inputStyle, textAlign: 'center' }} />
                  </div>
                ))}
              </div>

              {/* Color de acento */}
              <Field label="Color de acento" hint="Define los tonos de la tarjeta y detalles visuales">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <input type="color" value={form.accent_color}
                    onChange={e => set('accent_color', e.target.value)}
                    style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid var(--color-bone)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                  <input value={form.accent_color}
                    onChange={e => set('accent_color', e.target.value)}
                    placeholder="#4a6650"
                    style={{ ...inputStyle, width: 120, flexShrink: 0 }} />
                </div>
              </Field>

              {/* Disponible */}
              <Field label="Disponibilidad">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                  <input type="checkbox" checked={form.is_available}
                    onChange={e => set('is_available', e.target.checked)}
                    style={{ width: 16, height: 16 }} />
                  Cabaña disponible para reservas
                </label>
              </Field>
            </div>
          </div>

          {/* Servicios y experiencias — ancho completo */}
          <div className="rg-form-2col" style={{ gap: 32, marginTop: 8 }}>
            <Field label="Servicios incluidos" hint="Un servicio por línea">
              <textarea
                value={form.amenities_raw}
                onChange={e => set('amenities_raw', e.target.value)}
                style={{ ...textareaStyle, minHeight: 140 }}
                placeholder={"WiFi gratuito\nDesayuno americano incluido\nAgua caliente 24 h\nParking gratuito\n..."}
              />
            </Field>
            <Field label="Experiencias disponibles" hint="Una experiencia por línea">
              <textarea
                value={form.experiences_raw}
                onChange={e => set('experiences_raw', e.target.value)}
                style={{ ...textareaStyle, minHeight: 140 }}
                placeholder={"Observación de estrellas\nSenderismo por la montaña\nTour de minerales\n..."}
              />
            </Field>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-bone)' }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => navigate('/admin/cabanas')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creando…' : '✓ Crear cabaña'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
