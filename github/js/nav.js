document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDC19</span><div><h1>GitHub Study</h1><span>Beginner \u2192 Advanced</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is GitHub?</a>',
    '<a class="nav-item" href="repos.html">\u2461 Repos & Forking</a>',
    '<div class="nav-title">Collaboration</div>',
    '<a class="nav-item" href="pull-requests.html">\u2462 Pull Requests</a>',
    '<a class="nav-item" href="collaboration.html">\u2463 Issues & Teams</a>',
    '<div class="nav-title">Automation</div>',
    '<a class="nav-item" href="actions.html">\u2464 GitHub Actions</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="advanced.html">\u2465 CLI, Pages & Security</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Reference Cheatsheet</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
