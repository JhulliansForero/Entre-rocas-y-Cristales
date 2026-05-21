// Wordmark del handoff: "Entre rocas" italic display + "Y CRISTALES" Marcellus small caps
export default function Wordmark({ size = 'md', variant = 'ink' }) {
  const scales = { sm: 0.7, md: 1, lg: 1.45, xl: 1.9 }
  const s = scales[size] || 1
  const color  = variant === 'light' ? 'var(--color-paper)' : 'var(--color-ink)'
  const accent = variant === 'light' ? 'var(--color-fern)'  : 'var(--color-moss)'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color }}>
      <span className="font-display-i" style={{ fontSize: 26 * s, fontWeight: 500 }}>Entre rocas</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 * s, marginTop: 2 * s }}>
        <span style={{ height: 1, width: 16 * s, background: accent, opacity: .8 }} />
        <span className="font-mark" style={{ fontSize: 9 * s, letterSpacing: 4 * s, color: accent, fontWeight: 600 }}>Y CRISTALES</span>
        <span style={{ height: 1, width: 16 * s, background: accent, opacity: .8 }} />
      </span>
    </div>
  )
}

export function Monogram({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 0 0 2px var(--color-bone)',
    }}>
      <img src="/logo.jpg" alt="Entre Rocas y Cristales"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}
