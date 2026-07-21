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

// Version switch: v3.5 (src/v35/) is the primary app — `/` and `/?v=3.5`
// both load it. Older versions stay reachable: `/?v=3` (also `/?v3` or
// `/#v3`), `/?v=2` (`/?v2`, `/#v2`), and `/?v=1` (`/?v1`, `/#v1`).
function wantsV1() {
  const params = new URLSearchParams(window.location.search)
  return params.get('v') === '1' || params.has('v1') || window.location.hash === '#v1'
}

function wantsV2() {
  const params = new URLSearchParams(window.location.search)
  return params.get('v') === '2' || params.has('v2') || window.location.hash === '#v2'
}

function wantsV3() {
  const params = new URLSearchParams(window.location.search)
  return params.get('v') === '3' || params.has('v3') || window.location.hash === '#v3'
}

// Each fork carries its own copy of EVERYTHING it uses — screens, store,
// advisor, scenario data, Daybreak tokens, and its /ds-* component bundle —
// so changes in one can never affect the others.
async function boot() {
  const v3 = wantsV3()
  const v2 = !v3 && wantsV2()
  const v35 = !v3 && !v2 && !wantsV1()
  // Messenger bundle powers v1 (and any v2 screen not yet rebuilt on Daybreak).
  await loadBundle('/ds/_ds_bundle.js', 'MessengerDesignSystem_02d4f6', 'Messenger design system bundle')
  // v2/v3 also load their own copy of the Betterwords "Daybreak" design-system
  // bundle, exposing the component library on
  // window.BetterwordsAiDesignSystem_ac387e (see ds2.js in each fork). Only one
  // copy ever loads per page, so the shared global name never collides.
  if (v2) {
    await loadBundle('/ds-v2/_ds_bundle.js', 'BetterwordsAiDesignSystem_ac387e', 'Betterwords design system bundle')
  }
  if (v3) {
    await loadBundle('/ds-v3/_ds_bundle.js', 'BetterwordsAiDesignSystem_ac387e', 'Betterwords design system bundle (v3)')
  }
  if (v35) {
    await loadBundle('/ds-v35/_ds_bundle.js', 'BetterwordsAiDesignSystem_ac387e', 'Betterwords design system bundle (v3.5)')
  }
  const { default: App } = v35
    ? await import('./v35/V35App.jsx')
    : v3
      ? await import('./v3/V3App.jsx')
      : v2
        ? await import('./v2/V2App.jsx')
        : await import('./App.jsx')
  const root = ReactDOMClient.createRoot(document.getElementById('root'))
  root.render(React.createElement(App))
}

boot()
