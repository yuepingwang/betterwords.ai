import React from 'react'
import DS from './ds'
import { StoreProvider, useStore } from './store'
import Landing from './screens/Landing'
import Home from './screens/Home'
import Clarify from './screens/Clarify'
import Generating from './screens/Generating'
import Drafts from './screens/Drafts'
import Composer from './screens/Composer'
import Send from './screens/Send'
import Next from './screens/Next'

const SCREENS = {
  home: Home,
  clarify: Clarify,
  generating: Generating,
  drafts: Drafts,
  composer: Composer,
  send: Send,
  next: Next,
}

function AppChrome() {
  const { state, go, dispatch } = useStore()
  const { Logo } = DS
  const Screen = SCREENS[state.route] || Home

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'color-mix(in srgb, var(--bg-base) 88%, transparent)',
          backdropFilter: 'saturate(140%) blur(8px)',
          borderBottom: '1px solid var(--border-hair)',
        }}
      >
        <div
          className="bw-container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}
        >
          <button
            onClick={() => go('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Logo variant="lockup" size={24} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)', color: 'var(--text-strong)' }}>
              BetterWords
            </span>
          </button>
          <button
            onClick={() => dispatch({ type: 'RESTART' })}
            className="bw-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
          >
            Start over
          </button>
        </div>
      </header>
      <div style={{ flex: 1 }}>
        <Screen />
      </div>
    </div>
  )
}

function Router() {
  const { state, dispatch } = useStore()
  if (state.route === 'landing') {
    return <Landing onStart={() => dispatch({ type: 'GOTO', route: 'home' })} />
  }
  return <AppChrome />
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
