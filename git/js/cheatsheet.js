(function () {
  var commands = [
    ["git init", "Turn the current folder into a Git repository"],
    ["git clone <url>", "Download a full copy of a remote repository"],
    ["git status", "Show changed, staged, and untracked files"],
    ["git add <file>", "Stage a file's changes for the next commit"],
    ["git add .", "Stage ALL changed files in the current directory"],
    ["git add -p", "Interactively choose which chunks of a file to stage"],
    ["git commit -m \"msg\"", "Seal staged changes into a permanent snapshot"],
    ["git commit --amend", "Edit the most recent commit (message or added files)"],
    ["git log --oneline --graph --all", "Compact, visual history across all branches"],
    ["git diff", "Show unstaged changes line by line"],
    ["git diff --staged", "Show staged changes about to be committed"],
    ["git show <hash>", "Full detail of one specific commit"],
    ["git branch", "List local branches"],
    ["git branch <name>", "Create a new branch (doesn't switch to it)"],
    ["git switch <name>", "Switch to an existing branch"],
    ["git switch -c <name>", "Create AND switch to a new branch"],
    ["git merge <branch>", "Merge another branch into your current branch"],
    ["git rebase <branch>", "Replay your commits on top of another branch"],
    ["git rebase -i HEAD~N", "Interactively edit/squash/reorder your last N commits"],
    ["git remote -v", "List configured remotes and their URLs"],
    ["git fetch origin", "Download remote commits without merging them"],
    ["git pull", "Fetch + merge in one step"],
    ["git push origin <branch>", "Upload your branch's commits to the remote"],
    ["git push -u origin <branch>", "First push of a new branch — sets up tracking"],
    ["git restore --staged <file>", "Unstage a file (keeps your edits)"],
    ["git restore <file>", "Discard uncommitted changes to a file (permanent)"],
    ["git revert <hash>", "Safely undo a commit by creating a new counter-commit"],
    ["git reset --soft HEAD~1", "Undo last commit, keep changes staged"],
    ["git reset --hard HEAD~1", "Undo last commit AND discard the file changes"],
    ["git stash", "Temporarily shelve uncommitted changes"],
    ["git stash pop", "Reapply and remove the most recent stash"],
    ["git reflog", "History of everywhere HEAD has pointed — your safety net"],
    ["git cherry-pick <hash>", "Apply one specific commit onto your current branch"],
    ["git bisect start", "Binary-search commit history to find a bug's origin"],
    ["git tag v1.0.0", "Mark a specific commit with a permanent, named reference"]
  ];

  var tbody = document.getElementById('cmdTableBody');
  if (tbody) {
    commands.forEach(function (pair) {
      var cmd = pair[0], desc = pair[1];
      var tr = document.createElement('tr');
      tr.dataset.search = (cmd + ' ' + desc).toLowerCase();
      tr.innerHTML = '<td><code class="inline">' + cmd + '</code></td><td>' + desc + '</td>';
      tbody.appendChild(tr);
    });
  }

  var cmdSearch = document.getElementById('cmdSearch');
  if (cmdSearch) {
    cmdSearch.addEventListener('input', function (e) {
      var q = e.target.value.toLowerCase();
      document.querySelectorAll('#cmdTableBody tr').forEach(function (tr) {
        tr.style.display = tr.dataset.search.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }
})();
