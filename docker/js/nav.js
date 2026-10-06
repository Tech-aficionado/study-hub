// Injects the shared sidebar nav into every page's #sidebar element.
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDC33</span><div><h1>Docker Study</h1><span>Beginner \u2192 Advanced</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is Docker?</a>',
    '<a class="nav-item" href="architecture.html">\u2461 Architecture</a>',
    '<a class="nav-item" href="install.html">\u2462 Install & Setup</a>',
    '<div class="nav-title">Core Concepts</div>',
    '<a class="nav-item" href="images.html">\u2463 Images & Layers</a>',
    '<a class="nav-item" href="containers.html">\u2464 Containers</a>',
    '<a class="nav-item" href="dockerfile.html">\u2465 Dockerfile</a>',
    '<a class="nav-item" href="volumes.html">\u2466 Volumes & Storage</a>',
    '<a class="nav-item" href="networking.html">\u2467 Networking</a>',
    '<div class="nav-title">Intermediate</div>',
    '<a class="nav-item" href="compose.html">\u2468 Docker Compose</a>',
    '<a class="nav-item" href="registry.html">\u2469 Registries & Hub</a>',
    '<a class="nav-item" href="multistage.html">\u246A Multi-stage Builds</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="swarm.html">\u246B Swarm & Orchestration</a>',
    '<a class="nav-item" href="security.html">\u246C Security Hardening</a>',
    '<a class="nav-item" href="performance.html">\u246D Performance</a>',
    '<a class="nav-item" href="cicd.html">\u246E CI/CD Integration</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="terminal.html">\uD83D\uDCBB CLI Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Command Cheatsheet</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Hands-on Labs</a>'
  ].join('');

  // Re-apply active highlighting now that nav exists (common.js ran before this on DOMContentLoaded order
  // is not guaranteed, so do it here too).
  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
