// WhatsApp Cloud API webhook receiver
//
// Two responsibilities:
//   GET  -> verification handshake (Meta sends hub.challenge)
//   POST -> incoming message + status callbacks, persisted to whatsapp_messages
//
// Configure in supabase secrets:
//   WHATSAPP_VERIFY_TOKEN  - matches the token set in Meta dashboard
//   SUPABASE_URL           - injected by platform
//   SUPABASE_SERVICE_ROLE_KEY - injected by platform

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? 'prime-mauritius-verify'

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('forbidden', { status: 403 })
  }

  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return new Response('bad request', { status: 400 })

  // Meta payload shape: entry[].changes[].value.{messages|statuses}
  const changes = body?.entry?.flatMap((e: any) => e.changes ?? []) ?? []
  const rows: Array<Record<string, unknown>> = []

  for (const change of changes) {
    const value = change?.value ?? {}

    for (const msg of value.messages ?? []) {
      rows.push({
        direction: 'in',
        phone: msg.from,
        body: msg.text?.body ?? null,
        payload: msg,
        provider_message_id: msg.id,
        status: 'delivered',
      })
    }

    for (const status of value.statuses ?? []) {
      // Update outbound status by provider_message_id
      await supabase
        .from('whatsapp_messages')
        .update({ status: status.status })
        .eq('provider_message_id', status.id)
    }
  }

  if (rows.length) {
    const { error } = await supabase.from('whatsapp_messages').insert(rows)
    if (error) console.error('insert failed', error)
  }

  return new Response('ok', { status: 200 })
})
