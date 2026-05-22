import { useEffect, useRef, useState } from 'react'
import { getHeroImages, uploadHeroImage, deleteHeroImage, updateHeroImage } from '../services/cabins'
import Spinner from '../components/Spinner'
import Footer  from '../components/Footer'

export default function AdminHeroImages() {
  const [images,    setImages]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const fileRef = useRef(null)

  function load() {
    setLoading(true)
    getHeroImages()
      .then(r => setImages(r.data.results ?? r.data))
      .catch(() => setError('No se pudieron cargar las imágenes.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true); setError(''); setSuccess('')
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadHeroImage(files[i], '', images.length + i)
      }
      setSuccess(`${files.length} imagen${files.length > 1 ? 'es' : ''} subida${files.length > 1 ? 's' : ''} correctamente.`)
      load()
    } catch {
      setError('Error al subir imágenes. Verifica el formato (JPG, PNG, WEBP).')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta imagen del hero?')) return
    try {
      await deleteHeroImage(id)
      setImages(prev => prev.filter(img => img.id !== id))
      setSuccess('Imagen eliminada.')
    } catch { setError('No se pudo eliminar.') }
  }

  async function handleToggle(img) {
    try {
      const updated = await updateHeroImage(img.id, { active: !img.active })
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, active: updated.data.active } : i))
    } catch { setError('No se pudo actualizar.') }
  }

  async function handleOrder(img, delta) {
    const newOrder = Math.max(0, img.order + delta)
    try {
      await updateHeroImage(img.id, { order: newOrder })
      load()
    } catch { setError('No se pudo cambiar el orden.') }
  }

  const sorted = [...images].sort((a, b) => a.order - b.order || a.id - b.id)

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 56, paddingBottom: 80 }} className="rg-px">

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-bronze)', fontWeight: 600, marginBottom: 8 }}>
            Panel de administración
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(32px,4vw,48px)', color: 'var(--color-bark)', margin: 0 }}>
            Imágenes del Hero
          </h1>
          <p style={{ color: 'var(--color-muted)', marginTop: 8, fontSize: 15 }}>
            Administra las fotos que aparecen en el slideshow de la página de inicio.
            Las imágenes activas se muestran en orden ascendente.
          </p>
        </div>

        {/* Alerts */}
        {error   && <div style={{ background: 'rgba(184,57,43,.1)', border: '1px solid rgba(184,57,43,.2)', borderRadius: 12, padding: '12px 16px', color: 'var(--color-danger)', marginBottom: 20, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: 'rgba(74,119,40,.1)', border: '1px solid rgba(74,119,40,.2)', borderRadius: 12, padding: '12px 16px', color: 'var(--color-ok)', marginBottom: 20, fontSize: 14 }}>{success}</div>}

        {/* Upload card */}
        <div className="card" style={{ padding: 28, marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="font-display" style={{ fontSize: 20, marginBottom: 4 }}>Agregar imágenes</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                JPG, PNG o WEBP · Puedes seleccionar varias a la vez
              </div>
            </div>
            <label style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
              <input
                ref={fileRef} type="file" accept="image/*" multiple
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={uploading}
              />
              <span className={`btn btn-primary${uploading ? ' btn-disabled' : ''}`}
                style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {uploading ? <><Spinner size="sm" /> Subiendo...</> : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    Subir fotos
                  </>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* Images grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="card-soft" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <div className="font-display" style={{ fontSize: 22, marginBottom: 8 }}>Sin imágenes aún</div>
            <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>Sube las primeras fotos para el hero.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {sorted.map(img => (
              <div key={img.id} className="card" style={{
                overflow: 'hidden',
                opacity: img.active ? 1 : 0.55,
                transition: 'opacity .2s',
              }}>
                {/* Imagen */}
                <div style={{ position: 'relative', height: 180, background: 'var(--color-bark)', overflow: 'hidden' }}>
                  <img src={img.image_url} alt={img.caption || `Hero ${img.id}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {/* Badge activa/inactiva */}
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: img.active ? 'rgba(74,119,40,.9)' : 'rgba(90,80,70,.8)',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 999, letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>
                    {img.active ? 'Activa' : 'Oculta'}
                  </span>
                </div>

                {/* Footer de la card */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  {/* Orden */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Orden {img.order}</span>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28 }}
                      onClick={() => handleOrder(img, -1)} title="Subir">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28 }}
                      onClick={() => handleOrder(img, 1)} title="Bajar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-icon btn-ghost"
                      onClick={() => handleToggle(img)}
                      title={img.active ? 'Ocultar' : 'Mostrar'}
                      style={{ width: 32, height: 32, color: img.active ? 'var(--color-moss)' : 'var(--color-faint)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {img.active
                          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                          : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        }
                      </svg>
                    </button>
                    <button className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(img.id)}
                      style={{ width: 32, height: 32 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        {sorted.length > 0 && (
          <div style={{ marginTop: 24, fontSize: 13, color: 'var(--color-faint)', textAlign: 'center' }}>
            {sorted.filter(i => i.active).length} imagen{sorted.filter(i => i.active).length !== 1 ? 'es' : ''} activa{sorted.filter(i => i.active).length !== 1 ? 's' : ''} en el hero
            · {sorted.length} en total
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
