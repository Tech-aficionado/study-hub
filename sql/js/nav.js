document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDDC4\uFE0F</span><div><h1>SQL Study</h1><span>Beginner \u2192 Advanced</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is SQL?</a>',
    '<a class="nav-item" href="queries.html">\u2461 Basic Queries</a>',
    '<div class="nav-title">Core Concepts</div>',
    '<a class="nav-item" href="joins.html">\u2462 Joins</a>',
    '<a class="nav-item" href="aggregation.html">\u2463 Aggregation & Subqueries</a>',
    '<div class="nav-title">Design</div>',
    '<a class="nav-item" href="schema-design.html">\u2464 Schema Design</a>',
    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="advanced.html">\u2465 Indexes, Transactions & Views</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Syntax Cheatsheet</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
