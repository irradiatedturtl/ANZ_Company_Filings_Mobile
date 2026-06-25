const RECENTS_KEY = 'sm-recents'
const FAVOURITES_KEY = 'sm-favourites'
const STATE_KEY = 'sm-state'
const MAX_RECENTS = 10

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadState() {
  return readJson(STATE_KEY, {
    symbol: 'tls.asx',
    market: 'asx',
    year: new Date().getFullYear(),
    todayMarket: 'asx',
  })
}

export function saveState(state) {
  writeJson(STATE_KEY, state)
}

export function loadRecents() {
  return readJson(RECENTS_KEY, [])
}

export function addRecent(entry) {
  const recents = loadRecents().filter((r) => r.symbol !== entry.symbol)
  recents.unshift(entry)
  writeJson(RECENTS_KEY, recents.slice(0, MAX_RECENTS))
}

export function loadFavourites() {
  return readJson(FAVOURITES_KEY, [])
}

export function isFavourite(symbol) {
  return loadFavourites().some((f) => f.symbol === symbol)
}

export function toggleFavourite(entry) {
  const favourites = loadFavourites()
  const index = favourites.findIndex((f) => f.symbol === entry.symbol)
  if (index >= 0) {
    favourites.splice(index, 1)
  } else {
    favourites.unshift(entry)
  }
  writeJson(FAVOURITES_KEY, favourites)
  return index < 0
}
