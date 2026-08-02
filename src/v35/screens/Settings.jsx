import React, { useEffect, useRef, useState } from 'react'
import DS2 from '../ds2'
import AppPage, { PageCard, SegPill, kickerStyle } from '../components/AppPage'
import { useAuth } from '../lib/auth'
import { LENGTH_OPTIONS, TONE_OPTIONS, VOICE_OPTIONS, displayName, usePrefs } from '../lib/prefs'

// ------------------------------------------------------------------
// Settings — the writing-style defaults behind the Home dashboard's
// "My Writing Style" card. Edits are held in a local draft; a Cancel /
// Save pair appears in the back-link row while anything is unsaved
// (the dashboard mirrors the SAVED values). Tone & length are 3-way
// segmented switches, sign-off is a text field, the voice is a
// multi-select chip set (+ user-defined characteristics), and the
// voice note is free text.
// ------------------------------------------------------------------

const rowLabel = { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--ink-600)' }

const pickDraft = (p) => ({
  tone: p.tone,
  length: p.length,
  signoff: p.signoff,
  voices: [...p.voices],
  customVoices: [...p.customVoices],
  voiceNote: p.voiceNote,
})

export default function Settings() {
  const auth = useAuth()
  const [prefs, update] = usePrefs()
  const { Button } = DS2
  const name = displayName(prefs, auth.user?.email)

  const [draft, setDraft] = useState(() => pickDraft(prefs))
  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(pickDraft(prefs))

  const [addingVoice, setAddingVoice] = useState(false)
  const [newVoice, setNewVoice] = useState('')

  // The tone switch stretches to the length switch's natural width so the
  // two read as one aligned column (measured — labels set the width).
  const lengthPillRef = useRef(null)
  const [pillW, setPillW] = useState(null)
  useEffect(() => {
    const measure = () => setPillW(lengthPillRef.current?.offsetWidth || null)
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const cancel = () => {
    setDraft(pickDraft(prefs))
    setNewVoice('')
    setAddingVoice(false)
  }
  const save = () => update(draft)

  const toggleVoice = (v) =>
    patch({ voices: draft.voices.includes(v) ? draft.voices.filter((x) => x !== v) : [...draft.voices, v] })

  const addCustomVoice = () => {
    const v = newVoice.trim()
    setNewVoice('')
    setAddingVoice(false)
    if (!v) return
    // A new characteristic joins the option set and starts selected.
    if (!draft.customVoices.includes(v) && !VOICE_OPTIONS.includes(v)) {
      patch({ customVoices: [...draft.customVoices, v], voices: [...draft.voices, v] })
    } else if (!draft.voices.includes(v)) {
      patch({ voices: [...draft.voices, v] })
    }
  }

  const removeCustomVoice = (v) =>
    patch({ customVoices: draft.customVoices.filter((x) => x !== v), voices: draft.voices.filter((x) => x !== v) })

  // Shared chip dress for the voice multi-select (the dashboard's mint
  // chips when selected; quiet hairline pills when not).
  const voiceChipStyle = (selected) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    padding: '8px 14px',
    fontFamily: 'var(--font-sans)',
    fontSize: 12.5,
    lineHeight: 1.2,
    cursor: 'pointer',
    ...(selected
      ? { background: 'color-mix(in srgb, var(--mint-300) 50%, transparent)', border: '1.5px solid transparent', color: 'var(--mint-600)', fontWeight: 600 }
      : { background: 'transparent', border: '1.5px solid var(--border-soft)', color: 'var(--ink-500)', fontWeight: 500 }),
  })

  return (
    <AppPage
      title="Settings"
      sub="Your writing defaults — every new draft starts from these."
      actions={
        dirty && (
          <>
            {/* md dress at the header "+ New" button's 42px height */}
            <Button variant="ghost" size="md" onClick={cancel} style={{ height: 42, paddingLeft: 20, paddingRight: 20 }}>Cancel</Button>
            <Button variant="primary" size="md" onClick={save} style={{ height: 42, paddingLeft: 28, paddingRight: 28 }}>Save</Button>
          </>
        )
      }
    >
      {/* ---- writing tones ---- */}
      <PageCard>
        <span style={kickerStyle}>DEFAULT WRITING TONES</span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={rowLabel}>Default tone</span>
          <SegPill ariaLabel="Default tone" options={TONE_OPTIONS} value={draft.tone} onChange={(tone) => patch({ tone })} style={pillW ? { width: pillW } : undefined} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>How firmly your drafts lean by default.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={rowLabel}>Default length</span>
          <SegPill ariaLabel="Default length" options={LENGTH_OPTIONS} value={draft.length} onChange={(length) => patch({ length })} innerRef={lengthPillRef} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>How much room your drafts take by default.</span>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={rowLabel}>Sign off as</span>
          <input
            className="bw-field"
            type="text"
            placeholder={name}
            value={draft.signoff}
            onChange={(e) => patch({ signoff: e.target.value })}
            style={{ maxWidth: 320, fontFamily: 'var(--font-sans)', fontSize: 15 }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>The name your letters end with.</span>
        </label>
      </PageCard>

      {/* ---- default voice ---- */}
      <PageCard>
        <span style={kickerStyle}>DEFAULT VOICE - “WHO AM I?”</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {VOICE_OPTIONS.map((v) => {
            const selected = draft.voices.includes(v)
            return (
              <button key={v} type="button" aria-pressed={selected} onClick={() => toggleVoice(v)} style={voiceChipStyle(selected)}>
                {v}
              </button>
            )
          })}
          {draft.customVoices.map((v) => (
            <button key={v} type="button" aria-pressed={draft.voices.includes(v)} onClick={() => toggleVoice(v)} style={voiceChipStyle(draft.voices.includes(v))}>
              {v}
              <span
                role="button"
                aria-label={`Remove ${v}`}
                title="Remove"
                onClick={(e) => { e.stopPropagation(); removeCustomVoice(v) }}
                style={{ fontSize: 12, lineHeight: 1, opacity: 0.65 }}
              >
                ✕
              </span>
            </button>
          ))}
          {addingVoice ? (
            <input
              className="bw-field"
              autoFocus
              type="text"
              placeholder="e.g. Patient"
              value={newVoice}
              onChange={(e) => setNewVoice(e.target.value)}
              onBlur={addCustomVoice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomVoice()
                if (e.key === 'Escape') { setNewVoice(''); setAddingVoice(false) }
              }}
              style={{ width: 160, height: 36, borderRadius: 999, padding: '0 14px', fontFamily: 'var(--font-sans)', fontSize: 12.5 }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingVoice(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '8px 14px', background: 'transparent', border: '1.5px dashed var(--border-soft)', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, lineHeight: 1.2, cursor: 'pointer' }}
            >
              + Add your own
            </button>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>Pick everything that sounds like you — drafts borrow these qualities.</span>
      </PageCard>

      {/* ---- voice note ---- */}
      <PageCard>
        <span style={kickerStyle}>YOUR VOICE NOTE</span>
        <textarea
          className="bw-field"
          rows={3}
          value={draft.voiceNote}
          onChange={(e) => patch({ voiceNote: e.target.value })}
          style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5 }}
        />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-400)' }}>
          A sentence or two, in your own words, about how you want to come across.
        </span>
      </PageCard>
    </AppPage>
  )
}
