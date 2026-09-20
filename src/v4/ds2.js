// Accessor over the Betterwords.ai "Daybreak" design-system bundle
// (window.BetterwordsAiDesignSystem_ac387e), pulled from claude.ai/design and
// loaded in main.jsx before the v3 app renders. Mirrors src/ds.js (which does
// the same for v1's Messenger bundle).
//
// Usage:  import DS2 from '../ds2'
//         function Screen() { const { Button, Card, Segmented } = DS2; ... }
//
// Available: GradientField, Icon, ICON_NAMES, Logo, Sparkle, Badge, Tag, Toast,
// Tooltip, Button, Checkbox, IconButton, Input, Radio, Segmented, Select,
// Slider, Switch, Textarea, BottomNav, Tabs, Avatar, Card, Divider, Sheet,
// DraftPanel (the Composer's frosted draft surface, synced back 2026-07-18).
const NS = 'BetterwordsAiDesignSystem_ac387e'

function ns() {
  const ds = window[NS]
  if (!ds) {
    throw new Error(
      `Betterwords design system (window.${NS}) is not loaded. ` +
        `It must be injected before the v3 app renders (see src/main.jsx).`,
    )
  }
  return ds
}

// Components are read lazily via getters so this module can be imported at the
// top of files without caring about bundle load order.
const handler = {
  get(_t, prop) {
    return ns()[prop]
  },
}

const DS2 = new Proxy({}, handler)
export default DS2
