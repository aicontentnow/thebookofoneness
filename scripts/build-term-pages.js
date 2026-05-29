#!/usr/bin/env node
'use strict';

/**
 * build-term-pages.js
 * Generates 62 static HTML files in public/glossary/ from
 * scripts/glossary-definitions.json + the canonical term/bucket structure.
 *
 * Run from the mirror/oneness-website/ directory:
 *   node scripts/build-term-pages.js
 */

const fs   = require('fs');
const path = require('path');

// === PATHS ===
const ROOT     = path.join(__dirname, '..');
const DEFS_JSON = path.join(__dirname, 'glossary-definitions.json');
const OUT_DIR  = path.join(ROOT, 'public', 'glossary');

// === LOAD DEFINITIONS ===
const DEFS = JSON.parse(fs.readFileSync(DEFS_JSON, 'utf8'));

// === BUCKET STRUCTURE (mirrors glossary-data.js exactly) ===
const BUCKETS = [
  { id: 'oneness',                number: '01', name: 'Oneness' },
  { id: 'emergence',              number: '02', name: 'Emergence' },
  { id: 'separation-apparatus',   number: '03', name: 'Separation Apparatus' },
  { id: 'narrative-mechanism',    number: '04', name: 'Narrative Mechanism' },
  { id: 'performance',            number: '05', name: 'Performance' },
  { id: 'justification',          number: '06', name: 'Justification' },
  { id: 'perceptual-distortions', number: '07', name: 'Perceptual Distortions' },
  { id: 'structures-of-control',  number: '08', name: 'Structures of Control' },
  { id: 'conditions-of-collapse', number: '09', name: 'Conditions of Collapse' },
  { id: 'what-remains',           number: '10', name: 'What Remains' },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[øǿ]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function t(name, bucket) {
  const slug = slugify(name);
  const d = DEFS[slug] || { snippet: '', definition: '' };
  return { name, bucket, slug, snippet: d.snippet, definition: d.definition };
}

// === TERMS (mirrors glossary-data.js exactly, including dup entry) ===
const TERMS = [
  // Bucket 1 · ONENESS
  t('ONENESS',                        'oneness'),
  t('NOW / THE PRESENT',              'oneness'),

  // Bucket 2 · EMERGENCE
  t('FORMLESSNESS',                   'emergence'),
  t('THE FIELD',                      'emergence'),
  t('THE PULSE',                      'emergence'),
  t('THE PATTERN',                    'emergence'),
  t('FORM',                           'emergence'),
  t('THE ACHE',                       'emergence'),
  t('INTELLIGENCE',                   'emergence'),
  t('LIFE',                           'emergence'),
  t('THE BODY',                       'emergence'),
  t('THE SURROUND',                   'emergence'),
  t('IMPERMANENCE',                   'emergence'),

  // Bucket 3 · SEPARATION APPARATUS
  t('THE FEAR',                       'separation-apparatus'),
  t('THE MIND',                       'separation-apparatus'),
  t('THE NARRATOR',                   'separation-apparatus'),
  t('THE LOOP',                       'separation-apparatus'),
  t('THE SELF',                       'separation-apparatus'),
  t('IDENTITY',                       'separation-apparatus'),
  t('THE EGO',                        'separation-apparatus'),
  t('THE ILLUSION OF SEPARATION',     'separation-apparatus'),
  t('THE GRIP OF ATTACHMENT',         'separation-apparatus'),
  t('THE GREAT FORGETTING',           'separation-apparatus'),
  t('THE FRAME',                      'separation-apparatus'),
  t('THE OBSERVER',                   'separation-apparatus'),

  // Bucket 4 · NARRATIVE MECHANISM
  t('THE STORY OF THE SELF',          'narrative-mechanism'),
  t('THE STORY OF THE OTHERS',        'narrative-mechanism'),
  t('THE STORY OF SUPERIORITY',       'narrative-mechanism'),
  t('THE STORY OF THE ONE RIGHT WAY', 'narrative-mechanism'),
  t('THE STORY OF THE WORLD',         'narrative-mechanism'),

  // Bucket 5 · PERFORMANCE
  t('THE MIRROR',                     'performance'),
  t('THE MASK',                       'performance'),
  t('THE ROLE',                       'performance'),

  // Bucket 6 · JUSTIFICATION
  t('THE MYTH OF TIME',               'justification'),
  t('THE MYTH OF MEANING',            'justification'),
  t('THE MYTH OF BELIEF',             'justification'),
  t('THE MYTH OF OWNERSHIP',          'justification'),
  t('THE MYTH OF FAIRNESS',           'justification'),
  t('THE MYTH OF PURPOSE',            'justification'),
  t('THE MYTH OF PROGRESS',           'justification'),

  // Bucket 7 · PERCEPTUAL DISTORTIONS
  t('THE DELUSION OF REALITY',        'perceptual-distortions'),
  t('THE DELUSION OF BELONGING',      'perceptual-distortions'),
  t('THE DELUSION OF THE PAST',       'perceptual-distortions'),
  t('THE DELUSION OF THE FUTURE',     'perceptual-distortions'),
  t('THE DELUSION OF THE SACRED',     'perceptual-distortions'),
  t('THE DELUSION OF CONTROL',        'perceptual-distortions'),
  t('THE DELUSION OF TRUTH',          'perceptual-distortions'),
  t('THE DELUSION OF POWER',          'perceptual-distortions'),

  // Bucket 8 · STRUCTURES OF CONTROL
  t('THE LINES OF SEPARATION',        'structures-of-control'),
  t('THE RULES',                      'structures-of-control'),
  t('THE LAW',                        'structures-of-control'),
  t('THE SYSTEM',                     'structures-of-control'),
  t('THE MACHINE',                    'structures-of-control'),

  // Bucket 9 · CONDITIONS OF COLLAPSE
  t('FRACTURE',                       'conditions-of-collapse'),
  t('COLLAPSE',                       'conditions-of-collapse'),

  // Bucket 10 · WHAT REMAINS
  t('THE GREAT REMEMBERING',          'what-remains'),
  t('RECOGNITION',                    'what-remains'),
  t('KNOWING',                        'what-remains'),
  t('PRESENCE',                       'what-remains'),
  t('RELEASE',                        'what-remains'),
  t('THE UNHELD',                     'what-remains'),
  // THE FIELD appears in both Bucket 2 and Bucket 10 per the source glossary.
  // The dup flag means: no separate page; links resolve to the-field.html.
  {
    name:       'THE FIELD',
    bucket:     'what-remains',
    slug:       'the-field--what-remains',
    snippet:    (DEFS['the-field'] || {}).snippet    || '',
    definition: (DEFS['the-field'] || {}).definition || '',
    dup:        'the-field',
  },
  t('THE GROUND OF BEING',            'what-remains'),
];

// === DERIVED LOOKUPS ===
const BUCKET_BY_ID    = {};
for (const b of BUCKETS) BUCKET_BY_ID[b.id] = b;

const TERMS_BY_BUCKET = {};
for (const b of BUCKETS) {
  TERMS_BY_BUCKET[b.id] = TERMS.filter(term => term.bucket === b.id);
}

// === HELPERS ===

// Safe HTML attribute + text escaping
function esc(str) {
  return (str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// Title-case: capitalize first letter of every word
function titleCase(str) {
  return str.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
}

// Resolve the href for any term (handles dup redirect)
function termHref(term) {
  return (term.dup || term.slug) + '.html';
}

// Arrow SVG for related cards
const CARD_ARR = '<svg class="term-card__arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19 L19 5 M9 5 L19 5 L19 15"/></svg>';

// Arrow SVG for nav CTA
const NAV_ARR = '<svg class="arr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg>';

// Render prev or next sequence cell
function seqLink(bucketTerms, bucketNameUpper, siblingTerm, dir) {
  if (!siblingTerm) {
    // Disabled placeholder so the grid still fills both columns
    return `      <div class="term-page__seq-link term-page__seq-link--${dir}" aria-disabled="true" style="opacity:0.25;pointer-events:none">
        <span class="term-page__seq-link-eyebrow">
          ${dir === 'prev' ? '← PREV' : 'NEXT →'}
        </span>
      </div>`;
  }
  const sibPos = bucketTerms.findIndex(x => x.slug === siblingTerm.slug) + 1;
  const href   = termHref(siblingTerm);
  const eyebrow = dir === 'prev'
    ? `<span class="term-page__seq-edge">←</span> PREV · TERM ${sibPos}`
    : `NEXT · TERM ${sibPos} <span class="term-page__seq-edge">→</span>`;
  return `      <a class="term-page__seq-link term-page__seq-link--${dir}" href="${href}">
        <span class="term-page__seq-link-eyebrow">${eyebrow}</span>
        <span class="term-page__seq-link-bucket">// ${bucketNameUpper}</span>
        <span class="term-page__seq-link-name">${esc(siblingTerm.name)}</span>
      </a>`;
}

// === PAGE GENERATOR ===
function generatePage(term) {
  const bucket       = BUCKET_BY_ID[term.bucket];
  const bucketTerms  = TERMS_BY_BUCKET[term.bucket];
  const pos          = bucketTerms.findIndex(x => x.slug === term.slug);
  const total        = bucketTerms.length;
  const posDisplay   = pos + 1;
  const bucketNameUp = bucket.name.toUpperCase();
  const breadLabel   = titleCase(term.name);

  // Related: up to 4 bucket siblings, excluding this term
  const related = bucketTerms.filter(x => x.slug !== term.slug).slice(0, 4);

  const relatedCards = related.map(r => `        <a class="term-card" href="${termHref(r)}">
          <div class="term-card__bucket">// ${bucketNameUp}</div>
          <h3 class="term-card__name">${esc(r.name)}</h3>
          ${CARD_ARR}
        </a>`).join('\n');

  const prevTerm = pos > 0 ? bucketTerms[pos - 1] : null;
  const nextTerm = pos < total - 1 ? bucketTerms[pos + 1] : null;

  // JSON-LD (meta description = snippet; JSON-LD description = full definition per template comment)
  const definedTermLD = JSON.stringify({
    '@context':   'https://schema.org',
    '@type':      'DefinedTerm',
    'name':       term.name,
    'alternateName': titleCase(term.name),
    'termCode':   term.slug,
    'url':        `https://thebookofoneness.com/glossary/${term.slug}`,
    'description': term.definition,
    'inDefinedTermSet': {
      '@type': 'DefinedTermSet',
      'name':  'THE BOOK OF ONENESS — Core Terms Glossary',
      'url':   'https://thebookofoneness.com/#glossary',
    },
    'isPartOf': {
      '@type':     'Book',
      'name':      'THE BOOK OF ONENESS',
      'author':    { '@type': 'Person', 'name': '[MIRRØR]' },
      'publisher': { '@type': 'Organization', 'name': 'MIRROR Publishing' },
    },
  }, null, 2);

  const breadcrumbLD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home',     'item': 'https://thebookofoneness.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Glossary', 'item': 'https://thebookofoneness.com/#glossary' },
      { '@type': 'ListItem', 'position': 3, 'name': bucket.name, 'item': `https://thebookofoneness.com/#glossary?bucket=${bucket.id}` },
      { '@type': 'ListItem', 'position': 4, 'name': term.name,  'item': `https://thebookofoneness.com/glossary/${term.slug}` },
    ],
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(term.name)} — THE BOOK OF ONENESS by [MIRRØR]</title>
<meta name="description" content="${esc(term.snippet)}">
<link rel="canonical" href="https://thebookofoneness.com/glossary/${term.slug}">

<!-- Open Graph -->
<meta property="og:title" content="${esc(term.name)} — THE BOOK OF ONENESS by [MIRRØR]">
<meta property="og:description" content="${esc(term.snippet)}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://thebookofoneness.com/glossary/${term.slug}">
<meta name="twitter:card" content="summary">

<script type="application/ld+json">
${definedTermLD}
<\/script>
<script type="application/ld+json">
${breadcrumbLD}
<\/script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../glossary-search.css">
<link rel="stylesheet" href="../term-page.css">
</head>
<body>

<div class="scanlines" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<nav class="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="/">THE BOOK OF ONENESS</a>
    <ul class="nav__links">
      <li><a href="/#the-book">The Book</a></li>
      <li><a href="/#listen">Listen</a></li>
      <li><a href="/#watch">Watch</a></li>
      <li><a href="/#explore">Explore</a></li>
      <li><a href="/#glossary" class="is-active">Glossary</a></li>
      <li><a href="/#about">About</a></li>
    </ul>
    <a class="nav__cta" href="/get-the-book">GET THE BOOK ${NAV_ARR}</a>
  </div>
</nav>

<main class="term-page" data-screen-label="term-${term.slug}">
  <div class="container">

    <nav class="term-page__breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span class="sep">/</span>
      <a href="/#glossary">Glossary</a>
      <span class="sep">/</span>
      <a class="bucket" href="/#glossary?bucket=${bucket.id}">${esc(bucket.name)}</a>
      <span class="sep">/</span>
      <span aria-current="page">${esc(breadLabel)}</span>
    </nav>

    <header class="term-page__head">
      <div>
        <p class="term-page__eyebrow">
          <span class="slash">//</span>GLOSSARY · ${bucketNameUp}
        </p>
        <h1 class="term-page__title">${esc(term.name)}</h1>
      </div>
      <span class="term-page__chip">
        <span class="num">${bucket.number}</span>BUCKET · TERM ${posDisplay}/${total}
      </span>
    </header>

    <div class="term-page__definition">
      <p>${esc(term.definition)}</p>
    </div>

    <hr class="term-page__rule">

    <section class="term-page__related" aria-labelledby="related-head">
      <div class="term-page__related-head">
        <h2 class="term-page__related-eyebrow" id="related-head">
          <span class="slash">//</span>ALSO IN ${bucketNameUp}
        </h2>
        <span class="term-page__related-meta">// ${total} terms · bucket ${bucket.number}</span>
      </div>
      <div class="term-page__related-grid">
${relatedCards}
      </div>
    </section>

    <nav class="term-page__seq" aria-label="Within ${esc(bucket.name)}">
${seqLink(bucketTerms, bucketNameUp, prevTerm, 'prev')}
${seqLink(bucketTerms, bucketNameUp, nextTerm, 'next')}
    </nav>

  </div>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer__bottom">
      <span>© MIRROR Publishing 2026 · All rights reserved</span>
      <span><a href="/">← The Book of Oneness</a></span>
      <a href="/get-the-book" style="color:var(--pink)">GET THE BOOK →</a>
    </div>
  </div>
</footer>

<script src="../glossary-data.js"><\/script>
<script src="../glossary-search.js"><\/script>

</body>
</html>`;
}

// === MAIN ===
let count = 0;
for (const term of TERMS) {
  // Skip dup entries — they have no separate page (links resolve to canonical)
  if (term.dup) {
    console.log(`  ~ ${term.slug} (dup → ${term.dup}.html, no page generated)`);
    continue;
  }
  const html    = generatePage(term);
  const outPath = path.join(OUT_DIR, term.slug + '.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✓ ${term.slug}.html`);
  count++;
}

console.log(`\n${count} pages generated in public/glossary/`);
