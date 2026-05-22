import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Wordmark, { Monogram } from './Wordmark'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen,   setUserOpen]   = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(251,248,233,0.86)',
      backdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: '1px solid var(--color-bone)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '18px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ background: 'none', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Monogram size={42} />
          <Wordmark size="md" />
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
          {[['/', 'Inicio'], ['/cabinas', 'Cabañas']].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'}
              style={({ isActive }) => ({
                background: 'none', border: 0, cursor: 'pointer',
                padding: '10px 16px', borderRadius: 999,
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                color: isActive ? 'var(--color-forest)' : 'var(--color-bark)',
                textDecoration: 'none', position: 'relative',
                display: 'flex', alignItems: 'center',
              })}>
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: '50%', bottom: 2,
                      transform: 'translateX(-50%)',
                      width: 4, height: 4, borderRadius: '50%',
                      background: 'var(--color-moss)',
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin/reservas"
              style={({ isActive }) => ({
                background: 'none', border: 0, cursor: 'pointer',
                padding: '10px 16px', borderRadius: 999,
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                color: isActive ? 'var(--color-forest)' : 'var(--color-bark)',
                textDecoration: 'none',
              })}>
              Panel
            </NavLink>
          )}
        </nav>

        {/* Desktop auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden md:flex">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary btn-sm"
                onClick={() => setUserOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--color-amber)', color: 'white',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {user.role === 'admin' ? 'AD' : (user.first_name?.[0] || 'U')}
                </span>
                {user.role === 'admin' ? 'Admin' : user.first_name || 'Mi cuenta'}
              </button>
              {userOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--color-snow)',
                  border: '1px solid var(--color-bone)',
                  borderRadius: 16, padding: '6px',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 180, zIndex: 50,
                }}>
                  <Link to="/perfil" onClick={() => setUserOpen(false)}
                    style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-ink)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                    Mi perfil
                  </Link>
                  {user.role === 'admin' && (<>
                    <Link to="/admin/reservas" onClick={() => setUserOpen(false)}
                      style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-ink)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                      Reservas
                    </Link>
                    <Link to="/admin/cabanas" onClick={() => setUserOpen(false)}
                      style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-ink)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                      Gestionar cabañas
                    </Link>
                    <Link to="/admin/analiticas" onClick={() => setUserOpen(false)}
                      style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-ink)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                      Análisis de ventas
                    </Link>
                    <Link to="/admin/hero" onClick={() => setUserOpen(false)}
                      style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-ink)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                      Fotos del inicio
                    </Link>
                  </>)}
                  <button onClick={() => { setUserOpen(false); handleLogout() }}
                    style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 14, color: 'var(--color-danger)', background: 'none', border: 0, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-body)' }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Iniciar sesión</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Crear cuenta</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden btn btn-icon btn-ghost" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--color-bone)',
          background: 'var(--color-paper)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[['/', 'Inicio'], ['/cabinas', 'Cabañas']].map(([path, label]) => (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--color-bone)', margin: '8px 0' }} />
          {user ? (
            <>
              <Link to="/perfil" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Mi perfil</Link>
              {user.role === 'admin' && (<>
                <div style={{ height: 1, background: 'var(--color-bone)', margin: '4px 0' }} />
                <Link to="/admin/reservas" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Reservas</Link>
                <Link to="/admin/cabanas" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Gestionar cabañas</Link>
                <Link to="/admin/analiticas" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Análisis de ventas</Link>
                <Link to="/admin/hero" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Fotos del inicio</Link>
                <div style={{ height: 1, background: 'var(--color-bone)', margin: '4px 0' }} />
              </>)}
              <button onClick={() => { setMobileOpen(false); handleLogout() }} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-danger)', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--color-bark)', textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ borderRadius: 12, justifyContent: 'center' }}>Crear cuenta</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
