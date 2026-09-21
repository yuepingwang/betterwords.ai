import React from 'react'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { displayName, usePrefs } from '../lib/prefs'

// ------------------------------------------------------------------
// HomeHero — the shared top section of the signed-in Home dashboard
// (Figma 490:4345) and My Conversations (490:4601): the welcome card
// over the cloud illustration, then the Home / My Conversations
// segmented toggle. Both pages pull this section up under the
// transparent header (see the screens); SiteHeader watches
// `.bw-home-hero` to frost only once the card scrolls past.
// ------------------------------------------------------------------

// Both screens share the ground (paper with the home rainbow cresting
// at the fold — yellow → green → teal → lilac) and pull up under the
// 68px transparent header so the hero starts 12px from the very top.
export const HOME_GROUND = {
  width: '100%',
  marginTop: -68,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  // Figma 490:4346 — cream holds to 94%, then the rainbow crest bands:
  // honey 96, green 98, teal 99, lilac 100 (into the warm footer)
  backgroundImage:
    'linear-gradient(180deg, var(--paper-1) 94%, #F2D24E 96%, #6FCB77 98%, #35BFB0 99%, var(--lilac-500) 100%)',
}

export default function HomeHero({ active = 'home' }) {
  const { dispatch } = useStore()
  const auth = useAuth()

  const [prefs] = usePrefs()
  const name = displayName(prefs, auth.user?.email)

  const segments = [
    ['home', 'Home', () => dispatch({ type: 'OPEN_HOME' })],
    ['conversations', 'My Conversations', () => dispatch({ type: 'OPEN_CONVERSATIONS' })],
  ]

  return (
    <>
      {/* welcome card (490:4348) */}
      <div className="bw-home-hero" style={{ position: 'relative', height: 286, borderRadius: 16, overflow: 'hidden', filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06))' }}>
        <img
          src="/ds-v4/assets/home-background.jpg"
          alt=""
          style={{ position: 'absolute', left: 0, top: '-13.6%', width: '100%', pointerEvents: 'none' }}
        />
        <h1
          style={{
            position: 'absolute',
            left: 59,
            top: 72,
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontVariationSettings: 'var(--display-soft)',
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: '0.01em',
            color: 'var(--paper-0)',
            textShadow: '0 18px 44px rgba(21, 18, 62, 0.14), 0 2px 5px rgba(21, 18, 62, 0.07)',
            whiteSpace: 'nowrap',
          }}
        >
          Welcome back, {name}!
        </h1>
      </div>

      {/* Home / My Conversations segmented toggle ("View mode" 490:5029) —
          frosted light-blue track with a measured white puck that slides
          (same no-overshoot ease as the DS Segmented) before navigating */}
      <ViewModeToggle active={active} segments={segments} />
    </>
  )
}


// The Home / My Conversations pill switch. The active white pill is a
// separate measured "puck" that slides between the (unequal-width) buttons
// with the same calm no-overshoot ease as the DS Segmented's puck; clicking
// slides it first, then navigates once the slide has played.
function ViewModeToggle({ active, segments }) {
  const [localActive, setLocalActive] = React.useState(active)
  const btnRefs = React.useRef({})
  const [puck, setPuck] = React.useState(null)

  React.useEffect(() => setLocalActive(active), [active])

  const measure = React.useCallback(() => {
    const el = btnRefs.current[localActive]
    if (el) setPuck({ left: el.offsetLeft, width: el.offsetWidth })
  }, [localActive])
  React.useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const pick = (key, go) => {
    if (key === localActive) return
    setLocalActive(key)
    setTimeout(go, 300) // let the slide play before the screen swaps
  }

  return (
    <div style={{ display: 'flex', padding: '4px 0' }}>
      <div
        style={{
          position: 'relative',
          background: 'var(--peri-100)',
          borderRadius: 999,
          padding: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {puck && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              left: puck.left,
              width: puck.width,
              borderRadius: 999,
              background: 'var(--paper-0)',
              filter: 'drop-shadow(0 4px 5px rgba(28, 23, 70, 0.06)) drop-shadow(0 2px 2px rgba(28, 23, 70, 0.06))',
              transition: 'left 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        )}
        {segments.map(([key, label, go]) => {
          const isActive = localActive === key
          return (
            <button
              key={key}
              ref={(el) => { btnRefs.current[key] = el }}
              type="button"
              onClick={() => pick(key, go)}
              aria-pressed={isActive}
              className={isActive ? undefined : 'bw-vm-btn'}
              style={{
                position: 'relative',
                border: 0,
                borderRadius: 999,
                padding: '8px 20px',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                cursor: isActive ? 'default' : 'pointer',
                background: 'transparent',
                ...(isActive
                  ? { color: 'var(--blue-600)', fontWeight: 500 }
                  : { color: 'var(--ink-500)', fontWeight: 400 }),
                transition: 'color 0.2s var(--ease-quiet)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
