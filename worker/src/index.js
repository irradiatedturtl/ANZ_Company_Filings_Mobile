const UPSTREAM = 'https://quoteapi.com/api/v5'
const APP_ID = 'da9866271f9d0071'

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), request)
    }

    if (request.method !== 'GET') {
      return withCors(new Response('Method not allowed', { status: 405 }), request)
    }

    const url = new URL(request.url)
    if (url.pathname === '/' || url.pathname === '') {
      return withCors(
        new Response(
          JSON.stringify({
            ok: true,
            message: 'ANZ Filings API proxy — use /api/v5/... paths',
            example: `${url.origin}/api/v5/symbols/tls.asx`,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
        request,
      )
    }

    const path = url.pathname.replace(/^\/api\/v5/, '') || '/'
    const target = new URL(`${UPSTREAM}${path}`)

    url.searchParams.forEach((value, key) => {
      target.searchParams.set(key, value)
    })
    if (!target.searchParams.has('appID')) {
      target.searchParams.set('appID', APP_ID)
    }

    const upstream = await fetch(target.toString(), {
      headers: { Origin: 'https://stocknessmonster.com' },
    })

    const headers = new Headers()
    const contentType = upstream.headers.get('Content-Type')
    if (contentType) headers.set('Content-Type', contentType)
    const cacheControl = upstream.headers.get('Cache-Control')
    if (cacheControl) headers.set('Cache-Control', cacheControl)

    return withCors(new Response(upstream.body, { status: upstream.status, headers }), request)
  },
}

function withCors(response, request) {
  const headers = new Headers(response.headers)
  const origin = request.headers.get('Origin')
  headers.set('Access-Control-Allow-Origin', origin || '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')
  return new Response(response.body, { status: response.status, headers })
}
