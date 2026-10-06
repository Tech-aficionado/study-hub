/* Study Hub — mobile reading experience (shared by the hub and all five topic modules).
   Loaded after nav.js, common.js and bookmarks.js, so the sidebar, hub bar and bookmark
   buttons already exist when this runs. Everything here is progressive enhancement:
   if an element is missing, that feature quietly does nothing. */
(function () {
  'use strict';

  var MOBILE = window.matchMedia('(max-width: 900px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var root = document.documentElement;
    var body = document.body;
    var hubBar = document.querySelector('.hub-bar');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    var toggle = document.getElementById('menuToggle');
    var main = document.querySelector('.main');

    /* ---------- PWA: manifest, icons, service worker (one-time per page load) ---------- */
    var depth = location.pathname.split('/').filter(Boolean).length > 0 && /\.html$/.test(location.pathname)
      ? location.pathname.split('/').length - 2 : 0; // module page = 1 ("/docker/x.html"), hub = 0
    var rootPrefix = depth > 0 ? '../' : '';
    if (!document.querySelector('link[rel="manifest"]')) {
      var manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = rootPrefix + 'manifest.json';
      document.head.appendChild(manifestLink);
    }
    if (!document.querySelector('link[rel="icon"]')) {
      var favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = rootPrefix + 'favicon.ico';
      document.head.appendChild(favicon);
    }
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      var touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      touchIcon.href = rootPrefix + 'icons/icon-180.png';
      document.head.appendChild(touchIcon);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      var appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(rootPrefix + 'sw.js').catch(function () {});
    }

    /* ---------- browser chrome colour matches the page theme ---------- */
    var bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (bg && !document.querySelector('meta[name="theme-color"]')) {
      var meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = bg;
      document.head.appendChild(meta);
    }

    /* ---------- compact top bar: home icon + "Topic / Page" title ---------- */
    if (hubBar) {
      var spans = hubBar.querySelectorAll(':scope > span:not(.sep)');
      var topic = spans.length > 1 ? spans[0].textContent.trim() : '';
      var cur = hubBar.querySelector('.cur');
      var page = cur ? cur.textContent.trim() : document.title;
      /* common.js reads the whole heading, so a level badge leaks in ("Joins Intermediate") */
      var heading = document.querySelector('.page-title');
      if (heading) {
        var clean = heading.cloneNode(true);
        clean.querySelectorAll('.badge, button').forEach(function (n) { n.remove(); });
        var txt = clean.textContent.replace(/\s+/g, ' ').trim();
        if (txt) { page = txt; if (cur) cur.textContent = txt.replace(/^[^\p{L}\p{N}]+/u, '') || txt; }
      }

      var home = document.createElement('a');
      home.className = 'hb-home';
      home.href = '../index.html';
      home.setAttribute('aria-label', 'Back to Study Hub');
      home.innerHTML = '<span aria-hidden="true">\u2302</span>';

      var title = document.createElement('div');
      title.className = 'hb-title';
      title.innerHTML = '<span class="hb-topic"></span><span class="hb-page"></span>';
      title.querySelector('.hb-topic').textContent = topic;
      /* the big page heading already shows its emoji; keep the bar text clean */
      title.querySelector('.hb-page').textContent = page.replace(/^[^\p{L}\p{N}]+/u, '') || page;

      var firstLink = hubBar.querySelector(':scope > a');
      hubBar.insertBefore(title, firstLink ? firstLink.nextSibling : hubBar.firstChild);
      hubBar.insertBefore(home, title);

      /* reading progress along the bottom edge of the bar */
      var prog = document.createElement('div');
      prog.className = 'hb-progress';
      prog.setAttribute('aria-hidden', 'true');
      hubBar.appendChild(prog);
    }

    /* ---------- sidebar drawer: close button, swipe, Esc, scroll lock ---------- */
    function isOpen() { return sidebar && sidebar.classList.contains('open'); }

    function setOpen(open) {
      if (!sidebar || !overlay) return;
      sidebar.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      body.classList.toggle('nav-locked', open && MOBILE.matches);
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var active = sidebar.querySelector('.nav-item.active');
        /* scroll only the drawer (not the page), keeping the current page in view */
        if (active) {
          var target = active.offsetTop - sidebar.clientHeight / 2 + active.offsetHeight / 2;
          sidebar.scrollTop = target > 0 ? target : 0;
        }
        var closeBtn = sidebar.querySelector('.sb-close');
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      } else if (toggle && sidebar.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }
    }

    if (sidebar && overlay && toggle) {
      toggle.setAttribute('aria-label', 'Open the topic menu');
      toggle.setAttribute('aria-controls', 'sidebar');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span aria-hidden="true">\u2630</span>';

      /* common.js already toggles the classes on click; sync our state after it runs */
      toggle.addEventListener('click', function () { setOpen(sidebar.classList.contains('open')); });
      overlay.addEventListener('click', function () { setOpen(false); });

      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'sb-close';
      close.setAttribute('aria-label', 'Close the topic menu');
      close.innerHTML = '<span aria-hidden="true">\u2715</span>';
      close.addEventListener('click', function () { setOpen(false); });
      sidebar.insertBefore(close, sidebar.firstChild);

      sidebar.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.nav-item') && MOBILE.matches) setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) setOpen(false);
      });

      /* swipe left on the open drawer closes it; swipe right from the left edge opens it */
      var sx = 0, sy = 0, tracking = false, fromEdge = false;
      document.addEventListener('touchstart', function (e) {
        if (!MOBILE.matches || e.touches.length !== 1) return;
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
        fromEdge = !isOpen() && sx < 22;
        tracking = isOpen() || fromEdge;
      }, { passive: true });
      document.addEventListener('touchend', function (e) {
        if (!tracking) return;
        tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
        if (isOpen() && dx < 0) setOpen(false);
        else if (fromEdge && dx > 0) setOpen(true);
      }, { passive: true });

      MOBILE.addEventListener && MOBILE.addEventListener('change', function () {
        if (!MOBILE.matches) body.classList.remove('nav-locked');
      });
    }

    /* ---------- focus mode: hide chrome and centre the text for distraction-free reading ---------- */
    if (hubBar && main) {
      var FOCUS_KEY = 'studyhub_focus_mode';
      var focusBtn = document.createElement('button');
      focusBtn.type = 'button';
      focusBtn.className = 'focus-toggle';
      focusBtn.innerHTML = '<span aria-hidden="true">\u25CE</span><span class="focus-label">Focus</span>';

      /* a small pill that reappears once the top bar is hidden, so there is always a way back */
      var exitBtn = document.createElement('button');
      exitBtn.type = 'button';
      exitBtn.className = 'focus-exit';
      exitBtn.innerHTML = '<span aria-hidden="true">\u2715</span><span>Exit focus</span>';
      exitBtn.setAttribute('aria-label', 'Exit focus mode');
      body.appendChild(exitBtn);

      var applyFocus = function (on, save) {
        body.classList.toggle('focus-mode', on);
        focusBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        exitBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        focusBtn.setAttribute('aria-label', on ? 'Exit focus mode' : 'Enter focus mode');
        focusBtn.title = on ? 'Exit focus mode' : 'Focus mode: full-screen, distraction-free reading';
        if (on && isOpen()) setOpen(false);
        if (save) { try { localStorage.setItem(FOCUS_KEY, on ? '1' : '0'); } catch (e) {} }
      };
      focusBtn.addEventListener('click', function () { applyFocus(!body.classList.contains('focus-mode'), true); });
      exitBtn.addEventListener('click', function () { applyFocus(false, true); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && body.classList.contains('focus-mode')) applyFocus(false, true);
      });
      var bmBar = hubBar.querySelector('.bm-bar');
      if (bmBar) bmBar.insertBefore(focusBtn, bmBar.firstChild);
      else hubBar.appendChild(focusBtn);
      var saved = false;
      try { saved = localStorage.getItem(FOCUS_KEY) === '1'; } catch (e) {}
      applyFocus(saved, false);
    }

    /* ---------- previous / next page at the end of every module page ---------- */
    if (main && sidebar) {
      var items = Array.prototype.slice.call(sidebar.querySelectorAll('.nav-item[href]'));
      var here = location.pathname.split('/').pop() || 'index.html';
      var idx = -1;
      items.forEach(function (a, i) { if ((a.getAttribute('href') || '').split('/').pop() === here) idx = i; });
      if (idx !== -1 && items.length > 1) {
        var pager = document.createElement('nav');
        pager.className = 'page-pager';
        pager.setAttribute('aria-label', 'Previous and next page');
        var label = function (a) { return a.textContent.replace(/^[\u2460-\u2473]\s*/, '').trim(); };
        var make = function (a, dir) {
          var link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.className = 'pp-' + dir;
          link.innerHTML = '<span class="pp-dir"></span><span class="pp-name"></span>';
          link.querySelector('.pp-dir').textContent = dir === 'prev' ? '\u2190 Previous' : 'Next \u2192';
          link.querySelector('.pp-name').textContent = label(a);
          return link;
        };
        if (idx > 0) pager.appendChild(make(items[idx - 1], 'prev'));
        else pager.appendChild(document.createElement('span'));
        if (idx < items.length - 1) pager.appendChild(make(items[idx + 1], 'next'));
        var foot = main.querySelector(':scope > footer');
        main.insertBefore(pager, foot || null);
      }
    }

    /* ---------- back-to-top button ---------- */
    var topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'to-top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.innerHTML = '<span aria-hidden="true">\u2191</span>';
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    body.appendChild(topBtn);
    if (document.querySelector('.bm-floating')) topBtn.classList.add('above-fab');

    /* ---------- scroll: progress, auto-hiding bar, back-to-top visibility ---------- */
    var lastY = window.scrollY, ticking = false;
    var progEl = document.querySelector('.hb-progress');
    function onScroll() {
      ticking = false;
      var y = window.scrollY;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progEl) progEl.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      topBtn.classList.toggle('show', y > window.innerHeight * 1.2);
      if (MOBILE.matches && !isOpen()) {
        var goingDown = y > lastY + 6, goingUp = y < lastY - 6;
        if (goingDown && y > 120) body.classList.add('bar-hidden');
        else if (goingUp || y < 60) body.classList.remove('bar-hidden');
      } else {
        body.classList.remove('bar-hidden');
      }
      if (Math.abs(y - lastY) > 6) lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    /* show the bar again whenever something inside the page takes focus (e.g. keyboard users) */
    document.addEventListener('focusin', function () { body.classList.remove('bar-hidden'); });
    onScroll();
  });
})();
