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

// Shuffling hero letter deck (layout from the v1 landing, recolored to Daybreak).
const HERO_CARDS = [
  {
    to: 'My landlord — Mr. Aubert', re: 'Return of my security deposit',
    p1: 'I’m writing to request the return of my $1,850 security deposit for 14 Rue Pelletier. My tenancy ended on 30 May and the deposit is now due.',
    p2: 'Please return it, or provide a written itemization of any deductions, within seven days.',
    tag: 'Documented', tagBg: 'var(--peri-100)', tagInk: 'var(--blue-700)',
    right: 'Impact High', rightInk: 'var(--mint-600)',
    postL1: 'Ready', postL2: 'to send', postColor: 'var(--coral-500)',
  },
  {
    to: 'My brother — Daniel', re: 'Something I need to be honest about',
    p1: 'I love you, so I’d rather be honest than keep giving you a soft “maybe.” I’m not able to lend money anymore — and I need that to be a consistent answer, not a one-off.',
    p2: 'This is about my own limits, not your worth to me. What I can offer is my time and a brother who isn’t keeping score.',
    tag: 'Honest & Kind', tagBg: 'var(--peri-100)', tagInk: 'var(--blue-700)',
    right: 'Impact High', rightInk: 'var(--mint-600)',
    postL1: 'Said', postL2: 'with care', postColor: 'var(--blue-600)',
  },
  {
    to: 'Mom', re: 'A little notice before visits',
    p1: 'I love having you close, and I want to be honest about something small. Could we text first before stopping by, instead of surprise visits?',
    p2: 'It isn’t about wanting you less — a little notice just helps me be fully present when you’re here.',
    tag: 'Warm & Clear', tagBg: 'var(--peach-200)', tagInk: 'var(--peach-600)',
    right: 'Reaction Warm', rightInk: 'var(--mint-600)',
    postL1: 'Sealed', postL2: 'with love', postColor: 'var(--honey-600)',
  },
]

const STEPS = [
  { icon: 'chat', n: '01', t: 'Tell us the situation', d: 'A few quick questions about who it’s for, what you need, and what worries you most.' },
  { icon: 'sparkle', n: '02', t: 'Choose how to say it', d: 'See several honest drafts — gentle to direct — each with its likely reaction and risk.' },
  { icon: 'envelope', n: '03', t: 'Refine, then send', d: 'Tune the tone and length, revise any line, and send something you’re proud of.' },
]

const PLANS = [
  { name: 'Free', price: '$0', note: 'For the occasional hard message', feats: ['20 messages a month', 'Tone & length tuning', '3 options per message'], cta: 'Start free', variant: 'outline' },
  { name: 'Plus', price: '$8', note: 'For everything you send', feats: ['Unlimited messages', 'Pros / cons / reaction analysis', 'Your saved voice & tones', 'Follow-up drafting'], cta: 'Go Plus', variant: 'spark', featured: true },
]

export default function Landing({ onStart }) {
  const { Button, Badge, Sparkle, Icon, Avatar, Card, Tag } = DS2
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

      {/* hero — grainy Daybreak gradient, v1 two-column layout:
          copy on the left, shuffling letter deck on the right. Pulled up
          under the 68px sticky header so the gradient runs from the very
          top of the screen, showing through the frosted header. */}
      <section className="grad-daybreak" style={{ marginTop: -68, paddingTop: 140, paddingBottom: 112 }}>
        <div className="wrap lp-hero" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
          <div className="lp-hero-copy">
            <Badge tone="gradient"><Sparkle size={11} style={{ color: '#fff' }} />Now with tone &amp; length tuning</Badge>
            <h1 className="site-h1" style={{ margin: '22px 0 20px', maxWidth: '14ch' }}>Say the hard thing — well.</h1>
            <p className="site-lead" style={{ margin: '0 0 30px', maxWidth: '44ch', color: 'var(--ink-700)' }}>
              A boundary, a dispute, a message you’ve rewritten five times. BetterWords finds the words — in your voice — and shows how each way is likely to land.
            </p>
            <div className="lp-hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="spark" size="lg" iconRight={<Sparkle size={16} style={{ color: '#fff' }} />} onClick={start}>Start writing free</Button>
              <Button variant="outline" size="lg" onClick={() => scrollTo('examples')}>See an example</Button>
            </div>
            <div className="lp-hero-tags" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 36, fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-600)' }}>
              <span>Boundaries</span>
              <Sparkle size={11} style={{ color: 'var(--spark)' }} />
              <span>Disputes</span>
              <Sparkle size={11} style={{ color: 'var(--spark)' }} />
              <span>Speaking up</span>
            </div>
          </div>
          <HeroDeck />
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="section">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 52 }}>
            <span className="site-kick">How it works</span>
            <h2 className="site-h2" style={{ marginTop: 12 }}>Three steps to the right words.</h2>
          </div>
          <div className="grid3">
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-xl)', padding: '30px 26px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <Icon name={s.icon} size={26} />
                </span>
                <div className="site-kick" style={{ marginTop: 18, color: 'var(--spark)' }}>{s.n}</div>
                <h3 className="serif" style={{ margin: '6px 0 8px', fontSize: 25, fontWeight: 500, color: 'var(--text-strong)' }}>{s.t}</h3>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* live example — interactive tone/length preview */}
      <LiveExample />

      {/* where it helps — direct-entry scenario cards (jump straight into a flow) */}
      <section id="situations" className="section">
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
            <div>
              <span className="site-kick">Where it helps</span>
              <h2 className="site-h2" style={{ marginTop: 12 }}>For the messages you<br />rewrite five times.</h2>
            </div>
            <p className="site-lead" style={{ maxWidth: '34ch' }}>Pick the situation closest to yours and we’ll take it from there — the high-stakes notes where tone is everything.</p>
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

function HeroDeck() {
  const [card, setCard] = useState(0)
  const timer = useRef(null)
  const n = HERO_CARDS.length

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    timer.current = setInterval(() => setCard((c) => (c + 1) % n), 4400)
    return () => clearInterval(timer.current)
  }, [n])

  const goCard = (i) => {
    if (i === card) return
    clearInterval(timer.current)
    setCard(i)
    timer.current = setInterval(() => setCard((c) => (c + 1) % n), 4400)
  }

  const c = HERO_CARDS[card]

  return (
    <div className="lp-hero-deck" style={{ position: 'relative', perspective: '1700px', height: 446, marginTop: 48 }}>
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
              background: depth === 0 ? 'var(--surface-card)' : 'var(--peri-300)',
              border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)',
              boxShadow: depth === 0 ? 'var(--shadow-lg)' : 'var(--shadow-md)', padding: '28px 32px',
              transformOrigin: 'center bottom', zIndex: 10 - depth,
              transform: `translate(${offX}px,${offY}px) scale(${scale}) rotate(${rot}deg)`,
              transition: 'transform 0.75s cubic-bezier(.45,.05,.2,1), background 0.6s var(--ease-out), box-shadow 0.75s var(--ease-out)',
            }}
          >
            <div style={{ opacity: depth === 0 ? 1 : 0, transition: 'opacity 0.55s var(--ease-out)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: '6px 12px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 14, marginBottom: 16, fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span><span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{cardData.to}</span>
                <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span><span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{cardData.re}</span>
              </div>
              <p className="serif" style={{ fontSize: 17.5, lineHeight: 1.55, color: 'var(--text-body)', margin: '0 0 12px' }}>{cardData.p1}</p>
              <p className="serif" style={{ fontSize: 17.5, lineHeight: 1.55, color: 'var(--text-body)', margin: 0 }}>{cardData.p2}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-hair)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: cardData.tagInk, background: cardData.tagBg, padding: '5px 11px', borderRadius: 999 }}>{cardData.tag}</span>
                <span style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: cardData.rightInk }}>{cardData.right}</span>
              </div>
            </div>
          </div>
        )
      })}
      {/* postmark badge (front card) */}
      <div style={{ position: 'absolute', top: -22, right: -14, transform: 'rotate(8deg)', zIndex: 20 }}>
        <span className="lp-postmark" style={{ width: 74, height: 74, color: c.postColor, background: 'rgba(251,247,239,0.72)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.15 }}>
          {c.postL1}<br />{c.postL2}
        </span>
      </div>
      {/* dots */}
      <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 9, alignItems: 'center', zIndex: 20 }}>
        {HERO_CARDS.map((_, i) => (
          <button key={i} aria-label="Show example" onClick={() => goCard(i)} style={{ width: i === card ? 22 : 8, height: 8, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', transition: 'width .3s var(--ease-out), background .3s var(--ease-out)', background: i === card ? 'var(--accent)' : 'var(--peri-400)' }} />
        ))}
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
    <section id="examples" className="section" style={{ background: 'var(--bg-elevated)' }}>
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
