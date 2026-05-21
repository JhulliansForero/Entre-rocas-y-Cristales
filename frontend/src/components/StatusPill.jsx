const CONFIG = {
  active:    { bg: 'rgba(74,119,40,.12)',  color: 'var(--color-ok)',     border: 'rgba(74,119,40,.25)',   label: 'Activa'      },
  cancelled: { bg: 'rgba(184,57,43,.10)', color: 'var(--color-danger)', border: 'rgba(184,57,43,.22)',  label: 'Cancelada'   },
  completed: { bg: 'rgba(122,106,85,.10)', color: 'var(--color-muted)', border: 'rgba(122,106,85,.22)', label: 'Completada'  },
}

export default function StatusPill({ status }) {
  const c = CONFIG[status] ?? CONFIG.completed
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 700,
      letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  )
}
