// Injects the shared sidebar nav into every page's #sidebar element.
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\u2601\uFE0F</span><div><h1>Cloud Computing</h1><span>BTCS701 \u00B7 3 Credits</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is Cloud Computing?</a>',
    '<a class="nav-item" href="services.html">\u2461 Cloud Services</a>',
    '<div class="nav-title">Using the Cloud</div>',
    '<a class="nav-item" href="collaboration.html">\u2462 Collaborating via Cloud</a>',
    '<a class="nav-item" href="virtualization.html">\u2463 Virtualization</a>',
    '<div class="nav-title">Security & Standards</div>',
    '<a class="nav-item" href="security.html">\u2464 Security & Standards</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Quick Reference</a>',
    '<a class="nav-item" href="interview.html">\uD83C\uDFAF Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>'
  ].join('');

  // Re-apply active highlighting now that nav exists.
  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
