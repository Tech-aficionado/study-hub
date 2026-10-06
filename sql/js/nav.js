document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDDC4\uFE0F</span><div><h1>SQL Study</h1><span>Beginner \u2192 Advanced</span></div></div>',

    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is SQL?</a>',
    '<a class="nav-item" href="databases.html">\u2461 Databases & DBMS</a>',
    '<a class="nav-item" href="setup.html">\u2462 Setup & Tools</a>',
    '<a class="nav-item" href="datatypes.html">\u2463 Data Types</a>',

    '<div class="nav-title">Querying Data</div>',
    '<a class="nav-item" href="queries.html">\u2464 Basic Queries</a>',
    '<a class="nav-item" href="filtering.html">\u2465 Filtering</a>',
    '<a class="nav-item" href="sorting.html">\u2466 Sorting & Pagination</a>',
    '<a class="nav-item" href="functions.html">\u2467 Functions</a>',
    '<a class="nav-item" href="grouping.html">\u2468 GROUP BY & HAVING</a>',

    '<div class="nav-title">Combining Data</div>',
    '<a class="nav-item" href="joins.html">\u2469 Joins (intro)</a>',
    '<a class="nav-item" href="joins-advanced.html">\u246A Joins In Depth</a>',
    '<a class="nav-item" href="subqueries.html">\u246B Subqueries</a>',
    '<a class="nav-item" href="ctes.html">\u246C CTEs & Recursion</a>',
    '<a class="nav-item" href="set-operations.html">\u246D Set Operations</a>',
    '<a class="nav-item" href="window-functions.html">\u246E Window Functions</a>',
    '<a class="nav-item" href="aggregation.html">\u246F Aggregation & Subqueries</a>',

    '<div class="nav-title">Design & Modify</div>',
    '<a class="nav-item" href="ddl.html">\u2470 CREATE TABLE & Constraints</a>',
    '<a class="nav-item" href="dml.html">\u2471 INSERT / UPDATE / DELETE</a>',
    '<a class="nav-item" href="schema-design.html">\u2472 Schema Design</a>',
    '<a class="nav-item" href="normalization.html">\u2473 Normalization</a>',

    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="indexes.html">Indexes & EXPLAIN</a>',
    '<a class="nav-item" href="transactions.html">Transactions & Isolation</a>',
    '<a class="nav-item" href="views-procedures.html">Views, Procedures & Triggers</a>',
    '<a class="nav-item" href="sql-injection.html">SQL Injection & Safety</a>',
    '<a class="nav-item" href="dialects.html">Dialect Differences</a>',
    '<a class="nav-item" href="advanced.html">Indexes, Transactions & Views (overview)</a>',

    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="playground.html">\uD83C\uDFAE Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83D\uDCBC Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\uD83C\uDFAC Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Labs</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
