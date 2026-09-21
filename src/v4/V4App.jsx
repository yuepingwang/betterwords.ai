import React, { useEffect } from 'react'
import { GrainGradient } from '@paper-design/shaders-react'
import './ds/daybreak.css'
import './v4.css'
import { StoreProvider, useStore } from './store'
import { AuthProvider } from './lib/auth'
import { SiteHeader, SiteFooter } from './components/SiteChrome'
import Landing from './screens/Landing'
import Home from './screens/Home'
import HomeDashboard from './screens/HomeDashboard'
import Clarify from './screens/Clarify'
import Generating from './screens/Generating'
import Drafts from './screens/Drafts'
import Composer from './screens/Composer'
import Send from './screens/Send'
import Next from './screens/Next'
import Conversations from './screens/Conversations'
import Conversation from './screens/Conversation'
import ReplyFlow from './screens/ReplyFlow'
import Account from './screens/Account'
import Settings from './screens/Settings'

const REDUCE_MOTION = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
// render the grain shader at 2× the device's own pixel ratio: grain specks
// come out half a device pixel — "2× finest"
const GRAIN_2X_RATIO = typeof window !== 'undefined' ? Math.max(2, (window.devicePixelRatio || 1) * 2) : 4

const SCREENS = {
  home: Home,
  dashboard: HomeDashboard, // signed-in home (Figma 489:3991)
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
  // signed-in utility pages (reached from the avatar menu / dashboard pills)
  account: Account,
  settings: Settings,
}

function Router() {
  const { state, dispatch } = useStore()

  // Scroll back to the top whenever the screen changes.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.screen])

  // Arriving on a sunset screen from a soft-ground loading beat (Generating's
  // "Composing…", ReplyFlow's "Drafting…") cross-fades the grounds: the soft
  // sweep lingers as an overlay on the new screen and fades out (see
  // .bw-ground-xfade in v4.css). Latched briefly so mid-animation re-renders
  // can't cut it short.
  const prevScreenRef = React.useRef(null)
  const [groundXfade, setGroundXfade] = React.useState(false)
  useEffect(() => {
    const prev = prevScreenRef.current
    prevScreenRef.current = state.screen
    if ((state.screen === 'drafts' && prev === 'generating') || (state.screen === 'editor' && prev === 'replyflow')) {
      setGroundXfade(true)
      const t = setTimeout(() => setGroundXfade(false), 1150)
      return () => clearTimeout(t)
    }
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
  const SOFT_SCREENS = ['clarify', 'generating', 'replyflow']
  // Conversations flow — these screens swap the marketing header links for
  // the app cluster (My Conversations · + New · avatar).
  const CONVO_SCREENS = ['conversations', 'conversation', 'replyflow']
  // Post-send moments (the sent celebration and the what-comes-next page)
  // get the excited grad-soft variant with breathing glows. The pre-send
  // review shares the composer's daybreak + sparkle ground. On the send
  // screen the sent flip keeps the daybreak ground and fades the celebration
  // sweep in over it (overlay below), so the background transitions smoothly
  // instead of snapping.
  const sendCelebrate = state.screen === 'send' && state.sent
  const celebrating = state.screen === 'next'
  // The editor paints its own sunset ground inside Composer.jsx (Figma
  // 449:2180); only the send screen still uses the daybreak+sparkle sweep.
  const bgClass = celebrating
    ? 'bw-celebrate-bg'
    : { home: 'grad-dawn', send: 'bw-cmp-bg' }[state.screen] ||
      (SOFT_SCREENS.includes(state.screen) ? 'grad-soft' : undefined)
  const bgStyle = celebrating || sendCelebrate
    ? undefined
    : state.screen === 'home'
      // reversed dawn: the ground runs peri at the top down to peach at the
      // bottom (the stock --grad-dawn flipped 180°), with the warm glow
      // moved from the top edge to the bottom
      ? { backgroundImage: 'radial-gradient(60% 60% at 50% 100%, rgba(251, 215, 193, 0.65), transparent 70%), linear-gradient(325deg, #F9BF9E 0%, #FBD7C1 34%, #FBF1E4 60%, #CFDDFB 100%)' }
      : SOFT_SCREENS.includes(state.screen)
        ? { backgroundImage: 'var(--glow-peri), var(--grad-soft)' }
        : undefined
  // Screens whose main portion carries the daybreak-edge ground (the Figma
  // "main body" frame: paper with the rainbow cresting at the fold — painted
  // by the screen itself). Under that rainbow the footer flips to its
  // night-blue scheme so the sweep lands on dusk, not cream. The
  // conversations LIST moved to the home ground (warm footer, below).
  const DAYBREAK_EDGE_SCREENS = ['conversation']
  // The signed-in home + conversations list (Figma 490:4345 / 490:4601):
  // both paint the home ground themselves, pull up under the clear header
  // (which frosts only past the hero card), and end on the warm footer.
  const HOME_SCREENS = ['dashboard', 'conversations']
  // Account/Settings share the home ground + warm footer but have no image
  // hero, so the header frosts on scroll as usual (no heroSelector).
  const WARM_SCREENS = [...HOME_SCREENS, 'account', 'settings']
  // Drafts shares the composer's sunset ground (painted in each screen), so
  // both get the teal-lipped night footer.
  const SUNSET_SCREENS = ['editor', 'drafts']
  const nightFooter = DAYBREAK_EDGE_SCREENS.includes(state.screen) || SUNSET_SCREENS.includes(state.screen)
  // The v4 composer sunset (Figma 566:5667) ends on blue-500, the night
  // footer's own default. The conversation thread's dusk crest (Figma
  // 445:1322) instead ends on peri-blue and deepens to royal by 4%.
  const footerLip = state.screen === 'conversation' ? '#6E88E4' : undefined
  const footerBody = state.screen === 'conversation' ? '#2B45D4' : undefined

  return (
    <div
      className={[bgClass, groundXfade && 'bw-ground-xfade'].filter(Boolean).join(' ') || undefined}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream-1)', ...bgStyle, fontFamily: 'var(--font-sans)', color: 'var(--text-body)', position: 'relative', isolation: ['home', 'editor'].includes(state.screen) ? 'isolate' : undefined }}
    >
      {sendCelebrate && (
        <div className="bw-celebrate-bg bw-celebrate-fade" aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
      )}
      {/* home ground haze — the landing hero's GrainGradient recipe, on
          the app wrapper so it runs the FULL page height: behind the
          (transparent/frosted) header at the top and showing through the
          frosted footer at the bottom. z -1 inside the wrapper's isolated
          stacking context keeps it above the dawn gradient but below all
          content. Frozen under reduced motion. */}
      {state.screen === 'home' && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* rendered at 2× the device's native resolution (supersampled,
              then downscaled to fit), so the per-pixel grain comes out
              twice as fine as a device pixel */}
          <GrainGradient
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            minPixelRatio={GRAIN_2X_RATIO}
            maxPixelCount={34000000}
            colorBack="#00000000"
            colors={['#CFDDFB', '#DCE6FB', '#EFE8F7', '#FFFDF9']}
            shape="wave"
            softness={0.95}
            intensity={0.3}
            noise={0.38}
            speed={REDUCE_MOTION ? 0 : 0.4}
            scale={1.7}
          />
        </div>
      )}
      {/* the composer brings its own header (draft actions live in it —
          see ComposerHeader in Composer.jsx); every other screen shares
          the marketing-style SiteHeader */}
      {state.screen !== 'editor' && (
        <SiteHeader
          heroSelector={HOME_SCREENS.includes(state.screen) ? '.bw-v4 .bw-home-hero' : null}
          onLogo={() => dispatch({ type: 'GO_LANDING' })}
          onNav={goLandingSection}
          onStart={() => dispatch({ type: 'RESTART' })}
        />
      )}
      <Screen />
      {/* drafts drops its night scheme along with the night fill: its
          transparent footer sits on the cream page ground, so it needs the
          default dark text */}
      <SiteFooter night={nightFooter && !['drafts', 'editor'].includes(state.screen)} warm={WARM_SCREENS.includes(state.screen)} transparent={['home', 'clarify', 'drafts', 'replyflow', 'editor', 'send'].includes(state.screen)} noDivider={state.screen === 'conversation'} lip={footerLip} body={footerBody} onLogo={() => dispatch({ type: 'GO_LANDING' })} onNav={goLandingSection} />
    </div>
  )
}

export default function V4App() {
  // Everything v3 renders inside `.bw-v4`, which is the scope for all v3
  // styles (see v4.css). This is what keeps v3's look fully isolated from v1 and v2.
  return (
    <StoreProvider>
      <div className="bw-v4">
        {/* AuthProvider sits inside .bw-v4 so the sign-in sheet it renders
            picks up the Daybreak tokens. */}
        <AuthProvider>
          <Router />
        </AuthProvider>
      </div>
    </StoreProvider>
  )
}
