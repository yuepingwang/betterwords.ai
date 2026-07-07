import React, { useState } from 'react'
import DS2 from '../ds2'
import { DATA, SCENARIO_IDS } from '../../data/advocate'
import './Landing.css'

// v2 Landing — rebuilt to the "betterwords-web" desktop reference kit
// (claude.ai/design). Composes the Daybreak bundle; CTAs enter the app via
// onStart(null) → Home, and the scenario cards jump straight into a flow.

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

const STEPS = [
  { icon: 'chat', n: '01', t: 'Tell us the situation', d: 'A few quick questions about who it’s for, what you need, and what worries you most.' },
  { icon: 'sparkle', n: '02', t: 'Choose how to say it', d: 'See several honest drafts — gentle to direct — each with its likely reaction and risk.' },
  { icon: 'envelope', n: '03', t: 'Refine, then send', d: 'Tune the tone and length, revise any line, and send something you’re proud of.' },
]

const PLANS = [
  { name: 'Free', price: '$0', note: 'For the occasional hard message', feats: ['20 messages a month', 'Tone & length tuning', '3 options per message'], cta: 'Start free', variant: 'outline' },
  { name: 'Plus', price: '$8', note: 'For everything you send', feats: ['Unlimited messages', 'Pros / cons / reaction analysis', 'Your saved voice & tones', 'Follow-up drafting'], cta: 'Go Plus', variant: 'spark', featured: true },
]

const FOOTER_COLS = [
  ['Product', ['How it works', 'Examples', 'Pricing']],
  ['Company', ['About', 'Careers', 'Blog']],
  ['Legal', ['Privacy', 'Terms']],
]

export default function Landing({ onStart }) {
  const { Logo, Button, Badge, Sparkle, Icon, Avatar, Divider, Card, Tag } = DS2
  const start = () => onStart(null)
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-sans)' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(251,247,239,0.72)', borderBottom: '1px solid var(--border-hair)' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <span style={{ cursor: 'pointer', display: 'inline-flex' }} onClick={start}><Logo variant="gradient" size={24} /></span>
          <nav className="lp-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a className="lp-link" onClick={() => scrollTo('how')} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>How it works</a>
            <a className="lp-link" onClick={() => scrollTo('situations')} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>Situations</a>
            <a className="lp-link" onClick={() => scrollTo('pricing')} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>Pricing</a>
            <Button variant="primary" size="sm" onClick={start}>Start free</Button>
          </nav>
        </div>
      </header>

      {/* hero — grainy Daybreak gradient */}
      <section className="grad-daybreak" style={{ paddingTop: 84, paddingBottom: 96 }}>
        <div className="wrap center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Badge tone="gradient"><Sparkle size={11} style={{ color: '#fff' }} />Now with tone &amp; length tuning</Badge>
          <h1 className="site-h1" style={{ marginTop: 22, maxWidth: '16ch' }}>Say the hard thing — well.</h1>
          <p className="site-lead" style={{ marginTop: 20, maxWidth: '46ch', color: 'var(--ink-700)' }}>
            A boundary, a dispute, a message you’ve rewritten five times. BetterWords finds the words — in your voice — and shows how each way is likely to land.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="spark" size="lg" iconRight={<Sparkle size={16} style={{ color: '#fff' }} />} onClick={start}>Start writing free</Button>
            <Button variant="outline" size="lg" onClick={() => scrollTo('examples')}>See an example</Button>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-600)' }}>No card needed · Free for your first 20 messages</div>
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

      {/* quote — night band */}
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

      {/* pricing */}
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

      {/* footer */}
      <footer style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-hair)', padding: '56px 0 40px' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ maxWidth: 320 }}>
            <Logo size={22} />
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6 }}>The right words, warmer. BetterWords helps you say the things that matter.</p>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {FOOTER_COLS.map(([h, items]) => (
              <div key={h}>
                <div className="site-kick" style={{ marginBottom: 14, color: 'var(--text-muted)' }}>{h}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((i) => <a key={i} className="lp-link" style={{ fontSize: 14, cursor: 'pointer' }}>{i}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="wrap" style={{ marginTop: 40 }}><Divider /></div>
        <div className="wrap" style={{ marginTop: 20, fontSize: 13, color: 'var(--text-faint)' }}>© 2026 BetterWords · Say the hard thing, well ✦</div>
      </footer>
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
        <Card variant="draft" style={{ padding: 30 }}>
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
