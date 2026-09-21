import React, { useEffect, useRef, useState } from 'react'
import DS2 from '../ds2'
import { SiteHeader, SiteFooter } from '../components/SiteChrome'
import { DATA, SCENARIO_IDS } from '../data/advocate'
import { GrainGradient, Dithering } from '@paper-design/shaders-react'
import './Landing.css'

// Hero background version switch — 'v1' is the pixel bitmap clouds
// (snapshot: landing-background-v1.md); 'v2-shader' portrays the clouds
// with Paper's GrainGradient shader in the same daybreak palette.
const LANDING_BG = 'v2-shader'
const REDUCE_MOTION =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
// render the grain shaders at 2× the device's own pixel ratio: grain specks
// come out half a device pixel — "2× finest"
const GRAIN_2X_RATIO = typeof window !== 'undefined' ? Math.max(2, (window.devicePixelRatio || 1) * 2) : 4

// v3 Landing (forked from v2) — rebuilt to the "betterwords-web" desktop reference kit
// (claude.ai/design). Composes the Daybreak bundle; CTAs enter the app via
// onStart(null) → Home, and the scenario cards jump straight into a flow.

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }
// hover edge tints matching the Home scenario cards (see Home's CARD_TONES)
const SCENARIO_EDGE = { rights: 'var(--peach-300)', personal: 'var(--lilac-400)', circle: 'var(--honey-400)' }

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

  // Hero background anchor: the background stack (gradient, haze shader,
  // clouds) is position:fixed at the viewport top, so it simply never
  // moves with scroll — no per-scroll JS, hence no compositor jitter.
  // It's sized to the hero section here so the gradient keeps its
  // proportions; the opaque sections after the hero cover it as they
  // scroll over.
  const heroGradRef = React.useRef(null)
  React.useEffect(() => {
    const el = heroGradRef.current
    if (!el) return
    const sect = el.closest('section')
    if (!sect) return
    const size = () => { el.style.height = `${sect.offsetHeight}px` }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(sect)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ position: 'relative', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-sans)' }}>
      {/* header — shared sticky chrome, landing variant (solid wordmark,
          hero-layout-concepts nav type). The wordmark just scrolls back to
          the top of the landing page. */}
      <SiteHeader landing onLogo={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onNav={scrollTo} onStart={start} />

      {/* hero — grainy Daybreak gradient. Pulled up under the 68px sticky
          header (with matching padding) so the gradient runs from the very
          top of the screen, showing through the frosted header. */}
      <section className="grad-daybreak" style={{ marginTop: -68, paddingTop: 68, backgroundImage: 'none' }}>
        {/* Parallax ground — the hero gradient moved into a translatable
            layer (the section keeps its grain ::before; its own gradient is
            switched off above). On scroll the gradient rises slower than
            the page; see the scroll effect below. The wrapper clips the
            slid layer at the section's edges. */}
        <div className="lp-hero-parallax" aria-hidden>
          {/* the whole background stack (gradient + haze shader + clouds)
              rides in this viewport-fixed layer anchored at y=0 — it never
              moves with scroll; the sections below (all opaque) cover it
              as they scroll over the hero */}
          <div ref={heroGradRef} className="lp-hero-fixee">
          <div className="lp-hero-grad" />
          {/* v2: the cloud haze as a Paper GrainGradient shader — spread
              wide and soft (no hot crest) in the theme's cream/lilac/peri
              over the daybreak gradient; reduced motion freezes it. */}
          {LANDING_BG === 'v2-shader' && (
            // rendered at 2× the device's native resolution (supersampled,
            // then downscaled to fit), so the per-pixel grain comes out
            // twice as fine as a device pixel
            <GrainGradient
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              minPixelRatio={GRAIN_2X_RATIO}
              maxPixelCount={34000000}
              colorBack="#00000000"
              colors={['#FFFDF9', '#EFE8F7', '#DCE6FB', '#CFDDFB']}
              shape="wave"
              softness={0.95}
              intensity={0.3}
              noise={0.38}
              speed={REDUCE_MOTION ? 0 : 0.4}
              scale={1.7}
              frame={4500}
            />
          )}
          {/* the individual clouds, rendered THROUGH the Dithering shader
              (Paper): each puff is a small canvas of morphing simplex noise
              quantized by a 4×4 Bayer matrix in the theme cream, and a soft
              elliptical mask dissolves its contour into scattered dither
              dots. The drift + bob wrappers are unchanged; the first cloud
              keeps its pixel face. */}
          <div className="lp-clouds">
            {[
              { top: 60, width: 420, height: 210, dur: '95s', delay: '-12s', rest: '10vw', op: 0.95, speed: 0.32, scale: 0.5, frame: 0, face: true },
              { top: 140, width: 300, height: 150, dur: '135s', delay: '-78s', rest: '58vw', op: 0.85, speed: 0.42, scale: 0.6, frame: 4200 },
              { top: 30, width: 220, height: 110, dur: '160s', delay: '-110s', rest: '80vw', op: 0.78, speed: 0.5, scale: 0.7, frame: 9400 },
              { top: 300, width: 370, height: 185, dur: '115s', delay: '-45s', rest: '30vw', op: 0.6, speed: 0.36, scale: 0.55, frame: 14600 },
              { top: 420, width: 280, height: 140, dur: '145s', delay: '-20s', rest: '72vw', op: 0.5, speed: 0.28, scale: 0.65, frame: 20800 },
            ].map((c, i) => (
              <span key={i} className="lp-cloud" style={{ top: c.top, width: c.width, height: c.height, '--dur': c.dur, '--delay': c.delay, '--rest': c.rest, '--op': c.op }}>
                <span className="lp-cloud-inner">
                  {/* animated simplex pass, ring-masked to the OUTER band
                      only — the fade-in/out of dither happens at the
                      cloud's edge, never through the center */}
                  <span className="lp-cloud-fringe" aria-hidden>
                    <Dithering
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      colorBack="#00000000"
                      colorFront="#FFFDF9"
                      shape="simplex"
                      type="4x4"
                      size={2}
                      scale={c.scale}
                      frame={c.frame}
                      speed={REDUCE_MOTION ? 0 : c.speed * 1.8}
                    />
                  </span>
                  {/* STATIC dense body pass (speed 0): the sphere shape's
                      solid center fills the whole silhouette, so the cloud's
                      body never animates or thins */}
                  <span className="lp-cloud-core" aria-hidden>
                    <Dithering
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'translate(1px, 1px)' }}
                      colorBack="#00000000"
                      colorFront="#FFFDF9"
                      shape="sphere"
                      type="4x4"
                      size={2}
                      scale={2.1}
                      frame={c.frame + 3100}
                      speed={0}
                    />
                  </span>
                  {c.face && (
                    <span className="lp-cloud-face" aria-hidden>
                      <i className="e" style={{ left: '46.3%' }} />
                      <i className="e" style={{ left: '57.3%' }} />
                      <i className="b" style={{ left: '41.9%' }} />
                      <i className="b" style={{ left: '61.75%' }} />
                    </span>
                  )}
                </span>
              </span>
            ))}
          </div>
          </div>
        </div>
        <div className="lp2-hero">
          {/* pixel-sprite hero critters (assets/pixel/{bird,snail,spark}.svg)
              — hidden for now; flip this block back on to bring them back.
          <img className="lp2-float d1" src="/ds-v4/assets/pixel/bird.svg" style={{ width: 104, top: 64, right: '12%' }} alt="" />
          <img className="lp2-float d2" src="/ds-v4/assets/pixel/snail.svg" style={{ width: 95, bottom: 44, left: '9%' }} alt="" />
          <img className="lp2-float d3" src="/ds-v4/assets/pixel/spark.svg" style={{ width: 70, top: 120, left: '16%' }} alt="" />
          */}
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
              <Button variant="gradient-warm" size="lg" iconRight={<img src="/ds-v4/assets/glyphs/logo-star-white.svg" alt="" width={13} height={13} style={{ display: 'block', transform: 'translateY(2px)' }} />} onClick={start} style={{ height: 50, padding: '0 28px', fontSize: 16 }}>Start writing free</Button>
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
      <section id="how" className="section grad-soft" style={{ backgroundImage: 'linear-gradient(350deg, #FBF7EF 0%, #F1EEFB 52%, #FDECE0 100%)' }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 52 }}>
            <span className="site-kick">How it works</span>
            <h2 className="site-h2" style={{ marginTop: 12 }}>Three steps from stumped to sent.</h2>
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
      <section id="situations" className="section" style={{ background: 'var(--bg-base)' }}>
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
                <Card key={id} className="adv-card-hover bw-home-card" onClick={() => onStart(id)} style={{ '--card-edge': SCENARIO_EDGE[id], display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 28px', cursor: 'pointer' }}>
                  <img src={`/ds-v4/assets/characters/${SCENARIO_ART[id]}.svg`} alt="" style={{ width: 128, height: 110, objectFit: 'contain', margin: '0 0 20px' }} />
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

      {/* closing CTA + footer — one shared night ground (starfield + the
          hero's GrainGradient noise recipe in the night palette) running
          from the CTA's top edge through the bottom of the footer */}
      <div className="bg-night-sky lp-night-wrap">
        <div className="lp-night-haze" aria-hidden>
          <GrainGradient
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            minPixelRatio={GRAIN_2X_RATIO}
            maxPixelCount={34000000}
            colorBack="#00000000"
            colors={['#1E1A4E', '#33418C', '#201B4E', '#45304A']}
            shape="wave"
            softness={1}
            intensity={0}
            noise={0.38}
            speed={REDUCE_MOTION ? 0 : 0.4}
            scale={4}
            offsetY={0.3}
            frame={12000}
          />
        </div>
        <section className="section night">
          <div className="wrap center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Sparkle size={34} style={{ color: 'var(--foil)' }} twinkle />
            <h2 className="site-h2" style={{ marginTop: 22, maxWidth: '18ch' }}>The words you can’t find — found.</h2>
            <p className="site-lead" style={{ marginTop: 18, maxWidth: '42ch' }}>
              Stop drafting the same hard message at midnight. Tell BetterWords the situation, and send something you’re proud of.
            </p>
            <div style={{ marginTop: 30 }}>
              <Button variant="gradient-warm" size="lg" iconRight={<img src="/ds-v4/assets/glyphs/logo-star-white.svg" alt="" width={13} height={13} style={{ display: 'block', transform: 'translateY(2px)' }} />} onClick={start}>Compose a message</Button>
            </div>
            <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>Rehearse your approach as many times as you need · Till it feels right</div>
          </div>
        </section>

        {/* footer — transparent, riding on the shared night ground */}
        <SiteFooter night transparent onNav={scrollTo} />
      </div>
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
    <div className="lp2-reg" style={{ background: 'var(--bg-base)' }}>
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
                  <span className="lp2-stamp"><img src={`/ds-v4/assets/characters/${d.ill}.svg`} alt="" /></span>
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

// Every tone × length pairing is pre-written (3 tones × 5 lengths), so both
// tuners work instantly with no model call. Index 0 = most succinct.
const LIVE_VARIANTS = {
  Soft: [
    'Hi — just a gentle nudge on the heating repair when you have a moment. Thank you!',
    'Hi — just a gentle follow-up on the heating repair whenever you get a chance. Thank you so much!',
    'Hi — hope your week is going well! Just a gentle follow-up on the heating repair whenever you get a chance. It’s been getting chilly at night. Thank you so much!',
    'Hi — hope your week is going well! I wanted to gently follow up on the heating repair whenever you get a chance — it’s been out for a little while, and the apartment gets quite chilly at night. Whenever someone can stop by works for me. Thank you so much!',
    'Hi — hope your week is going well! I wanted to gently follow up on the heating repair we spoke about, whenever you get a chance. It’s been out for about three weeks now, and with the colder nights the apartment gets quite chilly. I’m happy to work around whatever time suits your schedule — mornings or evenings both work. Thank you so much for looking into it!',
  ],
  Moderate: [
    'Hi — following up on the heating, out three weeks now. Could someone come this week? I’d appreciate a firm date.',
    'Hi — following up on the heating, which has been out three weeks. With it getting cold, could someone come this week? I’d appreciate a firm date.',
    'Hi — following up on the heating, which has now been out for three weeks. With the weather getting cold, could someone come take a look this week? I’d appreciate a firm date so I can plan around it.',
    'Hi — I’m following up on the heating repair, which has now been out for three weeks. With the weather getting colder, this is becoming urgent. Could someone come take a look this week? I’d appreciate a firm date so I can plan around it, and I’m happy to be home whenever works.',
    'Hi — I’m following up again on the heating repair, which has now been out for three weeks despite my earlier messages. With the weather getting colder, this is becoming urgent for us. Could someone come take a look this week? I’d appreciate a firm date so I can plan around it — I’m happy to be home mornings or evenings, whichever is easier to schedule. Thanks for making this a priority.',
  ],
  Strong: [
    'This is my third request about the heating, out three weeks. Please confirm a repair date within 48 hours.',
    'This is my third request about the heating, unaddressed for three weeks. Please confirm a repair date within 48 hours.',
    'This is my third request about the heating, which has gone unaddressed for three weeks. Please confirm a repair date within 48 hours, or I’ll need to look into my options.',
    'This is my third request about the heating, which has gone unaddressed for three weeks despite my messages on the 2nd and the 9th. Working heat is a basic obligation under our lease. Please confirm a repair date within 48 hours, or I’ll need to look into my options.',
    'This is my third request about the heating, which has gone unaddressed for three weeks despite my messages on the 2nd and the 9th. Working heat is a basic obligation under our lease, and the apartment now drops below comfortable temperatures overnight. Please confirm a repair date within 48 hours. If I don’t hear back, I’ll have the work done myself and deduct the cost from rent, as local tenancy rules allow.',
  ],
}

function LiveExample() {
  const { Segmented, Slider, Card, Badge, Sparkle, Tag } = DS2
  const [tone, setTone] = useState('Moderate')
  const [length, setLength] = useState(40)
  // 0–100 slider → one of the five pre-written lengths
  const variant = LIVE_VARIANTS[tone][Math.min(4, Math.floor(length / 20))]
  return (
    <section id="examples" className="section" style={{ background: 'var(--bg-elevated)' }}>
      <div className="wrap lp-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <span className="site-kick">Watch it work</span>
          <h2 className="site-h2" style={{ marginTop: 14 }}>One message,<br />every register.</h2>
          <p className="site-lead" style={{ marginTop: 16, maxWidth: '40ch' }}>Switch the tone from soft to strong and watch the words change — never the meaning, never your voice.</p>
          <div style={{ marginTop: 24, maxWidth: 340 }}>
            <div className="site-kick" style={{ marginBottom: 10, color: 'var(--text-muted)' }}>Tone</div>
            <Segmented block options={['Soft', 'Moderate', 'Strong']} value={tone} onChange={setTone} />
            <div className="site-kick" style={{ margin: '22px 0 12px', color: 'var(--text-muted)' }}>Length</div>
            {/* the DS Slider forwards the native input event, not a number */}
            <Slider value={length} onChange={(e) => setLength(Number(e?.target?.value ?? e))} labelStart="Succinct" labelEnd="Detailed" />
          </div>
        </div>
        <Card variant="draft" style={{ padding: 30, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span className="site-kick" style={{ color: 'var(--text-muted)' }}>To your landlord</span>
            {tone === 'Moderate' && <Badge tone="gradient" size="sm"><Sparkle size={9} style={{ color: '#fff' }} />Recommended</Badge>}
          </div>
          <p className="serif" style={{ margin: 0, fontSize: 22, lineHeight: 1.6, color: 'var(--text-strong)' }}>{variant}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            {['Warmer', 'Shorter', 'Add a deadline'].map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        </Card>
      </div>
    </section>
  )
}
