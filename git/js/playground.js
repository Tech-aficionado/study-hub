/* Git Playground — an in-browser Git simulator with a real-ish object model.
 *
 * The core is a pure, DOM-free `createEngine()` returning an object you can
 * drive with run(cmdString) and inspect. It is exported for Node tests via
 * module.exports at the bottom, and attached to window for the browser UI.
 *
 * Model: working dir files, index (staged snapshot), commits (short hash +
 * parents + tree), branches, HEAD (attached to a branch or detached), stashes,
 * tags, reflog. A merge can fast-forward, create a 3-way merge commit, or
 * CONFLICT (writing real markers into the file and requiring add + commit).
 */
(function () {
  'use strict';

  function createEngine() {
    var state;

    function freshState() {
      return {
        initialized: false,
        wd: {},            // filename -> content (working directory)
        index: {},         // filename -> content (staging area)
        commits: {},       // hash -> { hash, message, parents:[], tree:{file:content}, time }
        branches: {},      // name -> hash
        HEAD: { type: 'branch', ref: null }, // ref = branch name, or type 'commit' ref = hash
        tags: {},          // name -> hash
        stashes: [],       // [{ message, wd, index, base }]
        merging: null,     // { fromBranch, fromHash, conflicts:[file] } during a conflicted merge
        hashCounter: 0,
        reflog: []         // ['HEAD@{0}: msg', ...] newest first
      };
    }

    function reset() { state = freshState(); }
    reset();

    // ---------- helpers ----------
    function nextHash() {
      state.hashCounter++;
      // deterministic 7-char pseudo-hash
      var base = (state.hashCounter * 2654435761) >>> 0;
      var s = base.toString(16);
      while (s.length < 7) s = '0' + s;
      return s.slice(0, 7);
    }
    function logReflog(msg) { state.reflog.unshift('HEAD@{0}: ' + msg); }
    // Content-addressed ids: identical content always gets the same 40-hex id, as in Git.
    // (Simulated with a simple hash, not real SHA-1.)
    function hex40(str) {
      var out40 = '', h = 2166136261 >>> 0;
      for (var round = 0; round < 5; round++) {
        for (var i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
        h = Math.imul(h ^ round, 2246822519) >>> 0;
        var s = h.toString(16); while (s.length < 8) s = '0' + s; out40 += s;
      }
      return out40;
    }
    function blobId(content) { return hex40('blob ' + content); }
    function treeId(tree) { return hex40('tree ' + keys(tree).sort().map(function (f) { return f + '\0' + blobId(tree[f]); }).join('\n')); }
    function currentBranch() { return state.HEAD.type === 'branch' ? state.HEAD.ref : null; }
    function headCommitHash() {
      if (state.HEAD.type === 'branch') return state.branches[state.HEAD.ref] || null;
      return state.HEAD.ref || null;
    }
    function headCommit() { var h = headCommitHash(); return h ? state.commits[h] : null; }
    function treeOfHead() { var c = headCommit(); return c ? c.tree : {}; }
    function clone(obj) { var o = {}; for (var k in obj) if (obj.hasOwnProperty(k)) o[k] = obj[k]; return o; }
    function keys(obj) { var a = []; for (var k in obj) if (obj.hasOwnProperty(k)) a.push(k); return a; }
    function ancestors(hash) {
      // set of hash -> true including hash itself
      var seen = {}, stack = [hash];
      while (stack.length) {
        var h = stack.pop();
        if (!h || seen[h]) continue;
        seen[h] = true;
        var c = state.commits[h];
        if (c) c.parents.forEach(function (p) { stack.push(p); });
      }
      return seen;
    }
    function mergeBase(a, b) {
      var ancA = ancestors(a);
      var queue = [b], seen = {};
      while (queue.length) {
        var h = queue.shift();
        if (!h || seen[h]) continue;
        seen[h] = true;
        if (ancA[h]) return h;
        var c = state.commits[h];
        if (c) c.parents.forEach(function (p) { queue.push(p); });
      }
      return null;
    }

    // ---------- status computation ----------
    function unmergedFiles() {
      // during a conflicted merge, a file is still unmerged while its index
      // content equals the conflict-marker content we wrote; `git add` after
      // editing replaces that content, marking it resolved.
      if (!state.merging) return [];
      return state.merging.conflicts.filter(function (f) {
        return state.index.hasOwnProperty(f) && state.index[f] === state.merging.markers[f];
      });
    }

    function statusModel() {
      var head = treeOfHead();
      var staged = [], notStaged = [], untracked = [];
      var all = {};
      keys(state.wd).forEach(function (k) { all[k] = 1; });
      keys(state.index).forEach(function (k) { all[k] = 1; });
      keys(head).forEach(function (k) { all[k] = 1; });
      keys(all).forEach(function (f) {
        var inHead = head.hasOwnProperty(f), inIndex = state.index.hasOwnProperty(f), inWd = state.wd.hasOwnProperty(f);
        // staged: index differs from HEAD
        if (inIndex && (!inHead || head[f] !== state.index[f])) staged.push({ file: f, how: inHead ? 'modified' : 'new' });
        if (inIndex && !inWd && inHead) staged.push({ file: f, how: 'deleted' });
        // not staged: wd differs from index
        if (inWd && inIndex && state.wd[f] !== state.index[f]) notStaged.push({ file: f, how: 'modified' });
        if (!inWd && inIndex) notStaged.push({ file: f, how: 'deleted' });
        // untracked: in wd, not in index and not in head
        if (inWd && !inIndex && !inHead) untracked.push(f);
      });
      return { staged: staged, notStaged: notStaged, untracked: untracked };
    }

    // ---------- command implementations ----------
    function out(s) { return { ok: true, output: s }; }
    function err(s) { return { ok: false, output: s }; }

    function doInit() {
      if (state.initialized) return out("Reinitialized existing Git repository");
      state.initialized = true;
      state.branches = {};
      state.HEAD = { type: 'branch', ref: 'main' }; // unborn until first commit
      logReflog('init');
      return out("Initialized empty Git repository on branch 'main'");
    }

    function needRepo() { return state.initialized ? null : err('fatal: not a git repository (or any of the parent directories): .git'); }

    function doAdd(args) {
      var r = needRepo(); if (r) return r;
      if (!args.length) return err("Nothing specified, nothing added.");
      var targets = [];
      if (args[0] === '.' || args[0] === '-A' || args[0] === '--all') {
        targets = keys(state.wd);
        // staged deletions: files removed from wd that were tracked
        var head = treeOfHead();
        keys(state.index).concat(keys(head)).forEach(function (f) {
          if (!state.wd.hasOwnProperty(f)) { delete state.index[f]; }
        });
      } else {
        targets = args.filter(function (a) { return a[0] !== '-'; });
      }
      var added = 0, missing = [];
      targets.forEach(function (f) {
        if (state.wd.hasOwnProperty(f)) { state.index[f] = state.wd[f]; added++; }
        else if (!(args[0] === '.' || args[0] === '-A' || args[0] === '--all')) missing.push(f);
      });
      if (missing.length) return err("fatal: pathspec '" + missing[0] + "' did not match any files");
      return out('');
    }

    function doRestore(args) {
      var r = needRepo(); if (r) return r;
      var staged = false, files = [];
      args.forEach(function (a) {
        if (a === '--staged' || a === '-S') staged = true;
        else if (a[0] !== '-') files.push(a);
      });
      if (!files.length) return err('error: you must specify path(s) to restore');
      var head = treeOfHead();
      files.forEach(function (f) {
        if (staged) {
          if (head.hasOwnProperty(f)) state.index[f] = head[f]; else delete state.index[f];
        } else {
          if (state.index.hasOwnProperty(f)) state.wd[f] = state.index[f];
          else if (head.hasOwnProperty(f)) state.wd[f] = head[f];
        }
      });
      return out('');
    }

    function doCommit(args) {
      var r = needRepo(); if (r) return r;
      // parse -m "msg" and -a
      var msg = null, all = false;
      for (var i = 0; i < args.length; i++) {
        if (args[i] === '-m') { msg = args[i + 1]; i++; }
        else if (args[i] === '-am' || args[i] === '-ma') { all = true; msg = args[i + 1]; i++; }
        else if (args[i] === '-a') all = true;
        else if (args[i] === '--amend') return doAmend(args);
      }
      if (all) {
        // stage all tracked modifications
        var head0 = treeOfHead();
        keys(state.wd).forEach(function (f) { if (head0.hasOwnProperty(f) || state.index.hasOwnProperty(f)) state.index[f] = state.wd[f]; });
        keys(head0).forEach(function (f) { if (!state.wd.hasOwnProperty(f)) delete state.index[f]; });
      }
      // finishing a conflicted merge?
      if (state.merging) {
        var unmerged = unmergedFiles();
        if (unmerged.length) {
          return err("error: Committing is not possible because you have unmerged files.\n" +
            "hint: Fix them up in the work tree, and then use 'git add/rm <file>'\n" +
            "hint: as appropriate to mark resolution and make a commit.\n" +
            "fatal: Exiting because of an unresolved conflict.");
        }
        var mergeMsg = msg || ("Merge branch '" + state.merging.fromBranch + "'");
        var mh = makeCommit(mergeMsg, [headCommitHash(), state.merging.fromHash]);
        var fromB = state.merging.fromBranch;
        state.merging = null;
        return out('[' + currentBranch() + ' ' + mh + '] ' + mergeMsg);
      }

      if (!msg) return err('Aborting commit due to empty commit message (use -m "message").');

      var head = treeOfHead();
      // detect staged changes
      var changed = keys(state.index).some(function (f) { return !head.hasOwnProperty(f) || head[f] !== state.index[f]; }) ||
        keys(head).some(function (f) { return !state.index.hasOwnProperty(f); });
      if (!changed) return err('nothing to commit, working tree clean');
      var h = makeCommit(msg, headCommitHash() ? [headCommitHash()] : []);
      var n = keys(state.index).length;
      return out('[' + currentBranch() + ' ' + h + '] ' + msg);
    }

    function makeCommit(msg, parents) {
      parents = (parents || []).filter(Boolean);
      var tree = clone(state.index);
      var h = nextHash();
      state.commits[h] = { hash: h, message: msg, parents: parents, tree: tree, time: state.hashCounter };
      if (state.HEAD.type === 'branch') state.branches[state.HEAD.ref] = h;
      else state.HEAD.ref = h;
      logReflog('commit: ' + msg);
      return h;
    }

    function doAmend(args) {
      var msg = null;
      for (var i = 0; i < args.length; i++) { if (args[i] === '-m') { msg = args[i + 1]; i++; } }
      var cur = headCommit();
      if (!cur) return err('fatal: You have nothing to amend.');
      if (msg) cur.message = msg;
      cur.tree = clone(state.index);
      logReflog('commit (amend): ' + cur.message);
      return out('[' + currentBranch() + ' ' + cur.hash + '] ' + cur.message);
    }

    function doBranch(args) {
      var r = needRepo(); if (r) return r;
      var del = null, force = false, names = [];
      args.forEach(function (a) {
        if (a === '-d' || a === '--delete') del = 'soft';
        else if (a === '-D') del = 'force';
        else if (a[0] !== '-') names.push(a);
      });
      if (del) {
        var bn = names[0];
        if (!state.branches.hasOwnProperty(bn)) return err("error: branch '" + bn + "' not found.");
        if (bn === currentBranch()) return err("error: Cannot delete branch '" + bn + "' checked out.");
        var tip = state.branches[bn];
        // Like real Git, -d refuses a branch whose commits are not reachable from HEAD
        // (they would become unreachable); -D deletes anyway.
        var headH = headCommitHash();
        if (del === 'soft' && tip && !(headH && ancestors(headH)[tip])) {
          return err("error: the branch '" + bn + "' is not fully merged.\n" +
            "hint: If you are sure you want to delete it, run 'git branch -D " + bn + "'");
        }
        delete state.branches[bn];
        return out('Deleted branch ' + bn + ' (was ' + tip + ').');
      }
      if (!names.length) {
        // list
        var lines = keys(state.branches).sort().map(function (b) { return (b === currentBranch() ? '* ' : '  ') + b; });
        if (state.HEAD.type === 'commit') lines.unshift('* (HEAD detached at ' + state.HEAD.ref + ')');
        return out(lines.join('\n') || '(no branches yet)');
      }
      var name = names[0];
      if (state.branches.hasOwnProperty(name)) return err("fatal: a branch named '" + name + "' already exists");
      var at = headCommitHash();
      if (!at) return err("fatal: not a valid object name: 'HEAD'");
      state.branches[name] = at;
      return out('');
    }

    function checkoutOrSwitch(args, isSwitch) {
      var r = needRepo(); if (r) return r;
      var create = false, name = null;
      for (var i = 0; i < args.length; i++) {
        var a = args[i];
        if (a === '-b' || a === '-c') { create = true; }
        else if (a === '--detach' || a === '-d') { /* force detach; handled below */ }
        else if (a[0] !== '-') name = a;
      }
      if (!name) return err('fatal: missing branch or commit argument');
      if (create) {
        if (state.branches.hasOwnProperty(name)) return err("fatal: a branch named '" + name + "' already exists");
        var at = headCommitHash();
        if (!at) return err('fatal: cannot create branch before the first commit');
        state.branches[name] = at;
        state.HEAD = { type: 'branch', ref: name };
        loadTreeToWdIndex(at);
        logReflog('checkout: moving to ' + name);
        return out("Switched to a new branch '" + name + "'");
      }
      // plain branch switch (no --detach)
      var forceDetach = args.indexOf('--detach') !== -1 || args.indexOf('-d') !== -1;
      if (!forceDetach && state.branches.hasOwnProperty(name)) {
        state.HEAD = { type: 'branch', ref: name };
        loadTreeToWdIndex(state.branches[name]);
        logReflog('checkout: moving to ' + name);
        return out(isSwitch ? ("Switched to branch '" + name + "'") : ("Switched to branch '" + name + "'"));
      }
      // anything else that resolves to a commit -> detached HEAD
      var h = resolveRev(name);
      if (h && state.commits.hasOwnProperty(h)) {
        state.HEAD = { type: 'commit', ref: h };
        loadTreeToWdIndex(h);
        logReflog('checkout: moving to ' + h);
        var c = state.commits[h];
        return out("Note: switching to '" + name + "'.\n\n" +
          "You are in 'detached HEAD' state. You can look around, make experimental\n" +
          "changes and commit them, and you can discard any commits you make in this\n" +
          "state without impacting any branches by switching back to a branch.\n\n" +
          "HEAD is now at " + h.slice(0, 7) + ' ' + c.message);
      }
      return err("error: pathspec '" + name + "' did not match any file(s) known to git");
    }

    function loadTreeToWdIndex(hash) {
      var c = state.commits[hash];
      var tree = c ? c.tree : {};
      state.wd = clone(tree);
      state.index = clone(tree);
    }

    function doMerge(args) {
      var r = needRepo(); if (r) return r;
      if (args[0] === '--abort') {
        if (!state.merging) return err('fatal: There is no merge to abort (MERGE_HEAD missing).');
        loadTreeToWdIndex(headCommitHash());
        state.merging = null;
        return out('Merge aborted.');
      }
      var noff = args.indexOf('--no-ff') !== -1;
      var name = args.filter(function (a) { return a[0] !== '-'; })[0];
      if (!name) return err('fatal: No commit specified and merge.defaultToUpstream not set.');
      if (!state.branches.hasOwnProperty(name)) return err("merge: " + name + " - not something we can merge");
      if (state.merging) return err('error: Merging is not possible because you have unmerged files.');
      var ours = headCommitHash(), theirs = state.branches[name];
      if (!ours) return err('fatal: no current commit');
      if (ours === theirs) return out('Already up to date.');
      var base = mergeBase(ours, theirs);
      // fast-forward: our HEAD is ancestor of theirs
      if (base === ours && !noff) {
        if (state.HEAD.type === 'branch') state.branches[state.HEAD.ref] = theirs; else state.HEAD.ref = theirs;
        loadTreeToWdIndex(theirs);
        logReflog('merge ' + name + ': Fast-forward');
        return out('Updating ' + ours.slice(0, 7) + '..' + theirs.slice(0, 7) + '\nFast-forward');
      }
      if (base === theirs) return out('Already up to date.');
      // 3-way merge
      var ot = state.commits[ours].tree, tt = state.commits[theirs].tree, bt = base ? state.commits[base].tree : {};
      var merged = {}, conflicts = [];
      var allf = {};
      keys(ot).forEach(function (f) { allf[f] = 1; });
      keys(tt).forEach(function (f) { allf[f] = 1; });
      keys(bt).forEach(function (f) { allf[f] = 1; });
      keys(allf).forEach(function (f) {
        var o = ot[f], t = tt[f], b = bt[f];
        if (o === t) { if (o !== undefined) merged[f] = o; return; }      // same (or both deleted)
        if (o === b) { if (t !== undefined) merged[f] = t; return; }      // only theirs changed
        if (t === b) { if (o !== undefined) merged[f] = o; return; }      // only ours changed
        // both changed differently -> conflict
        conflicts.push(f);
        merged[f] = '<<<<<<< HEAD\n' + (o === undefined ? '' : o) + '\n=======\n' + (t === undefined ? '' : t) + '\n>>>>>>> ' + name;
      });
      if (conflicts.length) {
        state.wd = clone(merged);
        // index keeps non-conflicted; conflicted files are left with the
        // CONFLICT-marker content in the index (stage 0 absent), which is how
        // we detect "unmerged" until the user edits and `git add`s them.
        var idx = {};
        keys(merged).forEach(function (f) { idx[f] = merged[f]; });
        state.index = idx;
        state.merging = { fromBranch: name, fromHash: theirs, conflicts: conflicts, markers: clone(merged) };
        return err('Auto-merging ' + conflicts.join(', ') + '\nCONFLICT (content): Merge conflict in ' + conflicts.join(', ') +
          '\nAutomatic merge failed; fix conflicts and then commit the result.');
      }
      // clean merge commit
      state.index = clone(merged);
      state.wd = clone(merged);
      var mh = makeCommit("Merge branch '" + name + "'", [ours, theirs]);
      return out('Merge made by the \'ort\' strategy. [' + currentBranch() + ' ' + mh + ']');
    }

    function doRebase(args) {
      var r = needRepo(); if (r) return r;
      var name = args.filter(function (a) { return a[0] !== '-'; })[0];
      if (!name || !state.branches.hasOwnProperty(name)) return err('fatal: invalid upstream');
      var cur = currentBranch();
      if (!cur) return err('fatal: no branch to rebase (detached HEAD)');
      var ours = headCommitHash(), onto = state.branches[name];
      var base = mergeBase(ours, onto);
      if (base === ours) { // ours behind -> fast-forward
        state.branches[cur] = onto; loadTreeToWdIndex(onto);
        return out('Fast-forwarded ' + cur + ' to ' + name + '.');
      }
      if (base === onto) return out('Current branch ' + cur + ' is up to date.');
      // collect our commits since base (linear chain assumption)
      var chain = [], h = ours;
      while (h && h !== base) { chain.unshift(state.commits[h]); h = state.commits[h].parents[0]; }
      // replay on onto: each replayed tree = parent's tree + the delta this commit
      // introduced over its own original parent (so onto's files are preserved)
      var parent = onto;
      chain.forEach(function (c) {
        var origParent = c.parents[0];
        var opt = origParent && state.commits[origParent] ? state.commits[origParent].tree : {};
        var newTree = clone(state.commits[parent].tree);
        keys(c.tree).forEach(function (f) { if (c.tree[f] !== opt[f]) newTree[f] = c.tree[f]; });
        keys(opt).forEach(function (f) { if (!c.tree.hasOwnProperty(f)) delete newTree[f]; });
        var nh = nextHash();
        state.commits[nh] = { hash: nh, message: c.message, parents: [parent], tree: newTree, time: state.hashCounter };
        parent = nh;
      });
      state.branches[cur] = parent;
      loadTreeToWdIndex(parent);
      logReflog('rebase: onto ' + name);
      return out('Successfully rebased and updated ' + cur + '.');
    }

    function doReset(args) {
      var r = needRepo(); if (r) return r;
      var mode = 'mixed', target = null;
      args.forEach(function (a) {
        if (a === '--soft') mode = 'soft';
        else if (a === '--hard') mode = 'hard';
        else if (a === '--mixed') mode = 'mixed';
        else if (a[0] !== '-') target = a;
      });
      var h = resolveRev(target || 'HEAD');
      if (!h) return err("fatal: ambiguous argument '" + target + "': unknown revision");
      if (state.HEAD.type === 'branch') state.branches[state.HEAD.ref] = h; else state.HEAD.ref = h;
      var tree = state.commits[h] ? state.commits[h].tree : {};
      if (mode === 'soft') { /* index + wd untouched */ }
      else if (mode === 'mixed') { state.index = clone(tree); }
      else if (mode === 'hard') { state.index = clone(tree); state.wd = clone(tree); }
      logReflog('reset: moving to ' + target);
      var rc = state.commits[h];
      return out('HEAD is now at ' + h.slice(0, 7) + (rc ? ' ' + rc.message : ''));
    }

    function firstParent(h) { var c = state.commits[h]; return c ? (c.parents[0] || null) : null; }
    function nthParent(h, n) { var c = state.commits[h]; return c && c.parents[n - 1] ? c.parents[n - 1] : null; }

    function resolveBaseRef(name) {
      // a bare name: HEAD, a branch, a tag, a full or short commit hash
      if (name === 'HEAD') return headCommitHash();
      if (state.branches.hasOwnProperty(name)) return state.branches[name];
      if (state.tags.hasOwnProperty(name)) return state.tags[name];
      if (state.commits.hasOwnProperty(name)) return name;
      // short-hash prefix match (>= 4 chars, unambiguous)
      if (/^[0-9a-f]{4,}$/.test(name)) {
        var hits = keys(state.commits).filter(function (h) { return h.indexOf(name) === 0; });
        if (hits.length === 1) return hits[0];
      }
      return null;
    }

    function resolveRev(rev) {
      if (!rev) return headCommitHash();
      // split base ref from a suffix chain of ~N and ^N, e.g. main~2^1, HEAD~3
      var m = rev.match(/^([^~^]+)(.*)$/);
      if (!m) return null;
      var h = resolveBaseRef(m[1]);
      if (!h) return null;
      var suffix = m[2], sre = /([~^])(\d*)/g, sm;
      while ((sm = sre.exec(suffix)) !== null) {
        if (!h) return null;
        if (sm[1] === '~') {
          var n = sm[2] === '' ? 1 : parseInt(sm[2], 10);
          for (var i = 0; i < n && h; i++) h = firstParent(h);
        } else { // '^'
          var p = sm[2] === '' ? 1 : parseInt(sm[2], 10);
          h = p === 0 ? h : nthParent(h, p);
        }
      }
      return h;
    }

    function doRevert(args) {
      var r = needRepo(); if (r) return r;
      var target = args.filter(function (a) { return a[0] !== '-'; })[0] || 'HEAD';
      var h = resolveRev(target);
      if (!h || !state.commits[h]) return err("fatal: bad revision '" + target + "'");
      var c = state.commits[h];
      var parent = c.parents[0];
      var pt = parent ? state.commits[parent].tree : {};
      // apply inverse: set tree back toward parent for files c changed
      var newTree = clone(treeOfHead());
      keys(c.tree).concat(keys(pt)).forEach(function (f) {
        if (pt.hasOwnProperty(f)) newTree[f] = pt[f]; else delete newTree[f];
      });
      state.index = clone(newTree); state.wd = clone(newTree);
      var nh = makeCommit('Revert "' + c.message + '"', [headCommitHash()]);
      return out('[' + currentBranch() + ' ' + nh + '] Revert "' + c.message + '"');
    }

    function doCherryPick(args) {
      var r = needRepo(); if (r) return r;
      var target = args.filter(function (a) { return a[0] !== '-'; })[0];
      var h = resolveRev(target);
      if (!h || !state.commits[h]) return err("fatal: bad revision '" + target + "'");
      var c = state.commits[h];
      var parent = c.parents[0];
      var pt = parent ? state.commits[parent].tree : {};
      var newTree = clone(treeOfHead());
      keys(c.tree).forEach(function (f) { if (c.tree[f] !== pt[f]) newTree[f] = c.tree[f]; });
      keys(pt).forEach(function (f) { if (!c.tree.hasOwnProperty(f)) delete newTree[f]; });
      state.index = clone(newTree); state.wd = clone(newTree);
      var nh = makeCommit(c.message, [headCommitHash()]);
      return out('[' + currentBranch() + ' ' + nh + '] ' + c.message);
    }

    function doStash(args) {
      var r = needRepo(); if (r) return r;
      var sub = args[0] || 'push';
      if (sub === 'list') {
        if (!state.stashes.length) return out('');
        return out(state.stashes.map(function (s, i) { return 'stash@{' + i + '}: ' + s.message; }).join('\n'));
      }
      if (sub === 'pop' || sub === 'apply') {
        if (!state.stashes.length) return err('No stash entries found.');
        var s = state.stashes[0];
        state.wd = clone(s.wd); state.index = clone(s.index);
        if (sub === 'pop') state.stashes.shift();
        return out('Applied stash: ' + s.message);
      }
      if (sub === 'clear') { state.stashes = []; return out(''); }
      // push (default)
      var head = treeOfHead();
      var dirty = keys(state.wd).some(function (f) { return state.wd[f] !== head[f]; }) ||
        keys(head).some(function (f) { return !state.wd.hasOwnProperty(f); });
      if (!dirty) return out('No local changes to save');
      var msg = 'WIP on ' + (currentBranch() || 'HEAD');
      var mi = args.indexOf('-m'); if (mi !== -1 && args[mi + 1]) msg = 'On ' + (currentBranch() || 'HEAD') + ': ' + args[mi + 1];
      state.stashes.unshift({ message: msg, wd: clone(state.wd), index: clone(state.index), base: headCommitHash() });
      loadTreeToWdIndex(headCommitHash());
      return out('Saved working directory and index state ' + msg);
    }

    function doTag(args) {
      var r = needRepo(); if (r) return r;
      var del = false, names = [];
      for (var i = 0; i < args.length; i++) {
        var a = args[i];
        if (a === '-d') del = true;
        else if (a === '-a' || a === '-m' || a === '-s') { if (a === '-m') i++; }
        else if (a[0] !== '-') names.push(a);
      }
      if (del) { delete state.tags[names[0]]; return out("Deleted tag '" + names[0] + "'"); }
      if (!names.length) return out(keys(state.tags).sort().join('\n'));
      var at = names[1] ? resolveRev(names[1]) : headCommitHash();
      if (!at) return err('fatal: failed to resolve HEAD as a valid ref.');
      state.tags[names[0]] = at;
      return out('');
    }

    function doLog(args) {
      var r = needRepo(); if (r) return r;
      var oneline = args.indexOf('--oneline') !== -1;
      var graph = args.indexOf('--graph') !== -1;
      var all = args.indexOf('--all') !== -1;
      // an explicit <rev> arg (not an option) starts the walk somewhere else
      var revArg = args.filter(function (a) { return a[0] !== '-'; })[0];

      // seed tips
      var seeds = [];
      if (all) {
        keys(state.branches).forEach(function (b) { seeds.push(state.branches[b]); });
        if (headCommitHash()) seeds.push(headCommitHash());
      } else if (revArg) {
        var rv = resolveRev(revArg);
        if (!rv) return err("fatal: ambiguous argument '" + revArg + "': unknown revision");
        seeds.push(rv);
      } else {
        if (!headCommitHash()) return out('fatal: your current branch does not have any commits yet');
        seeds.push(headCommitHash());
      }
      seeds = seeds.filter(Boolean);
      if (!seeds.length) return out('fatal: your current branch does not have any commits yet');

      // collect reachable commits
      var seen = {}, stack = seeds.slice(), collected = [];
      while (stack.length) {
        var x = stack.pop();
        if (!x || seen[x] || !state.commits[x]) continue;
        seen[x] = true;
        collected.push(state.commits[x]);
        state.commits[x].parents.forEach(function (p) { stack.push(p); });
      }
      collected.sort(function (a, b) { return b.time - a.time; });

      function decoration(hash) {
        var refs = refsAt(hash);
        return refs.length ? ' (' + refs.join(', ') + ')' : '';
      }
      function oneLineText(c) { return c.hash + decoration(c.hash) + ' ' + c.message; }
      function fullText(c) {
        var s = 'commit ' + c.hash + decoration(c.hash);
        if (c.parents.length === 2) s += '\nMerge: ' + c.parents[0].slice(0, 7) + ' ' + c.parents[1].slice(0, 7);
        s += '\nAuthor: You <you@example.com>\nDate:   (simulated)\n\n    ' + c.message;
        return s;
      }

      if (!graph) {
        var out1 = collected.map(function (c) { return oneline ? oneLineText(c) : fullText(c); });
        return out(out1.join(oneline ? '\n' : '\n\n'));
      }
      return out(renderGraphLog(collected, oneline, oneLineText, fullText));
    }

    // ASCII graph renderer: assigns each commit a lane and draws *, |, |\, |/
    function renderGraphLog(commits, oneline, oneLineText, fullText) {
      var order = commits;                 // already newest-first
      var pos = {};                        // hash -> row index
      order.forEach(function (c, i) { pos[c.hash] = i; });

      // lane assignment: greedily place each commit's first parent in the same
      // lane; a second parent opens a new lane. Lanes are freed when consumed.
      var lanes = [];                      // lanes[k] = hash expected next in that column, or null
      var rows = [];

      function laneOf(hash) { for (var k = 0; k < lanes.length; k++) if (lanes[k] === hash) return k; return -1; }
      function firstFree() { for (var k = 0; k < lanes.length; k++) if (lanes[k] === null) return k; lanes.push(null); return lanes.length - 1; }

      order.forEach(function (c) {
        var lane = laneOf(c.hash);
        if (lane === -1) { lane = firstFree(); lanes[lane] = c.hash; }
        var ncols = lanes.length;
        // commit row: '*' in this lane, '|' in other active lanes
        var cells = [];
        for (var k = 0; k < ncols; k++) {
          if (k === lane) cells.push('*');
          else cells.push(lanes[k] !== null && lanes[k] !== undefined ? '|' : ' ');
        }
        var prefix = cells.join(' ');
        var textLine = oneline ? oneLineText(c) : fullText(c).split('\n')[0];
        rows.push(prefix + '   ' + textLine);
        if (!oneline) {
          // append remaining full-text lines, indented past the graph columns
          var extra = fullText(c).split('\n').slice(1);
          var pad = cells.map(function (ch, k) { return (lanes[k] ? '|' : ' '); });
          extra.forEach(function (ln) { rows.push(pad.join(' ') + '   ' + ln); });
        }

        // consume this commit from its lane, place parents
        var parents = c.parents.slice();
        if (parents.length === 0) {
          lanes[lane] = null;
        } else {
          lanes[lane] = parents[0];
          if (parents.length === 2) {
            // open a new lane for the second parent and draw a '\'
            var nl = firstFree();
            lanes[nl] = parents[1];
            // edge row in Git's compact form: lanes left of the fork keep '|',
            // the fork lane shows '|' immediately followed by '\'
            var ep = [];
            for (var k2 = 0; k2 < lanes.length; k2++) {
              if (k2 < lane) ep.push((lanes[k2] ? '|' : ' ') + ' ');
              else if (k2 === lane) ep.push('|');
              else if (k2 === nl) ep.push('\\');
              else ep.push(' ' + (lanes[k2] ? '|' : ' '));
            }
            rows.push(ep.join(''));
          }
        }

        // if two lanes now point at the same parent, draw a '/' merge-of-lanes
        // (collapse): find duplicates and, after the next commit consuming one,
        // show '|/'. We approximate by detecting when the UPCOMING commit sits
        // in a higher lane but a lower lane holds the same hash.
        var dupTarget = null, dupLane = -1, keepLane = -1;
        for (var a = 0; a < lanes.length; a++) {
          for (var b = a + 1; b < lanes.length; b++) {
            if (lanes[a] && lanes[a] === lanes[b]) { dupTarget = lanes[a]; keepLane = a; dupLane = b; }
          }
        }
        if (dupTarget !== null) {
          lanes[dupLane] = null; // collapse the higher lane into the lower
          var cp = [];
          var top = lanes.length;
          for (var k3 = 0; k3 < top; k3++) {
            if (k3 < keepLane) cp.push((lanes[k3] ? '|' : ' ') + ' ');
            else if (k3 === keepLane) cp.push('|');
            else if (k3 === dupLane) cp.push('/');
            else cp.push(' ' + (lanes[k3] ? '|' : ' '));
          }
          rows.push(cp.join(''));
          // trim trailing empty lanes
          while (lanes.length && lanes[lanes.length - 1] === null) lanes.pop();
        }
      });
      return rows.join('\n');
    }

    function refsAt(hash) {
      var refs = [];
      if (headCommitHash() === hash) refs.push('HEAD' + (currentBranch() ? ' -> ' + currentBranch() : ''));
      keys(state.branches).forEach(function (b) { if (state.branches[b] === hash && b !== currentBranch()) refs.push(b); else if (state.branches[b] === hash && b === currentBranch()) { /* folded into HEAD */ } });
      keys(state.tags).forEach(function (t) { if (state.tags[t] === hash) refs.push('tag: ' + t); });
      return refs;
    }

    function doStatus() {
      var r = needRepo(); if (r) return r;
      var m = statusModel();
      var lines = [];
      if (state.HEAD.type === 'commit') lines.push('HEAD detached at ' + (state.HEAD.ref ? state.HEAD.ref.slice(0, 7) : '??'));
      else lines.push('On branch ' + (currentBranch() || '(unknown)'));

      if (state.merging) {
        var unmerged = unmergedFiles();
        if (unmerged.length) {
          lines.push('You have unmerged paths.');
          lines.push('  (fix conflicts and run "git commit")');
          lines.push('  (use "git merge --abort" to abort the merge)');
          lines.push('');
          lines.push('Unmerged paths:');
          lines.push('  (use "git add <file>..." to mark resolution)');
          unmerged.forEach(function (f) { lines.push('\tboth modified:   ' + f); });
          return out(lines.join('\n'));
        }
        // all conflicts resolved (added) but merge not yet committed
        lines.push('All conflicts fixed but you are still merging.');
        lines.push('  (use "git commit" to conclude merge)');
        lines.push('');
        lines.push('Changes to be committed:');
        var head0 = treeOfHead();
        state.merging.conflicts.forEach(function (f) { lines.push('\tmodified:   ' + f); });
        return out(lines.join('\n'));
      }

      if (!m.staged.length && !m.notStaged.length && !m.untracked.length) {
        lines.push('nothing to commit, working tree clean');
        return out(lines.join('\n'));
      }
      if (m.staged.length) {
        lines.push('Changes to be committed:');
        m.staged.forEach(function (s) { lines.push('\t' + s.how + ':   ' + s.file); });
      }
      if (m.notStaged.length) {
        lines.push('Changes not staged for commit:');
        m.notStaged.forEach(function (s) { lines.push('\t' + s.how + ':   ' + s.file); });
      }
      if (m.untracked.length) {
        lines.push('Untracked files:');
        m.untracked.forEach(function (f) { lines.push('\t' + f); });
      }
      return out(lines.join('\n'));
    }

    function doDiff(args) {
      var r = needRepo(); if (r) return r;
      var staged = args.indexOf('--staged') !== -1 || args.indexOf('--cached') !== -1;
      var head = treeOfHead();
      // git diff <rev>  -> that commit vs its first parent
      var revArg = args.filter(function (a) { return a[0] !== '-'; })[0];
      if (revArg && !staged) {
        var h = resolveRev(revArg);
        if (!h || !state.commits[h]) return err("fatal: ambiguous argument '" + revArg + "': unknown revision");
        var c = state.commits[h];
        var pt = c.parents[0] && state.commits[c.parents[0]] ? state.commits[c.parents[0]].tree : {};
        return out(fileDiff(pt, c.tree));
      }
      var lines = [];
      if (staged) {
        var allf = {}; keys(state.index).forEach(function (f) { allf[f] = 1; }); keys(head).forEach(function (f) { allf[f] = 1; });
        keys(allf).forEach(function (f) { if (state.index[f] !== head[f]) lines.push('diff --git a/' + f + ' b/' + f + '\n- ' + (head[f] || '') + '\n+ ' + (state.index[f] || '')); });
      } else {
        var all2 = {}; keys(state.wd).forEach(function (f) { all2[f] = 1; }); keys(state.index).forEach(function (f) { all2[f] = 1; });
        keys(all2).forEach(function (f) { if (state.wd[f] !== state.index[f]) lines.push('diff --git a/' + f + ' b/' + f + '\n- ' + (state.index[f] || '') + '\n+ ' + (state.wd[f] || '')); });
      }
      return out(lines.join('\n'));
    }

    function doReflog() {
      var r = needRepo(); if (r) return r;
      return out(state.reflog.length ? state.reflog.join('\n') : '(empty)');
    }

    function fileDiff(prevTree, newTree) {
      var lines = [], allf = {};
      keys(prevTree).forEach(function (f) { allf[f] = 1; });
      keys(newTree).forEach(function (f) { allf[f] = 1; });
      keys(allf).sort().forEach(function (f) {
        var a = prevTree[f], b = newTree[f];
        if (a === b) return;
        lines.push('diff --git a/' + f + ' b/' + f);
        if (a === undefined) lines.push('new file mode 100644');
        if (b === undefined) lines.push('deleted file mode 100644');
        lines.push('--- ' + (a === undefined ? '/dev/null' : 'a/' + f));
        lines.push('+++ ' + (b === undefined ? '/dev/null' : 'b/' + f));
        if (a !== undefined) String(a).split('\n').forEach(function (l) { lines.push('-' + l); });
        if (b !== undefined) String(b).split('\n').forEach(function (l) { lines.push('+' + l); });
      });
      return lines.join('\n');
    }

    function doShow(args) {
      var r = needRepo(); if (r) return r;
      var target = args.filter(function (a) { return a[0] !== '-'; })[0] || 'HEAD';
      var h = resolveRev(target);
      if (!h || !state.commits[h]) return err("fatal: ambiguous argument '" + target + "': unknown revision");
      var c = state.commits[h];
      var refs = refsAt(h); var dec = refs.length ? ' (' + refs.join(', ') + ')' : '';
      var head = ['commit ' + h + dec];
      if (c.parents.length === 2) head.push('Merge: ' + c.parents[0].slice(0, 7) + ' ' + c.parents[1].slice(0, 7));
      head.push('Author: You <you@example.com>');
      head.push('Date:   (simulated)');
      head.push('');
      head.push('    ' + c.message);
      head.push('');
      var parentTree = c.parents[0] && state.commits[c.parents[0]] ? state.commits[c.parents[0]].tree : {};
      var diff = fileDiff(parentTree, c.tree);
      return out(head.join('\n') + (diff ? '\n' + diff : ''));
    }

    function doCatFile(args) {
      var r = needRepo(); if (r) return r;
      var showType = args.indexOf('-t') !== -1;
      var pretty = args.indexOf('-p') !== -1;
      var target = args.filter(function (a) { return a[0] !== '-'; })[0];
      if (!target) return err('fatal: no object name given');
      // "<rev>^{tree}" must be checked first: plain resolveRev would read it as "<rev>^" (the parent)
      var h = /\^\{tree\}$/.test(target) ? null : resolveRev(target);
      if (h && state.commits[h]) {
        if (showType) return out('commit');
        var c = state.commits[h];
        // pretty-print a commit object like git cat-file -p
        var body = ['tree ' + treeId(c.tree)];
        c.parents.forEach(function (p) { body.push('parent ' + p); });
        body.push('author You <you@example.com> (simulated)');
        body.push('committer You <you@example.com> (simulated)');
        body.push('');
        body.push(c.message);
        return out(pretty ? body.join('\n') : ('commit ' + h));
      }
      // <rev>^{tree} or a tree id printed above -> list the tree like git cat-file -p <tree>
      var treeMatch = /^(.+)\^\{tree\}$/.exec(target);
      var tr = null;
      if (treeMatch) { var th = resolveRev(treeMatch[1]); if (th && state.commits[th]) tr = state.commits[th].tree; }
      else keys(state.commits).forEach(function (k) { var t = state.commits[k].tree; if (treeId(t).indexOf(target) === 0 && target.length >= 4) tr = t; });
      if (tr) {
        if (showType) return out('tree');
        return out(keys(tr).sort().map(function (f) { return '100644 blob ' + blobId(tr[f]) + '\t' + f; }).join('\n') || '');
      }
      // a blob id printed in a tree listing -> its content
      if (target.length >= 4) {
        var blob = null;
        keys(state.commits).forEach(function (k) { var t = state.commits[k].tree; keys(t).forEach(function (f) { if (blobId(t[f]).indexOf(target) === 0) blob = t[f]; }); });
        if (blob !== null) return out(showType ? 'blob' : blob);
      }
      // allow cat-file on a tag name -> the commit it points to
      if (state.tags.hasOwnProperty(target)) {
        if (showType) return out('tag');
        return out('object ' + state.tags[target] + '\ntype commit\ntag ' + target);
      }
      return err("fatal: Not a valid object name " + target);
    }

    // ---------- shell-ish commands ----------
    function doTouch(a) { a.forEach(function (f) { if (!state.wd.hasOwnProperty(f)) state.wd[f] = ''; }); return out(''); }
    function doRm(a) {
      var files = a.filter(function (x) { return x[0] !== '-'; });
      var cached = a.indexOf('--cached') !== -1;
      files.forEach(function (f) { delete state.wd[f]; if (!cached) { /* leave index for status */ } if (cached) { /* keep wd */ state.wd[f] = state.index[f]; delete state.index[f]; } else { delete state.index[f] === undefined; } });
      return out('');
    }
    function doLs() { return out(keys(state.wd).sort().join('  ') || '(empty)'); }
    function doCat(a) { var f = a[0]; return state.wd.hasOwnProperty(f) ? out(state.wd[f]) : err('cat: ' + f + ': No such file'); }
    function doEcho(raw) {
      // echo "text" > file  OR  echo "text" >> file
      var mAppend = raw.match(/^echo\s+(.*)\s+>>\s+(\S+)\s*$/);
      var mWrite = raw.match(/^echo\s+(.*)\s+>\s+(\S+)\s*$/);
      function unq(s) { s = s.trim(); if ((s[0] === '"' && s.slice(-1) === '"') || (s[0] === "'" && s.slice(-1) === "'")) return s.slice(1, -1); return s; }
      if (mAppend) { var f = mAppend[2]; var t = unq(mAppend[1]); state.wd[f] = (state.wd[f] ? state.wd[f] + '\n' : '') + t; return out(''); }
      if (mWrite) { var f2 = mWrite[2]; state.wd[f2] = unq(mWrite[1]); return out(''); }
      return out(unq(raw.replace(/^echo\s+/, '')));
    }

    // ---------- tokenizer (respects quotes) ----------
    function tokenize(line) {
      var toks = [], re = /"([^"]*)"|'([^']*)'|(\S+)/g, m;
      while ((m = re.exec(line)) !== null) toks.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
      return toks;
    }

    // ---------- dispatch ----------
    function run(line) {
      line = (line || '').trim();
      if (!line) return out('');
      // echo redirection handled on the raw string
      if (/^echo\s+.*>>?\s+\S+/.test(line)) return doEcho(line);
      var toks = tokenize(line);
      var cmd = toks[0];
      if (cmd === 'echo') return doEcho(line);
      if (cmd === 'ls') return doLs();
      if (cmd === 'cat') return doCat(toks.slice(1));
      if (cmd === 'touch') return doTouch(toks.slice(1));
      if (cmd === 'rm') return doRm(toks.slice(1));
      if (cmd === 'clear') return { ok: true, output: '', clear: true };
      if (cmd !== 'git') return err(cmd + ': command not found (try "git ...", or ls/cat/touch/echo/rm)');
      var sub = toks[1], rest = toks.slice(2);
      switch (sub) {
        case 'init': return doInit();
        case 'add': return doAdd(rest);
        case 'restore': return doRestore(rest);
        case 'rm': return doRm(rest);
        case 'commit': return doCommit(rest);
        case 'status': return doStatus();
        case 'log': return doLog(rest);
        case 'diff': return doDiff(rest);
        case 'branch': return doBranch(rest);
        case 'switch': return checkoutOrSwitch(rest, true);
        case 'checkout': return checkoutOrSwitch(rest, false);
        case 'merge': return doMerge(rest);
        case 'rebase': return doRebase(rest);
        case 'reset': return doReset(rest);
        case 'revert': return doRevert(rest);
        case 'cherry-pick': return doCherryPick(rest);
        case 'stash': return doStash(rest);
        case 'tag': return doTag(rest);
        case 'reflog': return doReflog();
        case 'show': return doShow(rest);
        case 'cat-file': return doCatFile(rest);
        case 'config': return out('');
        case 'help': return out(helpText(rest[0]));
        default: return err("git: '" + sub + "' is not a git command. See 'git help'.");
      }
    }

    function helpText(cmd) {
      var H = {
        init: 'git init — create an empty Git repository.',
        add: 'git add <file|.|-A> — stage changes for the next commit.',
        commit: 'git commit -m "msg" [-a] — record staged changes. --amend rewrites the last commit.',
        status: 'git status — show staged / modified / untracked files.',
        log: 'git log [--oneline --graph --all] — show commit history.',
        branch: 'git branch [name|-d name|-D name] — list, create or delete branches.',
        switch: 'git switch [-c] <name> — change branches (-c to create).',
        merge: 'git merge <branch> [--no-ff|--abort] — join another branch in.',
        rebase: 'git rebase <branch> — replay your commits onto another branch.',
        reset: 'git reset [--soft|--mixed|--hard] <rev> — move branch pointer.',
        revert: 'git revert <rev> — create a new commit that undoes one.',
        stash: 'git stash [push|pop|apply|list|clear] — shelve changes.',
        tag: 'git tag [-a -m "msg"] <name> — mark a commit.',
        'cherry-pick': 'git cherry-pick <rev> — apply one commit here.',
        reflog: 'git reflog — history of where HEAD has pointed.',
        show: 'git show [rev] — a commit\'s header, message and its diff vs the first parent.',
        'cat-file': 'git cat-file -t|-p <rev> — show an object\'s type (-t) or contents (-p).'
      };
      if (cmd && H[cmd]) return H[cmd];
      return 'Playground commands:\n  git: init add restore rm commit status log diff show cat-file branch switch checkout merge rebase reset revert cherry-pick stash tag reflog config help\n  shell: ls cat touch "echo text > file" "echo text >> file" rm clear\nType "help <command>" for detail.';
    }

    // ---------- introspection for the UI graph & challenges ----------
    function snapshot() {
      return {
        initialized: state.initialized,
        wd: clone(state.wd),
        index: clone(state.index),
        branches: clone(state.branches),
        tags: clone(state.tags),
        HEAD: { type: state.HEAD.type, ref: state.HEAD.ref },
        currentBranch: currentBranch(),
        headCommit: headCommitHash(),
        merging: state.merging ? { fromBranch: state.merging.fromBranch, conflicts: state.merging.conflicts.slice() } : null,
        stashCount: state.stashes.length,
        commits: (function () { var o = {}; keys(state.commits).forEach(function (h) { var c = state.commits[h]; o[h] = { hash: h, message: c.message, parents: c.parents.slice(), time: c.time }; }); return o; })(),
        status: state.initialized ? statusModel() : null
      };
    }

    return {
      run: run,
      reset: reset,
      snapshot: snapshot,
      // expose a few helpers for tests
      _resolveRev: resolveRev,
      _state: function () { return state; }
    };
  }

  // ===================== BROWSER UI =====================
  function initUI() {
    var termBody = document.getElementById('pgTerm');
    var input = document.getElementById('pgInput');
    var graphWrap = document.getElementById('pgGraph');
    var chalWrap = document.getElementById('pgChallenges');
    if (!termBody || !input) return;

    var engine = createEngine();
    var history = [], hpos = -1;

    var CHALLENGES = [
      { id: 'c1', text: 'Initialise a repo and make your first commit', done: function (s) { return s.headCommit && Object.keys(s.commits).length >= 1; } },
      { id: 'c2', text: 'Create a second commit (history of 2+)', done: function (s) { return Object.keys(s.commits).length >= 2; } },
      { id: 'c3', text: 'Create a branch and switch to it', done: function (s) { return Object.keys(s.branches).length >= 2 && s.currentBranch && s.currentBranch !== 'main'; } },
      { id: 'c4', text: 'Merge a feature branch back (fast-forward or merge commit)', done: function (s) { return Object.keys(s.commits).some(function (h) { return s.commits[h].parents.length === 2; }) || s._ff; } },
      { id: 'c5', text: 'Create AND resolve a merge conflict', done: function (s) { return s._resolvedConflict; } },
      { id: 'c6', text: 'Undo the last commit but KEEP the changes (reset --soft/--mixed)', done: function (s) { return s._softReset; } },
      { id: 'c7', text: 'Tag a commit', done: function (s) { return Object.keys(s.tags).length >= 1; } },
      { id: 'c8', text: 'Use git reflog to inspect history', done: function (s) { return s._usedReflog; } },
      { id: 'c9', text: 'Stash changes and pop them back', done: function (s) { return s._stashedAndPopped; } },
      { id: 'c10', text: 'Rebase a branch onto another', done: function (s) { return s._rebased; } }
    ];
    var flags = {};

    function print(text, cls) {
      var div = document.createElement('div');
      div.className = 'term-line';
      if (cls) div.classList.add(cls);
      var span = document.createElement('span');
      span.className = 'term-out';
      span.textContent = text;
      div.appendChild(span);
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    }
    function printCmd(text) {
      var div = document.createElement('div');
      div.className = 'term-line';
      div.innerHTML = '<span class="term-prompt">git&gt;</span>';
      var span = document.createElement('span');
      span.className = 'term-out';
      span.textContent = text;
      div.appendChild(span);
      termBody.appendChild(div);
    }

    function trackFlags(line, res) {
      var toks = line.trim().split(/\s+/);
      if (toks[0] === 'git' && toks[1] === 'reflog') flags._usedReflog = true;
      if (toks[0] === 'git' && toks[1] === 'reset' && (line.indexOf('--soft') !== -1 || line.indexOf('--mixed') !== -1 || (line.indexOf('--hard') === -1 && toks.indexOf('reset') !== -1))) flags._softReset = true;
      if (toks[0] === 'git' && toks[1] === 'rebase' && res.ok) flags._rebased = true;
      if (toks[0] === 'git' && toks[1] === 'merge' && res.ok && /Fast-forward/.test(res.output)) flags._ff = true;
      if (toks[0] === 'git' && toks[1] === 'stash') {
        if (toks[2] === 'pop' && res.ok) { if (flags._stashed) flags._stashedAndPopped = true; }
        else if (!toks[2] || toks[2] === 'push') { if (res.ok && /Saved/.test(res.output)) flags._stashed = true; }
      }
      // conflict resolved: we were merging, now a merge commit exists and no merging state
      var snap = engine.snapshot();
      if (snap._wasMerging && !snap.merging) flags._resolvedConflict = true;
    }

    var wasMerging = false;
    function execute(line) {
      printCmd(line);
      var res = engine.run(line);
      if (res.clear) { termBody.innerHTML = ''; return; }
      // detect conflict-resolution transition
      var before = wasMerging;
      var res2 = res;
      if (res.output) print(res.output, res.ok ? '' : 'term-err');
      var snap = engine.snapshot();
      if (before && !snap.merging && /Merge made|\]/.test(res.output || '')) flags._resolvedConflict = true;
      wasMerging = !!snap.merging;
      trackFlags(line, res);
      renderGraph();
      renderChallenges();
    }

    function renderGraph() {
      var s = engine.snapshot();
      if (!s.initialized) { graphWrap.innerHTML = '<p class="pg-hint">Run <code>git init</code> to start. The commit graph will appear here and redraw after every command.</p>'; return; }
      var commits = Object.keys(s.commits).map(function (h) { return s.commits[h]; }).sort(function (a, b) { return a.time - b.time; });
      if (!commits.length) { graphWrap.innerHTML = '<p class="pg-hint">No commits yet. Try <code>git add .</code> then <code>git commit -m "first"</code>.</p>'; return; }
      var W = 600, rowH = 54, r = 16, leftPad = 60;
      var x = {}, i = 0;
      commits.forEach(function (c) { x[c.hash] = leftPad + (i++) * 78; });
      var H = 150;
      var svg = ['<svg viewBox="0 0 ' + Math.max(W, leftPad + commits.length * 78) + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">'];
      svg.push('<defs><marker id="pgar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8c93b0"/></marker></defs>');
      var cy = 85;
      commits.forEach(function (c) {
        c.parents.forEach(function (p) {
          if (x[p] !== undefined) svg.push('<line x1="' + (x[c.hash] - r) + '" y1="' + cy + '" x2="' + (x[p] + r) + '" y2="' + cy + '" stroke="#8c93b0" stroke-width="2" marker-end="url(#pgar)"/>');
        });
      });
      commits.forEach(function (c) {
        var isHead = c.hash === s.headCommit;
        var stroke = c.parents.length === 2 ? '#f0b429' : (isHead ? '#f05032' : '#9f7aea');
        svg.push('<circle cx="' + x[c.hash] + '" cy="' + cy + '" r="' + r + '" fill="#271714" stroke="' + stroke + '" stroke-width="2"/>');
        svg.push('<text x="' + x[c.hash] + '" y="' + (cy + 4) + '" text-anchor="middle" fill="#f3ece9" font-size="9">' + c.hash.slice(0, 4) + '</text>');
        svg.push('<text x="' + x[c.hash] + '" y="' + (cy + 30) + '" text-anchor="middle" fill="#b0938c" font-size="8.5">' + esc(c.message).slice(0, 12) + '</text>');
        // branch/tag labels
        var labels = [];
        Object.keys(s.branches).forEach(function (b) { if (s.branches[b] === c.hash) labels.push(b); });
        Object.keys(s.tags).forEach(function (t) { if (s.tags[t] === c.hash) labels.push('\u{1F3F7} ' + t); });
        if (isHead) labels.push('HEAD');
        labels.forEach(function (lab, li) {
          var col = lab === 'HEAD' ? '#f0b429' : (lab[0] === '\u{1F3F7}' ? '#3fdd94' : '#f05032');
          svg.push('<text x="' + x[c.hash] + '" y="' + (40 - li * 14) + '" text-anchor="middle" fill="' + col + '" font-size="9" font-weight="700">' + esc(lab) + '</text>');
        });
      });
      svg.push('</svg>');
      graphWrap.innerHTML = svg.join('');
    }
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

    function renderChallenges() {
      var s = engine.snapshot();
      for (var k in flags) s[k] = flags[k];
      chalWrap.innerHTML = '';
      CHALLENGES.forEach(function (c) {
        var done = false; try { done = c.done(s); } catch (e) { done = false; }
        var li = document.createElement('li');
        li.innerHTML = '<span class="pg-check">' + (done ? '\u2705' : '\u2b1c') + '</span> ' + c.text;
        if (done) li.className = 'pg-done';
        chalWrap.appendChild(li);
      });
    }

    function complete(line) {
      var toks = line.split(/\s+/);
      var vocab;
      if (toks.length <= 1) vocab = ['git', 'ls', 'cat', 'touch', 'echo', 'rm', 'clear'];
      else if (toks[0] === 'git' && toks.length === 2) vocab = ['init', 'add', 'commit', 'status', 'log', 'diff', 'show', 'cat-file', 'branch', 'switch', 'checkout', 'merge', 'rebase', 'reset', 'revert', 'cherry-pick', 'stash', 'tag', 'reflog', 'help'];
      else return line;
      var last = toks[toks.length - 1];
      var hits = vocab.filter(function (v) { return v.indexOf(last) === 0; });
      if (hits.length === 1) { toks[toks.length - 1] = hits[0]; return toks.join(' '); }
      if (hits.length > 1) print(hits.join('  '), 'pg-hint-line');
      return line;
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var line = input.value;
        if (line.trim()) { history.unshift(line); hpos = -1; execute(line); }
        input.value = '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        input.value = complete(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hpos < history.length - 1) { hpos++; input.value = history[hpos]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hpos > 0) { hpos--; input.value = history[hpos]; } else { hpos = -1; input.value = ''; }
      }
    });

    var runBtn = document.getElementById('pgRunBtn');
    if (runBtn) runBtn.addEventListener('click', function () { var l = input.value; if (l.trim()) { history.unshift(l); execute(l); } input.value = ''; input.focus(); });
    var resetBtn = document.getElementById('pgResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', function () { engine.reset(); flags = {}; wasMerging = false; termBody.innerHTML = ''; print('Playground reset. Run "git init" to begin, or "help" for commands.', 'pg-hint-line'); renderGraph(); renderChallenges(); });

    // seed a tiny guided intro
    print('Welcome to the Git Playground. This is a safe simulator — nothing touches your real machine.', 'pg-hint-line');
    print('Try: git init  →  echo "hi" > a.txt  →  git add .  →  git commit -m "first"', 'pg-hint-line');
    print('Type "help" for the full command list. Tab completes commands. ↑/↓ recall history.', 'pg-hint-line');
    renderGraph();
    renderChallenges();

    handleTryHash();
    window.addEventListener('hashchange', handleTryHash);
    input.focus();

    // ---- deep-link from the Interview page: playground.html#try=<question id> ----
    function handleTryHash() {
      var m = (location.hash || '').match(/try=([^&]+)/);
      if (!m) return;
      var id = decodeURIComponent(m[1]);
      var data = window.STUDYHUB_INTERVIEW;
      if (!data || !data.questions) return;
      var q = data.questions.filter(function (x) { return x.id === id; })[0];
      if (!q) return;
      renderTryPanel(q);
      // run any setup silently, then prefill the starter so the user presses Run
      if (q.tryIt) {
        if (q.tryIt.setup) {
          String(q.tryIt.setup).split('\n').forEach(function (ln) { if (ln.trim()) engine.run(ln); });
          renderGraph(); renderChallenges();
          print('(loaded setup for "' + id + '")', 'pg-hint-line');
        }
        if (q.tryIt.starter) {
          var cmds = String(q.tryIt.starter).split('\n').filter(function (l) { return l.trim(); });
          input.value = cmds[0] || '';
          if (cmds.length > 1) {
            for (var i = cmds.length - 1; i >= 0; i--) history.unshift(cmds[i]);
          }
          print('Starter loaded — press Run (or Enter) to step through ' + cmds.length + ' command(s). Use the Up arrow to recall them.', 'pg-hint-line');
        }
      }
    }

    function renderTryPanel(q) {
      var panel = document.getElementById('pgTryPanel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'pgTryPanel';
        panel.className = 'card pg-try-panel';
        var termCard = termBody.closest ? termBody.closest('.card') : null;
        if (termCard && termCard.parentNode) termCard.parentNode.insertBefore(panel, termCard);
        else termBody.parentNode.insertBefore(panel, termBody);
      }
      var lvl = { easy: 'beginner', medium: 'intermediate', hard: 'advanced' }[q.level] || 'beginner';
      panel.innerHTML = '<h3><span class="num">\u25B6</span> Try it: interview question</h3>' +
        '<p style="margin:0 0 8px;"><span class="badge ' + lvl + '">' + (q.level || '') + '</span> ' + esc(q.category || '') + '</p>' +
        '<p style="font-weight:700; margin:0 0 6px;">' + esc(q.q) + '</p>' +
        '<p class="pg-hint">The starter commands are loaded below. Run them, then try to answer in your own words before checking the full write-up on the <a href="interview.html#q-' + encodeURIComponent(q.id) + '">Interview page</a>.</p>';
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initUI);
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createEngine: createEngine };
  }
})();
