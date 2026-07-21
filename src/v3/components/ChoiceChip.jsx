import React, { useRef, useState } from 'react'

// ChoiceChip — the Intake spec's pill radio-group (styles: .bw-cc in v3.css).
// Ported from "2.5 version/Betterwords Intake.html"; the DS bundle doesn't
// ship this component yet, so it lives here until it does.
//
// options: (string | { value, label, reveal?, subtle? })[] — `reveal: true`
// renders renderReveal() below the group while that option is selected;
// `subtle: true` styles the chip as the quiet escape-hatch variant (.is-subtle).
// Controlled via value/onChange, or uncontrolled via defaultValue.
export default function ChoiceChip({ label, options, value, defaultValue, onChange, renderReveal }) {
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [inner, setInner] = useState(defaultValue ?? null)
  const active = value !== undefined ? value : inner
  const activeIdx = norm.findIndex((o) => o.value === active)
  const pick = (v) => {
    if (value === undefined) setInner(v)
    onChange && onChange(v)
  }
  const refs = useRef([])
  const focusIdx = activeIdx >= 0 ? activeIdx : 0
  const onKey = (e, i) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (d) {
      e.preventDefault()
      const n = (i + d + norm.length) % norm.length
      refs.current[n] && refs.current[n].focus()
      pick(norm[n].value)
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      pick(norm[i].value)
    }
  }
  const opt = norm[activeIdx]

  return (
    <div className="bw-cc">
      <div className="bw-cc__group" role="radiogroup" aria-label={label}>
        {norm.map((o, i) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            ref={(el) => (refs.current[i] = el)}
            aria-checked={o.value === active}
            aria-expanded={o.reveal ? o.value === active : undefined}
            tabIndex={i === focusIdx ? 0 : -1}
            className={'bw-cc__chip' + (o.subtle ? ' is-subtle' : '') + (o.value === active ? ' is-selected' : '')}
            onClick={() => pick(o.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {opt && opt.reveal && renderReveal ? <div className="bw-cc__reveal">{renderReveal()}</div> : null}
    </div>
  )
}
