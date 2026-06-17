import React from 'react'
import DS from '../ds'
import './Landing.css'

const {
  Button,
  Card,
  Stamp,
  Ticket,
  Postmark,
  Sparkle,
  Logo,
  Badge,
  Tag,
  Divider,
} = DS

const STEPS = [
  {
    n: 1,
    title: 'Tell us the situation',
    body: "A few quick questions about who it's for, what you need, and what worries you most.",
  },
  {
    n: 2,
    title: 'Choose how to say it',
    body: 'See several honest drafts — gentle to direct — each with its likely reaction and risk.',
  },
  {
    n: 3,
    title: 'Refine, then send',
    body: 'Tune the tone and length, revise any line, and seal it when it finally feels right.',
  },
]

const SCENARIOS = [
  {
    kicker: 'Defending your rights',
    title: 'Renters · Clients · Patients',
    blurb:
      'A deposit, a lease, a service you paid for — handled wrong, and it needs addressing.',
    tags: ['Deposit withheld', 'Repairs', 'Overcharged', 'Care denied'],
  },
  {
    kicker: 'Personal relationships',
    title: 'Family · Partner · Friends',
    blurb:
      "A boundary, an unmet need, or a hurt close to home that you've been carrying.",
    tags: ['Money boundary', 'An unmet need', 'A hurt', 'Needing space'],
  },
  {
    kicker: 'A close-knit circle',
    title: 'Work · School · Teams',
    blurb:
      'Credit taken, unfair blame, being underpaid — when speaking up feels risky.',
    tags: ['Credit taken', 'Unfair blame', 'Underpaid', 'Asking for help'],
  },
]

const FEATURES = [
  'Tone & length sliders that rewrite live',
  'Select-to-revise: soften, sharpen, shorten any line',
  "A read on how it's likely to land",
]

export default function Landing({ onStart }) {
  return (
    <div className="lp-root">
      {/* 1. Sticky nav -------------------------------------------------- */}
      <header className="lp-nav">
        <div className="bw-container lp-nav-inner">
          <a href="#top" className="lp-brand">
            <Logo variant="lockup" size={26} />
            <span className="lp-wordmark">BetterWords</span>
          </a>
          <nav className="lp-nav-links">
            <a href="#how" className="bw-link">
              How it works
            </a>
            <a href="#situations" className="bw-link">
              Situations
            </a>
            <a href="#privacy" className="bw-link">
              Privacy
            </a>
          </nav>
          <Button variant="primary" onClick={onStart}>
            Start writing
          </Button>
        </div>
      </header>

      {/* 2. Hero -------------------------------------------------------- */}
      <section className="lp-hero" id="top">
        <div className="bw-container lp-hero-inner">
          <div className="lp-hero-copy">
            <p className="bw-kicker">Written with care, sent with confidence</p>
            <h1 className="bw-display lp-hero-title">
              Say the hard thing — well.
            </h1>
            <p className="bw-serif lp-hero-sub">
              BetterWords helps you write the messages that matter most —
              setting a boundary, disputing a charge, speaking up — and shows
              you how each way of saying it is likely to land.
            </p>
            <div className="lp-hero-cta">
              <Button variant="primary" size="lg" onClick={onStart}>
                Compose a message →
              </Button>
              <a href="#how" className="bw-link lp-text-link">
                See how it works
              </a>
            </div>
            <div className="lp-hero-badges">
              <Badge>Boundaries</Badge>
              <span className="lp-star" aria-hidden="true">
                ✦
              </span>
              <Badge>Disputes</Badge>
              <span className="lp-star" aria-hidden="true">
                ✦
              </span>
              <Badge>Speaking up</Badge>
            </div>
          </div>

          {/* decorative letter deck */}
          <div className="lp-deck" aria-hidden="true">
            <Card className="lp-letter lp-letter-3">
              <p className="lp-letter-meta">To: My landlord</p>
              <p className="lp-letter-body">
                About the deposit from the Elm Street lease —
              </p>
              <div className="lp-letter-foot">
                <Tag>Said with care</Tag>
              </div>
            </Card>
            <Card className="lp-letter lp-letter-2">
              <p className="lp-letter-meta">Re: A quick boundary</p>
              <p className="lp-letter-body">
                I've been meaning to say this for a while, and I —
              </p>
              <div className="lp-letter-foot">
                <Tag>Ready to send</Tag>
              </div>
            </Card>
            <Card className="lp-letter lp-letter-1">
              <p className="lp-letter-meta">To: The team</p>
              <p className="lp-letter-body">
                I want to flag something about how credit was shared on —
              </p>
              <div className="lp-letter-foot">
                <Postmark tone="royal" size={40}>
                  Sealed with care
                </Postmark>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. How it works ----------------------------------------------- */}
      <section className="lp-section" id="how">
        <div className="bw-container">
          <div className="lp-section-head">
            <p className="bw-kicker">How it works</p>
            <h2 className="bw-display lp-section-title">
              Three steps from knot to sent.
            </h2>
          </div>
          <div className="lp-grid lp-grid-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="lp-step bw-lift">
                <div className="lp-step-top">
                  <span className="lp-disc">{s.n}</span>
                  <Sparkle size={20} />
                </div>
                <h3 className="lp-card-title">{s.title}</h3>
                <p className="lp-card-body">{s.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Scenarios -------------------------------------------------- */}
      <section className="lp-section lp-section-alt" id="situations">
        <div className="bw-container">
          <div className="lp-section-head">
            <p className="bw-kicker">Where it helps</p>
            <h2 className="bw-display lp-section-title">
              For the messages you rewrite five times.
            </h2>
            <p className="bw-serif lp-section-sub">
              The high-stakes notes where tone is everything and the cost of
              getting it wrong is real.
            </p>
          </div>
          <div className="lp-grid lp-grid-3">
            {SCENARIOS.map((sc) => (
              <Card key={sc.kicker} className="lp-scenario bw-lift">
                <p className="bw-kicker">{sc.kicker}</p>
                <h3 className="lp-card-title">{sc.title}</h3>
                <p className="lp-card-body">{sc.blurb}</p>
                <Divider />
                <div className="lp-tags">
                  {sc.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Composer preview ------------------------------------------- */}
      <section className="lp-section">
        <div className="bw-container lp-composer">
          <div className="lp-composer-copy">
            <p className="bw-kicker">The composer</p>
            <h2 className="bw-display lp-section-title">
              Tune every word until it sounds like you — at your best.
            </h2>
            <p className="bw-serif lp-section-sub">
              Slide from soft to strong, succinct to detailed, and watch the
              draft rewrite itself. Select any line to revise it. See the likely
              reaction and risk before you commit.
            </p>
            <ul className="lp-features">
              {FEATURES.map((f) => (
                <li key={f} className="lp-feature">
                  <Sparkle size={18} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* mock composer panel (decorative) */}
          <Card className="lp-mock" aria-hidden="true">
            <div className="lp-mock-slider">
              <div className="lp-mock-slider-head">
                <span className="lp-mock-label">Tone</span>
                <span className="lp-mock-ends">Soft … Strong</span>
              </div>
              <div className="lp-track">
                <span className="lp-thumb" style={{ left: '62%' }} />
              </div>
            </div>
            <div className="lp-mock-slider">
              <div className="lp-mock-slider-head">
                <span className="lp-mock-label">Length</span>
                <span className="lp-mock-ends">Succinct … Detailed</span>
              </div>
              <div className="lp-track">
                <span className="lp-thumb" style={{ left: '38%' }} />
              </div>
            </div>

            <div className="lp-meter">
              <div className="lp-meter-head">
                <span className="lp-meter-label">Risk · Moderate</span>
              </div>
              <div className="lp-meter-track">
                <span
                  className="lp-meter-fill lp-fill-risk"
                  style={{ width: '45%' }}
                />
              </div>
            </div>
            <div className="lp-meter">
              <div className="lp-meter-head">
                <span className="lp-meter-label">Impact · High</span>
              </div>
              <div className="lp-meter-track">
                <span
                  className="lp-meter-fill lp-fill-impact"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Closing CTA ------------------------------------------------ */}
      <section className="night lp-cta">
        <div className="bw-container lp-cta-inner">
          <span className="lp-cta-spark">
            <Sparkle size={34} />
          </span>
          <h2 className="bw-display lp-cta-title">
            The words you can't find — found.
          </h2>
          <p className="bw-serif lp-cta-body">
            Stop drafting the same hard message at midnight. Tell BetterWords
            the situation, and send something you're proud of.
          </p>
          <Button variant="primary" size="lg" onClick={onStart}>
            Compose a message →
          </Button>
          <p className="lp-cta-fine">
            Rehearse your approach as many times as you need · Till it feels
            right
          </p>
        </div>
      </section>

      {/* 7. Footer ----------------------------------------------------- */}
      <footer className="lp-footer" id="privacy">
        <div className="bw-container lp-footer-inner">
          <a href="#top" className="lp-brand">
            <Logo variant="lockup" size={24} />
            <span className="lp-wordmark">BetterWords</span>
          </a>
          <nav className="lp-footer-links">
            <a href="#how" className="bw-link">
              How it works
            </a>
            <a href="#situations" className="bw-link">
              Situations
            </a>
            <a href="#privacy" className="bw-link">
              Privacy
            </a>
          </nav>
          <p className="lp-footer-note">
            Private by design · Nothing is sent until you seal it
          </p>
          <p className="lp-footer-copy">© 2026 BetterWords</p>
        </div>
      </footer>
    </div>
  )
}
