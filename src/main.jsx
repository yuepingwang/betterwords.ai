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

function loadDesignSystem() {
  return new Promise((resolve, reject) => {
    if (window.MessengerDesignSystem_02d4f6) return resolve()
    const s = document.createElement('script')
    s.src = '/ds/_ds_bundle.js'
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Messenger design system bundle'))
    document.head.appendChild(s)
  })
}

loadDesignSystem().then(async () => {
  const { default: App } = await import('./App.jsx')
  const root = ReactDOMClient.createRoot(document.getElementById('root'))
  root.render(React.createElement(App))
})
