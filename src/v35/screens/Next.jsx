import React from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'
import { composeLetter } from '../lib/advisor'
import { useAuth } from '../lib/auth'
import { recordSent, recordFollowup } from '../lib/db'

// The two moves a live conversation offers next — the same branch the
// conversation page's action bar drives ("Still waiting?" / "They replied?").
const CARDS = [
  {
    art: 'ctx-waiting', title: 'Still waiting?',
    body: 'When the silence stretches, we’ll judge the timing and draft a follow-up — from a gentle nudge to a firmer note that leans on any rule or term being missed.',
  },
  {
    art: 'ctx-sent', title: 'They replied?',
    body: 'Paste their response and we’ll read the tone, tell you whether your need was actually met, and draft your next move — including how to escalate if it wasn’t.',
  },
]

export default function Next() {
  const { state, dispatch, scenario, selected } = useStore()
  const { Card, Button, Sparkle } = DS2
  const auth = useAuth()

  // Signed out, the letter that was just sent only lives in this session.
  // Signing up here keeps it: record it to a thread, then open that
  // conversation so the next steps are real buttons, not promises.
  const saveAndOpen = () => {
    const record = state.replyFlow?.mode === 'followup' ? recordFollowup : recordSent
    record({
      threadId: state.threadId,
      scenario,
      state,
      subject: state.subjectOverride || selected?.subject,
      body: composeLetter(selected, state).join('\n\n'),
    })
      .then((tid) => dispatch({ type: 'OPEN_CONVERSATION', threadId: tid }))
      .catch((err) => {
        console.warn('[save sent]', err?.message || err)
        dispatch({ type: 'OPEN_CONVERSATIONS' })
      })
  }

  // The sign-up pitch: accounts are live and this visitor doesn't have one.
  const pitch = auth.configured && !auth.signedIn

  return (
    <main
      className="bw-sec-pad"
      style={{
        maxWidth: 920,
        margin: '0 auto',
        padding: '56px 32px 90px',
        // same 80vh band as the Send screen's sent state, content centered,
        // so the celebration flow holds one steady page height throughout
        minHeight: '80vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>After you send</div>
        <h1 className="bw-page-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 46, lineHeight: 1.03, color: 'var(--text-strong)', margin: '0 0 14px' }}>
          {pitch ? 'Keep hold of what you just sent.' : 'We’ll be here for what comes next.'}
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text-muted)', margin: '0 auto', maxWidth: 540 }}>
          {pitch
            ? 'Your message is out the door, but the conversation is just starting. Sign up free and BetterWords saves what you sent and keeps track of the next steps with you.'
            : 'A conversation rarely ends with one message. Here’s how BetterWords helps once you’ve sent yours.'}
        </p>
      </div>

      <div className="bw-next-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {CARDS.map((c) => (
          <Card key={c.title} style={{ position: 'relative', padding: '30px 28px' }}>
            <img src={`/ds-v35/assets/characters/${c.art}.svg`} alt="" style={{ width: 120, height: 103, objectFit: 'contain', margin: '0 0 14px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 24, color: 'var(--text-strong)', margin: '0 0 10px' }}>{c.title}</h3>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.5, color: 'var(--text-body)', margin: 0 }}>{c.body}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 44 }}>
        {pitch ? (
          <>
            <Button variant="spark" size="lg" onClick={() => auth.openSignIn(saveAndOpen)}>
              {/* inline-flex keeps the sparkle from inflating the line box,
                  so this label centers exactly like its neighbor's */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
                Sign up free — save this conversation <Sparkle size={14} style={{ color: 'var(--paper-0)', display: 'block' }} />
              </span>
            </Button>
            <Button variant="outline" size="lg" onClick={() => dispatch({ type: 'RESTART' })}>Start another message</Button>
          </>
        ) : (
          <>
            {auth.signedIn && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => dispatch(state.threadId ? { type: 'OPEN_CONVERSATION', threadId: state.threadId } : { type: 'OPEN_CONVERSATIONS' })}
              >
                Track it in My Conversations
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => dispatch({ type: 'RESTART' })}>Start another message</Button>
          </>
        )}
      </div>
    </main>
  )
}
