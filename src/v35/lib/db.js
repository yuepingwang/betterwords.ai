import { getSupabase } from './supabase'

// ------------------------------------------------------------------
// db.js — v3's data layer over the Supabase schema (see
// supabase/migrations/). One thread per scenario run; draft versions
// and the sent letter are messages inside it. All writes are scoped to
// the signed-in user; RLS enforces the same server-side.
//
// Callers pass the store's threadId (null on first save) and dispatch
// SET_THREAD with the id these functions return, so later saves and
// the send land in the same thread.
// ------------------------------------------------------------------

async function currentUserId() {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return data.session?.user?.id ?? null
}

// Find-or-create the thread for the current scenario run.
async function ensureThread({ threadId, scenario, subject, answers }) {
  const sb = getSupabase()
  const userId = await currentUserId()
  if (!sb || !userId) throw new Error('not signed in')
  if (threadId) return threadId

  const { data, error } = await sb
    .from('threads')
    .insert({
      user_id: userId,
      scenario_id: scenario?.id ?? null,
      recipient_label: scenario?.recipient ?? null,
      subject: subject ?? null,
      context: { answers: answers || {} },
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function addMessage({ threadId, scenario, subject, answers, kind, body, context }) {
  const sb = getSupabase()
  const userId = await currentUserId()
  if (!sb || !userId) throw new Error('not signed in')

  const tid = await ensureThread({ threadId, scenario, subject, answers })
  const { error } = await sb.from('messages').insert({
    thread_id: tid,
    user_id: userId,
    kind,
    body,
    context: context || {},
  })
  if (error) throw error
  // Nudge the thread's updated_at so "recent threads" ordering holds —
  // without clobbering the subject when the caller didn't pass one
  // (replies and follow-ups keep the original Re: line).
  await sb
    .from('threads')
    .update(subject != null ? { subject } : { updated_at: new Date().toISOString() })
    .eq('id', tid)
  return tid
}

// A saved revision from the composer. Returns the thread id.
export function saveDraftVersion({ threadId, scenario, state, subject, body }) {
  return addMessage({
    threadId,
    scenario,
    subject,
    answers: state.answers,
    kind: 'draft_version',
    body,
    context: {
      tone: state.tone,
      verbosity: state.verbosity,
      strategyIdx: state.selectedIdx,
    },
  })
}

// The letter the user copied out to send. Returns the thread id.
export function recordSent({ threadId, scenario, state, subject, body }) {
  return addMessage({
    threadId,
    scenario,
    subject,
    answers: state.answers,
    kind: 'sent',
    body,
    context: {
      tone: state.tone,
      verbosity: state.verbosity,
      strategyIdx: state.selectedIdx,
    },
  })
}

// ------------------------------------------------------------------
// Conversations (v3.5) — reading threads back out, and recording the
// other side's replies so the flow can branch on "have they replied?".
// ------------------------------------------------------------------

export async function isSignedIn() {
  return Boolean(await currentUserId())
}

// Every thread the user owns, newest activity first, with the message
// rollups the conversations screen shows on each card. Counts are
// aggregated client-side — per-user data stays small.
export async function listThreads() {
  const sb = getSupabase()
  const userId = await currentUserId()
  if (!sb || !userId) throw new Error('not signed in')
  const { data, error } = await sb
    .from('threads')
    .select('id, scenario_id, recipient_label, subject, context, created_at, updated_at, messages(kind, body, created_at)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data || []).map((t) => summarizeThread(t))
}

// One thread with its full message timeline, oldest first.
export async function fetchThread(threadId) {
  const sb = getSupabase()
  const userId = await currentUserId()
  if (!sb || !userId) throw new Error('not signed in')
  const { data, error } = await sb
    .from('threads')
    .select('id, scenario_id, recipient_label, subject, context, created_at, updated_at, messages(id, kind, body, context, created_at)')
    .eq('id', threadId)
    .single()
  if (error) throw error
  const messages = [...(data.messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  return { ...summarizeThread(data), messages }
}

// The other side's reply, pasted in by the user. Returns the thread id.
export function recordReply({ threadId, body }) {
  return addMessage({ threadId, kind: 'reply', body, context: { pasted: true } })
}

// A follow-up nudge the user drafted (kept as its own kind so the timeline
// can label it). Returns the thread id.
export function recordFollowup({ threadId, scenario, state, subject, body }) {
  return addMessage({
    threadId,
    scenario,
    subject,
    answers: state?.answers,
    kind: 'followup',
    body,
    context: { tone: state?.tone, verbosity: state?.verbosity },
  })
}

// Card-level shape shared by listThreads/fetchThread: counts + the state the
// conversation flow branches on. `awaiting` is what "have they replied?"
// means concretely: the last outbound (sent/followup) has no reply after it.
export function summarizeThread(t) {
  const msgs = [...(t.messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const count = (k) => msgs.filter((m) => m.kind === k).length
  const outbound = msgs.filter((m) => m.kind === 'sent' || m.kind === 'followup')
  const lastOutbound = outbound[outbound.length - 1]
  const lastReply = msgs.filter((m) => m.kind === 'reply').pop()
  const lastEvent = msgs[msgs.length - 1]
  const awaiting = Boolean(lastOutbound) && (!lastReply || new Date(lastReply.created_at) < new Date(lastOutbound.created_at))
  return {
    id: t.id,
    scenarioId: t.scenario_id,
    recipient: t.recipient_label,
    subject: t.subject,
    context: t.context || {},
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    counts: { drafts: count('draft_version'), sent: count('sent') + count('followup'), replies: count('reply') },
    lastActivityAt: lastEvent?.created_at || t.updated_at || t.created_at,
    hasSent: outbound.length > 0,
    awaiting, // true → "still waiting" moves; false + replies>0 → "help me respond"
  }
}
