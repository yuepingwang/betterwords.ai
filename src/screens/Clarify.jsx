import React from 'react'
import DS from '../ds'
import { useStore } from '../store'

export default function Clarify() {
  const { state, dispatch, scenario } = useStore()
  const { Button } = DS
  const qs = scenario.questions
  const idx = state.clarifyStep
  const q = qs[idx]
  const ans = state.answers[q.id]
  const isChips = q.type === 'chips'
  const isText = q.type === 'text'
  const answered = isText ? true : !!ans
  const isLast = idx === qs.length - 1

  const next = () => {
    if (isLast) dispatch({ type: 'GOTO', screen: 'generating' })
    else dispatch({ type: 'SET_STEP', step: idx + 1 })
  }
  const back = () => {
    if (idx === 0) dispatch({ type: 'RESTART' })
    else dispatch({ type: 'SET_STEP', step: idx - 1 })
  }

  return (
    <main style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 32px 80px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
      {/* rail */}
      <aside style={{ position: 'sticky', top: 96 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--royal-600)', marginBottom: 6 }}>
          {scenario.kicker}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.1, color: 'var(--ink-800)', margin: '0 0 24px' }}>
          {scenario.label}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {qs.map((qq, i) => {
            const a = state.answers[qq.id]
            const answeredItem = !!a && (!Array.isArray(a) || a.length > 0)
            const answerText = Array.isArray(a) ? a.join(', ') : a || ''
            return (
              <div key={qq.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 26, height: 26, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
                    background: i === idx ? 'var(--royal-600)' : i < idx ? 'var(--ink-700)' : 'var(--cream-2)',
                    color: i <= idx ? 'var(--cream-0)' : 'var(--text-faint)',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.35, fontWeight: i === idx ? 700 : 500, color: i === idx ? 'var(--ink-800)' : i < idx ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                    {qq.title}
                  </div>
                  {answeredItem && (
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--royal-700)', marginTop: 3 }}>
                      {answerText}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* question */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 5, background: 'var(--cream-2)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(idx / qs.length) * 100}%`, height: '100%', background: 'var(--royal-600)', borderRadius: 999, transition: 'width .4s var(--ease-quiet)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {idx + 1} / {qs.length}
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1.08, color: 'var(--ink-800)', margin: '0 0 10px' }}>
          {q.title}
        </h1>
        {q.helper && (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-muted)', margin: '0 0 30px' }}>{q.helper}</p>
        )}

        {isChips && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
            {q.options.map((label) => {
              const selected = ans === label
              return (
                <button
                  key={label}
                  onClick={() => dispatch({ type: 'ANSWER', id: q.id, value: label })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, textAlign: 'left', borderRadius: 999,
                    border: selected ? '1.5px solid var(--royal-600)' : '1.5px solid var(--border-soft)',
                    background: selected ? 'var(--peri-100)' : 'var(--cream-0)',
                    color: selected ? 'var(--royal-700)' : 'var(--text-body)',
                    boxShadow: selected ? '0 1px 3px rgba(43,69,212,0.12)' : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {isText && (
          <div style={{ marginBottom: 40 }}>
            <textarea
              value={typeof ans === 'string' ? ans : ''}
              onInput={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
              onChange={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
              placeholder={q.placeholder}
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: 'var(--cream-0)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '16px 18px', fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.55, color: 'var(--text-body)', boxShadow: 'var(--shadow-xs)' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={back} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '12px 8px' }}>
            ← Back
          </button>
          <Button variant="primary" size="lg" disabled={!answered} onClick={next}>
            {isLast ? 'Compose my options' : 'Continue'}
          </Button>
        </div>
      </section>
    </main>
  )
}
