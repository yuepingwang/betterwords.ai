// ------------------------------------------------------------------
// demo.js — sample conversations for the v3.5 sandbox. Shown when the
// viewer isn't signed in (or accounts aren't configured) so the whole
// conversations flow is browsable without an account. Shapes mirror
// db.js summarizeThread()/fetchThread() exactly.
// ------------------------------------------------------------------

const daysAgo = (n, h = 10) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(h, 24 - n, 0, 0)
  return d.toISOString()
}

const T1_SENT = [
  'I’m following up about the return of my security deposit for 14 Pineapple Street, now that my lease has ended. For reference, I moved out on 30 May and left the unit clean, with all keys returned.',
  'Could you let me know when I can expect the deposit to be returned? If there are any deductions you’re considering, I’d appreciate a short itemized list so we’re on the same page.',
  'Thanks for your time — I’m hoping we can wrap this up simply.',
].join('\n\n')

const T1_REPLY = [
  'Hi — thanks for the note, and apologies for the slow turnaround. Things have been hectic on my end.',
  'I still need to do the move-out inspection with the contractor before I can release anything. I’m hoping to have that sorted by the end of the month, and I’ll be in touch after that.',
].join('\n\n')

const T2_SENT = [
  'I wanted to say this properly rather than in passing: I’ve noticed I’m carrying most of the calls and visits lately, and it’s started to wear on me.',
  'I’m not keeping score — I just miss it feeling mutual. Could we find a rhythm that works for both of us?',
].join('\n\n')

const T3_DRAFT = [
  'I’d like to talk about how the on-call rotation has been landing on me this quarter. Three of the last four weekends have been mine, and it’s not sustainable.',
  'Could we look at the schedule together this week and spread the load more evenly?',
].join('\n\n')

const T4_SENT = [
  'Our shared fence on the north side started leaning badly after the last storm, so I went ahead and got a repair quote from Hartley Fencing.',
  'Would you be open to splitting the repair cost? Happy to send the quote over and coordinate the work so it’s painless for both of us.',
].join('\n\n')

const T4_REPLY = [
  'Thanks for flagging it — I’d noticed the lean too. Splitting the cost seems fair to me. Send the quote over and let’s pick a week that works.',
].join('\n\n')

export const DEMO_THREADS = [
  {
    id: 'demo-replied',
    scenarioId: 'rights',
    recipient: 'Your landlord',
    subject: 'Security deposit return',
    context: {
      answers: {
        harm: 'My security deposit',
        urgency: 'Within a few weeks',
        goal: 'my full $800 deposit returned within two weeks',
        rel: 'Neutral / formal',
        fear: 'Being ignored',
      },
    },
    createdAt: daysAgo(9),
    updatedAt: daysAgo(3),
    counts: { drafts: 4, sent: 1, replies: 1 },
    lastActivityAt: daysAgo(3),
    hasSent: true,
    awaiting: false,
    messages: [
      { id: 'demo-r-d1', kind: 'draft_version', body: T1_SENT, context: { tone: 38, verbosity: 50 }, created_at: daysAgo(9) },
      { id: 'demo-r-s1', kind: 'sent', body: T1_SENT, context: { tone: 50, verbosity: 50 }, created_at: daysAgo(5) },
      { id: 'demo-r-r1', kind: 'reply', body: T1_REPLY, context: { pasted: true }, created_at: daysAgo(3) },
    ],
  },
  {
    id: 'demo-waiting',
    scenarioId: 'personal',
    recipient: 'Your brother',
    subject: 'Sharing the load with Mom',
    context: {
      answers: {
        pattern: 'I’m doing most of the reaching out',
        feel: 'Worn thin',
        hope: 'a rhythm where the effort feels mutual',
      },
    },
    createdAt: daysAgo(12),
    updatedAt: daysAgo(6),
    counts: { drafts: 2, sent: 1, replies: 0 },
    lastActivityAt: daysAgo(6),
    hasSent: true,
    awaiting: true,
    messages: [
      { id: 'demo-w-d1', kind: 'draft_version', body: T2_SENT, context: { tone: 30, verbosity: 44 }, created_at: daysAgo(7) },
      { id: 'demo-w-s1', kind: 'sent', body: T2_SENT, context: { tone: 34, verbosity: 44 }, created_at: daysAgo(6) },
    ],
  },
  {
    id: 'demo-drafting',
    scenarioId: 'circle',
    recipient: 'Your manager',
    subject: 'Rebalancing the on-call weekends',
    context: {
      answers: {
        issue: 'Weekend on-call keeps landing on me',
        goal: 'a fairer rotation starting next month',
      },
    },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    counts: { drafts: 1, sent: 0, replies: 0 },
    lastActivityAt: daysAgo(1),
    hasSent: false,
    awaiting: false,
    messages: [
      { id: 'demo-d-d1', kind: 'draft_version', body: T3_DRAFT, context: { tone: 55, verbosity: 40 }, created_at: daysAgo(1) },
    ],
  },
  {
    id: 'demo-fence',
    scenarioId: 'rights',
    recipient: 'Your neighbor',
    subject: 'The shared fence',
    context: {
      answers: {
        harm: 'The fence we share needs a repair',
        urgency: 'I have time',
        goal: 'split the fence repair cost evenly',
        rel: 'Cordial',
      },
    },
    createdAt: daysAgo(8),
    updatedAt: daysAgo(3, 16),
    counts: { drafts: 2, sent: 1, replies: 1 },
    lastActivityAt: daysAgo(3, 16),
    hasSent: true,
    awaiting: false,
    messages: [
      { id: 'demo-f-d1', kind: 'draft_version', body: T4_SENT, context: { tone: 46, verbosity: 42 }, created_at: daysAgo(8) },
      { id: 'demo-f-s1', kind: 'sent', body: T4_SENT, context: { tone: 46, verbosity: 42 }, created_at: daysAgo(6) },
      { id: 'demo-f-r1', kind: 'reply', body: T4_REPLY, context: { pasted: true }, created_at: daysAgo(3, 16) },
    ],
  },
]

// Mirror db.js summarizeThread(): the list cards quote the first line of the
// latest message, and their copy action grabs the whole body.
DEMO_THREADS.forEach((t) => {
  t.lastBody = t.messages[t.messages.length - 1]?.body || ''
  t.snippet = t.lastBody.split('\n')[0]
})

export const getDemoThread = (id) => DEMO_THREADS.find((t) => t.id === id) || null
