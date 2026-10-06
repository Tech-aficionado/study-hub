// Shared behavior across all pages: mobile sidebar toggle, copy buttons, highlight active nav link.

document.addEventListener('DOMContentLoaded', function () {
  // Inject the Study Hub breadcrumb bar at the top of every page.
  var hubBar = document.createElement('div');
  hubBar.className = 'hub-bar';
  var pageTitleEl = document.querySelector('.page-title');
  var pageName = pageTitleEl ? pageTitleEl.textContent.replace(/^[\u2460-\u2473\u25B6\uFE0F\uD83D\uDCBB\uD83E\uDDE0\uD83E\uDDEA\uD83D\uDCCB\s]+/, '').trim() : document.title;
  hubBar.innerHTML = '<a href="../index.html">\u2190 Study Hub</a><span class="sep">/</span><span>\uD83D\uDC33 Docker Study</span><span class="sep">/</span><span class="cur">' + pageName + '</span>';
  document.body.insertBefore(hubBar, document.body.firstChild);

  // Highlight the current page in the sidebar based on filename.
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(function (item) {
    var href = item.getAttribute('href');
    if (href && href.split('/').pop() === here) {
      item.classList.add('active');
    }
  });

  // Mobile sidebar toggle.
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Copy-to-clipboard buttons on code blocks.
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.parentElement;
      var text = pre.innerText.replace(/^Copy\s*/, '').trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          var old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = old; }, 1200);
        });
      }
    });
  });

  // Security checklist persistence (localStorage), only present on the security page.
  document.querySelectorAll('#securityChecklist input').forEach(function (cb) {
    var key = 'docker_cl_' + cb.id;
    try { cb.checked = localStorage.getItem(key) === '1'; } catch (e) {}
    if (cb.checked) cb.nextElementSibling.classList.add('done');
    cb.addEventListener('change', function () {
      try { localStorage.setItem(key, cb.checked ? '1' : '0'); } catch (e) {}
      cb.nextElementSibling.classList.toggle('done', cb.checked);
    });
  });
});
