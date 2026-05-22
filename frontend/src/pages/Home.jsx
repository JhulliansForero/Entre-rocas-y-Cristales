import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCabins, getHeroImages } from '../services/cabins'
import { fmtCOP } from '../utils/format'
import SectionEyebrow from '../components/SectionEyebrow'
import CabinBadge from '../components/CabinBadge'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

/* ── Fotos de paisaje para el hero (estáticas, no dependen de la API) ── */
const HERO_IMGS = [
  'https://jforeros.online/media/hero/562902104.jpg',
  'https://jforeros.online/media/hero/562902239.jpg',
  'https://jforeros.online/media/hero/562907028.jpg',
  'https://jforeros.online/media/hero/347870371.jpg',
  'https://jforeros.online/media/hero/424731102.jpg',
  'https://jforeros.online/media/hero/343374770.jpg',
]

/* ── Iconos inline SVG ── */
const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const PILLARS = [
  { icon: 'M4 20s8-2 12-6 6-12 6-12-8 0-12 6-6 12-6 12z M8 16c4-4 8-6 14-8', title: 'Bajo impacto', body: 'Aguas grises filtradas, baños composteros y construcción en madera certificada.' },
  { icon: 'M9 3v10M5 7v9a4 4 0 004 4h6a4 4 0 004-4V9M13 3v8M17 5v6', title: 'Hecho a mano', body: 'Telares boyacenses, cerámica de Ráquira y mobiliario diseñado en taller propio.' },
  { icon: 'M3 19l5-8 4 6 3-4 6 6H3z M9 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', title: 'Privacidad', body: 'Cada cabaña tiene al menos 80 m hasta la siguiente. Nunca verás a otro huésped si no quieres.' },
  { icon: 'M5 4h10v8a5 5 0 01-5 5 5 5 0 01-5-5V4z M15 6h2a3 3 0 010 6h-2', title: 'Mesa boyacense', body: 'Cocina con producto del valle. Desayuno incluido, cenas opcionales por encargo.' },
]

export default function Home() {
  const navigate = useNavigate()
  const [cabins,    setCabins]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [heroImgs,  setHeroImgs]  = useState(HERO_IMGS)  // fallback estático
  const [slideIdx,  setSlideIdx]  = useState(0)
  const [slideIn,   setSlideIn]   = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    getCabins()
      .then(r => { const list = r.data.results ?? r.data; setCabins(list) })
      .catch(() => {})
      .finally(() => setLoading(false))
    // Cargar imágenes del hero desde la API; si falla, usar las estáticas
    getHeroImages()
      .then(r => {
        const imgs = (r.data.results ?? r.data)
          .filter(img => img.active)
          .map(img => img.image_url)
          .filter(Boolean)
        if (imgs.length > 0) setHeroImgs(imgs)
      })
      .catch(() => {}) // fallback: HERO_IMGS estático ya está en el estado inicial
  }, [])

  /* Rotación hero cada 6 s con crossfade lento */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlideIn(false)
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % heroImgs.length)
        setSlideIn(true)
      }, 700)
    }, 6000)
    return () => clearInterval(timerRef.current)
  }, [])


  return (
    <div style={{ background: 'var(--color-cream)' }}>

      {/* ── HERO ── */}
      <section className="rg-hero-section rg-px" style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 48, paddingBottom: 32 }}>
        <div className="rg-hero">
          {/* Left */}
          <div>
            <SectionEyebrow>Alojamiento rural · Boyacá</SectionEyebrow>
            <h1 className="font-display" style={{ fontSize: 'clamp(48px, 5.5vw, 76px)', lineHeight: 1.02, margin: '20px 0 24px', letterSpacing: '-0.02em', color: 'var(--color-bark)' }}>
              Un refugio
              <br />
              <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>entre rocas, cristales</span>
              <br />
              y silencio profundo.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--color-muted)', maxWidth: 460, marginBottom: 36 }}>
              Cuatro cabañas únicas escondidas en un valle de minerales y bosque alto en Ráquira, Boyacá. Sin recepción, sin pantallas: solo madera, roca y el sonido del riachuelo.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/cabinas')}>Ver disponibilidad</button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/cabinas')}>Conocer las cabañas →</button>
            </div>

            {/* Trust strip */}
            <div className="rg-trust" style={{ marginTop: 56, display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
              <Stat n="4.96" label="rating promedio" />
              <div className="rg-trust-div" style={{ width: 1, height: 36, background: 'var(--color-bone)' }} />
              <Stat n="4" label="cabañas únicas" />
              <div className="rg-trust-div" style={{ width: 1, height: 36, background: 'var(--color-bone)' }} />
              <Stat n="2.8k+" label="huéspedes desde 2021" />
            </div>
          </div>

          {/* Right — slideshow */}
          <div className="rg-hero-img">
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 32,
              overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
              background: 'var(--color-bark)',
            }}>
              {heroImgs.map((src, i) => (
                <img key={src} src={src} alt="Entre Rocas y Cristales"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    opacity: i === slideIdx ? (slideIn ? 1 : 0) : 0,
                    transition: 'opacity 0.8s ease',
                  }}
                />
              ))}
              {/* Gradiente sutil */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,.25) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />
              {/* Dots */}
              <div style={{
                position: 'absolute', bottom: 16, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 6,
              }}>
                {heroImgs.map((_, i) => (
                  <button key={i}
                    onClick={() => { setSlideIn(false); setTimeout(() => { setSlideIdx(i); setSlideIn(true) }, 400) }}
                    style={{
                      width: i === slideIdx ? 20 : 6, height: 6,
                      borderRadius: 3, border: 0, cursor: 'pointer', padding: 0,
                      background: i === slideIdx ? 'white' : 'rgba(255,255,255,.45)',
                      transition: 'width .25s, background .25s',
                    }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll hint */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 32 }}>
        <div className="scroll-hint">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          Descubrir
        </div>
      </div>

      {/* ── AVAILABILITY BAR ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto' }} className="rg-px">
        <AvailabilityBar onSearch={() => navigate('/cabinas')} />
      </section>

      {/* ── CABIN GRID ── */}
      <section style={{ maxWidth: 1280, margin: '96px auto 0' }} className="rg-px">
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <SectionEyebrow>Nuestras cabañas</SectionEyebrow>
            <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', margin: '12px 0 6px', letterSpacing: '-.02em' }}>
              Cuatro refugios.{' '}
              <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>Una sola montaña.</span>
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 16, maxWidth: 540, margin: 0 }}>
              Cada cabaña fue diseñada para un tipo de descanso distinto. Elige la que más te llame.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cabinas')}>Ver todas →</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="rg-swipe">
              {cabins.map(c => <HomeCabinCard key={c.id || c.slug} cabin={c} onClick={() => navigate(`/cabinas/${c.id || c.slug}`)} />)}
            </div>
          </>
        )}
      </section>

      {/* ── PHILOSOPHY ── */}
      <section style={{ maxWidth: 1280, margin: '120px auto 0' }} className="rg-px">
        <div className="rg-philosophy rg-phil-pad" style={{
          background: 'var(--color-paper)', borderRadius: 32,
          border: '1px solid var(--color-bone)',
        }}>
          <div>
            <SectionEyebrow>Filosofía</SectionEyebrow>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px, 3vw, 44px)', margin: '12px 0 18px', lineHeight: 1.1 }}>
              Diseñamos cada estancia para que{' '}
              <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>no haga falta nada más</span>.
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 15 }}>
              Trabajamos con artesanos locales, energía solar y arquitectura que respeta la geología del lugar.
              Nuestras cabañas son privadas, sin vecinos a la vista.
            </p>
          </div>
          <div className="rg-pillars">
            {PILLARS.map(p => (
              <div key={p.title}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-fern)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon d={p.icon} />
                </div>
                <div className="font-display" style={{ fontSize: 20, marginBottom: 6 }}>{p.title}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display" style={{ fontSize: 32, color: 'var(--color-bark)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--color-faint)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function HomeCabinCard({ cabin, wide, onClick }) {
  const tagline  = cabin.tagline
  const price    = Number(cabin.price_per_night || cabin.price || 0)
  const rating   = cabin.rating
  const reviews  = cabin.reviews_count || cabin.reviews
  const imgUrl   = cabin.main_image_url

  return (
    <button onClick={onClick}
      className={wide ? 'rg-cabin-wide' : ''}
      style={{
        background: 'var(--color-snow)', border: '1px solid var(--color-bone)',
        borderRadius: 24, padding: 0,
        textAlign: 'left', cursor: 'pointer',
        transition: 'transform .2s ease, box-shadow .2s ease',
        display: wide ? undefined : 'flex',
        flexDirection: wide ? undefined : 'column',
        alignItems: 'stretch',
        width: '100%', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

      {/* Image */}
      <div className={wide ? 'rg-cabin-wide-img' : ''}
        style={{
          flex: 'none',
          width: wide ? undefined : '100%',
          height: wide ? undefined : 180,
          background: 'var(--color-paper)',
          position: 'relative', overflow: 'hidden',
        }}>
        {imgUrl ? (
          <img src={imgUrl} alt={cabin.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 180 }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 180 }}>
            <CabinBadge cabin={cabin} size={160} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="stars">★★★★★</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{rating} · {reviews} reseñas</span>
          </div>
          <div className="font-display" style={{ fontSize: 24, lineHeight: 1.1 }}>{cabin.name}</div>
          <div className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 15, marginTop: 2 }}>{tagline}</div>
          {wide && (
            <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '10px 0 0', lineHeight: 1.6 }}>
              {(cabin.description || '').split('.')[0]}.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 16, borderTop: '1px dashed var(--color-bone)' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-faint)', letterSpacing: '.08em', textTransform: 'uppercase' }}>desde</div>
            <div className="font-display" style={{ fontSize: 21, color: 'var(--color-forest)' }}>
              {fmtCOP(price)} <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>/ noche</span>
            </div>
          </div>
          <span style={{ color: 'var(--color-bark)', fontSize: 13, fontWeight: 600 }}>Ver detalles →</span>
        </div>
      </div>
    </button>
  )
}

function AvailabilityBar({ onSearch }) {
  return (
    <div className="rg-avail" style={{
      background: 'var(--color-snow)', borderRadius: 20,
      border: '1px solid var(--color-bone)', boxShadow: 'var(--shadow-md)',
      padding: 14,
    }}>
      <BarField label="Cabaña"    value="Cualquier cabaña"  icon="M3 11l9-7 9 7v9H3z M8 20v-6h8v6" />
      <BarField label="Llegada"   value="Selecciona fecha"  icon="M3 6h18v15H3z M3 10h18 M8 3v4 M16 3v4" />
      <BarField label="Salida"    value="Selecciona fecha"  icon="M3 6h18v15H3z M3 10h18 M8 3v4 M16 3v4" />
      <BarField label="Huéspedes" value="2 adultos"         icon="M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0" />
      <button className="btn btn-primary" onClick={onSearch} style={{ borderRadius: 14, padding: '0 26px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        Buscar
      </button>
    </div>
  )
}

function BarField({ label, value, icon }) {
  return (
    <button style={{
      background: 'transparent', border: 0, textAlign: 'left', padding: '10px 16px',
      borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ color: 'var(--color-bronze)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 10, color: 'var(--color-bronze)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
        <span style={{ display: 'block', fontSize: 14, color: 'var(--color-bark)', fontWeight: 500 }}>{value}</span>
      </span>
    </button>
  )
}
