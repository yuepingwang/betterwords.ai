import React from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { badgeColors, stanceLabel, lvl, initialParas } from '../../lib/advisor'

// Badge metrics per the Feedback spec: 11px · 700 · 0.08em · uppercase · pill.
const BADGE_BASE = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--text-3xs)', letterSpacing: '0.08em',
  textTransform: 'uppercase', padding: '5px 12px', borderRadius: 'var(--radius-pill)',
}

// .t-label — the DS's small uppercase label (12px · 600 · 0.12em).
const T_LABEL = {
  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-2xs)',
  letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
}

// Stance chip keeps the advisor's soft/moderate/strong coloring (shared with the
// Composer), so the ranking reads consistently across screens.
function StanceBadge({ st }) {
  const bc = badgeColors(st.level)
  return <span style={{ ...BADGE_BASE, background: bc.bg, color: bc.fg }}>{stanceLabel(st.level)}</span>
}

function Rec({ label = 'Recommended' }) {
  return <span className="bw-rectag">✦ {label}</span>
}

function Bar({ label, word, value, fill, wordColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...T_LABEL, fontSize: 'var(--text-3xs)', marginBottom: 5 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: wordColor }}>{word}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: fill, borderRadius: 'var(--radius-pill)' }} />
      </div>
    </div>
  )
}

function Bars({ st }) {
  return (
    <>
      <Bar label="Risk" word={lvl(st.risk)} value={st.risk} fill="var(--danger)" wordColor="var(--danger)" />
      <Bar label="Impact" word={lvl(st.eff)} value={st.eff} fill="var(--accent)" wordColor="var(--accent)" />
    </>
  )
}

function ReactionBox({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 'var(--radius-md)' }}>
      <span style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingTop: 3 }}>Likely reaction</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)' }}>{text}</span>
    </div>
  )
}

const SEGS = [
  { value: 'list', label: 'Ranked' },
  { value: 'compare', label: 'Compare' },
  { value: 'map', label: 'Risk map' },
]

export default function Drafts() {
  const { state, dispatch, scenario, strategies } = useStore()
  const { Segmented } = DS2
  const mode = state.draftMode

  const open = (idx) => {
    const strat = strategies[idx]
    dispatch({ type: 'OPEN_COMPOSER', idx, toneDefault: strat.toneDefault, paras: initialParas(strat) })
  }

  return (
    <main className="bw-sec-pad" style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 32px 112px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div className="t-kicker" style={{ color: 'var(--accent)', marginBottom: 8 }}>
            {scenario.draftContext.split('·')[0].trim()}
          </div>
          <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-strong)', margin: 0 }}>
            A few ways to say it
          </h1>
        </div>
        <span className="bw-drafts-seg" style={{ display: 'inline-flex' }}>
          <Segmented options={SEGS} value={mode} onChange={(m) => dispatch({ type: 'SET_DRAFT_MODE', mode: m })} />
        </span>
      </div>

      {/* all three modes stay mounted, stacked in one grid cell — the row
          holds the tallest mode's height (Ranked), so switching views never
          shifts the page; inactive modes are hidden but keep their size */}
      <div style={{ display: 'grid' }}>
        <div style={{ gridArea: '1 / 1', visibility: mode === 'list' ? 'visible' : 'hidden' }}>
          <ListMode strategies={strategies} onOpen={open} />
        </div>
        <div style={{ gridArea: '1 / 1', visibility: mode === 'compare' ? 'visible' : 'hidden' }}>
          <CompareMode strategies={strategies} onOpen={open} />
        </div>
        <div style={{ gridArea: '1 / 1', visibility: mode === 'map' ? 'visible' : 'hidden' }}>
          <MapMode strategies={strategies} onOpen={open} />
        </div>
      </div>
    </main>
  )
}

function ListMode({ strategies, onOpen }) {
  const { Card, Button } = DS2
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {strategies.map((st, idx) => (
        <Card key={idx} className="adv-card-hover bw-list-card anim-rise" style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 28, padding: '24px 28px', animationDelay: `${idx * 70}ms` }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text-faint)' }}>0{idx + 1}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: 0 }}>{st.name}</h3>
              <StanceBadge st={st} />
              {st.recommended && <Rec />}
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: '0 0 14px' }}>{st.why}</p>
            <ReactionBox text={st.reaction} />
          </div>
          <div className="bw-list-side" style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', borderLeft: '1px solid var(--border-hair)', paddingLeft: 24 }}>
            <Bars st={st} />
            <Button variant="primary" size="md" block onClick={() => onOpen(idx)}>Open in composer →</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function CompareMode({ strategies, onOpen }) {
  const { Card, Button } = DS2
  return (
    <div className="bw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      {strategies.map((st, idx) => (
        <Card key={idx} className="anim-rise" style={{ display: 'flex', flexDirection: 'column', padding: '24px 22px', animationDelay: `${idx * 70}ms` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <StanceBadge st={st} />
            {st.recommended && <Rec label="Pick" />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: '0 0 14px' }}>{st.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: '0 0 16px' }}>{st.why}</p>
          <div style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: '0 0 20px' }}>{st.reaction}</p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Bars st={st} />
            <Button variant="primary" size="md" block onClick={() => onOpen(idx)}>Open →</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function MapMode({ strategies, onOpen }) {
  const { state, dispatch } = useStore()
  const { Card, Button } = DS2
  const sel = strategies[state.mapSelIdx] || null
  return (
    <div className="bw-map-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
      <Card className="anim-rise" style={{ padding: '24px 28px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-faint)', marginBottom: 10 }}>
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
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--surface-card)', background: 'var(--accent)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(28,23,70,0.3)' }}
                >
                  {selected && <span style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: '2px solid var(--accent)' }} />}
                </button>
                <span style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', fontWeight: 600, color: 'var(--text-body)' }}>{st.name}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-faint)' }}>
          <span>Gentle</span>
          <span>More impact / directness →</span>
        </div>
      </Card>

      {sel && (
        <Card key={state.mapSelIdx} className="anim-rise" style={{ padding: 24, border: '1px solid var(--peri-400)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <StanceBadge st={sel} />
            {sel.recommended && <Rec />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: '0 0 12px' }}>{sel.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: '0 0 14px' }}>{sel.why}</p>
          <div style={{ ...T_LABEL, fontSize: 'var(--text-3xs)', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', margin: '0 0 22px' }}>{sel.reaction}</p>
          <Button variant="primary" size="lg" block onClick={() => onOpen(state.mapSelIdx)}>Open in composer →</Button>
        </Card>
      )}
    </div>
  )
}
