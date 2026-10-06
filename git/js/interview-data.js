// Git interview questions for the shared renderer (../js/interview.js).
// Answers are written for this site. Each source URL was verified to exist and
// to cover the topic (HackerRank Git skills directory, the official Pro Git
// book chapters, and Atlassian's Git tutorials). No URL is invented.
window.STUDYHUB_INTERVIEW = {
  topic: 'git',
  playground: 'playground.html',
  questions: [
    // ---------------- EASY · concept ----------------
    {
      id: 'git-what-is', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is Git, and what does "distributed" version control mean?',
      answer: '<p>Git is a <strong>distributed version control system</strong> that records snapshots of your project over time. "Distributed" means every clone contains the <strong>entire history</strong>, not just the latest files or a link to a central server. You can commit, branch, diff and view history completely offline; syncing with others (e.g. GitHub) is a separate step.</p><p>Contrast this with older <em>centralised</em> systems (SVN, CVS) where history lived only on a server and most operations needed a network round-trip.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' }
    },
    {
      id: 'git-vs-github', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is the difference between Git and GitHub?',
      answer: '<p><strong>Git</strong> is the version-control tool that runs on your machine. <strong>GitHub</strong> (like GitLab or Bitbucket) is a hosting service that stores Git repositories in the cloud and adds collaboration features — pull requests, issues, code review, CI. You can use Git with no GitHub account at all; GitHub without Git underneath is just a file store.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' }
    },
    {
      id: 'git-three-areas', level: 'easy', category: 'The Three Areas', type: 'concept',
      q: 'Explain the working directory, staging area, and repository.',
      answer: '<p>Git moves changes through three areas:</p><ul><li><strong>Working directory</strong> — the files you edit on disk.</li><li><strong>Staging area (index)</strong> — a holding pen for the changes that will go into the next commit; <code>git add</code> puts them here.</li><li><strong>Repository</strong> — the committed history in <code>.git/</code>; <code>git commit</code> seals the staged snapshot permanently.</li></ul><p>The staging step lets you craft a commit deliberately — committing only part of what you changed.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Recording Changes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
      tryIt: { starter: 'git init\necho "hello" > a.txt\ngit status\ngit add a.txt\ngit status\ngit commit -m "first"' }
    },
    {
      id: 'git-init-vs-clone', level: 'easy', category: 'Getting Started', type: 'concept',
      q: 'What is the difference between git init and git clone?',
      answer: '<p><code>git init</code> turns the current folder into a brand-new, empty repository (creates <code>.git/</code>). <code>git clone &lt;url&gt;</code> downloads a <em>full copy</em> of an existing remote repository — all files AND the complete history — and sets up <code>origin</code> as a remote automatically.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Getting a Repository', url: 'https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository' }
    },
    {
      id: 'git-status', level: 'easy', category: 'Everyday', type: 'concept',
      q: 'What are the three states a file can be in when you run git status?',
      answer: '<p><strong>Staged</strong> (in the index, will be committed), <strong>modified</strong> (tracked and changed but not staged), and <strong>untracked</strong> (a new file Git has never seen). <code>git status</code> groups output under "Changes to be committed", "Changes not staged for commit", and "Untracked files".</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' },
      tryIt: { starter: 'git init\necho "x" > a\ngit add a\necho "y" > b\ngit status' }
    },
    {
      id: 'git-add-dot', level: 'easy', category: 'Staging', type: 'concept',
      q: 'What does git add do, and what is the risk of git add .?',
      answer: '<p><code>git add</code> copies a change into the staging area, marking it for the next commit. <code>git add .</code> stages <em>everything</em> changed in the current directory — convenient but risky, because you can accidentally commit secrets, build artifacts, or unrelated edits. Prefer naming files, or use <code>git add -p</code> to review hunk by hunk.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Recording Changes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' }
    },
    {
      id: 'git-good-message', level: 'easy', category: 'Commits', type: 'concept',
      q: 'What makes a good commit message?',
      answer: '<p>A short imperative summary (≈50 chars) completing "If applied, this commit will…", a blank line, then a body explaining the <em>why</em>, not the <em>what</em> (the diff already shows the what). Example summary: <code>Fix login rejecting emails with a plus sign</code>. Teams often prefix with Conventional Commits (<code>feat:</code>, <code>fix:</code>) so changelogs can be generated automatically.</p>',
      source: { site: 'Pro Git', label: 'Distributed Git — Contributing to a Project', url: 'https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project' }
    },
    {
      id: 'git-gitignore', level: 'easy', category: 'Config', type: 'concept',
      q: 'What is a .gitignore file for?',
      answer: '<p>It lists patterns for files Git should never track — build output (<code>dist/</code>), dependencies (<code>node_modules/</code>), secrets (<code>.env</code>), and OS/editor cruft (<code>.DS_Store</code>). Commit it so the whole team shares the rules. Note it only affects <em>untracked</em> files; a file already tracked keeps being tracked until you <code>git rm --cached</code> it.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' }
    },
    {
      id: 'git-first-config', level: 'easy', category: 'Config', type: 'concept',
      q: 'What first-time configuration should you set after installing Git?',
      answer: '<p>At minimum your identity: <code>git config --global user.name</code> and <code>user.email</code> — these are stamped onto every commit (not login credentials). Also useful: <code>init.defaultBranch main</code>, your editor (<code>core.editor</code>), and on Windows <code>core.autocrlf true</code> to handle line endings. View everything with <code>git config --list --show-origin</code>.</p>',
      source: { site: 'Pro Git', label: 'Getting Started — First-Time Git Setup', url: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup' }
    },
    {
      id: 'git-log-oneline', level: 'easy', category: 'History', type: 'coding',
      q: 'How do you view a compact, visual history of all branches?',
      answer: '<p>Use <code>git log</code> with these options:</p><pre>git log --oneline --graph --all --decorate</pre><p><code>--oneline</code> is one commit per line, <code>--graph</code> draws the branch structure, <code>--all</code> includes every branch, and <code>--decorate</code> shows branch/tag labels. Many people alias this as <code>git lg</code>.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "c1"\necho b > b\ngit add .\ngit commit -m "c2"\ngit log --oneline --graph --all' }
    },

    // ---------------- MEDIUM · concept / coding ----------------
    {
      id: 'git-branch-what', level: 'medium', category: 'Branching', type: 'concept',
      q: 'What is a branch, technically, and why is branching so cheap?',
      answer: '<p>A branch is a <strong>movable pointer to one commit</strong> — physically a tiny (~41-byte) text file under <code>.git/refs/heads/</code> containing a commit hash. Creating one just writes that file; committing just rewrites the hash it holds. No files are copied, so branching is instant regardless of project size.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Branches in a Nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "base"\ngit switch -c feature\ngit branch' }
    },
    {
      id: 'git-ff-vs-3way', level: 'medium', category: 'Merging', type: 'concept',
      q: 'What is the difference between a fast-forward and a three-way merge?',
      answer: '<p>A <strong>fast-forward</strong> happens when your branch has no new commits of its own — Git just slides your branch pointer forward to the incoming tip; no merge commit is made. A <strong>three-way merge</strong> happens when both branches advanced: Git compares the two tips and their common ancestor and creates a new <strong>merge commit with two parents</strong>. Use <code>git merge --no-ff</code> to force a merge commit even when a fast-forward is possible.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Basic Branching and Merging', url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "base"\ngit switch -c feat\necho f > f\ngit add .\ngit commit -m "feat"\ngit switch main\necho m > m\ngit add .\ngit commit -m "main"\ngit merge feat' }
    },
    {
      id: 'git-conflict', level: 'medium', category: 'Merging', type: 'scenario',
      q: 'A merge produces a conflict. Walk through resolving it.',
      answer: '<p>A conflict means both branches changed the same lines, so Git won\'t guess. It writes markers into the file:</p><pre>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD\nyour version\n=======\ntheir version\n&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</pre><p>Steps: 1) <code>git status</code> lists the conflicted files; 2) open each, edit to the final content and <strong>delete all three marker lines</strong>; 3) <code>git add &lt;file&gt;</code>; 4) <code>git commit</code> to complete the merge. To bail out entirely, <code>git merge --abort</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Basic Branching and Merging', url: 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging' },
      tryIt: { starter: 'git init\necho base > c\ngit add .\ngit commit -m "b"\ngit switch -c feat\necho theirs > c\ngit add .\ngit commit -m "t"\ngit switch main\necho ours > c\ngit add .\ngit commit -m "o"\ngit merge feat' }
    },
    {
      id: 'git-merge-vs-rebase', level: 'medium', category: 'Rebase', type: 'concept',
      q: 'What is the difference between git merge and git rebase?',
      answer: '<p>Both integrate changes from one branch into another, but differently. <strong>Merge</strong> preserves history exactly and ties the two lines together with a merge commit. <strong>Rebase</strong> replays your commits on top of another branch, producing a straight, linear history with <em>new</em> commit hashes. Merge is non-destructive and safe on shared branches; rebase rewrites commits and should only touch your own un-pushed work.</p>',
      source: { site: 'Atlassian', label: 'Merging vs Rebasing', url: 'https://www.atlassian.com/git/tutorials/merging-vs-rebasing' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "base"\ngit switch -c feat\necho x > x\ngit add .\ngit commit -m "feat"\ngit switch main\necho m > m\ngit add .\ngit commit -m "main"\ngit switch feat\ngit rebase main\ngit log --oneline --graph --all' }
    },
    {
      id: 'git-golden-rule', level: 'medium', category: 'Rebase', type: 'concept',
      q: 'What is the "golden rule of rebasing"?',
      answer: '<p><strong>Never rebase commits that exist outside your own machine</strong> — anything already pushed and that others may have pulled. Rebase creates new commits with new hashes; everyone holding the old commits ends up with a diverged, conflicting history. Rebase freely on your own local, un-pushed feature branch; never on <code>main</code> or shared branches.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Rebasing', url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing' }
    },
    {
      id: 'git-interactive-rebase', level: 'medium', category: 'Rebase', type: 'coding',
      q: 'How would you squash several messy commits into one before opening a PR?',
      answer: '<p>Use interactive rebase: <code>git rebase -i HEAD~N</code> (N = number of commits). An editor lists them; keep the first as <code>pick</code> and change the rest to <code>squash</code> (keep their messages) or <code>fixup</code> (discard their messages). Save, write one clean message, done. Only do this before pushing, per the golden rule.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Rewriting History', url: 'https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History' }
    },
    {
      id: 'git-fetch-vs-pull', level: 'medium', category: 'Remotes', type: 'concept',
      q: 'What is the difference between git fetch and git pull?',
      answer: '<p><code>git fetch</code> downloads new commits from the remote and updates your remote-tracking branches (e.g. <code>origin/main</code>), but does <strong>not</strong> change your working files or current branch. <code>git pull</code> is <code>fetch</code> followed by an automatic <code>merge</code> (or <code>rebase</code>) into your branch. "Fetch, inspect with <code>git log main..origin/main</code>, then merge" avoids pull surprises.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Working with Remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' }
    },
    {
      id: 'git-tracking', level: 'medium', category: 'Remotes', type: 'coding',
      q: 'What does git push -u origin <branch> do?',
      answer: '<p>It pushes the branch to the remote <strong>and</strong> sets up an <em>upstream</em> (tracking) link between your local branch and <code>origin/&lt;branch&gt;</code> (that is the <code>-u</code> / <code>--set-upstream</code>). After this, plain <code>git push</code> and <code>git pull</code> on that branch know where to go. Inspect tracking with <code>git branch -vv</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Remote Branches', url: 'https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches' }
    },
    {
      id: 'git-reset-modes', level: 'medium', category: 'Undoing', type: 'concept',
      q: 'Explain git reset --soft, --mixed, and --hard.',
      answer: '<p>All three move the branch pointer; they differ in how far they also roll back:</p><ul><li><strong>--soft</strong> — moves the pointer only; your changes stay <em>staged</em>.</li><li><strong>--mixed</strong> (default) — pointer + staging area; changes stay in your files but <em>unstaged</em>.</li><li><strong>--hard</strong> — pointer + staging + <em>working files</em>; uncommitted changes are permanently discarded.</li></ul><p>Never <code>reset</code> commits you have already pushed to a shared branch — use <code>revert</code> instead.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Reset Demystified', url: 'https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified' },
      tryIt: { starter: 'git init\necho 1 > a\ngit add .\ngit commit -m "c1"\necho 2 > a\ngit add .\ngit commit -m "c2"\ngit reset --soft HEAD~1\ngit status' }
    },
    {
      id: 'git-revert-vs-reset', level: 'medium', category: 'Undoing', type: 'scenario',
      q: 'A bad commit is already pushed and others have pulled it. How do you undo it safely?',
      answer: '<p>Use <code>git revert &lt;hash&gt;</code>. It creates a <strong>new</strong> commit that applies the inverse of the bad one, leaving history intact — safe for shared branches because nobody\'s existing commits are rewritten. Do <em>not</em> use <code>git reset</code> or <code>push --force</code> here; those rewrite shared history and break everyone who pulled.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Undoing Things', url: 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things' },
      tryIt: { starter: 'git init\necho orig > a\ngit add .\ngit commit -m "c1"\necho bad > a\ngit add .\ngit commit -m "bad"\ngit revert HEAD\ncat a' }
    },
    {
      id: 'git-amend', level: 'medium', category: 'Undoing', type: 'coding',
      q: 'You forgot to add a file to your last (un-pushed) commit. What do you do?',
      answer: '<p>Stage the missing file and amend:</p><pre>git add forgotten.js\ngit commit --amend --no-edit</pre><p><code>--amend</code> replaces the last commit with a new one that includes the file; <code>--no-edit</code> keeps the message. Because it creates a new hash, only amend commits you have <strong>not</strong> pushed to a shared branch.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Undoing Things', url: 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things' }
    },
    {
      id: 'git-stash', level: 'medium', category: 'Stash', type: 'scenario',
      q: 'You are mid-change when an urgent bug comes in. How do you switch branches cleanly?',
      answer: '<p>Shelve your work: <code>git stash push -m "wip"</code> saves your uncommitted tracked changes and returns the working directory to the last commit. Fix the bug on another branch, come back, then <code>git stash pop</code> to reapply and remove the stash. Note untracked files are left behind unless you add <code>-u</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Stashing and Cleaning', url: 'https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning' },
      tryIt: { starter: 'git init\necho base > a\ngit add .\ngit commit -m "c1"\necho wip > a\ngit stash\ncat a\ngit stash pop\ncat a' }
    },
    {
      id: 'git-stash-pop-vs-apply', level: 'medium', category: 'Stash', type: 'concept',
      q: 'What is the difference between git stash pop and git stash apply?',
      answer: '<p>Both reapply the most recent stash to your working directory. <code>pop</code> also <em>removes</em> it from the stash stack; <code>apply</code> <em>keeps</em> it, which is useful when you want to apply the same shelved change to more than one branch. If <code>pop</code> hits a conflict it does <strong>not</strong> drop the stash — resolve, then <code>git stash drop</code> manually.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Stashing and Cleaning', url: 'https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning' }
    },
    {
      id: 'git-tags', level: 'medium', category: 'Tags', type: 'concept',
      q: 'What is the difference between a lightweight and an annotated tag?',
      answer: '<p>A <strong>lightweight</strong> tag is just a name pointing at a commit (like a branch that never moves). An <strong>annotated</strong> tag (<code>git tag -a v1.0.0 -m "msg"</code>) is a full object storing the tagger, date, a message, and can be GPG-signed. Use annotated tags for releases. Remember tags are <em>not</em> pushed by default — use <code>git push origin &lt;tag&gt;</code> or <code>--tags</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Tagging', url: 'https://git-scm.com/book/en/v2/Git-Basics-Tagging' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "release"\ngit tag -a v1.0.0 -m "first"\ngit tag' }
    },
    {
      id: 'git-cherry-pick', level: 'medium', category: 'Advanced', type: 'coding',
      q: 'You need just one commit from another branch, not the whole branch. How?',
      answer: '<p><code>git cherry-pick &lt;hash&gt;</code> replays the changes of that single commit onto your current branch as a new commit. Handy for pulling a hotfix from one branch into another without merging everything. If it conflicts, resolve, <code>git add</code>, then <code>git cherry-pick --continue</code>.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "c1"\ngit switch -c side\necho p > p\ngit add .\ngit commit -m "pick me"\ngit switch main\ngit cherry-pick side' }
    },
    {
      id: 'git-pull-rebase', level: 'medium', category: 'Remotes', type: 'concept',
      q: 'Why might you prefer git pull --rebase over a plain git pull?',
      answer: '<p>A plain pull that needs to combine your local commits with new remote commits creates a merge commit, cluttering history with "Merge branch main of…" entries. <code>git pull --rebase</code> instead replays <em>your</em> local commits on top of the fetched ones, keeping a clean linear history. It only rewrites your own un-pushed commits, so it is safe. Set it as default with <code>git config --global pull.rebase true</code>.</p>',
      source: { site: 'Atlassian', label: 'Merging vs Rebasing', url: 'https://www.atlassian.com/git/tutorials/merging-vs-rebasing' }
    },
    {
      id: 'git-detached-head', level: 'medium', category: 'Troubleshooting', type: 'scenario',
      q: 'Git says "You are in detached HEAD state." What happened and what do you do?',
      answer: '<p>You checked out a specific <em>commit</em> or tag instead of a branch, so <code>HEAD</code> points straight at a commit with no branch attached. Commits made here belong to no branch and can be lost. If you were just looking, <code>git switch main</code> to go back. If you made work worth keeping, <code>git switch -c new-branch</code> to put it on a real branch before switching away.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Branches in a Nutshell', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' }
    },
    {
      id: 'git-non-ff', level: 'medium', category: 'Troubleshooting', type: 'scenario',
      q: 'Your push is rejected with "non-fast-forward". What does it mean and how do you fix it?',
      answer: '<p>The remote has commits you don\'t have locally (someone pushed since you last pulled), and Git refuses to overwrite them. Fix: <code>git pull --rebase origin &lt;branch&gt;</code> to bring their changes down and replay yours on top, resolve any conflicts, then <code>git push</code>. Do <strong>not</strong> reflexively <code>push --force</code> — if you must force after rebasing your own branch, use <code>--force-with-lease</code>, which refuses if someone else pushed meanwhile.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Remote Branches', url: 'https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches' }
    },
    {
      id: 'git-semver', level: 'medium', category: 'Releases', type: 'concept',
      q: 'What does the version 2.4.1 mean under Semantic Versioning?',
      answer: '<p>SemVer is <strong>MAJOR.MINOR.PATCH</strong>. Bump <strong>MAJOR</strong> (2) for a breaking change, <strong>MINOR</strong> (4) for a backward-compatible feature addition, and <strong>PATCH</strong> (1) for a backward-compatible bug fix. Pre-release suffixes like <code>-alpha.1</code>, <code>-beta.2</code>, <code>-rc.1</code> signal stability; a leading <code>0.x.y</code> means "still unstable."</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Tagging', url: 'https://git-scm.com/book/en/v2/Git-Basics-Tagging' }
    },
    {
      id: 'git-crlf', level: 'medium', category: 'Config', type: 'scenario',
      q: 'On Windows, Git shows an entire file as changed and warns about CRLF. Why, and how do you fix it?',
      answer: '<p>Windows ends lines with CRLF, macOS/Linux with LF. Without normalisation, switching platforms makes every line look changed. Fix per-user with <code>git config --global core.autocrlf true</code> (Windows) or <code>input</code> (mac/Linux). The robust, team-wide fix is a committed <code>.gitattributes</code> with <code>* text=auto</code>, so behaviour travels with the repo instead of depending on each person\'s config. The "LF will be replaced by CRLF" message is a warning, not an error.</p>',
      source: { site: 'Pro Git', label: 'Customizing Git — Git Attributes', url: 'https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes' }
    },
    {
      id: 'git-rm-cached', level: 'medium', category: 'Config', type: 'scenario',
      q: 'You accidentally committed a file that should be ignored. How do you stop tracking it?',
      answer: '<p>Adding it to <code>.gitignore</code> is not enough — ignore rules only apply to untracked files. Run <code>git rm --cached &lt;file&gt;</code> to stop tracking it while keeping it on disk, then commit. If the file was a <strong>secret</strong>, that is not enough either: it still lives in history, so you must rotate/revoke the secret and scrub history with <code>git filter-repo</code> or BFG. Treat any committed secret as compromised.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Basic)', url: 'https://www.hackerrank.com/skills-directory/git_basic' }
    },
    {
      id: 'git-diff-staged', level: 'medium', category: 'Everyday', type: 'coding',
      q: 'How do you see what you are about to commit vs what you have only edited?',
      answer: '<p><code>git diff</code> shows <strong>unstaged</strong> changes (working directory vs the index). <code>git diff --staged</code> (a.k.a. <code>--cached</code>) shows <strong>staged</strong> changes (the index vs the last commit) — exactly what the next commit will contain. Running both before committing catches "oops, I forgot to stage that."</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Recording Changes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository' },
      tryIt: { starter: 'git init\necho v1 > f\ngit add .\ngit commit -m "c1"\necho v2 > f\ngit diff\ngit add f\ngit diff --staged' }
    },
    {
      id: 'git-github-flow', level: 'medium', category: 'Workflows', type: 'concept',
      q: 'Describe GitHub Flow and when it fits.',
      answer: '<p>One long-lived, always-deployable branch (<code>main</code>). Every change is a short-lived feature branch off <code>main</code>, reviewed in a pull request, then merged and deployed. It fits teams that ship continuously (SaaS/web apps). Pros: simple and fast. Cons: no built-in release-versioning — you lean on tags and CI to gate production.</p>',
      source: { site: 'Atlassian', label: 'Git Workflows', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows' }
    },
    {
      id: 'git-gitflow', level: 'medium', category: 'Workflows', type: 'concept',
      q: 'What are the branches in Git Flow and when is it appropriate?',
      answer: '<p>Two permanent branches: <code>main</code> (released code) and <code>develop</code> (integration). Transient branches: <code>feature/*</code> (off develop), <code>release/*</code> (stabilise a version), and <code>hotfix/*</code> (patch production off main). It suits versioned software with scheduled releases and multiple supported versions. For continuously-deployed web apps it is usually overkill.</p>',
      source: { site: 'Atlassian', label: 'Gitflow Workflow', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow' }
    },

    // ---------------- HARD · concept / coding / scenario ----------------
    {
      id: 'git-objects', level: 'hard', category: 'Internals', type: 'concept',
      q: 'Name Git\'s object types and what each stores.',
      answer: '<p>Git is a content-addressable store with four object types, each keyed by the SHA-1 of its content:</p><ul><li><strong>blob</strong> — the raw bytes of one file (no name, no path, no date).</li><li><strong>tree</strong> — a directory listing: mode + type + name pointing to blobs and sub-trees. Filenames live here.</li><li><strong>commit</strong> — points to one top-level tree plus parent commit(s), author/committer and the message.</li><li><strong>tag</strong> — an annotated-tag object: a named, optionally-signed pointer to a commit.</li></ul><p>Identical content is stored once and re-referenced, which is a big part of Git\'s storage efficiency.</p>',
      source: { site: 'Pro Git', label: 'Git Internals — Git Objects', url: 'https://git-scm.com/book/en/v2/Git-Internals-Git-Objects' },
      tryIt: { starter: 'git init\necho a > a\ngit add .\ngit commit -m "c1"\ngit cat-file -p HEAD' }
    },
    {
      id: 'git-content-addressable', level: 'hard', category: 'Internals', type: 'concept',
      q: 'What does it mean that Git is a "content-addressable filesystem"?',
      answer: '<p>You hand Git content and it stores it under a key derived from the content itself — the SHA-1 hash of a small <code>&lt;type&gt; &lt;size&gt;\\0</code> header plus the data. Identical content always yields the same key, so duplicates are stored once. The plumbing commands <code>git hash-object -w</code> (store, return key) and <code>git cat-file -p &lt;hash&gt;</code> (read back) demonstrate the raw key-value store that <code>add</code>/<code>commit</code> are built on. Objects live in <code>.git/objects/</code>, named by hash (first 2 chars = folder, remaining 38 = filename), zlib-compressed.</p>',
      source: { site: 'Pro Git', label: 'Git Internals — Git Objects', url: 'https://git-scm.com/book/en/v2/Git-Internals-Git-Objects' }
    },
    {
      id: 'git-refs-head', level: 'hard', category: 'Internals', type: 'concept',
      q: 'What are refs and HEAD, and how does a branch work under the hood?',
      answer: '<p>A <strong>ref</strong> is a text file holding a commit hash. A <strong>branch</strong> is a ref under <code>.git/refs/heads/</code> containing the hash of its tip commit — committing just rewrites that file. <strong>HEAD</strong> (<code>.git/HEAD</code>) usually holds <code>ref: refs/heads/&lt;branch&gt;</code>, meaning "I\'m on this branch"; in <em>detached HEAD</em> state it holds a raw commit hash instead. So "which commit am I on" is: HEAD → branch → commit.</p>',
      source: { site: 'Pro Git', label: 'Git Internals — Git References', url: 'https://git-scm.com/book/en/v2/Git-Internals-Git-References' }
    },
    {
      id: 'git-commit-contents', level: 'hard', category: 'Internals', type: 'concept',
      q: 'What exactly is stored inside a commit object?',
      answer: '<p>A commit stores: a pointer to one <strong>top-level tree</strong> (the full snapshot of the project), zero or more <strong>parent</strong> commit hashes (zero for the first commit, two for a merge), the <strong>author</strong> and <strong>committer</strong> (name, email, timestamp), and the <strong>commit message</strong>. It does <em>not</em> store diffs — each commit references a complete tree. <code>git add</code>/<code>git commit</code> are convenience wrappers over the plumbing <code>hash-object</code>, <code>update-index</code>, <code>write-tree</code> and <code>commit-tree</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Internals — Git Objects', url: 'https://git-scm.com/book/en/v2/Git-Internals-Git-Objects' }
    },
    {
      id: 'git-reflog-recover', level: 'hard', category: 'Recovery', type: 'scenario',
      q: 'You ran git reset --hard and think you lost commits. How do you recover them?',
      answer: '<p>Git rarely deletes commits immediately. The <strong>reflog</strong> records every position HEAD has held, including before your reset. Run <code>git reflog</code>, find the hash of the state you want (e.g. <code>a1b2c3 HEAD@{1}: commit: ...</code>), then recover it: <code>git switch -c recovered a1b2c3</code> (or <code>git reset --hard a1b2c3</code> if you want the current branch to return there). The orphaned commits remain until garbage collection prunes them.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' },
      tryIt: { starter: 'git init\necho 1 > a\ngit add .\ngit commit -m "keep me"\necho 2 > a\ngit add .\ngit commit -m "c2"\ngit reset --hard HEAD~1\ngit reflog' }
    },
    {
      id: 'git-bisect', level: 'hard', category: 'Debugging', type: 'scenario',
      q: 'A bug appeared somewhere in the last 200 commits. How do you find the exact commit efficiently?',
      answer: '<p>Use <code>git bisect</code>, a binary search over history — about log₂(200) ≈ 8 tests instead of 200. Steps: <code>git bisect start</code>, mark the current broken state <code>git bisect bad</code>, mark a known-good older commit <code>git bisect good &lt;hash&gt;</code>. Git checks out a midpoint; you test and answer <code>git bisect good</code> or <code>bad</code>, repeating until it names the first bad commit. Finish with <code>git bisect reset</code>. You can automate it: <code>git bisect run &lt;test-script&gt;</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Debugging with Git', url: 'https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git' }
    },
    {
      id: 'git-rebase-conflict', level: 'hard', category: 'Rebase', type: 'scenario',
      q: 'A rebase stops with conflicts partway through. How do you proceed?',
      answer: '<p>Because rebase replays commits one at a time, conflicts can appear at each replayed commit. Resolve the conflicted file(s), <code>git add</code> them, then <code>git rebase --continue</code> to apply the next commit — do <strong>not</strong> run <code>git commit</code> during a rebase. <code>git rebase --skip</code> drops the commit currently being applied; <code>git rebase --abort</code> bails out entirely and restores the pre-rebase state.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Rebasing', url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing' }
    },
    {
      id: 'git-merge-strategies', level: 'hard', category: 'Merging', type: 'concept',
      q: 'What merge strategies does Git have, and when would you use "ours" or "octopus"?',
      answer: '<p>Common strategies: <strong>ort/recursive</strong> (the default three-way merge for two branches, handling renames and criss-cross merges), <strong>resolve</strong> (an older three-way), <strong>octopus</strong> (merge more than two branches at once, used for mass integration with no conflicts), <strong>ours</strong> (record a merge but keep <em>only</em> your tree — useful to mark a branch as merged while discarding its content), and <strong>subtree</strong> (merge a project in as a subdirectory). Choose with <code>git merge -s &lt;strategy&gt;</code>.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' }
    },
    {
      id: 'git-filter-history', level: 'hard', category: 'Administration', type: 'scenario',
      q: 'A password was committed months ago. How do you remove it from the entire history?',
      answer: '<p>Rotate/revoke the secret first — assume it is already compromised. Then rewrite history to purge it from every commit using <code>git filter-repo</code> (the modern replacement for the slower <code>git filter-branch</code>) or the BFG Repo-Cleaner. This changes commit hashes for all affected history, so coordinate with the team: everyone must re-clone or hard-reset, and you force-push the rewritten branches. For hosted repos, also invalidate cached views and PRs that referenced the old history.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' }
    },
    {
      id: 'git-gc-packfiles', level: 'hard', category: 'Internals', type: 'concept',
      q: 'What are packfiles and what does git gc do?',
      answer: '<p>Storing every object as its own loose file would bloat the repo, so Git periodically compresses many objects into a single <strong>packfile</strong>, storing similar objects as deltas against one another. <code>git gc</code> ("garbage collect") packs loose objects, tidies refs, and prunes objects no longer reachable from any ref or the reflog. <code>git count-objects -v</code> shows loose vs packed counts; <code>git fsck</code> verifies database integrity.</p>',
      source: { site: 'Pro Git', label: 'Git Internals — Packfiles', url: 'https://git-scm.com/book/en/v2/Git-Internals-Packfiles' }
    },
    {
      id: 'git-worktree', level: 'hard', category: 'Advanced', type: 'coding',
      q: 'You need to work on two branches at once without stashing. What feature helps?',
      answer: '<p><code>git worktree</code> lets one repository have multiple working directories, each checked out to a different branch, sharing the same object database. <code>git worktree add ../hotfix hotfix-branch</code> creates a second folder on <code>hotfix-branch</code> — build/test there while your main folder stays on your feature. Remove it with <code>git worktree remove ../hotfix</code>. Far lighter than a second clone.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' }
    },
    {
      id: 'git-submodules', level: 'hard', category: 'Advanced', type: 'concept',
      q: 'What is a submodule and what is the catch with them?',
      answer: '<p>A submodule embeds another Git repository inside yours as a subdirectory, <strong>pinned to a specific commit</strong> of the inner repo. Add with <code>git submodule add &lt;url&gt; path</code>; clone a repo with its submodules via <code>git clone --recurse-submodules</code>, or afterwards <code>git submodule update --init --recursive</code>. The catch: they are fiddly — the parent tracks a commit, not a branch, so forgetting to update/commit the pointer or to initialise them trips up teammates. Many teams prefer a package manager or monorepo unless true independent versioning is required.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Submodules', url: 'https://git-scm.com/book/en/v2/Git-Tools-Submodules' }
    },
    {
      id: 'git-hooks', level: 'hard', category: 'Advanced', type: 'concept',
      q: 'What are Git hooks and why are they not shared by default?',
      answer: '<p>Hooks are scripts in <code>.git/hooks/</code> that run automatically on events — e.g. a <code>pre-commit</code> hook that runs a linter and blocks the commit if it fails, or a <code>pre-push</code> hook that runs tests. They are <strong>not committed</strong> (the <code>.git</code> folder is local), so they don\'t travel with a clone. To share hooks across a team, use a tool like Husky, or point <code>core.hooksPath</code> at a committed directory.</p>',
      source: { site: 'Pro Git', label: 'Customizing Git — Git Hooks', url: 'https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks' }
    },
    {
      id: 'git-unrelated-histories', level: 'hard', category: 'Troubleshooting', type: 'scenario',
      q: 'git pull fails with "refusing to merge unrelated histories." What caused it and how do you fix it?',
      answer: '<p>The two repositories have no common ancestor — typically you created a repo locally AND initialised the GitHub repo with a README, so each has an independent root commit. Fix with <code>git pull origin main --allow-unrelated-histories</code>, resolve any conflicts, and commit the merge. To avoid it next time, create the remote repo empty (no README) when you intend to push an existing local project.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Working with Remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' }
    },
    {
      id: 'git-trunk-based', level: 'hard', category: 'Workflows', type: 'concept',
      q: 'What is trunk-based development and what does it require to work?',
      answer: '<p>Everyone commits to one shared trunk (<code>main</code>) at least daily in small increments; branches, if any, live hours. Unfinished work hides behind <strong>feature flags</strong> rather than long-lived branches. It delivers true continuous integration with minimal merge pain, but <em>requires</em> strong automated tests, fast reliable CI, and discipline — without those, a broken trunk blocks the whole team. Used at very high-velocity organisations.</p>',
      source: { site: 'Atlassian', label: 'Trunk-Based Development', url: 'https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development' }
    },
    {
      id: 'git-ff-vs-noff-policy', level: 'hard', category: 'Workflows', type: 'scenario',
      q: 'Your team wants a clean feature history AND a record that each feature was merged. What policy achieves both?',
      answer: '<p>Combine rebase and a no-fast-forward merge: on the feature branch, <code>git rebase main</code> to stay current and <code>git rebase -i</code> to squash WIP commits into clean ones; then integrate with <code>git merge --no-ff feature</code> so a merge commit records the integration point. You get a tidy linear feature history <em>and</em> an explicit "this feature landed here" marker in <code>main</code>.</p>',
      source: { site: 'Atlassian', label: 'Merging vs Rebasing', url: 'https://www.atlassian.com/git/tutorials/merging-vs-rebasing' }
    },
    {
      id: 'git-force-with-lease', level: 'hard', category: 'Remotes', type: 'concept',
      q: 'When is force-pushing acceptable, and why prefer --force-with-lease?',
      answer: '<p>Force-pushing is acceptable only on a branch <em>you own</em> that others don\'t base work on — e.g. after rebasing or amending your own feature branch before it is reviewed. Plain <code>--force</code> blindly overwrites the remote, destroying any commits a teammate pushed in the meantime. <code>--force-with-lease</code> is safer: it refuses the push if the remote has moved since you last fetched, so you can\'t silently clobber someone else\'s work. Never force-push shared branches like <code>main</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Branching — Rebasing', url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing' }
    },
    {
      id: 'git-blame', level: 'hard', category: 'History', type: 'coding',
      q: 'How do you find out which commit introduced a particular line, and why it was changed?',
      answer: '<p><code>git blame &lt;file&gt;</code> annotates every line with the commit, author and date that last touched it; narrow it with <code>git blame -L 40,60 &lt;file&gt;</code>. Take the commit hash it reports and run <code>git show &lt;hash&gt;</code> to read the full change and its message — the "why." Combine with <code>git log -S"text"</code> (the pickaxe) to find exactly when a string first appeared or disappeared across history.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Searching', url: 'https://git-scm.com/book/en/v2/Git-Tools-Searching' }
    },
    {
      id: 'git-wrong-branch', level: 'hard', category: 'Troubleshooting', type: 'scenario',
      q: 'You committed to main but it belongs on a feature branch (and nothing is pushed). Fix it.',
      answer: '<p>Create the branch at the current commit so the work is safe, then rewind main:</p><pre>git switch -c feature-x   # branch carries the commit\ngit switch main\ngit reset --hard HEAD~1    # remove it from main</pre><p>The <code>reset --hard</code> is safe <strong>only because</strong> you created <code>feature-x</code> first, so the commit is never orphaned. Verify with <code>git log</code> on both branches before and after.</p>',
      source: { site: 'HackerRank', label: 'Git — Skills Directory (Advanced)', url: 'https://www.hackerrank.com/skills-directory/git_advanced' }
    },
    {
      id: 'git-add-p', level: 'hard', category: 'Staging', type: 'coding',
      q: 'Two unrelated changes are in the same file. How do you commit them separately?',
      answer: '<p>Use patch mode: <code>git add -p &lt;file&gt;</code> walks through each hunk and asks whether to stage it (<code>y</code>/<code>n</code>), with <code>s</code> to split a hunk into smaller pieces and <code>e</code> to edit it by hand. Stage only the first change, <code>git commit</code>, then <code>git add -p</code> again for the second. The same <code>-p</code> flag works on <code>git restore -p</code>, <code>git stash -p</code> and <code>git checkout -p</code>.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Interactive Staging', url: 'https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging' }
    },
    {
      id: 'git-rerere', level: 'hard', category: 'Merging', type: 'concept',
      q: 'What is rerere and when does it help?',
      answer: '<p><code>rerere</code> = "reuse recorded resolution." Enable it with <code>git config --global rerere.enabled true</code>. Git then records how you resolved a conflict and, if the <em>same</em> conflict appears again, replays your resolution automatically. It is a big time-saver on long-lived branches that you repeatedly rebase or merge, where the same conflicts recur.</p>',
      source: { site: 'Pro Git', label: 'Git Tools — Rerere', url: 'https://git-scm.com/book/en/v2/Git-Tools-Rerere' }
    },
    {
      id: 'git-reset-vs-checkout-restore', level: 'hard', category: 'Undoing', type: 'concept',
      q: 'Why did Git split git checkout into git switch and git restore?',
      answer: '<p>The old <code>git checkout</code> was overloaded: it changed branches <em>and</em> restored files, which confused people (and could silently discard work). Git 2.23 introduced two focused commands: <code>git switch</code> for moving between branches, and <code>git restore</code> for restoring/unstaging files (<code>--staged</code> to unstage, plain to discard working changes, <code>--source</code> to pull from a specific commit). <code>checkout</code> still works for backward compatibility.</p>',
      source: { site: 'Pro Git', label: 'Git Basics — Undoing Things', url: 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things' }
    }
  ]
};
