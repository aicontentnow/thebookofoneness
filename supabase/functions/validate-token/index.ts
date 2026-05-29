// validate-token: accepts a token, atomically marks it used, returns valid/invalid.
// Called by the gate on page load when ?unlock=<token> is present.
// POST { token: string }

import { createClient } from 'jsr:@supabase/supabase-js@2'

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
  let token: string
  try {
    const body = await req.json()
    token = (body.token ?? '').trim()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (!token) {
    return json({ valid: false, reason: 'missing_token' })
  }

  // Supabase client (service role — bypasses RLS)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Atomic UPDATE: only succeeds if token exists, is unused, and is not expired.
  // Prevents TOCTOU race: two simultaneous calls cannot both get valid=true.
  const { data, error } = await supabase
    .from('collapse_tokens')
    .update({ used: true })
    .eq('token', token)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .select('id')
    .single()

  if (error || !data) {
    return json({ valid: false, reason: 'not_found_or_used' })
  }

  return json({ valid: true })
})
