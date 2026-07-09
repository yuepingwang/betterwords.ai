import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import ReactDOM from 'react-dom'
import './app.css'

// The Messenger design-system bundle is a prebuilt IIFE that references a
// bare global `React` and mounts its components on
// `window.MessengerDesignSystem_02d4f6`. We expose the app's OWN React
// instance as the global first (so hooks/context are shared), THEN load the
// bundle, and only after it has registered do we render the app.
window.React = React
window.ReactDOM = ReactDOM

function loadBundle(src, globalKey, label) {
  return new Promise((resolve, reject) => {
    if (globalKey && window[globalKey]) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${label}`))
    document.head.appendChild(s)
  })
}

// Version switch: v2 (src/v2/) is the primary app — `/` and `/?v=2` both load
// it. The previous app remains reachable via `/?v=1` (also `/?v1` or `/#v1`).
function wantsV1() {
  const params = new URLSearchParams(window.location.search)
  return params.get('v') === '1' || params.has('v1') || window.location.hash === '#v1'
}

async function boot() {
  const v2 = !wantsV1()
  // Messenger bundle powers v1 (and any v2 screen not yet rebuilt on Daybreak).
  await loadBundle('/ds/_ds_bundle.js', 'MessengerDesignSystem_02d4f6', 'Messenger design system bundle')
  // v2 also loads the Betterwords "Daybreak" design-system bundle, exposing the
  // full component library on window.BetterwordsAiDesignSystem_ac387e (see ds2.js).
  if (v2) {
    await loadBundle('/ds-v2/_ds_bundle.js', 'BetterwordsAiDesignSystem_ac387e', 'Betterwords design system bundle')
  }
  const { default: App } = v2 ? await import('./v2/V2App.jsx') : await import('./App.jsx')
  const root = ReactDOMClient.createRoot(document.getElementById('root'))
  root.render(React.createElement(App))
}

boot()
