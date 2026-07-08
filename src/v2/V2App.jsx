import React, { useEffect } from 'react'
import './ds/daybreak.css'
import './v2.css'
import { StoreProvider, useStore } from './store'
import { SiteHeader, SiteFooter } from './components/SiteChrome'
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

  // Header/footer nav targets live on the landing page — go there first,
  // then scroll to the section once it has rendered.
  const goLandingSection = (id) => {
    dispatch({ type: 'GO_LANDING' })
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
    }, 60)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream-1)', fontFamily: 'var(--font-sans)', color: 'var(--text-body)', position: 'relative' }}>
      <SiteHeader
        clear={state.screen === 'editor'}
        onLogo={() => dispatch({ type: 'GO_LANDING' })}
        onNav={goLandingSection}
        onStart={() => dispatch({ type: 'RESTART' })}
      />
      <Screen />
      <SiteFooter onLogo={() => dispatch({ type: 'GO_LANDING' })} onNav={goLandingSection} />
    </div>
  )
}

export default function V2App() {
  // Everything v2 renders inside `.bw-v2`, which is the scope for all v2
  // styles (see v2.css). This is what keeps v2's look fully isolated from v1.
  return (
    <StoreProvider>
      <div className="bw-v2">
        <Router />
      </div>
    </StoreProvider>
  )
}
