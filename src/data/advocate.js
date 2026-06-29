// Faithful transcription of the `data` object from Advocate.dc.html — the
// three scenarios, their clarifying questions, and the strategy drafts with
// sentence-level tone variants. This is the mock-AI's source content.

export const DATA = {
  rights: {
    label: 'Defending your rights',
    kicker: 'Renters · Clients · Patients',
    illo: 'briefcase',
    blurb: 'Your deposit, lease, or a service you paid for isn’t being handled right — and it needs to be addressed.',
    recipient: 'Your landlord — Mr. Aubert',
    draftContext: 'To your landlord · about your withheld $1,850 deposit',
    // home card presentation (mirrors the landing "Where it helps" cards)
    home: {
      blurb: 'A deposit, a lease, a service you paid for — handled wrong, and it needs addressing.',
      examples: ['Deposit withheld', 'Repairs', 'Overcharged', 'Care denied', 'Rights overlooked'],
      bg: 'var(--peri-200)',
    },
    questions: [
      { id: 'harm', type: 'chips', title: 'What’s being withheld or harmed?', helper: 'Pick the closest.', options: ['My security deposit', 'Repairs aren’t done', 'I was overcharged', 'My lease terms aren’t honored'], allowCustom: true, customPlaceholder: 'Describe what’s being withheld or harmed…' },
      { id: 'urgency', type: 'chips', title: 'How time-sensitive is it?', options: ['I have time', 'Within a few weeks', 'It’s urgent'] },
      { id: 'goal', type: 'text', title: 'What outcome would resolve this for you?', helper: 'Your ideal result, in a line.', placeholder: 'e.g. my full $1,850 deposit returned within two weeks' },
      { id: 'rel', type: 'chips', title: 'How have things been with them so far?', options: ['Cordial', 'Neutral / formal', 'Already strained'] },
      { id: 'fear', type: 'chips', title: 'What worries you most about sending this?', options: ['Being ignored', 'A drawn-out dispute', 'Retaliation', 'Sounding too aggressive'] },
    ],
    strategies: [
      {
        name: 'The Cordial Reminder', level: 'soft', toneDefault: 24, risk: 18, eff: 46,
        subject: 'Following up on my deposit return',
        why: 'Keeps things friendly and gives them an easy, face-saving way to act.',
        reaction: 'Likely a prompt, apologetic reply — but easy to stall if they’re disorganized.',
        body: [
          { s: [
            { soft: 'I hope you’re well. I wanted to gently follow up about the return of my security deposit for 14 Rue Pelletier, now that the lease has ended.', bal: 'I’m following up about the return of my security deposit for 14 Rue Pelletier, now that my lease has ended.', strong: 'I’m writing about the return of my security deposit for 14 Rue Pelletier, which is now due following the end of my lease.' },
            { soft: 'For reference, I moved out on 30 May and left the unit clean, with all keys returned.', bal: 'For reference, I moved out on 30 May and left the unit clean, with all keys returned.', strong: 'For reference, I moved out on 30 May and left the unit clean, with all keys returned.', detail: true },
          ] },
          { s: [
            { soft: 'Whenever you have a moment, could you let me know when I might expect it?', bal: 'Could you let me know when I can expect the deposit to be returned?', strong: 'Please let me know by the end of the week when the deposit will be returned.' },
            { soft: 'If there are any deductions you’re considering, I’d appreciate a short itemized list so we’re on the same page.', bal: 'If there are any deductions you’re considering, I’d appreciate a short itemized list so we’re on the same page.', strong: 'If there are any deductions you’re considering, I’d appreciate a short itemized list so we’re on the same page.', detail: true },
          ] },
        ],
        close: 'Thank you for your help — I’ve appreciated our time as tenant and landlord.',
        add: [
          { label: 'After the opening — add a warm note', after: 0, text: 'It’s been a good couple of years in the apartment, and I’ve tried to leave it in great shape.' },
          { label: 'Before your ask — mention your records', after: 1, text: 'I’ve kept the move-out photos and our signed walkthrough, in case they’re helpful.' },
          { label: 'At the close — offer flexibility', after: 2, text: 'Happy to arrange a transfer or cheque, whichever is easier on your end.' },
        ],
      },
      {
        name: 'The Documented Request', level: 'balanced', toneDefault: 50, risk: 42, eff: 78, recommended: true,
        subject: 'Request to return security deposit — 14 Rue Pelletier',
        why: 'Pairs courtesy with a clear deadline and a paper trail, which most landlords act on.',
        reaction: 'Usually taken seriously; prompts either payment or a concrete itemization.',
        body: [
          { s: [
            { soft: 'I’m writing to request the return of my $1,850 security deposit for 14 Rue Pelletier, following the end of my tenancy on 30 May.', bal: 'I’m writing to request the return of my $1,850 security deposit for 14 Rue Pelletier. My tenancy ended on 30 May and the deposit is now due.', strong: 'I’m writing to formally request the return of my $1,850 security deposit for 14 Rue Pelletier. My tenancy ended on 30 May, and the deposit is now overdue.' },
            { soft: 'Under our lease and the applicable tenancy rules, deposits are returned — with any deductions itemized — within 21 days of move-out.', bal: 'Under our lease and the applicable tenancy rules, deposits are returned — with any deductions itemized — within 21 days of move-out.', strong: 'Under our lease and the applicable tenancy rules, deposits are returned — with any deductions itemized — within 21 days of move-out.', detail: true },
          ] },
          { s: [
            { soft: 'I’d appreciate the deposit being returned, or a written itemization of any deductions, within the next week.', bal: 'Please return the deposit, or provide a written itemization of any deductions, within seven days.', strong: 'Please return the full deposit, or provide a written, itemized statement of any deductions, within seven days of this message.' },
            { soft: 'I’ve kept dated move-out photos, our signed walkthrough checklist, and copies of all correspondence on file.', bal: 'I’ve kept dated move-out photos, our signed walkthrough checklist, and copies of all correspondence on file.', strong: 'I’ve kept dated move-out photos, our signed walkthrough checklist, and copies of all correspondence on file.', detail: true },
          ] },
        ],
        close: 'I’d like to resolve this directly and amicably, and I’m confident we can. Thank you.',
        add: [
          { label: 'After the opening — cite the clause', after: 0, text: 'This is consistent with Clause 9 of the lease we both signed on 1 June 2023.' },
          { label: 'Before your ask — set the channel', after: 1, text: 'A reply by email is perfect, so we both have a written record.' },
          { label: 'At the close — name a next step', after: 2, text: 'If I don’t hear back, I’ll follow up in writing to confirm next steps.' },
        ],
      },
      {
        name: 'The Formal Notice', level: 'strong', toneDefault: 80, risk: 72, eff: 90,
        subject: 'Formal notice — overdue security deposit, 14 Rue Pelletier',
        why: 'Signals that you know your rights and are ready to escalate, which gets fast action.',
        reaction: 'Most landlords comply quickly; a few may become defensive or go quiet.',
        body: [
          { s: [
            { soft: 'Please treat this as a formal notice regarding my overdue $1,850 security deposit for 14 Rue Pelletier.', bal: 'This is a formal notice regarding the overdue return of my $1,850 security deposit for 14 Rue Pelletier.', strong: 'This is a formal notice. My $1,850 security deposit for 14 Rue Pelletier is overdue and must be returned.' },
            { soft: 'The 21-day deadline from my 30 May move-out has now passed without payment or a written itemization.', bal: 'The 21-day deadline from my 30 May move-out has now passed without payment or a written itemization.', strong: 'The 21-day deadline from my 30 May move-out has now passed without payment or a written itemization.', detail: true },
          ] },
          { s: [
            { soft: 'I’m asking that the full amount be returned within five business days so we can avoid taking this further.', bal: 'I require the full amount returned within five business days.', strong: 'I require the full amount returned within five business days. If it is not, I will file with the tenancy tribunal and small-claims court and seek the penalties available to me.' },
            { soft: 'Late return can entitle a tenant to additional damages under local tenancy law.', bal: 'Late return can entitle a tenant to additional damages under local tenancy law.', strong: 'Late return can entitle a tenant to additional damages under local tenancy law.', detail: true },
          ] },
        ],
        close: 'I would much prefer to settle this without escalation, and the choice to do so is yours.',
        add: [
          { label: 'After the opening — state the amount owed', after: 0, text: 'The outstanding balance is $1,850, with no deductions itemized to date.' },
          { label: 'Before your ask — reference the law', after: 1, text: 'I’ve reviewed the relevant tenancy statute and my rights under it.' },
          { label: 'At the close — set the record', after: 2, text: 'Please consider this my written record of the request and its date.' },
        ],
      },
    ],
  },

  personal: {
    label: 'Personal relationships',
    kicker: 'Family · Partner · Friends',
    illo: 'care',
    blurb: 'Something close to home needs saying — a boundary, a need, or a hurt you’ve been carrying.',
    recipient: 'Your brother — Daniel',
    draftContext: 'To someone you love · about a money boundary',
    home: {
      blurb: 'A boundary, an unmet need, or a hurt close to home that you’ve been carrying.',
      examples: ['Money boundary', 'An unmet need', 'A hurt', 'Needing space', 'A recurring pattern'],
      bg: 'var(--cream-2)',
    },
    questions: [
      { id: 'who', type: 'chips', title: 'Who is this for?', options: ['A parent', 'A sibling', 'A close friend', 'My partner'], allowCustom: true, customPlaceholder: 'Tell us who this is for…' },
      { id: 'say', type: 'chips', title: 'What do you need to say?', options: ['I can’t keep lending money', 'I need more space', 'I can’t make it', 'Something they did hurt me'] },
      { id: 'understand', type: 'text', title: 'What do you most want them to understand?', helper: 'The heart of it, in your words.', placeholder: 'e.g. that this isn’t about loving them less' },
      { id: 'fear', type: 'chips', title: 'What are you most afraid of?', options: ['Hurting them', 'Their anger', 'Guilt — feeling selfish', 'Damaging the relationship'] },
      { id: 'directness', type: 'chips', title: 'How direct do you want to be?', options: ['Very gentle', 'Honest but warm', 'Clear and firm'] },
    ],
    strategies: [
      {
        name: 'Warmth First', level: 'soft', toneDefault: 22, risk: 15, eff: 42,
        subject: 'A note about something that’s been on my mind',
        why: 'Protects the relationship by making your care obvious before the boundary lands.',
        reaction: 'He’s likely to feel loved and heard, though the boundary may need repeating.',
        body: [
          { s: [
            { soft: 'You mean a lot to me, and I’ve been wanting to talk about something honestly — not to create distance, but because I care about us.', bal: 'You mean a lot to me, and there’s something I want to be honest with you about because I care about us.', strong: 'Because I care about us, I want to be honest about something that’s been weighing on me.' },
            { soft: 'I’ve gone back and forth about how to say it, which is probably a sign I should just say it kindly.', bal: 'I’ve gone back and forth about how to say it, which is probably a sign I should just say it kindly.', strong: 'I’ve gone back and forth about how to say it, which is probably a sign I should just say it kindly.', detail: true },
          ] },
          { s: [
            { soft: 'I’m not able to keep lending money right now, and it has nothing to do with how much I love you.', bal: 'I’m not able to keep lending money right now — and that doesn’t change how much I love you.', strong: 'I can’t keep lending money. That’s a line I need to hold, even though I love you.' },
            { soft: 'Money has started to sit between us in a way I don’t want, and I’d rather protect us than the favors.', bal: 'Money has started to sit between us in a way I don’t want, and I’d rather protect us than the favors.', strong: 'Money has started to sit between us in a way I don’t want, and I’d rather protect us than the favors.', detail: true },
          ] },
        ],
        close: 'I’m still here for you in every way that isn’t my wallet — and I mean that.',
        add: [
          { label: 'After the opening — recall a good memory', after: 0, text: 'I still think about how you showed up for me last winter; that’s the kind of brothers I want us to be.' },
          { label: 'Before the boundary — soften the turn', after: 1, text: 'This is hard to write, so please read it in my voice, not a cold one.' },
          { label: 'At the close — offer other help', after: 2, text: 'If it’d help, I’m glad to sit down and look at a budget together, no judgment.' },
        ],
      },
      {
        name: 'Honest & Kind', level: 'balanced', toneDefault: 50, risk: 38, eff: 75, recommended: true,
        subject: 'Something I need to be honest with you about',
        why: 'States the boundary plainly while keeping the warmth, so it’s heard and respected.',
        reaction: 'He may be disappointed at first, but clarity tends to earn quiet respect.',
        body: [
          { s: [
            { soft: 'I love you, and I’d rather be honest than keep saying “maybe.”', bal: 'I love you, and I’d rather be honest with you than keep giving you a soft “maybe.”', strong: 'I love you, so I’m going to be straight with you instead of giving another “maybe.”' },
            { soft: 'Being unclear hasn’t been fair to either of us, and it’s made things tense.', bal: 'Being unclear hasn’t been fair to either of us, and it’s made things tense.', strong: 'Being unclear hasn’t been fair to either of us, and it’s made things tense.', detail: true },
          ] },
          { s: [
            { soft: 'I’m not in a position to lend money anymore, and I need that to be a steady answer rather than a one-time no.', bal: 'I’m not able to lend money anymore — and I need that to be a consistent answer, not a one-off.', strong: 'I won’t be lending money going forward. I need that to be clear and consistent.' },
            { soft: 'This is about my own limits and stability, not about your worth to me.', bal: 'This is about my own limits and stability, not about your worth to me.', strong: 'This is about my own limits and stability, not about your worth to me.', detail: true },
          ] },
        ],
        close: 'What I can offer is my time, my help thinking things through, and a brother who isn’t keeping score.',
        add: [
          { label: 'After the opening — acknowledge his situation', after: 0, text: 'I know things have been genuinely hard for you lately, and I’m not pretending otherwise.' },
          { label: 'Before the boundary — own your part', after: 1, text: 'I should have been this clear a while ago instead of letting it build up.' },
          { label: 'At the close — affirm the bond', after: 2, text: 'None of this changes that you’re my brother and that I’m in your corner.' },
        ],
      },
      {
        name: 'Clear Line', level: 'strong', toneDefault: 80, risk: 64, eff: 88,
        subject: 'Where I stand on lending money',
        why: 'Leaves no room for negotiation, which stops a recurring pattern fastest.',
        reaction: 'He may push back or go quiet for a bit; the boundary will be unmistakable.',
        body: [
          { s: [
            { soft: 'I want to be clear with you about something so there’s no confusion.', bal: 'I need to be clear about something so there’s no confusion between us.', strong: 'I’m going to be very clear so there’s no confusion.' },
            { soft: 'Going in circles on this has been worse for us than a plain answer.', bal: 'Going in circles on this has been worse for us than a plain answer.', strong: 'Going in circles on this has been worse for us than a plain answer.', detail: true },
          ] },
          { s: [
            { soft: 'I’m not going to be lending money anymore, and I’d ask you not to ask again.', bal: 'I’m not lending money anymore, and I’m asking you not to bring it up again.', strong: 'I’m not lending money again. Please don’t ask me to.' },
            { soft: 'This is final, and it’s the healthiest thing for both of us.', bal: 'This is final, and it’s the healthiest thing for both of us.', strong: 'This is final, and it’s the healthiest thing for both of us.', detail: true },
          ] },
        ],
        close: 'I love you, and this boundary is part of that — not the opposite of it.',
        add: [
          { label: 'After the opening — set the frame', after: 0, text: 'I’m not angry, and this isn’t a punishment.' },
          { label: 'Before the line — explain briefly', after: 1, text: 'Lending has changed how we treat each other, and I won’t let it keep doing that.' },
          { label: 'At the close — leave the door open', after: 2, text: 'When you’re back on your feet, I’ll be just as glad to celebrate as I always am.' },
        ],
      },
    ],
  },

  circle: {
    label: 'A close-knit circle',
    kicker: 'Work · School · Teams',
    illo: 'people',
    blurb: 'Speaking up feels risky when there’s a social order to keep — but staying quiet costs you.',
    recipient: 'Your manager — Priya',
    draftContext: 'To your manager · about credit for your Q3 analytics',
    home: {
      blurb: 'Credit taken, unfair blame, being underpaid — when speaking up feels risky.',
      examples: ['Credit taken', 'Unfair blame', 'Underpaid', 'Overworked', 'Unfair grade', 'Asking for help'],
      bg: 'var(--fog-1)',
    },
    questions: [
      { id: 'what', type: 'chips', title: 'What happened?', options: ['A coworker took credit for my work', 'I was blamed unfairly', 'I feel underpaid', 'My contribution was overlooked'], allowCustom: true, customPlaceholder: 'Describe what happened…' },
      { id: 'to', type: 'chips', title: 'Who will receive this?', options: ['My manager', 'The coworker', 'Both / a group'] },
      { id: 'seek', type: 'text', title: 'What recognition or change are you seeking?', helper: 'Be concrete if you can.', placeholder: 'e.g. my authorship noted, and to present it next time' },
      { id: 'power', type: 'chips', title: 'What’s the power dynamic?', options: ['They’re senior to me', 'We’re peers', 'I’m senior'] },
      { id: 'fear', type: 'chips', title: 'Your biggest worry?', options: ['Looking petty', 'Political fallout', 'Not being believed', 'Damaging a relationship'] },
    ],
    strategies: [
      {
        name: 'Quiet Record', level: 'soft', toneDefault: 24, risk: 20, eff: 48,
        subject: 'Quick recap of the Q3 analytics work',
        why: 'Reframes the story factually without accusing anyone, so it never reads as petty.',
        reaction: 'Reads as a helpful update; your role becomes visible without a confrontation.',
        body: [
          { s: [
            { soft: 'I wanted to share a quick recap of the analytics behind last week’s presentation, in case it’s useful for planning.', bal: 'Here’s a quick recap of the analytics behind last week’s presentation, for the record.', strong: 'I want to set out clearly the analytics behind last week’s presentation.' },
            { soft: 'It came together over three weeks, mostly in the evenings, alongside my other deliverables.', bal: 'It came together over three weeks, mostly in the evenings, alongside my other deliverables.', strong: 'It came together over three weeks, mostly in the evenings, alongside my other deliverables.', detail: true },
          ] },
          { s: [
            { soft: 'I built the model and wrote the findings that the deck was based on, and I’m glad it landed well.', bal: 'I built the model and wrote the findings the deck was based on, and I’m happy it landed well with the team.', strong: 'To be precise: I built the model and wrote the findings the deck presented.' },
            { soft: 'Happy to walk anyone through the methodology or the next iteration whenever it’s helpful.', bal: 'Happy to walk anyone through the methodology or the next iteration whenever it’s helpful.', strong: 'Happy to walk anyone through the methodology or the next iteration whenever it’s helpful.', detail: true },
          ] },
        ],
        close: 'Mostly I wanted you to have the full picture as we plan the next phase.',
        add: [
          { label: 'After the opening — attach proof', after: 0, text: 'I’ve linked the working file and the commit history if you’d like to see the trail.' },
          { label: 'Before your point — stay generous', after: 1, text: 'It was genuinely a team effort to present, and I want to keep it collaborative.' },
          { label: 'At the close — propose a next step', after: 2, text: 'For the next phase, I’d love to be the one to present the analytics section.' },
        ],
      },
      {
        name: 'Direct & Fair', level: 'balanced', toneDefault: 50, risk: 44, eff: 78, recommended: true,
        subject: 'My role in the Q3 analytics — and a small ask',
        why: 'Names your contribution clearly and asks for a fair fix, without blame.',
        reaction: 'Most managers will want to make it right; you come across as confident, not bitter.',
        body: [
          { s: [
            { soft: 'I’d like to be open about something from last week’s presentation that didn’t sit quite right.', bal: 'I want to be straightforward about something from last week’s presentation.', strong: 'I need to be direct about something from last week’s presentation.' },
            { soft: 'I’m raising it now precisely because I’d rather address it than let it quietly bother me.', bal: 'I’m raising it now precisely because I’d rather address it than let it quietly bother me.', strong: 'I’m raising it now precisely because I’d rather address it than let it quietly bother me.', detail: true },
          ] },
          { s: [
            { soft: 'The analytics the deck was built on were mine, and I’d appreciate that being reflected when the work is credited.', bal: 'The analytics the deck was built on were my work, and I’d like that reflected when credit is given.', strong: 'The analytics the deck was built on were my work, and I’m asking for that to be credited accurately.' },
            { soft: 'I’m not looking to take anything away from anyone — only to have my part recognized.', bal: 'I’m not looking to take anything away from anyone — only to have my part recognized.', strong: 'I’m not looking to take anything away from anyone — only to have my part recognized.', detail: true },
          ] },
        ],
        close: 'Going forward, I’d like to present the analysis I produce. Thanks for hearing me out.',
        add: [
          { label: 'After the opening — give context', after: 0, text: 'You know I don’t usually flag this kind of thing, which is partly why I’m flagging it.' },
          { label: 'Before your ask — cite specifics', after: 1, text: 'The model, the dataset, and the written findings all came from my files.' },
          { label: 'At the close — make it forward-looking', after: 2, text: 'I’d welcome a quick chat about how we attribute shared work as a team.' },
        ],
      },
      {
        name: 'On the Record', level: 'strong', toneDefault: 80, risk: 68, eff: 90,
        subject: 'Correcting the attribution on the Q3 analytics',
        why: 'Makes the record unambiguous and requests acknowledgment — strongest for repeat issues.',
        reaction: 'It will be taken seriously; handled poorly by others, it can feel confrontational.',
        body: [
          { s: [
            { soft: 'I’d like to correct the record on who produced the Q3 analytics, since it wasn’t represented accurately.', bal: 'I want to correct the record on who produced the Q3 analytics.', strong: 'I’m writing to correct the record: the Q3 analytics were presented as someone else’s work, and they were mine.' },
            { soft: 'This is the second time my analysis has been presented without attribution, which is why I’m putting it in writing.', bal: 'This is the second time my analysis has been presented without attribution, which is why I’m putting it in writing.', strong: 'This is the second time my analysis has been presented without attribution, which is why I’m putting it in writing.', detail: true },
          ] },
          { s: [
            { soft: 'I’d appreciate an acknowledgment to the team that the analysis was mine.', bal: 'I’m asking for a clear acknowledgment to the team that the analysis was mine.', strong: 'I’m asking for a written acknowledgment to the team that the analysis was mine.' },
            { soft: 'I have the files, timestamps, and drafts that document authorship in full.', bal: 'I have the files, timestamps, and drafts that document authorship in full.', strong: 'I have the files, timestamps, and drafts that document authorship in full.', detail: true },
          ] },
        ],
        close: 'I value this team, and I’m raising this so I can keep doing my best work here.',
        add: [
          { label: 'After the opening — anchor in dates', after: 0, text: 'The relevant files are timestamped between 2 and 19 September.' },
          { label: 'Before your ask — keep it professional', after: 1, text: 'I’m not asking for blame to be assigned — only for the facts to be clear.' },
          { label: 'At the close — request a conversation', after: 2, text: 'Could we find 15 minutes this week to align on how this is communicated?' },
        ],
      },
    ],
  },
}

export const SCENARIO_IDS = Object.keys(DATA)
export const getScenario = (id) => DATA[id] || null
