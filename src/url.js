export const BASE_URL = 'https://stocknessmonster.com'

export function normaliseSymbol(input, marketHint = 'asx') {
  const raw = input.trim().toLowerCase().replace(/\s/g, '')
  if (!raw) return null

  if (raw.includes('.')) {
    const [code, market] = raw.split('.')
    if (!code || !market || !/^[a-z0-9]+$/.test(code) || !/^[a-z]+$/.test(market)) {
      return null
    }
    return { symbol: `${code}.${market}`, market }
  }

  if (!/^[a-z0-9]+$/.test(raw)) return null
  return { symbol: `${raw}.${marketHint}`, market: marketHint }
}

export function buildUrl(path) {
  return `${BASE_URL}${path}`
}

export function buildNewsUrl(symbol, year) {
  return buildUrl(`/news/${symbol}/${year}/`)
}

export function buildQuoteUrl(symbol) {
  return buildUrl(`/quotes/${symbol}`)
}

export function buildChartUrl(symbol) {
  return buildUrl(`/charts/${symbol}`)
}

export function buildTradesUrl(symbol) {
  return buildUrl(`/trades/${symbol}`)
}

export function buildNewsTodayUrl(market) {
  return buildUrl(`/newstoday/${market}/`)
}

export function yearOptions(startYear = 2015) {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current; y >= startYear; y -= 1) {
    years.push(y)
  }
  return years
}
