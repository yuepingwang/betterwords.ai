import React, { useEffect, useState } from 'react'
import DS2 from '../ds2'
import { useAuth } from '../lib/auth'
import { countMessagesThisCycle } from '../lib/db'

// ------------------------------------------------------------------
// PlanBox — the "My plan" panel (Figma 489:4291), shared by the Home
// dashboard's My Account card and the Account page. Free-plan usage is
// live: every message the account produced this cycle — saved draft
// versions plus sent letters and follow-ups — counts toward the 20,
// and the cycle resets on the 1st of the month. Signed out (the
// design-review demo) it shows the Figma numbers.
// ------------------------------------------------------------------

export const FREE_LIMIT = 20
const DEMO_USED = 12

export default function PlanBox() {
  const { Button } = DS2
  const { signedIn } = useAuth()
  const [used, setUsed] = useState(null) // null → loading

  useEffect(() => {
    if (!signedIn) {
      setUsed(DEMO_USED)
      return
    }
    let alive = true
    countMessagesThisCycle()
      .then((n) => alive && setUsed(n))
      .catch((err) => {
        console.warn('[plan]', err?.message || err)
        if (alive) setUsed(0)
      })
    return () => {
      alive = false
    }
  }, [signedIn])

  const known = typeof used === 'number'
  const left = known ? Math.max(0, FREE_LIMIT - used) : null
  const pct = known ? Math.min(100, (used / FREE_LIMIT) * 100) : 0
  const now = new Date()
  const resetLabel = `Resets ${new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString('en-US', { month: 'short' })} 1`

  return (
    <div style={{ borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, backgroundImage: 'linear-gradient(100deg, var(--paper-1) 0%, #F1EEFB 50%, var(--peach-100) 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em', color: 'var(--ink-400)' }}>My plan</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 18, color: 'var(--ink-800)' }}>Free</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-600)' }}>
            {known ? used : '–'} out of {FREE_LIMIT} messages used this cycle
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ background: 'var(--paper-0)', borderRadius: 12, boxShadow: '0 1px 4px rgba(21, 18, 62, 0.05)', overflow: 'hidden', width: '100%' }}>
          <div style={{ height: 8, width: `${pct}%`, borderRadius: 12, boxShadow: '0 1px 4px rgba(21, 18, 62, 0.05)', backgroundImage: 'linear-gradient(90deg, var(--blue-500) 0%, var(--peri-400) 20%, var(--lilac-500) 40%, #C48CC0 60%, var(--coral-400) 75%, var(--peach-400) 100%)', transition: 'width 0.4s var(--ease-out)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)' }}>
          {known ? `${left} message${left === 1 ? '' : 's'} left` : '…'} · {resetLabel}
        </span>
      </div>
      <Button variant="primary" size="md" disabled title="Coming soon" style={{ width: '100%', fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>
        (Coming soon) Upgrade to Unlimited
      </Button>
    </div>
  )
}
