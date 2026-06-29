import React from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { composeLetter, recipientLabel } from '../lib/advisor'

export default function Send() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Button, Postmark } = DS

  const paras = composeLetter(selected, state)

  const doSend = () => {
    const full = `To: ${recipientLabel(scenario)}\nRe: ${selected.subject}\n\n${paras.join('\n\n')}`
    if (navigator.clipboard) navigator.clipboard.writeText(full).catch(() => {})
    dispatch({ type: 'SET_SENT', sent: true })
  }

  return (
    <main style={{ maxWidth: 620, margin: '0 auto', padding: '52px 32px 90px' }}>
      {!state.sent && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 10 }}>One last look</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1.05, color: 'var(--ink-800)', margin: 0 }}>Ready to send?</h1>
          </div>
          <div style={{ background: 'var(--surface-letter)', border: '1px solid rgba(11,22,38,0.07)', borderRadius: 8, boxShadow: 'var(--shadow-letter)', padding: '32px 34px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '7px 14px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 14, marginBottom: 18, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span>
              <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{recipientLabel(scenario)}</span>
              <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span>
              <span style={{ color: 'var(--ink-800)', fontWeight: 500 }}>{selected.subject}</span>
            </div>
            {paras.map((text, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--ink-700)', margin: i === 0 ? 0 : '14px 0 0' }}>{text}</p>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 28 }}>
            <button onClick={() => dispatch({ type: 'GOTO', screen: 'editor' })} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '12px 8px' }}>
              ← Keep editing
            </button>
            <Button variant="seal" size="lg" onClick={doSend} style={{ color: 'var(--cream-0)' }}>✦ Copy to clipboard</Button>
          </div>
        </>
      )}

      {state.sent && (
        <div style={{ textAlign: 'center', animation: 'adv-up .5s var(--ease-quiet)' }}>
          <div style={{ display: 'inline-block', animation: 'adv-seal .7s var(--ease-out)', marginBottom: 26 }}>
            <Postmark tone="royal" size={104}>Sent ✦ On its way</Postmark>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 44, lineHeight: 1.05, color: 'var(--ink-800)', margin: '0 0 14px' }}>It’s on its way.</h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 auto 34px', maxWidth: 440 }}>
            You said the hard thing — clearly and with care. We’ll keep the context, in case you need help with whatever comes next.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <button onClick={() => dispatch({ type: 'SET_SENT', sent: false })} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '12px 8px' }}>
              ← Back
            </button>
            <Button variant="primary" size="lg" onClick={() => dispatch({ type: 'GOTO', screen: 'next' })}>What happens next →</Button>
          </div>
        </div>
      )}
    </main>
  )
}
