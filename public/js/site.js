/* ===============================================
   THE BOOK OF ONENESS
   JS: Grain, scroll reveals, HARD glitch system
   =============================================== */

(function () {
  'use strict';

  // --- YEAR ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- MOBILE NAV ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }

  // --- FILM GRAIN (lower resolution for performance) ---
  const canvas = document.getElementById('grain');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const scale = 0.25; // render at 25% then scale up for grainy look
    let w, h;

    function resize() {
      w = canvas.width = Math.ceil(window.innerWidth * scale);
      h = canvas.height = Math.ceil(window.innerHeight * scale);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.imageSmoothingEnabled = false;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawGrain() {
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(drawGrain);
    }
    drawGrain();
  }

  // --- SCROLL REVEAL ---
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Array.from(reveals).indexOf(entry.target) % 3;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });
    reveals.forEach(el => observer.observe(el));
  }

  // --- NAV SCROLL ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 100
      ? 'rgba(10, 10, 10, 0.92)'
      : 'rgba(10, 10, 10, 0.7)';
  }, { passive: true });

  // ==================================================
  // HARD GLITCH SYSTEM
  // This is not decoration. This is structural failure.
  // ==================================================

  const titleLines = document.querySelectorAll('.hero__title-line');
  const hero = document.querySelector('.hero');

  if (titleLines.length && hero) {

    // --- PERSISTENT CHROMATIC ABERRATION on title ---
    // Always-on subtle RGB split
    titleLines.forEach(line => {
      line.style.textShadow = '2px 0 rgba(0,240,255,0.12), -2px 0 rgba(255,0,64,0.08)';
    });

    // --- HARD GLITCH: periodic structural break ---
    function hardGlitch() {
      // Pick 1-3 lines to displace
      const count = 1 + Math.floor(Math.random() * 2);
      const affected = [];

      for (let i = 0; i < count; i++) {
        const line = titleLines[Math.floor(Math.random() * titleLines.length)];
        const dx = (Math.random() - 0.5) * 12; // stronger displacement
        const skew = (Math.random() - 0.5) * 2;

        line.style.transform = `translateX(${dx}px) skewX(${skew}deg)`;
        line.style.textShadow = `${dx * 1.5}px 0 rgba(0,240,255,0.4), ${-dx * 1.5}px 0 rgba(255,0,64,0.3)`;
        line.style.clipPath = Math.random() > 0.5
          ? `inset(${Math.random() * 10}% 0 ${Math.random() * 10}% 0)`
          : 'none';
        affected.push(line);
      }

      // Flash a horizontal glitch bar
      const bar = document.createElement('div');
      bar.style.cssText = `
        position:absolute; left:0; right:0; z-index:10; pointer-events:none;
        height:${2 + Math.random() * 4}px;
        top:${10 + Math.random() * 80}%;
        background: linear-gradient(90deg, transparent, rgba(0,240,255,0.3) 20%, rgba(255,0,64,0.2) 80%, transparent);
        mix-blend-mode: screen;
      `;
      hero.appendChild(bar);

      // Resolve after brief flash
      const duration = 60 + Math.random() * 100;
      setTimeout(() => {
        affected.forEach(line => {
          line.style.transform = '';
          line.style.textShadow = '2px 0 rgba(0,240,255,0.12), -2px 0 rgba(255,0,64,0.08)';
          line.style.clipPath = 'none';
        });
        bar.remove();
      }, duration);

      // Sometimes do a rapid double-glitch
      if (Math.random() > 0.6) {
        setTimeout(() => {
          const line2 = titleLines[Math.floor(Math.random() * titleLines.length)];
          const dx2 = (Math.random() - 0.5) * 8;
          line2.style.transform = `translateX(${dx2}px)`;
          line2.style.textShadow = `${dx2 * 2}px 0 rgba(0,240,255,0.5), ${-dx2 * 2}px 0 rgba(255,0,64,0.35)`;
          setTimeout(() => {
            line2.style.transform = '';
            line2.style.textShadow = '2px 0 rgba(0,240,255,0.12), -2px 0 rgba(255,0,64,0.08)';
          }, 50);
        }, duration + 40);
      }

      // Next glitch: 2-6 seconds
      setTimeout(hardGlitch, 2000 + Math.random() * 4000);
    }

    // Start after title animation completes
    setTimeout(hardGlitch, 2000);

  }

  // --- SECTION GLITCH: subtle displacement on scroll for section labels ---
  const sectionLabels = document.querySelectorAll('.section-label');
  if (sectionLabels.length) {
    function sectionGlitch() {
      const label = sectionLabels[Math.floor(Math.random() * sectionLabels.length)];
      // Check if in viewport
      const rect = label.getBoundingClientRect();
      if (rect.top > 0 && rect.bottom < window.innerHeight) {
        const dx = (Math.random() - 0.5) * 6;
        label.style.textShadow = `${dx}px 0 rgba(0,240,255,0.35), ${-dx}px 0 rgba(255,0,64,0.25)`;
        label.style.transform = `translateX(${dx * 0.5}px)`;
        setTimeout(() => {
          label.style.textShadow = '';
          label.style.transform = '';
        }, 70);
      }
      setTimeout(sectionGlitch, 4000 + Math.random() * 6000);
    }
    setTimeout(sectionGlitch, 5000);
  }

  // --- GLOBAL INTERFERENCE PULSE ---
  const interference = document.getElementById('interference');
  if (interference) {
    function fireInterference() {
      interference.classList.add('active');
      setTimeout(() => interference.classList.remove('active'), 200);
      setTimeout(fireInterference, 5000 + Math.random() * 10000);
    }
    setTimeout(fireInterference, 6000);
  }

  // --- SCROLL-TRIGGERED DISTORTION on section entries ---
  const distortTargets = document.querySelectorAll('.section-label, .entry__card-title, .book__edition-title, .about__block h3, .transmission__title');
  if (distortTargets.length) {
    const distortObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Fire a quick distort when element enters viewport
          entry.target.classList.add('distort-active');
          setTimeout(() => entry.target.classList.remove('distort-active'), 200);
          distortObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    distortTargets.forEach(el => distortObserver.observe(el));
  }

  // --- SIGNAL TICKER: live fetch from Supabase, fallback to static HTML ---
  (async function initTicker() {
    const tickerTrack = document.getElementById('tickerTrack');
    if (!tickerTrack) return;

    const SB_URL = 'https://pobddtmnzimcdiaujyyf.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYmRkdG1uemltY2RpYXVqeXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzU3OTUsImV4cCI6MjA4OTg1MTc5NX0.WuIrn9nOMLqJXL5kou8MyOb4yO6pCEa3QvfqoO3hnls';

    function buildAndLoop(posts) {
      const label = '<span class="ticker__label">THE SIGNAL</span>';
      const items = posts.map((p, i) => {
        // Trim cultural hook to a punchy opener (first 12 words)
        const hookWords = (p.cultural_hook || '').replace(/\n/g, ' ').split(' ');
        const hook = hookWords.slice(0, 12).join(' ') + (hookWords.length > 12 ? '...' : '');
        const sep = '<span class="ticker__sep">//</span>';
        return `<a href="${p.blog_published_url}" class="ticker__item">${p.title} -- ${hook}</a>${sep}`;
      }).join('');

      const content = label + items;
      // Duplicate for seamless infinite scroll
      tickerTrack.innerHTML = content + content;
    }

    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/transmissions?status=eq.approved&website_published=eq.true&order=id.desc&limit=8&select=title,blog_published_url,cultural_hook`,
        { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } }
      );
      if (!res.ok) throw new Error('fetch failed');
      const posts = await res.json();
      if (posts && posts.length) {
        buildAndLoop(posts);
        return;
      }
    } catch (e) {
      // Fall through to static content
    }

    // Fallback: static content already in HTML -- just duplicate for loop
    const staticContent = tickerTrack.innerHTML;
    tickerTrack.innerHTML = staticContent + staticContent;
  })();

  // --- EDITION MODAL ---
  const modal = document.getElementById('editionModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalFormat = document.getElementById('modalFormat');
  const modalCoverImg = document.getElementById('modalCoverImg');

  const editionData = {
    day: {
      title: 'DAY EDITION',
      cover: '/img/THE_BOOK_OF_ONENESS_Book_Cover_DAY_EDITION%3DNEW%20DESIGN.png'
    },
    night: {
      title: 'NIGHT EDITION',
      cover: '/img/THE_BOOK_OF_ONENESS_Book_Cover_NIGHT_EDITION%3DNEW%20DESIGN.png'
    },
    ebook: {
      title: 'EBOOK EDITION',
      cover: '/img/THE_BOOK_OF_ONENESS_Book_Cover_EBOOK_EDITION%3DNEW%20DESIGN.png'
    },
    audio: {
      title: 'AUDIOBOOK EDITION',
      cover: '/img/THE_BOOK_OF_ONENESS_Book_Cover_AUDIOBOOK_EDITION%3DNEW%20DESIGN.png'
    }
  };

  if (modal) {
    // Open modal on edition card click
    document.querySelectorAll('[data-edition]').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.edition;
        const data = editionData[key];
        if (!data) return;

        // Pull text from the card itself
        const descEl = card.querySelector('.book__edition-desc');
        const priceEl = card.querySelector('.book__edition-price');
        const formatEl = card.querySelector('.book__edition-format');

        modalTitle.textContent = data.title;
        modalDesc.textContent = descEl ? descEl.textContent : '';
        modalPrice.innerHTML = priceEl ? priceEl.innerHTML : '';
        modalFormat.textContent = formatEl ? formatEl.textContent : '';
        modalCoverImg.src = data.cover;
        modalCoverImg.alt = data.title + ' cover';

        // Set color accent class
        modal.className = 'modal-overlay modal--' + key;
        // Small delay so the transition fires
        requestAnimationFrame(() => {
          modal.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        modalCoverImg.src = '';
      }, 350);
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  // --- SMOOTH SCROLL ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
