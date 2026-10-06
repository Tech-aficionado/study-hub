document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\u2638\uFE0F</span><div><h1>Kubernetes Study</h1><span>Beginner \u2192 Advanced</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 Why Kubernetes?</a>',
    '<a class="nav-item" href="architecture.html">\u2461 Architecture</a>',
    '<div class="nav-title">Core Concepts</div>',
    '<a class="nav-item" href="pods-deployments.html">\u2462 Pods & Deployments</a>',
    '<a class="nav-item" href="services-networking.html">\u2463 Services & Networking</a>',
    '<a class="nav-item" href="config-storage.html">\u2464 Config & Storage</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="advanced.html">\u2465 Helm, RBAC & Scaling</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB kubectl Cheatsheet</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
