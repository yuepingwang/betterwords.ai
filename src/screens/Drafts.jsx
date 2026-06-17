import React, { useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import Meter from '../components/Meter'
import { riskWord, impactWord } from '../lib/advisor'

const STANCE_STYLE = {
  Gentle: { bg: 'var(--peri-100)', fg: 'var(--royal-700)' },
  Balanced: { bg: 'var(--cream-2)', fg: 'var(--ink-700)' },
  Firm: { bg: 'rgba(226,86,61,0.12)', fg: 'var(--coral-600)' },
}

function StanceBadge({ stance }) {
  const s = STANCE_STYLE[stance] || STANCE_STYLE.Balanced
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.fg,
      }}
    >
      {stance}
    </span>
  )
}

function Recommended() {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        background: '#F3E6C2',
        color: 'var(--honey-600)',
      }}
    >
      ✦ Recommended
    </span>
  )
}

function ReactionBox({ children }) {
  return (
    <div
      style={{
        background: 'var(--fog-1)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}
    >
      <p className="bw-meter-label" style={{ marginBottom: 4 }}>Likely reaction</p>
      <p className="bw-serif" style={{ fontStyle: 'italic', color: 'var(--text-body)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

const SEGMENTS = [
  { id: 'list', label: 'List' },
  { id: 'compare', label: 'Compare' },
  { id: 'map', label: 'Map' },
]

export default function Drafts() {
  const { state, dispatch, go } = useStore()
  const { Button } = DS
  const [mode, setMode] = useState('list')
  const strategies = state.strategies

  const open = (s) => {
    dispatch({ type: 'SELECT_STRATEGY', id: s.id })
    go('composer')
  }

  return (
    <main className="bw-container" style={{ paddingBlock: 'var(--space-9)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <p className="bw-kicker">A few ways to say it</p>
          <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)' }}>
            Choose how to say it.
          </h1>
        </div>
        {/* segmented control */}
        <div style={{ display: 'inline-flex', gap: 4, padding: 5, background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-pill)' }}>
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setMode(seg.id)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                background: mode === seg.id ? 'var(--royal-600)' : 'transparent',
                color: mode === seg.id ? 'var(--cream-0)' : 'var(--text-muted)',
                transition: 'all var(--dur-fast) var(--ease-quiet)',
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-7)' }}>
        {mode === 'list' && <ListMode strategies={strategies} onOpen={open} />}
        {mode === 'compare' && <CompareMode strategies={strategies} onOpen={open} />}
        {mode === 'map' && <MapMode strategies={strategies} onOpen={open} />}
      </div>
    </main>
  )
}

function ListMode({ strategies, onOpen }) {
  const { Button } = DS
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {strategies.map((s) => (
        <article
          key={s.id}
          className="bw-lift"
          style={{
            background: 'var(--surface-letter)',
            border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 230px',
            gap: 'var(--space-6)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-faint)' }}>
                {String(s.rank).padStart(2, '0')}
              </span>
              <h2 className="bw-display" style={{ fontSize: 'var(--text-lg)' }}>{s.name}</h2>
              <StanceBadge stance={s.stance} />
              {s.recommended && <Recommended />}
            </div>
            <p className="bw-serif" style={{ color: 'var(--text-body)', marginTop: 'var(--space-3)', maxWidth: '60ch' }}>
              {s.description}
            </p>
            <div style={{ marginTop: 'var(--space-4)', maxWidth: '60ch' }}>
              <ReactionBox>{s.likelyReaction}</ReactionBox>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Meter label="Risk" value={s.risk} word={riskWord(s.risk)} tone="risk" />
              <Meter label="Impact" value={s.impact} word={impactWord(s.impact)} tone="impact" />
            </div>
            <Button variant="primary" block onClick={() => onOpen(s)}>
              Open in composer →
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}

function CompareMode({ strategies, onOpen }) {
  const { Button } = DS
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
      {strategies.map((s) => (
        <article
          key={s.id}
          className="bw-lift"
          style={{
            background: 'var(--surface-letter)',
            border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StanceBadge stance={s.stance} />
            {s.recommended && <Recommended />}
          </div>
          <h2 className="bw-display" style={{ fontSize: 'var(--text-md)' }}>{s.name}</h2>
          <p className="bw-serif" style={{ color: 'var(--text-body)', fontSize: 'var(--text-sm)' }}>{s.description}</p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Meter label="Risk" value={s.risk} word={riskWord(s.risk)} tone="risk" />
            <Meter label="Impact" value={s.impact} word={impactWord(s.impact)} tone="impact" />
            <Button variant="outline" block onClick={() => onOpen(s)}>Open →</Button>
          </div>
        </article>
      ))}
    </div>
  )
}

function MapMode({ strategies, onOpen }) {
  const { Button } = DS
  const [sel, setSel] = useState(strategies.find((s) => s.recommended) || strategies[0])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 'var(--space-6)', alignItems: 'start' }}>
      <div
        style={{
          position: 'relative',
          height: 420,
          background: 'var(--surface-letter)',
          border: '1px solid var(--border-hair)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-6)',
        }}
      >
        {/* axes */}
        <span style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>↑ Higher risk</span>
        <span style={{ position: 'absolute', bottom: 'var(--space-4)', right: 'var(--space-5)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>More impact / directness →</span>
        <span style={{ position: 'absolute', bottom: 'var(--space-4)', left: 'var(--space-5)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Gentle</span>
        {/* quadrant lines */}
        <div style={{ position: 'absolute', left: '50%', top: '8%', bottom: '8%', borderLeft: '1px dashed var(--border-soft)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '8%', right: '8%', borderTop: '1px dashed var(--border-soft)' }} />
        {/* dots */}
        {strategies.map((s) => {
          const x = 10 + (s.impact / 100) * 78 // %
          const y = 10 + ((100 - s.risk) / 100) * 78 // % (invert: high risk -> top)
          const active = sel?.id === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSel(s)}
              title={s.name}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: active ? 22 : 16,
                  height: active ? 22 : 16,
                  borderRadius: '50%',
                  background: active ? 'var(--royal-600)' : 'var(--peri-400)',
                  border: '2px solid var(--cream-0)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--dur-fast) var(--ease-quiet)',
                }}
              />
              <span style={{ fontSize: 'var(--text-2xs)', color: active ? 'var(--text-strong)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>
                {s.name}
              </span>
            </button>
          )
        })}
      </div>

      {sel && (
        <aside
          style={{
            background: 'var(--surface-letter)',
            border: '1px solid var(--border-hair)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            position: 'sticky',
            top: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StanceBadge stance={sel.stance} />
            {sel.recommended && <Recommended />}
          </div>
          <h2 className="bw-display" style={{ fontSize: 'var(--text-md)' }}>{sel.name}</h2>
          <p className="bw-serif" style={{ color: 'var(--text-body)', fontSize: 'var(--text-sm)' }}>{sel.description}</p>
          <ReactionBox>{sel.likelyReaction}</ReactionBox>
          <Meter label="Risk" value={sel.risk} word={riskWord(sel.risk)} tone="risk" />
          <Meter label="Impact" value={sel.impact} word={impactWord(sel.impact)} tone="impact" />
          <Button variant="primary" block onClick={() => onOpen(sel)}>Open in composer →</Button>
        </aside>
      )}
    </div>
  )
}
