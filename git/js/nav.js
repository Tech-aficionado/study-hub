document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83C\uDF3F</span><div><h1>Git Study</h1><span>Beginner \u2192 Advanced</span></div></div>',

    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 What is Git?</a>',
    '<a class="nav-item" href="install.html">\u2461 Install &amp; First-time Config</a>',
    '<a class="nav-item" href="basics.html">\u2462 Basic Workflow</a>',

    '<div class="nav-title">The Core Model</div>',
    '<a class="nav-item" href="three-areas.html">\u2463 Three Areas &amp; Staging</a>',
    '<a class="nav-item" href="commits.html">\u2464 Commits &amp; History</a>',
    '<a class="nav-item" href="internals.html">\u2465 Git Internals</a>',

    '<div class="nav-title">Branching</div>',
    '<a class="nav-item" href="branching.html">\u2466 Branching &amp; Merging</a>',
    '<a class="nav-item" href="merging.html">\u2467 Merging &amp; Conflicts</a>',
    '<a class="nav-item" href="rebase.html">\u2468 Rebase in Depth</a>',

    '<div class="nav-title">Sharing &amp; Remotes</div>',
    '<a class="nav-item" href="remote.html">\u2469 Remotes &amp; Collaboration</a>',
    '<a class="nav-item" href="remotes-tracking.html">\u246A Fetch, Pull &amp; Tracking</a>',

    '<div class="nav-title">Fixing &amp; Rewriting</div>',
    '<a class="nav-item" href="undoing.html">\u246B Undoing Mistakes</a>',
    '<a class="nav-item" href="stash.html">\u246C Stashing Work</a>',
    '<a class="nav-item" href="tags.html">\u246D Tags &amp; Releases</a>',

    '<div class="nav-title">Advanced</div>',
    '<a class="nav-item" href="advanced.html">\u246E Advanced Git</a>',
    '<a class="nav-item" href="gitignore.html">\u246F .gitignore &amp; .gitattributes</a>',
    '<a class="nav-item" href="workflows.html">\u2470 Team Workflows</a>',
    '<a class="nav-item" href="troubleshooting.html">\u2471 Troubleshooting</a>',

    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="playground.html">\uD83D\uDD79\uFE0F Git Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Command Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83D\uDCBC Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Labs</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
