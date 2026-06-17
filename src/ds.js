// Thin accessor over the Messenger design-system global. The bundle is
// loaded in main.jsx before the app renders, so by the time any component
// reads from here the namespace is guaranteed to exist.
const NS = 'MessengerDesignSystem_02d4f6'

function ns() {
  const ds = window[NS]
  if (!ds) {
    throw new Error(
      `Messenger design system (window.${NS}) is not loaded. ` +
        `It must be injected before the app renders (see src/main.jsx).`,
    )
  }
  return ds
}

// Components are read lazily via getters so this module can be imported
// at the top of files without caring about load order.
const handler = {
  get(_t, prop) {
    return ns()[prop]
  },
}

// Usage: import DS from './ds'; const { Button, Card } = DS
const DS = new Proxy({}, handler)
export default DS
