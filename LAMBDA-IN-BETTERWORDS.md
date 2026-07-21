# How AWS Lambda Is Used in the Deployed BetterWords App

*Written 2026-07-16.*

## The one-sentence version

The deployed app uses exactly **one Lambda function** — a tiny relay named `chat` —
whose only job is to hold the OpenAI API key and forward chat requests from the
browser to OpenAI, so the key never ships in the frontend bundle.

## Why a Lambda at all

BetterWords is a static Vite/React single-page app served by Amplify Hosting.
A static site has no server, and the OpenAI key can never be embedded in browser
JavaScript (anyone could read it from the bundle and run up your bill). So all AI
calls take one hop through a server-side function that you control:

```
Browser (advisor.js)                Lambda "chat"                 OpenAI
────────────────────                ─────────────                 ──────
POST {messages, json?}  ───────▶  reads OPENAI_API_KEY   ───▶  chat/completions
                                  from env (secret)
{ content }             ◀───────  { content }            ◀───  response
```

The Lambda is the *deployed twin* of `server/index.js` — the little Express proxy
you run locally with `npm run dev`. Same two routes, same contract; one runs on
your laptop, the other on AWS.

## The pieces (all under `amplify/`)

### 1. The function definition — `amplify/functions/chat/resource.ts`

Declares the Lambda via Amplify Gen 2's `defineFunction`:

- **30-second timeout** (enough for a slow OpenAI completion).
- `OPENAI_API_KEY` injected via `secret('OPENAI_API_KEY')` — the value is set once
  in the Amplify console (or sandbox), never committed to git, never bundled into
  the browser. It exists only inside the Lambda's environment.
- `OPENAI_MODEL` pinned to `gpt-4o-mini`.

### 2. The handler — `amplify/functions/chat/handler.ts`

Plain Node code (uses global `fetch`, no OpenAI SDK — keeps the bundle tiny).
It answers two routes:

| Route | What it does |
|---|---|
| `GET /api/health` | Returns `{ ok, ai, model }`. `ai` is true only if the key is set — the UI uses this to show "AI on" vs. falling back to deterministic mock responses. |
| `POST /api/chat` | Validates `{ messages[], json? }`, forwards to OpenAI's chat-completions API (temperature 0.7, max 1600 tokens, optional JSON mode), and returns `{ content }`. |

Errors are mapped deliberately: `503` if no key (mock mode), `400` for bad input,
`502` if OpenAI itself fails. The handler never emits CORS headers — that's
handled one layer up (see next), and doubling them would make browsers reject
the responses.

### 3. The public URL — `amplify/backend.ts`

Instead of API Gateway, the Lambda gets a **Function URL** — a built-in public
HTTPS endpoint attached directly to the function:

- `authType: NONE` — no IAM/user auth on the endpoint. The security model is
  simply: the browser only ever sees this URL; the secret stays inside the Lambda.
- CORS is configured **here** (open origins, GET/POST) so the static frontend on
  the Amplify domain can call it cross-origin.
- The URL is published into `amplify_outputs.json` as `custom.chatApiUrl` so the
  frontend build can find it.

## How the frontend learns the URL — `amplify.yml`

The deploy runs in two phases, and the ordering is the trick:

1. **Backend phase:** `npx ampx pipeline-deploy` deploys the Lambda and writes
   `amplify_outputs.json` containing the Function URL.
2. **Frontend phase:** the build reads that file and exports it as
   `VITE_API_BASE`, then runs `npm run build` — so the URL is baked into the
   JavaScript bundle at build time. If the file is missing, `VITE_API_BASE`
   falls back to `''` and the app runs in mock mode.

On the client, `src/lib/advisor.js` prefixes every call with `VITE_API_BASE`:

- **Deployed:** `https://<function-url>.lambda-url.<region>.on.aws/api/chat`
- **Local dev:** `VITE_API_BASE` is empty, so the fetch goes to the relative path
  `/api/chat`, which Vite's dev-server proxy (see `vite.config.js`) forwards to
  the local Express server on port 8787.

Either way, the app code is identical — only the base URL changes.

## What Lambda is *not* doing (today)

- **No database access** — drafts live in `localStorage`; nothing is persisted
  server-side yet (see `ACCOUNTS-PLAN.md` for where that's headed).
- **No auth** — the endpoint is public; anyone with the URL could call it. Fine
  for a side project, but worth adding a rate limit or auth check before the
  product grows (this is also where a future accounts system would plug in).
- **No streaming** — responses arrive all at once; the 30s timeout bounds the
  longest completion.

## Quick file map

| File | Role |
|---|---|
| `amplify/functions/chat/resource.ts` | Lambda definition: timeout, secret key, model |
| `amplify/functions/chat/handler.ts` | The relay code: `/api/health`, `/api/chat` |
| `amplify/backend.ts` | Wires the Function URL + CORS, publishes the URL |
| `amplify.yml` | Deploys backend first, bakes the URL into the frontend build |
| `src/lib/advisor.js` | Client: calls the URL, falls back to mock mode |
| `server/index.js` | Local-dev twin of the Lambda (Express, port 8787) |
| `vite.config.js` | Dev proxy: `/api/*` → local Express server |
