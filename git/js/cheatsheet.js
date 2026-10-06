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
    ["git tag v1.0.0", "Mark a specific commit with a permanent, named reference"],
    ["git config --global user.name \"Name\"", "Set the name stamped onto your commits"],
    ["git config --global user.email \"you@x.com\"", "Set the email stamped onto your commits"],
    ["git config --global init.defaultBranch main", "Make new repos start on 'main'"],
    ["git config --global core.autocrlf true", "Windows: normalise CRLF/LF line endings"],
    ["git config --global core.editor \"code --wait\"", "Use VS Code for commit messages / rebases"],
    ["git config --list --show-origin", "List all config and which file each value came from"],
    ["git restore <file>", "Discard uncommitted changes to a file (permanent)"],
    ["git restore --staged <file>", "Unstage a file, keeping your edits"],
    ["git restore --source=HEAD~2 <file>", "Restore a file as it was 2 commits ago"],
    ["git switch <name>", "Switch to an existing branch"],
    ["git switch -c <name>", "Create AND switch to a new branch"],
    ["git switch -", "Switch back to the previous branch"],
    ["git checkout <commit>", "Check out a commit (detached HEAD) to look around"],
    ["git branch -d <name>", "Delete a merged branch (safe)"],
    ["git branch -D <name>", "Force-delete a branch (even if unmerged)"],
    ["git branch -vv", "List branches with upstream and ahead/behind counts"],
    ["git branch -a", "List local AND remote-tracking branches"],
    ["git merge --no-ff <branch>", "Merge, forcing a merge commit even if FF is possible"],
    ["git merge --abort", "Abandon an in-progress merge, restore pre-merge state"],
    ["git checkout --ours <file>", "In a conflict, keep your whole version of a file"],
    ["git checkout --theirs <file>", "In a conflict, keep their whole version of a file"],
    ["git rebase --continue", "Proceed to the next commit after resolving a rebase conflict"],
    ["git rebase --abort", "Bail out of a rebase, back to the pre-rebase state"],
    ["git pull --rebase", "Fetch then replay your commits on top (linear history)"],
    ["git fetch upstream", "Download commits from a second remote (e.g. a fork's source)"],
    ["git remote add <name> <url>", "Register a new remote"],
    ["git remote set-url origin <url>", "Change a remote's URL (e.g. HTTPS → SSH)"],
    ["git push origin --delete <branch>", "Delete a branch on the remote"],
    ["git push origin <tag>", "Push a single tag (plain push never sends tags)"],
    ["git push origin --tags", "Push all tags"],
    ["git push --force-with-lease", "Safer force-push: refuses if someone else pushed"],
    ["git tag -a v1.0.0 -m \"msg\"", "Create an annotated tag (the right kind for releases)"],
    ["git tag -d <name>", "Delete a tag locally"],
    ["git describe --tags", "Human-readable version string from the nearest tag"],
    ["git reset --mixed HEAD~1", "Undo last commit, keep changes unstaged (default)"],
    ["git revert <hash>", "Safely undo a commit by creating a new counter-commit"],
    ["git stash push -m \"msg\"", "Shelve changes with a descriptive label"],
    ["git stash list", "List all shelved stashes"],
    ["git stash apply", "Reapply the latest stash but KEEP it on the stack"],
    ["git stash -u", "Stash untracked files too"],
    ["git stash branch <name>", "Create a branch from a stash's original base and apply it"],
    ["git cherry-pick <hash>", "Apply one specific commit onto your current branch"],
    ["git rm --cached <file>", "Stop tracking a file but keep it on disk"],
    ["git mv <old> <new>", "Rename/move a tracked file"],
    ["git clean -fd", "Delete untracked files and directories (careful!)"],
    ["git blame <file>", "Show which commit last changed each line"],
    ["git log -S\"text\"", "Find commits that added/removed a string (pickaxe)"],
    ["git log --oneline main..feature", "Commits on feature not yet on main"],
    ["git check-ignore -v <path>", "Show which .gitignore rule excludes a path"],
    ["git bisect start", "Binary-search commit history to find a bug's origin"],
    ["git bisect good <hash>", "Mark a commit as working during a bisect"],
    ["git bisect bad", "Mark the current commit as broken during a bisect"],
    ["git bisect reset", "End a bisect and return to where you started"],
    ["git worktree add ../dir <branch>", "Check out another branch in a second working tree"],
    ["git submodule update --init", "Clone/initialise a repo's submodules"],
    ["git hash-object -w <file>", "Store content as a blob, return its SHA-1 (plumbing)"],
    ["git cat-file -p <hash>", "Pretty-print any Git object by its hash"],
    ["git gc", "Garbage-collect: pack loose objects, prune unreachable"],
    ["git fsck", "Verify integrity of the object database"]
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
