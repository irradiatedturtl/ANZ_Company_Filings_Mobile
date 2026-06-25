import './style.css'
import {
  documentUrl,
  fetchAnnouncements,
  fetchChartTrades,
  fetchMarketAnnouncements,
  fetchQuote,
  fetchTrades,
  unpackColumnar,
} from './api.js'
import { displayCode, formatDateTime } from './format.js'
import {
  renderAnnouncementList,
  renderChartFromTrades,
  renderQuote,
  renderTodayList,
  renderTrades,
} from './render.js'
import { normaliseSymbol, yearOptions } from './url.js'
import {
  loadState,
  saveState,
  loadRecents,
  addRecent,
  loadFavourites,
  isFavourite,
  toggleFavourite,
} from './storage.js'

const els = {
  tickerInput: document.getElementById('ticker-input'),
  yearSelect: document.getElementById('year-select'),
  marketBtns: document.querySelectorAll('.market-btn'),
  goBtn: document.getElementById('go-btn'),
  favBtn: document.getElementById('fav-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  recentsToggle: document.getElementById('recents-toggle'),
  recentsPanel: document.getElementById('recents-panel'),
  favouritesList: document.getElementById('favourites-list'),
  recentsList: document.getElementById('recents-list'),
  errorMsg: document.getElementById('error-msg'),
  mainPanel: document.getElementById('main-panel'),
  loading: document.getElementById('loading'),
  navBtns: document.querySelectorAll('.nav-btn'),
}

let state = loadState()
let currentView = 'news'
let todayPage = 1
let touchStartY = 0
let loadToken = 0

function showError(message) {
  els.errorMsg.textContent = message
  els.errorMsg.classList.toggle('hidden', !message)
}

function setLoading(isLoading) {
  els.loading.classList.toggle('hidden', !isLoading)
}

function syncMarketButtons() {
  els.marketBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.market === state.market)
  })
}

function populateYears() {
  els.yearSelect.innerHTML = yearOptions()
    .map((y) => `<option value="${y}">${y}</option>`)
    .join('')
  els.yearSelect.value = String(state.year)
}

function symbolFromInput() {
  const parsed = normaliseSymbol(els.tickerInput.value, state.market)
  if (!parsed) {
    showError('Enter a valid ticker (e.g. TLS)')
    return null
  }
  showError('')
  return parsed
}

function syncInputsFromState() {
  els.tickerInput.value = displayCode(state.symbol)
  els.yearSelect.value = String(state.year)
  syncMarketButtons()
  updateFavButton()
}

function updateFavButton() {
  const starred = isFavourite(state.symbol)
  els.favBtn.textContent = starred ? '\u2605' : '\u2606'
  els.favBtn.classList.toggle('active', starred)
}

function setActiveNav(view) {
  currentView = view
  els.navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view)
  })
  els.yearSelect.classList.toggle('hidden', view !== 'news')
}

function openDocument(symbol, fileID) {
  window.open(documentUrl(symbol, fileID), '_blank', 'noopener')
}

function renderPanel(content, bind) {
  els.mainPanel.innerHTML = content
  if (bind) bind(els.mainPanel)
  els.mainPanel.scrollTop = 0
}

function renderError(message) {
  renderPanel(`<div class="empty-state error-state"><p>${message}</p></div>`)
}

async function loadView(view = currentView) {
  if (!navigator.onLine) {
    renderError('No connection. Check your network and tap refresh.')
    return
  }

  const token = ++loadToken
  setLoading(true)

  try {
    if (view === 'today') {
      await loadTodayView(token)
      return
    }

    const parsed = symbolFromInput()
    if (!parsed) {
      setLoading(false)
      return
    }

    state.symbol = parsed.symbol
    state.market = parsed.market
    state.year = Number(els.yearSelect.value)
    saveState(state)
    addRecent({ symbol: parsed.symbol, market: parsed.market })
    updateFavButton()
    renderLists()

    switch (view) {
      case 'quote':
        await loadQuoteView(parsed.symbol, token)
        break
      case 'chart':
        await loadChartView(parsed.symbol, token)
        break
      case 'trades':
        await loadTradesView(parsed.symbol, token)
        break
      case 'news':
      default:
        await loadNewsView(parsed.symbol, state.year, token)
    }
  } catch (err) {
    if (token !== loadToken) return
    renderError(err.message || 'Something went wrong loading data.')
  } finally {
    if (token === loadToken) setLoading(false)
  }
}

async function loadNewsView(symbol, year, token) {
  const data = await fetchAnnouncements(symbol, year)
  if (token !== loadToken) return

  const announcements = unpackColumnar(data.items)
  const view = renderAnnouncementList(announcements, symbol, {
    onSelect: (fileID) => openDocument(symbol, fileID),
  })

  const header = `<div class="view-header">
    <h2>${displayCode(symbol)} filings</h2>
    <span class="view-sub">${year} · ${announcements.length} items</span>
  </div>`

  renderPanel(header + view.html, view.bind)
}

async function loadQuoteView(symbol, token) {
  const data = await fetchQuote(symbol)
  if (token !== loadToken) return
  renderPanel(renderQuote(data))
}

async function loadTradesView(symbol, token) {
  const { rows, meta } = await fetchTrades(symbol)
  if (token !== loadToken) return

  const header = `<div class="view-header"><h2>${displayCode(symbol)} trades</h2><span class="view-sub">Today</span></div>`
  renderPanel(header + renderTrades(rows, meta))
}

async function loadChartView(symbol, token) {
  const [quoteData, tradesData] = await Promise.all([
    fetchQuote(symbol),
    fetchChartTrades(symbol),
  ])
  if (token !== loadToken) return

  const header = `<div class="view-header"><h2>${displayCode(symbol)} chart</h2><span class="view-sub">Intraday</span></div>`
  const chart = renderChartFromTrades(tradesData.rows, quoteData.quote)
  renderPanel(header + chart)
}

async function loadTodayView(token) {
  const market = state.market
  const data = await fetchMarketAnnouncements(market, todayPage)
  if (token !== loadToken) return

  const announcements = unpackColumnar(data.items)
  const view = renderTodayList(announcements, {
    onSelectSymbol: (symbol, fileID) => openDocument(symbol, fileID),
  })

  const hasMore = data.page < data.pageCount
  const loadMore = hasMore
    ? `<button type="button" id="load-more-today" class="btn btn-secondary load-more">Load more</button>`
    : ''

  const header = `<div class="view-header">
    <h2>${market.toUpperCase()} today</h2>
    <span class="view-sub">${formatDateTime(new Date().toISOString())}</span>
  </div>`

  renderPanel(header + view.html + loadMore, (root) => {
    view.bind(root)
    const moreBtn = root.querySelector('#load-more-today')
    if (moreBtn) {
      moreBtn.addEventListener('click', async () => {
        todayPage += 1
        setLoading(true)
        try {
          const more = await fetchMarketAnnouncements(market, todayPage)
          const extra = unpackColumnar(more.items)
          const extraView = renderTodayList(extra, {
            onSelectSymbol: (symbol, fileID) => openDocument(symbol, fileID),
          })
          moreBtn.insertAdjacentHTML('beforebegin', extraView.html)
          extraView.bind(root)
          if (more.page >= more.pageCount) moreBtn.remove()
        } catch (err) {
          showError(err.message)
        } finally {
          setLoading(false)
        }
      })
    }
  })
}

function navigate(view = currentView) {
  if (view === 'today') {
    todayPage = 1
    state.todayMarket = state.market
    saveState(state)
    setActiveNav('today')
    loadView('today')
    return
  }

  setActiveNav(view)
  loadView(view)
}

function renderChipList(container, items, emptyText) {
  if (!items.length) {
    container.innerHTML = `<span class="chip-empty">${emptyText}</span>`
    return
  }

  container.innerHTML = items
    .map(
      (item) =>
        `<button type="button" class="chip" data-symbol="${item.symbol}" data-market="${item.market}">${displayCode(item.symbol)}</button>`,
    )
    .join('')

  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.symbol = chip.dataset.symbol
      state.market = chip.dataset.market
      saveState(state)
      syncInputsFromState()
      els.recentsPanel.classList.add('hidden')
      navigate(currentView === 'today' ? 'news' : currentView)
    })
  })
}

function renderLists() {
  renderChipList(els.favouritesList, loadFavourites(), 'No favourites yet')
  renderChipList(els.recentsList, loadRecents(), 'No recents yet')
}

function initEvents() {
  els.goBtn.addEventListener('click', () => navigate('news'))

  els.tickerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate('news')
  })

  els.marketBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.market = btn.dataset.market
      const parsed = normaliseSymbol(els.tickerInput.value, state.market)
      if (parsed) {
        state.symbol = parsed.symbol
        saveState(state)
        els.tickerInput.value = displayCode(parsed.symbol)
      }
      syncMarketButtons()
      if (currentView === 'today') navigate('today')
    })
  })

  els.favBtn.addEventListener('click', () => {
    const parsed = symbolFromInput()
    if (!parsed) return
    toggleFavourite(parsed)
    updateFavButton()
    renderLists()
  })

  els.refreshBtn.addEventListener('click', () => navigate(currentView))

  els.recentsToggle.addEventListener('click', () => {
    els.recentsPanel.classList.toggle('hidden')
    renderLists()
  })

  els.navBtns.forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.view))
  })

  window.addEventListener('online', () => {
    if (!els.mainPanel.innerHTML) navigate(currentView)
  })

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStartY = e.touches[0].clientY
  }, { passive: true })

  els.mainPanel.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStartY = e.touches[0].clientY
  }, { passive: true })

  els.mainPanel.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0]
    const deltaY = touch.clientY - touchStartY
    if (els.mainPanel.scrollTop === 0 && deltaY > 70) {
      navigate(currentView)
    }
  }, { passive: true })
}

function init() {
  populateYears()
  syncInputsFromState()
  initEvents()
  navigate('news')
}

init()
