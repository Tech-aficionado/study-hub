// Study Hub manual bookmarks — shared by the hub page and every topic module.
// Bookmark a whole page (button in the top bar) or one section (button on each card heading).
// Bookmarks live in this browser's localStorage, so they are shared across all topics on this site.
(function () {
  'use strict';

  var KEY = 'studyhub_bookmarks_v1';
  var TOPICS = [
    ['docker', '\uD83D\uDC33 Docker'],
    ['git', '\uD83C\uDF3F Git'],
    ['github', '\uD83D\uDC19 GitHub'],
    ['sql', '\uD83D\uDDC4\uFE0F SQL'],
    ['kubernetes', '\u2638\uFE0F Kubernetes']
  ];

  function topicLabel(k) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i][0] === k) return TOPICS[i][1];
    return k || 'Other';
  }

  // ---------- storage ----------
  var storageOk = true;
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(v) ? v.filter(function (b) { return b && typeof b.id === 'string' && typeof b.url === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) {
      storageOk = false;
      toast('Could not save — this browser is blocking local storage (private mode?).');
      return false;
    }
  }

  // ---------- page identity ----------
  function normPath() {
    var p = location.pathname;
    if (/\/$/.test(p)) p += 'index.html';
    return p;
  }
  function topicOf(p) {
    var s = p.split('/').filter(Boolean);
    return s.length >= 2 ? s[s.length - 2] : '';
  }
  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
  }
  function cleanText(node, removeSel) {
    var c = node.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll(removeSel), function (n) { n.parentNode.removeChild(n); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }

  var path = normPath();
  var topic = topicOf(path);
  var pageTitle = document.title;

  // ---------- toast ----------
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'bm-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  // ---------- add / remove ----------
  function toggle(entry) {
    var list = load();
    var idx = -1;
    list.forEach(function (b, i) { if (b.id === entry.id) idx = i; });
    if (idx >= 0) {
      list.splice(idx, 1);
      if (save(list)) toast('Bookmark removed');
    } else {
      entry.savedAt = Date.now();
      list.push(entry);
      if (save(list)) toast('Saved \u2014 open \uD83D\uDD16 Bookmarks to find it again');
    }
    refresh();
  }
  function removeById(id) {
    save(load().filter(function (b) { return b.id !== id; }));
    refresh();
  }

  // ---------- toggle buttons ----------
  var toggles = [];
  function makeToggle(id, entryFn, opts) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bm-toggle' + (opts.cls ? ' ' + opts.cls : '');
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggle(entryFn()); });
    toggles.push({ btn: btn, id: id, on: opts.on, off: opts.off, what: opts.what });
    return btn;
  }
  function syncToggles(saved) {
    toggles.forEach(function (t) {
      var on = !!saved[t.id];
      t.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      t.btn.setAttribute('aria-label', (on ? 'Remove bookmark for ' : 'Bookmark ') + t.what);
      t.btn.title = on ? 'Remove this bookmark' : 'Bookmark this so you can come back to it';
      t.btn.textContent = '';
      var icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = on ? '\u2605' : '\u2606';
      var lbl = document.createElement('span');
      lbl.className = 'bm-label';
      lbl.textContent = on ? t.on : t.off;
      t.btn.appendChild(icon);
      t.btn.appendChild(lbl);
    });
  }

  // ---------- "open bookmarks" buttons ----------
  var openBtns = [];
  function makeOpenButton() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bm-open';
    b.setAttribute('aria-haspopup', 'dialog');
    var icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = '\uD83D\uDD16';
    var lbl = document.createElement('span'); lbl.className = 'bm-label'; lbl.textContent = 'Bookmarks';
    var cnt = document.createElement('span'); cnt.className = 'bm-count'; cnt.textContent = '0';
    b.appendChild(icon); b.appendChild(lbl); b.appendChild(cnt);
    b.addEventListener('click', openDrawer);
    openBtns.push({ btn: b, cnt: cnt });
    return b;
  }

  // ---------- list rendering (drawer + hub section share this) ----------
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
    catch (e) { return ''; }
  }
  function renderInto(container, filter, onNavigate) {
    container.textContent = '';
    var all = load();
    var q = (filter || '').trim().toLowerCase();
    var list = !q ? all : all.filter(function (b) {
      return ((b.section || '') + ' ' + (b.page || '') + ' ' + topicLabel(b.topic)).toLowerCase().indexOf(q) !== -1;
    });
    if (!list.length) {
      var p = document.createElement('p');
      p.className = 'bm-empty';
      p.textContent = all.length
        ? 'No bookmarks match \u201C' + filter.trim() + '\u201D.'
        : 'No bookmarks yet. Open any topic and press \u2606 Bookmark page in the top bar, or \u2606 Save on any section, and it will appear here.';
      container.appendChild(p);
      return;
    }
    var order = TOPICS.map(function (t) { return t[0]; });
    list.forEach(function (b) { if (order.indexOf(b.topic) === -1) order.push(b.topic); });
    order.forEach(function (key) {
      var items = list.filter(function (b) { return b.topic === key; })
        .sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
      if (!items.length) return;
      var group = document.createElement('div');
      group.className = 'bm-group';
      var h = document.createElement('h3');
      h.className = 'bm-group-title';
      h.textContent = topicLabel(key) + ' \u00B7 ' + items.length;
      group.appendChild(h);
      var ul = document.createElement('ul');
      ul.className = 'bm-list';
      items.forEach(function (b) {
        var li = document.createElement('li');
        li.className = 'bm-item';
        var a = document.createElement('a');
        a.className = 'bm-link';
        a.href = b.url;
        if (onNavigate) a.addEventListener('click', onNavigate);
        var t = document.createElement('span');
        t.className = 'bm-item-title';
        t.textContent = b.section || b.page;
        var m = document.createElement('span');
        m.className = 'bm-item-meta';
        m.textContent = (b.section ? b.page : 'Whole page') + ' \u00B7 saved ' + fmtDate(b.savedAt);
        a.appendChild(t); a.appendChild(m);
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'bm-remove';
        x.textContent = '\u2715';
        x.setAttribute('aria-label', 'Remove bookmark: ' + (b.section || b.page));
        x.title = 'Remove';
        x.addEventListener('click', function () { removeById(b.id); });
        li.appendChild(a); li.appendChild(x);
        ul.appendChild(li);
      });
      group.appendChild(ul);
      container.appendChild(group);
    });
  }

  // ---------- drawer ----------
  var drawer, overlay, bodyEl, searchEl, clearBtn, closeBtn, footCount, lastFocus = null;
  function buildDrawer() {
    overlay = document.createElement('div');
    overlay.className = 'bm-overlay';
    overlay.addEventListener('click', closeDrawer);

    drawer = document.createElement('aside');
    drawer.className = 'bm-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'bmTitle');
    drawer.setAttribute('aria-hidden', 'true');

    var head = document.createElement('div'); head.className = 'bm-head';
    var h2 = document.createElement('h2'); h2.id = 'bmTitle'; h2.textContent = '\uD83D\uDD16 Your Bookmarks';
    closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'bm-close';
    closeBtn.textContent = '\u2715'; closeBtn.setAttribute('aria-label', 'Close bookmarks');
    closeBtn.addEventListener('click', closeDrawer);
    head.appendChild(h2); head.appendChild(closeBtn);

    var hint = document.createElement('p'); hint.className = 'bm-hint';
    hint.textContent = 'Saved in this browser only, across every topic. \u2606 adds a bookmark, \u2605 means it\u2019s saved.';

    searchEl = document.createElement('input');
    searchEl.type = 'search'; searchEl.className = 'bm-search';
    searchEl.placeholder = 'Filter bookmarks\u2026';
    searchEl.setAttribute('aria-label', 'Filter bookmarks');
    searchEl.addEventListener('input', renderDrawer);

    bodyEl = document.createElement('div'); bodyEl.className = 'bm-body';

    var foot = document.createElement('div'); foot.className = 'bm-foot';
    footCount = document.createElement('span');
    clearBtn = document.createElement('button'); clearBtn.type = 'button'; clearBtn.className = 'bm-clear';
    clearBtn.textContent = 'Clear all';
    clearBtn.addEventListener('click', function () {
      var n = load().length;
      if (!n) return;
      if (window.confirm('Delete all ' + n + ' bookmark' + (n === 1 ? '' : 's') + '? This can\u2019t be undone.')) {
        save([]); refresh(); toast('All bookmarks cleared');
      }
    });
    foot.appendChild(footCount); foot.appendChild(clearBtn);

    drawer.appendChild(head); drawer.appendChild(hint); drawer.appendChild(searchEl);
    drawer.appendChild(bodyEl); drawer.appendChild(foot);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
      if (e.key === 'Tab') {
        // keep keyboard focus inside the open drawer
        var f = drawer.querySelectorAll('button, a[href], input');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function renderDrawer() {
    if (!drawer) return;
    renderInto(bodyEl, searchEl.value, function () { closeDrawer(true); });
    var n = load().length;
    footCount.textContent = n + ' saved';
    clearBtn.disabled = n === 0;
  }
  function openDrawer() {
    lastFocus = document.activeElement;
    searchEl.value = '';
    renderDrawer();
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }
  function closeDrawer(skipFocusReturn) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    if (skipFocusReturn !== true && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------- refresh everything after a change ----------
  var hubTarget = null;
  function refresh() {
    var list = load();
    var saved = {};
    list.forEach(function (b) { saved[b.id] = true; });
    syncToggles(saved);
    openBtns.forEach(function (o) {
      o.cnt.textContent = String(list.length);
      o.btn.setAttribute('aria-label', 'Open bookmarks (' + list.length + ' saved)');
    });
    if (drawer && drawer.classList.contains('open')) renderDrawer();
    if (hubTarget) renderInto(hubTarget, '');
  }

  // ---------- jump to a bookmarked section ----------
  function focusHash() {
    var h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
    if (!h) return;
    var el = document.getElementById(h);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    el.classList.add('bm-flash');
    setTimeout(function () { el.classList.remove('bm-flash'); }, 1800);
  }

  // ---------- page setup ----------
  function initModulePage() {
    var titleEl = document.querySelector('.page-title');
    if (titleEl) pageTitle = cleanText(titleEl, '.badge');

    var used = {};
    Array.prototype.forEach.call(document.querySelectorAll('.main .card'), function (card) {
      var h3 = card.querySelector('h3');
      if (!h3 || card.querySelector('#quizScore')) return; // skip the quiz score box
      var title = cleanText(h3, '.num, .badge, .bm-toggle');
      if (!title) return;
      var cid = card.id || ('sec-' + slug(title));
      var base = cid, n = 2;
      while (used[cid] || (document.getElementById(cid) && document.getElementById(cid) !== card)) cid = base + '-' + (n++);
      used[cid] = true;
      card.id = cid;
      var id = path + '#' + cid;
      h3.appendChild(makeToggle(id, function () {
        return { id: id, url: path + '#' + cid, topic: topic, page: pageTitle, section: title };
      }, { on: 'Saved', off: 'Save', what: 'section: ' + title, cls: 'bm-section' }));
    });

    var wrap = document.createElement('div');
    wrap.className = 'bm-bar';
    wrap.appendChild(makeToggle(path, function () {
      return { id: path, url: path, topic: topic, page: pageTitle, section: null };
    }, { on: 'Page saved', off: 'Bookmark page', what: 'this page: ' + pageTitle, cls: 'bm-page' }));
    wrap.appendChild(makeOpenButton());

    var bar = document.querySelector('.hub-bar');
    if (bar) bar.appendChild(wrap);
    else { wrap.classList.add('bm-floating'); document.body.appendChild(wrap); }
  }

  function initHub() {
    var header = document.querySelector('.hub-header');
    var openBtn = makeOpenButton();
    if (header) header.appendChild(openBtn);
    else { var w = document.createElement('div'); w.className = 'bm-floating'; w.appendChild(openBtn); document.body.appendChild(w); }
    hubTarget = document.getElementById('hubBookmarks');
  }

  function start() {
    buildDrawer();
    if (topic) initModulePage(); else initHub();
    refresh();
    focusHash();
    window.addEventListener('hashchange', focusHash);
    // another tab added/removed a bookmark — stay in sync
    window.addEventListener('storage', function (e) { if (e.key === KEY) refresh(); });
  }

  // common.js builds the top bar on DOMContentLoaded, so run just after it.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  } else {
    setTimeout(start, 0);
  }
})();
