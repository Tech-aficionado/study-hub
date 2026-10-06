/* GitHub Flow Playground engine.
 * A modelled remote repo + local clone + pull requests, driven by gh/git commands.
 * The `engine` object is pure/DOM-free and exported for node tests. */
(function () {
  'use strict';

  // ---------------- YAML workflow checker ----------------
  // A tiny indentation-aware checker for the subset of Actions YAML we model.
  var KNOWN_EVENTS = ['push', 'pull_request', 'workflow_dispatch', 'schedule', 'release', 'workflow_call'];

  function checkWorkflow(yaml) {
    var errors = [];
    var text = String(yaml == null ? '' : yaml);
    var lines = text.split(/\r?\n/);

    // 1) hard tabs
    for (var i = 0; i < lines.length; i++) {
      if (/\t/.test(lines[i])) errors.push('Line ' + (i + 1) + ': tabs are not allowed in YAML — use spaces.');
    }
    // 2) indentation must be even (2-space steps)
    for (var j = 0; j < lines.length; j++) {
      var ln = lines[j];
      if (!ln.trim() || /^\s*#/.test(ln)) continue;
      var indent = ln.match(/^ */)[0].length;
      if (indent % 2 !== 0) errors.push('Line ' + (j + 1) + ': odd indentation (' + indent + ' spaces) — use multiples of 2.');
    }

    var top = topKeys(lines);
    // 3) required top-level keys
    if (top.indexOf('on') === -1) errors.push("Missing required 'on:' trigger block.");
    if (top.indexOf('jobs') === -1) errors.push("Missing required 'jobs:' block.");

    // 4) unknown event names
    var events = collectEvents(lines);
    events.forEach(function (ev) {
      if (KNOWN_EVENTS.indexOf(ev.name) === -1) {
        errors.push('Line ' + (ev.line) + ": unknown event '" + ev.name + "'. Known events: " + KNOWN_EVENTS.join(', ') + '.');
      }
    });

    // 5) hard-coded secrets / tokens
    for (var k = 0; k < lines.length; k++) {
      var l = lines[k];
      if (/^\s*#/.test(l)) continue;
      if (/gh[pousr]_[A-Za-z0-9]{16,}/.test(l) || /ghp_[A-Za-z0-9]+/.test(l)) {
        errors.push('Line ' + (k + 1) + ': a GitHub token is hard-coded — move it to ${{ secrets.NAME }}.');
      }
      if (/AKIA[0-9A-Z]{12,}/.test(l)) {
        errors.push('Line ' + (k + 1) + ': an AWS access key is hard-coded — use secrets, not plaintext.');
      }
      // token: "literal" (not an expression)
      var m = l.match(/\b(token|password|api[_-]?key)\s*:\s*(["']?)([^\s"'#]+)\2\s*$/i);
      if (m && m[3].indexOf('${{') === -1) {
        errors.push('Line ' + (k + 1) + ': ' + m[1] + ' has a literal value — reference ${{ secrets.NAME }} instead.');
      }
    }

    // 6) per-job checks: runs-on, steps, and each step has uses|run
    var jobErrors = checkJobs(lines);
    errors = errors.concat(jobErrors.errors);

    // 7) permissions when GITHUB_TOKEN is used to write
    var usesTokenWrite = /secrets\.GITHUB_TOKEN/.test(text) &&
      /(release create|git push|packages|contents:\s*write|upload-release|softprops\/action-gh-release|git commit)/.test(text);
    var declaresPerms = /^\s*permissions\s*:/m.test(text) || top.indexOf('permissions') !== -1;
    if (usesTokenWrite && !declaresPerms) {
      errors.push("GITHUB_TOKEN is used for a write operation but no 'permissions:' block is declared — add least-privilege permissions.");
    }

    var valid = errors.length === 0;
    return { valid: valid, errors: errors, log: valid ? buildJobLog(lines, jobErrors.jobs) : null };
  }

  function topKeys(lines) {
    var keys = [];
    lines.forEach(function (l) {
      if (/^[A-Za-z_]/.test(l)) {
        var m = l.match(/^([A-Za-z0-9_-]+)\s*:/);
        if (m) keys.push(m[1]);
      }
    });
    return keys;
  }

  function collectEvents(lines) {
    var events = [];
    var inOn = false, onIndent = 0;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (/^\s*#/.test(l) || !l.trim()) continue;
      var indent = l.match(/^ */)[0].length;
      var mInline = l.match(/^on\s*:\s*(.+)$/);
      if (/^on\s*:/.test(l)) {
        inOn = true; onIndent = indent;
        if (mInline && mInline[1].trim()) {
          var v = mInline[1].trim();
          if (v[0] === '[') {
            v.replace(/[[\]]/g, '').split(',').forEach(function (e) {
              if (e.trim()) events.push({ name: e.trim(), line: i + 1 });
            });
          } else {
            events.push({ name: v, line: i + 1 });
          }
        }
        continue;
      }
      if (inOn) {
        if (indent <= onIndent) { inOn = false; }
        else {
          var mk = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:?/);
          if (mk && indent === onIndent + 2) events.push({ name: mk[1], line: i + 1 });
        }
      }
    }
    return events;
  }

  function checkJobs(lines) {
    var errors = [];
    var jobs = [];
    var jobsIdx = -1;
    for (var i = 0; i < lines.length; i++) {
      if (/^jobs\s*:/.test(lines[i])) { jobsIdx = i; break; }
    }
    if (jobsIdx === -1) return { errors: errors, jobs: jobs };

    var cur = null;
    for (var j = jobsIdx + 1; j < lines.length; j++) {
      var l = lines[j];
      if (!l.trim() || /^\s*#/.test(l)) continue;
      var indent = l.match(/^ */)[0].length;
      if (indent === 0) break;
      if (indent === 2 && /^[ ]{2}[A-Za-z0-9_-]+\s*:\s*$/.test(l)) {
        if (cur) jobs.push(cur);
        cur = { id: l.trim().replace(/:$/, ''), line: j + 1, runsOn: false, steps: 0, stepBodies: [], raw: [], hasStepsKey: false };
      } else if (cur) {
        cur.raw.push({ line: j + 1, text: l, indent: indent });
        if (/^\s*runs-on\s*:/.test(l)) cur.runsOn = true;
        if (/^\s*steps\s*:/.test(l)) cur.hasStepsKey = true;
      }
    }
    if (cur) jobs.push(cur);

    jobs.forEach(function (job) {
      if (!job.runsOn && !/uses\s*:\s*.+\.yml/.test(job.raw.map(function (r) { return r.text; }).join('\n'))) {
        errors.push("Job '" + job.id + "' (line " + job.line + ") has no 'runs-on:' — every job needs a runner.");
      }
      parseSteps(job);
      if (job.hasStepsKey && job.steps === 0) {
        errors.push("Job '" + job.id + "' declares 'steps:' but lists none.");
      }
      job.stepBodies.forEach(function (st) {
        if (!st.hasUses && !st.hasRun) {
          errors.push("Job '" + job.id + "': a step (line " + st.line + ") has neither 'uses:' nor 'run:'.");
        }
      });
    });
    return { errors: errors, jobs: jobs };
  }

  function parseSteps(job) {
    var inSteps = false, stepsIndent = 0, cur = null;
    job.raw.forEach(function (r) {
      var l = r.text;
      if (/^\s*steps\s*:/.test(l)) { inSteps = true; stepsIndent = r.indent; return; }
      if (!inSteps) return;
      if (r.indent <= stepsIndent && l.trim()) { inSteps = false; return; }
      var isItem = /^\s*-\s/.test(l);
      if (isItem) {
        if (cur) job.stepBodies.push(cur);
        cur = { line: r.line, hasUses: false, hasRun: false };
        job.steps++;
        if (/-\s*uses\s*:/.test(l)) cur.hasUses = true;
        if (/-\s*run\s*:/.test(l)) cur.hasRun = true;
      } else if (cur) {
        if (/^\s*uses\s*:/.test(l)) cur.hasUses = true;
        if (/^\s*run\s*:/.test(l)) cur.hasRun = true;
      }
    });
    if (cur) job.stepBodies.push(cur);
  }

  function buildJobLog(lines, jobs) {
    var out = [];
    out.push('Workflow is valid. Simulated run:');
    (jobs && jobs.length ? jobs : [{ id: 'build', stepBodies: [] }]).forEach(function (job) {
      out.push('● Job: ' + job.id);
      out.push('  ✓ Set up job (runner: ubuntu-latest)');
      for (var s = 0; s < (job.steps || 0); s++) out.push('  ✓ Step ' + (s + 1) + ' completed');
      if ((job.steps || 0) === 0) out.push('  ✓ (no steps)');
      out.push('  ✓ Complete job');
    });
    out.push('All jobs succeeded ✅');
    return out.join('\n');
  }

  // ---------------- deterministic short hashes ----------------
  // 7-hex, derived from a content/sequence string. Deterministic, no randomness.
  function shortHash(seed) {
    var h = 0x811c9dc5; // FNV-1a 32-bit
    var str = String(seed);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    var hex = (h >>> 0).toString(16);
    while (hex.length < 8) hex = '0' + hex;
    return hex.slice(0, 7);
  }
  // a commit is {sha, msg}
  function mkCommit(seedParts) {
    var seed = seedParts.join('|');
    return { sha: shortHash(seed), msg: seedParts[seedParts.length - 1] };
  }

  // ---------------- GitHub-flow engine ----------------
  function newState() {
    var c0 = mkCommit(['repo-init', 'Initial commit']);
    return {
      authed: false,
      user: 'you',
      remoteExists: false,
      remoteName: null,          // owner/repo
      repoDir: null,             // basename of the cloned repo dir
      cwd: '~',                  // '~' or '~/<repoDir>'
      cloned: false,
      // LOCAL branches (what the clone has fetched/created)
      branches: { main: { commits: [c0] } },
      current: 'main',
      staged: [],
      files: {},                 // working tree
      pushedBranches: {},        // branch -> commit count pushed
      // REMOTE state (GitHub's copy)
      remote: { main: { commits: [c0] } },
      prs: [],
      issues: [],
      items: [],                 // unified order of {type:'issue'|'pr', num}
      nextNum: 1,                // SHARED issue+PR sequence
      protectedMain: true,
      workflowValid: true
    };
  }

  function ok(s, out) { return { ok: true, state: s, out: out }; }
  function err(s, out) { return { ok: false, state: s, out: out }; }

  function tokenize(line) {
    var re = /"([^"]*)"|'([^']*)'|(\S+)/g, m, toks = [];
    while ((m = re.exec(line)) !== null) {
      toks.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
    }
    return toks;
  }

  function flag(toks, name) {
    var i = toks.indexOf(name);
    if (i === -1) return null;
    var v = toks[i + 1];
    if (v === undefined || v[0] === '-') return true;
    return v;
  }

  function inRepo(state) { return state.cloned && state.cwd === '~/' + state.repoDir; }

  function run(state, raw) {
    var line = String(raw || '').trim();
    if (!line) return ok(state, '');
    if (line === 'help') return ok(state, helpText());
    if (line === 'clear') return ok(state, '__CLEAR__');
    var toks = tokenize(line);
    var prog = toks[0];
    if (prog === 'gh') return gh(state, toks.slice(1), line);
    if (prog === 'git') return git(state, toks.slice(1), line);
    if (prog === 'echo') return echo(state, toks.slice(1), line);
    if (prog === 'cd') return cd(state, toks.slice(1));
    if (prog === 'pwd') return ok(state, state.cwd);
    if (prog === 'ls') {
      if (!inRepo(state)) {
        if (state.cwd === '~' && state.cloned) return ok(state, state.repoDir + '/');
        return ok(state, state.cloned ? '' : '(nothing here yet)');
      }
      var names = Object.keys(state.files);
      return ok(state, names.length ? names.join('  ') : '(working tree empty)');
    }
    return err(state, prog + ": command not found. Type 'help'.");
  }

  function cd(state, args) {
    var dest = args[0];
    if (!dest || dest === '~' || dest === '/') { state.cwd = '~'; return ok(state, ''); }
    if (dest === '..') {
      state.cwd = '~';
      return ok(state, '');
    }
    var want = dest.replace(/\/$/, '');
    if (state.cloned && state.cwd === '~' && (want === state.repoDir || want === './' + state.repoDir)) {
      state.cwd = '~/' + state.repoDir;
      return ok(state, '');
    }
    if (state.cloned && want === state.repoDir) { state.cwd = '~/' + state.repoDir; return ok(state, ''); }
    return err(state, 'cd: ' + dest + ': No such file or directory');
  }

  function echo(state, args, line) {
    var redir = line.indexOf('>');
    if (redir === -1) return ok(state, args.join(' '));
    var left = line.slice(line.indexOf(' ') + 1, redir).trim();
    var append = line.indexOf('>>') !== -1;
    var rest = line.slice(line.indexOf('>') + (append ? 2 : 1)).trim();
    var file = rest.replace(/^["']|["']$/g, '');
    var content = left.replace(/^["']|["']$/g, '');
    if (!file) return err(state, 'echo: no output file given');
    if (!inRepo(state)) return err(state, "fatal: not a git repository (or any of the parent directories): .git");
    state.files[file] = append ? ((state.files[file] || '') + content + '\n') : (content + '\n');
    return ok(state, '');
  }

  function git(state, args, line) {
    var sub = args[0];
    if (sub === 'clone') {
      var target = args[1] || '';
      if (!state.authed) return err(state, 'Please run: gh auth login');
      if (!state.remoteExists) return err(state, 'Remote repo does not exist yet. Create it: gh repo create <name> --public');
      var want = target.replace(/\.git$/, '').replace(/^https?:\/\/github\.com\//, '');
      if (want && state.remoteName && want !== state.remoteName && want.indexOf(state.remoteName) === -1) {
        return err(state, "fatal: repository '" + target + "' not found (did you mean " + state.remoteName + '?)');
      }
      state.cloned = true;
      state.repoDir = state.remoteName.split('/')[1] || 'repo';
      state.files = {};
      // clone copies the remote main into local main
      state.branches = { main: { commits: state.remote.main.commits.slice() } };
      state.current = 'main';
      state.cwd = '~'; // you are NEXT TO the new dir; cd into it
      return ok(state, "Cloning into '" + state.repoDir + "'...\nremote: Enumerating objects, done.\nResolving deltas: 100% done.");
    }

    // every other git command requires being inside the repo working tree
    if (!state.cloned) return err(state, "fatal: not a git repository (or any of the parent directories): .git");
    if (!inRepo(state)) return err(state, "fatal: not a git repository (or any of the parent directories): .git");

    if (sub === 'status') {
      var o = ['On branch ' + state.current];
      if (state.staged.length) o.push('Changes to be committed:\n  ' + state.staged.join('\n  '));
      var unstaged = Object.keys(state.files).filter(function (f) { return state.staged.indexOf(f) === -1; });
      if (unstaged.length) o.push('Untracked/modified:\n  ' + unstaged.join('\n  '));
      if (!state.staged.length && !unstaged.length) o.push('nothing to commit, working tree clean');
      return ok(state, o.join('\n'));
    }
    if (sub === 'switch' || sub === 'checkout') {
      var create = args.indexOf('-c') !== -1 || args.indexOf('-b') !== -1;
      var name = args[args.length - 1];
      if (create) {
        if (state.branches[name]) return err(state, "fatal: a branch named '" + name + "' already exists");
        state.branches[name] = { commits: state.branches[state.current].commits.slice() };
        state.current = name;
        return ok(state, "Switched to a new branch '" + name + "'");
      }
      if (!state.branches[name]) return err(state, "error: pathspec '" + name + "' did not match any file(s) known to git");
      state.current = name;
      return ok(state, "Switched to branch '" + name + "'");
    }
    if (sub === 'branch') {
      return ok(state, Object.keys(state.branches).map(function (b) { return (b === state.current ? '* ' : '  ') + b; }).join('\n'));
    }
    if (sub === 'add') {
      var what = args[1];
      var pool = Object.keys(state.files);
      if (!pool.length) return err(state, 'nothing to add (working tree empty)');
      if (what === '.' || what === '-A') { state.staged = pool.slice(); }
      else if (state.files[what] !== undefined) { if (state.staged.indexOf(what) === -1) state.staged.push(what); }
      else return err(state, "fatal: pathspec '" + what + "' did not match any files");
      return ok(state, '');
    }
    if (sub === 'commit') {
      var msg = flag(args, '-m');
      if (!state.staged.length) return err(state, 'nothing to commit (did you git add?)');
      if (msg === null || msg === true) return err(state, 'Aborting commit: no message. Use git commit -m "msg".');
      var br = state.branches[state.current];
      var c = mkCommit([state.current, br.commits.length, state.staged.join(','), msg]);
      br.commits.push(c);
      var filesN = state.staged.length;
      state.staged = [];
      return ok(state, '[' + state.current + ' ' + c.sha + '] ' + msg + '\n ' + filesN + ' file(s) changed');
    }
    if (sub === 'push') {
      var pbr = state.current;
      var named = args.filter(function (a) { return a[0] !== '-'; });
      var explicit = named[named.length - 1];
      if (explicit && state.branches[explicit]) pbr = explicit;
      // push creates/updates the remote branch to match local
      state.remote[pbr] = { commits: state.branches[pbr].commits.slice() };
      state.pushedBranches[pbr] = state.branches[pbr].commits.length;
      var head = state.branches[pbr].commits[state.branches[pbr].commits.length - 1];
      return ok(state, 'Enumerating objects... done.\nTo github.com:' + state.remoteName + '.git\n * [new branch]      ' + pbr + ' -> ' + pbr + '  (' + head.sha + ')');
    }
    if (sub === 'pull') {
      var local = state.branches[state.current];
      var rem = state.remote[state.current];
      if (!rem) return ok(state, 'Already up to date.');
      if (rem.commits.length <= local.commits.length) return ok(state, 'Already up to date.');
      var oldHead = local.commits[local.commits.length - 1];
      // fast-forward: adopt remote commits
      var added = rem.commits.slice(local.commits.length);
      state.branches[state.current] = { commits: rem.commits.slice() };
      var newHead = rem.commits[rem.commits.length - 1];
      var out = 'remote: Enumerating objects, done.\n' +
        'Updating ' + oldHead.sha + '..' + newHead.sha + '\nFast-forward';
      // one summary line per pulled commit (sha + message), then a change tally
      added.forEach(function (cm) { out += '\n ' + cm.sha + ' ' + cm.msg; });
      out += '\n ' + added.length + ' commit(s), files changed';
      return ok(state, out);
    }
    if (sub === 'log') {
      var oneline = args.indexOf('--oneline') !== -1;
      var commits = state.branches[state.current].commits.slice().reverse();
      if (oneline) return ok(state, commits.map(function (c) { return c.sha + ' ' + c.msg; }).join('\n'));
      return ok(state, commits.map(function (c) { return 'commit ' + c.sha + '\n    ' + c.msg; }).join('\n\n'));
    }
    if (sub === 'fetch') {
      return ok(state, 'remote: Enumerating objects, done.');
    }
    return err(state, "git: '" + sub + "' is not supported in this playground.");
  }

  function gh(state, args, line) {
    var sub = args[0];
    if (sub === 'auth') {
      if (args[1] === 'status') {
        return state.authed ? ok(state, 'github.com\n  ✓ Logged in to github.com account ' + state.user + ' (keyring)\n  ✓ Token scopes: repo, read:org, workflow')
                            : err(state, 'You are not logged into any GitHub hosts. Run: gh auth login');
      }
      if (args[1] === 'login') { state.authed = true; return ok(state, '✓ Authentication complete. Logged in as ' + state.user); }
      return err(state, 'usage: gh auth login | gh auth status');
    }
    if (!state.authed) return err(state, 'Please run: gh auth login');

    if (sub === 'repo') {
      if (args[1] === 'create') {
        var name = args[2];
        if (!name || name[0] === '-') return err(state, 'usage: gh repo create <name> --public|--private');
        state.remoteExists = true;
        state.remoteName = state.user + '/' + name.replace(/^.*\//, '');
        var vis = args.indexOf('--private') !== -1 ? 'private' : 'public';
        return ok(state, '✓ Created repository ' + state.remoteName + ' on GitHub (' + vis + ')\nhttps://github.com/' + state.remoteName);
      }
      return err(state, 'usage: gh repo create <name> --public');
    }

    if (sub === 'pr') return ghPr(state, args.slice(1), line);
    if (sub === 'issue') return ghIssue(state, args.slice(1), line);
    return err(state, "gh: '" + sub + "' is not supported here. Type 'help'.");
  }

  function findPr(state, numStr) {
    var n = parseInt(numStr, 10);
    return state.prs.filter(function (p) { return p.num === n; })[0];
  }
  function findIssue(state, n) {
    return state.issues.filter(function (i) { return i.num === n; })[0];
  }

  function ghPr(state, a, line) {
    var sub = a[0];
    if (sub === 'create') {
      if (!state.cloned) return err(state, 'No local repo cloned.');
      if (!inRepo(state)) return err(state, 'Run this inside the repo: cd ' + (state.repoDir || '<repo>'));
      if (state.current === 'main') return err(state, 'You are on main. Create a feature branch first: git switch -c my-feature');
      if (!state.pushedBranches[state.current]) return err(state, 'Push your branch first: git push -u origin ' + state.current);
      if (state.prs.some(function (p) { return p.head === state.current && !p.merged && !p.closed; }))
        return err(state, 'A pull request for branch "' + state.current + '" already exists.');
      var title = flag(a, '--title') || ('PR from ' + state.current);
      var body = flag(a, '--body') || '';
      var draft = a.indexOf('--draft') !== -1;
      var pr = {
        type: 'pr', num: state.nextNum++, title: title, body: body, head: state.current, base: 'main',
        draft: draft, approvals: 0, changesRequested: false,
        checks: state.workflowValid ? 'passing' : 'failing',
        merged: false, closed: false
      };
      pr.closesIssues = (body.match(/\b(?:fixes|closes|resolves)\s+#(\d+)/gi) || []).map(function (s) { return parseInt(s.replace(/\D/g, ''), 10); });
      state.prs.push(pr);
      state.items.push({ type: 'pr', num: pr.num });
      return ok(state, (draft ? 'Draft pull' : 'Pull') + ' request #' + pr.num + ' created: ' + title + '\nhttps://github.com/' + state.remoteName + '/pull/' + pr.num);
    }
    if (sub === 'list') {
      var open = state.prs.filter(function (p) { return !p.merged && !p.closed; });
      if (!open.length) return ok(state, 'no open pull requests');
      return ok(state, open.map(function (p) { return '#' + p.num + '  ' + (p.draft ? '[draft] ' : '') + p.title + '  (' + p.head + ' -> ' + p.base + ')  checks:' + p.checks + '  ✓' + p.approvals; }).join('\n'));
    }

    // For view/checks/review/merge: the number must be a PR, not an issue.
    if (['view', 'checks', 'review', 'merge'].indexOf(sub) !== -1) {
      var numStr = a[1];
      var n = parseInt(numStr, 10);
      if (!isNaN(n) && !findPr(state, n)) {
        if (findIssue(state, n)) {
          return err(state, 'gh: GraphQL: Could not resolve to a PullRequest with the number of ' + n + '. (#' + n + ' is an issue — issues and PRs share one number sequence.)');
        }
        return err(state, 'gh: GraphQL: Could not resolve to a PullRequest with the number of ' + n + '.');
      }
    }

    if (sub === 'view') {
      var pv = findPr(state, a[1]);
      return ok(state, '#' + pv.num + ' ' + pv.title + '\nbranch: ' + pv.head + ' -> ' + pv.base + '\ndraft: ' + pv.draft + '\nchecks: ' + pv.checks + '\napprovals: ' + pv.approvals + (pv.changesRequested ? ' (changes requested)' : '') + '\n\n' + (pv.body || '(no description)'));
    }
    if (sub === 'checks') {
      var pc = findPr(state, a[1]);
      return ok(state, pc.checks === 'passing' ? '✓ CI/build  passing' : (pc.checks === 'failing' ? '✗ CI/build  failing (fix the workflow YAML)' : '• CI/build  pending'));
    }
    if (sub === 'review') {
      var pr = findPr(state, a[1]);
      if (a.indexOf('--approve') !== -1) { pr.approvals++; pr.changesRequested = false; return ok(state, '✓ Approved PR #' + pr.num); }
      if (a.indexOf('--request-changes') !== -1) { pr.changesRequested = true; return ok(state, '✗ Requested changes on PR #' + pr.num); }
      if (a.indexOf('--comment') !== -1) { return ok(state, '💬 Commented on PR #' + pr.num); }
      return err(state, 'usage: gh pr review <n> --approve|--request-changes|--comment');
    }
    if (sub === 'ready') {
      var prd = state.prs.filter(function (p) { return p.head === state.current; })[0];
      if (!prd) return err(state, 'no PR for the current branch');
      prd.draft = false; return ok(state, 'PR #' + prd.num + ' is now ready for review');
    }
    if (sub === 'merge') {
      var pm = findPr(state, a[1]);
      if (pm.merged) return err(state, 'PR #' + pm.num + ' is already merged');
      if (pm.draft) return err(state, 'Cannot merge a draft PR. Run: gh pr ready');
      var strategy = a.indexOf('--squash') !== -1 ? 'squash' : (a.indexOf('--rebase') !== -1 ? 'rebase' : (a.indexOf('--merge') !== -1 ? 'merge' : null));
      if (!strategy) return err(state, 'Choose a strategy: --merge | --squash | --rebase');
      if (state.protectedMain) {
        if (pm.checks !== 'passing') return err(state, 'Merge blocked by branch protection: required checks are ' + pm.checks + '.');
        if (pm.approvals < 1) return err(state, 'Merge blocked by branch protection: at least 1 approving review required.');
        if (pm.changesRequested) return err(state, 'Merge blocked: a reviewer requested changes.');
      }
      pm.merged = true;
      // merge happens on the REMOTE main (local main is behind until git pull)
      var remoteMain = state.remote.main.commits;
      var feat = state.remote[pm.head] ? state.remote[pm.head].commits : state.branches[pm.head].commits;
      var featNew = feat.slice(state.remote.main.commits.length ? 0 : 1); // commits unique to the feature
      // commits unique to feature = those after the shared base (base is main's length at branch time; approximate by main length)
      var baseLen = remoteMain.length;
      var unique = feat.slice(baseLen);
      if (strategy === 'squash') {
        remoteMain.push(mkCommit(['squash', pm.num, remoteMain.length, pm.title]) );
        remoteMain[remoteMain.length - 1].msg = pm.title + ' (#' + pm.num + ')';
      } else if (strategy === 'rebase') {
        unique.forEach(function (cm, i) {
          var r = mkCommit(['rebase', pm.num, remoteMain.length, cm.msg]);
          r.msg = cm.msg;
          remoteMain.push(r);
        });
      } else { // merge commit
        unique.forEach(function (cm) { remoteMain.push(cm); });
        var mc = mkCommit(['merge', pm.num, remoteMain.length]);
        mc.msg = "Merge pull request #" + pm.num + " from " + state.user + "/" + pm.head;
        mc.merge = true;
        mc.parents = 2;
        remoteMain.push(mc);
      }
      var closed = [];
      (pm.closesIssues || []).forEach(function (nn) {
        var iss = findIssue(state, nn);
        if (iss && iss.state === 'open') { iss.state = 'closed'; closed.push('#' + nn); }
      });
      var del = a.indexOf('--delete-branch') !== -1;
      if (del) { delete state.branches[pm.head]; delete state.remote[pm.head]; if (state.current === pm.head) state.current = 'main'; }

      var msg = '✓ Merged PR #' + pm.num + ' into main (' + strategy + ')';
      if (closed.length) msg += '\n✓ Closed issue(s) ' + closed.join(', ') + ' via "Fixes"';
      if (del) msg += '\n✓ Deleted branch ' + pm.head;
      msg += '\n\nremote main history (newest first):\n' + histLines(remoteMain);
      if (strategy === 'squash') msg += '\n(squash: one new commit on main)';
      if (strategy === 'rebase') msg += '\n(rebase: ' + unique.length + ' commit(s) replayed with new hashes, linear)';
      if (strategy === 'merge') msg += '\n(merge: feature commits kept + a merge commit with 2 parents)';
      msg += '\nYour local main is now behind — run: git pull';
      return ok(state, msg);
    }
    return err(state, "gh pr: unknown subcommand '" + sub + "'");
  }

  function histLines(commits) {
    return commits.slice().reverse().slice(0, 7).map(function (c) {
      return c.sha + ' ' + c.msg + (c.merge ? '  (merge, ' + c.parents + ' parents)' : '');
    }).join('\n');
  }

  function ghIssue(state, a, line) {
    var sub = a[0];
    if (sub === 'create') {
      var title = flag(a, '--title') || 'Untitled issue';
      var iss = { type: 'issue', num: state.nextNum++, title: title, state: 'open' };
      state.issues.push(iss);
      state.items.push({ type: 'issue', num: iss.num });
      return ok(state, '✓ Created issue #' + iss.num + ': ' + title + '\nhttps://github.com/' + state.remoteName + '/issues/' + iss.num);
    }
    if (sub === 'list') {
      var open = state.issues.filter(function (i) { return i.state === 'open'; });
      return ok(state, open.length ? open.map(function (i) { return '#' + i.num + '  ' + i.title; }).join('\n') : 'no open issues');
    }
    if (sub === 'close') {
      var n = parseInt(a[1], 10);
      var iss2 = findIssue(state, n);
      if (!iss2) {
        if (findPr(state, n)) return err(state, 'gh: #' + n + ' is a pull request, not an issue.');
        return err(state, 'gh: Could not resolve to an Issue with the number of ' + n + '.');
      }
      iss2.state = 'closed';
      return ok(state, '✓ Closed issue #' + n);
    }
    return err(state, "gh issue: unknown subcommand '" + sub + "'");
  }

  function helpText() {
    return [
      'Commands you can use:',
      '  gh auth status | gh auth login',
      '  gh repo create <name> --public|--private',
      '  git clone <owner>/<repo>   then   cd <repo>',
      '  cd <dir> | cd .. | pwd | ls',
      '  git switch -c <branch>',
      '  echo "text" > file.txt      (and >> to append)',
      '  git add . | git add <file>',
      '  git commit -m "message"',
      '  git push -u origin <branch>',
      '  git pull | git fetch | git status | git log [--oneline] | git branch',
      '  gh pr create --title "..." --body "..." [--draft]',
      '  gh pr list | gh pr view <n> | gh pr checks <n>',
      '  gh pr review <n> --approve|--request-changes|--comment',
      '  gh pr ready | gh pr merge <n> --squash|--merge|--rebase [--delete-branch]',
      '  gh issue create --title "..." | gh issue list | gh issue close <n>',
      '  ls | clear | help',
      '',
      'Issues and PRs SHARE one number sequence (issue #1 => next PR is #2).',
      'Branch protection on main needs: passing checks + 1 approval.',
      'Put "Fixes #N" in a PR body to auto-close issue N on merge, then git pull.'
    ].join('\n');
  }

  var engine = { newState: newState, run: run, checkWorkflow: checkWorkflow, helpText: helpText, shortHash: shortHash, KNOWN_EVENTS: KNOWN_EVENTS };

  // ---------------- DOM wiring (skipped under node) ----------------
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { wireUp(); });
  }

  function wireUp() {
    var termBody = document.getElementById('termBody');
    var input = document.getElementById('termInput');
    var runBtn = document.getElementById('runBtn');
    var yamlPane = document.getElementById('yamlPane');
    var checkBtn = document.getElementById('checkYamlBtn');
    var yamlOut = document.getElementById('yamlOut');
    var livePanel = document.getElementById('livePanel');
    if (!termBody || !input) return;

    var state = engine.newState();
    var history = [];
    var hIdx = -1;

    function promptLabel() {
      var dir = state.cwd === '~' ? '~' : state.cwd;
      return dir + ' (' + state.current + ')';
    }

    function render() {
      if (livePanel) {
        var branches = Object.keys(state.branches).map(function (b) { return (b === state.current ? '➤ ' : '• ') + b + ' <span class="dim">(' + state.branches[b].commits.length + ')</span>'; }).join('<br>');
        var remoteMainLen = state.remote.main ? state.remote.main.commits.length : 0;
        var prs = state.prs.length ? state.prs.map(function (p) {
          var st = p.merged ? 'merged' : (p.closed ? 'closed' : (p.draft ? 'draft' : 'open'));
          return '#' + p.num + ' ' + escapeHtml(p.title) + ' <span class="pstat ' + (p.checks || '') + '">' + (p.checks || '') + '</span> ✓' + p.approvals + ' [' + st + ']';
        }).join('<br>') : '<span class="dim">none</span>';
        var issues = state.issues.length ? state.issues.map(function (i) { return '#' + i.num + ' ' + escapeHtml(i.title) + ' [' + i.state + ']'; }).join('<br>') : '<span class="dim">none</span>';
        livePanel.innerHTML =
          '<div class="lp-sec"><h4>Auth</h4>' + (state.authed ? '✓ ' + state.user : '<span class="dim">not logged in</span>') + '</div>' +
          '<div class="lp-sec"><h4>Location</h4>' + escapeHtml(state.cwd) + '</div>' +
          '<div class="lp-sec"><h4>Remote</h4>' + (state.remoteExists ? escapeHtml(state.remoteName) + ' <span class="dim">(main: ' + remoteMainLen + ')</span>' : '<span class="dim">none</span>') + '</div>' +
          '<div class="lp-sec"><h4>Local branches</h4>' + (state.cloned ? branches : '<span class="dim">not cloned</span>') + '</div>' +
          '<div class="lp-sec"><h4>Pull requests</h4>' + prs + '</div>' +
          '<div class="lp-sec"><h4>Issues</h4>' + issues + '</div>' +
          '<div class="lp-sec"><h4>Next #</h4>' + state.nextNum + ' <span class="dim">(issues + PRs share this)</span></div>';
      }
    }

    function printLine(text, cls) {
      var div = document.createElement('div');
      div.className = 'term-line';
      var out = document.createElement('span');
      out.className = 'term-out' + (cls ? ' ' + cls : '');
      out.textContent = text;
      div.appendChild(out);
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    }
    function printCmd(text) {
      var div = document.createElement('div');
      div.className = 'term-line';
      div.innerHTML = '<span class="term-prompt">' + escapeHtml(promptLabel()) + ' $</span><span class="term-out">' + escapeHtml(text) + '</span>';
      termBody.appendChild(div);
    }

    function exec(cmd) {
      if (!cmd.trim()) return;
      history.push(cmd); hIdx = history.length;
      printCmd(cmd);
      var res = engine.run(state, cmd);
      state = res.state;
      if (res.out === '__CLEAR__') { termBody.innerHTML = ''; }
      else if (res.out) printLine(res.out, res.ok ? '' : 'err');
      render();
      checkChallenges();
    }

    runBtn && runBtn.addEventListener('click', function () { exec(input.value); input.value = ''; input.focus(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { exec(input.value); input.value = ''; }
      else if (e.key === 'ArrowUp') { if (hIdx > 0) { hIdx--; input.value = history[hIdx]; e.preventDefault(); } }
      else if (e.key === 'ArrowDown') { if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } else { hIdx = history.length; input.value = ''; } e.preventDefault(); }
      else if (e.key === 'Tab') { e.preventDefault(); input.value = complete(input.value); }
    });

    var VERBS = ['gh auth status', 'gh auth login', 'gh repo create ', 'gh pr create ', 'gh pr list', 'gh pr view ', 'gh pr checks ', 'gh pr review ', 'gh pr merge ', 'gh pr ready', 'gh issue create ', 'gh issue list', 'gh issue close ', 'git clone ', 'git switch -c ', 'git add .', 'git commit -m ', 'git push -u origin ', 'git status', 'git log --oneline', 'git log', 'git branch', 'git pull', 'git fetch', 'cd ', 'pwd', 'echo "" > ', 'help', 'clear', 'ls'];
    function complete(v) {
      if (!v) return v;
      var hits = VERBS.filter(function (c) { return c.indexOf(v) === 0; });
      if (hits.length === 1) return hits[0];
      if (hits.length > 1) { printLine(hits.join('   '), 'dim'); return v; }
      return v;
    }

    if (checkBtn && yamlPane) {
      checkBtn.addEventListener('click', function () {
        var res = engine.checkWorkflow(yamlPane.value);
        if (res.valid) {
          state.workflowValid = true;
          state.prs.forEach(function (p) { if (!p.merged && !p.closed) p.checks = 'passing'; });
          yamlOut.className = 'yaml-out ok';
          yamlOut.textContent = res.log;
        } else {
          state.workflowValid = false;
          state.prs.forEach(function (p) { if (!p.merged && !p.closed) p.checks = 'failing'; });
          yamlOut.className = 'yaml-out bad';
          yamlOut.textContent = '✗ ' + res.errors.length + ' problem(s):\n- ' + res.errors.join('\n- ');
        }
        render();
        checkChallenges();
      });
    }

    var CHALLENGES = [
      { id: 'c1', text: 'Authenticate: run gh auth status then gh auth login', done: function (s) { return s.authed; } },
      { id: 'c2', text: 'Create a repo: gh repo create demo --public', done: function (s) { return s.remoteExists; } },
      { id: 'c3', text: 'Clone it and cd in: git clone you/demo; cd demo', done: function (s) { return s.cloned && s.cwd === '~/' + s.repoDir; } },
      { id: 'c4', text: 'Branch off: git switch -c add-feature', done: function (s) { return Object.keys(s.branches).length > 1; } },
      { id: 'c5', text: 'Commit: echo "hi" > app.txt; git add .; git commit -m "add"', done: function (s) { return Object.keys(s.branches).some(function (b) { return b !== 'main' && s.branches[b].commits.length > 1; }); } },
      { id: 'c6', text: 'Push and open a PR: git push -u origin add-feature; gh pr create --title "Add"', done: function (s) { return s.prs.length > 0; } },
      { id: 'c7', text: 'Validate the CI YAML (Check workflow) so checks pass', done: function (s) { return s.workflowValid && s.prs.some(function (p) { return p.checks === 'passing'; }); } },
      { id: 'c8', text: 'Try merging before approval — protection blocks it, then gh pr review <n> --approve', done: function (s) { return s.prs.some(function (p) { return p.approvals >= 1; }); } },
      { id: 'c9', text: 'Merge: gh pr merge <n> --squash --delete-branch, then git pull on main', done: function (s) { return s.prs.some(function (p) { return p.merged; }); } },
      { id: 'c10', text: 'Issues + auto-close: gh issue create; open a PR with "Fixes #N" and merge it', done: function (s) { return s.issues.some(function (i) { return i.state === 'closed'; }); } }
    ];
    function checkChallenges() {
      var wrap = document.getElementById('challengeList');
      if (!wrap) return;
      wrap.innerHTML = CHALLENGES.map(function (c) {
        var done = false; try { done = c.done(state); } catch (e) {}
        return '<li class="' + (done ? 'ch-done' : '') + '">' + (done ? '✅' : '⬜') + ' ' + escapeHtml(c.text) + '</li>';
      }).join('');
    }

    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

    printLine(engine.helpText(), 'dim');
    render();
    checkChallenges();
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = engine; }
  if (typeof window !== 'undefined') { window.GH_PLAYGROUND = engine; }
})();
