import React from 'react'

// Renders one of the hand-drawn Messenger illustrations from /ds/assets.
// They are inked in currentColor-ish pencil tones; we tint via filter-free
// <img> since the SVGs carry their own ink.
export default function Illustration({ name, size = 56, style }) {
  return (
    <img
      src={`/ds/assets/illustrations/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ display: 'block', ...style }}
    />
  )
}
