# HANDOFF: thebookofoneness.com Website Updates
## Date: 2026-04-04
## Session: Cowork -- cool-optimistic-brahmagupta (continued from prior session)

---

## WHAT WAS ACCOMPLISHED

### 1. Hero Section Overhaul
- Removed old book cover image from hero right side
- Replaced with full-bleed glitch background image (`THE BOOK OF ONENESS Book Cover Background Image.png`)
- Dark-to-transparent gradient overlay (left to right) so white text reads clearly on left
- Hero text sits on left half, image fills entire background

### 2. New Edition Cover Images
- All four edition covers replaced with new glitch-style designs
- Files in `mirror/oneness-website/public/img/`:
  - `THE_BOOK_OF_ONENESS_Book_Cover_DAY_EDITION=NEW DESIGN.png`
  - `THE_BOOK_OF_ONENESS_Book_Cover_NIGHT_EDITION=NEW DESIGN.png`
  - `THE_BOOK_OF_ONENESS_Book_Cover_EBOOK_EDITION=NEW DESIGN.png`
  - `THE_BOOK_OF_ONENESS_Book_Cover_AUDIOBOOK_EDITION=NEW DESIGN.png`

### 3. Signal Ticker Bar
- BBC-style scrolling ticker between nav and hero
- Fixed position, 32px tall, pink background (#FF5785), black text
- 5 hardcoded transmission excerpts, infinite CSS scroll animation
- Pauses on hover, links to #signal-posts
- JS duplicates content for seamless loop (in site.js)
- CSS: `.ticker` at `top: 60px` (below 60px nav), `z-index: 99`
- Hero padding adjusted to `112px` top (60px nav + 32px ticker + 20px buffer)

### 4. Enhanced Glitch Effects (fracture.js v4)
- Complete rewrite of fracture.js with aggressive hero image glitch effects:
  - Persistent RGB drift (continuous subtle color fringe)
  - Chromatic split flash (red/cyan ghost layers every 3-8s)
  - Horizontal slice displacement (bands shift sideways every 2-6s)
  - Scan line sweep (cyan/red lines every 1.5-5.5s)
  - Full image jolt (translate + hue-rotate every 4-10s)
  - Parallax drift on scroll

### 5. Edition Card Modals (LATEST)
- Click any edition card to open a modal popup
- Modal shows: book cover image (left), edition info + "GET THIS EDITION" button (right)
- Each edition gets its accent color (gold/teal/pink/green) on title and border
- Close via X button, backdrop click, or Escape key
- Responsive: stacks vertically on mobile (<600px)
- All editions link to: `https://books2read.com/thebookofoneness`
- HTML: modal markup added before closing `</body>` in index.html
- CSS: `.modal-overlay`, `.modal`, `.modal__*` styles in site.css after edition styles
- JS: click handlers in site.js using `data-edition` attributes on cards
- Edition data map in JS maps each key to its cover image URL

### 6. Netlify CLI Deployment
- Configured personal access token ("Cowork Deploy") in `~/.zshrc` as `NETLIFY_AUTH_TOKEN`
- All deploys via Desktop Commander, no drag-and-drop
- Deploy command: `export NETLIFY_AUTH_TOKEN="$NETLIFY_AUTH_TOKEN" && cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/mirror/oneness-website/public" && npx netlify deploy --prod --dir=. --site=9c504ac7-3cc9-4c0b-94b0-e2990b59a21d`
- Site ID: `9c504ac7-3cc9-4c0b-94b0-e2990b59a21d`
- Deploy folder: `mirror/oneness-website/public`

---

## CURRENT STATE OF FILES

### index.html
- Nav (60px fixed) -> Ticker (32px fixed, top:60px) -> Hero (full-bleed bg image + gradient + text left) -> Editions (4 cards with data-edition attrs) -> Signal posts -> About -> Footer
- Modal HTML at bottom before scripts
- og:image set to Day Edition new design

### css/site.css
- Variables: --day, --night, --ebook, --audio for edition colors
- Ticker styles (fixed, pink bg, infinite scroll animation)
- Hero image styles (absolute fill, gradient overlay, parallax-ready)
- Edition card styles with cursor:pointer
- Modal styles (.modal-overlay, .modal, .modal__cover, .modal__info, responsive breakpoint at 600px)
- Color accent classes: .modal--day, .modal--night, .modal--ebook, .modal--audio

### js/site.js
- Ticker content duplication for seamless loop
- Edition modal: open/close handlers, edition data map with cover image paths
- Smooth scroll for anchor links

### js/fracture.js (v4)
- All glitch effects target `.hero__image-src`
- Five effect types running on independent random timers
- Parallax on scroll

---

## PENDING / NEXT STEPS

1. **Newsletter/Supabase integration** -- Wire Buttondown API subscriber count into Supabase and ops dashboard. Handoff doc at `mirror/HANDOFF_NEWSLETTER_TICKER_INTEGRATION.md`.

2. **Live ticker from Supabase** -- Replace hardcoded ticker items with dynamic data from the transmissions table.

3. **SEO / individual Signal post pages** -- Each Signal post needs its own URL, structured data, and meta tags for discoverability.

4. **OG image** -- Currently points to Day Edition cover. May want a dedicated social sharing image.

5. **Audiobook edition** -- Price still shows "Coming Soon". Update when pricing is set.

---

## SESSION PROMPT FOR SUCCESSOR

```
Read the master brain at Claude-Workspace/CLAUDE.md first, then the Mirror project brain at mirror/CLAUDE.md. Read the handoff doc at mirror/oneness-website/HANDOFF_2026-04-04_WEBSITE_UPDATES.md for full context on recent website work. The site is live at thebookofoneness.com. Deploy folder is mirror/oneness-website/public. Deploy via Desktop Commander CLI (never drag-and-drop). All file paths and current state are in the handoff.
```

---

## KNOWN ISSUES / GOTCHAS

- Image filenames have spaces and equals signs -- always URL-encode in HTML (`%20` for space, `%3D` for =)
- The `_redirects` file warning on deploy is harmless (it's in the repo root, not in public/)
- Cowork sandbox cannot reach external DNS -- use Desktop Commander `start_process` for Netlify deploys
- Home directory is `/Users/bodhivalentine` (NOT `/Users/bodhi`)
