(function () {
  'use strict';

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isMobile = isTouch || window.innerWidth < 768;
  var frameSkip = isMobile ? 2 : 1;

  // ===== FRAME CONFIG =====
  var LAUNCH_FRAMES = 169;
  var SCROLL_FRAMES = 241;

  // ===== ELEMENTS =====
  var loader = document.getElementById('loader');
  var loaderFill = document.getElementById('loaderFill');
  var loaderText = document.querySelector('.loader-text');
  var scene01a = document.getElementById('scene01a');
  var neonLetters = document.querySelectorAll('.neon-letter');
  var scene01b = document.getElementById('scene01b');
  var curtainLeft = document.getElementById('curtainLeft');
  var curtainRight = document.getElementById('curtainRight');
  var skillRows = document.querySelectorAll('.skill-row');
  var launchCanvas = document.getElementById('launchCanvas');
  var launchCtx = launchCanvas.getContext('2d');
  var scrollCanvas = document.getElementById('scrollCanvas');
  var scrollCtx = scrollCanvas.getContext('2d');
  var scrubSpacer = document.getElementById('scrubSpacer');
  var serviceCardsRow = document.getElementById('serviceCardsRow');
  var scrubDim = document.getElementById('scrubDim');
  var serviceCards = [
    document.getElementById('serviceCard0'),
    document.getElementById('serviceCard1'),
    document.getElementById('serviceCard2')
  ];
  var nebulaWisps = [
    document.getElementById('nebulaWisp1'),
    document.getElementById('nebulaWisp2'),
    document.getElementById('nebulaWisp3')
  ];
  var scrollCompanions = document.querySelectorAll('.scroll-companion');
  var scrollProgress = document.getElementById('scrollProgress');
  var contactSection = document.getElementById('contact');
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');

  // ===== FRAME PRELOADING =====
  var launchImages = [];
  var scrollImages = [];
  var totalToLoad = 0;
  var totalLoaded = 0;

  function framePath(folder, i) {
    return 'frames/' + folder + '/frame-' + String(i).padStart(4, '0') + '.jpg';
  }

  function countFramesToLoad() {
    var count = 0;
    for (var i = 1; i <= LAUNCH_FRAMES; i += frameSkip) count++;
    for (var i = 1; i <= SCROLL_FRAMES; i += frameSkip) count++;
    return count;
  }

  totalToLoad = countFramesToLoad();

  function onFrameLoad() {
    totalLoaded++;
    var pct = Math.round((totalLoaded / totalToLoad) * 100);
    loaderFill.style.width = pct + '%';
    loaderText.textContent = 'loading assets... ' + pct + '%';
    if (totalLoaded >= totalToLoad) {
      onAllLoaded();
    }
  }

  function preloadFrames() {
    for (var i = 1; i <= LAUNCH_FRAMES; i += frameSkip) {
      var img = new Image();
      img.onload = onFrameLoad;
      img.onerror = onFrameLoad;
      img.src = framePath('launch', i);
      launchImages[i] = img;
    }
    for (var i = 1; i <= SCROLL_FRAMES; i += frameSkip) {
      var img = new Image();
      img.onload = onFrameLoad;
      img.onerror = onFrameLoad;
      img.src = framePath('scroll', i);
      scrollImages[i] = img;
    }
  }

  // ===== CANVAS DRAWING =====
  function resizeCanvas(canvas) {
    var parent = canvas.parentElement;
    if (parent && parent.id === 'scene01b') {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  var ROCKET_CENTER_X = 0.60;

  function drawFrame(ctx, canvas, images, index) {
    var nearestFrame = Math.round((index - 1) / frameSkip) * frameSkip + 1;
    if (nearestFrame < 1) nearestFrame = 1;
    var img = images[nearestFrame];
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    var w = img.width * scale;
    var h = img.height * scale;
    var dx = (canvas.width - w) / 2;
    var dy = (canvas.height - h) / 2;

    if (canvas.width <= 767 && canvas.id === 'launchCanvas') {
      var rocketScreenX = ROCKET_CENTER_X * w + dx;
      var screenCenter = canvas.width / 2;
      dx -= (rocketScreenX - screenCenter);
    }

    ctx.drawImage(img, dx, dy, w, h);
  }

  function resizeAll() {
    resizeCanvas(launchCanvas);
    resizeCanvas(scrollCanvas);
  }

  window.addEventListener('resize', function () {
    resizeAll();
    drawFrame(launchCtx, launchCanvas, launchImages, currentLaunchFrame);
    drawFrame(scrollCtx, scrollCanvas, scrollImages, currentScrollFrame);
  });

  // ===== SCENE FLOW =====
  var sceneState = 'loading';
  var currentLaunchFrame = 1;
  var currentScrollFrame = 1;

  function onAllLoaded() {
    resizeAll();
    drawFrame(launchCtx, launchCanvas, launchImages, 1);
    drawFrame(scrollCtx, scrollCanvas, scrollImages, 1);
    currentLaunchFrame = 1;

    setTimeout(function () {
      loader.classList.add('hidden');
      setTimeout(function () {
        loader.style.display = 'none';
        startScene01a();
      }, 600);
    }, 300);
  }

  // ===== SCENE 01A — NEON NAME REVEAL =====
  function flickerLetter(letter) {
    var steps = [0.6, 1, 0.5, 1];
    var i = 0;
    function next() {
      if (i >= steps.length) {
        letter.style.opacity = 1;
        letter.classList.add('revealed');
        return;
      }
      letter.style.opacity = steps[i];
      i++;
      setTimeout(next, 50);
    }
    next();
  }

  function startScene01a() {
    sceneState = '01a';
    scene01a.style.display = '';
    scene01a.classList.remove('hidden');
    var idx = 0;
    function revealNext() {
      if (idx >= neonLetters.length) {
        setTimeout(startScene01b, 500);
        return;
      }
      flickerLetter(neonLetters[idx]);
      idx++;
      setTimeout(revealNext, 80);
    }
    setTimeout(revealNext, 200);
  }

  // ===== SCENE 01B — CURTAINS OPEN =====
  function startScene01b() {
    sceneState = '01b';
    scene01a.classList.add('hidden');
    setTimeout(function () {
      scene01b.classList.add('visible');
      curtainLeft.classList.add('open');
      curtainRight.classList.add('open');

      setTimeout(function () {
        document.querySelector('.wh-name').classList.add('fade-in');
        document.querySelector('.wh-tagline').classList.add('fade-in');
        var rl = document.querySelector('.rocket-label');
        if (rl) rl.classList.add('fade-in');
        startAmbientLights();
        startTaglineGlow();
        startNameFlicker();

        skillRows.forEach(function (row, i) {
          setTimeout(function () { row.classList.add('visible'); }, 500 + i * 500);
        });
      }, 600);
    }, 800);
    setTimeout(function () { scene01a.style.display = 'none'; }, 2000);

    setTimeout(function () {
      window.scrollTo(0, 0);
      sceneState = 'scrolling';
      document.body.style.overflow = '';
      requestAnimationFrame(updateScroll);
    }, 3500);
  }

  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';

  // ===== TAGLINE GLOW PULSE =====
  function startTaglineGlow() {
    var tagline = document.querySelector('.wh-tagline');
    function pulse() {
      tagline.classList.add('glow');
      var holdTime = 2500 + Math.random() * 2500;
      setTimeout(function () {
        tagline.classList.remove('glow');
        var pause = 3000 + Math.random() * 4000;
        setTimeout(pulse, pause);
      }, holdTime);
    }
    setTimeout(pulse, 2000);
  }

  // ===== NAME NEON FLICKER =====
  function startNameFlicker() {
    var name = document.querySelector('.wh-name');
    function flicker() {
      var origOpacity = name.style.opacity || '1';
      name.style.transition = 'none';
      name.style.opacity = '0.6';
      setTimeout(function () {
        name.style.opacity = '1';
        setTimeout(function () {
          name.style.opacity = '0.7';
          setTimeout(function () {
            name.style.opacity = '1';
            name.style.transition = '';
            var nextFlicker = 3000 + Math.random() * 7000;
            setTimeout(flicker, nextFlicker);
          }, 60);
        }, 80);
      }, 50);
    }
    setTimeout(flicker, 3000 + Math.random() * 5000);
  }

  // ===== AMBIENT FIREFLY LIGHTS =====
  function startAmbientLights() {
    var lights = document.querySelectorAll('.ambient-light');
    lights.forEach(function (light) {
      function breathe() {
        var peakOpacity = 0.4 + Math.random() * 0.6;
        var holdTime = 800 + Math.random() * 1200;
        light.style.opacity = peakOpacity;
        setTimeout(function () {
          light.style.opacity = 0;
          var pause = 1500 + Math.random() * 3500;
          setTimeout(breathe, pause);
        }, holdTime);
      }
      var initialDelay = Math.random() * 3000;
      setTimeout(breathe, initialDelay);
    });
  }

  // ===== SCROLL HELPERS =====
  var ticking = false;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getSpacerProgress(spacerEl) {
    var rect = spacerEl.getBoundingClientRect();
    var top = window.scrollY + rect.top;
    var height = spacerEl.offsetHeight;
    var scrollIn = window.scrollY - top;
    var maxScroll = height - window.innerHeight;
    return clamp(scrollIn / maxScroll, 0, 1);
  }

  // ===== SCROLL UPDATE =====
  function updateScroll() {
    if (sceneState !== 'scrolling') return;

    var scrollY = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var globalProgress = docHeight > 0 ? scrollY / docHeight : 0;
    scrollProgress.style.width = (globalProgress * 100) + '%';

    // ===== UNIFIED SCENE MANAGEMENT =====
    var heroSpacer = document.getElementById('heroSpacer');
    var heroRect = heroSpacer.getBoundingClientRect();
    var scrubRect = scrubSpacer.getBoundingClientRect();

    var whName = document.querySelector('.wh-name');
    var whTagline = document.querySelector('.wh-tagline');
    var rLabel = document.querySelector('.rocket-label');

    var heroProgress = getSpacerProgress(heroSpacer);
    var inHeroZone = heroRect.top < window.innerHeight && heroRect.bottom > 0;
    var inScrubZone = scrubRect.top <= 0 && scrubRect.bottom > 0;

    // --- HERO ZONE ---
    if (inHeroZone) {
      scene01b.classList.remove('hidden-done');
      launchCanvas.style.display = '';
      scrollCanvas.classList.remove('active');
      scrollCanvas.style.opacity = '';

      var launchFrame = Math.max(1, Math.min(LAUNCH_FRAMES,
        Math.round(heroProgress * (LAUNCH_FRAMES - 1)) + 1));
      if (launchFrame !== currentLaunchFrame) {
        currentLaunchFrame = launchFrame;
        drawFrame(launchCtx, launchCanvas, launchImages, launchFrame);
      }

      // UI launch animation at frame 106+
      var launchThreshold = 106 / LAUNCH_FRAMES;
      if (heroProgress >= launchThreshold) {
        var t = (heroProgress - launchThreshold) / (1 - launchThreshold);
        var nameT = clamp(t / 0.25, 0, 1);
        var tagT = clamp((t - 0.08) / 0.25, 0, 1);
        var row0T = clamp((t - 0.16) / 0.25, 0, 1);
        var row1T = clamp((t - 0.24) / 0.25, 0, 1);
        var row2T = clamp((t - 0.32) / 0.25, 0, 1);
        var labelT = clamp((t - 0.12) / 0.25, 0, 1);

        whName.style.transform = 'translateY(' + (-nameT * 120) + 'vh)';
        whName.style.opacity = 1 - nameT;
        whTagline.style.transform = 'translateY(' + (-tagT * 120) + 'vh)';
        whTagline.style.opacity = 1 - tagT;
        skillRows[0].style.transform = 'translateY(' + (-row0T * 120) + 'vh)';
        skillRows[0].style.opacity = 1 - row0T;
        skillRows[1].style.transform = 'translateY(' + (-row1T * 120) + 'vh)';
        skillRows[1].style.opacity = 1 - row1T;
        skillRows[2].style.transform = 'translateY(' + (-row2T * 120) + 'vh)';
        skillRows[2].style.opacity = 1 - row2T;
        if (rLabel) {
          rLabel.style.transform = 'translateY(' + (-labelT * 120) + 'vh)';
          rLabel.style.opacity = 1 - labelT;
        }
      } else {
        whName.style.transform = '';
        whName.style.opacity = '';
        whTagline.style.transform = '';
        whTagline.style.opacity = '';
        skillRows[0].style.transform = '';
        skillRows[0].style.opacity = '';
        skillRows[1].style.transform = '';
        skillRows[1].style.opacity = '';
        skillRows[2].style.transform = '';
        skillRows[2].style.opacity = '';
        if (rLabel) { rLabel.style.transform = ''; rLabel.style.opacity = ''; }
      }

      // Fade hero to black at frame 130+
      var fadeThreshold = 130 / LAUNCH_FRAMES;
      if (heroProgress >= fadeThreshold) {
        var fadeT = clamp((heroProgress - fadeThreshold) / (1 - fadeThreshold), 0, 1);
        launchCanvas.style.opacity = 1 - fadeT;
        scene01b.style.opacity = 1 - fadeT;
      } else {
        launchCanvas.style.opacity = '';
        scene01b.style.opacity = '';
      }

    } else {
      // Past hero — hide hero elements
      scene01b.classList.add('hidden-done');
      scene01b.style.opacity = '0';
      launchCanvas.style.display = 'none';
    }

    // --- SCRUB ZONE ---
    if (inScrubZone) {
      scrollCanvas.classList.add('active');

      var p = getSpacerProgress(scrubSpacer);

      // Fade from black during first 10% of scrub progress
      if (p < 0.1) {
        scrollCanvas.style.opacity = p / 0.1;
      } else {
        scrollCanvas.style.opacity = '';
      }

      // Always advance frames (even during fade-in)
      var scrollFrame = Math.max(1, Math.min(SCROLL_FRAMES,
        Math.round(p * (SCROLL_FRAMES - 1)) + 1));
      if (scrollFrame !== currentScrollFrame) {
        currentScrollFrame = scrollFrame;
        drawFrame(scrollCtx, scrollCanvas, scrollImages, scrollFrame);
      }

      // Service cards — slide in one by one + dim overlay
      if (p >= 0.25) {
        serviceCardsRow.classList.add('visible');
        scrubDim.classList.add('active');
        var cardThresholds = [0.25, 0.35, 0.45];
        serviceCards.forEach(function (card, i) {
          if (p >= cardThresholds[i]) {
            card.classList.add('visible');
          } else {
            card.classList.remove('visible');
          }
        });
      } else {
        serviceCardsRow.classList.remove('visible');
        scrubDim.classList.remove('active');
        serviceCards.forEach(function (c) { c.classList.remove('visible'); });
      }

      // Nebula wisps
      var wispActive = p > 0.6 && p < 0.95;
      nebulaWisps.forEach(function (w) {
        w.style.opacity = wispActive ? Math.min(1, (p - 0.6) / 0.1) : 0;
      });

    } else {
      // Hide fixed overlays when scrub zone is mostly past
      if (scrubRect.bottom <= window.innerHeight * 1.5) {
        scrollCanvas.classList.remove('active');
        serviceCardsRow.classList.remove('visible');
        scrubDim.classList.remove('active');
        nebulaWisps.forEach(function (w) { w.style.opacity = 0; });
      }
      if (scrubRect.top >= window.innerHeight) {
        scrollCanvas.classList.remove('active');
      }
    }

    // About section content reveal
    var aboutText = document.querySelector('.about-text');
    var aboutStats = document.querySelector('.about-stats');

    if (aboutText) {
      var textRect = aboutText.getBoundingClientRect();
      if (textRect.top < window.innerHeight * 0.8) {
        aboutText.classList.add('visible');
      }
    }
    if (aboutStats) {
      var statsRect = aboutStats.getBoundingClientRect();
      if (statsRect.top < window.innerHeight * 0.8) {
        aboutStats.classList.add('visible');
      }
    }

    // Contact section reveal
    var contactRect = contactSection.getBoundingClientRect();
    if (contactRect.top < window.innerHeight * 0.8) {
      contactSection.classList.add('visible');
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });

  // ===== CUSTOM CURSOR =====
  if (!isTouch) {
    var mouseX = 0, mouseY = 0;
    var dotX = 0, dotY = 0;
    var ringX = 0, ringY = 0;
    var cursorVisible = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursorDot.style.opacity = 1;
        cursorRing.style.opacity = 1;
      }
    });

    document.addEventListener('mouseleave', function () {
      cursorVisible = false;
      cursorDot.style.opacity = 0;
      cursorRing.style.opacity = 0;
    });

    var hoverables = 'a, button, [role="button"], .service-card, .contact-btn, .footer-links a';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverables)) cursorRing.classList.add('hovering');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverables)) cursorRing.classList.remove('hovering');
    });

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.9;
      dotY += (mouseY - dotY) * 0.9;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top = dotY + 'px';
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }

  // ===== SERVICE CARD CLICK =====
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== INIT =====
  preloadFrames();

})();
