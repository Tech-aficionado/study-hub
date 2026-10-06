document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDC19</span><div><h1>GitHub Study</h1><span>Beginner \u2192 Advanced</span></div></div>',

    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is GitHub?</a>',
    '<a class="nav-item" href="account.html">\u2461 Account, 2FA & Keys</a>',
    '<a class="nav-item" href="repos.html">\u2462 Repos & Forking</a>',
    '<a class="nav-item" href="repositories.html">\u2463 Repositories & Visibility</a>',
    '<a class="nav-item" href="readme-markdown.html">\u2464 README & Markdown</a>',
    '<a class="nav-item" href="forks.html">\u2465 Forks & Syncing</a>',

    '<div class="nav-title">Collaboration</div>',
    '<a class="nav-item" href="issues.html">\u2466 Issues & Labels</a>',
    '<a class="nav-item" href="pull-requests.html">\u2467 Pull Requests</a>',
    '<a class="nav-item" href="pull-requests-depth.html">\u2468 PRs In Depth</a>',
    '<a class="nav-item" href="code-review.html">\u2469 Code Review</a>',
    '<a class="nav-item" href="branch-protection.html">\u246A Branch Protection &amp; CODEOWNERS</a>',
    '<a class="nav-item" href="merge-strategies.html">\u246B Merge Strategies</a>',
    '<a class="nav-item" href="collaboration.html">\u246C Issues, Projects &amp; Teams</a>',

    '<div class="nav-title">Automation</div>',
    '<a class="nav-item" href="actions.html">\u246D Actions Basics</a>',
    '<a class="nav-item" href="actions-depth.html">\u246E Actions In Depth</a>',
    '<a class="nav-item" href="actions-deploy.html">\u246F Deploy with Actions</a>',
    '<a class="nav-item" href="pages.html">\u2470 GitHub Pages</a>',

    '<div class="nav-title">Platform</div>',
    '<a class="nav-item" href="packages.html">\u2471 Packages &amp; GHCR</a>',
    '<a class="nav-item" href="releases.html">\u2472 Releases &amp; Tags</a>',
    '<a class="nav-item" href="projects.html">\u2473 Projects, Discussions &amp; Wikis</a>',

    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="security.html">Security &amp; Scanning</a>',
    '<a class="nav-item" href="gh-cli.html">gh CLI In Depth</a>',
    '<a class="nav-item" href="codespaces.html">Codespaces</a>',
    '<a class="nav-item" href="open-source.html">Open Source &amp; Licenses</a>',
    '<a class="nav-item" href="advanced.html">CLI, Pages &amp; Security (overview)</a>',

    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="playground.html">\uD83D\uDD79\uFE0F Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83D\uDCBC Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6 Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Labs</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
