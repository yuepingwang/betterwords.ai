import React, { useEffect, useRef, useState } from 'react'
import DS2 from '../ds2'
import { SiteHeader, SiteFooter } from '../components/SiteChrome'
import { DATA, SCENARIO_IDS } from '../../data/advocate'
import './Landing.css'

// v2 Landing — rebuilt to the "betterwords-web" desktop reference kit
// (claude.ai/design). Composes the Daybreak bundle; CTAs enter the app via
// onStart(null) → Home, and the scenario cards jump straight into a flow.

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

// Hidden for now — flip back on when testimonials/pricing are ready.
const SHOW_TESTIMONIAL = false
const SHOW_PRICING = false

// Hero + register section rebuilt to hero-register-section.html
// (claude.ai/design, betterwords-web kit): centered hero with an animated
// swap word and floating characters, then a two-column "register" section
// whose left copy stays in sync with a shuffling letter stack.

const SWAP_WORDS = ['well', 'kindly', 'clearly', 'calmly', 'bravely']

const LETTERS = [
  {
    ill: 'ctx-boundary', rec: true,
    title: 'Set a boundary.', para: 'Say what you need without the guilt — clear, kind, and final.',
    to: 'My brother — Daniel', re: 'Something I need to be honest about', pip: 'Boundary',
    body: [
      'I love you, so I’d rather be honest than keep giving you a soft “maybe.” I’m not able to lend money anymore — and I need that to be a consistent answer, not a one-off.',
      'This is about my own limits, not your worth to me. What I can offer is my time and a brother who isn’t keeping score.',
    ],
    tags: [['Honest & kind', 'var(--peach-100)', '#C4562F'], ['Shorter', 'var(--peri-100)', '#3A5AD9'], ['Hold firm', 'var(--mint-200)', '#2F8F63']],
    land: 'Reads as honest and warm — keeps the bond.',
  },
  {
    ill: 'ctx-dispute', rec: false,
    title: 'Ask for what’s yours.', para: 'Make it firm and documented — easy to act on, hard to ignore.',
    to: 'My landlord — Mr. Aubert', re: 'Return of my security deposit', pip: 'Deposit',
    body: [
      'I’m writing to request the return of my $1,850 security deposit for 14 Rue Pelletier. My tenancy ended on 30 May and the deposit is now due.',
      'Please return it, or provide a written itemization of any deductions, within seven days.',
    ],
    tags: [['Documented', 'var(--peri-100)', '#3A5AD9'], ['Cite the amount', 'var(--peach-100)', '#C4562F'], ['Set a deadline', 'var(--lilac-200)', '#7A5FC0']],
    land: 'Reads as firm and documented — hard to ignore.',
  },
  {
    ill: 'ctx-speakup', rec: true,
    title: 'Ask for a little space.', para: 'Say it warmly — a small boundary, kindly drawn.',
    to: 'Mom', re: 'A little notice before visits', pip: 'Notice',
    body: [
      'I love having you close, and I want to be honest about something small. Could we text first before stopping by, instead of surprise visits?',
      'It isn’t about wanting you less — a little notice just helps me be fully present when you’re here.',
    ],
    tags: [['Warm & clear', 'var(--mint-200)', '#2F8F63'], ['Keep it light', 'var(--peach-100)', '#C4562F'], ['Stay clear', 'var(--peri-100)', '#3A5AD9']],
    land: 'Reads as warm and clear — invites a yes.',
  },
]

const STEPS = [
  { n: '01', t: 'Tell us the situation', d: 'A few quick questions about who it’s for, what you need, and what worries you most.' },
  { n: '02', t: 'Choose how to say it', d: 'See several honest drafts — gentle to direct — each with its likely reaction and risk.' },
  { n: '03', t: 'Refine, then send', d: 'Tune the tone and length, revise any line, and send something you’re proud of.' },
]

// Rotated number discs + twinkling sparks per step, as in the v1 landing's
// "how it works" row (mapped to Daybreak tokens).
const STEP_COLORS = [
  { disc: 'var(--peach-200)', ink: 'var(--coral-500)', spark: 'var(--coral-400)', delay: '0s' },
  { disc: 'var(--honey-300)', ink: 'var(--honey-600)', spark: 'var(--honey-500)', delay: '1.6s' },
  { disc: 'var(--peri-200)', ink: 'var(--royal-700)', spark: 'var(--royal-600)', delay: '3.2s' },
]

const PLANS = [
  { name: 'Free', price: '$0', note: 'For the occasional hard message', feats: ['20 messages a month', 'Tone & length tuning', '3 options per message'], cta: 'Start free', variant: 'outline' },
  { name: 'Plus', price: '$8', note: 'For everything you send', feats: ['Unlimited messages', 'Pros / cons / reaction analysis', 'Your saved voice & tones', 'Follow-up drafting'], cta: 'Go Plus', variant: 'spark', featured: true },
]

export default function Landing({ onStart }) {
  const { Button, Badge, Sparkle, Avatar, Card, Tag } = DS2
  const start = () => onStart(null)
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-sans)' }}>
      {/* header — shared sticky chrome, landing variant (solid wordmark,
          hero-layout-concepts nav type) */}
      <SiteHeader landing onLogo={start} onNav={scrollTo} onStart={start} />

      {/* hero — grainy Daybreak gradient. Pulled up under the 68px sticky
          header (with matching padding) so the gradient runs from the very
          top of the screen, showing through the frosted header. */}
      <section className="grad-daybreak" style={{ marginTop: -68, paddingTop: 68 }}>
        <div className="lp2-hero">
          <img className="lp2-float d1" src="/ds-v2/assets/characters/ctx-sent.svg" style={{ width: 118, top: 64, right: '12%' }} alt="" />
          <img className="lp2-float d2" src="/ds-v2/assets/characters/ctx-waiting.svg" style={{ width: 112, bottom: 44, left: '9%' }} alt="" />
          <img className="lp2-float d3" src="/ds-v2/assets/characters/spark.svg" style={{ width: 60, top: 120, left: '16%' }} alt="" />
          {/* paddingTop nudges the hero content down without moving the
              absolutely-positioned floating characters above */}
          <div className="wrap" style={{ paddingTop: 16 }}>
            <Badge tone="gradient"><Sparkle size={11} style={{ color: '#fff' }} />Now with tone &amp; length tuning</Badge>
            <h1 className="lp2-h1">Say the hard thing,<br />
              <span style={{ whiteSpace: 'nowrap' }}>
                <SwapWord words={SWAP_WORDS} />
                <span style={{ marginLeft: '-0.04em' }}>.</span>
                <span className="lp2-tw" style={{ fontSize: '.6em', verticalAlign: '.3em', marginLeft: '.12em' }}>✦</span>
              </span>
            </h1>
              <p className="lp2-lead">A boundary, a dispute, a message you’ve rewritten five times. Betterwords helps you write the messages that matter most — and shows you how each way is likely to land.</p>
            {/*<p className="lp2-lead">Betterwords helps you write the messages that matter most — and shows you how each way of saying it is likely to land.</p>*/}
            {/* CTA row — sized/spaced like the v1 hero pair ("Compose a
                message →" / "See how it works"): ~50px primary pill, 16px
                gap, text-like borderless secondary. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 52, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="gradient-warm" size="lg" iconRight={<Sparkle size={16} style={{ color: '#fff' }} />} onClick={start} style={{ height: 50, padding: '0 28px', fontSize: 16 }}>Start writing free</Button>
              <Button variant="ghost" size="lg" onClick={() => scrollTo('examples')} style={{ height: 50, fontSize: 15, color: 'var(--ink-700)' }}>See an example</Button>
            </div>
            {/* Hidden for now — flip back on alongside pricing.
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-600)' }}>No card needed · Free for your first 20 messages</div> */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 52, fontWeight: 600, fontSize: 13.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
              <span>Boundaries</span>
              <Sparkle size={14} style={{ color: 'var(--spark)', display: 'block' }} />
              <span>Disputes</span>
              <Sparkle size={14} style={{ color: 'var(--spark)', display: 'block' }} />
              <span>Speaking up</span>
            </div>
          </div>
        </div>
      </section>

      {/* what you'll send — its own section on the base background, no
          longer sharing the hero's gradient */}
      <RegisterSection />

      {/* how it works */}
      <section id="how" className="section">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 52 }}>
            <span className="site-kick">How it works</span>
            <h2 className="site-h2" style={{ marginTop: 12 }}>Three steps to the right words.</h2>
          </div>
          <div className="grid3" style={{ gap: 30 }}>
            {STEPS.map((s, i) => {
              const col = STEP_COLORS[i]
              return (
                <div key={s.n} style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: col.ink, background: col.disc, width: 52, height: 52, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)', boxShadow: 'var(--shadow-xs)' }}>{s.n}</span>
                      <span style={{ position: 'absolute', top: -9, right: -9, color: col.spark, animation: `bw-twinkle 4s var(--ease-in-out) ${col.delay} infinite` }}>
                        <Sparkle size={18} />
                      </span>
                      <span style={{ position: 'absolute', bottom: -5, left: -6, color: col.spark, opacity: 0.7, animation: `bw-twinkle 4s var(--ease-in-out) ${col.delay} infinite reverse` }}>
                        <Sparkle size={11} />
                      </span>
                    </span>
                    <div className="rule-dotted" style={{ flex: 1 }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 25, lineHeight: 1.1, color: 'var(--text-strong)', margin: '0 0 10px' }}>{s.t}</h3>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>{s.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* live example — interactive tone/length preview */}
      <LiveExample />

      {/* where it helps — direct-entry scenario cards (jump straight into a flow) */}
      <section id="situations" className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="wrap">
          <div style={{ marginBottom: 40 }}>
            <span className="site-kick">Where it helps</span>
            <h2 className="site-h2" style={{ marginTop: 12 }}>For the messages you<br />rewrite five times.</h2>
            <p className="site-lead" style={{ marginTop: 18, maxWidth: '48ch' }}>Pick the situation closest to yours and we’ll take it from there — the high-stakes notes where tone is everything.</p>
          </div>
          <div className="grid3">
            {SCENARIO_IDS.map((id) => {
              const d = DATA[id]
              return (
                <Card key={id} className="adv-card-hover bw-home-card" onClick={() => onStart(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 28px', cursor: 'pointer' }}>
                  <img src={`/ds-v2/assets/characters/${SCENARIO_ART[id]}.svg`} alt="" style={{ width: 128, height: 110, objectFit: 'contain', margin: '0 0 20px' }} />
                  <div className="site-kick" style={{ marginBottom: 12 }}>{d.kicker}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 25, lineHeight: 1.08, color: 'var(--text-strong)', margin: '0 0 14px' }}>{d.label}</h3>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 24px' }}>{d.home.blurb}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 'auto' }}>
                    {d.home.examples.map((ex) => <Tag key={ex}>{ex}</Tag>)}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* quote — night band */}
      {SHOW_TESTIMONIAL && (
      <section className="section night" style={{ background: 'var(--ink-800)' }}>
        <div className="wrap center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Sparkle size={30} style={{ color: 'var(--spark)' }} twinkle />
          <p className="serif" style={{ fontStyle: 'italic', fontSize: 'clamp(26px,3.6vw,42px)', lineHeight: 1.3, color: 'var(--paper-0)', maxWidth: '20ch', margin: '20px 0 24px' }}>
            “I finally sent the message I’d been avoiding for a month.”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name="Mara Ellis" tone="peach" size={44} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--paper-0)', fontWeight: 600, fontSize: 15 }}>Mara Ellis</div>
              <div style={{ color: 'var(--peri-300)', fontSize: 13 }}>BetterWords member</div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* pricing */}
      {SHOW_PRICING && (
      <section id="pricing" className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 48 }}>
            <span className="site-kick">Pricing</span>
            <h2 className="site-h2" style={{ marginTop: 12 }}>Simple, like it should be.</h2>
          </div>
          <div className="lp-pricing" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, maxWidth: 760, margin: '0 auto' }}>
            {PLANS.map((p) => (
              <div key={p.name} className={p.featured ? 'night' : ''} style={{ position: 'relative', borderRadius: 'var(--radius-xl)', padding: '32px 30px', background: p.featured ? 'var(--ink-800)' : 'var(--bg-base)', color: p.featured ? 'var(--paper-0)' : 'var(--text-body)', border: p.featured ? '0' : '1px solid var(--border-soft)', boxShadow: p.featured ? 'var(--shadow-lg)' : 'none' }}>
                {p.featured && <div style={{ position: 'absolute', top: 26, right: 26 }}><Badge tone="gradient" size="sm"><Sparkle size={9} style={{ color: '#fff' }} />Popular</Badge></div>}
                <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '.02em' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 4px' }}>
                  <span className="serif" style={{ fontSize: 52, fontWeight: 600, color: p.featured ? 'var(--paper-0)' : 'var(--text-strong)' }}>{p.price}</span>
                  <span style={{ fontSize: 14, opacity: 0.7 }}>/ month</span>
                </div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>{p.note}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
                  {p.feats.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5 }}>
                      <span style={{ color: p.featured ? 'var(--spark)' : 'var(--mint-600)', display: 'inline-flex' }}><Sparkle size={13} /></span>{f}
                    </div>
                  ))}
                </div>
                <Button variant={p.variant} block onClick={start}>{p.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* closing CTA — night starfield (from the v1 landing, Daybreak-styled) */}
      <section className="section night bg-night-sky">
        <div className="wrap center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Sparkle size={34} style={{ color: 'var(--foil)' }} twinkle />
          <h2 className="site-h2" style={{ marginTop: 22, maxWidth: '18ch' }}>The words you can’t find — found.</h2>
          <p className="site-lead" style={{ marginTop: 18, maxWidth: '42ch' }}>
            Stop drafting the same hard message at midnight. Tell BetterWords the situation, and send something you’re proud of.
          </p>
          <div style={{ marginTop: 30 }}>
            <Button variant="spark" size="lg" iconRight={<Sparkle size={16} style={{ color: '#fff' }} />} onClick={start}>Compose a message</Button>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>Rehearse your approach as many times as you need · Till it feels right</div>
        </div>
      </section>

      {/* footer */}
      <SiteFooter onNav={scrollTo} />
    </div>
  )
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Hero swap word — letters rise in staggered, blur out, cycle every 2.6s.
function SwapWord({ words }) {
  const [word, setWord] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (reducedMotion()) return
    let swap = null
    const iv = setInterval(() => {
      setLeaving(true)
      swap = setTimeout(() => {
        setWord((w) => (w + 1) % words.length)
        setLeaving(false)
      }, 330)
    }, 2600)
    return () => { clearInterval(iv); clearTimeout(swap) }
  }, [words.length])

  return (
    <span className="lp2-swap">
      {words[word].split('').map((ch, k) => (
        <span
          key={`${word}-${k}`}
          className={`lp2-ltr ${leaving ? 'out' : 'in'}`}
          style={{ animationDelay: `${k * (leaving ? 24 : 40)}ms` }}
        >{ch}</span>
      ))}
    </span>
  )
}

// Register section — left copy synced to the front card of a shuffling
// letter stack; the front card lifts up-left, then tucks to the back.
function RegisterSection() {
  const [order, setOrder] = useState([0, 1, 2])
  const [lift, setLift] = useState(null)
  const orderRef = useRef(order)
  orderRef.current = order
  const timer = useRef(null)
  const liftTimer = useRef(null)

  const shuffle = () => {
    setLift(orderRef.current[0])
    liftTimer.current = setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]])
      setLift(null)
    }, 300)
  }
  const restart = () => {
    clearInterval(timer.current)
    if (!reducedMotion()) timer.current = setInterval(shuffle, 4600)
  }

  useEffect(() => {
    restart()
    return () => { clearInterval(timer.current); clearTimeout(liftTimer.current) }
  }, [])

  const go = (id) => {
    clearTimeout(liftTimer.current)
    setLift(null)
    setOrder((o) => [id, ...o.filter((x) => x !== id)])
    restart()
  }

  const POS = [
    'translate(0,0) scale(1) rotate(0deg)',
    'translate(14px,28px) scale(.955) rotate(2.4deg)',
    'translate(-6px,52px) scale(.912) rotate(-2.6deg)',
  ]
  const OPA = [1, 0.97, 0.92]
  const front = LETTERS[order[0]]

  return (
    <div className="lp2-reg">
      <div className="wrap">
        <div className="lp2-reg-grid">
          <div>
            <span className="site-kick">What you’ll send</span>
            <h2 key={`t-${order[0]}`} className="lp2-reg-title lp2-afade" style={{ marginTop: 12 }}>{front.title}</h2>
            <p key={`p-${order[0]}`} className="lp2-reg-para lp2-afade">{front.para}</p>
            <div className="lp2-pips">
              {LETTERS.map((d, i) => (
                <button key={i} className={order[0] === i ? 'on' : ''} aria-label={d.pip} onClick={() => go(i)} />
              ))}
            </div>
          </div>
          <div className="lp2-stack">
            {LETTERS.map((d, id) => {
              const rank = order.indexOf(id)
              const lifting = lift === id
              return (
                <article
                  key={id}
                  className="lp2-letter"
                  style={{
                    transform: lifting ? 'translate(-18px,-40px) scale(1.03) rotate(-5deg)' : POS[rank],
                    opacity: OPA[rank],
                    zIndex: lifting ? 6 : 3 - rank,
                    boxShadow: lifting ? 'var(--shadow-xl)' : rank === 0 ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                  }}
                >
                  <span className="lp2-stamp"><img src={`/ds-v2/assets/characters/${d.ill}.svg`} alt="" /></span>
                  {d.rec && <span className="lp2-ltop">✦ Recommended</span>}
                  <div className="lp2-lhead">
                    <div className="lp2-lrow"><span className="lp2-llab">To</span><span className="lp2-lval">{d.to}</span></div>
                    <div className="lp2-lrow"><span className="lp2-llab">Re</span><span className="lp2-lval re">{d.re}</span></div>
                  </div>
                  <hr className="lp2-lrule" />
                  <div className="lp2-lbody">
                    {d.body.map((p) => <p key={p}>{p}</p>)}
                  </div>
                  <div className="lp2-lfoot">
                    <div className="lp2-ltags">
                      {d.tags.map(([t, bg, ink]) => <span key={t} className="lp2-ptag" style={{ background: bg, color: ink }}>{t}</span>)}
                    </div>
                    <div className="lp2-lland"><b>Likely to land</b><em>{d.land}</em></div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveExample() {
  const { Segmented, Slider, Card, Badge, Sparkle, Tag } = DS2
  const variants = {
    Soft: 'Hi — just a gentle follow-up on the heating repair whenever you get a chance. Thank you so much!',
    Moderate: 'Hi — following up on the heating, which has been out three weeks. With it getting cold, could someone come this week? I’d appreciate a firm date.',
    Strong: 'This is my third request about the heating, unaddressed for three weeks. Please confirm a repair date within 48 hours.',
  }
  const [tone, setTone] = useState('Moderate')
  return (
    <section id="examples" className="section grad-soft" style={{ backgroundImage: 'linear-gradient(350deg, #FBF7EF 0%, #F1EEFB 52%, #FDECE0 100%)' }}>
      <div className="wrap lp-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <span className="site-kick">Watch it work</span>
          <h2 className="site-h2" style={{ marginTop: 14 }}>One message,<br />every register.</h2>
          <p className="site-lead" style={{ marginTop: 16, maxWidth: '40ch' }}>Slide the tone from soft to strong and watch the words change — never the meaning, never your voice.</p>
          <div style={{ marginTop: 24, maxWidth: 340 }}>
            <div className="site-kick" style={{ marginBottom: 10, color: 'var(--text-muted)' }}>Tone</div>
            <Segmented block options={['Soft', 'Moderate', 'Strong']} value={tone} onChange={setTone} />
            <div className="site-kick" style={{ margin: '22px 0 12px', color: 'var(--text-muted)' }}>Length</div>
            <Slider defaultValue={40} labelStart="Succinct" labelEnd="Detailed" />
          </div>
        </div>
        <Card variant="draft" style={{ padding: 30, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span className="site-kick" style={{ color: 'var(--text-muted)' }}>To your landlord</span>
            {tone === 'Moderate' && <Badge tone="gradient" size="sm"><Sparkle size={9} style={{ color: '#fff' }} />Recommended</Badge>}
          </div>
          <p className="serif" style={{ margin: 0, fontSize: 22, lineHeight: 1.6, color: 'var(--text-strong)' }}>{variants[tone]}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            {['Warmer', 'Shorter', 'Add a deadline'].map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        </Card>
      </div>
    </section>
  )
}
