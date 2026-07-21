import React, { useEffect, useLayoutEffect, useState } from 'react'

// A lightweight click-through coachmark tour. Each step points at a live DOM
// node (resolved via getEl) and shows an explanation bubble. The whole screen
// is dimmed with a spotlight cut around the current target; the user steps
// through with Back / Next and can Skip at any time.
export default function Onboarding({ steps, onDone }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const step = steps[i]

  const measure = () => {
    const el = step?.getEl?.()
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }

  // On step change: bring the target into view, then measure on the next frame
  // once layout has settled.
  useLayoutEffect(() => {
    const el = step?.getEl?.()
    if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' })
    const id = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  // Keep the spotlight glued to the target as the page scrolls or resizes.
  useEffect(() => {
    const onMove = () => measure()
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  if (!step) return null

  const last = i === steps.length - 1
  const next = () => (last ? onDone?.() : setI(i + 1))
  const back = () => setI(Math.max(0, i - 1))

  const PAD = 8
  const spot = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  }

  // Place the bubble below the target when there's room, otherwise above; fall
  // back to screen-center if the target could not be found.
  const vw = window.innerWidth
  const vh = window.innerHeight
  const TW = 320
  const TIP_H = 190
  let tip
  if (spot) {
    const below = spot.top + spot.height + 14
    const placeBelow = below + TIP_H < vh
    const top = placeBelow ? below : Math.max(16, spot.top - 14 - TIP_H)
    let left = spot.left + spot.width / 2 - TW / 2
    left = Math.max(16, Math.min(vw - TW - 16, left))
    tip = { top, left, width: TW }
  } else {
    tip = { top: vh / 2 - TIP_H / 2, left: vw / 2 - TW / 2, width: TW }
  }

  const ghostBtn = {
    border: 'none', background: 'transparent', color: 'var(--text-muted)',
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', padding: '8px 6px',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      {/* click catcher — blocks interaction with the app while the tour runs */}
      <div onClick={next} style={{ position: 'absolute', inset: 0 }} />

      {/* spotlight: the large box-shadow spread dims everything but the cutout.
          A soft light ring (painted on top) replaces a hard outline. */}
      {spot && (
        <div style={{
          position: 'fixed', top: spot.top, left: spot.left,
          width: spot.width, height: spot.height,
          borderRadius: 16, pointerEvents: 'none',
          boxShadow: '0 0 0 4px rgba(255,255,255,0.55), 0 0 0 9999px rgba(11,22,38,0.32)',
          transition: 'top .3s var(--ease-quiet), left .3s var(--ease-quiet), width .3s var(--ease-quiet), height .3s var(--ease-quiet)',
        }} />
      )}
      {!spot && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,22,38,0.32)', pointerEvents: 'none' }} />
      )}

      {/* bubble — light surface, dark text */}
      <div style={{
        position: 'fixed', top: tip.top, left: tip.left, width: tip.width,
        background: 'var(--cream-0)', color: 'var(--ink-800)',
        border: '1px solid var(--border-hair)',
        borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 20,
        animation: 'adv-up .3s var(--ease-quiet)',
      }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10.5,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--royal-600)', marginBottom: 8,
        }}>
          {step.title}
        </div>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 15.5, lineHeight: 1.55,
          color: 'var(--text-body)', margin: '0 0 18px',
        }}>
          {step.body}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {steps.map((_, k) => (
              <span key={k} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: k === i ? 'var(--royal-600)' : 'rgba(11,22,38,0.14)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => onDone?.()} style={{ ...ghostBtn, color: 'var(--text-faint)' }}>Skip</button>
            {i > 0 && <button onClick={back} style={ghostBtn}>Back</button>}
            <button onClick={next} style={{
              border: 'none', background: 'var(--royal-600)', color: 'var(--cream-0)',
              borderRadius: 999, padding: '9px 18px', fontFamily: 'var(--font-sans)',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              {last ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}