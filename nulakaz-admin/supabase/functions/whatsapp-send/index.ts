// Send a WhatsApp Cloud API message and log it to whatsapp_messages.
//
// POST { phone: "23057xxxxxxx", body: "...", order_id?: "uuid" }
//
// Required secrets:
//   WHATSAPP_PHONE_NUMBER_ID
//   WHATSAPP_ACCESS_TOKEN

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
const TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const { phone, body, order_id } = await req.json()
  if (!phone || !body) return new Response('phone and body required', { status: 400 })

  if (!PHONE_ID || !TOKEN) {
    // No Cloud API configured — log as 'pending' so the admin can copy and send manually.
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({ direction: 'out', phone, body, order_id, status: 'pending' })
      .select()
      .single()
    if (error) return new Response(error.message, { status: 500 })
    return Response.json({ ok: true, queued: true, id: data?.id })
  }

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body },
      }),
    },
  )

  const json = await res.json().catch(() => ({}))
  const providerId = json?.messages?.[0]?.id

  await supabase.from('whatsapp_messages').insert({
    direction: 'out',
    phone,
    body,
    order_id,
    payload: json,
    provider_message_id: providerId,
    status: res.ok ? 'sent' : 'failed',
  })

  return Response.json({ ok: res.ok, providerId })
})
