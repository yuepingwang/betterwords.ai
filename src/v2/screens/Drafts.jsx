import React from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { badgeColors, stanceLabel, lvl, initialParas } from '../../lib/advisor'

const BADGE_BASE = {
  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', padding: '5px 11px', borderRadius: 'var(--radius-pill)',
}

// Stance chip keeps the advisor's soft/moderate/strong coloring (shared with the
// Composer), so the ranking reads consistently across screens.
function StanceBadge({ st }) {
  const bc = badgeColors(st.level)
  return <span style={{ ...BADGE_BASE, background: bc.bg, color: bc.fg }}>{stanceLabel(st.level)}</span>
}

function Rec({ label = 'Recommended' }) {
  const { Badge, Sparkle } = DS2
  return <Badge tone="gradient" size="sm"><Sparkle size={9} style={{ color: '#fff' }} />{label}</Badge>
}

function Bar({ label, word, value, fill, wordColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', background: 'var(--surface-panel)', borderRadius: 'var(--radius-md)' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingTop: 2 }}>Likely reaction</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.45, color: 'var(--text-body)' }}>{text}</span>
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
    <main className="bw-sec-pad" style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 32px 90px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            {scenario.draftContext.split('·')[0].trim()}
          </div>
          <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 44, lineHeight: 1.02, color: 'var(--text-strong)', margin: 0 }}>
            A few ways to say it
          </h1>
        </div>
        <Segmented options={SEGS} value={mode} onChange={(m) => dispatch({ type: 'SET_DRAFT_MODE', mode: m })} />
      </div>

      {mode === 'list' && <ListMode strategies={strategies} onOpen={open} />}
      {mode === 'compare' && <CompareMode strategies={strategies} onOpen={open} />}
      {mode === 'map' && <MapMode strategies={strategies} onOpen={open} />}
    </main>
  )
}

function ListMode({ strategies, onOpen }) {
  const { Card, Button } = DS2
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {strategies.map((st, idx) => (
        <Card key={idx} className="adv-card-hover bw-list-card" style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 28, padding: '26px 28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-faint)' }}>0{idx + 1}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: 'var(--text-strong)', margin: 0 }}>{st.name}</h3>
              <StanceBadge st={st} />
              {st.recommended && <Rec />}
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{st.why}</p>
            <ReactionBox text={st.reaction} />
          </div>
          <div className="bw-list-side" style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', borderLeft: '1px solid var(--border-hair)', paddingLeft: 26 }}>
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
        <Card key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <StanceBadge st={st} />
            {st.recommended && <Rec label="Pick" />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 23, lineHeight: 1.05, color: 'var(--text-strong)', margin: '0 0 14px' }}>{st.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.45, color: 'var(--text-body)', margin: '0 0 16px' }}>{st.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.4, color: 'var(--text-body)', margin: '0 0 20px' }}>{st.reaction}</p>
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
      <Card style={{ padding: '26px 30px 18px' }}>
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
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--surface-card)', background: 'var(--accent)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(28,23,70,0.3)' }}
                >
                  {selected && <span style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: '2px solid var(--accent)' }} />}
                </button>
                <span style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600, color: 'var(--text-body)' }}>{st.name}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
          <span>Gentle</span>
          <span>More impact / directness →</span>
        </div>
      </Card>

      {sel && (
        <Card style={{ padding: 26, border: '1px solid var(--peri-400)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <StanceBadge st={sel} />
            {sel.recommended && <Rec />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 26, lineHeight: 1.05, color: 'var(--text-strong)', margin: '0 0 12px' }}>{sel.name}</h3>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-body)', margin: '0 0 14px' }}>{sel.why}</p>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>Likely reaction</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.45, color: 'var(--text-body)', margin: '0 0 22px' }}>{sel.reaction}</p>
          <Button variant="primary" size="lg" block onClick={() => onOpen(state.mapSelIdx)}>Open in composer →</Button>
        </Card>
      )}
    </div>
  )
}
