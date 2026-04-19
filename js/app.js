/* ============================================================
   Speaker's Corner — vanilla JS (no framework, no build)
   Portado desde Hooks.jsx + Components.jsx del handoff.
   ============================================================ */
(function () {
  'use strict';

  // ----------------------------------------------------------
  // 1) Reveal-on-scroll: añade .in a [data-reveal] al entrar
  // ----------------------------------------------------------
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        requestAnimationFrame(function () { el.classList.add('in'); });
      } else {
        io.observe(el);
      }
    });

    // Fallback: si algo queda oculto cerca del viewport, mostrarlo
    setTimeout(function () {
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.5) el.classList.add('in');
      });
    }, 2000);
  }

  // ----------------------------------------------------------
  // 2) Counter: anima 0 → N cuando el elemento entra al viewport
  // ----------------------------------------------------------
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    var duration = 1400;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.dataset.started === '1') return;
        el.dataset.started = '1';
        var to = parseInt(el.dataset.counter, 10) || 0;
        var start = performance.now();
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { io.observe(el); });
  }

  // ----------------------------------------------------------
  // 3) Typing: ciclo type/delete sobre array de palabras
  // ----------------------------------------------------------
  function initTyping() {
    var target = document.getElementById('sc-typing');
    if (!target) return;
    var words = ['CONVERSATION', 'NARRATIVE', 'CAMPAIGN', 'DEBATE'];
    var anchorHoldMs = 8000;
    var holdMs = 1600;
    var typeMs = 85;
    var deleteMs = 40;

    var i = 0;
    var txt = '';
    var phase = 'typing';

    function step() {
      var current = words[i];
      if (phase === 'typing') {
        if (txt.length < current.length) {
          txt = current.slice(0, txt.length + 1);
          target.textContent = txt;
          setTimeout(step, typeMs);
        } else {
          var hold = i === 0 ? anchorHoldMs : holdMs;
          phase = 'deleting';
          setTimeout(step, hold);
        }
      } else if (phase === 'deleting') {
        if (txt.length > 0) {
          txt = current.slice(0, txt.length - 1);
          target.textContent = txt;
          setTimeout(step, deleteMs);
        } else {
          i = (i + 1) % words.length;
          phase = 'typing';
          setTimeout(step, 200);
        }
      }
    }
    step();
  }

  // ----------------------------------------------------------
  // 4) Nav: scroll-shrink + scroll-spy + hamburguesa
  // ----------------------------------------------------------
  function initNav() {
    var nav = document.getElementById('sc-nav');
    if (!nav) return;

    // Scroll-shrink vía clase (NO inline style — sino vence al media query mobile)
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hamburguesa
    var toggle = document.getElementById('sc-nav-toggle');
    var navLinks = document.getElementById('sc-nav-links');
    function closeMenu() {
      if (!toggle || !navLinks) return;
      toggle.classList.remove('open');
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (toggle && navLinks) {
      toggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      // Click en cualquier link cierra el menú (mobile)
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
    }

    var sections = [
      ['top',        'top'],
      ['servicios',  'servicios'],
      ['proceso',    'proceso'],
      ['directores', 'directores'],
      ['articulos',  'articulos'],
      ['contacto',   'contacto']
    ];
    var links = nav.querySelectorAll('.sc-nav-link');

    function setActive(navId) {
      links.forEach(function (a) {
        if (a.getAttribute('data-nav') === navId) a.classList.add('active');
        else a.classList.remove('active');
      });
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          var match = sections.find(function (pair) { return pair[1] === id; });
          if (match) setActive(match[0]);
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(function (pair) {
      var el = document.getElementById(pair[1]);
      if (el) obs.observe(el);
    });

    // Click manual marca activo de inmediato (mejor feedback)
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        setActive(a.getAttribute('data-nav'));
      });
    });
  }

  // ----------------------------------------------------------
  // 5) Quote rotator: 5500ms, pausa en hover
  // ----------------------------------------------------------
  function initQuote() {
    var section = document.getElementById('sc-quote');
    if (!section) return;
    var slots = section.querySelectorAll('.sc-quote-slot');
    var dots = section.querySelectorAll('.sc-quote-dots button');
    if (!slots.length) return;

    var i = 0;
    var paused = false;
    var timer = null;

    function show(n) {
      slots.forEach(function (s, k) {
        s.classList.toggle('active', k === n);
      });
      dots.forEach(function (d, k) {
        d.classList.toggle('active', k === n);
      });
      i = n;
    }

    function start() {
      stop();
      timer = setInterval(function () {
        if (!paused) show((i + 1) % slots.length);
      }, 5500);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    section.addEventListener('mouseenter', function () { paused = true; });
    section.addEventListener('mouseleave', function () { paused = false; });

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () {
        show(k);
        start(); // reinicia el ciclo desde el seleccionado
      });
    });

    start();
  }

  // ----------------------------------------------------------
  // 6) FAQ accordion: toggle .open en click
  // ----------------------------------------------------------
  function initFAQ() {
    var items = document.querySelectorAll('.sc-faq-item');
    items.forEach(function (item) {
      var btn = item.querySelector('.sc-faq-q');
      if (!btn) return;
      btn.addEventListener('click', function () {
        item.classList.toggle('open');
      });
    });
  }

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------
  function boot() {
    initReveal();
    initCounters();
    initTyping();
    initNav();
    initQuote();
    initFAQ();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
