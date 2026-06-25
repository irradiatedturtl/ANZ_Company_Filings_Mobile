# SM Mobile Shell

A personal mobile app (PWA) for browsing ASX/NZX market data with a native mobile UI. Built for personal use — no login, no changes to stocknessmonster.com.

## Features

- Native mobile UI (not an iframe of the desktop site)
- Ticker search with ASX / NZX toggle
- **News** — company filings by year, full-width readable titles
- **Quote** — price, bid/ask, volume, high/low
- **Chart** — simplified intraday line chart
- **Trades** — today's trade list
- **Today** — market-wide announcements with load more
- Tap any filing to open the PDF in a new tab
- Recents and favourites stored locally on your device

## Data source

Fetches from the same QuoteAPI endpoints used by [stocknessmonster.com](https://stocknessmonster.com/) (public browser API, CORS-enabled). No server required.

## Live site

**https://irradiatedturtl.github.io/ANZ_Company_Filings_Mobile/**

Open on your phone and use **Add to Home Screen** for an app-like experience.

## Quick start (local dev)

```bash
cd ANZ_Company_Filings_Mobile
npm install
npm run dev
```

On your phone (same Wi‑Fi), open the network URL shown in the terminal.

## Install on your phone

### iPhone (Safari)

Share → **Add to Home Screen**

### Android (Chrome)

Menu → **Add to Home screen** / **Install app**

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

Deployed automatically on push to `main` via GitHub Actions.

1. **Settings → Pages → Source: GitHub Actions** (one-time setup)
2. Push to `main` — live at `https://irradiatedturtl.github.io/ANZ_Company_Filings_Mobile/`

### Local build matching GitHub Pages paths

```powershell
$env:BASE_PATH="/ANZ_Company_Filings_Mobile/"; npm run build
```

## Cost

$0 — Vite, GitHub Pages, no backend.
