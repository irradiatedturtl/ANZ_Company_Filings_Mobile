export function displayCode(symbol) {
  if (!symbol) return ''
  return symbol.split('.')[0].toUpperCase()
}

export function formatPrice(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(digits)
}

export function formatChange(change, pct) {
  const sign = change > 0 ? '+' : ''
  return `${sign}${formatPrice(change)} (${sign}${formatPrice(pct)}%)`
}

export function formatVolume(value) {
  if (!value) return '—'
  const n = Number(value)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateHeading(value) {
  if (!value) return ''
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function monthKey(value) {
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return `${d.getFullYear()}-${d.getMonth()}`
}
