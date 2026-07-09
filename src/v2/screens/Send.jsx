import React from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { composeLetter, recipientLabel } from '../../lib/advisor'

export default function Send() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Button, Icon, Sparkle } = DS2

  const paras = composeLetter(selected, state)

  const doSend = () => {
    const full = `To: ${recipientLabel(scenario)}\nRe: ${selected.subject}\n\n${paras.join('\n\n')}`
    if (navigator.clipboard) navigator.clipboard.writeText(full).catch(() => {})
    dispatch({ type: 'SET_SENT', sent: true })
  }

  return (
    <main
      style={{
        maxWidth: 620,
        margin: '0 auto',
        padding: '52px 32px 90px',
        // the review fills at least 80% of the viewport (title top, letter
        // middle, actions bottom); the sent state keeps the same band and
        // centers its content in it so the page height doesn't jump
        minHeight: '80vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: state.sent ? 'center' : 'space-between',
      }}
    >
      {!state.sent && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>One last look</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 40, lineHeight: 1.05, color: 'var(--text-strong)', margin: 0 }}>Ready to send?</h1>
          </div>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '32px 34px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: '7px 14px', alignItems: 'baseline', borderBottom: '1px solid var(--border-hair)', paddingBottom: 14, marginBottom: 18, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</span>
              <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{recipientLabel(scenario)}</span>
              <span style={{ color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Re</span>
              <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{selected.subject}</span>
            </div>
            {paras.map((text, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--text-body)', margin: i === 0 ? 0 : '14px 0 0' }}>{text}</p>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 28 }}>
            <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'GOTO', screen: 'editor' })}>← Keep editing</Button>
            <Button variant="spark" size="lg" iconRight={<Icon name="check" size={16} />} onClick={doSend}>Copy to clipboard</Button>
          </div>
        </>
      )}

      {state.sent && (
        <div style={{ textAlign: 'center', animation: 'adv-up .5s var(--ease-out)' }}>
          {/* the paper plane touching down, big and unboxed */}
          <span style={{ position: 'relative', display: 'inline-flex', margin: '0 auto 26px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'adv-seal .7s var(--ease-out)' }}>
              <img
                className="anim-float"
                src="/ds-v2/assets/characters/tool-landing-2.svg"
                alt=""
                style={{ width: 180, height: 158, objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(28, 23, 70, 0.18))' }}
              />
            </span>
            <span className="bw-tw" style={{ position: 'absolute', top: -6, right: -8 }}>
              <Sparkle size={24} />
            </span>
            <span className="bw-tw" style={{ position: 'absolute', bottom: 2, left: -6, color: 'var(--foil)', animationDelay: '1.4s' }}>
              <Sparkle size={15} />
            </span>
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 44, lineHeight: 1.05, color: 'var(--text-strong)', margin: '0 0 14px' }}>
            It’s on its way. <Sparkle size={22} style={{ color: 'var(--spark)' }} />
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 auto 34px', maxWidth: 440 }}>
            You said the hard thing — clearly and with care. We’ll keep the context, in case you need help with whatever comes next.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Button variant="ghost" size="md" onClick={() => dispatch({ type: 'SET_SENT', sent: false })}>← Back</Button>
            <Button variant="primary" size="lg" iconRight={<Icon name="star" size={16} />} onClick={() => dispatch({ type: 'GOTO', screen: 'next' })}>What happens next</Button>
          </div>
        </div>
      )}
    </main>
  )
}
