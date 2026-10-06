(function () {
  var commands = [
    ["gh auth login", "Authenticate the GitHub CLI with your account"],
    ["gh auth status", "Show who you are logged in as and the token scopes"],
    ["gh auth setup-git", "Use gh as the Git credential helper for HTTPS"],
    ["ssh-keygen -t ed25519 -C \"you@example.com\"", "Generate a modern SSH key pair"],
    ["ssh -T git@github.com", "Test your SSH connection to GitHub"],
    ["cat ~/.ssh/id_ed25519.pub", "Print your PUBLIC SSH key to paste into GitHub settings"],
    ["gh repo create <name> --public", "Create a new public repo on GitHub"],
    ["gh repo create <name> --private --source=. --push", "Create a private repo from the current folder and push"],
    ["gh repo clone <owner>/<repo>", "Clone a repo by its owner/name shorthand"],
    ["gh repo fork <owner>/<repo>", "Fork a repo to your account"],
    ["gh repo view --web", "Open the current repo in the browser"],
    ["git remote add origin <url>", "Connect a local repo to its GitHub remote"],
    ["git remote add upstream <url>", "Add the original project as 'upstream' on a fork"],
    ["git remote -v", "List configured remotes and their URLs"],
    ["git push -u origin <branch>", "Push a branch and set it as upstream"],
    ["git switch -c <branch>", "Create and switch to a new branch"],
    ["git fetch upstream && git merge upstream/main", "Sync a fork with the original project"],
    ["gh pr create", "Open a pull request from the current branch"],
    ["gh pr create --draft", "Open a draft (work-in-progress) pull request"],
    ["gh pr create --fill", "Open a PR, filling title/body from commits"],
    ["gh pr ready", "Mark the current draft PR as ready for review"],
    ["gh pr list", "List open pull requests"],
    ["gh pr status", "Show PRs relevant to you"],
    ["gh pr view <number>", "View details of a specific PR"],
    ["gh pr diff <number>", "Show the diff of a PR"],
    ["gh pr checkout <number>", "Check out a PR's branch locally"],
    ["gh pr review --approve", "Approve a pull request"],
    ["gh pr review --request-changes -b \"...\"", "Request changes with a comment"],
    ["gh pr merge <number> --squash", "Merge a PR using squash strategy"],
    ["gh pr merge <number> --merge", "Merge a PR keeping all commits + a merge commit"],
    ["gh pr merge <number> --rebase", "Merge a PR by rebasing commits (linear history)"],
    ["gh pr merge <number> --squash --delete-branch", "Squash-merge and delete the feature branch"],
    ["gh issue create", "Create a new issue"],
    ["gh issue create --title \"...\" --label bug", "Create a labelled issue"],
    ["gh issue list --assignee @me", "List issues assigned to you"],
    ["gh issue close <number>", "Close an issue"],
    ["gh run list", "List recent Actions workflow runs"],
    ["gh run watch", "Live-tail a running workflow"],
    ["gh run view <id> --log", "View the full log of a workflow run"],
    ["gh run rerun <id> --failed", "Re-run only the failed jobs of a run"],
    ["gh workflow run <name> -f key=val", "Manually trigger a workflow_dispatch with inputs"],
    ["gh release create v1.0.0", "Create a new GitHub release"],
    ["gh release create v1.0.0 --generate-notes", "Create a release with auto-generated notes"],
    ["git tag -a v1.0.0 -m \"msg\" && git push origin v1.0.0", "Create and push an annotated version tag"],
    ["gh secret set NAME", "Set an Actions secret (value read from stdin)"],
    ["gh variable set NAME", "Set an Actions configuration variable"],
    ["gh api repos/{owner}/{repo}", "Call the REST API; {owner}/{repo} auto-filled"],
    ["gh api --paginate /user/repos --jq '.[].full_name'", "Paginate the API and filter JSON with jq"],
    ["gh codespace create", "Create a cloud dev environment for the repo"],
    ["gh codespace list", "List your codespaces"],
    ["gh codespace delete -c <name>", "Delete a codespace (commit first!)"],
    ["docker login ghcr.io -u USER --password-stdin", "Log in to the GitHub Container Registry"],
    ["docker push ghcr.io/USER/img:tag", "Push an image to GHCR"],
    ["# Fixes #42 (in a PR description)", "Auto-closes issue #42 when this PR merges"],
    ["# .github/workflows/*.yml", "Location for all GitHub Actions workflow files"],
    ["# .github/CODEOWNERS", "Maps file paths to required reviewers (last match wins)"],
    ["# .github/dependabot.yml", "Configure Dependabot version/security updates"],
    ["# .github/ISSUE_TEMPLATE/*.yml", "Structured issue-form templates"],
    ["# SECURITY.md", "How to report vulnerabilities responsibly"],
    ["# .nojekyll", "Disable Jekyll on Pages so _folders are served"],
    ["${{ secrets.NAME }}", "Reference a stored secret inside a workflow YAML"],
    ["${{ vars.NAME }}", "Reference a non-sensitive variable in a workflow"],
    ["${{ matrix.os }}", "Reference the current matrix value in a job"],
    ["on: push / pull_request / schedule / workflow_dispatch", "Common workflow trigger types"],
    ["permissions: { contents: read, id-token: write }", "Least-privilege token scopes (id-token for OIDC)"],
    ["concurrency: { group: ..., cancel-in-progress: true }", "Cancel older in-flight runs in the same group"]
  ];

  var tbody = document.getElementById('cmdTableBody');
  if (tbody) {
    commands.forEach(function (pair) {
      var cmd = pair[0], desc = pair[1];
      var tr = document.createElement('tr');
      tr.dataset.search = (cmd + ' ' + desc).toLowerCase();
      var tdCmd = document.createElement('td');
      var code = document.createElement('code');
      code.className = 'inline';
      code.textContent = cmd;
      tdCmd.appendChild(code);
      var tdDesc = document.createElement('td');
      tdDesc.textContent = desc;
      tr.appendChild(tdCmd);
      tr.appendChild(tdDesc);
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
