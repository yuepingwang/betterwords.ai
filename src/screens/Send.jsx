import React, { useMemo, useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { composeDraft, plainText } from '../lib/advisor'

export default function Send() {
  const { state, go, selected } = useStore()
  const { Button, Postmark } = DS
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const letter = useMemo(() => {
    if (!selected) return null
    const base = composeDraft(selected, state.tone, state.length, { inserts: state.inserts })
    return { ...base, paragraphs: base.paragraphs.map((p) => ({ ...p, text: state.edits[p.id] ?? p.text })) }
  }, [selected, state.tone, state.length, state.inserts, state.edits])

  if (!letter) {
    return (
      <main className="bw-container" style={{ paddingBlock: 'var(--space-10)' }}>
        <p className="bw-serif" style={{ color: 'var(--text-muted)' }}>Nothing to send yet.</p>
        <button onClick={() => go('home')} className="bw-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Start over</button>
      </main>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainText(letter))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  if (sent) {
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 'var(--space-8)' }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'inline-block' }}>
            <Postmark tone="royal" size={104}>Sent ✦ On its way</Postmark>
          </div>
          <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-6)' }}>
            It’s on its way.
          </h1>
          <p className="bw-serif" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-3)', fontSize: 'var(--text-md)' }}>
            You said the hard thing — clearly and with care. We’ll keep the context, in case you need help with whatever comes next.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
            <Button variant="outline" onClick={() => setSent(false)}>← Back</Button>
            <Button variant="primary" onClick={() => go('next')}>What happens next →</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bw-container" style={{ paddingBlock: 'var(--space-9)', maxWidth: 'var(--container-md)' }}>
      <div style={{ textAlign: 'center' }}>
        <p className="bw-kicker">One last look</p>
        <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)' }}>Ready to send?</h1>
      </div>

      <div
        style={{
          marginTop: 'var(--space-6)',
          background: 'var(--surface-letter)',
          border: '1px solid var(--border-hair)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-letter)',
          padding: 'var(--space-8)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 'var(--space-4)', rowGap: 'var(--space-1)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-soft)' }}>
          <span className="bw-meter-label">To</span>
          <span style={{ color: 'var(--text-body)' }}>{letter.to}</span>
          <span className="bw-meter-label">Re</span>
          <span style={{ color: 'var(--text-body)' }}>{letter.re}</span>
        </div>
        <div style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-serif)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)' }}>
          <p style={{ marginTop: 0 }}>{letter.salutation}</p>
          {letter.paragraphs.map((p) => (
            <p key={p.id}>{p.text}</p>
          ))}
          <p style={{ marginBottom: 0 }}>{letter.closing}</p>
          <p style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>{letter.signoff}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', alignItems: 'center', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={() => go('composer')}>← Keep editing</Button>
        <Button variant="outline" onClick={copy}>{copied ? 'Copied ✓' : 'Copy to clipboard'}</Button>
        <Button variant="seal" size="lg" onClick={() => setSent(true)}>✦ Seal &amp; send</Button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-5)' }}>
        Nothing leaves this screen until you seal it.
      </p>
    </main>
  )
}
