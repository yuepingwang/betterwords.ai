// The three contexts BetterWords supports, with their scripted clarifying
// questions. Copy is drawn from the project brief and the design canvases.
// Question types: 'chips' (single-select), 'multi' (multi-select), 'text'.

export const SCENARIOS = [
  {
    id: 'rights',
    kicker: 'Renters · Clients · Patients',
    title: 'Defending your rights',
    blurb:
      'A deposit, a lease, a service you paid for — handled wrong, and it needs addressing.',
    illustration: 'mailbox',
    examples: ['Deposit withheld', 'Repairs ignored', 'Overcharged', 'Care denied', 'Rights overlooked'],
  },
  {
    id: 'personal',
    kicker: 'Family · Partner · Friends',
    title: 'Personal relationships',
    blurb: 'A boundary, an unmet need, or a hurt close to home that you’ve been carrying.',
    illustration: 'care',
    examples: ['Money boundary', 'An unmet need', 'A hurt', 'Needing space', 'A recurring pattern'],
  },
  {
    id: 'circle',
    kicker: 'Work · School · Teams',
    title: 'A close-knit circle',
    blurb: 'Credit taken, unfair blame, being underpaid — when speaking up feels risky.',
    illustration: 'people',
    examples: ['Credit taken', 'Unfair blame', 'Underpaid', 'Overworked', 'Unfair grade', 'Asking for help'],
  },
]

export function getScenario(id) {
  return SCENARIOS.find((s) => s.id === id) || null
}

// Five clarifying questions per scenario. The shape is intentionally close
// to what an LLM intake would collect: who, what, goal, fear, constraints.
const COMMON_TAIL = [
  {
    id: 'goal',
    type: 'chips',
    title: 'What outcome are you hoping for?',
    help: 'Pick the closest.',
    options: ['An apology', 'A concrete fix', 'To be heard', 'A boundary respected', 'Money back', 'A fair process'],
  },
  {
    id: 'fear',
    type: 'chips',
    title: 'What worries you most about sending it?',
    help: 'This shapes how careful each draft is.',
    options: ['They’ll get angry', 'It hurts the relationship', 'Nothing will change', 'I’ll seem difficult', 'It backfires on me'],
  },
]

export const QUESTIONS = {
  rights: [
    {
      id: 'who',
      type: 'chips',
      title: 'Who needs to hear from you?',
      help: 'The party on the other side.',
      options: ['Landlord', 'Property manager', 'A company', 'A provider', 'An attorney', 'Someone else'],
    },
    {
      id: 'what',
      type: 'text',
      title: 'What happened, in a sentence or two?',
      help: 'Plain and specific — we’ll shape the wording.',
      placeholder: 'They’ve withheld my deposit for three weeks with no explanation…',
    },
    {
      id: 'urgency',
      type: 'chips',
      title: 'How urgent is it?',
      help: 'Affects tone and how firm the deadline is.',
      options: ['There’s a hard deadline', 'Soon — it’s escalating', 'Steady, but unresolved', 'Just want it on record'],
    },
    ...COMMON_TAIL,
  ],
  personal: [
    {
      id: 'who',
      type: 'chips',
      title: 'Who is this for?',
      help: 'Closeness changes everything about tone.',
      options: ['Partner', 'Parent', 'Sibling', 'Close friend', 'Family member', 'Someone else'],
    },
    {
      id: 'what',
      type: 'text',
      title: 'What’s been weighing on you?',
      help: 'Say it however it comes out — we’ll find the words.',
      placeholder: 'I keep covering the bills and it’s started to feel unfair…',
    },
    {
      id: 'why-hard',
      type: 'chips',
      title: 'Why does saying it feel hard?',
      help: 'The real reason behind the hesitation.',
      options: ['Afraid of their reaction', 'Don’t want to hurt them', 'Guilt', 'It’s happened before', 'Power imbalance'],
    },
    ...COMMON_TAIL,
  ],
  circle: [
    {
      id: 'who',
      type: 'chips',
      title: 'Who’s on the other side?',
      help: 'And how much you depend on them.',
      options: ['Manager', 'Coworker', 'Professor', 'Teammate', 'Client', 'Someone else'],
    },
    {
      id: 'what',
      type: 'text',
      title: 'What happened?',
      help: 'The situation you need to address.',
      placeholder: 'A coworker presented my analysis as their own in the review…',
    },
    {
      id: 'risk',
      type: 'chips',
      title: 'What’s the risk if it goes badly?',
      help: 'So drafts stay safe where they need to.',
      options: ['My standing at work', 'My grade or evaluation', 'A reference I need', 'Day-to-day friction', 'Little — just awkward'],
    },
    ...COMMON_TAIL,
  ],
}

export function getQuestions(scenarioId) {
  return QUESTIONS[scenarioId] || []
}
