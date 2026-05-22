import { Link } from 'react-router-dom'
import Wordmark from './Wordmark'

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: 'var(--color-fern)', marginBottom: 18 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} style={{ color: 'inherit', textDecoration: 'none', fontSize: 14, opacity: .85 }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-forest)', color: 'var(--color-paper)', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 64, paddingBottom: 32 }} className="rg-px">
        <div className="rg-footer">
          <div>
            <Wordmark size="lg" variant="light" />
            <p className="font-display-i" style={{ marginTop: 24, fontSize: 18, lineHeight: 1.5, opacity: .85, maxWidth: 320 }}>
              Cinco cabañas escondidas entre cristales, bosque y silencio. Refugio para quienes regresan a lo esencial.
            </p>
          </div>
          <FooterCol title="Reserva" links={[[' Disponibilidad', '/cabinas'], ['Mi reserva', '/perfil'], ['Cancelación', '#'], ['Cabañas', '/cabinas']]} />
          <FooterCol title="Estancia" links={[['Experiencias', '#'], ['Gastronomía', '#'], ['Cómo llegar', '#'], ['Galería', '#']]} />
          <FooterCol title="Contacto" links={[['+57 310 482 9134', '#'], ['reservas@entrerocas.co', '#'], ['Vereda La Esmeralda, Boyacá', '#'], ['@entrerocasycristales', '#']]} />
        </div>
        <div style={{
          marginTop: 56, paddingTop: 24,
          borderTop: '1px solid rgba(248,245,232,.14)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          fontSize: 12, opacity: .65,
        }}>
          <span>© {new Date().getFullYear()} Entre Rocas y Cristales · Alojamiento rural sostenible</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <a href="#" style={{ color: 'inherit' }}>Términos</a>
            <a href="#" style={{ color: 'inherit' }}>Privacidad</a>
            <a href="#" style={{ color: 'inherit' }}>Cookies</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
