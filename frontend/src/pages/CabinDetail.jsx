import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCabin, getAvailability } from '../services/cabins'
import { fmtCOP, nightsBetween, calcTotal } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import Calendar from '../components/Calendar'
import CabinBadge from '../components/CabinBadge'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'
import Footer from '../components/Footer'

/* ── Lightbox ── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const total = images.length

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

      {/* Image */}
      <img
        src={images[idx].image}
        alt={`Foto ${idx + 1}`}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '88vh',
          objectFit: 'contain', borderRadius: 8,
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
          userSelect: 'none',
        }}
      />

      {/* Cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 20, right: 24,
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          color: 'white', width: 44, height: 44, borderRadius: '50%',
          fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>×</button>

      {/* Contador */}
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,.7)', fontSize: 13, fontFamily: 'var(--font-body)',
      }}>{idx + 1} / {total}</div>

      {/* ← Anterior */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          style={{
            position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: 'white', width: 52, height: 52, borderRadius: '50%',
            fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>‹</button>
      )}

      {/* → Siguiente */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          style={{
            position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
            color: 'white', width: 52, height: 52, borderRadius: '50%',
            fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>›</button>
      )}

      {/* Thumbnails */}
      {total > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 8, maxWidth: '90vw', overflowX: 'auto', padding: '4px 8px',
          }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{
                width: 54, height: 40, borderRadius: 6, overflow: 'hidden',
                border: i === idx ? '2px solid white' : '2px solid transparent',
                padding: 0, cursor: 'pointer', flexShrink: 0, opacity: i === idx ? 1 : 0.55,
                transition: 'opacity .2s, border-color .2s',
              }}>
              <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SpecCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--color-snow)', border: '1px solid var(--color-bone)',
      borderRadius: 16, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 10, color: 'var(--color-faint)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 18, lineHeight: 1.1 }}>{value}</div>
    </div>
  )
}

export default function CabinDetail() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [cabin,        setCabin]        = useState(null)
  const [blocked,      setBlocked]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [dates,        setDates]        = useState({ start: null, end: null })
  const [guests,       setGuests]       = useState(1)
  const [lightboxIdx,  setLightboxIdx]  = useState(null)  // null = cerrado

  useEffect(() => {
    Promise.all([getCabin(slug), getAvailability(slug)])
      .then(([cr, ar]) => {
        setCabin(cr.data)
        setBlocked(ar.data.blocked_dates ?? [])
      })
      .catch(() => navigate('/cabinas'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  const checkIn  = dates.start ? dates.start.toISOString().slice(0, 10) : null
  const checkOut = dates.end   ? dates.end.toISOString().slice(0, 10)   : null
  const nights   = nightsBetween(checkIn, checkOut)
  const totals   = cabin && nights > 0 ? calcTotal(Number(cabin.price_per_night), nights) : null

  function handleReserve() {
    if (!user) { navigate('/login'); return }
    const p = new URLSearchParams({ cabin: slug, check_in: checkIn, check_out: checkOut, guests })
    navigate(`/reservas/nueva?${p}`)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!cabin) return null

  // Combine cover + gallery into one list for the mosaic
  const rawGallery = cabin.images ?? []
  const allImgs = [
    ...(cabin.main_image_url ? [{ image: cabin.main_image_url, id: '__cover' }] : []),
    ...rawGallery,
  ]
  const rating  = cabin.rating
  const reviews = cabin.reviews_count || cabin.reviews

  // Accent color for placeholder tiles
  const accent = cabin.accent_color || 'var(--color-moss)'

  return (
    <div style={{ background: 'var(--color-cream)' }}>

      {/* Lightbox */}
      {lightboxIdx !== null && allImgs.filter(img => img.image).length > 0 && (
        <Lightbox
          images={allImgs.filter(img => img.image)}
          startIdx={Math.min(lightboxIdx, allImgs.filter(img => img.image).length - 1)}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* Gallery grid — clic en cualquier foto abre el lightbox */}
      <div className="rg-gallery">
        {Array.from({ length: 5 }, (_, i) => {
          const img = allImgs[i]
          return (
            <div key={i}
              onClick={() => img && setLightboxIdx(i)}
              style={{
                gridRow: i === 0 ? 'span 2' : undefined,
                overflow: 'hidden',
                background: accent + '22',
                cursor: img ? 'pointer' : 'default',
                position: 'relative',
              }}>
              {img ? (
                <>
                  <img src={img.image} alt={`${cabin.name} ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {/* Overlay hint en primera imagen */}
                  {i === 0 && allImgs.filter(x => x.image).length > 1 && (
                    <div style={{
                      position: 'absolute', bottom: 14, right: 14,
                      background: 'rgba(0,0,0,.55)', color: 'white',
                      padding: '6px 12px', borderRadius: 20,
                      fontSize: 11, fontFamily: 'var(--font-body)',
                      backdropFilter: 'blur(4px)',
                      pointerEvents: 'none',
                    }}>
                      🔍 Ver {allImgs.filter(x => x.image).length} fotos
                    </div>
                  )}
                </>
              ) : (
                <div className="ph-stripe" style={{ width: '100%', height: '100%' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 40 }} className="rg-px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <SectionEyebrow>Cabaña · {(cabin.location || '').split('·')[0].trim()}</SectionEyebrow>
            <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', margin: '14px 0 4px', lineHeight: 1.05 }}>
              {cabin.name}
            </h1>
            <p className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 18, margin: '4px 0 8px' }}>
              {cabin.tagline}
            </p>
            {rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                <span className="stars">★★★★★</span>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{rating}</span>
                {reviews && <span style={{ color: 'var(--color-muted)' }}>· {reviews} reseñas</span>}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 8 }}>
            <div className="font-display" style={{ fontSize: 32, color: 'var(--color-forest)', lineHeight: 1 }}>
              {fmtCOP(cabin.price_per_night)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-faint)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
              por noche · imp. incluidos
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="rg-detail rg-px" style={{
        maxWidth: 1280, margin: '40px auto 0', paddingBottom: 80,
      }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>

          {/* Description */}
          <section>
            <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--color-ink)', fontFamily: 'var(--font-body)', margin: 0 }}>
              {cabin.description}
            </p>
          </section>

          {/* Spec cards */}
          <section>
            <h2 className="font-display" style={{ fontSize: 28, marginBottom: 18 }}>Características</h2>
            <div className="rg-specs4">
              <SpecCard icon="🛏" label="Camas" value={cabin.bedrooms} />
              <SpecCard icon="👥" label="Capacidad"   value={`${cabin.capacity} pers.`} />
              <SpecCard icon="📐" label="Superficie"  value={`${cabin.size_sqm || cabin.size} m²`} />
              <SpecCard icon="📍" label="Ubicación"   value={(cabin.location || '').split('·')[0].trim()} />
            </div>
          </section>

          {/* Amenities */}
          {cabin.amenities?.length > 0 && (
            <section>
              <h2 className="font-display" style={{ fontSize: 28, marginBottom: 18 }}>Lo que incluye</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {cabin.amenities.map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
                    <span style={{ color: 'var(--color-fern)', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>✓</span>
                    {a}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experiences */}
          {cabin.experiences?.length > 0 && (
            <section>
              <h2 className="font-display" style={{ fontSize: 28, marginBottom: 18 }}>Experiencias</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {cabin.experiences.map(exp => (
                  <span key={exp} className="chip">{exp}</span>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── Right column — Booking sidebar ── */}
        <aside className="rg-sticky" style={{ position: 'sticky', top: 24 }}>
          <div className="card" style={{ padding: 28 }}>

            {/* Price */}
            <div style={{ marginBottom: 22 }}>
              <span className="font-display" style={{ fontSize: 28, color: 'var(--color-forest)' }}>
                {fmtCOP(cabin.price_per_night)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginLeft: 6 }}>
                / noche
              </span>
            </div>

            {/* Calendar */}
            <label className="field-label" style={{ display: 'block', marginBottom: 10 }}>
              Selecciona tus fechas
            </label>
            <Calendar value={dates} onChange={setDates} occupied={blocked} />

            {/* Guests */}
            <div style={{ marginTop: 14 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>Huéspedes</label>
              <select className="field-select" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                {Array.from({ length: cabin.capacity }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
                ))}
              </select>
            </div>

            {/* Price breakdown */}
            {totals && (
              <div style={{
                marginTop: 14, background: 'var(--color-cream)', borderRadius: 12, padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontFamily: 'var(--font-body)',
              }}>
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
                  display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-ink)',
                  borderTop: '1px solid var(--color-bone)', paddingTop: 8, marginTop: 2,
                }}>
                  <span>Total</span><span>{fmtCOP(totals.total)}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleReserve}
              disabled={!checkIn || !checkOut}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 16 }}
            >
              {!checkIn || !checkOut ? 'Selecciona fechas' : 'Reservar ahora →'}
            </button>

            {!user && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)', marginTop: 10 }}>
                <Link to="/login" style={{ color: 'var(--color-moss)', fontWeight: 600 }}>Inicia sesión</Link>{' '}
                para reservar
              </p>
            )}

            {/* Policies */}
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--color-bone)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Cancelación gratuita hasta 7 días antes', 'Check-in 3 PM · Check-out 11 AM', 'No mascotas · No fumar'].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                  <span style={{ color: 'var(--color-fern)', fontWeight: 700, marginTop: 1 }}>✓</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}
