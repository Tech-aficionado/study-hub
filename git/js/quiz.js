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
    { q: "What does git cherry-pick do?", opts: ["Deletes a specific commit from history", "Applies ONE specific commit from another branch onto your current branch", "Picks a random commit to revert", "Merges two entire branches"], correct: 1 }
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
