// Injects the shared sidebar nav into every page's #sidebar element.
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDCB0</span><div><h1>Financial Literacy</h1><span>OSB002 \u00B7 3 Credits</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 Meaning & Importance</a>',
    '<div class="nav-title">Financial Statements</div>',
    '<a class="nav-item" href="financial-statements.html">\u2461 Analysis of Statements</a>',
    '<a class="nav-item" href="accounting-types.html">\u2462 Financial vs Cost vs Mgmt</a>',
    '<div class="nav-title">Planning & Control</div>',
    '<a class="nav-item" href="budgeting.html">\u2463 Budget & Budgetary Control</a>',
    '<a class="nav-item" href="costing-decisions.html">\u2464 Marginal Costing & Decisions</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Formula Cheatsheet</a>',
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
