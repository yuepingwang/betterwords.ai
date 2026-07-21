import React, { useEffect } from 'react'
import './ds/daybreak.css'
import './v35.css'
import { StoreProvider, useStore } from './store'
import { AuthProvider } from './lib/auth'
import { SiteHeader, SiteFooter } from './components/SiteChrome'
import Landing from './screens/Landing'
import Home from './screens/Home'
import Clarify from './screens/Clarify'
import Generating from './screens/Generating'
import Drafts from './screens/Drafts'
import Composer from './screens/Composer'
import Send from './screens/Send'
import Next from './screens/Next'
import Conversations from './screens/Conversations'
import Conversation from './screens/Conversation'
import ReplyFlow from './screens/ReplyFlow'

const SCREENS = {
  home: Home,
  clarify: Clarify,
  generating: Generating,
  drafts: Drafts,
  editor: Composer,
  send: Send,
  next: Next,
  // v3.5 conversations flow
  conversations: Conversations,
  conversation: Conversation,
  replyflow: ReplyFlow,
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

  // Per-screen page grounds live on this wrapper (not the screens) so they
  // run the full viewport height — behind the sticky header at the top and
  // under the frosted translucent footer at the bottom. Home gets the warm
  // dawn welcome, the editor its daybreak + sparkles, and every other flow
  // screen shares the calm "soft" focus ground.
  const SOFT_SCREENS = ['clarify', 'generating', 'drafts', 'conversations', 'conversation', 'replyflow']
  // Post-send moments (the sent celebration and the what-comes-next page)
  // get the excited grad-soft variant with breathing glows. The pre-send
  // review shares the composer's daybreak + sparkle ground. On the send
  // screen the sent flip keeps the daybreak ground and fades the celebration
  // sweep in over it (overlay below), so the background transitions smoothly
  // instead of snapping.
  const sendCelebrate = state.screen === 'send' && state.sent
  const celebrating = state.screen === 'next'
  const bgClass = celebrating
    ? 'bw-celebrate-bg'
    : { home: 'grad-dawn', editor: 'bw-cmp-bg', send: 'bw-cmp-bg' }[state.screen] ||
      (SOFT_SCREENS.includes(state.screen) ? 'grad-soft' : undefined)
  const bgStyle = celebrating || sendCelebrate
    ? undefined
    : state.screen === 'home'
      ? { backgroundImage: 'var(--glow-dawn-top), var(--grad-dawn)' }
      : SOFT_SCREENS.includes(state.screen)
        ? { backgroundImage: 'var(--glow-peri), var(--grad-soft)' }
        : undefined

  return (
    <div
      className={bgClass}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream-1)', ...bgStyle, fontFamily: 'var(--font-sans)', color: 'var(--text-body)', position: 'relative' }}
    >
      {sendCelebrate && (
        <div className="bw-celebrate-bg bw-celebrate-fade" aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
      )}
      {/* the composer brings its own header (draft actions live in it —
          see ComposerHeader in Composer.jsx); every other screen shares
          the marketing-style SiteHeader */}
      {state.screen !== 'editor' && (
        <SiteHeader
          onLogo={() => dispatch({ type: 'GO_LANDING' })}
          onNav={goLandingSection}
          onStart={() => dispatch({ type: 'RESTART' })}
        />
      )}
      <Screen />
      <SiteFooter onLogo={() => dispatch({ type: 'GO_LANDING' })} onNav={goLandingSection} />
    </div>
  )
}

export default function V35App() {
  // Everything v3 renders inside `.bw-v35`, which is the scope for all v3
  // styles (see v35.css). This is what keeps v3's look fully isolated from v1 and v2.
  return (
    <StoreProvider>
      <div className="bw-v35">
        {/* AuthProvider sits inside .bw-v35 so the sign-in sheet it renders
            picks up the Daybreak tokens. */}
        <AuthProvider>
          <Router />
        </AuthProvider>
      </div>
    </StoreProvider>
  )
}
