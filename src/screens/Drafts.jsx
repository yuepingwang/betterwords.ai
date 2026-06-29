import React from 'react'
import { useStore } from '../store'
import { badgeColors, stanceLabel, lvl, initialParas } from '../lib/advisor'

const BADGE_BASE = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999,
}
const REC_BADGE = {
  display: 'inline-flex', alignItems: 'center', gap: 5, ...BADGE_BASE,
  background: '#F3E6C2', color: 'var(--honey-600)',
}

function Badge({ st }) {
  const bc = badgeColors(st.level)
  return <span style={{ ...BADGE_BASE, background: bc.bg, color: bc.fg }}>{stanceLabel(st.level)}</span>
}

function Bars({ st }) {
  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
          <span style={{ color: 'var(--text-muted)' }}>Risk</span>
          <span style={{ color: 'var(--coral-600)' }}>{lvl(st.risk)}</span>
        </div>
        <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${st.risk}%`, height: '100%', background: 'var(--coral-500)', borderRadius: 999 }} />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
          <span style={{ color: 'var(--text-muted)' }}>Impact</span>
          <span style={{ color: 'var(--royal-700)' }}>{lvl(st.eff)}</span>
        </div>
        <div style={{ height: 6, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${st.eff}%`, height: '100%', background: 'var(--royal-600)', borderRadius: 999 }} />
        </div>
      </div>
    </>
  )
}

function ReactionBox({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', background: 'var(--fog-1)', borderRadius: 8 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingTop: 2 }}>Likely reaction</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.45, color: 'var(--ink-700)' }}>{text}</span>
    </div>
  )
}

const SEGS = [
  { key: 'list', label: 'Ranked' },
  { key: 'compare', label: 'Compare' },
  { key: 'map', label: 'Risk map' },
]

export default function Drafts() {
  const { state, dispatch, scenario, strategies } = useStore()
  const mode = state.draftMode

  const open = (idx) => {
    const strat = strategies[idx]
    dispatch({
      type: 'OPEN_COMPOSER',
      idx,
      toneDefault: strat.toneDefault,
      paras: initialParas(strat),
    })
  }

  return (
    <main style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 8 }}>
            {scenario.draftContext.split('·')[0].trim()}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 44, lineHeight: 1.02, color: 'var(--ink-800)', margin: 0 }}>
            A few ways to say it
          </h1>
        </div>
        <div style={{ display: 'inline-flex', gap: 4, padding: 5, background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 999 }}>
          {SEGS.map((seg) => (
            <button
              key={seg.key}
              onClick={() => dispatch({ type: 'SET_DRAFT_MODE', mode: seg.key })}
              style={{
                padding: '8px 18px', cursor: 'pointer', border: 'none', borderRadius: 999,
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, letterSpacing: '0.03em',
                background: mode === seg.key ? 'var(--ink-800)' : 'transparent',
                color: mode === seg.key ? 'var(--cream-0)' : 'var(--text-muted)',
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'list' && <ListMode strategies={strategies} onOpen={open} />}
      {mode === 'compare' && <CompareMode strategies={strategies} onOpen={open} />}
      {mode === 'map' && <MapMode strategies={strategies} onOpen={open} />}
    </main>
  )
}

function ListMode({ strategies, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {strategies.map((st, idx) => (
        <div key={idx} className="adv-card-hover bw-list-card" style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 28, padding: '26px 28px', background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-faint)' }}>0{idx + 1}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--ink-800)', margin: 0 }}>{st.name}</h3>
              <Badge st={st} />
              {st.recommended && <span style={REC_BADGE}>✦ Recommended</span>}
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{st.why}</p>
            <ReactionBox text={st.reaction} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', borderLeft: '1px solid var(--border-hair)', paddingLeft: 26 }}>
            <Bars st={st} />
            <button
              onClick={() => onOpen(idx)}
              style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42, padding: '0 20px', border: 'none', borderRadius: 999, background: 'var(--royal-600)', color: 'var(--cream-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, letterSpacing: '0.03em', cursor: 'pointer' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--royal-700)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--royal-600)')}
            >
              Open in composer →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CompareMode({ strategies, onOpen }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {strategies.map((st, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '24px 22px', background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge st={st} />
            {st.recommended && <span style={REC_BADGE}>✦ Pick</span>}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, lineHeight: 1.05, color: 'var(--ink-800)', margin: '0 0 14px' }}>{st.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.45, color: 'var(--text-body)', margin: '0 0 16px' }}>{st.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.4, color: 'var(--ink-700)', margin: '0 0 20px' }}>{st.reaction}</p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Bars st={st} />
            <button
              onClick={() => onOpen(idx)}
              style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42, border: 'none', borderRadius: 999, background: 'var(--royal-600)', color: 'var(--cream-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, letterSpacing: '0.03em', cursor: 'pointer' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--royal-700)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--royal-600)')}
            >
              Open →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function MapMode({ strategies, onOpen }) {
  const { state, dispatch } = useStore()
  const sel = strategies[state.mapSelIdx] || null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
      <div style={{ background: 'var(--cream-0)', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '26px 30px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>
          <span>↑ Higher risk</span>
          <span>Each dot is a strategy</span>
        </div>
        <div style={{ position: 'relative', height: 380, borderLeft: '1.5px solid var(--border-soft)', borderBottom: '1.5px solid var(--border-soft)', marginBottom: 8 }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-hair)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border-hair)' }} />
          {strategies.map((st, idx) => {
            const selected = state.mapSelIdx === idx
            return (
              <div key={idx} style={{ position: 'absolute', left: `${14 + st.eff * 0.72}%`, top: `${14 + (100 - st.risk) * 0.72}%`, transform: 'translate(-50%,-50%)' }}>
                <button
                  onClick={() => dispatch({ type: 'SET_MAP_SEL', idx })}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--cream-0)', background: 'var(--royal-600)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(21,18,62,0.3)' }}
                >
                  {selected && <span style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: '2px solid var(--royal-600)' }} />}
                </button>
                <span style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-700)' }}>{st.name}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
          <span>Gentle</span>
          <span>More impact / directness →</span>
        </div>
      </div>

      {sel && (
        <div style={{ background: 'var(--cream-0)', border: '1px solid var(--peri-400)', borderRadius: 14, boxShadow: 'var(--shadow-md)', padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge st={sel} />
            {sel.recommended && <span style={REC_BADGE}>✦ Recommended</span>}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.05, color: 'var(--ink-800)', margin: '0 0 12px' }}>{sel.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{sel.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.45, color: 'var(--ink-700)', margin: '0 0 22px' }}>{sel.reaction}</p>
          <button
            onClick={() => onOpen(state.mapSelIdx)}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, border: 'none', borderRadius: 999, background: 'var(--royal-600)', color: 'var(--cream-0)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, letterSpacing: '0.03em', cursor: 'pointer' }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--royal-700)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'var(--royal-600)')}
          >
            Open in composer →
          </button>
        </div>
      )}
    </div>
  )
}
