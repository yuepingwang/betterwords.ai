import React from 'react'
import { useStore } from '../store'

// ------------------------------------------------------------------
// AppPage — shared scaffold for the signed-in utility pages (Account,
// Settings): the home rainbow ground (not pulled under the header —
// these pages have no image hero, so the header frosts on scroll as
// usual), an 800px column, the "← Home" back link upper-left, and a
// Fraunces title + sans sub-line. Cards inside use <PageCard>.
// ------------------------------------------------------------------

// `actions` (optional) renders right-aligned in the back-link row — the
// pages put their Cancel / Save pair there when there are unsaved edits.
export default function AppPage({ title, sub, actions, children }) {
  const { dispatch } = useStore()
  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        // Figma 490:4346 — cream holds to 94%, then the rainbow crest bands:
        // honey 96, green 98, teal 99, lilac 100 (into the warm footer)
        backgroundImage:
          'linear-gradient(180deg, var(--paper-1) 94%, #F2D24E 96%, #6FCB77 98%, #35BFB0 99%, var(--lilac-500) 100%)',
      }}
    >
      <main style={{ maxWidth: 856, width: '100%', margin: '0 auto', padding: '18px 28px 140px', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 36 }}>
          {/* same 42px height and 15px type as the Cancel/Save pair opposite */}
          <a
            onClick={() => dispatch({ type: 'OPEN_HOME' })}
            style={{ display: 'inline-flex', alignItems: 'center', height: 42, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}
          >
            ← Home
          </a>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0 8px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.0136em', color: 'var(--ink-700)', margin: 0 }}>
            {title}
          </h1>
          {sub && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.2, color: 'var(--ink-500)', margin: 0 }}>{sub}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}

// White card — same dress as the Home dashboard cards.
export function PageCard({ children, style }) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 10px rgba(28, 23, 70, 0.06)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </section>
  )
}

// Small-caps section label (matches the dashboard kickers).
export const kickerStyle = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.01em', color: 'var(--ink-400)' }

// Segmented pill switch — the Home / My Conversations toggle pattern
// (peri well, white active segment), reused for tone & length.
// `style` merges onto the well (give it a width to size switches alike —
// segments then share the space equally); `innerRef` exposes the well for
// measuring.
export function SegPill({ options, value, onChange, ariaLabel, style, innerRef }) {
  const fluid = style?.width != null
  // the active white pill is a measured "puck" that slides between the
  // segments — same no-overshoot ease as the DS Segmented / view toggle
  const btnRefs = React.useRef({})
  const [puck, setPuck] = React.useState(null)
  const measure = React.useCallback(() => {
    const el = btnRefs.current[value]
    if (el) setPuck({ left: el.offsetLeft, width: el.offsetWidth })
  }, [value])
  React.useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])
  return (
    <div ref={innerRef} role="radiogroup" aria-label={ariaLabel} style={{ position: 'relative', background: 'var(--peri-100)', borderRadius: 999, padding: 6, display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', boxSizing: 'border-box', ...style }}>
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
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            ref={(el) => { btnRefs.current[opt] = el }}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={active ? undefined : () => onChange(opt)}
            className={active ? undefined : 'bw-vm-btn'}
            style={{
              position: 'relative',
              border: 0,
              borderRadius: 999,
              padding: '8px 18px',
              ...(fluid && { flex: 1, textAlign: 'center' }),
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              cursor: active ? 'default' : 'pointer',
              background: 'transparent',
              ...(active
                ? { color: 'var(--blue-600)', fontWeight: 500 }
                : { color: 'var(--ink-500)', fontWeight: 400 }),
              transition: 'color 0.2s var(--ease-quiet)',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
