// ------------------------------------------------------------------
// Tiny OpenAI proxy for BetterWords.
//
// The React app is a static Vite bundle, so the OpenAI key can never live
// in the browser. This minimal server holds OPENAI_API_KEY and exposes a
// single relay endpoint the client uses for every AI call:
//
//   POST /api/chat  { messages: [...], json?: boolean }  ->  { content }
//
// Prompt-building lives in src/lib/advisor.js (next to the UI contract);
// this process only adds the secret and forwards to OpenAI. In dev, Vite
// proxies /api here (see vite.config.js).
// ------------------------------------------------------------------

import 'dotenv/config'
import express from 'express'
import OpenAI from 'openai'

const PORT = process.env.PORT || 8787
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const apiKey = process.env.OPENAI_API_KEY

const app = express()
app.use(express.json({ limit: '256kb' }))

// Health check — also tells the client whether AI is actually available,
// so the UI can show "AI on" vs. the deterministic fallback.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ai: Boolean(apiKey), model: MODEL })
})

const client = apiKey ? new OpenAI({ apiKey }) : null

app.post('/api/chat', async (req, res) => {
  if (!client) {
    return res.status(503).json({ error: 'OPENAI_API_KEY not set — running in mock mode.' })
  }
  const { messages, json } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] required' })
  }
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1600,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    })
    res.json({ content: completion.choices[0]?.message?.content ?? '' })
  } catch (err) {
    console.error('[openai]', err?.status || '', err?.message || err)
    res.status(502).json({ error: err?.message || 'OpenAI request failed' })
  }
})

app.listen(PORT, () => {
  console.log(`BetterWords API on http://localhost:${PORT}  (model: ${MODEL}, ai: ${Boolean(apiKey)})`)
})
