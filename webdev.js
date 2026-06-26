(function () {
  'use strict';

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
