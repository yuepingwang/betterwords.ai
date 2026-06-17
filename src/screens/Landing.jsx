import React, { useEffect, useRef, useState } from 'react'
import BrandMark, { Wordmark } from '../components/BrandMark'
import './Landing.css'

// Two compass-star outlines from the design (thin = hero/accents, fat = step discs).
function Spark({ size = 16, variant = 'thin', style }) {
  const d =
    variant === 'fat'
      ? 'M50 2 L62 38 L98 50 L62 62 L50 98 L38 62 L2 50 L38 38 Z'
      : 'M50 2 L57 43 L98 50 L57 57 L50 98 L43 57 L2 50 L43 43 Z'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <path d={d} fill="currentColor" />
    </svg>
  )
}

const HERO_CARDS = [
  {
    to: 'My landlord — Mr. Aubert', re: 'Return of my security deposit',
    p1: 'I’m writing to request the return of my $1,850 security deposit for 14 Rue Pelletier. My tenancy ended on 30 May and the deposit is now due.',
    p2: 'Please return it, or provide a written itemization of any deductions, within seven days.',
    tag: 'Documented', tagBg: 'var(--peri-100)', tagInk: 'var(--royal-700)',
    right: 'Impact High', rightInk: 'var(--pine-500)',
    postL1: 'Ready', postL2: 'to send', postColor: 'var(--coral-500)',
  },
  {
    to: 'My brother — Daniel', re: 'Something I need to be honest about',
    p1: 'I love you, so I’d rather be honest than keep giving you a soft “maybe.” I’m not able to lend money anymore — and I need that to be a consistent answer, not a one-off.',
    p2: 'This is about my own limits, not your worth to me. What I can offer is my time and a brother who isn’t keeping score.',
    tag: 'Honest & Kind', tagBg: 'var(--peri-100)', tagInk: 'var(--royal-700)',
    right: 'Impact High', rightInk: 'var(--pine-500)',
    postL1: 'Said', postL2: 'with care', postColor: 'var(--royal-600)',
  },
  {
    to: 'Mom', re: 'A little notice before visits',
    p1: 'I love having you close, and I want to be honest about something small. Could we text first before stopping by, instead of surprise visits?',
    p2: 'It isn’t about wanting you less — a little notice just helps me be fully present when you’re here.',
    tag: 'Warm & Clear', tagBg: '#FBE0C9', tagInk: 'var(--coral-600)',
    right: 'Reaction Warm', rightInk: 'var(--pine-500)',
    postL1: 'Sealed', postL2: 'with love', postColor: 'var(--honey-600)',
  },
]

const STEP_COLORS = [
  { disc: '#FBE0C9', ink: 'var(--coral-500)', spark: 'var(--coral-400)', delay: '0s' },
  { disc: '#FBEAAE', ink: 'var(--honey-600)', spark: 'var(--honey-500)', delay: '1.6s' },
  { disc: 'var(--peri-200)', ink: 'var(--royal-700)', spark: 'var(--royal-600)', delay: '3.2s' },
]
const STEPS = [
  { n: '01', title: 'Tell us the situation', body: 'A few quick questions about who it’s for, what you need, and what worries you most.' },
  { n: '02', title: 'Choose how to say it', body: 'See several honest drafts — gentle to direct — each with its likely reaction and risk.' },
  { n: '03', title: 'Refine, then send', body: 'Tune the tone and length, revise any line, and seal it when it finally feels right.' },
]
const SCENARIOS = [
  { key: 'rights', kicker: 'Renters · Clients · Patients', title: 'Defending your rights', blurb: 'A deposit, a lease, a service you paid for — handled wrong, and it needs addressing.', bg: 'var(--peri-200)', illo: 'briefcase', examples: ['Deposit withheld', 'Repairs', 'Overcharged', 'Care denied', 'Rights overlooked'] },
  { key: 'personal', kicker: 'Family · Partner · Friends', title: 'Personal relationships', blurb: 'A boundary, an unmet need, or a hurt close to home that you’ve been carrying.', bg: 'var(--cream-2)', illo: 'care', examples: ['Money boundary', 'An unmet need', 'A hurt', 'Needing space', 'A recurring pattern'] },
  { key: 'circle', kicker: 'Work · School · Teams', title: 'A close-knit circle', blurb: 'Credit taken, unfair blame, being underpaid — when speaking up feels risky.', bg: 'var(--fog-1)', illo: 'people', examples: ['Credit taken', 'Unfair blame', 'Underpaid', 'Overworked', 'Unfair grade', 'Asking for help'] },
]

const navLink = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14 }
const sectionKicker = { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 12 }
const sectionH2 = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 46, lineHeight: 1.04, letterSpacing: '-0.015em', color: 'var(--ink-800)', margin: 0 }

export default function Landing({ onStart }) {
  const [card, setCard] = useState(0)
  const howRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    timer.current = setInterval(() => setCard((c) => (c + 1) % HERO_CARDS.length), 5400)
    return () => clearInterval(timer.current)
  }, [])

  const goCard = (i) => {
    if (i === card) return
    clearInterval(timer.current)
    setCard(i)
    timer.current = setInterval(() => setCard((c) => (c + 1) % HERO_CARDS.length), 5400)
  }

  const scrollToHow = () => {
    const el = howRef.current
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
  }

  const c = HERO_CARDS[card]
  const n = HERO_CARDS.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream-1)', fontFamily: 'var(--font-sans)' }}>
      {/* nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '18px 40px', borderBottom: '1px solid var(--border-hair)', background: 'rgba(248,244,233,0.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--ink-800)', cursor: 'pointer' }} onClick={() => onStart(null)}>
          <BrandMark size={34} />
          <Wordmark size={22} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <a className="lp-link" style={navLink} onClick={scrollToHow}>How it works</a>
          <a className="lp-link" style={navLink} onClick={() => onStart(null)}>Situations</a>
          <a className="lp-link" style={navLink} onClick={() => onStart(null)}>Privacy</a>
          <a className="lp-cta" style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--cream-0)', background: 'var(--royal-600)', padding: '10px 20px', borderRadius: 999, cursor: 'pointer' }} onClick={() => onStart(null)}>Start writing</a>
        </div>
      </nav>

      {/* hero */}
      <header style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center', padding: '96px 40px 104px', maxWidth: 1180, margin: '0 auto' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--royal-600)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 22 }}>
            <Spark size={15} />
            Written with care, sent with confidence
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 66, lineHeight: 1.0, letterSpacing: '-0.02em', color: 'var(--ink-800)', margin: '0 0 22px' }}>Say the hard thing — well.</h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 21, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 32px', maxWidth: 480 }}>
            BetterWords helps you write the messages that matter most — setting a boundary, disputing a charge, speaking up — and shows you how each way of saying it is likely to land.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a className="lp-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, color: 'var(--cream-0)', background: 'var(--royal-600)', padding: '15px 28px', borderRadius: 999, boxShadow: 'var(--shadow-md)', cursor: 'pointer' }} onClick={() => onStart(null)}>Compose a message →</a>
            <a className="lp-link" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--ink-700)', cursor: 'pointer' }} onClick={scrollToHow}>See how it works</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            <span>Boundaries</span><span style={{ color: 'var(--peri-400)' }}>✦</span><span>Disputes</span><span style={{ color: 'var(--peri-400)' }}>✦</span><span>Speaking up</span>
          </div>
        </div>

        {/* shuffling letter deck */}
        <div style={{ position: 'relative', perspective: '1700px', height: 446, marginTop: 48 }}>
          {HERO_CARDS.map((cardData, i) => {
            const depth = (i - card + n) % n
            const offX = [0, -20, 16][depth]
            const offY = [0, 20, 34][depth]
            const rot = [1.2, -3.2, 4][depth]
            const scale = [1, 0.95, 0.905][depth]
            return (
              <div
                key={i}
                className="lp-deck-card"
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', boxSizing: 'border-box',
                  background: depth === 0 ? 'var(--surface-letter)' : 'var(--peri-300)',
                  border: '1px solid rgba(11,22,38,0.07)', borderRadius: 12,
                  boxShadow: depth === 0 ? 'var(--shadow-letter)' : 'var(--shadow-md)', padding: '28px 32px',
                  transformOrigin: 'center bottom', zIndex: 10 - depth,
                  transform: `translate(${offX}px,${offY}px) scale(${scale}) rotate(${rot}deg)`,
                  transition: 'transform 0.75s cubic-bezier(.45,.05,.2,1), background 0.6s var(--ease-quiet), box-shadow 0.75s var(--ease-quiet)',
                }}
              >
                <div style={{ opacity: depth === 0 ? 1 : 0, transition: 'opacity 0.55s var(--ease-quiet)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: '6px 12px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 14, marginBottom: 16, fontFamily: 'var(--font-sans)', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span><span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{cardData.to}</span>
                    <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span><span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{cardData.re}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.62, color: 'var(--ink-700)', margin: '0 0 12px' }}>{cardData.p1}</p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.62, color: 'var(--ink-700)', margin: 0 }}>{cardData.p2}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-hair)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: cardData.tagInk, background: cardData.tagBg, padding: '5px 11px', borderRadius: 999 }}>{cardData.tag}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: cardData.rightInk }}>{cardData.right}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {/* postmark badge (front card) */}
          <div style={{ position: 'absolute', top: -22, right: -14, transform: 'rotate(8deg)', zIndex: 20 }}>
            <span className="postmark" style={{ width: 74, height: 74, color: c.postColor, background: 'rgba(248,244,233,0.7)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.15, flexDirection: 'column' }}>
              {c.postL1}<br />{c.postL2}
            </span>
          </div>
          {/* dots */}
          <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 9, alignItems: 'center', zIndex: 20 }}>
            {HERO_CARDS.map((_, i) => (
              <button key={i} aria-label="Show example" onClick={() => goCard(i)} style={{ width: i === card ? 22 : 8, height: 8, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', transition: 'width .3s var(--ease-quiet), background .3s var(--ease-quiet)', background: i === card ? 'var(--royal-600)' : 'var(--peri-400)' }} />
            ))}
          </div>
        </div>
      </header>

      {/* how it works */}
      <section ref={howRef} style={{ background: 'var(--cream-0)', borderTop: '1px solid var(--border-hair)', borderBottom: '1px solid var(--border-hair)', padding: '124px 40px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={sectionKicker}>How it works</div>
            <h2 style={sectionH2}>Three steps from stumped to sent.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
            {STEPS.map((st, i) => {
              const col = STEP_COLORS[i]
              return (
                <div key={st.n} style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: col.ink, background: col.disc, width: 52, height: 52, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)', boxShadow: 'var(--shadow-xs)' }}>{st.n}</span>
                      <span style={{ position: 'absolute', top: -9, right: -9, color: col.spark, animation: `bw-twinkle 4s var(--ease-in-out) ${col.delay} infinite` }}>
                        <Spark size={18} variant="fat" />
                      </span>
                      <span style={{ position: 'absolute', bottom: -5, left: -6, color: col.spark, opacity: 0.7, animation: `bw-twinkle 4s var(--ease-in-out) ${col.delay} infinite reverse` }}>
                        <Spark size={11} variant="fat" />
                      </span>
                    </span>
                    <div className="rule-dotted" style={{ flex: 1 }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.1, color: 'var(--ink-800)', margin: '0 0 10px' }}>{st.title}</h3>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>{st.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* scenarios */}
      <section style={{ padding: '124px 40px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <div>
            <div style={sectionKicker}>Where it helps</div>
            <h2 style={sectionH2}>For the messages you rewrite five times.</h2>
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0, maxWidth: 320 }}>The high-stakes notes where tone is everything and the cost of getting it wrong is real.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {SCENARIOS.map((sc) => (
            <div key={sc.key} className="lp-scenario" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '42px 30px', border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', cursor: 'pointer', backgroundColor: 'var(--cream-0)' }} onClick={() => onStart(sc.key)}>
              <figure style={{ margin: '0 0 28px', width: 88, filter: 'drop-shadow(0 3px 8px rgba(21,18,62,0.18))' }}>
                <div className="edge-perforated" style={{ padding: 7, background: 'var(--cream-0)' }}>
                  <div style={{ aspectRatio: '5 / 6', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <div style={{ width: '84%', height: '84%', backgroundImage: `url(/ds/assets/illustrations/${sc.illo}.svg)`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                  </div>
                </div>
              </figure>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 14 }}>{sc.kicker}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.08, color: 'var(--ink-800)', margin: '0 0 16px' }}>{sc.title}</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16.5, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 28px' }}>{sc.blurb}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 'auto', justifyContent: 'center' }}>
                {sc.examples.map((ex) => (
                  <span key={ex} style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 500, color: 'var(--ink-700)', background: 'var(--cream-2)', borderRadius: 999, padding: '5px 12px' }}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* composer preview */}
      <section style={{ background: 'var(--cream-0)', borderTop: '1px solid var(--border-hair)', padding: '124px 40px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ ...sectionKicker, marginBottom: 14 }}>The composer</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.015em', color: 'var(--ink-800)', margin: '0 0 18px' }}>Tune every word until it sounds like you — at your best.</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 28px' }}>Slide from soft to strong, succinct to detailed, and watch the draft rewrite itself. Select any line to revise it. See the likely reaction and risk before you commit.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Tone & length sliders that rewrite live', 'Select-to-revise: soften, sharpen, shorten any line', 'A read on how it’s likely to land'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--ink-700)' }}>
                  <span style={{ color: 'var(--royal-600)', display: 'inline-flex' }}><Spark size={16} /></span>{t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid var(--border-hair)', borderRadius: 14, boxShadow: 'var(--shadow-md)', padding: 26, backgroundColor: 'var(--cream-0)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-800)', marginBottom: 22 }}>Tune the message</div>
            <MockSlider label="Tone" value="Balanced" pct={52} ends={['Soft', 'Strong']} mb={24} />
            <MockSlider label="Length" value="Detailed" pct={68} ends={['Succinct', 'Detailed']} mb={26} />
            <div style={{ borderTop: '1px solid var(--border-hair)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MockMeter label="Risk" word="Moderate" pct={42} fill="var(--coral-500)" wordColor="var(--coral-600)" />
              <MockMeter label="Impact" word="High" pct={78} fill="var(--royal-600)" wordColor="var(--royal-700)" />
            </div>
          </div>
        </div>
      </section>

      {/* closing CTA (night) */}
      <section className="bg-night-sky" style={{ padding: '112px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: 24, color: 'var(--honey-500)' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" style={{ animation: 'bw-twinkle 5s var(--ease-in-out) infinite' }}>
              <path d="M50 2 L57 43 L98 50 L57 57 L50 98 L43 57 L2 50 L43 43 Z" fill="currentColor" />
              <path d="M50 22 L54 46 L78 50 L54 54 L50 78 L46 54 L22 50 L46 46 Z" fill="var(--ink-800)" opacity="0.4" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 56, lineHeight: 1.02, letterSpacing: '-0.02em', color: 'var(--cream-0)', margin: '0 0 18px' }}>The words you can’t find — found.</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 21, lineHeight: 1.5, color: 'var(--peri-200)', margin: '0 auto 34px', maxWidth: 520 }}>Stop drafting the same hard message at midnight. Tell BetterWords the situation, and send something you’re proud of.</p>
          <a className="lp-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 17, color: 'var(--ink-800)', background: 'var(--cream-0)', padding: '16px 32px', borderRadius: 999, boxShadow: 'var(--shadow-lg)', cursor: 'pointer' }} onClick={() => onStart(null)}>Compose a message →</a>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-faint)', marginTop: 22, letterSpacing: '0.04em' }}>Rehearse your approach as many times as you need · Till it feels right</div>
        </div>
      </section>

      {/* footer */}
      <footer style={{ background: 'var(--cream-1)', padding: '40px 40px', borderTop: '1px solid var(--border-hair)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-800)' }}>
            <BrandMark size={28} />
            <Wordmark size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a className="lp-link" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5 }} onClick={scrollToHow}>How it works</a>
            <a className="lp-link" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5 }} onClick={() => onStart(null)}>Situations</a>
            <a className="lp-link" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5 }} onClick={() => onStart(null)}>Privacy</a>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-faint)' }}>© 2026 BetterWords</div>
        </div>
      </footer>
    </div>
  )
}

function MockSlider({ label, value, pct, ends, mb }) {
  return (
    <div style={{ marginBottom: mb }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--royal-700)' }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: 5, background: 'var(--fog-2)', borderRadius: 999 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'var(--royal-600)', borderRadius: 999 }} />
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: 'var(--royal-600)', border: '3px solid var(--cream-0)', boxShadow: '0 1px 5px rgba(21,18,62,0.35)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-faint)', marginTop: 7 }}>
        <span>{ends[0]}</span><span>{ends[1]}</span>
      </div>
    </div>
  )
}

function MockMeter({ label, word, pct, fill, wordColor }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span><span style={{ color: wordColor }}>{word}</span>
      </div>
      <div style={{ height: 6, background: 'var(--fog-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: fill, borderRadius: 999 }} />
      </div>
    </div>
  )
}
