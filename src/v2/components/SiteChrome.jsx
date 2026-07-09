import React from 'react'
import DS2 from '../ds2'

// Shared v2 site chrome — the same header and footer on every screen
// (landing, clarify, composer, generating, next, send, …). The header follows
// the "betterwords-web" kit in the Betterwords.ai Design System, except the
// mark is the gradient Logo variant.

const FOOTER_COLS = [
  ['Product', [['How it works', 'how'], ['Examples', 'examples']]],
  ['Company', [['About', null]]],
]

const NAV_LINKS = [['How it works', 'how'], ['Examples', 'examples']]

// Landing wordmark — solid-ink "Betterwords" from the hero-layout-concepts
// reference. The spark star loops between its two brand poses: inline at
// full text size (hero concepts header) and the small raised sparkle of the
// Logo lockup (the gradient wordmark on the app screens). Keyframes live in
// Landing.css (.lp-logo-star).
export function LandingWordmark({ size = 21, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-display)',
        fontVariationSettings: 'var(--display-soft)',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color: 'var(--ink-800)',
        cursor: onClick ? 'pointer' : undefined,
        userSelect: 'none',
      }}
    >
      Better<i style={{ fontWeight: 500 }}>words</i>
      <span className="lp-logo-star" style={{ color: 'var(--spark)' }}>✦</span>
    </span>
  )
}

// Frosted-glass chrome fill — --bg-elevated at 50%, blurred.
const FROST_BG = 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)'

// `landing` swaps the gradient Logo lockup for the solid animated wordmark,
// sized to match the app screens' Logo (24px), and takes the
// hero-register-section color scheme: accent nav links + spark "Start free".
// App-screen headers are always frosted (--bg-elevated at 50% + blur); the
// landing is the one exception — clear while the header is over the first
// section (the hero gradient), frosting once it scrolls up past the header.
// `extra` renders on the right side of an app-screen header, aligned to the
// right edge of the page content (a centered container mirroring the screen's
// content width) rather than the viewport edge.
export function SiteHeader({ landing = false, clear = false, extra = null, extraWidth = 1280, onLogo, onNav, onStart }) {
  const { Logo, Button } = DS2

  const [frosted, setFrosted] = React.useState(!landing && !clear)
  React.useEffect(() => {
    if (!landing && !clear) {
      setFrosted(true)
      return
    }
    const onScroll = () => {
      if (clear) {
        setFrosted(window.scrollY > 8)
        return
      }
      const hero = document.querySelector('.bw-v2 .grad-daybreak')
      setFrosted(hero ? hero.getBoundingClientRect().bottom <= 68 : window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [landing, clear])

  const shell = {
    position: 'sticky', top: 0, zIndex: 50,
    backdropFilter: frosted ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: frosted ? 'blur(10px)' : 'none',
    background: frosted ? FROST_BG : 'transparent',
    borderBottom: `1px solid ${frosted ? 'var(--border-hair)' : 'transparent'}`,
    transition: 'background 0.25s var(--ease-out), border-color 0.25s var(--ease-out)',
  }
  return (
    <header style={shell}>
      {/* header content hugs the screen edges (wider than .wrap) so it
          doesn't read as centered next to the wider page content below */}
      <div style={{ width: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {landing ? (
          <LandingWordmark size={24} onClick={onLogo} />
        ) : (
          <span style={{ cursor: 'pointer', display: 'inline-flex' }} onClick={onLogo}>
            <Logo variant="gradient" size={24} />
          </span>
        )}
        {/* nav links + CTA are landing-only; app screens keep just the mark */}
        {landing && (
          <nav className="lp-navlinks lp-nav-accent" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {NAV_LINKS.map(([label, id]) => (
              <a key={id} className="lp-link" onClick={() => onNav(id)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>{label}</a>
            ))}
            <Button variant="spark" size="sm" onClick={onStart} style={{ fontSize: 14.5, fontWeight: 600 }}>Start free</Button>
          </nav>
        )}
      </div>
      {/* per-screen control, overlaid so it right-aligns with the page
          content container instead of the viewport-hugging bar above */}
      {!landing && extra && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 68, pointerEvents: 'none' }}>
          <div style={{ maxWidth: extraWidth, height: '100%', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ pointerEvents: 'auto', display: 'inline-flex' }}>{extra}</span>
          </div>
        </div>
      )}
    </header>
  )
}

export function SiteFooter({ onLogo, onNav }) {
  const { Logo, Divider } = DS2
  return (
    <footer style={{ marginTop: 'auto', background: FROST_BG, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-hair)', padding: '56px 0 40px' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ maxWidth: 320 }}>
          <span style={{ display: 'inline-flex', cursor: onLogo ? 'pointer' : undefined }} onClick={onLogo}>
            <Logo size={22} />
          </span>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6 }}>The right words, warmer. BetterWords helps you say the things that matter.</p>
        </div>
        <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
          {FOOTER_COLS.map(([h, items]) => (
            <div key={h}>
              <div className="site-kick" style={{ marginBottom: 14, color: 'var(--text-muted)' }}>{h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(([label, target]) => (
                  <a
                    key={label}
                    className="lp-link"
                    onClick={target ? () => onNav(target) : undefined}
                    style={{ fontSize: 14, cursor: 'pointer' }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 40 }}><Divider /></div>
      <div className="wrap" style={{ marginTop: 20, fontSize: 13, color: 'var(--text-faint)' }}>© 2026 BetterWords · Say the hard thing, well ✦</div>
    </footer>
  )
}
