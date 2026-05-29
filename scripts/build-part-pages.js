#!/usr/bin/env node
// scripts/build-part-pages.js
// Generates public/parts/part-02.html through part-20.html.
// part-01.html already exists and is NOT touched.
//
// Run from mirror/oneness-website/:
//   node scripts/build-part-pages.js

'use strict';

const fs   = require('fs');
const path = require('path');

// ── ROMAN NUMERAL TABLE (index = part number - 1) ────────────────
const ROMAN = [
  'I','II','III','IV','V','VI','VII','VIII','IX','X',
  'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'
];

// ── COMPLETE PART DATA ────────────────────────────────────────────
// arc:      'free'     = Fractures, Parts I-XII  (cyan  #00C2C7)
//           'collapse' = Collapses, Parts XIII-XX (pink  #FF2D6F)
// titleLines: hero title split into display lines (1 or 2 strings)
// startNum: global entry number of the first entry in this Part
//           (Fractures: 1-143 globally; Collapses: 1-50 globally,
//            reset at Part XIII)
const PARTS = [
  // ── FRACTURES (Parts I-XII) ──────────────────────────────────
  {
    num: 1,
    titleLines: ['THE FIRST', 'STIRRING'],
    arc: 'free',
    startNum: 1,
    entries: [
      'ONENESS','NOW','FORMLESSNESS','THE FIELD','THE PULSE',
      'THE PATTERN','FORM','IMPERMANENCE','THE ACHE','INTELLIGENCE',
      'LIFE','THE BODY','SENSATION','THE SURROUND'
    ]
  },
  {
    num: 2,
    titleLines: ['THE HUMAN', 'PATTERN'],
    arc: 'free',
    startNum: 15,
    entries: [
      'ANIMAL SAW ITSELF','THE BRAIN SPLITS','THE FEAR','THE MIND EMERGES',
      'THE FRAME','THE NARRATOR & THE LOOP','THE FIRST TOOL','BIRTH OF LANGUAGE',
      'THE SYMBOL','ART ARISES','THE MYTH OF MEANING','BONDS BEFORE ROLES',
      'THE EGO & THE MASK','THE STORY OF THE SELF','THE MYTH OF TIME',
      'IDENTITY','THE ILLUSION OF SEPARATION'
    ]
  },
  {
    num: 3,
    titleLines: ['ROLES'],
    arc: 'free',
    startNum: 32,
    entries: [
      'THE CLUSTER','ROLES INVENTED','THE DELUSION OF BELONGING','THE CHILD',
      'THE PARENT','THE MATE','THE PROTECTOR','THE LEADER','THE FRIEND',
      'THE INTERPRETER','THE TEACHER','THE KEEPER','THE STORY OF THE OTHERS'
    ]
  },
  {
    num: 4,
    titleLines: ['THE STORY OF', 'THE WORLD'],
    arc: 'free',
    startNum: 45,
    entries: [
      'THE ONE RIGHT WAY','THE DELUSION OF THE SACRED','AGRICULTURAL REVOLUTION',
      'TOTALITARIAN AGRICULTURE','THE SURROUND DIVIDED','THE MYTH OF BELIEF',
      'THE DOMINION LIE','THE FEAR OF THE UNKNOWN'
    ]
  },
  {
    num: 5,
    titleLines: ['THE MYTH OF', 'OWNERSHIP'],
    arc: 'free',
    startNum: 53,
    entries: [
      'THE CLAIM','DOMESTICATION OF THE SURROUND','OWNERSHIP OF LIFE',
      'THE DIVINE RIGHT','MARRIAGE AS POSSESSION','WATER DIVIDED','SKY TAKEN',
      'THE SURROUND MEASURED','THE UNIVERSE ASSIGNED'
    ]
  },
  {
    num: 6,
    titleLines: ['RISE OF', 'THE SYSTEM'],
    arc: 'free',
    startNum: 62,
    entries: [
      'THE RULES','THE LAW','BIRTH OF EMPIRES','CLASS MANUFACTURED',
      'POVERTY CRIMINALIZED','THE ACHE AS THEFT','PRISON AS CAGE',
      'THE HOLY CLASS','TITHING & TRIBUTE','SIN & SALVATION','CHURCH & STATE',
      'GODS OF WAR','THE VOICE WAS GIVEN','TAX COMES DUE',
      'THE LINES BECOME NATIONS','THE ARMY ADVANCES','THE MACHINE'
    ]
  },
  {
    num: 7,
    titleLines: ['THEATER OF', 'GOVERNANCE'],
    arc: 'free',
    startNum: 79,
    entries: [
      'THE DELUSION OF POWER','THE MYTH OF PROGRESS','POLITICS AS SIMULATION',
      'LAW & COURTS','PUNISHMENT AS ORDER','EDUCATION AS FACTORY',
      'THE MASK OF CIVILIZATION'
    ]
  },
  {
    num: 8,
    titleLines: ['COMMERCE OF', 'CONTROL'],
    arc: 'free',
    startNum: 86,
    entries: [
      'COMMERCE ENGINE EXPANDS','CORPORATION AS SELF','INDUSTRIALIZED MEDICINE',
      'SURVEILLANCE NORMALIZED','THE SYSTEM EXPANDS','MANUFACTURING WEALTH',
      'POVERTY NORMALIZED','COMMERCE BECOMES LAW','SCHOOL AS DELAY',
      'THE WORLD AS ECONOMY'
    ]
  },
  {
    num: 9,
    titleLines: ['THE AGE OF', 'EXTRACTION'],
    arc: 'free',
    startNum: 96,
    entries: [
      'COMMUNITY DISMANTLED','COLONIZATION & ERASURE','SLAVERY & BODY-COMMODITY',
      'THE SYSTEM INDUSTRIALIZES','WORK AS WORTH','FOOD AS PRODUCT',
      'SHELTER AS PRODUCT','HEALING AS ENTERPRISE','ENERGY AS CONQUEST',
      'LABOR AS RESOURCE','THE BODY AS TRANSACTION','WAR AS ECONOMY'
    ]
  },
  {
    num: 10,
    titleLines: ['THE AGE OF', 'SUFFERING'],
    arc: 'free',
    startNum: 108,
    entries: [
      'NEED IS CRIMINALIZED','SUFFERING IS NORMALIZED','CONNECTION IS SOLD',
      'WORTH IS MEASURED','HOPE IS WEAPONIZED','MENTAL SUFFERING EXPLODES',
      'ADDICTION IS ARCHITECTURE','BURNOUT BADGE','ISOLATION WIDENS',
      'VIOLENCE INTERNALIZED','TERROR NORMALIZED','ECONOMY OF SUFFERING',
      'ECOLOGICAL AMNESIA'
    ]
  },
  {
    num: 11,
    titleLines: ['THE AGE OF', 'COMPUTATION'],
    arc: 'free',
    startNum: 121,
    entries: [
      'BIRTH OF THE CHIP','ALGORITHMIC SELF','SYNTHETIC IDENTITY',
      'FLESH AS DISTRACTION','SOCIAL MIRROR','DATA AS DESTINY',
      'REALITY SIMULATION','MACHINE WORSHIP','MONETIZED SEEKING',
      'AI ALTAR','DIGITAL MIRROR'
    ]
  },
  {
    num: 12,
    titleLines: ['GLOBAL', 'DELUSION'],
    arc: 'free',
    startNum: 132,
    entries: [
      'INFORMATION OVERLOAD','MEANING UNRAVELS','LOSS OF FAITH',
      'BREAKDOWN OF BELIEF','CONSPIRACY FRAGMENTATION','PARTISAN POLARIZATION',
      'TERROR AS BELONGING','COLLECTIVE NUMBNESS','ADDICTION TO PAST',
      'ADDICTION TO FUTURE','WEIGHT OF SUFFERING','DESPERATE SEEKING'
    ]
  },

  // ── COLLAPSES (Parts XIII-XX) ─────────────────────────────────
  // startNum resets to 1 at Part XIII (Collapses are numbered 1-50)
  {
    num: 13,
    titleLines: ['THE GREAT', 'REMEMBERING'],
    arc: 'collapse',
    startNum: 1,
    entries: [
      'ECHOES OF THE ILLUSION','REMEMBERING ONENESS','THE ILLUSION COLLAPSES',
      'LIFTING THE FRAME','PRESENCE REMAINS'
    ]
  },
  {
    num: 14,
    titleLines: ['THE TURN', 'INWARD'],
    arc: 'collapse',
    startNum: 6,
    entries: [
      'LENS OF THE SELF','NO WATCHER','THE QUIET BENEATH THOUGHT',
      'RECOGNITION','THE GROUND OF BEING'
    ]
  },
  {
    num: 15,
    titleLines: ['RECOGNITION OF', 'THE SELF'],
    arc: 'collapse',
    startNum: 11,
    entries: [
      'LAYERS OF IDENTITY','THE EGO AS DEFENSE','THE MIND & THE NARRATOR',
      'EXPERIENCE WITHOUT ATTACHMENT','IDENTITY SOFTENS',
      'PRESENCE BEHIND THE SELF','SELF RECOGNITION'
    ]
  },
  {
    num: 16,
    titleLines: ['COLLAPSING THE', 'NARRATOR'],
    arc: 'collapse',
    startNum: 18,
    entries: [
      'THE VOICE THAT CLAIMS "I"','STORYTELLING AS SURVIVAL',
      'THE NARRATION LOOP','RELEASING THE GRIP',
      'THE QUIET BEHIND THE STORY','THE NARRATOR LOSES INTEREST'
    ]
  },
  {
    num: 17,
    titleLines: ['DISSOLUTION OF', 'PERCEPTION'],
    arc: 'collapse',
    startNum: 24,
    entries: [
      'THE ACT OF SEEING','SENSATION WITHOUT SEPARATION',
      'DISSOLVING THE OBSERVER','DIRECT EXPERIENCING',
      'NO DISTANCE LEFT','CLAIMING EXPERIENCE','DIRECT BEING'
    ]
  },
  {
    num: 18,
    titleLines: ['LIVING', 'PRESENCE'],
    arc: 'collapse',
    startNum: 31,
    entries: [
      'PRESENCE','THE WORLD AS IT IS','COMPASSION WITHOUT ATTACHMENT',
      'ACTION WITHOUT STORY','CHAOS & ORDER','FEAR REMAINS',
      'FULLY HUMAN, FULLY HERE'
    ]
  },
  {
    num: 19,
    titleLines: ['INFINITE', 'RECOGNITION'],
    arc: 'collapse',
    startNum: 38,
    entries: [
      'NO ARRIVAL','PRESENCE WITHOUT END','EVERY MOMENT COLLAPSES',
      'CYCLES OF REMEMBERING','RESTING AS RECOGNITION',
      'THE RHYTHM OF ONENESS'
    ]
  },
  {
    num: 20,
    titleLines: ['THE UNBROKEN', 'CIRCLE'],
    arc: 'collapse',
    startNum: 44,
    entries: [
      'NO BEGINNING, NO END','NOTHING EVER MISSING','ONENESS IS NOW',
      'THE ILLUSION REVEALS','REST IN BEING',
      'YOU WERE NEVER SEPARATE','AND NOW, WE BEGIN AGAIN'
    ]
  }
];

// ── HELPERS ───────────────────────────────────────────────────────
const pad2 = n => String(n).padStart(2, '0');
const pad3 = n => String(n).padStart(3, '0');

// ── PAGE GENERATOR ────────────────────────────────────────────────
function generatePage(part) {
  const roman    = ROMAN[part.num - 1];
  const isFree   = part.arc === 'free';
  const prefix   = isFree ? 'F' : 'C';
  const arcWord  = isFree ? 'FRACTURE'  : 'COLLAPSE';
  const arcPlur  = isFree ? 'FRACTURES' : 'COLLAPSES';
  const arcSub   = isFree
    ? 'Each Fracture is a mechanism, named precisely. Open one to see its Explainer, Short, and Static visual.'
    : 'Each Collapse is a dissolution, named precisely. These are gated -- complete the Fractures and use the email access link to unlock.';

  const count    = part.entries.length;
  const endNum   = part.startNum + count - 1;
  const titleFull = part.titleLines.join(' ');

  const prevPart = part.num > 1  ? PARTS[part.num - 2] : null;
  const nextPart = part.num < 20 ? PARTS[part.num]     : null;

  // Meta description (no em dashes)
  const metaDesc = `Part ${roman} of THE BOOK OF ONENESS by [MIRRØR]. ${titleFull}. ${arcPlur} ${part.startNum} to ${endNum}.`;

  // Hero title lines
  const titleHtml = part.titleLines
    .map(l => `        <span class="lf">${l}</span>`)
    .join('\n');

  // Fracture / Collapse cards (all UPCOMING for generated pages)
  const cards = part.entries.map((title, i) => {
    const globalNum = part.startNum + i;
    const numLabel  = `${prefix} · ${pad3(globalNum)}`;
    return `      <a class="fracture-card" href="#" aria-disabled="true">
        <div class="fracture-card__top"><span class="fracture-card__num">${numLabel}</span><span class="fracture-card__status"><span class="dot"></span>UPCOMING</span></div>
        <h3 class="fracture-card__title">${title}</h3>
        <div class="fracture-card__formats">
          <span class="fmt fmt--podcast">PODCAST</span><span class="fmt fmt--explainer">EXPLAINER</span><span class="fmt fmt--short">SHORT</span><span class="fmt fmt--static">STATIC</span></div>
        <span class="fracture-card__cta">SOON <span class="arr">&#x2192;</span></span>
      </a>`;
  }).join('\n');

  // Prev/next footer cells
  const prevHtml = prevPart
    ? `<a class="part-foot__link part-foot__link--prev" href="part-${pad2(prevPart.num)}.html">
        <span class="lbl">// PREV &middot; PART ${ROMAN[prevPart.num - 1]}</span>
        <span class="ttl">&#x2190; ${prevPart.titleLines.join(' ')}</span>
      </a>`
    : `<div></div>`;

  const nextHtml = nextPart
    ? `<a class="part-foot__link part-foot__link--next" href="part-${pad2(nextPart.num)}.html">
        <span class="lbl">// NEXT &middot; PART ${ROMAN[nextPart.num - 1]}</span>
        <span class="ttl">${nextPart.titleLines.join(' ')} &#x2192;</span>
      </a>`
    : `<div></div>`;

  // Section title: "Fractures" / "Collapses" with sentence-case leading char
  const sectionTitle = arcPlur.charAt(0) + arcPlur.slice(1).toLowerCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PART ${roman} &middot; ${titleFull} -- THE BOOK OF ONENESS</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="https://thebookofoneness.com/parts/part-${pad2(part.num)}.html">

<meta property="og:type" content="website">
<meta property="og:url" content="https://thebookofoneness.com/parts/part-${pad2(part.num)}.html">
<meta property="og:title" content="PART ${roman} &middot; ${titleFull} -- THE BOOK OF ONENESS">
<meta property="og:description" content="${metaDesc}">
<meta property="og:image" content="https://thebookofoneness.com/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PART ${roman} &middot; ${titleFull} -- THE BOOK OF ONENESS">
<meta name="twitter:description" content="${metaDesc}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "PART ${roman} · ${titleFull}",
  "description": "${metaDesc}",
  "url": "https://thebookofoneness.com/parts/part-${pad2(part.num)}.html",
  "isPartOf": {
    "@type": "Book",
    "name": "THE BOOK OF ONENESS",
    "author": { "@type": "Person", "name": "[MIRRØR]" },
    "publisher": { "@type": "Organization", "name": "MIRROR Publishing" }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thebookofoneness.com/" },
      { "@type": "ListItem", "position": 2, "name": "Explore", "item": "https://thebookofoneness.com/#explore" },
      { "@type": "ListItem", "position": 3, "name": "Part ${roman} · ${titleFull}", "item": "https://thebookofoneness.com/parts/part-${pad2(part.num)}.html" }
    ]
  }
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../part-page.css">
<link rel="stylesheet" href="../glossary-search.css">
</head>
<body data-screen-label="part-${pad2(part.num)}" data-arc="${part.arc}">

<nav class="nav">
  <div class="nav__inner">
    <a class="nav__brand" href="../index.html">THE BOOK OF ONENESS</a>
    <ul class="nav__links">
      <li><a href="../index.html#the-book">The Book</a></li>
      <li><a href="../index.html#listen">Listen</a></li>
      <li><a href="../index.html#watch">Watch</a></li>
      <li><a href="../index.html#explore" class="is-active">Explore</a></li>
      <li><a href="../index.html#glossary">Glossary</a></li>
      <li><a href="../index.html#about">About</a></li>
    </ul>
    <a class="nav__cta" href="../get-the-book">GET THE BOOK <svg class="arr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg></a>
  </div>
</nav>

<div class="crumbs">
  <div class="crumbs__inner">
    <div class="crumbs__trail">
      <a class="crumbs__back" href="../index.html#explore">
        <span class="arr" aria-hidden="true">&#x2190;</span> BACK TO EXPLORE
      </a>
      <span class="sep">/</span>
      <a href="../index.html">Home</a>
      <span class="sep">/</span>
      <a href="../index.html#explore">Explore</a>
      <span class="sep">/</span>
      <span class="active" aria-current="page">Part ${roman}</span>
    </div>
    <div class="crumbs__here">
      <span class="num">${roman} / XX</span>${arcPlur} &middot; ${part.startNum} &#x2013; ${endNum}
    </div>
  </div>
</div>

<header class="part-hero">
  <div class="container">
    <div class="part-hero__inner">
      <div class="part-hero__eyebrow">
        <span class="arc-dot"></span>
        // THE BOOK OF ONENESS &middot; <span class="mirror-lockup"><span class="brk">[</span>MIRR&#216;R<span class="brk">]</span></span>
      </div>
      <p class="part-hero__numeral">PART ${roman}</p>
      <h1 class="part-hero__title">
${titleHtml}
      </h1>
      <div class="part-hero__count">
        <span class="num">${count}</span>${arcPlur} &middot; ${prefix} ${part.startNum} &#x2013; ${endNum}
      </div>
    </div>
  </div>
</header>

<section class="section section--alt">
  <div class="container">
    <header class="section__head">
      <div class="eyebrow">
        <span class="slash">/</span><span class="num">${roman}</span><span>${arcWord} INDEX</span>
      </div>
      <h2 class="section__title">${sectionTitle} <span class="accent">${part.startNum} &#x2013; ${endNum}</span></h2>
      <p class="section__sub">${arcSub}</p>
    </header>
    <div class="fractures-grid">
${cards}
    </div>
  </div>
</section>

<section class="part-foot">
  <div class="container">
    <div class="part-foot__nav">
      ${prevHtml}
      ${nextHtml}
    </div>
  </div>
</section>

<footer class="footer" data-screen-label="part-footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <h3 class="footer__mark">THE BOOK OF ONENESS</h3>
        <p class="footer__byline">
          by <span class="brand-mirror"><span class="brk">[</span>MIRR&#216;R<span class="brk">]</span></span>&nbsp; <span class="brand-pub">&middot;&nbsp; Published by MIRROR Publishing</span>
        </p>
      </div>
      <div class="footer__col">
        <h6 class="footer__col-label">// Pages</h6>
        <ul>
          <li><a href="../index.html#the-book">The Book</a></li>
          <li><a href="../index.html#listen">Listen</a></li>
          <li><a href="../index.html#watch">Watch</a></li>
          <li><a href="../index.html#explore">Explore</a></li>
          <li><a href="../index.html#about">About</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h6 class="footer__col-label">// Channels</h6>
        <ul>
          <li><a href="https://youtube.com/@mirrortransmissions">YouTube</a></li>
          <li><a href="https://tiktok.com/@mirrortransmissions">TikTok</a></li>
          <li><a href="https://instagram.com/mirrortransmissions">Instagram</a></li>
          <li><a href="https://facebook.com/mirrortransmissions">Facebook</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h6 class="footer__col-label">// Get the book</h6>
        <ul>
          <li><a href="../get-the-book">All editions</a></li>
          <li><a href="../index.html#explore">Explore parts</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; MIRROR Publishing 2026 &nbsp;&middot;&nbsp; All rights reserved</span>
      <a class="footer__cta" href="../get-the-book">GET THE BOOK <svg class="arr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg></a>
    </div>
  </div>
</footer>

<script src="../glossary-data.js"></script>
<script src="../glossary-search.js"></script>

</body>
</html>`;
}

// ── MAIN ──────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'parts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Generate parts 02-20 only (part-01.html exists and is not touched)
const toGenerate = PARTS.filter(p => p.num >= 2);

let written = 0;
for (const part of toGenerate) {
  const filename = `part-${pad2(part.num)}.html`;
  const filepath = path.join(outDir, filename);
  const html     = generatePage(part);
  fs.writeFileSync(filepath, html, 'utf8');
  const roman = ROMAN[part.num - 1];
  const count = part.entries.length;
  const isFree = part.arc === 'free';
  console.log(`  wrote ${filename}  (Part ${roman}: ${count} ${isFree ? 'fractures' : 'collapses'})`);
  written++;
}

console.log(`\nDone. ${written} Part pages written to public/parts/`);
