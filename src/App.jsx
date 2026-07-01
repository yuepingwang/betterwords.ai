import React, { useEffect } from 'react'
import { StoreProvider, useStore } from './store'
import BrandMark, { Wordmark } from './components/BrandMark'
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
  editor: Composer,
  send: Send,
  next: Next,
}

function TopBar() {
  const { state, dispatch } = useStore()
  const showStartBtn = state.screen === 'next'
  return (
    <header
      className="bw-topbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        height: 64,
        padding: '0 32px',
        background: 'rgba(248,244,233,0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-hair)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-800)', cursor: 'pointer' }}
        onClick={() => dispatch({ type: 'GO_LANDING' })}
      >
        <BrandMark size={26} />
        <Wordmark size={19} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        {showStartBtn && (
          <a
            onClick={() => dispatch({ type: 'RESTART' })}
            style={{
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--cream-0)',
              background: 'var(--royal-600)',
              padding: '10px 20px',
              borderRadius: 999,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--royal-700)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'var(--royal-600)')}
          >
            Start writing
          </a>
        )}
      </div>
    </header>
  )
}

function Footer() {
  const { dispatch } = useStore()
  const links = ['How it works', 'Situations']
  return (
    <footer style={{ marginTop: 'auto', background: 'var(--cream-1)', padding: '36px 32px', borderTop: '1px solid var(--border-hair)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => dispatch({ type: 'RESTART' })}>
          <BrandMark size={26} />
          <Wordmark size={18} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map((l) => (
            <span key={l} style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5, color: 'var(--text-muted)', cursor: 'pointer' }}>
              {l}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-faint)' }}>© 2026 BetterWords</div>
      </div>
    </footer>
  )
}

function Router() {
  const { state, dispatch } = useStore()

  // Scroll back to the top whenever the screen changes.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.screen])

  if (state.screen === 'landing') {
    // The landing emits an optional scenario key: a scenario card sends the
    // user straight into that clarify flow; a generic CTA goes to home.
    return (
      <Landing
        onStart={(key) =>
          key ? dispatch({ type: 'START_SCENARIO', scenarioId: key }) : dispatch({ type: 'RESTART' })
        }
      />
    )
  }
  const Screen = SCREENS[state.screen] || Home
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-1)', fontFamily: 'var(--font-sans)', color: 'var(--text-body)', position: 'relative' }}>
      <TopBar />
      <Screen />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
