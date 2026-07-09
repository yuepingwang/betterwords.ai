import React from 'react'
import DS2 from '../ds2'
import { DATA, SCENARIO_IDS } from '../../data/advocate'
import { useStore } from '../store'

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

// Per-scenario color themes keyed to each character's palette (coral crab,
// lilac hedgehog, honey chick) — tinted art disc, kicker ink, hover edge.
const CARD_TONES = {
  rights: { chip: 'var(--peach-100)', ink: 'var(--peach-600)', edge: 'var(--peach-300)' },
  personal: { chip: 'var(--lilac-200)', ink: 'var(--lilac-600)', edge: 'var(--lilac-400)' },
  circle: { chip: 'var(--honey-300)', ink: 'var(--honey-600)', edge: 'var(--honey-400)' },
}

export default function Home() {
  const { dispatch } = useStore()
  const { Card, Tag } = DS2

  return (
    // The dawn ground (gradient + glow + grain) is painted by the app
    // wrapper in V2App so it runs the full viewport height; this main just
    // anchors the floating characters.
    <main style={{ position: 'relative' }}>
      {/* ambient critters, floating gently (hidden on small screens) */}
      <img className="bw-float" src="/ds-v2/assets/characters/ctx-courage.svg" style={{ width: 116, bottom: 16, left: '4%' }} alt="" />
      <img className="bw-float f2" src="/ds-v2/assets/characters/tool-landing.svg" style={{ width: 108, top: 108, right: '8%' }} alt="" />
      <img className="bw-float f3" src="/ds-v2/assets/characters/spark.svg" style={{ width: 52, top: 140, left: '13%' }} alt="" />

      <div className="bw-sec-pad" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 40px 96px' }}>
        <div className="anim-rise" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px' }}>
          <div className="t-kicker" style={{ color: 'var(--accent)', marginBottom: 16 }}>Start here</div>
          <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-strong)', margin: '0 0 20px' }}>
            Where does it hurt?
            <span className="bw-tw" style={{ fontSize: '0.55em', verticalAlign: '0.4em', marginLeft: '0.18em' }}>✦</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-normal)', color: 'var(--text-muted)', margin: 0 }}>
            Boundaries, disputes, speaking up. Tell us the situation and we’ll draft a few honest ways to send it — with the likely reaction for each.
          </p>
        </div>

        <div className="bw-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {SCENARIO_IDS.map((id, i) => {
            const d = DATA[id]
            const tone = CARD_TONES[id] || CARD_TONES.rights
            return (
              <Card
                key={id}
                className="adv-card-hover bw-home-card anim-pop"
                onClick={() => dispatch({ type: 'START_SCENARIO', scenarioId: id })}
                style={{ '--card-edge': tone.edge, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 28px', cursor: 'pointer', animationDelay: `${i * 90}ms` }}
              >
                <div className="bw-home-art" style={{ background: tone.chip }}>
                  <img src={`/ds-v2/assets/characters/${SCENARIO_ART[id]}.svg`} alt="" />
                </div>
                <div className="t-kicker" style={{ color: tone.ink, marginBottom: 14 }}>
                  {d.kicker}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: '0 0 16px' }}>
                  {d.label}
                </h3>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-muted)', margin: '0 0 28px' }}>
                  {d.home.blurb}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 'auto' }}>
                  {d.home.examples.map((ex) => (
                    <Tag key={ex}>{ex}</Tag>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
