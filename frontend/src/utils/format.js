export function fmtCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style:                 'currency',
    currency:              'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function fmtDate(d) {
  if (!d) return '—'
  const dt = d instanceof Date ? d : new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function nightsBetween(start, end) {
  if (!start || !end) return 0
  const a = start instanceof Date ? start : new Date(start)
  const b = end   instanceof Date ? end   : new Date(end)
  return Math.max(0, Math.round((b - a) / 86400000))
}

export function calcTotal(pricePerNight, nights) {
  if (!nights) return { subtotal: 0, cleaning: 0, taxes: 0, total: 0 }
  const subtotal = pricePerNight * nights
  const cleaning = 40000
  const taxes    = Math.round(subtotal * 0.08)
  return { subtotal, cleaning, taxes, total: subtotal + cleaning + taxes }
}
