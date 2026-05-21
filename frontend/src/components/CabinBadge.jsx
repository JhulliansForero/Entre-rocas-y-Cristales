// Circular cabin badge con doble arco de texto — fiel al handoff
export default function CabinBadge({ cabin, size = 280 }) {
  const id = `badge-${cabin?.id ?? 'default'}`
  const tint = cabin?.tint || 'linear-gradient(135deg,#d7dec6,#fbf8e9)'

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: tint,
        border: '1px solid var(--color-bone)',
        boxShadow: 'inset 0 0 0 4px var(--color-paper), inset 0 0 0 5px var(--color-bone)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Striped placeholder interior */}
        <div className="ph-stripe" style={{
          position: 'absolute', inset: 18, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 6, padding: 24, textAlign: 'center',
        }}>
          <span style={{ fontSize: 10, opacity: .6, letterSpacing: 2 }}>[ FOTO ]</span>
          <span className="font-display-i" style={{ fontSize: Math.max(14, size * 0.065), color: 'var(--color-bark)' }}>
            {cabin?.shortName || cabin?.short_name || cabin?.name}
          </span>
        </div>

        {/* SVG doble arco — superior: nombre, inferior: tagline */}
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <defs>
            <path id={`${id}-top`}
              d={`M ${size*0.16},${size*0.5} a ${size*0.34},${size*0.34} 0 0,1 ${size*0.68},0`} />
            <path id={`${id}-bot`}
              d={`M ${size*0.16},${size*0.5} a ${size*0.34},${size*0.34} 0 0,0 ${size*0.68},0`} />
          </defs>
          <text fontFamily="var(--font-mark)" fontSize={size * 0.052} fill="var(--color-bark)" letterSpacing={size * 0.012}>
            <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
              CABAÑA · {(cabin?.shortName || cabin?.short_name || '').toUpperCase()}
            </textPath>
          </text>
          <text fontFamily="var(--font-mark)" fontSize={size * 0.038} fill="var(--color-bronze)" letterSpacing={size * 0.014}>
            <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle">
              {(cabin?.tagline || '').toUpperCase()}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}
