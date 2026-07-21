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
  // Nudge the thread's updated_at so "recent threads" ordering holds.
  await sb.from('threads').update({ subject: subject ?? null }).eq('id', tid)
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
