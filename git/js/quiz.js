(function () {
  var quizData = [
    { q: "What does a Git commit actually store?", opts: ["A diff from the previous commit", "A full snapshot of the whole project at that moment", "Only the files that changed, as a patch", "Nothing — it's just a label"], correct: 1 },
    { q: "What is the staging area for?", opts: ["It's where deleted files go to be recovered", "A holding pen for changes you want in the NEXT commit", "A backup of your remote repository", "It only exists on GitHub, not local Git"], correct: 1 },
    { q: "What is a Git branch, technically?", opts: ["A full copy of all project files", "A lightweight, movable pointer to a specific commit", "A separate Git installation", "A compressed zip of the repo"], correct: 1 },
    { q: "What's the key difference between git merge and git rebase?", opts: ["They produce identical results always", "Merge creates a merge commit; rebase replays commits for a linear history", "Rebase is only for remote branches", "Merge deletes the source branch automatically"], correct: 1 },
    { q: "Why is rebasing a shared/pushed branch dangerous?", opts: ["It's not dangerous at all", "It rewrites commit history with new hashes, confusing anyone who already pulled the old commits", "It permanently deletes the remote repo", "Rebase cannot be undone ever"], correct: 1 },
    { q: "What's the SAFEST way to undo a commit that's already been pushed and shared?", opts: ["git reset --hard", "git revert, which creates a new undo commit", "Deleting the .git folder", "git push --force"], correct: 1 },
    { q: "What does `git reset --hard HEAD~1` do to UNCOMMITTED changes in your working files?", opts: ["Keeps them safely staged", "Permanently discards them — no recovery", "Backs them up automatically", "Nothing, it only affects commits"], correct: 1 },
    { q: "What is git stash used for?", opts: ["Permanently deleting old branches", "Temporarily shelving uncommitted changes so you can switch branches cleanly", "Compressing the repository size", "Creating a backup remote"], correct: 1 },
    { q: "If you think you 'lost' commits after a bad reset, what should you check first?", opts: ["git log (it won't show them)", "git reflog — it tracks everywhere HEAD has pointed recently", "Reinstall Git", "There is no way to recover them"], correct: 1 },
    { q: "What does git cherry-pick do?", opts: ["Deletes a specific commit from history", "Applies ONE specific commit from another branch onto your current branch", "Picks a random commit to revert", "Merges two entire branches"], correct: 1 },
    { q: "On Windows, which setting prevents 'whole file changed' noise from line endings?", opts: ["core.pager", "core.autocrlf (or a committed .gitattributes)", "core.editor", "init.defaultBranch"], correct: 1 },
    { q: "What is a Git commit's SHA-1 hash computed from?", opts: ["A random number", "The commit's content (tree + parents + author + message)", "The current wall-clock time only", "The branch name"], correct: 1 },
    { q: "A branch in Git is physically…", opts: ["A full copy of the repository", "A 41-byte file holding one commit's hash", "A compressed archive", "A remote server"], correct: 1 },
    { q: "What does `git fetch` do that `git pull` does NOT?", opts: ["Nothing — they are identical", "fetch downloads commits WITHOUT merging them into your branch", "fetch deletes local branches", "fetch pushes your commits up"], correct: 1 },
    { q: "Which object type stores a file's actual contents in Git?", opts: ["tree", "blob", "commit", "ref"], correct: 1 },
    { q: "Which object type stores filenames and directory structure?", opts: ["blob", "tree", "tag", "reflog"], correct: 1 },
    { q: "What does HEAD normally point to?", opts: ["The oldest commit", "The current branch (which points to a commit)", "The remote server", "The staging area"], correct: 1 },
    { q: "A fast-forward merge happens when…", opts: ["Both branches changed the same line", "Your branch has no new commits, so the pointer just moves forward", "You use --no-ff", "There is a conflict"], correct: 1 },
    { q: "Inside a conflict, text between <<<<<<< HEAD and ======= is…", opts: ["Their version", "Your (current branch) version", "The common ancestor", "Automatically deleted"], correct: 1 },
    { q: "To escape a half-done merge and return to the pre-merge state, run:", opts: ["git merge --continue", "git merge --abort", "git reset --hard origin", "git clean -f"], correct: 1 },
    { q: "`git commit --amend` does what?", opts: ["Adds a brand-new commit", "Replaces the most recent commit with a new one (new hash)", "Pushes to the remote", "Creates a branch"], correct: 1 },
    { q: "Why use an annotated tag over a lightweight tag for releases?", opts: ["It's shorter to type", "It stores tagger, date, message and can be signed", "It moves with the branch", "Lightweight tags can't point to commits"], correct: 1 },
    { q: "In SemVer 2.4.1, which number bumps on a BREAKING change?", opts: ["The last (1 → PATCH)", "The first (2 → MAJOR)", "The middle (4 → MINOR)", "None, you add a letter"], correct: 1 },
    { q: "Adding a file to .gitignore when it's ALREADY tracked will…", opts: ["Immediately stop tracking it", "Do nothing until you run git rm --cached on it", "Delete it from disk", "Rewrite history"], correct: 1 },
    { q: "'detached HEAD' means…", opts: ["Your repo is corrupted", "HEAD points directly at a commit, not a branch", "You deleted main", "The remote is gone"], correct: 1 },
    { q: "A push rejected as 'non-fast-forward' means…", opts: ["Your network is down", "The remote has commits you don't have — pull first", "The branch is protected forever", "You must delete .git"], correct: 1 },
    { q: "The SAFER alternative to `git push --force` is:", opts: ["git push --mirror", "git push --force-with-lease", "git push -u", "git push --all"], correct: 1 },
    { q: "'refusing to merge unrelated histories' is fixed with:", opts: ["--force", "git pull --allow-unrelated-histories", "deleting the remote", "git gc"], correct: 1 },
    { q: "`git pull --rebase` instead of a plain pull gives you…", opts: ["A merge commit every time", "A linear history by replaying your local commits on top", "A deleted branch", "A force push"], correct: 1 },
    { q: "`git bisect` finds a bug-introducing commit by…", opts: ["Checking commits at random", "Binary search — you mark each tested commit good/bad", "Reading commit messages", "Running the test suite on every commit automatically"], correct: 1 },
    { q: "By default, `git stash` leaves which files behind?", opts: ["Staged files", "Untracked (new) files — use -u to include them", "All tracked files", "Nothing, it stashes everything"], correct: 1 },
    { q: "Which command shows which rule is causing a path to be ignored?", opts: ["git ignore-debug", "git check-ignore -v <path>", "git status --ignored-why", "git log --ignore"], correct: 1 },
    { q: "In the three-areas model, `git add` moves a change from…", opts: ["Repository to working dir", "Working directory to the staging area (index)", "Staging to the remote", "Remote to local"], correct: 1 },
    { q: "`git reset --mixed HEAD~1` (the default) does what to your files?", opts: ["Deletes them permanently", "Keeps the changes in your working dir but unstaged", "Keeps them staged", "Pushes them"], correct: 1 },
    { q: "GitHub Flow is best described as…", opts: ["Two permanent branches plus release/hotfix branches", "One deployable main branch + short-lived feature branches via PRs", "Committing straight to production", "No branches at all"], correct: 1 },
    { q: "Trunk-based development relies heavily on…", opts: ["Long-lived branches", "Feature flags and strong automated CI", "Manual testing only", "Never merging"], correct: 1 }
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
