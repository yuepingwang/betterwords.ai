import React, { useState } from 'react'
import DS2 from '../ds2'
import ChoiceChip from '../components/ChoiceChip'
import { useStore } from '../store'

const SOMETHING_ELSE = 'Something else'
const CUSTOM = '__custom__'
const SCENARIO_ART = { rights: 'ctx-dispute', personal: 'ctx-boundary', circle: 'ctx-speakup' }

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

  // Revisiting after drafts exist: if every answer still matches the snapshot
  // the drafts were generated from, skip regeneration and return to them.
  const unchanged =
    !!state.draftedAnswers &&
    qs.every((qq) => JSON.stringify(state.answers[qq.id] ?? '') === JSON.stringify(state.draftedAnswers[qq.id] ?? ''))

  const next = () => {
    if (isLast) dispatch({ type: 'GOTO', screen: unchanged ? 'drafts' : 'generating' })
    else dispatch({ type: 'SET_STEP', step: idx + 1 })
  }
  const back = () => {
    if (idx === 0) dispatch({ type: 'RESTART' })
    else dispatch({ type: 'SET_STEP', step: idx - 1 })
  }

  return (
    // The calm "soft" ground (sweep + glow + grain) is painted by the app
    // wrapper in V3App so it runs the full viewport height.
    <main>
    <div className="bw-clarify" style={{ maxWidth: 1060, margin: '0 auto', padding: '64px 32px 80px', minHeight: '78vh', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
      {/* rail — a paper card with the scenario's own character riding along */}
      <aside className="bw-clarify-rail" style={{ position: 'sticky', top: 96, background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '24px 22px 26px' }}>
        <img className="bw-rail-art" src={`/ds-v3/assets/characters/${SCENARIO_ART[state.scenarioId] || 'ctx-courage'}.svg`} alt="" />
        <div className="t-kicker" style={{ color: 'var(--accent)', marginBottom: 6 }}>
          {scenario.kicker}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-snug)', color: 'var(--text-strong)', margin: '0 0 24px' }}>
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
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-2xs)',
                    background: i === idx ? 'var(--accent)' : i < idx ? 'var(--success)' : 'var(--bg-sunken)',
                    color: i <= idx ? 'var(--paper-0)' : 'var(--text-faint)',
                    transition: 'background var(--dur-base) var(--ease-out)',
                  }}
                >
                  {i < idx ? '✓' : i + 1}
                </span>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', fontWeight: i === idx ? 600 : 500, color: i === idx ? 'var(--text-strong)' : i < idx ? 'var(--text-muted)' : 'var(--text-faint)' }}>
                    {qq.title}
                  </div>
                  {answeredItem && (
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--accent)', marginTop: 3 }}>
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
          {/* aurora fill — the DS's playful multi-stop sweep as a small accent */}
          <div style={{ flex: 1, height: 6, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: `${(idx / qs.length) * 100}%`, height: '100%', backgroundImage: 'var(--grad-aurora)', borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {idx + 1} / {qs.length}
          </span>
        </div>

        {/* re-keyed per question so each step rises in (DS motion: bw-rise) */}
        <div key={q.id} className="anim-rise">
          <h1 className="bw-q-h1" style={{ fontFamily: 'var(--font-display)', fontVariationSettings: 'var(--display-soft)', fontWeight: 600, fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-strong)', margin: '0 0 10px' }}>
            {q.title}
          </h1>
          {q.helper && (
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-md)', color: 'var(--text-muted)', margin: '0 0 30px' }}>{q.helper}</p>
          )}

          {isChips && (
            <ChipsQuestion key={q.id} q={q} ans={ans} onAnswer={(value) => dispatch({ type: 'ANSWER', id: q.id, value })} />
          )}

          {isText && (
            <div style={{ marginBottom: 40 }}>
              <textarea
                className="bw-field"
                value={typeof ans === 'string' ? ans : ''}
                onInput={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
                onChange={(e) => dispatch({ type: 'ANSWER', id: q.id, value: e.target.value })}
                placeholder={q.placeholder}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="ghost" size="md" onClick={back}>← Back</Button>
          <Button variant="primary" size="lg" disabled={!answered} onClick={next}>
            {isLast ? (unchanged ? 'View my options' : 'Compose my options') : 'Continue'}
          </Button>
        </div>
      </section>
    </div>
    </main>
  )
}

// Chips with an optional "Something else" escape hatch that opens a free-text
// field. Keyed by question id in the parent so customMode resets per question.
function ChipsQuestion({ q, ans, onAnswer }) {
  const isPreset = q.options.includes(ans)
  const [customMode, setCustomMode] = useState(q.allowCustom && !!ans && !isPreset)

  const pick = (value) => {
    if (value === CUSTOM) {
      setCustomMode(true)
      if (isPreset || !ans) onAnswer('') // clear a previous preset; await their text
    } else {
      setCustomMode(false)
      onAnswer(value)
    }
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <ChoiceChip
        label={q.title}
        value={customMode ? CUSTOM : isPreset ? ans : null}
        onChange={pick}
        options={[
          ...q.options,
          ...(q.allowCustom ? [{ value: CUSTOM, label: q.customLabel || SOMETHING_ELSE, reveal: true, subtle: true }] : []),
        ]}
        renderReveal={() => (
          <input
            className="bw-field"
            autoFocus
            value={typeof ans === 'string' ? ans : ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={q.customPlaceholder || 'Describe it in your own words…'}
            style={{ maxWidth: 520 }}
          />
        )}
      />
    </div>
  )
}
