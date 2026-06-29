if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isMobile = window.innerWidth < 768;
  var frameSkip = isMobile ? 2 : 1;

  // ===== FRAME CONFIG =====
  var LAUNCH_FRAMES = 169;
  var SCROLL_FRAMES = 241;
  var LAND_FRAMES = 75;

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
  var scrubTitle = document.getElementById('scrubTitle');
  var scrubTitleLetters = document.querySelectorAll('.scrub-title-letter');
  var prevLitCount = 0;
  var teleportLock = false;
  var serviceCards = [
    document.getElementById('serviceCard0'),
    document.getElementById('serviceCard1'),
    document.getElementById('serviceCard2')
  ];
  var landCanvas = document.getElementById('landCanvas');
  var landCtx = landCanvas ? landCanvas.getContext('2d') : null;
  var landSpacer = document.getElementById('landSpacer');
  var landDim = document.getElementById('landDim');
  var landCta = document.getElementById('landCta');
  var nebulaWisps = [
    document.getElementById('nebulaWisp1'),
    document.getElementById('nebulaWisp2'),
    document.getElementById('nebulaWisp3')
  ];
  var scrollCompanions = document.querySelectorAll('.scroll-companion');
  var scrollProgress = document.getElementById('scrollProgress');
  var cursorDot = document.getElementById('cursorDot');
  var cursorRing = document.getElementById('cursorRing');

  // ===== FRAME PRELOADING =====
  var launchImages = [];
  var scrollImages = [];
  var landImages = [];
  var totalToLoad = 0;
  var totalLoaded = 0;

  function framePath(folder, i) {
    return 'frames/' + folder + '/frame-' + String(i).padStart(4, '0') + '.webp';
  }

  function landFramePath(i) {
    return 'assets/home/frames/rocketland/frame-' + String(i).padStart(4, '0') + '.webp';
  }

  function countFramesToLoad() {
    var count = 0;
    for (var i = 1; i <= LAUNCH_FRAMES; i += frameSkip) count++;
    for (var i = 1; i <= SCROLL_FRAMES; i += frameSkip) count++;
    for (var i = 1; i <= LAND_FRAMES; i += frameSkip) count++;
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
    for (var i = 1; i <= LAND_FRAMES; i += frameSkip) {
      var img = new Image();
      img.onload = onFrameLoad;
      img.onerror = onFrameLoad;
      img.src = landFramePath(i);
      landImages[i] = img;
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

  var currentLandFrame = 1;

  function resizeAll() {
    resizeCanvas(launchCanvas);
    resizeCanvas(scrollCanvas);
    if (landCanvas) resizeCanvas(landCanvas);
  }

  window.addEventListener('resize', function () {
    resizeAll();
    drawFrame(launchCtx, launchCanvas, launchImages, currentLaunchFrame);
    if (landCtx) drawFrame(landCtx, landCanvas, landImages, currentLandFrame);
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
    if (landCtx) drawFrame(landCtx, landCanvas, landImages, 1);
    currentLaunchFrame = 1;

    var shouldSkip = sessionStorage.getItem('tc_intro_seen') === '1';

    setTimeout(function () {
      loader.classList.add('hidden');
      setTimeout(function () {
        loader.style.display = 'none';
        if (shouldSkip) {
          skipToScrolling();
        } else {
          startScene01a();
        }
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

  // ===== SKIP INTRO (returning visitors) =====
  function skipToScrolling() {
    scene01a.style.display = 'none';
    scene01b.classList.add('skip-transition');
    scene01b.classList.add('visible');
    curtainLeft.classList.add('open');
    curtainRight.classList.add('open');
    document.querySelector('.wh-name').classList.add('fade-in');
    document.querySelector('.wh-tagline').classList.add('fade-in');
    var rl = document.querySelector('.rocket-label');
    if (rl) rl.classList.add('fade-in');
    skillRows.forEach(function (row) { row.classList.add('visible'); });
    requestAnimationFrame(function () {
      scene01b.classList.remove('skip-transition');
    });
    startAmbientLights();
    startTaglineGlow();
    startNameFlicker();
    window.scrollTo(0, 0);
    sceneState = 'scrolling';
    document.body.style.overflow = '';
    var aboutEl = document.getElementById('about');
    if (aboutEl) aboutEl.classList.add('revealed');
    if (aboutEl) {
      var wrap = document.getElementById('aboutWrap');
      if (wrap) {
        var sh = aboutEl.offsetHeight;
        var vh = window.innerHeight;
        aboutEl.style.position = 'sticky';
        aboutEl.style.top = -(sh - vh) + 'px';
        wrap.style.height = (sh + vh * 1.5) + 'px';
      }
    }
    requestAnimationFrame(updateScroll);
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
      sessionStorage.setItem('tc_intro_seen', '1');
      document.body.style.overflow = '';
      var aboutEl = document.getElementById('about');
      if (aboutEl) aboutEl.classList.add('revealed');
      if (aboutEl) {
        var wrap = document.getElementById('aboutWrap');
        if (wrap) {
          var sh = aboutEl.offsetHeight;
          var vh = window.innerHeight;
          aboutEl.style.position = 'sticky';
          aboutEl.style.top = -(sh - vh) + 'px';
          wrap.style.height = (sh + vh * 1.5) + 'px';
        }
      }
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
      if (isMobile) teleportLock = false;

      var p = getSpacerProgress(scrubSpacer);

      // Fade from black during first 5% of scrub progress
      if (p < 0.05) {
        scrollCanvas.style.opacity = p / 0.05;
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

      // "Choose your path" title — progress-driven, fully bidirectional
      var letterCount = scrubTitleLetters.length;
      var letterStart = 0.05;
      var letterEnd = 0.20;

      if (p >= letterStart) {
        scrubTitle.classList.add('active');
        var letterProgress = clamp((p - letterStart) / (letterEnd - letterStart), 0, 1);
        var litCount = Math.round(letterProgress * letterCount);

        scrubTitleLetters.forEach(function (letter, i) {
          if (i < litCount && !letter.classList.contains('lit')) {
            letter.classList.add('lit');
          } else if (i >= litCount && letter.classList.contains('lit')) {
            letter.classList.remove('lit');
          }
        });
        prevLitCount = litCount;
      } else {
        scrubTitle.classList.remove('active', 'slide-top');
        scrubTitleLetters.forEach(function (l) { l.classList.remove('lit'); });
        prevLitCount = 0;
      }

      if (p >= 0.25) {
        scrubTitle.classList.add('slide-top');
      } else {
        scrubTitle.classList.remove('slide-top');
      }

      // Service cards — slide in one by one + dim overlay
      if (p >= 0.25) {
        serviceCardsRow.classList.add('visible');
        scrubDim.classList.add('active');
        if (isMobile) {
          // Mobile: show all cards at once, scroll horizontally
          serviceCards.forEach(function (card) { card.classList.add('visible'); });
          // Map p 0.25–0.85 to horizontal translation (enter from right, exit left)
          var cardW = window.innerWidth - 48;
          var gap = 20;
          var vw = window.innerWidth;
          var totalTravel = vw + (cardW + gap) * 2;
          var slideP = Math.max(0, Math.min(1, (p - 0.25) / 0.6));
          var tx = vw - slideP * totalTravel;
          serviceCardsRow.style.transform = 'translate(' + tx + 'px, -50%)';
        } else {
          var cardThresholds = [0.25, 0.35, 0.45];
          serviceCards.forEach(function (card, i) {
            if (p >= cardThresholds[i]) {
              card.classList.add('visible');
            } else {
              card.classList.remove('visible');
            }
          });
        }
      } else {
        serviceCardsRow.classList.remove('visible');
        scrubDim.classList.remove('active');
        serviceCards.forEach(function (c) { c.classList.remove('visible'); });
        if (isMobile) serviceCardsRow.style.transform = 'translate(' + window.innerWidth + 'px, -50%)';
      }

      // Nebula wisps
      var wispActive = p > 0.6 && p < 0.95;
      nebulaWisps.forEach(function (w) {
        w.style.opacity = wispActive ? Math.min(1, (p - 0.6) / 0.1) : 0;
      });

    } else {
      // Hide fixed overlays when scrub zone is past
      scrollCanvas.classList.remove('active');
      serviceCardsRow.classList.remove('visible');
      scrubDim.classList.remove('active');
      serviceCards.forEach(function (c) { c.classList.remove('visible'); });
      serviceCardsRow.style.transform = isMobile ? 'translate(' + window.innerWidth + 'px, -50%)' : '';
      nebulaWisps.forEach(function (w) { w.style.opacity = 0; });
      scrubTitle.classList.remove('active', 'slide-top');
      scrubTitleLetters.forEach(function (l) { l.classList.remove('lit'); });
    }

    // About stats — horizontal scroll + fade to black
    var aboutWrap = document.getElementById('aboutWrap');
    var aboutOverlay = document.getElementById('aboutFadeOverlay');

    // About section content reveal
    var aboutText = document.querySelector('.about-text');
    var aboutStats = document.querySelector('.about-stats');

    if (aboutText) {
      var textRect = aboutText.getBoundingClientRect();
      if (textRect.top < window.innerHeight * 0.8) {
        aboutText.classList.add('visible');
      }
    }
    if (aboutStats && aboutWrap) {
      var aboutGrid = document.querySelector('.about-grid');
      if (isMobile) {
        var aboutSection = document.getElementById('about');
        var wrapRect = aboutWrap.getBoundingClientRect();
        var wrapH = aboutWrap.offsetHeight;
        var sectionH = aboutSection.offsetHeight;
        var extraScroll = wrapH - sectionH;
        // How far past the section's natural bottom we've scrolled
        var scrolledInWrap = -wrapRect.top;
        var sectionDone = sectionH - window.innerHeight;
        var pastBottom = scrolledInWrap - sectionDone;
        var p = clamp(pastBottom / extraScroll, 0, 1);

        if (pastBottom > 0 && wrapRect.bottom > 0) {
          // 0–0.4: slide entire grid left by 100vw (bio out, stats in)
          var slideP = Math.min(1, p / 0.4);
          if (aboutGrid) aboutGrid.style.transform = 'translateX(' + (-slideP * 100) + 'vw)';

          // 0.4–0.6: fade to black
          if (p > 0.4) {
            var fadeVal = Math.min(1, (p - 0.4) / 0.2);
            aboutOverlay.style.opacity = fadeVal;
            // Teleport forward once fully black
            if (fadeVal >= 1 && !teleportLock) {
              teleportLock = true;
              var eSpacerTop = landSpacer.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top: eSpacerTop, behavior: 'instant' });
            }
          } else {
            aboutOverlay.style.opacity = 0;
            teleportLock = false;
          }
        } else if (wrapRect.bottom <= 0) {
          if (aboutGrid) aboutGrid.style.transform = 'translateX(-100vw)';
          aboutOverlay.style.opacity = 0;
        } else {
          if (aboutGrid) aboutGrid.style.transform = '';
          aboutOverlay.style.opacity = 0;
          teleportLock = false;
        }
      } else {
        // Desktop: same sticky lock + fade to black (no horizontal stats scroll)
        var aboutSection = document.getElementById('about');
        var wrapRect = aboutWrap.getBoundingClientRect();
        var wrapH = aboutWrap.offsetHeight;
        var sectionH = aboutSection.offsetHeight;
        var extraScroll = wrapH - sectionH;
        var scrolledInWrap = -wrapRect.top;
        var sectionDone = sectionH - window.innerHeight;
        var pastBottom = scrolledInWrap - sectionDone;
        var p = clamp(pastBottom / extraScroll, 0, 1);

        // Show stats normally
        var statsRect = aboutStats.getBoundingClientRect();
        if (statsRect.top < window.innerHeight * 0.8) {
          aboutStats.classList.add('visible');
        }

        // Fade to black after section locks
        if (pastBottom > 0 && wrapRect.bottom > 0) {
          if (p > 0.3) {
            var fadeVal = Math.min(1, (p - 0.3) / 0.4);
            aboutOverlay.style.opacity = fadeVal;
          } else {
            aboutOverlay.style.opacity = 0;
          }
        } else if (wrapRect.bottom <= 0) {
          aboutOverlay.style.opacity = 0;
        } else {
          aboutOverlay.style.opacity = 0;
        }
      }
    } else if (aboutStats) {
      var statsRect = aboutStats.getBoundingClientRect();
      if (statsRect.top < window.innerHeight * 0.8) {
        aboutStats.classList.add('visible');
      }
    }

    // ===== ROCKET LANDING CTA =====
    if (landSpacer && landCanvas) {
      var landRect = landSpacer.getBoundingClientRect();
      var inLandZone = landRect.top <= 0 && landRect.bottom > 0;

      if (inLandZone) {
        landCanvas.classList.add('active');
        var lp = getSpacerProgress(landSpacer);

        var landFrame = Math.max(1, Math.min(LAND_FRAMES,
          Math.round(lp * (LAND_FRAMES - 1)) + 1));
        if (landFrame !== currentLandFrame) {
          currentLandFrame = landFrame;
          drawFrame(landCtx, landCanvas, landImages, landFrame);
        }

        // Dim starts at 45%, CTA text appears at 65%
        if (lp >= 0.45) {
          landDim.classList.add('active');
          var dimP = clamp((lp - 0.45) / 0.2, 0, 1);
          landDim.style.opacity = dimP * 0.7;
        } else {
          landDim.classList.remove('active');
          landDim.style.opacity = 0;
        }
        if (lp >= 0.65) {
          var ctaP = clamp((lp - 0.65) / 0.2, 0, 1);
          landCta.style.opacity = ctaP;
          if (ctaP > 0) landCta.classList.add('visible');
        } else {
          landCta.style.opacity = 0;
          landCta.classList.remove('visible');
        }
      } else {
        if (landRect.bottom <= 0) {
          landCanvas.classList.add('active');
          landDim.classList.add('active');
          landCta.style.opacity = 1;
          landCta.classList.add('visible');
        } else {
          landCanvas.classList.remove('active');
          landDim.classList.remove('active');
          landCta.style.opacity = 0;
          landCta.classList.remove('visible');
        }
      }
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

  // ===== ABOUT AMBIENT GLOW =====
  (function () {
    var glows = document.querySelectorAll('.about-glow');
    glows.forEach(function (glow) {
      function breathe() {
        var peak = 0.7 + Math.random() * 0.3;
        glow.style.opacity = peak;
        var hold = 3000 + Math.random() * 4000;
        setTimeout(function () {
          glow.style.opacity = 0.15 + Math.random() * 0.2;
          setTimeout(breathe, 1500 + Math.random() * 2000);
        }, hold);
      }
      setTimeout(breathe, Math.random() * 2000);
    });
  })();

  // ===== ABOUT MOUSE TRAIL =====
  if (!isTouch) {
    var trailCanvas = document.getElementById('aboutTrail');
    var trailCtx = trailCanvas.getContext('2d');
    var trail = [];
    var aboutSection = document.getElementById('about');

    function resizeTrail() {
      trailCanvas.width = aboutSection.offsetWidth;
      trailCanvas.height = aboutSection.offsetHeight;
    }
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    var trailX = 0, trailY = 0;
    var targetX = 0, targetY = 0;
    var trailActive = false;

    document.addEventListener('mousemove', function (e) {
      var rect = aboutSection.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        trailActive = true;
      } else {
        trailActive = false;
      }
    });

    function drawTrail() {
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      if (trailActive) {
        trailX += (targetX - trailX) * 0.04;
        trailY += (targetY - trailY) * 0.04;
        var radius = 150;
        var gradient = trailCtx.createRadialGradient(trailX, trailY, 0, trailX, trailY, radius);
        gradient.addColorStop(0, 'rgba(177,138,74,0.03)');
        gradient.addColorStop(0.5, 'rgba(177,138,74,0.012)');
        gradient.addColorStop(1, 'rgba(177,138,74,0)');
        trailCtx.beginPath();
        trailCtx.arc(trailX, trailY, radius, 0, Math.PI * 2);
        trailCtx.fillStyle = gradient;
        trailCtx.fill();
      }
      requestAnimationFrame(drawTrail);
    }
    requestAnimationFrame(drawTrail);
  }

  // ===== SERVICE CARD CLICK =====
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      document.getElementById('landSpacer').scrollIntoView({ behavior: 'smooth' });
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('landSpacer').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== INIT =====
  preloadFrames();

})();
