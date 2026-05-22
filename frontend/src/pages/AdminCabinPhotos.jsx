import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCabin, updateCabin,
  uploadCover, removeCover, addGalleryImg, deleteGalleryImg,
} from '../services/cabins'
import { fmtCOP } from '../utils/format'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'
import Footer from '../components/Footer'

function readFileAsUrl(file) {
  return new Promise(res => {
    const fr = new FileReader()
    fr.onload = e => res(e.target.result)
    fr.readAsDataURL(file)
  })
}

function DropZone({ onFile }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) onFile(f)
  }
  return (
    <div onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--color-moss)' : 'var(--color-bone)'}`,
        borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
        background: dragging ? 'rgba(94,124,52,.05)' : 'var(--color-snow)',
        transition: 'border-color .15s, background .15s',
      }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = '' }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
      <div style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', fontWeight: 500 }}>
        Arrastra o haz clic para seleccionar
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>JPG, PNG, WebP · máx 10 MB</div>
    </div>
  )
}

function DropZoneSmall({ onFile }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) onFile(f)
  }
  return (
    <div onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--color-moss)' : 'var(--color-bone)'}`,
        borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
        background: dragging ? 'rgba(94,124,52,.05)' : 'var(--color-snow)',
        aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = '' }} />
      <div style={{ fontSize: 24, marginBottom: 4 }}>🖼</div>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-bark)' }}>Seleccionar imagen</div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, fontFamily: 'var(--font-body)' }}>{hint}</div>}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--color-bone)', borderRadius: 10,
  fontSize: 14, fontFamily: 'var(--font-body)',
  background: 'white', boxSizing: 'border-box',
  outline: 'none',
}

export default function AdminCabinPhotos() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [cabin,      setCabin]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('info')

  // ── Info form state ──
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)

  // ── Photo state ──
  const [coverBusy,   setCoverBusy]   = useState(false)
  const [gallBusy,    setGallBusy]    = useState(false)
  const [deleting,    setDeleting]    = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [coverFile,   setCoverFile]   = useState(null)
  const [gallPreview, setGallPreview] = useState(null)
  const [gallFile,    setGallFile]    = useState(null)
  const [gallCaption, setGallCaption] = useState('')

  const [toast, setToast] = useState(null)

  function showToast(msg, type = 'ok') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    getCabin(id)
      .then(r => {
        const c = r.data
        setCabin(c)
        setForm({
          name:             c.name ?? '',
          tagline:          c.tagline ?? '',
          description:      c.description ?? '',
          price_per_night:  c.price_per_night ?? '',
          capacity:         c.capacity ?? '',
          bedrooms:         c.bedrooms ?? '',
          bathrooms:        c.bathrooms ?? '',
          size_sqm:         c.size_sqm ?? '',
          is_available:     c.is_available ?? true,
          amenities_text:   (c.amenities  || []).join('\n'),
          experiences_text: (c.experiences || []).join('\n'),
        })
      })
      .catch(() => navigate('/admin/cabanas'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  // ── Save info ──
  async function handleSaveInfo() {
    setSaving(true)
    try {
      const payload = {
        name:            form.name,
        tagline:         form.tagline,
        description:     form.description,
        price_per_night: parseFloat(String(form.price_per_night).replace(/[^0-9.]/g, '')),
        capacity:        parseInt(form.capacity),
        bedrooms:        parseInt(form.bedrooms),
        bathrooms:       parseInt(form.bathrooms),
        size_sqm:        parseInt(form.size_sqm),
        is_available:    form.is_available,
        amenities:       form.amenities_text.split('\n').map(s => s.trim()).filter(Boolean),
        experiences:     form.experiences_text.split('\n').map(s => s.trim()).filter(Boolean),
      }
      await updateCabin(id, payload)
      setCabin(c => ({ ...c, ...payload }))
      showToast('Información actualizada ✓')
    } catch {
      showToast('Error al guardar', 'err')
    } finally {
      setSaving(false)
    }
  }

  function setF(key, value) { setForm(f => ({ ...f, [key]: value })) }

  // ── Cover ──
  async function handleCoverSelect(file) { setCoverFile(file); setPreview(await readFileAsUrl(file)) }
  async function handleCoverUpload() {
    if (!coverFile) return; setCoverBusy(true)
    try {
      const r = await uploadCover(id, coverFile)
      setCabin(c => ({ ...c, main_image_url: r.data.main_image_url }))
      setPreview(null); setCoverFile(null)
      showToast('Portada actualizada ✓')
    } catch { showToast('Error al subir la portada', 'err') }
    finally { setCoverBusy(false) }
  }
  async function handleCoverRemove() {
    if (!window.confirm('¿Quitar la foto de portada?')) return; setCoverBusy(true)
    try {
      await removeCover(id)
      setCabin(c => ({ ...c, main_image_url: null }))
      showToast('Portada eliminada')
    } catch { showToast('Error al eliminar', 'err') }
    finally { setCoverBusy(false) }
  }

  // ── Gallery ──
  async function handleGallSelect(file) { setGallFile(file); setGallPreview(await readFileAsUrl(file)) }
  async function handleGallUpload() {
    if (!gallFile) return; setGallBusy(true)
    try {
      const r = await addGalleryImg(id, gallFile, gallCaption)
      setCabin(c => ({ ...c, images: [...(c.images ?? []), r.data] }))
      setGallFile(null); setGallPreview(null); setGallCaption('')
      showToast('Imagen agregada ✓')
    } catch { showToast('Error al subir', 'err') }
    finally { setGallBusy(false) }
  }
  async function handleGallDelete(imgId) {
    if (!window.confirm('¿Eliminar esta imagen?')) return; setDeleting(imgId)
    try {
      await deleteGalleryImg(imgId)
      setCabin(c => ({ ...c, images: c.images.filter(i => i.id !== imgId) }))
      showToast('Imagen eliminada')
    } catch { showToast('Error al eliminar', 'err') }
    finally { setDeleting(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!cabin) return null

  const TAB_STYLE = (active) => ({
    padding: '10px 22px', borderRadius: 999, border: 0, cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
    background: active ? 'var(--color-forest)' : 'transparent',
    color: active ? 'var(--color-paper)' : 'var(--color-bark)',
    transition: 'background .15s, color .15s',
  })

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'err' ? 'var(--color-danger)' : 'var(--color-forest)',
          color: 'white', padding: '12px 24px', borderRadius: 999,
          fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 500,
          boxShadow: 'var(--shadow-md)', zIndex: 999,
        }}>{toast.msg}</div>
      )}

      <section className="rg-px" style={{ maxWidth: 920, margin: '0 auto', paddingTop: 56, paddingBottom: 80 }}>

        {/* Header */}
        <button onClick={() => navigate('/admin/cabanas')}
          style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver a cabañas
        </button>
        <SectionEyebrow>Admin · {cabin.name}</SectionEyebrow>
        <h1 className="font-display" style={{ fontSize: 'clamp(26px, 3vw, 40px)', margin: '10px 0 6px' }}>
          {cabin.name}
        </h1>
        <p className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 15, margin: '0 0 32px' }}>
          {cabin.tagline}
        </p>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4,
          background: 'var(--color-snow)', borderRadius: 999,
          border: '1px solid var(--color-bone)', marginBottom: 40,
        }}>
          <button style={TAB_STYLE(activeTab === 'info')}  onClick={() => setActiveTab('info')}>📝 Información</button>
          <button style={TAB_STYLE(activeTab === 'fotos')} onClick={() => setActiveTab('fotos')}>📷 Fotos</button>
        </div>

        {/* ═══════════════ TAB INFORMACIÓN ═══════════════ */}
        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Nombre + Tagline */}
            <div className="rg-form-2col">
              <Field label="Nombre de la cabaña">
                <input style={inputStyle} value={form.name} onChange={e => setF('name', e.target.value)} />
              </Field>
              <Field label="Tagline (frase corta)">
                <input style={inputStyle} value={form.tagline} onChange={e => setF('tagline', e.target.value)} />
              </Field>
            </div>

            {/* Descripción */}
            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={e => setF('description', e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </Field>

            {/* Métricas */}
            <div className="rg-specs4" style={{ alignItems: 'start' }}>
              <Field label="Precio/noche" hint="COP · solo números">
                <input type="number" style={inputStyle} value={form.price_per_night}
                  onChange={e => setF('price_per_night', e.target.value)} />
              </Field>
              <Field label="Capacidad">
                <input type="number" min="1" max="10" style={inputStyle} value={form.capacity}
                  onChange={e => setF('capacity', e.target.value)} />
              </Field>
              <Field label="Camas">
                <input type="number" min="1" max="10" style={inputStyle} value={form.bedrooms}
                  onChange={e => setF('bedrooms', e.target.value)} />
              </Field>
              <Field label="Superficie m²">
                <input type="number" min="1" style={inputStyle} value={form.size_sqm}
                  onChange={e => setF('size_sqm', e.target.value)} />
              </Field>
            </div>

            {/* Disponible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--color-snow)', borderRadius: 12, border: '1px solid var(--color-bone)' }}>
              <input type="checkbox" id="avail" checked={!!form.is_available}
                onChange={e => setF('is_available', e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-forest)' }} />
              <label htmlFor="avail" style={{ fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer', color: 'var(--color-bark)' }}>
                <strong>Disponible para reservas</strong> — si desmarcas esto, la cabaña no aparecerá como disponible
              </label>
            </div>

            {/* Amenidades */}
            <Field label="Lo que incluye (amenidades)" hint="Una por línea. Ej: Cama doble · WiFi gratuito · Desayuno incluido">
              <textarea
                value={form.amenities_text}
                onChange={e => setF('amenities_text', e.target.value)}
                rows={8}
                placeholder={"1 cama doble\nBaño privado\nAgua caliente 24 h\nDesayuno americano incluido\nWiFi gratuito\nParking gratuito\nSe admiten mascotas"}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8, fontFamily: 'monospace', fontSize: 13 }} />
            </Field>

            {/* Experiencias */}
            <Field label="Experiencias" hint="Una por línea.">
              <textarea
                value={form.experiences_text}
                onChange={e => setF('experiences_text', e.target.value)}
                rows={5}
                placeholder={"Caminata a la cascada\nObservación de estrellas\nAvistamiento de aves"}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8, fontFamily: 'monospace', fontSize: 13 }} />
            </Field>

            {/* Preview precio */}
            {form.price_per_night > 0 && (
              <div style={{ padding: '14px 18px', background: 'rgba(94,124,52,.07)', borderRadius: 12, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-forest)' }}>
                💰 Precio mostrado al huésped: <strong>{fmtCOP(parseFloat(form.price_per_night) || 0)}</strong> / noche
              </div>
            )}

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button onClick={handleSaveInfo} disabled={saving}
                className="btn btn-primary" style={{ minWidth: 180 }}>
                {saving ? <><Spinner size="sm" /> Guardando…</> : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB FOTOS ═══════════════ */}
        {activeTab === 'fotos' && (
          <div>
            {/* COVER */}
            <section style={{ marginBottom: 48 }}>
              <h2 className="font-display" style={{ fontSize: 24, marginBottom: 6 }}>Foto de portada</h2>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
                Primera imagen en el catálogo. Recomendado: 1200 × 900 px, JPG o WebP.
              </p>

              <div className="rg-form-2col" style={{ alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 10 }}>Portada actual</div>
                  <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--color-paper)', aspectRatio: '4/3' }}>
                    {cabin.main_image_url ? (
                      <img src={cabin.main_image_url} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-faint)', gap: 8 }}>
                        <span style={{ fontSize: 40 }}>🏕</span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>Sin portada</span>
                      </div>
                    )}
                  </div>
                  {cabin.main_image_url && (
                    <button onClick={handleCoverRemove} disabled={coverBusy}
                      style={{ marginTop: 10, background: 'none', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: 999, padding: '7px 16px', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                      {coverBusy ? 'Eliminando…' : '✕ Quitar portada'}
                    </button>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 10 }}>
                    {preview ? 'Vista previa' : 'Subir nueva portada'}
                  </div>
                  {preview ? (
                    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '4/3' }}>
                      <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => { setPreview(null); setCoverFile(null) }}
                        style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: 'white', border: 0, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ) : (
                    <DropZone onFile={handleCoverSelect} />
                  )}
                  {preview && (
                    <button onClick={handleCoverUpload} disabled={coverBusy}
                      className="btn btn-primary" style={{ marginTop: 12, width: '100%' }}>
                      {coverBusy ? <><Spinner size="sm" /> Subiendo…</> : 'Guardar como portada'}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--color-bone)', margin: '0 0 40px' }} />

            {/* GALLERY */}
            <section>
              <h2 className="font-display" style={{ fontSize: 24, marginBottom: 6 }}>Galería</h2>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>
                Imágenes en el detalle de la cabaña. Máx 8 fotos recomendado.
              </p>

              {(cabin.images ?? []).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
                  {cabin.images.map(img => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--color-paper)' }}>
                      <img src={img.image} alt={img.caption || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.caption && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.6))', color: 'white', padding: '20px 10px 8px', fontSize: 11, fontFamily: 'var(--font-body)' }}>{img.caption}</div>
                      )}
                      <button onClick={() => handleGallDelete(img.id)} disabled={deleting === img.id}
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(180,57,43,.85)', color: 'white', border: 0, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deleting === img.id ? .5 : 1 }}>
                        {deleting === img.id ? '…' : '×'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: 'var(--color-snow)', border: '1px solid var(--color-bone)', borderRadius: 18, padding: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-bark)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>＋ Agregar imagen a la galería</div>
                <div className="rg-form-2col" style={{ alignItems: 'start' }}>
                  <div>
                    {gallPreview ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={gallPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => { setGallPreview(null); setGallFile(null) }}
                          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: 'white', border: 0, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ) : <DropZoneSmall onFile={handleGallSelect} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="field-label">Pie de foto (opcional)</label>
                      <input type="text" value={gallCaption} onChange={e => setGallCaption(e.target.value)}
                        placeholder="Ej: Vista desde el interior"
                        style={{ ...inputStyle, marginTop: 6 }} />
                    </div>
                    <button onClick={handleGallUpload} disabled={!gallFile || gallBusy}
                      className="btn btn-primary"
                      style={{ opacity: !gallFile ? .5 : 1, cursor: !gallFile ? 'not-allowed' : 'pointer' }}>
                      {gallBusy ? <><Spinner size="sm" /> Subiendo…</> : 'Agregar a galería'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

      </section>
      <Footer />
    </div>
  )
}
