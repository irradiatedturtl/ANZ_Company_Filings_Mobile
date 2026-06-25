import { documentUrl } from './api.js'
import {
  displayCode,
  formatChange,
  formatDateHeading,
  formatDateTime,
  formatPrice,
  formatVolume,
  monthKey,
} from './format.js'

function changeClass(value) {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

export function renderAnnouncementList(announcements, symbol, { onSelect } = {}) {
  if (!announcements.length) {
    return {
      html: '<div class="empty-state"><p>No announcements found for this year.</p></div>',
      bind() {},
    }
  }

  let lastMonth = ''
  const rows = announcements
    .map((item) => {
      const mk = monthKey(item.time)
      let monthHeader = ''
      if (mk !== lastMonth) {
        lastMonth = mk
        monthHeader = `<div class="month-divider">${formatDateHeading(item.time)}</div>`
      }

      const sensitive = item.priceSensitive ? '<span class="badge sensitive">Sensitive</span>' : ''
      const size = item.fileSize ? `<span class="meta">${Math.round(item.fileSize / 1024)}KB</span>` : ''

      return `${monthHeader}
        <button type="button" class="announcement-card" data-file-id="${item.fileID}">
          <div class="announcement-meta">
            <span class="announcement-date">${formatDateTime(item.time)}</span>
            ${sensitive}
            ${size}
          </div>
          <div class="announcement-title">${escapeHtml(item.heading)}</div>
        </button>`
    })
    .join('')

  const html = `<div class="announcement-list">${rows}</div>`

  return { html, bind(root) {
    root.querySelectorAll('.announcement-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fileID = btn.dataset.fileId
        if (onSelect) {
          onSelect(fileID)
        } else {
          window.open(documentUrl(symbol, fileID), '_blank', 'noopener')
        }
      })
    })
  } }
}

export function renderTodayList(announcements, { onSelectSymbol } = {}) {
  if (!announcements.length) {
    return {
      html: '<div class="empty-state"><p>No market announcements today.</p></div>',
      bind() {},
    }
  }

  const rows = announcements
    .map((item) => {
      const code = displayCode(item.symbol)
      const sensitive = item.priceSensitive ? '<span class="badge sensitive">S</span>' : ''
      return `<button type="button" class="announcement-card today-card" data-symbol="${item.symbol}" data-file-id="${item.fileID}">
        <div class="today-row">
          <span class="ticker-pill">${code}</span>
          <span class="announcement-date">${formatDateTime(item.time)}</span>
          ${sensitive}
        </div>
        <div class="announcement-title">${escapeHtml(item.heading)}</div>
      </button>`
    })
    .join('')

  return { html: `<div class="announcement-list">${rows}</div>`, bind(root) {
    root.querySelectorAll('.today-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { symbol, fileId } = btn.dataset
        if (onSelectSymbol) onSelectSymbol(symbol, fileId)
        else window.open(documentUrl(symbol, fileId), '_blank', 'noopener')
      })
    })
  } }
}

export function renderQuote(data) {
  const q = data.quote || {}
  const cls = changeClass(q.change)
  const name = data.shortName || data.name || displayCode(data.symbol)

  return `<div class="quote-card">
    <div class="quote-header">
      <h2 class="quote-name">${escapeHtml(name)}</h2>
      <span class="quote-code">${displayCode(data.symbol)}</span>
    </div>
    <div class="quote-price ${cls}">$${formatPrice(q.price)}</div>
    <div class="quote-change ${cls}">${formatChange(q.change, q.pctChange)}</div>
    <div class="quote-grid">
      <div class="stat"><span class="label">Bid</span><span class="value">$${formatPrice(q.bid)}</span></div>
      <div class="stat"><span class="label">Ask</span><span class="value">$${formatPrice(q.ask)}</span></div>
      <div class="stat"><span class="label">Open</span><span class="value">$${formatPrice(q.open)}</span></div>
      <div class="stat"><span class="label">High</span><span class="value">$${formatPrice(q.high)}</span></div>
      <div class="stat"><span class="label">Low</span><span class="value">$${formatPrice(q.low)}</span></div>
      <div class="stat"><span class="label">Prev</span><span class="value">$${formatPrice(q.prevClose)}</span></div>
      <div class="stat"><span class="label">Volume</span><span class="value">${formatVolume(q.volume)}</span></div>
      <div class="stat"><span class="label">VWAP</span><span class="value">$${formatPrice(q.vwap)}</span></div>
    </div>
    <p class="quote-delay">Prices delayed 20 minutes</p>
  </div>`
}

export function renderTrades(rows, meta) {
  if (!rows.length) {
    return '<div class="empty-state"><p>No trades for today.</p></div>'
  }

  const body = rows
    .map(
      (t) => `<tr>
        <td>${escapeHtml(t.time)}</td>
        <td>$${formatPrice(t.price)}</td>
        <td>${formatVolume(t.volume)}</td>
      </tr>`,
    )
    .join('')

  const total = meta?.totalTrades ? `<p class="table-footer">${meta.totalTrades} trades today</p>` : ''

  return `<div class="trades-wrap">
    <table class="trades-table">
      <thead><tr><th>Time</th><th>Price</th><th>Vol</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
    ${total}
  </div>`
}

export function renderChartFromTrades(rows, quote) {
  if (!rows.length) {
    return '<div class="empty-state"><p>No chart data available.</p></div>'
  }

  const sampled = downsampleRows(rows, 250)
  const prices = sampled.map((r) => Number(r.price)).filter((p) => !Number.isNaN(p))
  if (!prices.length) {
    return '<div class="empty-state"><p>No chart data available.</p></div>'
  }

  let min = Math.min(...prices)
  let max = Math.max(...prices)

  if (min === max) {
    const qHigh = Number(quote?.high)
    const qLow = Number(quote?.low)
    if (!Number.isNaN(qHigh) && !Number.isNaN(qLow) && qHigh !== qLow) {
      min = qLow
      max = qHigh
    } else {
      const pad = Math.max(min * 0.01, 0.01)
      min -= pad
      max += pad
    }
  }

  const range = max - min || 0.01
  const w = 360
  const h = 180
  const pad = 8

  const points = prices
    .map((p, i) => {
      const x = pad + (i / Math.max(prices.length - 1, 1)) * (w - pad * 2)
      const y = pad + (1 - (p - min) / range) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  const prev = quote?.prevClose
  let prevY = null
  if (prev) {
    prevY = pad + (1 - (prev - min) / range) * (h - pad * 2)
  }

  const prevLine = prevY
    ? `<line x1="${pad}" y1="${prevY}" x2="${w - pad}" y2="${prevY}" class="chart-prev" />`
    : ''

  const flatNote =
    Math.min(...prices) === Math.max(...prices)
      ? ' · limited movement today'
      : ''

  return `<div class="chart-card">
    <div class="chart-labels">
      <span>$${formatPrice(max)}</span>
      <span>$${formatPrice(min)}</span>
    </div>
    <svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Intraday price chart">
      ${prevLine}
      <polyline points="${points}" class="chart-line" />
    </svg>
    <p class="chart-note">Intraday from today's trades (sampled)${flatNote}</p>
  </div>`
}

function downsampleRows(rows, maxPoints) {
  if (rows.length <= maxPoints) return rows
  const step = rows.length / maxPoints
  const result = []
  for (let i = 0; i < maxPoints; i += 1) {
    result.push(rows[Math.floor(i * step)])
  }
  return result
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
