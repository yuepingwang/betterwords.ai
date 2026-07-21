



# User Accounts & Storage — Approaches for BetterWords

*Written 2026-07-16. Context: the app is a Vite/React SPA hosted on AWS Amplify (Gen 2),
with a Lambda relay for OpenAI calls. Drafts currently live in `localStorage` only.*

## What accounts need to cover

Whatever approach we pick, the data model is the same:

- **User** — identity, sign-in method, plan tier (free/paid later).
- **Thread** (conversation) — one per recipient/situation. Holds the context the user
  gave (relationship, goal, tone), so follow-ups stay grounded.
- **Message** — a sent message inside a thread, in order.
- **Draft version** — saved revisions of a message before it was sent (so users can
  compare/restore).
- **Reply** — text the recipient sent back, pasted in by the user, attached to the
  thread so the AI can help respond.

Sensitivity note: these are *personal, often emotional* messages. Privacy is not a
nice-to-have here — per-user access rules enforced by the backend (not just the client)
is a hard requirement in every option below.

---

## Option 1 — Stay in the stack: Amplify Auth (Cognito) + Amplify Data (DynamoDB)

Add `amplify/auth/resource.ts` and `amplify/data/resource.ts` next to the existing
chat function. Amplify Gen 2 generates a typed client; auth rules like
`allow.owner()` make every thread/draft readable only by its creator, enforced
server-side.

- **Sign up / login:** Email + password out of the box; passwordless email-OTP and
  Google/Apple sign-in supported. Cognito's default UX is the weakest of the four —
  you'd style your own forms (fine, since BetterWords already has a strong design
  system).
- **Privacy:** Good. Data stays in your AWS account, per-owner authorization is
  declarative, and you control the region. No third party beyond AWS.
- **Mobile:** Works fine as responsive web/PWA; Amplify also has React Native SDKs
  if a native app ever happens.
- **Paid tiers later:** Not built in. Add Stripe: a webhook Lambda (same pattern as
  the existing chat function) writes `planTier` onto the user record; auth rules or
  the Lambda gate premium features.
- **Effort:** Low-medium — no new vendor, no new deploy pipeline, the `amplify.yml`
  build already runs `ampx pipeline-deploy`.
- **Main risk:** Cognito is the least pleasant of these to customize deeply
  (password policies, email templates, migration off it later is annoying).

**Best if:** you want one vendor, one bill, one deploy pipeline, and you're happy
building your own login UI.

---

## Option 2 — Supabase (Auth + Postgres with Row-Level Security)

Keep Amplify for hosting + the OpenAI relay; add Supabase for auth and data. The
browser talks to Supabase directly with its JS SDK; Postgres Row-Level Security
(RLS) policies enforce "users can only see their own rows" at the database level.

- **Sign up / login:** Very good. Magic links, email OTP, Google/Apple OAuth, all
  with a few lines of code. Email OTP (6-digit code) is the smoothest on mobile —
  no app-switching dance that magic links cause.
- **Privacy:** Strong. RLS is enforced in the database itself; you pick the hosting
  region; data is exportable as plain Postgres (no lock-in on the data). Optional
  column encryption if you want message bodies encrypted at rest beyond disk-level.
- **Mobile:** JS SDK is web-first and PWA-friendly; official React Native support
  exists for later.
- **Paid tiers later:** Well-trodden path — the Stripe + Supabase pattern
  (webhook → `subscriptions` table → RLS/feature gates) is one of the most
  documented setups on the internet.
- **Effort:** Medium — new vendor and dashboard, but the SDK does most of the work.
  Relational tables (threads → messages → draft_versions) map naturally to the
  product, and SQL makes future features (search, analytics) easy.
- **Main risk:** Two vendors (AWS + Supabase). Free tier pauses projects after a
  week of inactivity (fine in dev, needs the $25/mo tier for a real launch).

**Best if:** you want the best overall balance of login UX, privacy guarantees, and
a data model that grows with the product. **This is my recommendation.**

### Data model detail (if Option 2 wins)

**Where the database gets built.** Supabase hosts the Postgres instance — you
create a project at supabase.com and pick a region (Supabase runs on AWS
underneath, so choose the same region as the Amplify app to keep latency low).
Nothing changes in the AWS account: Amplify keeps hosting the frontend and the
OpenAI relay Lambda; the browser talks to Supabase directly via `supabase-js`.

**How the schema is defined.** Two workflows:

1. *Dashboard-first* — Supabase's Table Editor / SQL editor. Fast for
   experimenting, but the schema lives only in their cloud.
2. *Migrations-in-repo (recommended)* — numbered SQL files in
   `supabase/migrations/`, applied with the Supabase CLI (`supabase db push`).
   The CLI also runs a full local Postgres in Docker (`supabase start`), so the
   production schema is reproducible from git — same philosophy as the
   `amplify/` folder, just for the data layer.

**Capturing user-, thread-, and message-level context that evolves over time.**
Three mechanisms, used together:

*1. JSONB columns for the evolving stuff.* Postgres's `jsonb` type stores
arbitrary structured data while staying indexable and queryable. Each level gets
a context column:

```sql
create table users_profile (
  id uuid primary key references auth.users,
  plan_tier text default 'free',
  context jsonb default '{}'   -- writing style, preferences, learned traits
);

create table threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  recipient_label text,
  context jsonb default '{}'   -- relationship, goal, tone, history summary
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads not null,
  kind text,                   -- 'sent' | 'reply' | 'draft_version'
  body text,
  context jsonb default '{}'   -- per-message intent, emotional register, outcome
);
```

A new kind of context next month ("how did the recipient react to this tone?")
is just a new key written into the JSONB — no migration, no downtime, old rows
unaffected. Still queryable (`where context->>'tone' = 'apologetic'`) and hot
keys can get a GIN index.

*2. Real columns for stabilized fields.* Experiment in JSONB; once a field
proves important and permanent (like `plan_tier`), promote it to a proper column
via a small migration. Structured where it matters, flexible while learning.

*3. An append-only `context_entries` table for context that accumulates as the
user uses the app:*

```sql
create table context_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  thread_id uuid,              -- null = user-level observation
  kind text,                   -- 'tone_preference', 'relationship_fact', ...
  content jsonb,
  created_at timestamptz default now()
);
```

Each session appends what it learned ("user softens openings," "this recipient
responds badly to directness"); composing assembles the relevant entries into
the AI prompt. This gives history and provenance — you can see when and why the
app believes something, decay stale observations, or let users review and
delete individual entries (a nice privacy feature for this product).

RLS applies to all of it: `user_id = auth.uid()` policies on every table, so
context — however its shape evolves — is only ever readable by its owner.

---

## Option 3 — Firebase (Auth + Firestore)

Google's platform: drop in Firebase Auth + Firestore, keep Amplify hosting or move
to Firebase Hosting.

- **Sign up / login:** The easiest signup of any option — Google One Tap means
  many users are signed in with literally one click. Apple/phone/email all
  supported, with polished prebuilt UI (FirebaseUI).
- **Privacy:** Adequate but the weakest story here. Security Rules enforce per-user
  access, but data lives with Google, rules are easy to get subtly wrong, and for a
  product about private emotional messages, "your messages are stored with Google"
  is a perception issue some users will care about. Data export is clunkier than SQL.
- **Mobile:** Excellent — best-in-class offline persistence and realtime sync;
  drafts survive flaky connections without extra work.
- **Paid tiers later:** Via the Stripe extension for Firebase (semi-official,
  well-maintained). Works, slightly more glue than Supabase's pattern.
- **Effort:** Low — probably the fastest path from zero to "login works and drafts
  sync."
- **Main risk:** NoSQL modeling. Threads/versions/replies are relational at heart;
  Firestore forces denormalization decisions early that are painful to unwind, and
  migrating off Firestore later is the hardest exit of the four.

**Best if:** speed-to-launch and mobile offline sync matter more than data-model
flexibility and privacy optics.

---

## Option 4 — Clerk for auth + a proper database (Neon Postgres or Convex)

Split the problem: Clerk handles identity with the best prebuilt sign-in components
in the industry, and a separate database holds threads/messages, accessed through
your own thin API (could be more Lambdas in the existing Amplify backend).

- **Sign up / login:** Best-in-class. Drop-in `<SignIn />` component with passkeys,
  social login, magic links, MFA — beautiful on mobile, zero UI work.
- **Privacy:** Split model — Clerk only holds identity (email, name); the message
  content lives in your own Postgres, which is a genuinely nice separation for a
  sensitive product. But you must write and secure the API layer yourself
  (verify Clerk's JWT in each Lambda, scope every query by user id) — the
  per-user isolation is only as good as your code, unlike RLS/owner-rules which
  are declarative.
- **Mobile:** Clerk components are responsive and there's React Native support.
- **Paid tiers later:** The standout feature — **Clerk Billing** ships subscription
  tiers, a pricing table component, and feature gating natively (Stripe under the
  hood). Least work of any option when the paid tier arrives.
- **Effort:** Medium-high — three moving parts (Clerk + DB + your API), most
  plumbing to write and maintain.
- **Main risk:** Cost stacks up (Clerk is free to 10k MAU, then per-user pricing on
  top of DB hosting), and you own the security-critical glue code.

**Best if:** login polish and effortless future billing are the top priorities and
you don't mind writing the API layer.

---

## Comparison at a glance

| Criteria | 1. Amplify/Cognito | 2. Supabase | 3. Firebase | 4. Clerk + DB |
|---|---|---|---|---|
| Signup/login ease (user) | OK | Very good | Best (One Tap) | Best (prebuilt UI) |
| Login build effort (you) | Most UI work | Low | Low | Lowest |
| Privacy / access control | Good (owner rules) | Best (RLS + exportable SQL) | Adequate | Good, but hand-rolled |
| Mobile / PWA | Good | Good | Best (offline sync) | Good |
| Paid tiers later | DIY Stripe | Documented Stripe pattern | Stripe extension | Built-in (Clerk Billing) |
| Vendors to manage | 1 (AWS) | 2 | 2 | 3 |
| Data-model fit (threads/versions) | OK (NoSQL) | Best (SQL) | Weakest (NoSQL) | Best (SQL) |
| Lock-in / exit cost | Medium | Low | High | Low (data), medium (auth) |

## Recommendation

**Option 2 (Supabase)**, with Option 1 as the runner-up if keeping everything in
AWS matters to you. Supabase wins on the criteria that matter most for BetterWords:
database-enforced privacy for sensitive content, smooth email-OTP login on mobile,
a relational model that matches threads → messages → draft versions naturally, and
a proven Stripe path for tiers later. The existing Amplify hosting and OpenAI relay
don't change at all.

## First implementation steps (whichever option wins)

1. Add auth and gate nothing initially — let users try the composer anonymously,
   prompt to sign in only when they hit **Save draft** (lowest-friction funnel).
2. On first sign-in, migrate any existing `localStorage` drafts up to the account
   so current users lose nothing.
3. Ship the thread model from day one (even if the UI only shows one message), so
   follow-ups and reply-handling don't need a schema migration later.
4. Add a `plan_tier` field on the user record now, defaulted to `free` — pricing
   logic later becomes a read, not a migration.
