import { QUOTEAPI_APP_ID, QUOTEAPI_BASE } from './config.js'

const MAX_PAGE_SIZE = 100

function buildUrl(path, params = {}) {
  const url = new URL(`${QUOTEAPI_BASE}${path}`)
  url.searchParams.set('appID', QUOTEAPI_APP_ID)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function fetchJson(path, params = {}) {
  const res = await fetch(buildUrl(path, params))
  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg = data?.message || data?.reason || `Request failed (${res.status})`
    throw new Error(msg)
  }

  if (data?.status === 'error' || data?.code === 'BAD_PARAM') {
    throw new Error(data.message || 'API error')
  }

  return data
}

export function unpackColumnar(items) {
  if (!items || typeof items !== 'object' || Array.isArray(items)) {
    return Array.isArray(items) ? items : []
  }
  if (!items.heading && !items.time && !items.price) {
    return []
  }

  const length = Math.max(
    ...Object.values(items)
      .filter(Array.isArray)
      .map((arr) => arr.length),
  )

  return Array.from({ length }, (_, i) => {
    const row = {}
    for (const [key, value] of Object.entries(items)) {
      row[key] = Array.isArray(value) ? value[i] : value
    }
    return row
  })
}

function mergeColumnar(target, source) {
  if (!source) return target
  if (!target) return source

  const merged = { ...target }
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      merged[key] = [...(merged[key] || []), ...value]
    } else {
      merged[key] = value
    }
  }
  return merged
}

export function documentUrl(symbol, fileID) {
  return buildUrl(`/symbols/${symbol}/announcements/${fileID}/document`)
}

export async function fetchQuote(symbol) {
  return fetchJson(`/symbols/${symbol}`)
}

export async function fetchAnnouncements(symbol, year) {
  let page = 1
  let pageCount = 1
  let mergedItems = null

  while (page <= pageCount) {
    const data = await fetchJson(`/symbols/${symbol}/announcements`, {
      year,
      page,
      pageSize: MAX_PAGE_SIZE,
    })

    pageCount = data.pageCount || 1
    mergedItems = mergeColumnar(mergedItems, data.items)
    page += 1
  }

  return {
    symbol,
    items: mergedItems,
    itemCount: mergedItems?.heading?.length || 0,
  }
}

export async function fetchMarketAnnouncements(market, page = 1) {
  return fetchJson(`/markets/${market}/announcements`, {
    range: '1d',
    page,
    pageSize: MAX_PAGE_SIZE,
  })
}

export async function fetchTrades(symbol, page = 1) {
  const data = await fetchJson(`/symbols/${symbol}/trades`, {
    range: '1d',
    page,
    pageSize: MAX_PAGE_SIZE,
  })
  return {
    ...data,
    rows: unpackColumnar(data.trades?.items),
    meta: data.trades,
  }
}
