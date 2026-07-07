import React, { useState } from 'react'
import DS2 from '../ds2'
import { useStore } from '../store'

const SOMETHING_ELSE = 'Something else'
const CHIP_STYLE = { fontSize: 'var(--text-sm)', padding: '0.6em 1.1em' }
const FIELD_STYLE = {
  width: '100%', boxSizing: 'border-box', background: 'var(--surface-card)',
  border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)',
  padding: '15px 17px', fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5,
  color: 'var(--text-body)', boxShadow: 'var(--shadow-xs)', outline: 'none',
}

export default function Clarify() {
  const { state, dispatch, scenario } = useStore()
  const { Button } = DS2
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
    <main className="bw-clarify" style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 32px 80px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
      {/* rail */}
      <aside className="bw-clarify-rail" style={{ position: 'sticky', top: 96 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
          {scenario.kicker}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 26, lineHeight: 1.1, color: 'var(--text-strong)', margin: '0 0 24px' }}>
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
                    background: i === idx ? 'var(--accent)' : i < idx ? 'var(--ink-700)' : 'var(--bg-sunken)',
                    color: i <= idx ? 'var(--paper-0)' : 'var(--text-faint)',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.35, fontWeight: i === idx ? 700 : 500, color: i === idx ? 'var(--text-strong)' : i < idx ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                    {qq.title}
                  </div>
                  {answeredItem && (
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--accent)', marginTop: 3 }}>
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
          <div style={{ flex: 1, height: 6, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${(idx / qs.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-pill)', transition: 'width .4s var(--ease-out)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {idx + 1} / {qs.length}
          </span>
        </div>

        <h1 className="bw-q-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 40, lineHeight: 1.08, color: 'var(--text-strong)', margin: '0 0 10px' }}>
          {q.title}
        </h1>
        {q.helper && (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-muted)', margin: '0 0 30px' }}>{q.helper}</p>
        )}

        {isChips && (
          <ChipsQuestion key={q.id} q={q} ans={ans} onAnswer={(value) => dispatch({ type: 'ANSWER', id: q.id, value })} />
        )}

        {isText && (
          <div style={{ marginBottom: 40 }}>
            <textarea
              value={typeof ans === 'string' ? ans : ''}
              onInput={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
              onChange={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
              placeholder={q.placeholder}
              rows={3}
              style={{ ...FIELD_STYLE, resize: 'vertical' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="ghost" size="md" onClick={back}>← Back</Button>
          <Button variant="primary" size="lg" disabled={!answered} onClick={next}>
            {isLast ? 'Compose my options' : 'Continue'}
          </Button>
        </div>
      </section>
    </main>
  )
}

// Chips with an optional "Something else" escape hatch that opens a free-text
// field. Keyed by question id in the parent so customMode resets per question.
function ChipsQuestion({ q, ans, onAnswer }) {
  const { Tag } = DS2
  const isPreset = q.options.includes(ans)
  const [customMode, setCustomMode] = useState(q.allowCustom && !!ans && !isPreset)

  const pickPreset = (label) => {
    setCustomMode(false)
    onAnswer(label)
  }
  const openCustom = () => {
    setCustomMode(true)
    if (isPreset || !ans) onAnswer('') // clear a previous preset; await their text
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {q.options.map((label) => (
          <Tag key={label} selected={!customMode && ans === label} onClick={() => pickPreset(label)} style={CHIP_STYLE}>{label}</Tag>
        ))}
        {q.allowCustom && (
          <Tag selected={customMode} onClick={openCustom} style={CHIP_STYLE}>{SOMETHING_ELSE}</Tag>
        )}
      </div>
      {customMode && (
        <input
          autoFocus
          value={typeof ans === 'string' ? ans : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={q.customPlaceholder || 'Describe it in your own words…'}
          style={{ ...FIELD_STYLE, marginTop: 16 }}
        />
      )}
    </div>
  )
}
