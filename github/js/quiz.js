(function () {
  var quizData = [
    { q: "What is the main distinction between Git and GitHub?", opts: ["They are the same product with different names", "Git is the version control tool; GitHub is a hosting/collaboration service built on top of it", "GitHub works offline, Git requires internet", "Git is only for Windows, GitHub for Mac"], correct: 1 },
    { q: "What does 'forking' a repo do?", opts: ["Deletes the original repo", "Creates a full copy of the repo under your own account", "Merges two repos into one", "Only copies the README file"], correct: 1 },
    { q: "What's the purpose of a Draft Pull Request?", opts: ["It can never be merged", "Signals the PR is work-in-progress and not ready for full review yet", "It automatically deletes after a week", "It hides the PR from everyone"], correct: 1 },
    { q: "Which merge strategy combines ALL of a PR's commits into a single clean commit?", opts: ["Merge commit", "Squash and merge", "Rebase and merge", "Fast-forward only"], correct: 1 },
    { q: "What does writing 'Fixes #42' in a PR description do?", opts: ["Nothing, it's just a comment", "Automatically closes issue #42 when the PR merges", "Deletes issue #42 immediately", "Assigns issue #42 to you"], correct: 1 },
    { q: "What triggers a GitHub Actions workflow?", opts: ["Only manual button clicks", "Events like push, pull_request, or a schedule, defined in the 'on:' section", "GitHub runs all workflows every hour automatically", "Only when a repo becomes public"], correct: 1 },
    { q: "Where should you store an API key used inside a GitHub Actions workflow?", opts: ["Hardcoded directly in the YAML file", "In GitHub Secrets, referenced via ${{ secrets.NAME }}", "In the README for documentation", "In a public gist"], correct: 1 },
    { q: "What does a branch protection rule on 'main' typically enforce?", opts: ["Nothing, it's just cosmetic", "Required passing CI checks and approving reviews before merge", "It makes the branch read-only forever", "It automatically deletes old commits"], correct: 1 },
    { q: "What is a CODEOWNERS file used for?", opts: ["Listing repo contributors publicly", "Automatically requesting review from specific people/teams for matching file paths", "Blocking all pull requests", "Setting the repo's license"], correct: 1 },
    { q: "If GitHub's secret scanning flags a leaked API key in your commit history, what should you do first?", opts: ["Just delete the commit from history, nothing else needed", "Immediately rotate/revoke the credential — it may already be exposed/cached", "Ignore it if the repo is private", "Rename the file containing it"], correct: 1 }
  ];

  var quizScore = 0;
  var quizContainer = document.getElementById('quizContainer');

  function buildQuiz() {
    if (!quizContainer) return;
    quizContainer.innerHTML = '';
    quizData.forEach(function (item, qi) {
      var block = document.createElement('div');
      block.className = 'quiz-q';
      block.innerHTML = '<strong>Q' + (qi + 1) + '. ' + item.q + '</strong><div class="quiz-opts"></div><div class="quiz-result" id="qres' + qi + '"></div>';
      var optsWrap = block.querySelector('.quiz-opts');
      item.opts.forEach(function (opt, oi) {
        var d = document.createElement('div');
        d.className = 'quiz-opt';
        d.textContent = opt;
        d.addEventListener('click', function () { answerQuiz(qi, oi, optsWrap); });
        optsWrap.appendChild(d);
      });
      quizContainer.appendChild(block);
    });
    var qt = document.getElementById('quizTotal');
    if (qt) qt.textContent = quizData.length;
  }

  function answerQuiz(qi, oi, wrap) {
    if (wrap.dataset.locked) return;
    wrap.dataset.locked = '1';
    var item = quizData[qi];
    Array.prototype.forEach.call(wrap.children, function (c, i) {
      if (i === item.correct) c.classList.add('correct');
      else if (i === oi) c.classList.add('wrong');
    });
    var res = document.getElementById('qres' + qi);
    if (oi === item.correct) {
      quizScore++;
      res.textContent = '✅ Correct!';
      res.style.color = '#3fdd94';
    } else {
      res.textContent = '❌ Correct answer: ' + item.opts[item.correct];
      res.style.color = '#ff6b6b';
    }
    var qs = document.getElementById('quizScore');
    if (qs) qs.textContent = quizScore;
  }

  var resetBtn = document.getElementById('resetQuizBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      quizScore = 0;
      var qs = document.getElementById('quizScore');
      if (qs) qs.textContent = 0;
      buildQuiz();
    });
  }

  buildQuiz();
})();
