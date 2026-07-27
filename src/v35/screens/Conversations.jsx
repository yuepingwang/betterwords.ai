import React, { useEffect, useMemo, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { listThreads } from '../lib/db'
import { DEMO_THREADS } from '../lib/demo'

// ------------------------------------------------------------------
// Conversations — "My Conversations" (Figma node 423:2763): a single
// 726px column of list rows, each a white card (avatar · status ·
// subject · quoted snippet) plus a slim action rail (pin / copy /
// archive). Status checkboxes + the pill search filter the list.
// Signed out (or accounts unconfigured) it shows the demo threads so
// the whole v3.5 flow stays browsable.
// ------------------------------------------------------------------

// Per-recipient avatar tints cycling the Daybreak warm accents, in the
// frame's order: peach, lilac, honey, mint.
const AVATAR_TINTS = [
  { bg: 'var(--peach-100)', fg: 'var(--peach-600)' },
  { bg: 'var(--lilac-200)', fg: 'var(--lilac-600)' },
  { bg: 'var(--honey-300)', fg: 'var(--honey-600)' },
  { bg: 'var(--mint-200)', fg: 'var(--mint-600)' },
]

// One filter checkbox per thread status. `accent` retints the DS Checkbox
// (its checked fill is var(--accent), so a local override recolors it);
// `tone`/`tag` drive the DS Badge status pill on the cards.
const STATUSES = [
  { key: 'draft', label: 'Draft', accent: 'var(--blue-600)', tone: 'accent', tag: 'Draft' },
  { key: 'awaiting', label: 'Awaiting Reply', accent: 'var(--honey-500)', tone: 'warning', tag: 'Awaiting reply' },
  { key: 'replied', label: 'Replied', accent: 'var(--mint-500)', tone: 'success', tag: 'Replied' },
  { key: 'archived', label: 'Archived', accent: 'var(--ink-500)', tone: 'neutral', tag: 'Archived' },
]

const statusOf = (t, flags) =>
  flags[t.id]?.archived ? 'archived' : !t.hasSent ? 'draft' : t.awaiting ? 'awaiting' : 'replied'

// Pin/archive live client-side (localStorage) — they're view state on the
// list, not part of the thread record, and this keeps them working for the
// signed-out demo threads too.
const FLAGS_KEY = 'bw35-convo-flags'
const loadFlags = () => {
  try {
    return JSON.parse(localStorage.getItem(FLAGS_KEY)) || {}
  } catch {
    return {}
  }
}

// "1h ago / 12h ago / 3d ago" — the card meta's compact clock (the shared
// timeAgo() is day-granular for the timeline; the frame shows hours).
function shortAgo(iso) {
  if (!iso) return ''
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso)) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

// "Your landlord" → label "To your landlord", initial "L".
const toLabel = (r) => (r ? `To ${/^your\s/i.test(r) ? r[0].toLowerCase() + r.slice(1) : r}` : 'To someone')
const initialOf = (r) => (r || '?').replace(/^your\s+/i, '').charAt(0).toUpperCase()

export default function Conversations() {
  const { dispatch, state } = useStore()
  const auth = useAuth()
  const { Button, Icon, Checkbox } = DS2

  const [threads, setThreads] = useState(null) // null → loading
  const [query, setQuery] = useState('')
  // Frame default: Draft / Awaiting Reply / Replied checked, Archived not.
  const [filters, setFilters] = useState({ draft: true, awaiting: true, replied: true, archived: false })
  const [flags, setFlags] = useState(loadFlags)
  const demo = !auth.signedIn

  useEffect(() => {
    let alive = true
    if (demo) {
      setThreads(DEMO_THREADS)
      return
    }
    setThreads(null)
    listThreads()
      .then((t) => alive && setThreads(t))
      .catch((err) => {
        console.warn('[conversations]', err?.message || err)
        if (alive) setThreads([])
      })
    return () => {
      alive = false
    }
  }, [demo, state.convoRefresh])

  const patchFlags = (id, patch) => {
    setFlags((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } }
      try {
        localStorage.setItem(FLAGS_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const shown = useMemo(() => {
    if (!threads) return null
    const q = query.trim().toLowerCase()
    return threads
      .filter((t) => filters[statusOf(t, flags)])
      .filter(
        (t) =>
          !q ||
          [t.subject, t.recipient, t.snippet, JSON.stringify(t.context?.answers || {})]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => {
        const pin = (flags[b.id]?.pinned ? 1 : 0) - (flags[a.id]?.pinned ? 1 : 0)
        return pin || new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
      })
  }, [threads, query, filters, flags])

  return (
    // The Figma "main body" frame (445:798) is the viewport: flat paper with
    // the daybreak rainbow cresting at its bottom edge, filling the full
    // browser height below the 68px header. The footer starts under the fold.
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundImage:
          'linear-gradient(180deg, var(--paper-1) 90%, var(--honey-400) 93%, var(--coral-400) 96%, var(--lilac-500) 98%, var(--blue-500) 100%)',
      }}
    >
    <main style={{ maxWidth: 782, width: '100%', margin: '0 auto', padding: '38px 28px 44px', boxSizing: 'border-box', flex: 1 }}>
      {/* title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 34 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 34, lineHeight: 1.1, letterSpacing: '-0.012em', color: 'var(--text-strong)', margin: '0 0 2px' }}>
            My Conversations
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {demo
              ? `Sample conversations — ${auth.configured ? 'sign in to see your own.' : 'connect an account to keep your own.'}`
              : 'Find and continue all of your conversations here, or create a new one.'}
          </p>
        </div>
        <Button variant="spark" size="md" onClick={() => dispatch({ type: 'RESTART' })}>+ New Conversation</Button>
      </div>

      {/* filters + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <Checkbox
              key={s.key}
              label={s.label}
              checked={filters[s.key]}
              onChange={(e) => setFilters((f) => ({ ...f, [s.key]: e.target.checked }))}
              style={{ '--accent': s.accent, '--text-on-accent': '#fff' }}
            />
          ))}
        </div>
        <span className="bw-cvsearch">
          <span className="bw-cvsearch__i" aria-hidden>
            <Icon name="search" size={18} />
          </span>
          <input placeholder="Search your letters…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search your letters" />
        </span>
      </div>

      {/* loading */}
      {shown === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 118, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hair)', background: 'var(--surface-card)', opacity: 0.55, animation: 'adv-pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {/* empty */}
      {shown && shown.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)' }}>
          <img src="/ds-v35/assets/characters/ctx-waiting.svg" alt="" style={{ width: 96, marginBottom: 18 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: 'var(--text-strong)', margin: '0 0 8px' }}>
            {query || threads.length ? 'Nothing matches those filters' : 'No conversations yet'}
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-muted)', margin: '0 0 22px' }}>
            {query || threads.length ? 'Try a different search, or check more statuses above.' : 'Say the first hard thing — we’ll keep the thread from there.'}
          </p>
          {!query && !threads.length && (
            <Button variant="primary" size="md" onClick={() => dispatch({ type: 'RESTART' })}>Start your first message</Button>
          )}
        </div>
      )}

      {/* rows — one drop-shadow over the whole stack, per the frame */}
      {shown && shown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06))' }}>
          {shown.map((t, i) => (
            <ThreadRow
              key={t.id}
              thread={t}
              tint={AVATAR_TINTS[i % AVATAR_TINTS.length]}
              status={statusOf(t, flags)}
              pinned={Boolean(flags[t.id]?.pinned)}
              archived={Boolean(flags[t.id]?.archived)}
              onOpen={() => dispatch({ type: 'OPEN_CONVERSATION', threadId: t.id })}
              onPin={() => patchFlags(t.id, { pinned: !flags[t.id]?.pinned })}
              onArchive={() => patchFlags(t.id, { archived: !flags[t.id]?.archived })}
            />
          ))}
        </div>
      )}
    </main>
    </div>
  )
}

function ThreadRow({ thread: t, tint, status, pinned, archived, onOpen, onPin, onArchive }) {
  const { Icon, Badge } = DS2
  const meta = STATUSES.find((s) => s.key === status)
  const [copied, setCopied] = useState(false)

  // Copy the latest words in the thread (what the quoted snippet previews).
  const copyLatest = () => {
    const body = t.lastBody || t.messages?.[t.messages.length - 1]?.body || t.snippet || ''
    navigator.clipboard?.writeText(body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  const snippet =
    (t.snippet || '').length > 64 ? `${t.snippet.slice(0, 64).trimEnd().replace(/[.,;:—-]+$/, '')}…` : t.snippet

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
      {/* main card */}
      <article
        onClick={onOpen}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
        role="button"
        tabIndex={0}
        className="bw-cvr-main"
        style={{ flex: 1, minWidth: 0, background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', gap: 20, alignItems: 'flex-start', cursor: 'pointer', opacity: archived ? 0.72 : 1 }}
      >
        <span aria-hidden style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: tint.bg, color: tint.fg, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {initialOf(t.recipient)}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--ink-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {toLabel(t.recipient)}
              </span>
              <Badge tone={meta.tone} size="sm">{meta.tag}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 17, lineHeight: 1.15, color: 'var(--ink-900)', margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.subject || 'Untitled'}
              </h3>
              <span style={{ flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {t.counts.sent} sent • {t.counts.drafts} draft{t.counts.drafts === 1 ? '' : 's'} • Last edit: {shortAgo(t.lastActivityAt)}
              </span>
            </div>
          </div>
          {snippet && (
            <div style={{ background: 'rgba(21, 18, 62, 0.05)', borderRadius: 10, padding: '11px 16px', fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.2, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              “{snippet}”
            </div>
          )}
        </div>
      </article>

      {/* action rail */}
      <div style={{ width: 48, flexShrink: 0, background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <button type="button" className={`bw-cvr-act bw-cvr-act--pin${pinned ? ' is-on' : ''}`} title={pinned ? 'Unpin' : 'Pin to top'} aria-label={pinned ? 'Unpin conversation' : 'Pin conversation to top'} aria-pressed={pinned} onClick={onPin}>
          <Icon name="star" size={18} />
        </button>
        <button type="button" className={`bw-cvr-act${copied ? ' is-copied' : ''}`} title="Copy latest draft" aria-label="Copy latest draft" onClick={copyLatest}>
          {copied ? (
            <Icon name="check" size={16} />
          ) : (
            <span className="bw-cvr-glyph" style={{ WebkitMaskImage: 'url(/ds-v35/assets/glyphs/convo-copy-check.svg)', maskImage: 'url(/ds-v35/assets/glyphs/convo-copy-check.svg)' }} />
          )}
        </button>
        <button type="button" className={`bw-cvr-act${archived ? ' is-on' : ''}`} title={archived ? 'Unarchive' : 'Archive'} aria-label={archived ? 'Unarchive conversation' : 'Archive conversation'} aria-pressed={archived} onClick={onArchive}>
          <span className="bw-cvr-glyph" style={{ WebkitMaskImage: 'url(/ds-v35/assets/glyphs/convo-archive.svg)', maskImage: 'url(/ds-v35/assets/glyphs/convo-archive.svg)' }} />
        </button>
      </div>
    </div>
  )
}
