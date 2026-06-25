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

## Quick start

```bash
cd sm-mobile-shell
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

## Deploy to GitHub Pages (free, works anywhere)

The app deploys as a **website** that can also be **installed** via Add to Home Screen (PWA manifest included).

1. Create a new **public** GitHub repo named `sm-mobile-shell` (or any name — the workflow uses the repo name as the URL path).

2. Push this project:

```bash
cd sm-mobile-shell
git init
git add .
git commit -m "Initial commit: SM Mobile PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sm-mobile-shell.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

4. After the workflow finishes (~1 min), your app is live at:

`https://YOUR_USERNAME.github.io/sm-mobile-shell/`

Open that URL on your phone and use **Add to Home Screen** — it works on mobile data, no PC required.

### Local build matching GitHub Pages paths

```bash
# Windows PowerShell
$env:BASE_PATH="/sm-mobile-shell/"; npm run build
```

## Cost

$0 — Vite, GitHub Pages, no backend.
