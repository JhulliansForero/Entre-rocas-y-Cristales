import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCabins } from '../services/cabins'
import { fmtCOP } from '../utils/format'
import SectionEyebrow from '../components/SectionEyebrow'
import CabinBadge from '../components/CabinBadge'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'

function Spec({ icon, v }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--color-bronze)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      {v}
    </span>
  )
}

export default function Catalog() {
  const navigate = useNavigate()
  const [allCabins, setAllCabins] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [sort,      setSort]      = useState('featured')
  const [filter,    setFilter]    = useState('all')

  useEffect(() => {
    getCabins()
      .then(r => setAllCabins(r.data.results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const list = useMemo(() => {
    let l = [...allCabins]
    if (filter === 'couples') l = l.filter(c => Number(c.capacity) <= 2)
    if (filter === 'family')  l = l.filter(c => Number(c.capacity) > 2)
    if (sort === 'price-asc')  l.sort((a, b) => Number(a.price_per_night) - Number(b.price_per_night))
    if (sort === 'price-desc') l.sort((a, b) => Number(b.price_per_night) - Number(a.price_per_night))
    if (sort === 'rating')     l.sort((a, b) => Number(b.rating) - Number(a.rating))
    return l
  }, [allCabins, sort, filter])

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <SectionEyebrow>Catálogo · {allCabins.length} cabañas</SectionEyebrow>
            <h1 className="font-display" style={{ fontSize: 'clamp(40px, 4.5vw, 64px)', margin: '12px 0 8px', letterSpacing: '-.02em' }}>
              Nuestras <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>cabañas</span>
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 16, maxWidth: 580, margin: 0 }}>
              Todas tienen baño privado, desayuno y acceso a senderos. Lo demás es cuestión de qué tipo de descanso buscas.
            </p>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--color-bone)', borderBottom: '1px solid var(--color-bone)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all','Todas'],['couples','Para parejas'],['family','Grupos y familia']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                background: filter === k ? 'var(--color-forest)' : 'transparent',
                color: filter === k ? 'var(--color-paper)' : 'var(--color-bark)',
                border: 0, padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--color-muted)' }}>
            <span>{list.length} cabañas</span>
            <span style={{ color: 'var(--color-bone)' }}>·</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Ordenar por
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="field-select"
                style={{ padding: '6px 14px', width: 'auto', fontSize: 13, borderRadius: 999 }}>
                <option value="featured">Destacadas</option>
                <option value="rating">Mejor valoradas</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 32px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>No hay cabañas con ese filtro.</p>
            <button className="btn btn-secondary" onClick={() => setFilter('all')}>Ver todas</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 28 }}>
            {list.map(c => (
              <CatalogCard key={c.id || c.slug} cabin={c}
                onClick={() => navigate(`/cabinas/${c.id || c.slug}`)} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

function CatalogCard({ cabin, onClick }) {
  const price   = Number(cabin.price_per_night || cabin.price || 0)
  const rating  = cabin.rating
  const reviews = cabin.reviews_count || cabin.reviews
  const imgUrl  = cabin.main_image_url

  return (
    <div style={{
      background: 'var(--color-snow)', border: '1px solid var(--color-bone)',
      borderRadius: 24, overflow: 'hidden', display: 'grid', gridTemplateColumns: '260px 1fr',
    }}>
      <div style={{ position: 'relative', minHeight: 220, overflow: 'hidden', background: 'var(--color-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={cabin.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CabinBadge cabin={cabin} size={220} />
        )}
      </div>
      <div style={{ padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="stars">★★★★★</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{rating} · {reviews}</span>
            <span className="pill pill-ok" style={{ marginLeft: 'auto' }}>Disponible</span>
          </div>
          <div className="font-display" style={{ fontSize: 24, lineHeight: 1.1 }}>{cabin.name}</div>
          <div className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 14, marginTop: 2, marginBottom: 12 }}>{cabin.tagline}</div>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', margin: '0 0 14px' }}>
            {(cabin.description || '').split('.')[0]}.
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-bark)', flexWrap: 'wrap' }}>
            <Spec icon="M3 10v7 M21 10v7 M3 14h18 M5 10a3 3 0 013-3h4v3 M5 14V7" v={`${cabin.bedrooms} ${Number(cabin.bedrooms) === 1 ? 'cama' : 'camas'}`} />
            <Spec icon="M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0" v={`${cabin.capacity} pers.`} />
            <Spec icon="M4 20l16-16 M8 8l2 2 M11 11l2 2 M14 14l2 2 M5 17l2 2" v={`${cabin.size_sqm || cabin.size} m²`} />
            <Spec icon="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z M12 11a2 2 0 100-4 2 2 0 000 4z" v={(cabin.location || '').split('·')[0].trim()} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 18, borderTop: '1px dashed var(--color-bone)' }}>
          <div>
            <div className="font-display" style={{ fontSize: 22, color: 'var(--color-forest)' }}>{fmtCOP(price)}</div>
            <div style={{ fontSize: 11, color: 'var(--color-faint)' }}>por noche · imp. incluidos</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onClick}>Ver cabaña →</button>
        </div>
      </div>
    </div>
  )
}
