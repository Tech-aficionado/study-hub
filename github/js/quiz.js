(function () {
  var quizData = [
    { q: "What is the main distinction between Git and GitHub?", opts: ["They are the same product with different names", "Git is the version control tool; GitHub is a hosting/collaboration service built on top of it", "GitHub works offline, Git requires internet", "Git is only for Windows, GitHub for Mac"], correct: 1 },
    { q: "What does 'forking' a repo do?", opts: ["Deletes the original repo", "Creates a full copy of the repo under your own account", "Merges two repos into one", "Only copies the README file"], correct: 1 },
    { q: "Since 2021, what can you NOT use to authenticate Git over HTTPS?", opts: ["A fine-grained PAT", "An SSH key", "Your account password", "A classic PAT"], correct: 2 },
    { q: "Which SSH file do you upload to GitHub?", opts: ["id_ed25519 (the private key)", "id_ed25519.pub (the public key)", "known_hosts", "config"], correct: 1 },
    { q: "A key advantage of a fine-grained PAT over a classic token is:", opts: ["It never expires", "You can scope it to specific repos and specific permissions", "It works without 2FA", "It is shown in plain text in logs"], correct: 1 },
    { q: "What's the purpose of a Draft Pull Request?", opts: ["It can never be merged", "Signals the PR is work-in-progress and not ready for full review yet", "It automatically deletes after a week", "It hides the PR from everyone"], correct: 1 },
    { q: "Which merge strategy combines ALL of a PR's commits into a single clean commit?", opts: ["Merge commit", "Squash and merge", "Rebase and merge", "Fast-forward only"], correct: 1 },
    { q: "Which merge strategy keeps every commit but produces a linear history with new SHAs?", opts: ["Merge commit", "Squash and merge", "Rebase and merge", "None of these"], correct: 2 },
    { q: "What does writing 'Fixes #42' in a PR description do?", opts: ["Nothing, it's just a comment", "Automatically closes issue #42 when the PR merges to the default branch", "Deletes issue #42 immediately", "Assigns issue #42 to you"], correct: 1 },
    { q: "A 'suggested change' in a review lets the reviewer:", opts: ["Delete the PR", "Propose an exact code edit the author applies in one click", "Force-merge the PR", "Change the base branch"], correct: 1 },
    { q: "What triggers a GitHub Actions workflow?", opts: ["Only manual button clicks", "Events like push, pull_request, or a schedule, defined in the 'on:' section", "GitHub runs all workflows every hour automatically", "Only when a repo becomes public"], correct: 1 },
    { q: "Where must workflow files live to be picked up?", opts: ["Anywhere in the repo", ".github/workflows/*.yml at the repo root", "workflows.yml in the root", "In the Actions tab only"], correct: 1 },
    { q: "In a job, what is the difference between 'uses' and 'run'?", opts: ["They are identical", "'uses' calls a reusable action; 'run' executes a shell command", "'run' calls an action; 'uses' runs a shell command", "'uses' is only for Docker"], correct: 1 },
    { q: "What does strategy.matrix do?", opts: ["Encrypts secrets", "Expands one job into many parallel jobs across combinations", "Caches dependencies", "Limits concurrency"], correct: 1 },
    { q: "What is actions/cache used for?", opts: ["Passing build outputs between jobs", "Storing dependencies keyed by a lockfile hash to speed up runs", "Storing secrets", "Deploying to Pages"], correct: 1 },
    { q: "What are upload-artifact / download-artifact for?", opts: ["Caching node_modules", "Moving output files (binaries, reports) between jobs or to a human", "Setting secrets", "Triggering workflows"], correct: 1 },
    { q: "How do secrets differ from variables in Actions?", opts: ["No difference", "Secrets are masked in logs; variables are shown in plain text", "Variables are masked; secrets are shown", "Secrets cannot be referenced in YAML"], correct: 1 },
    { q: "An 'environment' with required reviewers lets you:", opts: ["Run jobs faster", "Pause a deploy job until a named person approves", "Skip CI checks", "Avoid using secrets"], correct: 1 },
    { q: "Why set 'permissions:' on GITHUB_TOKEN explicitly?", opts: ["It makes jobs run faster", "To grant least privilege — only the scopes a job needs", "It is required for every workflow to run", "To hide the token from logs"], correct: 1 },
    { q: "What problem does OIDC (id-token: write) solve?", opts: ["Faster caching", "Deploying to a cloud with a short-lived token instead of a stored long-lived key", "Running on Windows runners", "Auto-generating release notes"], correct: 1 },
    { q: "What does concurrency with cancel-in-progress: true do?", opts: ["Runs more jobs in parallel", "Cancels an older in-flight run in the same group when a new one starts", "Caches dependencies", "Requires approval"], correct: 1 },
    { q: "What does a branch protection rule on 'main' typically enforce?", opts: ["Nothing, it's just cosmetic", "Required passing CI checks and approving reviews before merge", "It makes the branch read-only forever", "It automatically deletes old commits"], correct: 1 },
    { q: "Rulesets improve on classic branch protection by:", opts: ["Only working on tags", "Being layerable, targetable by pattern, and runnable in evaluate (report-only) mode", "Removing the need for reviews", "Disabling CI"], correct: 1 },
    { q: "What is a CODEOWNERS file used for?", opts: ["Listing repo contributors publicly", "Automatically requesting review from specific people/teams for matching file paths", "Blocking all pull requests", "Setting the repo's license"], correct: 1 },
    { q: "In CODEOWNERS, which pattern wins for a given file?", opts: ["The first matching line", "The last matching line", "The shortest pattern", "All of them combined"], correct: 1 },
    { q: "The modern way to deploy to GitHub Pages is:", opts: ["Force-push built files to gh-pages manually", "Set Source = GitHub Actions and deploy with upload-pages-artifact + deploy-pages", "Email the files to GitHub", "It isn't possible with Actions"], correct: 1 },
    { q: "What is GHCR?", opts: ["A GitHub chat service", "GitHub Container Registry at ghcr.io for Docker/OCI images", "A code review bot", "A CI runner type"], correct: 1 },
    { q: "A tag vs a release:", opts: ["They are the same thing", "A tag labels a commit; a release adds notes and downloadable assets on top of a tag", "A release is a Git concept, a tag is GitHub-only", "Tags cannot point at commits"], correct: 1 },
    { q: "Public code with NO license file means:", opts: ["Anyone can freely use it", "All rights reserved — others cannot legally reuse it", "It is automatically MIT", "GitHub picks a license for you"], correct: 1 },
    { q: "What is a Codespace?", opts: ["A paid GitHub Pages tier", "A cloud-hosted dev environment defined by devcontainer.json", "A type of pull request", "A secret store"], correct: 1 },
    { q: "If secret scanning flags a leaked API key in your history, what should you do first?", opts: ["Just delete the commit, nothing else needed", "Immediately rotate/revoke the credential — it may already be exposed", "Ignore it if the repo is private", "Rename the file containing it"], correct: 1 },
    { q: "Dependabot security updates do what?", opts: ["Delete vulnerable code", "Automatically open PRs bumping vulnerable dependencies to fixed versions", "Scan your own code for bugs", "Rotate your secrets"], correct: 1 },
    { q: "Which file tells researchers how to report a vulnerability?", opts: ["README.md", "SECURITY.md", "LICENSE", "CODEOWNERS"], correct: 1 }
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
