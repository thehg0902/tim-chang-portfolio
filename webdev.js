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
      frames.forEach(function (f) { f.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      frames[niche].classList.add('active');
      dots[niche].classList.add('active');
      counter.textContent = String(niche + 1).padStart(2, '0') + ' / 0' + totalNiches;
      currentNiche = niche;
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
