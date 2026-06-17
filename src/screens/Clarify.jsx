import React, { useMemo, useState } from 'react'
import DS from '../ds'
import { useStore } from '../store'
import { getQuestions, getScenario } from '../data/scenarios'

export default function Clarify() {
  const { state, dispatch, go } = useStore()
  const { Textarea, Button } = DS
  const questions = useMemo(() => getQuestions(state.scenarioId), [state.scenarioId])
  const scenario = getScenario(state.scenarioId)
  const [step, setStep] = useState(0)

  const q = questions[step]
  const value = state.answers[q.id]
  const answered = q.type === 'text' ? (value && value.trim().length > 0) : !!value
  const progress = ((step + (answered ? 1 : 0)) / questions.length) * 100

  const setAnswer = (v) => dispatch({ type: 'ANSWER', id: q.id, value: v })

  const next = () => {
    if (step < questions.length - 1) setStep(step + 1)
    else go('generating')
  }
  const back = () => {
    if (step > 0) setStep(step - 1)
    else go('home')
  }

  return (
    <main
      className="bw-container"
      style={{
        paddingBlock: 'var(--space-9)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 280px) minmax(0, 1fr)',
        gap: 'var(--space-9)',
        alignItems: 'start',
      }}
    >
      {/* progress rail */}
      <aside style={{ position: 'sticky', top: 'var(--space-6)' }}>
        <p className="bw-kicker">{scenario?.title}</p>
        <ol style={{ listStyle: 'none', margin: 'var(--space-5) 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {questions.map((item, i) => {
            const done = i < step
            const current = i === step
            const ans = state.answers[item.id]
            return (
              <li key={item.id} style={{ display: 'flex', gap: 'var(--space-3)', opacity: i > step ? 0.5 : 1 }}>
                <span
                  style={{
                    flex: '0 0 auto',
                    width: 26,
                    height: 26,
                    borderRadius: 'var(--radius-pill)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 'var(--text-2xs)',
                    fontWeight: 'var(--weight-semibold)',
                    background: current ? 'var(--royal-600)' : done ? 'var(--peri-200)' : 'var(--cream-2)',
                    color: current ? 'var(--cream-0)' : 'var(--ink-700)',
                    border: '1px solid var(--border-hair)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: current ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: 'var(--text-strong)' }}>
                    {item.title}
                  </div>
                  {ans && i !== step && (
                    <div className="bw-serif" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                      {Array.isArray(ans) ? ans.join(', ') : String(ans).slice(0, 48)}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </aside>

      {/* question pane */}
      <section>
        <div style={{ height: 5, borderRadius: 'var(--radius-pill)', background: 'var(--cream-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--royal-600)', transition: 'width var(--dur-base) var(--ease-quiet)' }} />
        </div>
        <p className="bw-kicker" style={{ marginTop: 'var(--space-6)' }}>
          Question {step + 1} of {questions.length}
        </p>
        <h1 className="bw-display" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-3)' }}>
          {q.title}
        </h1>
        {q.help && (
          <p className="bw-serif" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            {q.help}
          </p>
        )}

        <div style={{ marginTop: 'var(--space-6)' }}>
          {q.type === 'text' ? (
            <Textarea
              value={value || ''}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={q.placeholder}
              rows={5}
              style={{ width: '100%' }}
            />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {q.options.map((opt) => (
                <button
                  key={opt}
                  className="bw-chip"
                  aria-pressed={value === opt}
                  onClick={() => setAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)', alignItems: 'center' }}>
          <Button variant="outline" onClick={back}>
            ← Back
          </Button>
          <Button variant="primary" onClick={next} disabled={!answered}>
            {step < questions.length - 1 ? 'Next →' : 'Compose drafts →'}
          </Button>
        </div>
      </section>
    </main>
  )
}
