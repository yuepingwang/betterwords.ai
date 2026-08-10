import React, { useContext } from 'react'
import DS2 from '../ds2'
import { AccountControl, useAuth } from '../lib/auth'
import { StoreContext } from '../store'

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
export function LandingWordmark({ size = 21, color = 'var(--ink-800)', onClick }) {
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
        color,
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
// wireframe's: "Login · Sign up" signed out, the avatar menu signed in
// (see AccountControl in lib/auth.jsx). When accounts aren't configured the
// cluster falls back to the spark "Start free".
// Headers start clear over the page ground and frost on scroll; the landing
// waits until its hero gradient has scrolled past.
// One consistent header everywhere (the composer brings its own). Signed
// out: "How it works · Examples" plus Login/Sign up. Signed in (Figma
// 490:4503) the marketing links drop away and only the spark "+ New" and
// the avatar remain — Home / My Conversations moved into the avatar's
// dropdown menu (see AccountControl in lib/auth.jsx).
// `heroSelector` (the signed-in home + conversations pages): stay clear
// while that element (the image hero card) is still under the header, and
// frost only once it has scrolled past — same contract as the landing hero.
export function SiteHeader({ landing = false, heroSelector = null, onLogo, onNav, onStart }) {
  const { Button, Logo } = DS2
  const { configured, signedIn } = useAuth()
  const store = useContext(StoreContext) // present everywhere in v3.5

  const [frosted, setFrosted] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => {
      if (heroSelector) {
        const hero = document.querySelector(heroSelector)
        setFrosted(hero ? hero.getBoundingClientRect().bottom <= 68 : window.scrollY > 8)
        return
      }
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
  }, [landing, heroSelector])

  const shell = {
    position: 'sticky', top: 0, zIndex: 50,
    backdropFilter: frosted ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: frosted ? 'blur(10px)' : 'none',
    background: frosted ? FROST_BG : 'transparent',
    // no bottom hairline on the frosted state — the blur + tint alone mark
    // the edge, so the glass fades into the page with no dividing line
    transition: 'background 0.25s var(--ease-out)',
  }
  return (
    <header style={shell}>
      {/* header content hugs the screen edges (wider than .wrap) so it
          doesn't read as centered next to the wider page content below */}
      <div style={{ width: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* signed in, the mark flips to the gradient Logo the composer
            header uses; signed out it stays the solid-ink wordmark */}
        {signedIn ? (
          <span onClick={onLogo} style={{ display: 'inline-flex', cursor: onLogo ? 'pointer' : undefined, userSelect: 'none' }}>
            <Logo variant="gradient" size={24} />
          </span>
        ) : (
          <LandingWordmark size={24} onClick={onLogo} />
        )}
        <nav className="lp-navlinks lp-nav-accent" style={{ display: 'flex', alignItems: 'center', gap: signedIn ? 24 : 26 }}>
          {/* all links share the same box metrics (incl. the 2px baseline
              pad) so nav items keep one height and centerline */}
          {!signedIn &&
            NAV_LINKS.map(([label, id]) => (
              <a key={id} className="lp-link" onClick={() => onNav(id)} style={{ cursor: 'pointer', fontSize: 15, fontWeight: 500, paddingBottom: 2 }}>{label}</a>
            ))}
          {signedIn && (
            // Forms/BUTTONS/GRADIENT-WARM (DS exports/GradientWarmButton.html):
            // ember sweep slides peach→blue on hover, springy lift, inset press.
            // Variant CSS lives in daybreak.css (.bw-btn--gradient-warm).
            // alignSelf: stretch (with the fixed --_h height cleared) makes
            // the pill fill the nav cluster's height — i.e. the avatar's 42px.
            // paddingBottom rides the label ~1px above geometric center — the
            // same optical placement as the "Nudge them ✦" button (39px pill,
            // 11px above / 13px below its label).
            <Button variant="gradient-warm" size="sm" onClick={onStart} style={{ fontSize: 14.5, fontWeight: 600, alignSelf: 'stretch', height: 'auto', paddingBottom: 2, paddingLeft: 20, paddingRight: 20 }}>+ New</Button>
          )}
          <AccountControl />
          {!configured && (
            <Button variant="spark" size="sm" onClick={onStart} style={{ fontSize: 14.5, fontWeight: 600 }}>Start free</Button>
          )}
        </nav>
      </div>
    </header>
  )
}

// `night` (Figma "Footer" 445:762) — shown under the daybreak-edge grounds
// (e.g. My Conversations), where the rainbow's last stop is blue-500: the
// footer continues that sweep into dusk. Blue-500 lip blending to blue-700
// by 5%, paper-1 wordmark, peri-300 text, paper-2 hairline at 25%.
// `lip` overrides the 0% stop for grounds whose sweep ends on another color
// (the composer's sunset ends on teal — Figma 449:2115).
// `warm` (Figma "Footer" 489:4176, under the signed-in home) — that ground's
// rainbow ends on lilac, and the footer carries it into a peach dawn: lilac
// lip blending to peach-400 by 5%, with the day scheme's ink text on top.
export function SiteFooter({ night = false, warm = false, lip, onLogo, onNav }) {
  const { Logo, Divider } = DS2
  const textColor = night ? 'var(--peri-300)' : 'var(--text-muted)'
  return (
    <footer
      className={night ? 'bw-footer-night' : undefined}
      style={{
        marginTop: 'auto',
        padding: '56px 0 40px',
        ...(night
          // no top border — the ground's sweep above ends on the lip color,
          // so the footer continues it seamlessly
          ? { background: `linear-gradient(180deg, ${lip || 'var(--blue-500)'} 0%, var(--blue-700) 5%)` }
          : warm
            ? { background: 'linear-gradient(180deg, var(--lilac-500) 0%, var(--peach-400) 5%)' }
            : { background: FROST_BG, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-hair)' }),
      }}
    >
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ maxWidth: 320 }}>
          <span style={{ display: 'inline-flex', cursor: onLogo ? 'pointer' : undefined }} onClick={onLogo}>
            {night ? <LandingWordmark size={22} color="var(--paper-1)" /> : warm ? <LandingWordmark size={22} color="var(--ink-700)" /> : <Logo size={22} />}
          </span>
          <p style={{ fontSize: 14, color: warm ? 'var(--ink-600)' : textColor, marginTop: 14, lineHeight: 1.6 }}>The right words, warmer. BetterWords helps you say the things that matter.</p>
        </div>
        <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
          {FOOTER_COLS.map(([h, items]) => (
            <div key={h}>
              <div className="site-kick" style={{ marginBottom: 14, color: textColor }}>{h}</div>
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
      <div className="wrap" style={{ marginTop: 40 }}>
        {night ? (
          <div style={{ borderTop: '1px solid color-mix(in srgb, var(--paper-2) 25%, transparent)' }} />
        ) : (
          <Divider />
        )}
      </div>
      <div className="wrap" style={{ marginTop: 20, fontSize: 13, color: night ? 'var(--peri-300)' : warm ? 'var(--text-muted)' : 'var(--text-faint)' }}>© 2026 BetterWords · Say the hard thing, well ✦</div>
    </footer>
  )
}
