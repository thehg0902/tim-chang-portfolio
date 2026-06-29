if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  // Hero video: intro at 0.5x then crossfade to loop
  var heroIntro = document.getElementById('heroIntro');
  var heroLoop = document.getElementById('heroLoop');
  if (heroIntro) heroIntro.playbackRate = 2.0;
  if (heroIntro && heroLoop) {
    // Start hero02 immediately but keep it hidden, so it's fully buffered and ready
    heroLoop.play().then(function () {
      heroLoop.pause();
      heroLoop.currentTime = 0;
    });
    heroIntro.addEventListener('timeupdate', function () {
      if (heroIntro.duration - heroIntro.currentTime < 0.5 && heroLoop.paused) {
        heroLoop.play();
        heroLoop.style.opacity = '1';
        heroIntro.style.opacity = '0';
      }
    });
  }

  // Hero reveal sequence
  setTimeout(function () {
    document.querySelector('.wd-hero-overlay').classList.add('dimmed');
    var reveals = document.querySelectorAll('.wd-reveal');
    reveals.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('visible'); }, i * 250);
    });
  }, 1000);

  // Pause video when scrub covers hero, show still image
  var heroStill = document.querySelector('.wd-hero-still');
  var heroCovered = false;
  function checkHeroCover() {
    var scrub = document.querySelector('.wd-scrub-wrapper');
    if (!scrub) return;
    var scrubTop = scrub.getBoundingClientRect().top;
    if (scrubTop <= 0 && !heroCovered) {
      heroCovered = true;
      if (heroLoop) heroLoop.pause();
      if (heroIntro) heroIntro.pause();
      if (heroStill) heroStill.style.opacity = '1';
    } else if (scrubTop > 0 && heroCovered) {
      heroCovered = false;
      if (heroLoop && !heroLoop.ended) heroLoop.play();
      if (heroStill) heroStill.style.opacity = '0';
    }
  }
  window.addEventListener('scroll', checkHeroCover, { passive: true });

  var wrapper = document.querySelector('.wd-scrub-wrapper');
  var frames = document.querySelectorAll('.wd-frame');
  var dots = document.querySelectorAll('.wd-dot');
  var counter = document.getElementById('wdCounter');
  var progressFill = document.getElementById('wdProgressFill');
  var totalNiches = frames.length;
  var currentNiche = -1;
  var ticking = false;

  // Preload scroll-scrub frames for niches that have them
  var nicheFrames = {};
  var nicheCanvases = {};
  frames.forEach(function (f, i) {
    var count = parseInt(f.dataset.frames, 10);
    if (!count) return;
    var path = f.dataset.framePath;
    var ext = f.dataset.frameExt;
    var canvas = f.querySelector('.wd-frame-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    nicheCanvases[i] = { canvas: canvas, ctx: ctx };
    nicheFrames[i] = [];
    for (var j = 1; j <= count; j++) {
      var img = new Image();
      img.src = path + String(j).padStart(4, '0') + ext;
      nicheFrames[i].push(img);
    }
    // Draw first frame when loaded
    nicheFrames[i][0].onload = function () {
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      f.querySelector('.wd-frame-bg').style.opacity = '0';
    };
  });

  var lastFrameIdx = {};

  frames[0].classList.add('active');
  currentNiche = 0;

  function update() {
    var rect = wrapper.getBoundingClientRect();
    var scrolled = -rect.top;
    var max = wrapper.offsetHeight - window.innerHeight;
    var p = Math.max(0, Math.min(1, scrolled / max));

    progressFill.style.width = (p * 100) + '%';

    var niche = Math.min(totalNiches - 1, Math.floor(p * totalNiches));

    if (niche !== currentNiche) {
      frames.forEach(function (f) { f.classList.remove('active'); f.classList.remove('prev'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      if (currentNiche >= 0) frames[currentNiche].classList.add('prev');
      frames[niche].classList.add('active');
      dots[niche].classList.add('active');
      counter.textContent = String(niche + 1).padStart(2, '0') + ' / 0' + totalNiches;
      currentNiche = niche;
    }

    // Reveal stacked text elements based on scroll progress within niche
    var nicheStart = niche / totalNiches;
    var nicheEnd = (niche + 1) / totalNiches;
    var nicheProgress = (p - nicheStart) / (nicheEnd - nicheStart);
    nicheProgress = Math.max(0, Math.min(1, nicheProgress));
    var revealEls = frames[niche].querySelectorAll('[data-reveal]');
    revealEls.forEach(function (el) {
      var threshold = parseFloat(el.dataset.reveal);
      if (nicheProgress >= threshold) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });

    // Draw scroll-scrub frame for active niche
    if (nicheFrames[niche]) {
      var frameCount = nicheFrames[niche].length;
      var fi = Math.min(frameCount - 1, Math.floor(nicheProgress * frameCount));
      if (fi !== lastFrameIdx[niche]) {
        lastFrameIdx[niche] = fi;
        var img = nicheFrames[niche][fi];
        var c = nicheCanvases[niche];
        if (img.complete && img.naturalWidth) {
          c.ctx.drawImage(img, 0, 0, c.canvas.width, c.canvas.height);
        }
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
})();
