// Seed strategies per scenario. Each strategy carries tone-banded copy so the
// composer's Soft↔Strong slider visibly rewrites the draft, and length-gated
// "detail" paragraphs so Succinct↔Detailed changes the body too.
//
// A paragraph slot is either a plain string (always shown) or an object:
//   { soft, mid, strong }          — tone-banded variants
//   { detail: true, text }         — only shown when length is high
//   { detail: true, soft, mid, strong } — both
//
// stance: 'Gentle' | 'Balanced' | 'Firm'

export const STRATEGIES = {
  rights: [
    {
      id: 'cordial-reminder',
      name: 'The Cordial Reminder',
      stance: 'Gentle',
      recommended: false,
      description:
        'Opens warmly and assumes good faith, with a clear ask and a soft deadline. Lowest friction, best when the relationship is worth protecting.',
      likelyReaction: 'Most read it as reasonable and reply to smooth things over — though a firm party may not feel real pressure.',
      risk: 22,
      impact: 48,
      to: 'Your landlord',
      re: 'Following up on my deposit',
      salutation: { soft: 'Hi there,', mid: 'Hello,', strong: 'Hello,' },
      body: [
        {
          soft: 'I hope you’re well. I wanted to gently follow up about the security deposit from my time at the unit — I haven’t yet seen it returned.',
          mid: 'I’m writing to follow up about the security deposit from my tenancy, which I haven’t yet received.',
          strong: 'I’m following up about my security deposit, which is now overdue for return.',
        },
        {
          detail: true,
          text: 'For reference, I moved out on the agreed date, left the unit clean, and returned all keys. I’ve kept photos from the final walkthrough in case they’re helpful.',
        },
        {
          soft: 'Whenever you have a moment, could you let me know the timing? I’d really appreciate it.',
          mid: 'Could you let me know when I can expect it returned, ideally within the next two weeks?',
          strong: 'Please let me know when it will be returned — I’d like to have it resolved within two weeks.',
        },
      ],
      closing: { soft: 'Thanks so much for your help.', mid: 'Thank you for sorting this out.', strong: 'Thank you for your prompt attention to this.' },
      signoff: 'Warmly,',
    },
    {
      id: 'documented-request',
      name: 'The Documented Request',
      stance: 'Balanced',
      recommended: true,
      description:
        'Pairs courtesy with a clear deadline and a paper trail, which most landlords act on. The dependable middle path.',
      likelyReaction: 'Read as someone who knows their footing. Usually prompts action without escalating the tone.',
      risk: 38,
      impact: 74,
      to: 'Your landlord',
      re: 'Return of security deposit — written request',
      salutation: { soft: 'Hello,', mid: 'Hello,', strong: 'To whom it may concern,' },
      body: [
        {
          soft: 'I’m writing to formally request the return of my security deposit, which remains outstanding.',
          mid: 'I’m writing to request the return of my security deposit, which is now past the date it was due.',
          strong: 'This is a formal written request for the return of my security deposit, which is overdue.',
        },
        {
          text: 'I vacated the unit on the agreed date, left it in good condition, and returned all keys. I have documentation of the move-out walkthrough on file.',
        },
        {
          detail: true,
          text: 'If any deductions are being applied, I’d ask for a written, itemized statement of them, as is standard practice.',
        },
        {
          soft: 'Could we aim to have this resolved within the next 14 days? I’m happy to confirm any details you need.',
          mid: 'Please confirm the return of the deposit within 14 days. I’m glad to provide anything further that helps.',
          strong: 'Please return the deposit, or provide an itemized statement, within 14 days.',
        },
      ],
      closing: { soft: 'I appreciate your help resolving this.', mid: 'Thank you for your attention to this matter.', strong: 'I trust this can be settled promptly.' },
      signoff: 'Sincerely,',
    },
    {
      id: 'formal-notice',
      name: 'The Formal Notice',
      stance: 'Firm',
      recommended: false,
      description:
        'A clear, on-the-record notice that references your rights and a firm deadline. For when softer attempts have gone nowhere.',
      likelyReaction: 'Taken seriously and rarely ignored — but it sets a formal tone that’s hard to walk back.',
      risk: 64,
      impact: 90,
      to: 'Your landlord',
      re: 'Formal notice — overdue security deposit',
      salutation: { soft: 'To whom it may concern,', mid: 'To whom it may concern,', strong: 'To whom it may concern,' },
      body: [
        {
          soft: 'I’m writing to give formal notice that my security deposit has not been returned within the required period.',
          mid: 'This letter serves as formal notice that my security deposit remains unreturned beyond the required period.',
          strong: 'This is formal notice that you have failed to return my security deposit within the period required by law.',
        },
        {
          text: 'I fulfilled the terms of the lease, vacated on the agreed date, and have retained dated evidence of the unit’s condition and the return of keys.',
        },
        {
          detail: true,
          text: 'I’ve reviewed the timelines that apply to deposit returns, and the deadline has now passed. I’d prefer to resolve this directly rather than pursue further steps.',
        },
        {
          soft: 'Please return the full deposit within 10 days so we can resolve this without escalation.',
          mid: 'I require the full deposit, or a lawful itemized accounting, within 10 days.',
          strong: 'Return the full deposit, or a lawful itemized accounting, within 10 days. Otherwise I will pursue the remedies available to me.',
        },
      ],
      closing: { soft: 'I hope we can settle this directly.', mid: 'I expect this to be resolved promptly.', strong: 'I will document any further delay.' },
      signoff: 'Regards,',
    },
  ],

  personal: [
    {
      id: 'warmth-first',
      name: 'Warmth First',
      stance: 'Gentle',
      recommended: true,
      description:
        'Leads with the relationship, names the need softly, and leaves the door wide open. Protects closeness above all.',
      likelyReaction: 'Lands as caring rather than accusing. They’re likely to soften and want to talk.',
      risk: 18,
      impact: 56,
      to: 'Someone close to you',
      re: 'Something I’ve wanted to say',
      salutation: { soft: 'Hey you,', mid: 'Hi,', strong: 'Hi,' },
      body: [
        {
          soft: 'I’ve been wanting to talk about something, and it matters to me that I say it kindly — because you matter to me.',
          mid: 'There’s something on my mind I’d like to share, and I want to say it with care.',
          strong: 'There’s something I need to be honest with you about, because our closeness is worth the honesty.',
        },
        {
          soft: 'Lately I’ve been carrying more of the costs than feels sustainable, and it’s started to weigh on me quietly.',
          mid: 'Lately the way our shared costs are split has started to feel uneven, and it’s been weighing on me.',
          strong: 'The way our shared costs land on me has become unfair, and I can’t keep carrying it silently.',
        },
        {
          detail: true,
          text: 'I don’t think it’s come from anywhere bad — it just crept up on us, and I’d rather name it than let it quietly build.',
        },
        {
          soft: 'Could we find a time to figure out something that feels fair to both of us? No pressure at all.',
          mid: 'Could we sit down and find a split that feels fair to us both?',
          strong: 'I’d like us to agree on a fair split soon — it’s important to me.',
        },
      ],
      closing: { soft: 'Thank you for hearing me. Love you.', mid: 'Thanks for hearing me out.', strong: 'Thank you for taking this seriously.' },
      signoff: '— with love,',
    },
    {
      id: 'honest-and-clear',
      name: 'Honest & Clear',
      stance: 'Balanced',
      recommended: false,
      description:
        'Says the thing plainly, with warmth intact and a clear request. Honest without being heavy.',
      likelyReaction: 'They understand exactly what you need. A little discomfort, but it clears the air.',
      risk: 36,
      impact: 78,
      to: 'Someone close to you',
      re: 'Being honest with you',
      salutation: { soft: 'Hi,', mid: 'Hi,', strong: 'Hi,' },
      body: [
        {
          soft: 'I want to be honest with you about something, gently but clearly.',
          mid: 'I want to be honest with you about something that’s been bothering me.',
          strong: 'I need to be honest with you about something that isn’t working for me.',
        },
        {
          text: 'I’ve been covering more than my share of our expenses, and it’s reached a point where I need that to change.',
        },
        {
          detail: true,
          text: 'I’m not keeping score, and I’m not upset with you — I just don’t want resentment to grow where there doesn’t need to be any.',
        },
        {
          soft: 'Can we talk this week and land on a split that works for both of us?',
          mid: 'I’d like us to agree on a fairer split. Can we talk this week?',
          strong: 'I need us to agree on a fairer split. Let’s talk this week.',
        },
      ],
      closing: { soft: 'It means a lot that I can say this to you.', mid: 'Thank you for understanding.', strong: 'I’m counting on us to sort this out.' },
      signoff: 'Love,',
    },
    {
      id: 'clear-line',
      name: 'The Clear Line',
      stance: 'Firm',
      recommended: false,
      description:
        'Sets the boundary explicitly and holds it, while staying respectful. For patterns that haven’t shifted with softer asks.',
      likelyReaction: 'Unmistakable. May sting at first, but it stops the pattern from continuing.',
      risk: 58,
      impact: 88,
      to: 'Someone close to you',
      re: 'A boundary I need to set',
      salutation: { soft: 'Hi,', mid: 'Hi,', strong: 'Hi,' },
      body: [
        {
          soft: 'I care about us, and I also need to be clear about something I can’t keep doing.',
          mid: 'I care about you, and I need to set a clear boundary.',
          strong: 'I care about you, but I’m done absorbing this quietly.',
        },
        {
          text: 'I’ve been carrying the bulk of our shared costs for a long time, and it isn’t something I can continue.',
        },
        {
          detail: true,
          text: 'I’ve raised versions of this before, so I want to be direct this time rather than hope it sorts itself out.',
        },
        {
          soft: 'Going forward I’ll need us to split things evenly. I’d love to work out the details together.',
          mid: 'Going forward, I need us to split costs evenly. Let’s set that up.',
          strong: 'From now on, costs are split evenly. That part isn’t up for debate, but how we do it is.',
        },
      ],
      closing: { soft: 'I’m saying this because the relationship is worth it.', mid: 'I hope you can hear this in the spirit it’s meant.', strong: 'I’d rather be honest than quietly resentful.' },
      signoff: '— ',
    },
  ],

  circle: [
    {
      id: 'quiet-word',
      name: 'The Quiet Word',
      stance: 'Gentle',
      recommended: false,
      description:
        'A low-key, private note that raises it without putting anyone on the defensive. Safest for fragile dynamics.',
      likelyReaction: 'Easy to receive. They may correct course quietly — though it can also be brushed off.',
      risk: 24,
      impact: 50,
      to: 'Your colleague',
      re: 'Quick note about the review',
      salutation: { soft: 'Hi,', mid: 'Hi,', strong: 'Hi,' },
      body: [
        {
          soft: 'Hoping to raise something small and a bit awkward, just between us.',
          mid: 'I wanted to raise something quietly, just the two of us.',
          strong: 'I wanted to flag something directly, between us, before it goes further.',
        },
        {
          soft: 'In the review, the analysis we discussed was presented without my part in it being mentioned — and it caught me off guard.',
          mid: 'In the review, the analysis I worked on was presented without my contribution being noted.',
          strong: 'In the review, my analysis was presented as solely your work.',
        },
        {
          detail: true,
          text: 'I’m sure it wasn’t intended the way it landed — I just didn’t want to let it pass without saying something.',
        },
        {
          soft: 'Could we make sure my contribution is reflected going forward? Happy to chat anytime.',
          mid: 'Could we make sure my contribution is credited from here on?',
          strong: 'I’d like my contribution credited, including a correction where it matters.',
        },
      ],
      closing: { soft: 'Thanks for understanding.', mid: 'Appreciate you hearing me out.', strong: 'I’d like to get this straight.' },
      signoff: 'Thanks,',
    },
    {
      id: 'fair-and-direct',
      name: 'Direct & Fair',
      stance: 'Balanced',
      recommended: true,
      description:
        'States what happened and what you need, professionally and without heat. Credible and hard to dismiss.',
      likelyReaction: 'Read as composed and fair. Usually gets the credit corrected without drama.',
      risk: 40,
      impact: 76,
      to: 'Your colleague',
      re: 'Crediting the analysis from the review',
      salutation: { soft: 'Hi,', mid: 'Hi,', strong: 'Hi,' },
      body: [
        {
          soft: 'I’d like to raise something from the review, plainly and fairly.',
          mid: 'I wanted to follow up on the review directly.',
          strong: 'I need to address something from the review directly.',
        },
        {
          text: 'The analysis presented was work I led, and it was shared without my contribution being acknowledged.',
        },
        {
          detail: true,
          text: 'I’m raising it now rather than later because credit matters for how my work is seen, and I’d rather sort it cleanly between us.',
        },
        {
          soft: 'Could we correct the record and make sure I’m credited on it going forward?',
          mid: 'I’d like the record corrected and my contribution credited going forward.',
          strong: 'Please correct the record and credit my contribution — and let’s keep it accurate from here.',
        },
      ],
      closing: { soft: 'Thanks for working this out with me.', mid: 'Thank you for sorting this out.', strong: 'I’d like this resolved this week.' },
      signoff: 'Best,',
    },
    {
      id: 'on-record',
      name: 'On the Record',
      stance: 'Firm',
      recommended: false,
      description:
        'Documents what happened and copies the right person, so the credit can’t quietly disappear. For when it’s already been ignored once.',
      likelyReaction: 'Carries real weight and creates a paper trail — but raises the stakes with everyone watching.',
      risk: 66,
      impact: 89,
      to: 'Your manager',
      re: 'Crediting contribution on the project review',
      salutation: { soft: 'Hi,', mid: 'Hello,', strong: 'Hello,' },
      body: [
        {
          soft: 'I wanted to put something on the record, clearly and professionally.',
          mid: 'I’m writing to put something on the record for the team.',
          strong: 'I’m formally raising a credit issue from the project review.',
        },
        {
          text: 'The analysis presented in the review was work I led. It was shared without my contribution being acknowledged, and an earlier private note didn’t resolve it.',
        },
        {
          detail: true,
          text: 'I’m flagging it here so the contribution is documented accurately, and so this doesn’t affect how my work is evaluated.',
        },
        {
          soft: 'Could we correct the attribution and note it for the record?',
          mid: 'I’d like the attribution corrected and reflected in the record.',
          strong: 'Please correct the attribution on the record and ensure my contribution is properly credited.',
        },
      ],
      closing: { soft: 'Thank you for looking into this.', mid: 'Thank you for addressing this.', strong: 'I’d appreciate confirmation once it’s corrected.' },
      signoff: 'Regards,',
    },
  ],
}

export function getStrategies(scenarioId) {
  return STRATEGIES[scenarioId] || []
}
