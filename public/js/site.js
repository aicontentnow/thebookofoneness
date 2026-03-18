/* ═══════════════════════════════════════════
   THE BOOK OF ONENESS
   JS: Grain, scroll reveals, ambient glitch
   ═══════════════════════════════════════════ */

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

  // --- FILM GRAIN ---
  const canvas = document.getElementById('grain');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
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
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger the reveals slightly
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

  // --- NAV SCROLL BEHAVIOR ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    if (st > 100) {
      nav.style.background = 'rgba(10, 10, 10, 0.92)';
    } else {
      nav.style.background = 'rgba(10, 10, 10, 0.7)';
    }
    lastScroll = st;
  }, { passive: true });

  // --- AMBIENT GLITCH ON TITLE (random displacement) ---
  const titleLines = document.querySelectorAll('.hero__title-line');
  if (titleLines.length) {
    function randomGlitch() {
      const line = titleLines[Math.floor(Math.random() * titleLines.length)];
      const dx = (Math.random() - 0.5) * 4;
      line.style.transform = `translateX(${dx}px)`;
      line.style.textShadow = `${dx}px 0 rgba(0,240,255,0.15), ${-dx}px 0 rgba(255,0,64,0.1)`;

      setTimeout(() => {
        line.style.transform = '';
        line.style.textShadow = '';
      }, 80 + Math.random() * 60);

      // Next glitch in 3-8 seconds
      setTimeout(randomGlitch, 3000 + Math.random() * 5000);
    }
    // Start after initial animation
    setTimeout(randomGlitch, 3000);
  }

  // --- SMOOTH SCROLL for anchor links ---
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
