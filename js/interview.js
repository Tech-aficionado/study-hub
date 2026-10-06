// Study Hub interview-question section — shared renderer for every topic.
//
// Each topic's interview.html loads js/interview-data.js (topic-owned) BEFORE this file:
//   window.STUDYHUB_INTERVIEW = {
//     topic: 'sql',
//     questions: [{
//       id: 'sql-hr-revising-select-1',            // unique, stable (used for "practiced" progress)
//       level: 'easy' | 'medium' | 'hard',
//       category: 'Basic SELECT',
//       type: 'concept' | 'coding' | 'scenario',
//       q: 'Plain-text question',
//       answer: '<p>HTML answer written by us</p>',   // sanitised below to a safe tag whitelist
//       source: { site: 'HackerRank' | 'LeetCode' | 'HackerEarth' | 'Official docs' | ..., label: 'Problem / article title', url: 'https://...' },
//       tryIt: { setup: 'SQL to create tables', starter: 'SQL to prefill' }   // optional (SQL playground)
//     }]
//   };
// Page needs: <div id="ivRoot"></div>
(function () {
  'use strict';
  var data = window.STUDYHUB_INTERVIEW;
  var root = document.getElementById('ivRoot');
  if (!root) return;
  if (!data || !Array.isArray(data.questions) || !data.questions.length) {
    root.innerHTML = '<p class="bm-empty">Interview questions are not available yet.</p>';
    return;
  }
  var Q = data.questions;
  var STORE = 'studyhub_practiced_v1';
  var LEVELS = ['easy', 'medium', 'hard'];
  var LEVEL_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

  // ---------- safe HTML (answers are authored, but keep a strict whitelist anyway) ----------
  var ALLOWED = { P: 1, UL: 1, OL: 1, LI: 1, CODE: 1, PRE: 1, STRONG: 1, EM: 1, B: 1, I: 1, BR: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TH: 1, TD: 1, A: 1, SPAN: 1, H4: 1, DIV: 1 };
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<div>' + String(html || '') + '</div>', 'text/html');
    var src = doc.body.firstChild;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) return;
        if (n.nodeType !== 1 || !ALLOWED[n.tagName]) {
          if (n.nodeType === 1) { var t = doc.createTextNode(n.textContent); node.replaceChild(t, n); }
          else node.removeChild(n);
          return;
        }
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          var keep = (a.name === 'class') || (n.tagName === 'A' && a.name === 'href' && /^https?:\/\//i.test(a.value));
          if (!keep) n.removeAttribute(a.name);
        });
        if (n.tagName === 'A') { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener'); }
        walk(n);
      });
    }
    walk(src);
    return src.innerHTML;
  }

  // ---------- practiced progress ----------
  function loadDone() { try { var v = JSON.parse(localStorage.getItem(STORE) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function saveDone(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} }
  var done = loadDone();

  // ---------- UI scaffold ----------
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function uniq(arr) { return arr.filter(function (v, i) { return v && arr.indexOf(v) === i; }); }

  var sites = uniq(Q.map(function (x) { return x.source && x.source.site; }));
  var cats = uniq(Q.map(function (x) { return x.category; }));

  var bar = el('div', 'iv-toolbar');
  var search = el('input', 'cmd-ref-search iv-search');
  search.type = 'search'; search.placeholder = '\uD83D\uDD0D Search questions and answers\u2026'; search.setAttribute('aria-label', 'Search interview questions');

  function makeSelect(label, opts) {
    var wrap = el('label', 'iv-select');
    wrap.appendChild(el('span', '', label));
    var s = document.createElement('select');
    var all = document.createElement('option'); all.value = ''; all.textContent = 'All'; s.appendChild(all);
    opts.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    wrap.appendChild(s);
    return { wrap: wrap, sel: s };
  }
  var fLevel = makeSelect('Difficulty', LEVELS.filter(function (l) { return Q.some(function (x) { return x.level === l; }); }).map(function (l) { return [l, LEVEL_LABEL[l]]; }));
  var fSite = makeSelect('Source', sites.map(function (s) { return [s, s + ' (' + Q.filter(function (x) { return x.source && x.source.site === s; }).length + ')']; }));
  var fCat = makeSelect('Topic', cats.map(function (c) { return [c, c]; }));
  var fState = makeSelect('Show', [['todo', 'Not practiced yet'], ['done', 'Practiced']]);

  var actions = el('div', 'iv-actions');
  var btnExpand = el('button', 'toggle-btn', 'Show all answers'); btnExpand.type = 'button';
  var btnRandom = el('button', 'toggle-btn', '\uD83C\uDFB2 Random question'); btnRandom.type = 'button';
  var btnReset = el('button', 'toggle-btn iv-reset', 'Reset progress'); btnReset.type = 'button';
  actions.appendChild(btnExpand); actions.appendChild(btnRandom); actions.appendChild(btnReset);

  var filters = el('div', 'iv-filters');
  [fLevel, fSite, fCat, fState].forEach(function (f) { filters.appendChild(f.wrap); });

  var progress = el('div', 'iv-progress');
  var progText = el('div', 'iv-progress-text');
  var progBar = el('div', 'progress-bar'); var progFill = el('div', 'progress-fill'); progBar.appendChild(progFill);
  progress.appendChild(progText); progress.appendChild(progBar);

  bar.appendChild(search); bar.appendChild(filters); bar.appendChild(actions); bar.appendChild(progress);
  var count = el('p', 'iv-count');
  count.setAttribute('aria-live', 'polite');
  var list = el('div', 'iv-list');
  root.appendChild(bar); root.appendChild(count); root.appendChild(list);

  // ---------- items ----------
  var items = Q.map(function (x, i) {
    var det = el('details', 'iv-item card');
    det.id = 'q-' + x.id;
    var sum = document.createElement('summary');
    var num = el('span', 'iv-num', String(i + 1));
    var title = el('span', 'iv-q', x.q);
    var tags = el('span', 'iv-tags');
    if (x.level) tags.appendChild(el('span', 'badge ' + ({ easy: 'beginner', medium: 'intermediate', hard: 'advanced' }[x.level] || ''), LEVEL_LABEL[x.level] || x.level));
    if (x.type) tags.appendChild(el('span', 'iv-type', x.type));
    if (x.category) tags.appendChild(el('span', 'iv-cat', x.category));
    var tick = el('span', 'iv-tick'); tick.setAttribute('aria-hidden', 'true');
    sum.appendChild(num); sum.appendChild(title); sum.appendChild(tags); sum.appendChild(tick);
    det.appendChild(sum);

    var body = el('div', 'iv-body');
    var ans = el('div', 'iv-answer');
    ans.innerHTML = sanitize(x.answer);
    body.appendChild(ans);

    var foot = el('div', 'iv-foot');
    if (x.source && x.source.url && /^https?:\/\//i.test(x.source.url)) {
      var a = el('a', 'iv-source');
      a.href = x.source.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Source: ' + (x.source.site || 'link') + (x.source.label ? ' \u2014 ' + x.source.label : '') + ' \u2197';
      foot.appendChild(a);
    }
    if (x.tryIt && data.playground) {
      var t = el('a', 'iv-try', '\u25B6 Try it in the playground');
      t.href = data.playground + '#try=' + encodeURIComponent(x.id);
      foot.appendChild(t);
    }
    var mark = el('button', 'iv-mark'); mark.type = 'button';
    mark.addEventListener('click', function () {
      if (done[x.id]) delete done[x.id]; else done[x.id] = Date.now();
      saveDone(done); paintItem(rec); paintProgress(); if (fState.sel.value) apply();
    });
    foot.appendChild(mark);
    body.appendChild(foot);
    det.appendChild(body);
    list.appendChild(det);
    var rec = { x: x, det: det, mark: mark, text: (x.q + ' ' + (x.category || '') + ' ' + ans.textContent).toLowerCase() };
    paintItem(rec);
    return rec;
  });

  function paintItem(r) {
    var on = !!done[r.x.id];
    r.det.classList.toggle('iv-done', on);
    r.mark.textContent = on ? '\u2714 Practiced \u2014 undo' : 'Mark as practiced';
    r.mark.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function paintProgress() {
    var n = Q.filter(function (x) { return done[x.id]; }).length;
    progText.textContent = 'Practiced ' + n + ' of ' + Q.length;
    progFill.style.width = (Q.length ? Math.round(100 * n / Q.length) : 0) + '%';
  }

  function apply() {
    var q = search.value.trim().toLowerCase();
    var lv = fLevel.sel.value, st = fSite.sel.value, ct = fCat.sel.value, sv = fState.sel.value;
    var shown = 0;
    items.forEach(function (r) {
      var ok = (!q || r.text.indexOf(q) !== -1) &&
        (!lv || r.x.level === lv) &&
        (!st || (r.x.source && r.x.source.site === st)) &&
        (!ct || r.x.category === ct) &&
        (!sv || (sv === 'done') === !!done[r.x.id]);
      r.det.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = 'Showing ' + shown + ' of ' + Q.length + ' questions';
  }

  search.addEventListener('input', apply);
  [fLevel, fSite, fCat, fState].forEach(function (f) { f.sel.addEventListener('change', apply); });

  var expanded = false;
  btnExpand.addEventListener('click', function () {
    expanded = !expanded;
    items.forEach(function (r) { if (!r.det.hidden) r.det.open = expanded; });
    btnExpand.textContent = expanded ? 'Hide all answers' : 'Show all answers';
  });
  btnRandom.addEventListener('click', function () {
    var pool = items.filter(function (r) { return !r.det.hidden && !done[r.x.id]; });
    if (!pool.length) pool = items.filter(function (r) { return !r.det.hidden; });
    if (!pool.length) return;
    items.forEach(function (r) { r.det.open = false; });
    var pick = pool[Math.floor(Math.random() * pool.length)];
    pick.det.scrollIntoView({ block: 'start' });
    pick.det.classList.add('bm-flash');
    setTimeout(function () { pick.det.classList.remove('bm-flash'); }, 1600);
    pick.det.querySelector('summary').focus();
  });
  btnReset.addEventListener('click', function () {
    var mine = Q.filter(function (x) { return done[x.id]; });
    if (!mine.length) return;
    if (!window.confirm('Clear practiced progress for all ' + mine.length + ' questions on this page?')) return;
    mine.forEach(function (x) { delete done[x.id]; });
    saveDone(done); items.forEach(paintItem); paintProgress(); apply();
  });

  // deep link: interview.html#q-<id> opens that question
  function openHash() {
    var h = location.hash.slice(1);
    if (!h) return;
    var t = document.getElementById(h);
    if (t && t.tagName === 'DETAILS') { t.open = true; t.scrollIntoView({ block: 'start' }); }
  }

  paintProgress(); apply(); openHash();
  window.addEventListener('hashchange', openHash);
})();
