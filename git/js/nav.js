document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83C\uDF3F</span><div><h1>Git Study</h1><span>Beginner \u2192 Advanced</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is Git?</a>',
    '<a class="nav-item" href="basics.html">\u2461 Basic Workflow</a>',
    '<div class="nav-title">Core Workflow</div>',
    '<a class="nav-item" href="branching.html">\u2462 Branching & Merging</a>',
    '<a class="nav-item" href="remote.html">\u2463 Remotes & Collaboration</a>',
    '<a class="nav-item" href="undoing.html">\u2464 Undoing Mistakes</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="advanced.html">\u2465 Advanced Git</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Command Cheatsheet</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
