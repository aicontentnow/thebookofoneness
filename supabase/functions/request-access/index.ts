// request-access: accepts an email, inserts a 24-hour magic-link token,
// and sends it to the user via Resend.
// Called by the gate form: POST { email: string }

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { crypto } from 'jsr:@std/crypto'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://thebookofoneness.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  // Parse body
  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid_email' }, 400)
  }

  // Supabase client (service role — bypasses RLS)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Generate a cryptographically random token
  const rawToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await supabase
    .from('collapse_tokens')
    .insert({ token: rawToken, email, expires_at: expiresAt })

  if (insertError) {
    console.error('insert error:', insertError)
    return json({ error: 'server_error' }, 500)
  }

  // Send magic link via Resend
  const unlockUrl = `https://thebookofoneness.com/?unlock=${rawToken}`
  const resendKey = Deno.env.get('RESEND_API_KEY')!

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TODO: update to access@thebookofoneness.com once domain is verified in Resend
      from: 'THE BOOK OF ONENESS <onboarding@resend.dev>',
      to: [email],
      subject: 'Your access to the Collapses',
      html: `
        <p>You requested access to Parts XIII through XX: the fifty Collapses.</p>
        <p>
          <a href="${unlockUrl}" style="
            display:inline-block;
            background:#000;
            color:#fff;
            padding:12px 24px;
            text-decoration:none;
            font-family:monospace;
            letter-spacing:0.05em;
          ">UNLOCK ACCESS</a>
        </p>
        <p style="color:#666;font-size:12px;">
          This link expires in 24 hours. If you did not request this, ignore this email.
        </p>
      `,
    }),
  })

  if (!resendRes.ok) {
    const resendErr = await resendRes.text()
    console.error('resend error:', resendErr)
    return json({ error: 'email_failed' }, 500)
  }

  return json({ sent: true })
})
