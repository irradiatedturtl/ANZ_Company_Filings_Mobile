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

Fetches from the same QuoteAPI endpoints used by [stocknessmonster.com](https://stocknessmonster.com/). The public app ID only allows browser requests from `stocknessmonster.com`, `localhost`, and private LAN IPs — **not** from `github.io`. A tiny free Cloudflare Worker proxy is required for the deployed site.

## Live site

**https://irradiatedturtl.github.io/ANZ_Company_Filings_Mobile/**

Open on your phone and use **Add to Home Screen** for an app-like experience.

## Quick start (local dev)

```bash
cd ANZ_Company_Filings_Mobile
npm install
npm run dev
```

On your phone (same Wi‑Fi), open the network URL shown in the terminal. Local/LAN dev talks to QuoteAPI directly — no proxy needed.

## Deploy the API proxy (required for GitHub Pages)

One-time setup — free Cloudflare Workers tier:

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

This deploys to `https://anz-filings-proxy.stoxx.workers.dev`. If you use a different worker name or subdomain, update `VITE_API_BASE` in `.github/workflows/deploy.yml`.

**Alternative (if you have Iguana2 access):** ask to whitelist `https://irradiatedturtl.github.io` on the QuoteAPI app ID, then remove the proxy and set `VITE_API_BASE` back to `https://quoteapi.com/api/v5`.

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

### Local build matching GitHub Pages paths

```powershell
$env:BASE_PATH="/ANZ_Company_Filings_Mobile/"
$env:VITE_API_BASE="https://anz-filings-proxy.stoxx.workers.dev/api/v5"
npm run build
```

## Deploy to GitHub Pages

Deployed automatically on push to `main` via GitHub Actions.

1. Deploy the Cloudflare Worker proxy first (see above)
2. **Settings → Pages → Source: GitHub Actions** (one-time setup)
3. Push to `main` — live at `https://irradiatedturtl.github.io/ANZ_Company_Filings_Mobile/`

## Cost

$0 — Vite, GitHub Pages, Cloudflare Workers free tier.
