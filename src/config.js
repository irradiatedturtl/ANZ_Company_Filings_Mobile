// Public QuoteAPI app ID used by stocknessmonster.com.
export const QUOTEAPI_APP_ID = 'da9866271f9d0071'

// Local dev uses QuoteAPI directly (localhost/LAN are allowed).
// Production builds set VITE_API_BASE to the Cloudflare Worker proxy.
export const QUOTEAPI_BASE =
  import.meta.env.VITE_API_BASE || 'https://quoteapi.com/api/v5'
