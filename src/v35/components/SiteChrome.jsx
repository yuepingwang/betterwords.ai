import React from 'react'
import DS2 from '../ds2'
import { AccountControl, useAuth } from '../lib/auth'

// Shared v3 site chrome — the same header and footer on every screen
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

// One marketing-style header for EVERY screen except the composer (which
// brings its own — see Composer.jsx): the solid-ink wordmark left; "How it
// works · Examples" plus the auth cluster right. The auth cluster is the
// wireframe's: "Login · Sign up free" signed out, the avatar menu signed in
// (see AccountControl in lib/auth.jsx). When accounts aren't configured the
// cluster falls back to the spark "Start free".
// Headers start clear over the page ground and frost on scroll; the landing
// waits until its hero gradient has scrolled past.
export function SiteHeader({ landing = false, onLogo, onNav, onStart }) {
  const { Button } = DS2
  const { configured } = useAuth()

  const [frosted, setFrosted] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => {
      if (!landing) {
        setFrosted(window.scrollY > 8)
        return
      }
      const hero = document.querySelector('.bw-v35 .grad-daybreak')
      setFrosted(hero ? hero.getBoundingClientRect().bottom <= 68 : window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [landing])

  const shell = {
    position: 'sticky', top: 0, zIndex: 50,
    backdropFilter: frosted ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: frosted ? 'blur(10px)' : 'none',
    background: frosted ? FROST_BG : 'transparent',
    // the frost hairline is a shadow, not a border — a border adds 1px to
    // the header's height, which peeked out as a light line above the
    // landing hero (pulled up exactly 68px under the header)
    boxShadow: frosted ? '0 1px 0 var(--border-hair)' : 'none',
    transition: 'background 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out)',
  }
  return (
    <header style={shell}>
      {/* header content hugs the screen edges (wider than .wrap) so it
          doesn't read as centered next to the wider page content below */}
      <div style={{ width: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <LandingWordmark size={24} onClick={onLogo} />
        <nav className="lp-navlinks lp-nav-accent" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {NAV_LINKS.map(([label, id]) => (
            <a key={id} className="lp-link" onClick={() => onNav(id)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>{label}</a>
          ))}
          <AccountControl />
          {!configured && (
            <Button variant="spark" size="sm" onClick={onStart} style={{ fontSize: 14.5, fontWeight: 600 }}>Start free</Button>
          )}
        </nav>
      </div>
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
