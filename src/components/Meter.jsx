import React from 'react'

// A labelled risk/impact bar. `tone` selects the fill color.
export default function Meter({ label, value, word, tone = 'impact' }) {
  const color = tone === 'risk' ? 'var(--coral-600)' : 'var(--royal-700)'
  return (
    <div className="bw-meter">
      <div className="bw-meter-head">
        <span className="bw-meter-label">{label}</span>
        {word && (
          <span className="bw-meter-value" style={{ color }}>
            {word}
          </span>
        )}
      </div>
      <div className="bw-meter-track">
        <div className="bw-meter-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
