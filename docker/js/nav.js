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
    '<a class="nav-item" href="windows-wsl.html">\u2463 Desktop vs Engine / WSL2</a>',
    '<div class="nav-title">Core Concepts</div>',
    '<a class="nav-item" href="images.html">\u2464 Images & Layers</a>',
    '<a class="nav-item" href="containers.html">\u2465 Containers</a>',
    '<a class="nav-item" href="dockerfile.html">\u2466 Dockerfile</a>',
    '<a class="nav-item" href="volumes.html">\u2467 Volumes & Storage</a>',
    '<a class="nav-item" href="networking.html">\u2468 Networking</a>',
    '<a class="nav-item" href="secrets.html">\u2469 Env Vars & Secrets</a>',
    '<div class="nav-title">Running in Production</div>',
    '<a class="nav-item" href="compose.html">\u246A Docker Compose</a>',
    '<a class="nav-item" href="healthchecks.html">\u246B Healthchecks & Restart</a>',
    '<a class="nav-item" href="logging.html">\u246C Logging & Debugging</a>',
    '<a class="nav-item" href="registry.html">\u246D Registries & Hub</a>',
    '<div class="nav-title">Building Better Images</div>',
    '<a class="nav-item" href="multistage.html">\u246E Multi-stage Builds</a>',
    '<a class="nav-item" href="buildx.html">\u246F buildx & Multi-platform</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="swarm.html">\u2470 Swarm & Orchestration</a>',
    '<a class="nav-item" href="security.html">\u2471 Security Hardening</a>',
    '<a class="nav-item" href="performance.html">\u2472 Performance</a>',
    '<a class="nav-item" href="cicd.html">\u2473 CI/CD Integration</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="terminal.html">\uD83D\uDCBB CLI Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Command Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83C\uDFAF Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Hands-on Labs</a>'
  ].join('');

  // Re-apply active highlighting now that nav exists.
  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
