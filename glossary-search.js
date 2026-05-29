/* =============================================================
   GLOBAL SEARCH CONTROLLER
   =============================================================
   Loaded on every page after glossary-data.js. Responsibilities:
     1. Inject a magnifying-glass icon button into the nav (before
        the GET THE BOOK CTA) — this is the visible affordance.
     2. Inject the fullscreen .search-overlay markup at the end of
        body.
     3. Wire open/close (click icon, ⌘K, ESC, click backdrop).
     4. Live-search window.GLOSSARY.TERMS on input.
     5. On Enter → navigate to the dedicated search results page.
     6. On click result → navigate to that term page.

   Relative URL math: term and search pages live in /glossary/. We
   inspect window.location.pathname to figure out whether to prefix
   "glossary/", "../glossary/", or stay in the current dir.
   ============================================================= */
(function () {
  if (!window.GLOSSARY) {
    console.warn('[glossary-search] glossary-data.js not loaded — overlay disabled');
    return;
  }
  const { BUCKETS, BUCKET_BY_ID, TERMS_BY_BUCKET } = window.GLOSSARY;

  // ---- URL prefix ---------------------------------------------------
  // We're either at:
  //   /                          → glossary/<slug>.html
  //   /index.html                → glossary/<slug>.html
  //   /glossary/...              → <slug>.html (same dir)
  //   /parts/...                 → ../glossary/<slug>.html
  // Anything else falls back to root-relative.
  const path = window.location.pathname.toLowerCase();
  let prefix;
  if (path.indexOf('/glossary/') !== -1) prefix = '';
  else if (path.indexOf('/parts/') !== -1) prefix = '../glossary/';
  else prefix = 'glossary/';

  function termUrl(term) {
    return prefix + (term.dup || term.slug) + '.html';
  }
  function searchPageUrl(q) {
    return prefix + 'search.html?q=' + encodeURIComponent(q);
  }

  // ---- Inject the icon button into the nav ----
  const nav = document.querySelector('.nav__inner');
  if (nav) {
    // If a button already exists (server-rendered), skip.
    if (!nav.querySelector('.nav__search-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav__search-btn';
      btn.setAttribute('aria-label', 'Open search');
      btn.setAttribute('data-search-trigger', '');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<circle cx="11" cy="11" r="7"/>' +
          '<line x1="20" y1="20" x2="16.65" y2="16.65"/>' +
        '</svg>';
      const cta = nav.querySelector('.nav__cta');
      if (cta) cta.before(btn);
      else nav.appendChild(btn);
    }
  }

  // ---- Inject the overlay ----
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.id = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Search the glossary');
  overlay.innerHTML =
    '<div class="search-overlay__backdrop" data-search-close></div>' +
    '<div class="search-overlay__panel" role="document">' +
      '<div class="search-overlay__head">' +
        '<span class="search-overlay__eyebrow"><span class="slash">//</span>SEARCH THE GLOSSARY</span>' +
        '<button type="button" class="search-overlay__close" data-search-close aria-label="Close search">ESC</button>' +
      '</div>' +
      '<label class="search-overlay__input-row" for="search-overlay-input">' +
        '<svg class="search-overlay__glass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<circle cx="11" cy="11" r="7"/>' +
          '<line x1="20" y1="20" x2="16.65" y2="16.65"/>' +
        '</svg>' +
        '<input id="search-overlay-input" class="search-overlay__input" type="search" placeholder="Search terms, concepts, mechanisms…" autocomplete="off" spellcheck="false">' +
        '<span class="search-overlay__kbd" aria-hidden="true">⌘ K</span>' +
      '</label>' +
      '<div class="search-overlay__hint" id="search-overlay-hint">' +
        '<span><span class="slash">//</span>TYPE TO SEARCH</span>' +
        '<span class="sep">·</span>' +
        '<span>ENTER FOR FULL RESULTS</span>' +
        '<span class="sep">·</span>' +
        '<span>ESC TO CLOSE</span>' +
      '</div>' +
      '<div class="search-overlay__results" id="search-overlay-results"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#search-overlay-input');
  const results = overlay.querySelector('#search-overlay-results');
  const hint = overlay.querySelector('#search-overlay-hint');

  // ---- Empty-state suggestions: one jumpoff per bucket ----
  function renderSuggestions() {
    const chips = BUCKETS.map(function (b) {
      const sample = TERMS_BY_BUCKET[b.id] && TERMS_BY_BUCKET[b.id][0];
      if (!sample) return '';
      return '<a class="search-overlay__suggestion" href="' + termUrl(sample) + '">' +
        '<span class="num">' + b.number + '</span>' + b.name.toUpperCase() +
      '</a>';
    }).join('');
    results.innerHTML =
      '<p class="search-overlay__suggestions-eyebrow"><span class="slash">//</span>JUMP TO A BUCKET</p>' +
      '<div class="search-overlay__suggestions">' + chips + '</div>';
  }

  // ---- Highlight helper ----
  function escHtml(s) {
    return String(s).replace(/[<>&"]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
    });
  }
  function hi(text, q) {
    if (!q) return escHtml(text);
    const e = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escHtml(text).replace(new RegExp('(' + e + ')', 'gi'), '<mark>$1</mark>');
  }

  // ---- Render results for a query ----
  let currentHits = [];
  function renderResults(q) {
    currentHits = window.GLOSSARY.search(q);
    if (!currentHits.length) {
      results.innerHTML =
        '<div class="search-overlay__empty"><span class="slash">//</span>NO TERMS MATCH "' +
        escHtml(q) + '"</div>';
      return;
    }
    results.innerHTML = currentHits.map(function (t, i) {
      return '<a class="search-overlay__hit' + (i === 0 ? ' is-focused' : '') + '" href="' + termUrl(t) + '">' +
        '<span class="search-overlay__hit-bucket">// ' + BUCKET_BY_ID[t.bucket].name.toUpperCase() + '</span>' +
        '<span class="search-overlay__hit-name">' + hi(t.name, q) + '</span>' +
        '<span class="search-overlay__hit-arrow" aria-hidden="true">→</span>' +
      '</a>';
    }).join('');
  }

  function handleInput() {
    const q = input.value.trim();
    if (!q) {
      renderSuggestions();
    } else {
      renderResults(q);
    }
  }

  // ---- Open / close ----
  function open() {
    overlay.classList.add('is-open');
    document.body.classList.add('search-open');
    handleInput();
    // Defer focus so the animation can start.
    requestAnimationFrame(function () { input.focus(); input.select(); });
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('search-open');
    input.blur();
  }

  // ---- Wire events ----
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-trigger]')) {
      e.preventDefault();
      open();
      return;
    }
    if (e.target.closest('[data-search-close]')) {
      close();
      return;
    }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('is-open') ? close() : open();
      return;
    }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      close();
    }
  });
  input.addEventListener('input', handleInput);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      window.location.href = searchPageUrl(q);
    }
  });

  // Initial state: suggestions ready to go when first opened.
  renderSuggestions();
})();
