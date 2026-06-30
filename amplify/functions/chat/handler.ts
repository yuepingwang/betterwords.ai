// ------------------------------------------------------------------
// Deployed OpenAI relay — the Lambda twin of server/index.js.
//
// Exposed via a Lambda Function URL (see ../../backend.ts), it answers the
// same two routes the client already uses:
//
//   GET  /api/health  ->  { ok, ai, model }
//   POST /api/chat    { messages, json? }  ->  { content }
//
// The key lives only in process.env (an Amplify secret), so it never reaches
// the browser. Uses global fetch (Node 18+) instead of the OpenAI SDK to keep
// the bundle tiny.
// ------------------------------------------------------------------

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const KEY = process.env.OPENAI_API_KEY

const cors: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
}

function reply(statusCode: number, obj: unknown) {
  return { statusCode, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(obj) }
}

export const handler = async (event: any) => {
  const method = event?.requestContext?.http?.method || 'GET'
  const path = event?.rawPath || event?.requestContext?.http?.path || '/'

  if (method === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' }

  // Health check — lets the UI show "AI on" vs. the deterministic fallback.
  if (path.endsWith('/api/health')) {
    return reply(200, { ok: true, ai: Boolean(KEY), model: MODEL })
  }

  if (path.endsWith('/api/chat') && method === 'POST') {
    if (!KEY) return reply(503, { error: 'OPENAI_API_KEY not set — running in mock mode.' })

    let payload: any
    try {
      payload = JSON.parse(event?.body || '{}')
    } catch {
      return reply(400, { error: 'invalid JSON body' })
    }
    const { messages, json } = payload
    if (!Array.isArray(messages) || messages.length === 0) {
      return reply(400, { error: 'messages[] required' })
    }

    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1600,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
      })
      if (!r.ok) {
        const detail = await r.text()
        console.error('[openai]', r.status, detail.slice(0, 300))
        return reply(502, { error: `OpenAI request failed (${r.status})` })
      }
      const data: any = await r.json()
      return reply(200, { content: data?.choices?.[0]?.message?.content ?? '' })
    } catch (err: any) {
      console.error('[openai]', err?.message || err)
      return reply(502, { error: err?.message || 'OpenAI request failed' })
    }
  }

  return reply(404, { error: 'not found' })
}
