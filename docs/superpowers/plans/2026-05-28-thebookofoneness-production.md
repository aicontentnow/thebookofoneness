# thebookofoneness.com — Production Build Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the hi-fi design handoff to production: wire the Collapse Gate backend, populate glossary definitions, and generate all remaining term and Part pages.

**Architecture:** Static HTML site (no build system yet) deployed via GitHub Pages from `mirror/oneness-website/public/`. Supabase Edge Functions handle the magic-link gate. Eleventy is used as a one-time generator for the 62 term pages and 19 Part pages, then output is committed as static HTML (Eleventy is a build tool here, not a runtime dependency). The deployed site stays pure static HTML.

**Tech Stack:** Vanilla HTML/CSS/JS, Supabase Edge Functions (Deno), Resend email API, Eleventy 3.x (Node.js generator, not a runtime dep), pdftotext (already installed via poppler)

**Supabase MCP note:** Connect the Supabase MCP to the **stillpoint ops org** (project `pobddtmnzimcdiaujyyf`) before Tasks 1a–1b. The default MCP connection is the Bodhi360 org — this is a different project.

---

## Non-negotiable execution constraints

These apply to every task in this plan and were stated explicitly by Bodhi on 2026-05-28:

1. **SEO head preservation.** The live `public/index.html` has a production SEO head. Before any write to `index.html`, read the live file and carry these elements verbatim into the new head: `<meta name="keywords">`, `og:site_name`, `og:image` (book cover PNG, not `og-night.jpg`), `og:image:width/height`, all Twitter meta tags (card/image/title/site/description), both JSON-LD blocks (Book + WebSite schema), favicon. Details and merge order in Task 1a Step 2.

2. **No CSS extraction.** The design is ~4,097 lines of intentionally inline HTML/CSS. Do not extract, refactor, or restructure. Classes and tokens are load-bearing. Copy file structure as-is.

3. **Supabase MCP must be on stillpoint ops org** (`pobddtmnzimcdiaujyyf`) before writing any backend code. The default connection is the Bodhi360 org. Confirm the switch explicitly.

4. **No deploy until Bodhi approves.** Build and confirm locally first. QA before any `git push`.

5. **Do not touch:** `get-the-book.html`, `robots.txt`, or anything in `img/`.

6. **Priority order:** Gate backend → glossary content → term pages → part pages → URL rewrites. Do not skip ahead.

---

## Parallel-execution note

Tasks 1 (gate backend) and Tasks 2–4 (content + page generation) are structurally independent. They can be dispatched to two agents running simultaneously. Task 1 requires Supabase access. Tasks 2–4 require only the local filesystem.

---

## File map

```
mirror/oneness-website/
  public/                        ← GitHub Pages deploy root
    index.html                   ← MODIFY (wire gate TODOs)
    glossary-data.js             ← MODIFY (add definition field, real snippets)
    glossary-search.css          ← copy from design handoff (unchanged)
    glossary-search.js           ← copy from design handoff (unchanged)
    glossary/
      search.html                ← copy from design handoff (unchanged)
      the-mind.html              ← copy from design handoff (reference, unchanged)
      oneness.html               ← copy from design handoff (reference, unchanged)
      [60 more .html files]      ← GENERATE via Eleventy
    parts/
      part-01.html               ← copy from design handoff (unchanged)
      part-02.html … part-20.html ← GENERATE via Eleventy
    assets/                      ← copy from design handoff (unchanged)
    fractures/                   ← copy from design handoff (unchanged)
  supabase/
    functions/
      request-access/
        index.ts                 ← CREATE
      validate-token/
        index.ts                 ← CREATE
  .eleventy.js                   ← CREATE (generator config, build-time only)
  _data/
    glossary.js                  ← CREATE (Node.js version of glossary-data.js for Eleventy)
    parts.js                     ← CREATE (20 parts metadata array)
  _templates/
    term.njk                     ← CREATE (Eleventy template for term pages)
    part.njk                     ← CREATE (Eleventy template for Part pages)
```

**Source design handoff:** `/Users/bodhivalentine/Downloads/_MIRR_R_Design_System/sub-brands/book/website-redesign/`

**Glossary PDF (canonical):** `/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/DO NOT REMOVE/***FINAL DRAFT FOR PRINT/0. AI KNOWLEDGEBASE 2026/THE FINAL CORE TERMS GLOSSARY - THE BOOK OF ONENESS.pdf`

**Supabase project:** `pobddtmnzimcdiaujyyf` — MIRROR publishing ops (stillpoint ops org)

---

## Task 1a: Copy design files into the production tree

**Files:**
- Modify: `mirror/oneness-website/public/` (copy new design assets in)

- [ ] **Step 1: Sync new design files into public/**

```bash
DESIGN=/Users/bodhivalentine/Downloads/_MIRR_R_Design_System/sub-brands/book/website-redesign
DEST="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website/public"

# Copy top-level assets (overwrite index.html with new design version)
cp "$DESIGN/glossary-search.css" "$DEST/"
cp "$DESIGN/glossary-search.js" "$DEST/"
# NOTE: do NOT copy glossary-data.js yet — Task 2 modifies it first

# Copy glossary pages (search + two reference term pages)
mkdir -p "$DEST/glossary"
cp "$DESIGN/glossary/search.html" "$DEST/glossary/"
cp "$DESIGN/glossary/the-mind.html" "$DEST/glossary/"
cp "$DESIGN/glossary/oneness.html" "$DEST/glossary/"

# Copy parts template
mkdir -p "$DEST/parts"
cp "$DESIGN/parts/part-01.html" "$DEST/parts/"

# Copy new assets
cp -r "$DESIGN/assets/" "$DEST/assets/"

# Copy fractures
mkdir -p "$DEST/fractures"
cp "$DESIGN/fractures/fracture-01-oneness.html" "$DEST/fractures/" 2>/dev/null || true
```

Run: `ls "$DEST/glossary/" && ls "$DEST/parts/"`
Expected: `search.html  the-mind.html  oneness.html` and `part-01.html`

- [ ] **Step 2: Merge index.html — carry forward the live SEO head**

**Do NOT do a blind `cp` of the design's `index.html` over the live file.** The design file has a thinner `<head>` that is missing critical SEO elements. The merge procedure is:

**2a. Confirm the live file's SEO block is intact.**

Read the first 90 lines of the live file:
```bash
head -90 "$DEST/index.html"
```

The live head must contain:
- `<meta name="keywords" content="THE BOOK OF ONENESS, MIRROR, ...">` (line ~9)
- `<meta property="og:site_name" content="[MIRRØR]">`
- `<meta property="og:image" content="https://thebookofoneness.com/img/THE%20BOOK%20OF%20ONENESS%20Book%20Covers%20for%20ALL%20EDITIONS.png">`
- `<meta property="og:image:width" content="1920">` and `og:image:height` `1080`
- `<meta name="twitter:image">`, `twitter:title`, `twitter:site`, `twitter:description`
- Two `<script type="application/ld+json">` blocks (Book schema + WebSite schema)
- `<link rel="icon" href="/img/favicon.jpg" type="image/jpeg">`

If any of these are missing from the live file, STOP and flag to Bodhi.

**2b. Write the merged `index.html`.**

The merged file is constructed as follows:
1. Start with the live file's entire `<head>` block (lines 3–90), which contains all the SEO.
2. Remove the old font link: `<link href="https://fonts.googleapis.com/css2?family=Space+Mono...>`
3. Add the new font links (from the design file, lines 17–19):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
   ```
4. Remove `<link rel="stylesheet" href="/css/site.css">` (inline styles replace it).
5. Add `<link rel="stylesheet" href="glossary-search.css">` after the new font links.
6. Copy the entire inline `<style>` block from the design file (line 22 through `</style>`) and append it before `</head>`.
7. Use the `<body>` content from the design file verbatim.

**Title**: the live file uses `--` (correct per no-em-dash rule). The design file uses `—` (em dash — wrong). Keep the live file's title:
`<title>THE BOOK OF ONENESS -- [MIRRØR] | Identity. Separation. The Mind.</title>`

The design file description has a copy-paste artefact (line 7 duplicates `t spirituality. A mirror.">`). Use the live file's clean description.

**2c. Verify the merge.**

```bash
grep -c '"@type": "Book"' "$DEST/index.html"
# Expected: 1 (JSON-LD Book schema present)

grep -c 'og:site_name' "$DEST/index.html"
# Expected: 1

grep -c 'collapse-gate' "$DEST/index.html"
# Expected: 1 or more (new design's gate section present)

grep -c 'Space Mono' "$DEST/index.html"
# Expected: 0 (old font removed)

grep -c 'Abril Fatface' "$DEST/index.html"
# Expected: 1 (new font present)
```

If any check fails, fix the merge before proceeding to Step 3.

- [ ] **Step 3: Commit the design sync**

Confirm `get-the-book.html`, `robots.txt`, and the `img/` directory are untouched:
```bash
git -C "$DEST" diff --name-only HEAD | grep -E "get-the-book\.html|robots\.txt|^img/"
# Expected: no output (those files should show no changes)
```

Then commit:
```bash
git -C "$DEST" add -A
git -C "$DEST" commit -m "chore: sync new hi-fi design (gate + glossary + parts nav)"
```

---

## Task 1b: Supabase — create collapse_tokens table

**Files:**
- Create: `mirror/oneness-website/supabase/migrations/001_collapse_tokens.sql`

- [ ] **Step 1: Write the migration SQL**

Create `mirror/oneness-website/supabase/migrations/001_collapse_tokens.sql`:

```sql
create table if not exists public.collapse_tokens (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token       uuid not null unique default gen_random_uuid(),
  used        boolean not null default false,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

create index on public.collapse_tokens (token);
create index on public.collapse_tokens (email);

-- Row-level security: Edge Functions use the service-role key so
-- they bypass RLS, but we lock down direct client access.
alter table public.collapse_tokens enable row level security;
-- No SELECT/INSERT policies — only service-role key can touch this table.
```

- [ ] **Step 2: Run the migration via Supabase MCP**

Connect MCP to stillpoint ops org, then execute the SQL above against project `pobddtmnzimcdiaujyyf`.

- [ ] **Step 3: Verify table exists**

Run: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'collapse_tokens';`
Expected: id (uuid), email (text), token (uuid), used (boolean), created_at (timestamptz), expires_at (timestamptz)

---

## Task 1c: Edge Function — request-access

**Files:**
- Create: `mirror/oneness-website/supabase/functions/request-access/index.ts`

- [ ] **Step 1: Write the Edge Function**

```typescript
// supabase/functions/request-access/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': 'https://thebookofoneness.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate token row (token uuid is generated by the DB default)
    const { data, error } = await supabase
      .from('collapse_tokens')
      .insert({ email })
      .select('token')
      .single();

    if (error) throw error;

    const magicLink = `https://thebookofoneness.com/?unlock=${data.token}`;

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MIRROR Publishing <noreply@thebookofoneness.com>',
        to: [email],
        subject: 'Your access to the Collapses',
        html: `
          <p style="font-family:monospace;background:#0a0a0a;color:#f0f0f0;padding:24px;max-width:480px">
            // ACCESS LINK<br><br>
            One-time access to <strong>THE COLLAPSES</strong> — Parts XIII–XX of THE BOOK OF ONENESS.<br><br>
            <a href="${magicLink}" style="color:#FF2D6F">UNLOCK THE COLLAPSES →</a><br><br>
            This link expires in 24 hours. It works once only.
          </p>`,
      }),
    });

    if (!resendRes.ok) {
      const body = await resendRes.text();
      throw new Error(`Resend error: ${body}`);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('request-access error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
```

- [ ] **Step 2: Note required secrets**

Two secrets need to be set in Supabase before deployment:
- `RESEND_API_KEY` — Bodhi must provide this from Resend dashboard
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — auto-injected by Supabase, no action needed

**STOP: Ask Bodhi for the Resend API key before proceeding to Step 3.**

---

## Task 1d: Edge Function — validate-token

**Files:**
- Create: `mirror/oneness-website/supabase/functions/validate-token/index.ts`

- [ ] **Step 1: Write the Edge Function**

```typescript
// supabase/functions/validate-token/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': 'https://thebookofoneness.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { token } = await req.json();
    if (!token) return new Response(JSON.stringify({ valid: false }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Atomic UPDATE: only matches if token exists, is unused, and not expired.
    // Single operation prevents TOCTOU race where two simultaneous requests both
    // pass the used=false check before either write flips the flag.
    const { data, error } = await supabase
      .from('collapse_tokens')
      .update({ used: true })
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .select('id')
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, reason: 'not_found_or_used' }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ valid: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('validate-token error:', err);
    return new Response(JSON.stringify({ valid: false, reason: 'error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
```

---

## Task 1e: Wire the gate TODOs in index.html

**Files:**
- Modify: `mirror/oneness-website/public/index.html` (lines ~3613 and ~3625)

The two TODO blocks are:
1. Line ~3613: URL token validation (replace optimistic unlock with real fetch)
2. Line ~3625: Email submit (replace stub with real fetch)

The Supabase project URL is `https://pobddtmnzimcdiaujyyf.supabase.co`.

- [ ] **Step 1: Replace the token validation TODO**

Find and replace this block in `public/index.html`:

OLD (lines ~3610–3618):
```js
  const params = new URLSearchParams(window.location.search);
  const token = params.get('unlock');
  if (token) {
    // TODO(claude-code): POST { token } to /functions/v1/validate-token
    // For now the front-end optimistically unlocks if a token is present.
    // Production MUST replace this with the real round-trip.
    setState('unlocked');
    return;
  }
```

NEW:
```js
  // Behavior 1: persisted unlock from previous visit.
  if (localStorage.getItem('booe_collapse_unlocked') === 'true') {
    setState('unlocked');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get('unlock');
  if (token) {
    fetch('https://pobddtmnzimcdiaujyyf.supabase.co/functions/v1/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          // Persist so the gate stays open across page navigations.
          try { localStorage.setItem('booe_collapse_unlocked', 'true'); } catch (_) {}
        }
        setState(d.valid ? 'unlocked' : 'error');
      })
      .catch(() => { setState('error'); });
    return;
  }
```

Note: the `localStorage` check at the top covers the case where the user already validated in a previous page load. Without it, every navigation back to the page re-checks the URL (which no longer has `?unlock=`) and shows the locked state.

- [ ] **Step 2: Replace the email submit TODO**

Find and replace this block in `public/index.html`:

OLD (lines ~3623–3630):
```js
  function submitEmail(email) {
    if (!isEmail(email)) return false;
    // TODO(claude-code): POST { email } to /functions/v1/request-access
    // which generates a single-use token, stores it in Supabase, and
    // sends the email via Resend. We optimistically move to "pending".
    try { sessionStorage.setItem('booe_pending_email', email); } catch (_) {}
    setState('pending');
    return true;
  }
```

NEW:
```js
  function submitEmail(email) {
    if (!isEmail(email)) return false;
    try { sessionStorage.setItem('booe_pending_email', email); } catch (_) {}
    setState('pending');
    fetch('https://pobddtmnzimcdiaujyyf.supabase.co/functions/v1/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).catch(err => console.error('request-access failed:', err));
    return true;
  }
```

Note: we move to `pending` immediately (optimistic) and fire the fetch without awaiting it. This keeps the UX snappy. Network failures are silent to the user (the email just may not arrive); the "Resend link" button covers the retry case.

- [ ] **Step 3: Verify no TODO(claude-code) markers remain**

Run: `grep -c "TODO(claude-code)" public/index.html`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add public/index.html
git commit -m "feat: wire collapse gate to Supabase Edge Functions"
```

---

## Task 1f: Deploy Edge Functions

Requires Supabase CLI (`npx supabase`). Uses `pobddtmnzimcdiaujyyf`.

- [ ] **Step 1: Check if Supabase CLI is available and authenticated**

```bash
npx supabase --version
```
If not installed, it auto-installs via npx.

Check login status:
```bash
npx supabase projects list 2>&1 | head -5
```
Expected: a list of projects. If you see "not logged in" or an auth error, run:
```bash
npx supabase login
```
This opens a browser to complete OAuth. The CLI must be authenticated before `supabase link` will work.

- [ ] **Step 2: Link project**

```bash
SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
cd "$SITE"
npx supabase link --project-ref pobddtmnzimcdiaujyyf
```

- [ ] **Step 3: Set the Resend secret**

```bash
npx supabase secrets set RESEND_API_KEY=<key-from-bodhi>
```

**STOP: Bodhi must provide the Resend API key before this step.**

- [ ] **Step 4: Deploy both functions**

```bash
npx supabase functions deploy request-access
npx supabase functions deploy validate-token
```

Expected output: `Deployed function request-access` / `Deployed function validate-token`

- [ ] **Step 5: Smoke-test request-access with curl**

Use a real email address Bodhi controls — Resend rejects `test@example.com` and other reserved domains. Use `stillpointventuresllc@pm.me` or another inbox Bodhi can check.

```bash
curl -s -X POST \
  https://pobddtmnzimcdiaujyyf.supabase.co/functions/v1/request-access \
  -H "Content-Type: application/json" \
  -d '{"email":"stillpointventuresllc@pm.me"}' | jq .
```

Expected HTTP 200 with `{"ok":true}`.
Check Supabase `collapse_tokens` table: one new row with `used=false` and `expires_at` ~24h from now.
Email delivery is verified in Step 7 (the interactive round-trip test with Bodhi).

- [ ] **Step 6: Smoke-test validate-token**

Copy the `token` UUID from the row inserted above, then:

```bash
curl -s -X POST \
  https://pobddtmnzimcdiaujyyf.supabase.co/functions/v1/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token":"<uuid-from-step-5>"}' | jq .
```

Expected first call: `{"valid":true}`
Expected second call (same token): `{"valid":false,"reason":"not_found_or_used"}`
(The atomic UPDATE finds no row matching `used=false`, so `data` is null and the function returns `not_found_or_used`.)

- [ ] **Step 7: PING BODHI — end-to-end email test**

Gate backend is live. Bodhi needs to:
1. Open https://thebookofoneness.com on the staging/local server
2. Enter a real email address
3. Confirm the "Link sent" state renders
4. Check inbox for the magic-link email
5. Click the link and confirm the Collapses unlock

Do not mark this task complete until Bodhi confirms the email round-trip works.

---

## Task 2: Extract glossary definitions from PDF + enrich glossary-data.js

**Files:**
- Create: `mirror/oneness-website/scripts/extract-glossary.js` (Node.js, build-time only)
- Modify: `mirror/oneness-website/public/glossary-data.js`

The PDF is already parsed and the structure is consistent: ALL-CAPS term name on its own line, followed by body paragraphs.

`★ Insight ─────────────────────────────────────`
The `glossary-data.js` file uses an IIFE that exposes `window.GLOSSARY` — it's a browser global, not a module. For Eleventy (Node.js), we'll need a separate `_data/glossary.js` that uses CommonJS exports. The two files must stay in sync. The source of truth for all content is the Node.js version; the browser IIFE version is derived from it.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Install pdftotext check**

Run: `which pdftotext`
Expected: `/opt/homebrew/bin/pdftotext` (already installed in this session)

- [ ] **Step 2: Extract full PDF text**

```bash
PDF="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/DO NOT REMOVE/***FINAL DRAFT FOR PRINT/0. AI KNOWLEDGEBASE 2026/THE FINAL CORE TERMS GLOSSARY - THE BOOK OF ONENESS.pdf"
pdftotext "$PDF" /tmp/glossary-raw.txt
wc -l /tmp/glossary-raw.txt
```

Expected: several hundred lines. If 0, try the _canon copy:
```bash
PDF="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/_canon/THE FINAL CORE TERMS GLOSSARY - The Book of Oneness November 29, 2025.pdf"
pdftotext "$PDF" /tmp/glossary-raw.txt
```

- [ ] **Step 3: Write the extraction script**

Create `mirror/oneness-website/scripts/extract-glossary.js`:

```js
// Build-time script. Reads /tmp/glossary-raw.txt, parses term blocks,
// outputs a JSON mapping slug → { snippet, definition }.
// Written to scripts/glossary-definitions.json (not /tmp) so _data/glossary.js
// can read it without regex-parsing the escaped browser IIFE source.
const fs   = require('fs');
const path = require('path');

const text = fs.readFileSync('/tmp/glossary-raw.txt', 'utf8');
const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

// A term header is an ALL-CAPS line that matches a known slug.
// We'll use the slug list from the data file to match.
// Bucket headers (ONENESS, EMERGENCE, etc.) are also ALL-CAPS — exclude them.
const BUCKET_NAMES = new Set([
  'ONENESS','EMERGENCE','SEPARATION APPARATUS','NARRATIVE MECHANISM',
  'PERFORMANCE','JUSTIFICATION','PERCEPTUAL DISTORTIONS',
  'STRUCTURES OF CONTROL','CONDITIONS OF COLLAPSE','WHAT REMAINS',
  'CORE TERMS GLOSSARY','SE','SE PARATION APPARATUS'  // PDF artefacts
]);

const definitions = {};
let currentTerm = null;
let bodyLines = [];

function flush() {
  if (!currentTerm || !bodyLines.length) return;
  const definition = bodyLines.join(' ').replace(/\s+/g, ' ').trim();
  const firstSentenceMatch = definition.match(/^.{10,}?[.!?]/);
  const snippet = firstSentenceMatch
    ? firstSentenceMatch[0].slice(0, 150)
    : definition.slice(0, 150);
  const slug = currentTerm
    .toLowerCase()
    .replace(/[øǿ]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  definitions[slug] = { snippet, definition };
}

for (const line of lines) {
  const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line) && line.length > 2;
  if (isAllCaps && !BUCKET_NAMES.has(line)) {
    flush();
    currentTerm = line;
    bodyLines = [];
  } else if (currentTerm) {
    bodyLines.push(line);
  }
}
flush();

// Write to scripts/ (not /tmp) so _data/glossary.js can read it reliably.
const outPath = path.join(__dirname, 'glossary-definitions.json');
fs.writeFileSync(outPath, JSON.stringify(definitions, null, 2));
console.log(`Extracted ${Object.keys(definitions).length} definitions → ${outPath}`);
```

- [ ] **Step 4: Run extraction**

```bash
SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
node "$SITE/scripts/extract-glossary.js"
```

Expected: `Extracted 62 definitions → .../scripts/glossary-definitions.json`
(Minor variance is OK. Anything below 55 signals a parsing problem.)

```bash
head -40 "$SITE/scripts/glossary-definitions.json"
```
Verify the first few definitions look correct (not empty, not truncated at a PDF artefact).

- [ ] **Step 5: Manually spot-check 5 terms**

Open `$SITE/scripts/glossary-definitions.json` and verify:
- `oneness` — should start "The undivided totality before all perception."
- `the-mind` — should start "The simulator of The Illusion of Separation."
- `the-fear` — multi-paragraph definition; verify it joins cleanly without mid-word breaks
- `the-great-forgetting` — exists and is non-empty
- `the-field` — exists (appears twice in glossary-data.js; both entries share the slug)

If any are wrong or missing, debug the extraction script (PDF artefacts sometimes break the heading-detection regex).

- [ ] **Step 6: Enrich glossary-data.js**

The `t()` helper in `glossary-data.js` currently generates `snippet: PH`. We need to extend the schema to carry `snippet` (first ~120 chars) and `definition` (full body). Replace the `t()` function and the `TERMS` array in `public/glossary-data.js` with real data from the extracted JSON.

This is a mechanical substitution. Write a small script, or do it inline:

Create `mirror/oneness-website/scripts/patch-glossary-data.js`:

```js
const fs   = require('fs');
const path = require('path');
const defs = JSON.parse(fs.readFileSync(path.join(__dirname, 'glossary-definitions.json'), 'utf8'));

// Read the existing glossary-data.js and replace the `snippet: PH` and
// add `definition` field for each term entry.
let src = fs.readFileSync('public/glossary-data.js', 'utf8');

// Replace the PH constant definition
src = src.replace(
  /const PH = '.*?';/,
  '// Definitions injected at build time from the canonical PDF.'
);

// Replace each `snippet: PH` in TERMS by injecting real data.
// We do this by replacing the entire TERMS array using the extracted JSON.
// Build a replacement TERMS block.
// (This is safe because the term order must NOT change.)

// Read the slugs from the existing file in order.
const slugMatches = [...src.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
for (const slug of slugMatches) {
  const def = defs[slug] || defs[slug.replace(/--.*/, '')]; // handle dup suffix (e.g. the-field--what-remains)
  if (!def) { console.warn(`No definition found for slug: ${slug}`); continue; }
  const snip = def.snippet.replace(/'/g, "\\'");
  const defText = def.definition.replace(/'/g, "\\'");
  // Use [\s\S] instead of [^}] so the pattern matches across newlines (dotAll-equivalent).
  src = src.replace(
    new RegExp(`(slug:\\s*'${slug.replace(/-/g,'\\-')}'[\\s\\S]*?)snippet:\\s*PH`),
    `$1snippet: '${snip}',\n      definition: '${defText}'`
  );
}

// Spot-check: verify the dup entry (the-field--what-remains) was also patched.
if (!src.includes("slug: 'the-field--what-remains'") || src.match(/slug:\s*'the-field--what-remains'[\s\S]*?snippet:\s*PH/)) {
  console.warn('WARNING: dup entry the-field--what-remains may not have been patched — check manually.');
}

fs.writeFileSync('public/glossary-data.js', src);
console.log('glossary-data.js patched');
```

```bash
SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
cd "$SITE"
node scripts/patch-glossary-data.js
```

- [ ] **Step 7: Verify glossary-data.js**

Open `public/glossary-data.js` and confirm `ONENESS` has:
- `snippet: 'The undivided totality before all perception...'` (not PH placeholder)
- `definition: '...'` field present

Run: `grep -c "Definition pulled from" public/glossary-data.js`
Expected: `0` (all placeholders replaced)

- [ ] **Step 8: Commit**

```bash
git add public/glossary-data.js scripts/
git commit -m "feat: inject real glossary definitions from source PDF"
```

---

## Task 3: Generate 62 term pages with Eleventy

**Files:**
- Create: `mirror/oneness-website/.eleventy.js`
- Create: `mirror/oneness-website/_data/glossary.js`
- Create: `mirror/oneness-website/_templates/term.njk`
- Output: `public/glossary/<slug>.html` for all 62 terms

`★ Insight ─────────────────────────────────────`
Eleventy is being used as a one-shot generator, not a live dev server. The output goes straight into `public/` which is the GitHub Pages deploy root. After generation, Eleventy is no longer needed at runtime — the files are just static HTML. This keeps the production architecture identical to before (pure static HTML).
`─────────────────────────────────────────────────`

- [ ] **Step 1: Install Eleventy (dev dependency only)**

From `mirror/oneness-website/`:
```bash
npm init -y 2>/dev/null || true
npm install --save-dev @11ty/eleventy
```

Add to `.gitignore`:
```
node_modules/
.eleventy-cache/
```

- [ ] **Step 2: Create the Eleventy data file for glossary**

Create `mirror/oneness-website/_data/glossary.js`:

```js
// Node.js data file for Eleventy. Reads term structure from public/glossary-data.js
// (slugs/names/buckets) and definitions from scripts/glossary-definitions.json
// (produced by Task 2 extract-glossary.js). Keeping these separate avoids
// re-parsing the browser IIFE's escaped string literals, which breaks on apostrophes.
const fs   = require('fs');
const path = require('path');

const BUCKETS = [
  { id: 'oneness',                  number: '01', name: 'Oneness' },
  { id: 'emergence',                number: '02', name: 'Emergence' },
  { id: 'separation-apparatus',     number: '03', name: 'Separation Apparatus' },
  { id: 'narrative-mechanism',      number: '04', name: 'Narrative Mechanism' },
  { id: 'performance',              number: '05', name: 'Performance' },
  { id: 'justification',            number: '06', name: 'Justification' },
  { id: 'perceptual-distortions',   number: '07', name: 'Perceptual Distortions' },
  { id: 'structures-of-control',    number: '08', name: 'Structures of Control' },
  { id: 'conditions-of-collapse',   number: '09', name: 'Conditions of Collapse' },
  { id: 'what-remains',             number: '10', name: 'What Remains' }
];

// Load definitions from the JSON file produced by extract-glossary.js (Task 2).
// This file must exist before running Eleventy. If missing, run Task 2 first.
const defsPath = path.join(__dirname, '../scripts/glossary-definitions.json');
const DEFS = fs.existsSync(defsPath)
  ? JSON.parse(fs.readFileSync(defsPath, 'utf8'))
  : (() => { console.warn('glossary-definitions.json not found — run extract-glossary.js first'); return {}; })();

// Parse only name/bucket/slug from the browser file (no string content — avoids escape issues).
const BROWSER_SRC = fs.readFileSync(path.join(__dirname, '../public/glossary-data.js'), 'utf8');
function parseTermStructure(src) {
  const entries = [];
  for (const m of src.matchAll(/name:\s*'([^']+)'[\s\S]*?bucket:\s*'([^']+)'[\s\S]*?slug:\s*'([^']+)'/g)) {
    entries.push({ name: m[1], bucket: m[2], slug: m[3] });
  }
  return entries;
}

const BUCKET_BY_ID  = Object.fromEntries(BUCKETS.map(b => [b.id, b]));
const raw           = parseTermStructure(BROWSER_SRC).filter(t => !t.slug.includes('--'));

const TERMS_BY_BUCKET = {};
for (const b of BUCKETS) TERMS_BY_BUCKET[b.id] = [];
for (const t of raw) { if (TERMS_BY_BUCKET[t.bucket]) TERMS_BY_BUCKET[t.bucket].push(t); }

// Merge definitions (from JSON) with structure (from browser file) and add sibling context.
const TERMS = raw.map(term => {
  const defKey  = term.slug;                                 // exact slug
  const defData = DEFS[defKey] || DEFS[defKey.replace(/--.*/, '')] || { snippet: '', definition: '' };
  const bucket  = BUCKET_BY_ID[term.bucket];
  const siblings = TERMS_BY_BUCKET[term.bucket] || [];
  const idx     = siblings.findIndex(s => s.slug === term.slug);
  return {
    ...term,
    snippet:       defData.snippet,
    definition:    defData.definition,
    bucket,
    termIndex:     idx + 1,
    totalInBucket: siblings.length,
    prevTerm:      idx > 0                   ? siblings[idx - 1] : null,
    nextTerm:      idx < siblings.length - 1 ? siblings[idx + 1] : null,
    relatedCards:  siblings.filter(s => s.slug !== term.slug).slice(0, 4),
  };
});

module.exports = { BUCKETS, TERMS, BUCKET_BY_ID, TERMS_BY_BUCKET };
```

- [ ] **Step 3: Create the .eleventy.js config**

Create `mirror/oneness-website/.eleventy.js`:

```js
module.exports = function(eleventyConfig) {
  // Minimal config. Templates use pagination front matter + permalink to generate
  // per-item pages. No passthrough copy — public/ files are managed manually.
  // (Adding addPassthroughCopy('public') here would copy all of public/ into
  //  _generated/public/ on every build, which is not what we want.)
  return {
    dir: {
      input: '_templates',
      output: '_generated',
      data: '../_data',   // relative to input dir, so resolves to _data/ at project root
    },
  };
};
```

- [ ] **Step 4: Create the term page Nunjucks template**

Create `mirror/oneness-website/_templates/term.njk`.

**CRITICAL: the file MUST begin with this front matter block.** This is what tells Eleventy to generate one file per term with the correct output path. Without this, Eleventy generates a single `term/index.html` instead of 62 separate files.

```yaml
---
pagination:
  data: glossary.TERMS
  size: 1
  alias: term
permalink: "glossary/{{ term.slug }}.html"
---
```

`glossary.TERMS` refers to the `TERMS` export from `_data/glossary.js`. Each item already has `prevTerm`, `nextTerm`, `relatedCards`, `bucket`, `termIndex`, and `totalInBucket` pre-computed — the template just reads them, no logic needed.

The rest of the template must produce HTML identical in structure to `glossary/the-mind.html` from the design handoff. Key substitutions per term:
- `{{ term.name }}` — ALL-CAPS term name
- `{{ bucket.name | upper }}` — bucket name
- `{{ bucket.number }}` — bucket number (e.g. "03")
- `{{ term.slug }}` — URL slug
- `{{ term.definition }}` — full definition (paragraphs separated by `\n\n`)
- `{{ term.snippet }}` — first ~120 chars (for `<meta name="description">`)
- `{{ term.termIndex }}` / `{{ term.totalInBucket }}` — for the chip "TERM N/M"
- `{{ term.prevTerm }}` / `{{ term.nextTerm }}` — for prev/next navigation
- `{{ term.relatedCards }}` — 4 sibling term cards

Copy the full CSS from `the-mind.html` verbatim into the template. Only the `<head>` metadata, breadcrumb, term head, definition body, related cards, and prev/next nav are dynamic.

The template should produce the exact same HTML structure as `the-mind.html`. Compare the generated `glossary/the-mind.html` output against the reference file to validate.

This template is long (~500 lines). Write it carefully. The critical spots:
1. `<title>{{ term.name }} — THE BOOK OF ONENESS by [MIRRØR]</title>`
2. `<meta name="description" content="{{ term.snippet }} Defined in THE BOOK OF ONENESS by [MIRRØR].">`
3. `<link rel="canonical" href="https://thebookofoneness.com/glossary/{{ term.slug }}">`
4. JSON-LD DefinedTerm block — `description` must match the on-page definition text
5. JSON-LD BreadcrumbList — 4 items: Home / Glossary / Bucket / Term
6. `<h1 class="term-page__title">{{ term.name }}</h1>`
7. Definition paragraphs: split `term.definition` on `\n\n`, wrap each in `<p>`
8. `.term-page__chip`: `{{ bucket.number }} BUCKET · TERM {{ term.termIndex }}/{{ term.totalInBucket }}`
9. Related cards: loop `term.relatedCards`, link to `{{ card.slug }}.html`
10. Prev link: if `term.prevTerm` render the link; else render `.is-disabled` placeholder
11. Next link: if `term.nextTerm` render the link; else render `.is-disabled` placeholder

- [ ] **Step 5: Run Eleventy and verify output count**

From the project root (set `$SITE` first):
```bash
SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
cd "$SITE"
npx eleventy --config .eleventy.js
ls _generated/glossary/ | wc -l
```

Expected: 62 files (one per non-dup term). With the pagination front matter and `permalink: "glossary/{{ term.slug }}.html"`, Eleventy writes all pages to `_generated/glossary/`. If the count is wrong, verify: (a) the `---` front matter block is at the very top of `term.njk`, (b) `_data/glossary.js` exports `TERMS` as an array, (c) the `permalink` line has no leading spaces inside the front matter.

- [ ] **Step 6: Copy generated files to public/glossary/**

Generated files land in `_generated/glossary/`, not `_generated/*.html` (the pagination permalink controls the subdirectory).

```bash
cp _generated/glossary/*.html "$SITE/public/glossary/"
ls "$SITE/public/glossary/" | wc -l
```

Expected: 63 — 62 generated term pages + `search.html` (copied in Task 1a, not generated).

The generated `oneness.html` and `the-mind.html` will overwrite the reference copies placed in Task 1a. That is correct and intended — the generated versions have real definitions and correct prev/next nav.

- [ ] **Step 7: Spot-check 3 generated files**

Open `public/glossary/the-fear.html` in a browser (or check the HTML manually):
- Title correct: `THE FEAR — THE BOOK OF ONENESS by [MIRRØR]`
- Definition is real text, not placeholder
- Prev/next links point to correct slugs

Open `public/glossary/oneness.html`:
- Prev link is the disabled `.is-disabled` placeholder (first in bucket)

Open `public/glossary/the-ground-of-being.html`:
- Next link is disabled (last in its bucket)

- [ ] **Step 8: Commit**

```bash
git add public/glossary/
git commit -m "feat: generate 62 glossary term pages via Eleventy"
```

---

## Task 4: Generate 19 Part pages (Part II–XX)

**Files:**
- Create: `mirror/oneness-website/_data/parts.js`
- Create: `mirror/oneness-website/_templates/part.njk`
- Output: `public/parts/part-02.html` through `public/parts/part-20.html`

**Part data needed.** The handoff shows Part I: "THE FIRST STIRRING" with 14 Fractures (F1–14). The breadcrumb chip shows "I / XX · FRACTURES · 1 — 14". We need Part II–XX titles and Fracture ranges. These come from THE BOOK OF ONENESS structure. The source is in the mirror workspace.

- [ ] **Step 1: Find the Part titles**

Check the complete structure document:
```bash
grep -i "PART\|Fracture" "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/THE_BOOK_OF_ONENESS_COMPLETE_STRUCTURE.md" 2>/dev/null | head -60
```

If that file doesn't have all 20 Part titles, check:
```bash
find "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror" -name "*.md" -exec grep -l "Part II\|Part III\|PART II" {} \; | head -5
```

Use whatever source has all 20 Part titles and their Fracture ranges.

- [ ] **Step 2: Create _data/parts.js**

**STOP before writing this file.** Do not invent Part titles or Fracture ranges. The actual titles and ranges must come from the manuscript. Run Step 1 first to extract them. If Step 1 does not produce a complete list of all 20 Parts with their exact titles and Fracture number ranges, pause and ask Bodhi to confirm the complete list before writing `parts.js` or running Eleventy for Part pages.

Create `mirror/oneness-website/_data/parts.js` with all 20 parts only after the titles and ranges are confirmed:

```js
// 20 Parts of THE BOOK OF ONENESS.
// arc: 'free' for Parts I–XII (Fractures), 'collapse' for Parts XIII–XX (Collapses).
// fractures: [firstNum, lastNum] — Fracture numbers covered by this Part.
// title: display title — array of two display lines for the hero split treatment.
// ALL VALUES BELOW ARE PLACEHOLDERS. Replace with confirmed manuscript data.

module.exports = [
  { num: 'I',    numeral: 1,  arc: 'free',     title: ['THE FIRST', 'STIRRING'],   fractures: [1, 14],    slug: 'part-01' },
  { num: 'II',   numeral: 2,  arc: 'free',     title: ['CONFIRM', 'FROM SOURCE'],  fractures: [15, 28],   slug: 'part-02' },
  // ... fill all 20 from the source document — DO NOT GENERATE UNTIL COMPLETE
  { num: 'XX',   numeral: 20, arc: 'collapse', title: ['CONFIRM', 'FROM SOURCE'],  fractures: [0, 0],     slug: 'part-20' },
];
```

**STOP: Do not run Eleventy for Part pages until every entry above has confirmed (non-placeholder) title and fractures values. Present the complete filled array to Bodhi for approval before running Step 4.**

- [ ] **Step 3: Create the Part page Nunjucks template**

Create `mirror/oneness-website/_templates/part.njk`.

**CRITICAL: the file MUST begin with this front matter block.** `parts` is the Eleventy data key (the filename of `_data/parts.js` without extension):

```yaml
---
pagination:
  data: parts
  size: 1
  alias: part
permalink: "parts/{{ part.slug }}.html"
---
```

Then at the top of the HTML body, define `arcLabel` before using it:

```njk
{% set arcLabel = 'COLLAPSES' if part.arc == 'collapse' else 'FRACTURES' %}
```

The rest of the template mirrors `parts/part-01.html` exactly. Dynamic substitutions per part:
- `<body data-screen-label="part-{{ part.slug }}" data-arc="{{ part.arc }}">` — arc flips CSS accent color
- `<p class="part-hero__numeral">PART {{ part.num }}</p>`
- `<h1 class="part-hero__title">` — two lines from `part.title` array (`part.title[0]` and `part.title[1]`)
- Breadcrumb chip: `{{ part.num }} / XX`
- Breadcrumb label: `{{ arcLabel }} · {{ part.fractures[0] }} — {{ part.fractures[1] }}`
- The fracture/collapse grid: generate `N` cards from Fracture numbers `[part.fractures[0]..part.fractures[1]]`
  - Only F001 ONENESS is LIVE; all others are UPCOMING
  - Each card's title comes from matching fracture number in a fractures data file (or from the glossary if aligned)
- Prev/next part foot links: `parts[loop.index - 1]` / `parts[loop.index + 1]` from the parts array (or pass prevPart/nextPart in `_data/parts.js` similar to how `_data/glossary.js` computes prevTerm/nextTerm)

- [ ] **Step 4: Run Eleventy for Part pages and copy to public/**

```bash
SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
cd "$SITE"
npx eleventy --config .eleventy.js
cp _generated/parts/*.html "$SITE/public/parts/"
ls "$SITE/public/parts/" | wc -l
```

Expected: 20 files (part-01 through part-20). Note: with `permalink: "parts/{{ part.slug }}.html"` Eleventy writes to `_generated/parts/`, not `_generated/` root. The glob `_generated/part-*.html` would match nothing.

- [ ] **Step 5: Spot-check**

Open `public/parts/part-02.html`:
- `data-arc="free"` on body
- Correct Part II title
- Fracture range shows F15–F28
- Prev link → Part I; Next link → Part III

Open `public/parts/part-13.html`:
- `data-arc="collapse"` on body (pink accent, not cyan)
- Correct Part XIII title
- Breadcrumb reads "XIII / XX · COLLAPSES · ..."

Open `public/parts/part-20.html`:
- Next link disabled (last Part)

- [ ] **Step 6: Commit**

```bash
git add public/parts/
git commit -m "feat: generate Part pages II–XX"
```

---

## Task 5: Deploy to production

- [ ] **Step 1: Final check — no placeholder text in any generated file**

```bash
grep -r "Definition pulled from" public/glossary/ | wc -l
grep -r "TODO" public/ | grep -v ".git" | wc -l
```

Both expected: `0`

- [ ] **Step 2: Deploy**

```bash
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website/public"
git add -A
git commit -m "deploy: $(date +%Y-%m-%d-%H%M) — gate + glossary + all pages"
git push origin main
```

Site live at: https://thebookofoneness.com (DNS must already point to GitHub Pages)

- [ ] **Step 3: Post-deploy verification**

- [ ] Visit https://thebookofoneness.com/glossary/oneness — definition renders, no placeholder
- [ ] Visit https://thebookofoneness.com/glossary/the-mind — prev/next nav works
- [ ] Visit https://thebookofoneness.com/parts/part-02 — arc is cyan, Part II title correct
- [ ] Visit https://thebookofoneness.com/parts/part-13 — arc is pink (collapse)
- [ ] Test the gate on the home page — email submit → "Link sent" state renders

---

## Blockers to resolve before starting

1. **Resend API key** — Task 1c/1f require `RESEND_API_KEY`. Bodhi must provide this from the Resend dashboard before Edge Functions can be deployed.

2. **Part titles and Fracture ranges for Parts II–XX** — Task 4 cannot start until all 20 Part titles and their Fracture number ranges are confirmed from the manuscript. Check `THE_BOOK_OF_ONENESS_COMPLETE_STRUCTURE.md` first; if that's incomplete, ask Bodhi.

3. **Supabase MCP org switch** — Before Tasks 1b/1c/1d: disconnect from Bodhi360 org, connect to stillpoint ops org (project `pobddtmnzimcdiaujyyf`).

---

## Quick-start commands

```bash
# Set working directory
export SITE="/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website"
cd "$SITE"

# Check Supabase CLI
npx supabase --version

# Check Node
node --version  # needs v18+

# Check pdftotext
pdftotext --version
```
