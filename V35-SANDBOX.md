# v3.5 Sandbox — Conversations, Replies & Follow-ups

*An isolated fork of v3 where the account-backed conversation flows are built
first. Nothing here can affect v1, v2, or the live v3: v3.5 has its own copy
of every screen, store, advisor, and design-system bundle, all scoped under
`.bw-v35`.*

## Reaching it

- **v3.5 is the default** — `/` and `/?v=3.5` (also `/?v35` or `/#v35`) both
  load it. v3 moved to `/?v=3`, v2 to `/?v=2`, v1 to `/?v=1`.
- Signed out (or without Supabase keys) every screen runs on **sample
  conversations**, so the whole flow is browsable with zero setup.
- Signed in, everything reads/writes the real Supabase threads & messages
  (same schema as v3 — no migration needed; `reply` and `followup` message
  kinds were already in the initial schema).

## The new flows

**Conversations** (`?screen=conversations`, or the account menu → My
conversations) — every thread, newest activity first, with a status chip per
card: *They replied* / *Waiting on them* / *Still in drafts*, plus
sent/draft/reply counts and the writer's goal pulled from the clarify answers.

**Conversation** (`?screen=conversation&thread=demo-replied|demo-waiting|demo-drafting`)
— one thread's timeline (your sent messages, their replies, draft-version
rollups) with the thread's Goal/Concern/So-far context chips. What sits under
**Today** branches on reply state:

| Thread state | Next-step UI |
| --- | --- |
| They replied since your last message | **Help me draft a response ✦** → interpretation flow |
| You sent, no reply yet | **Have they replied?** (paste their message → recorded as a `reply` → respond flow) *and* **Are you still waiting?** → follow-up flow |
| Never sent | **Continue drafting** → composer, same thread |

**Reply flow** (`?screen=replyflow[&mode=followup][&step=moves]`) — the
How_to_reply.pdf workflow:
1. *Here's what we're hearing* — classification chips (Dialogue/Resistance/
   Ambiguity…), their-tone warmth meter, "did it meet your need?", and three
   "what this likely means" reads.
2. *What you could do next* — three moves, exactly one ✦ Recommended
   (confirm / hold firm / wait for replies; nudge / deadline / wait for
   follow-ups).
3. **Draft this →** pre-drafts the message and opens the full composer.
   Save-as-draft and Review & Send continue the SAME thread — the sent
   follow-up is recorded as kind `followup`, and the post-send celebration
   links back to the conversation.

AI seam: `interpretReply` / `draftNextMessage` in `src/v35/lib/advisor.js` use
the OpenAI relay when a key is configured and fall back to keyword heuristics
otherwise (same philosophy as the rest of the advisor).

## Guide → implementation notes

Built from the wireframes in `betterwords resources/3rd iteration/for claude
code - first round screenshots/` (adapted to the Daybreak design system, not
pixel-copied). The provided critter illustrations are in
`public/ds-v35/assets/characters/`: the **chameleon** fronts the
interpretation screen and the composer's Tone slider; the **dog** sits on the
Length slider.

Not built this round (wireframes exist for a later pass): the Account &
profile page, Settings/Writing-voice page, the composer's bottom
adjust-tone/length pill bar, grid/list toggle + category filter on
Conversations.

## Files

- `src/v35/**` — the fork (screens/Conversations.jsx, Conversation.jsx,
  ReplyFlow.jsx are new; store/db/advisor/auth/Send/Composer extended)
- `src/v35/lib/demo.js` — the signed-out sample threads
- `public/ds-v35/` — v3.5's own DS bundle + assets
- `src/main.jsx` — `wantsV35()` routing
