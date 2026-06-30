if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  // ===== HELPERS =====
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ===== ELEMENTS =====
  var pills = document.querySelectorAll('.mk-pill');
  var fwTexts = document.querySelectorAll('.mk-fw-text');
  var stage = document.getElementById('mkStage');
  var stageWrap = document.querySelector('.mk-stage-wrap');
  var fwStrip = document.getElementById('mkFwStrip');
  var puppet = document.getElementById('mkPuppet');
  var target = document.getElementById('mkTarget');
  var spotlight = document.getElementById('mkSpotlight');
  var actLabels = [
    document.getElementById('mkAct1'),
    document.getElementById('mkAct2'),
    document.getElementById('mkAct3'),
    document.getElementById('mkAct4'),
    document.getElementById('mkAct5')
  ];
  var stripDIC = document.getElementById('mkStripDIC');
  var stripPAS = document.getElementById('mkStripPAS');
  var stripHSO = document.getElementById('mkStripHSO');
  var resultCards = document.querySelectorAll('.mk-result-card');
  var contact = document.querySelector('.mk-contact');

  // ===== PILL STAGGER =====
  setTimeout(function () {
    pills.forEach(function (pill, i) {
      setTimeout(function () { pill.classList.add('visible'); }, i * 150);
    });
  }, 600);

  // ===== SCROLL ENGINE =====
  var ticking = false;

  function getProgress(el) {
    var rect = el.getBoundingClientRect();
    var top = window.scrollY + rect.top;
    var height = el.offsetHeight;
    var scrollIn = window.scrollY - top;
    var maxScroll = height - window.innerHeight;
    return clamp(scrollIn / maxScroll, 0, 1);
  }

  // ===== PUPPET SHOW — Five acts =====
  // Maps scroll progress (0–1) to puppet state
  function updatePuppet(p) {
    var armL = puppet.querySelector('.mk-puppet-arm-l');
    var armR = puppet.querySelector('.mk-puppet-arm-r');
    var legL = puppet.querySelector('.mk-puppet-leg-l');
    var legR = puppet.querySelector('.mk-puppet-leg-r');

    // Act 1 (0–0.2): Stranger — walks in from left
    // Act 2 (0.2–0.4): Aware — stops, something catches attention
    // Act 3 (0.4–0.6): Interested — leans in, curious
    // Act 4 (0.6–0.8): Desire — reaches toward target
    // Act 5 (0.8–1.0): Buyer — arrives at target, celebrates

    var puppetX, puppetScale, armLRot, armRRot, legLRot, legRRot, targetOpacity;

    if (p < 0.2) {
      // Act 1 — walk in from far left
      var t = p / 0.2;
      puppetX = -10 + t * 25;
      puppetScale = 0.8 + t * 0.2;
      armLRot = -5 + Math.sin(t * Math.PI * 4) * 15;
      armRRot = 5 - Math.sin(t * Math.PI * 4) * 15;
      legLRot = Math.sin(t * Math.PI * 4) * 12;
      legRRot = -Math.sin(t * Math.PI * 4) * 12;
      targetOpacity = 0;
    } else if (p < 0.4) {
      // Act 2 — stops, notices something
      var t = (p - 0.2) / 0.2;
      puppetX = 15 + t * 10;
      puppetScale = 1;
      armLRot = -5;
      armRRot = 5 + t * 20;
      legLRot = 0;
      legRRot = 0;
      targetOpacity = t * 0.5;
    } else if (p < 0.6) {
      // Act 3 — leans in, curious
      var t = (p - 0.4) / 0.2;
      puppetX = 25 + t * 15;
      puppetScale = 1 + t * 0.1;
      armLRot = -5 + t * -15;
      armRRot = 25 + t * 10;
      legLRot = t * 5;
      legRRot = t * -5;
      targetOpacity = 0.5 + t * 0.3;
    } else if (p < 0.8) {
      // Act 4 — reaches toward target
      var t = (p - 0.6) / 0.2;
      puppetX = 40 + t * 15;
      puppetScale = 1.1;
      armLRot = -20;
      armRRot = 35 + t * 40;
      legLRot = 5 + t * 5;
      legRRot = -5 - t * 5;
      targetOpacity = 0.8 + t * 0.2;
    } else {
      // Act 5 — arrives, celebrates
      var t = (p - 0.8) / 0.2;
      puppetX = 55 + t * 5;
      puppetScale = 1.1 + t * 0.15;
      armLRot = -20 - t * 50;
      armRRot = 75 - t * 30;
      legLRot = 10;
      legRRot = -10;
      targetOpacity = 1;
    }

    puppet.style.left = puppetX + '%';
    puppet.style.transform = 'scale(' + puppetScale + ')';
    armL.style.transform = 'rotate(' + armLRot + 'deg)';
    armR.style.transform = 'rotate(' + armRRot + 'deg)';
    legL.style.transform = 'rotate(' + legLRot + 'deg)';
    legR.style.transform = 'rotate(' + legRRot + 'deg)';
    target.style.opacity = targetOpacity;

    // Spotlight follows puppet
    spotlight.style.left = (puppetX + 5) + '%';

    // Act labels — show one at a time
    var actIndex;
    if (p < 0.2) actIndex = 0;
    else if (p < 0.4) actIndex = 1;
    else if (p < 0.6) actIndex = 2;
    else if (p < 0.8) actIndex = 3;
    else actIndex = 4;

    actLabels.forEach(function (label, i) {
      if (i === actIndex) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });

    // Framework strip — DIC at acts 1-2, PAS at 2-4, HSO at 3-5
    stripDIC.classList.toggle('active', p < 0.4);
    stripPAS.classList.toggle('active', p >= 0.2 && p < 0.8);
    stripHSO.classList.toggle('active', p >= 0.4);
  }

  // ===== SCROLL UPDATE =====
  function onScroll() {
    // Framework text reveal
    fwTexts.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) {
        el.classList.add('visible');
      }
    });

    // Journey stage visibility and animation
    var wrapRect = stageWrap.getBoundingClientRect();
    var inStageZone = wrapRect.top <= 0 && wrapRect.bottom > window.innerHeight;

    if (inStageZone) {
      stage.classList.add('active');
      fwStrip.classList.add('active');
      var p = getProgress(stageWrap);
      updatePuppet(p);
    } else {
      stage.classList.remove('active');
      fwStrip.classList.remove('active');
    }

    // Result cards reveal
    resultCards.forEach(function (card, i) {
      var rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        setTimeout(function () { card.classList.add('visible'); }, i * 120);
      }
    });

    // Contact reveal
    if (contact) {
      var cRect = contact.getBoundingClientRect();
      if (cRect.top < window.innerHeight * 0.8) {
        contact.classList.add('visible');
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  // Initial check
  requestAnimationFrame(onScroll);

})();
