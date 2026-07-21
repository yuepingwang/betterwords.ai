import React, { useEffect, useRef, useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'

// ClarifyRecap — the Drafts screen's recap of the Clarify answers: the
// Clarify rail carried over as a side card with the checked question list.
// Rows jump back to their question; the button reopens the flow at the last
// question. On mobile it stacks above the drafts and collapses to its header.

const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

function useRecap() {
  const { state, dispatch, scenario } = useStore()
  const items = scenario.questions.map((q) => {
    const a = state.answers[q.id]
    const answer = a == null || a === '' ? null : Array.isArray(a) ? a.join(', ') : a
    return { q, answer }
  })
  // "Edit my answers" restarts the walkthrough at the first question;
  // editAt() jumps to a specific one instead.
  const editAll = () => {
    dispatch({ type: 'SET_STEP', step: 0 })
    dispatch({ type: 'GOTO', screen: 'clarify' })
  }
  const editAt = (i) => {
    dispatch({ type: 'SET_STEP', step: i })
    dispatch({ type: 'GOTO', screen: 'clarify' })
  }
  return { items, editAll, editAt, scenario, scenarioId: state.scenarioId }
}


export function RecapRail() {
  const { items, editAll, editAt, scenario, scenarioId } = useRecap()
  const { Button } = DS2

  // Mobile (the CSS breakpoint where the rail stacks above the drafts): the
  // card collapses to its header row, closed by default.
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)')
    const on = () => setIsMobile(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const expanded = !isMobile || open

  // When the card's maxHeight clips the question list, a subtle upward
  // shadow marks the clip edge; it fades out once scrolled to the bottom.
  const listRef = useRef(null)
  const [clipped, setClipped] = useState(false)
  const update = () => {
    const el = listRef.current
    if (el) setClipped(el.scrollHeight - el.scrollTop - el.clientHeight > 1)
  }
  useEffect(() => {
    update()
    const el = listRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [expanded])

  return (
    // panel + button mirror the Drafts Segmented control: frosted-glass
    // track (.bw-recap-frost, shared rule in v35.css) + elevated puck.
    // Flex column so the edit button pins to the bottom padding edge when
    // the card stretches to match the draft-card column.
    // The grid row's stretch bottom-aligns the card with the last draft card;
    // maxHeight caps it when that column is very tall, so the card's bottom
    // never sinks below 40px above the window's bottom:
    // 100vh − 134 card top (68 header + 66 gap) − 40 bottom reserve.
    // (On mobile the CSS lifts the cap and this stacks at natural height.)
    <aside className="bw-clarify-rail bw-recap-frost" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 174px)', borderRadius: 'var(--radius-lg)', padding: isMobile ? '18px 22px' : '24px 22px 22px' }}>
      {isMobile ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ minWidth: 0 }}>
            <span className="t-kicker" style={{ display: 'block', color: 'var(--accent)', marginBottom: 4 }}>{scenario.kicker}</span>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)' }}>{scenario.label}</span>
          </span>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
            <path d="M6 9l6 6 6-6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <>
          <img className="bw-rail-art" src={`/ds-v35/assets/characters/${SCENARIO_ART[scenarioId] || 'ctx-courage'}.svg`} alt="" />
          <div className="t-kicker" style={{ color: 'var(--accent)', marginBottom: 6 }}>{scenario.kicker}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: '0 0 20px' }}>
            {scenario.label}
          </h2>
        </>
      )}
      {expanded && (
      <div className={isMobile ? 'anim-rise' : undefined} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, marginTop: isMobile ? 18 : 0 }}>
      {/* minHeight 0 lets the list shrink and scroll when maxHeight clips
          the card, keeping the edit button pinned inside */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 22, minHeight: 0 }}>
        <div ref={listRef} onScroll={update} style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflowY: 'auto', borderRadius: '0 0 10px 10px' }}>
          {items.map(({ q, answer }, i) => (
            <button
              key={q.id}
              type="button"
              className="bw-recap-row"
              title="Edit this answer"
              onClick={() => editAt(i)}
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <span style={{ width: 22, height: 22, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-3xs)', background: 'var(--success)', color: 'var(--paper-0)' }}>✓</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-normal)', fontWeight: 500, color: 'var(--text-muted)' }}>{q.title}</span>
                <span className="bw-recap-a" style={{ display: 'block', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--accent)', marginTop: 2 }}>{answer || '—'}</span>
              </span>
            </button>
          ))}
        </div>
        {/* inner shadow rising from the container's rounded bottom edge while
            content is cropped: a clipped strip reveals just the bottom of an
            inset --shadow-sm (keep values in sync with daybreak.css), so the
            shadow's other edges never show */}
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, overflow: 'hidden', borderRadius: '0 0 10px 10px', pointerEvents: 'none', opacity: clipped ? 1 : 0, transition: 'opacity var(--dur-fast) var(--ease-out)' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, borderRadius: '0 0 10px 10px', boxShadow: 'inset 0 -2px 4px rgba(28, 23, 70, 0.06), inset 0 -4px 10px rgba(28, 23, 70, 0.06)' }} />
        </div>
      </div>
      <Button variant="ghost" size="sm" block onClick={editAll} style={{ marginTop: 'auto', flex: 'none', height: 'calc(var(--control-h-md) - 8px)', fontSize: 'var(--text-xs)', background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-sm)' }}>← Edit my answers</Button>
      </div>
      )}
    </aside>
  )
}
