import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCabins } from '../services/cabins'
import { fmtCOP } from '../utils/format'
import SectionEyebrow from '../components/SectionEyebrow'
import Spinner from '../components/Spinner'
import Footer from '../components/Footer'

export default function AdminCabins() {
  const navigate = useNavigate()
  const [cabins,  setCabins]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCabins()
      .then(r => setCabins(r.data.results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <SectionEyebrow>Panel admin · Cabañas</SectionEyebrow>
            <h1 className="font-display" style={{ fontSize: 'clamp(32px, 4vw, 52px)', margin: '12px 0 0', letterSpacing: '-.02em' }}>
              Gestionar <span className="font-display-i" style={{ color: 'var(--color-moss)' }}>cabañas</span>
            </h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/cabanas/nueva')}
            style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            + Nueva cabaña
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="lg" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cabins.map(c => (
              <div key={c.id} style={{
                background: 'var(--color-snow)',
                border: '1px solid var(--color-bone)',
                borderRadius: 20,
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                alignItems: 'center',
                gap: 20,
                padding: 16,
                overflow: 'hidden',
              }}>
                {/* Cover thumb */}
                <div style={{
                  width: 120, height: 90, borderRadius: 12, overflow: 'hidden',
                  background: 'var(--color-paper)',
                  flexShrink: 0,
                }}>
                  {c.main_image_url ? (
                    <img src={c.main_image_url} alt={c.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-faint)', fontSize: 28 }}>🏕</div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="font-display" style={{ fontSize: 20 }}>{c.name}</div>
                  <div className="font-display-i" style={{ color: 'var(--color-moss)', fontSize: 13, marginTop: 2 }}>{c.tagline}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                    <span>👥 {c.capacity} personas</span>
                    <span>🛏 {c.bedrooms} {Number(c.bedrooms) === 1 ? 'cama' : 'camas'}</span>
                    <span>💰 {fmtCOP(c.price_per_night)} / noche</span>
                    <span style={{ color: c.is_available ? 'var(--color-ok)' : 'var(--color-danger)' }}>
                      {c.is_available ? '✓ Disponible' : '✗ No disponible'}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/admin/cabanas/${c.id}`)}
                  style={{ whiteSpace: 'nowrap' }}>
                  Gestionar fotos →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
