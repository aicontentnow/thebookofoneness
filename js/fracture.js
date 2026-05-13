/* ===============================================
   THE BOOK OF ONENESS -- FRACTURE ENGINE v4
   Aggressive glitch on hero image.
   Chromatic splits, slice displacement, RGB drift.
   =============================================== */

(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero__image-src');
  var heroImageWrap = document.querySelector('.hero__image');
  if (!hero || !heroImg || !heroImageWrap) return;

  // --- PERSISTENT RGB DRIFT on the image ---
  // Always-on subtle chromatic aberration via CSS filter + transform
  var driftPhase = 0;
  function rgbDrift() {
    driftPhase += 0.008;
    var dx = Math.sin(driftPhase) * 1.5;
    var dy = Math.cos(driftPhase * 0.7) * 0.8;
    heroImg.style.filter = 'saturate(1.1) brightness(1.02)';
    heroImg.style.textShadow = 'none';
    // Use box-shadow trick on the wrapper for a subtle color fringe
    heroImageWrap.style.boxShadow =
      dx + 'px ' + dy + 'px 0 rgba(0,240,255,0.06), ' +
      (-dx) + 'px ' + (-dy) + 'px 0 rgba(255,0,64,0.04)';
    requestAnimationFrame(rgbDrift);
  }

  // --- CHROMATIC SPLIT FLASH ---
  // Creates actual offset color layers over the image
  function chromaSplit() {
    var intensity = 3 + Math.random() * 6;
    var duration = 60 + Math.random() * 100;

    // Red channel ghost
    var ghostR = document.createElement('div');
    ghostR.style.cssText =
      'position:absolute;inset:0;z-index:0;pointer-events:none;' +
      'background:inherit;opacity:0;mix-blend-mode:screen;' +
      'transition:none;';
    heroImageWrap.appendChild(ghostR);

    // Cyan channel ghost
    var ghostC = document.createElement('div');
    ghostC.style.cssText = ghostR.style.cssText;
    heroImageWrap.appendChild(ghostC);

    requestAnimationFrame(function () {
      ghostR.style.opacity = '0.2';
      ghostR.style.transform = 'translate(' + intensity + 'px, ' + (intensity * 0.3) + 'px)';
      ghostR.style.background = 'linear-gradient(90deg, rgba(255,0,64,0.15), transparent 40%, rgba(255,0,64,0.1))';

      ghostC.style.opacity = '0.2';
      ghostC.style.transform = 'translate(' + (-intensity) + 'px, ' + (-intensity * 0.2) + 'px)';
      ghostC.style.background = 'linear-gradient(90deg, transparent 60%, rgba(0,240,255,0.12), rgba(0,240,255,0.15))';
    });

    setTimeout(function () {
      ghostR.style.transition = 'opacity 0.15s';
      ghostC.style.transition = 'opacity 0.15s';
      ghostR.style.opacity = '0';
      ghostC.style.opacity = '0';
      setTimeout(function () {
        ghostR.remove();
        ghostC.remove();
      }, 200);
    }, duration);

    setTimeout(chromaSplit, 3000 + Math.random() * 5000);
  }

  // --- HORIZONTAL SLICE DISPLACEMENT ---
  // Clips a horizontal band of the image and offsets it
  function sliceGlitch() {
    var sliceCount = 1 + Math.floor(Math.random() * 3);

    for (var i = 0; i < sliceCount; i++) {
      (function (index) {
        var slice = document.createElement('div');
        var top = 5 + Math.random() * 85;
        var height = 2 + Math.random() * 8;
        var dx = (Math.random() - 0.5) * 20;
        var delay = index * 30;

        slice.style.cssText =
          'position:absolute;left:0;right:0;z-index:2;pointer-events:none;overflow:hidden;' +
          'top:' + top + '%;height:' + height + 'px;' +
          'background:inherit;' +
          'transform:translateX(' + dx + 'px);' +
          'opacity:0;';

        // Fill with a color-shifted version
        var inner = document.createElement('div');
        inner.style.cssText =
          'position:absolute;inset:0;' +
          'background:linear-gradient(90deg, ' +
          'rgba(0,240,255,' + (0.1 + Math.random() * 0.15) + '), ' +
          'rgba(255,0,64,' + (0.05 + Math.random() * 0.1) + '), ' +
          'transparent);' +
          'mix-blend-mode:screen;';
        slice.appendChild(inner);

        heroImageWrap.appendChild(slice);

        setTimeout(function () {
          slice.style.opacity = '1';
        }, delay);

        setTimeout(function () {
          slice.style.opacity = '0';
          setTimeout(function () { slice.remove(); }, 150);
        }, delay + 50 + Math.random() * 80);
      })(i);
    }

    setTimeout(sliceGlitch, 2000 + Math.random() * 4000);
  }

  // --- SCAN LINE SWEEP ---
  function scanLine() {
    var line = document.createElement('div');
    var y = 5 + Math.random() * 90;
    var isCyan = Math.random() > 0.4;
    var color = isCyan ? 'rgba(0,240,255,0.08)' : 'rgba(255,0,64,0.06)';
    var h = 1 + Math.random() * 2;

    line.style.cssText =
      'position:absolute;left:0;right:0;z-index:3;pointer-events:none;' +
      'height:' + h + 'px;top:' + y + '%;' +
      'background:' + color + ';opacity:0;';
    hero.appendChild(line);

    requestAnimationFrame(function () { line.style.opacity = '1'; });
    setTimeout(function () {
      line.style.transition = 'opacity 0.2s';
      line.style.opacity = '0';
      setTimeout(function () { line.remove(); }, 300);
    }, 60 + Math.random() * 100);

    setTimeout(scanLine, 1500 + Math.random() * 4000);
  }

  // --- FULL IMAGE JOLT ---
  // Occasionally shifts the entire hero image briefly
  function imageJolt() {
    var dx = (Math.random() - 0.5) * 6;
    var dy = (Math.random() - 0.5) * 3;

    heroImg.style.transition = 'none';
    heroImg.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.03)';
    heroImg.style.filter = 'saturate(1.4) brightness(1.08) hue-rotate(' + (Math.random() * 10 - 5) + 'deg)';

    setTimeout(function () {
      heroImg.style.transition = 'transform 0.4s ease-out, filter 0.4s ease-out';
      heroImg.style.transform = 'scale(1.03)';
      heroImg.style.filter = 'saturate(1.1) brightness(1.02)';
    }, 80);

    // Sometimes double-jolt
    if (Math.random() > 0.6) {
      setTimeout(function () {
        var dx2 = (Math.random() - 0.5) * 4;
        heroImg.style.transition = 'none';
        heroImg.style.transform = 'translateX(' + dx2 + 'px) scale(1.03)';
        setTimeout(function () {
          heroImg.style.transition = 'transform 0.3s ease-out';
          heroImg.style.transform = 'scale(1.03)';
        }, 50);
      }, 150);
    }

    setTimeout(imageJolt, 4000 + Math.random() * 6000);
  }

  // --- PARALLAX DRIFT on scroll ---
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        var scrolled = window.pageYOffset;
        var heroHeight = hero.offsetHeight;
        if (scrolled < heroHeight) {
          var shift = scrolled * 0.12;
          heroImg.style.transform = 'translateY(' + shift + 'px) scale(1.03)';
        }
        ticking = false;
      });
    }
  }, { passive: true });

  // --- INIT ---
  function init() {
    requestAnimationFrame(rgbDrift);
    setTimeout(chromaSplit, 2000);
    setTimeout(sliceGlitch, 3000);
    setTimeout(scanLine, 2500);
    setTimeout(imageJolt, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
