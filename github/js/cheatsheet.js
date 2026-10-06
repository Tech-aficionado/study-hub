(function () {
  var commands = [
    ["gh auth login", "Authenticate the GitHub CLI with your account"],
    ["gh repo create <name> --public", "Create a new public repo on GitHub"],
    ["gh repo clone <owner>/<repo>", "Clone a repo by its owner/name shorthand"],
    ["gh repo fork <owner>/<repo>", "Fork a repo to your account"],
    ["gh pr create", "Open a pull request from the current branch"],
    ["gh pr list", "List open pull requests"],
    ["gh pr view <number>", "View details of a specific PR"],
    ["gh pr checkout <number>", "Check out a PR's branch locally"],
    ["gh pr merge <number> --squash", "Merge a PR using squash strategy"],
    ["gh pr review --approve", "Approve a pull request"],
    ["gh issue create", "Create a new issue"],
    ["gh issue list", "List open issues"],
    ["gh issue close <number>", "Close an issue"],
    ["gh run list", "List recent Actions workflow runs"],
    ["gh run watch", "Live-tail a running workflow"],
    ["gh run view <id> --log", "View the full log of a workflow run"],
    ["gh workflow run <name>", "Manually trigger a workflow_dispatch workflow"],
    ["gh release create v1.0.0", "Create a new GitHub release"],
    ["gh secret set NAME", "Set an Actions secret for the repo"],
    ["gh api repos/{owner}/{repo}", "Call the GitHub REST API directly ({owner}/{repo} fill in from the current repo)"],
    ["# Fixes #42 (in a PR description)", "Auto-closes issue #42 when this PR merges"],
    ["# .github/workflows/*.yml", "Location for all GitHub Actions workflow files"],
    ["# .github/CODEOWNERS", "Maps file paths to required reviewers"],
    ["${{ secrets.NAME }}", "Reference a stored secret inside a workflow YAML"],
    ["on: push / pull_request / schedule", "The three most common workflow trigger types"]
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
