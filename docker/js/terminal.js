// CLI Playground simulator for Docker.
//
// ARCHITECTURE: the whole simulator is a pure, DOM-free `engine` object. It owns
// all state (containers, images, networks, volumes) and a single `run(cmdRaw)`
// method that returns { out: string, clear?: bool } — no document access anywhere.
// The DOM layer at the bottom only reads the input box, calls engine.run(), and
// paints the result + the live state panel. This split is what makes the engine
// testable under node with no browser (see the module.exports at the very end).

(function (global) {
  'use strict';

  // ------------------------------------------------------------------ helpers
  function pad(s, n) { s = String(s); return s.length >= n ? s + '  ' : s + ' '.repeat(n - s.length); }
  function normImage(name) {
    if (!name) return name;
    // registry host like localhost:5000/foo:1 — only treat the LAST colon as a tag sep when it has no slash after it
    var slash = name.lastIndexOf('/');
    var tail = slash === -1 ? name : name.slice(slash);
    return tail.indexOf(':') === -1 ? name + ':latest' : name;
  }
  function shortId(id) { return id.slice(0, 12); }

  // tokenize respecting simple "double quotes" so `-e MSG="a b"` stays one token
  function tokenize(s) {
    var out = [], cur = '', q = false, i;
    for (i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '"') { q = !q; continue; }
      if (/\s/.test(ch) && !q) { if (cur !== '') { out.push(cur); cur = ''; } }
      else cur += ch;
    }
    if (cur !== '') out.push(cur);
    return out;
  }

  // ------------------------------------------------------------------ engine
  function createEngine(opts) {
    opts = opts || {};
    // deterministic id generator so tests are repeatable; override seed via opts.seed
    var seed = opts.seed != null ? opts.seed : 1;
    function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function genId() {
      var hex = '', i;
      for (i = 0; i < 16; i++) hex += Math.floor(rand() * 16).toString(16);
      return hex;
    }
    function genSize() { return (5 + Math.floor(rand() * 400)) + 'MB'; }

    var E = {
      images: [],      // { repo, tag, id, size, created }
      containers: [],   // { id, name, image, status:'running'|'exited'|'paused', ports:[], networks:[], volumes:[], cmd, created, exitCode, restart }
      networks: [],     // { id, name, driver, scope, builtin }
      volumes: [],      // { name, driver, mountpoint }
      _ncount: 0
    };

    // seed the three default networks Docker always ships with
    E.networks.push({ id: genId(), name: 'bridge', driver: 'bridge', scope: 'local', builtin: true });
    E.networks.push({ id: genId(), name: 'host', driver: 'host', scope: 'local', builtin: true });
    E.networks.push({ id: genId(), name: 'none', driver: 'null', scope: 'local', builtin: true });

    // ---- lookups
    function findImage(ref) {
      if (!ref) return null;
      var n = normImage(ref);
      var byName = E.images.filter(function (im) { return im.repo + ':' + im.tag === n; })[0];
      if (byName) return byName;
      // bare repo (no tag) matches :latest; also allow id prefix
      return E.images.filter(function (im) {
        return im.repo === ref || im.id.indexOf(ref) === 0;
      })[0] || null;
    }
    function hasImage(ref) { return !!findImage(ref); }
    function addImage(ref) {
      if (hasImage(ref)) return findImage(ref);
      var n = normImage(ref), c = n.split(':'), tag = c.pop(), repo = c.join(':');
      var im = { repo: repo, tag: tag, id: genId(), size: genSize(), created: 'Just now' };
      E.images.push(im);
      return im;
    }
    function findContainer(ref) {
      if (!ref) return null;
      return E.containers.filter(function (c) { return c.name === ref || c.id.indexOf(ref) === 0; })[0] || null;
    }
    function findNetwork(ref) {
      if (!ref) return null;
      return E.networks.filter(function (n) { return n.name === ref || n.id.indexOf(ref) === 0; })[0] || null;
    }
    function findVolume(ref) { return E.volumes.filter(function (v) { return v.name === ref; })[0] || null; }

    // ---- docker run argument parser (the image is the FIRST non-flag token after flags)
    var FLAGS_WITH_VALUE = ['-p', '--publish', '--name', '-e', '--env', '-v', '--volume',
      '--network', '--net', '--memory', '-m', '--cpus', '-w', '--workdir', '--user', '-u',
      '--mount', '--restart', '--tmpfs', '--hostname', '-h', '--label', '-l', '--entrypoint',
      '--health-cmd', '--health-interval'];

    function parseRun(args) {
      var r = { detached: false, name: null, ports: [], envs: [], volumes: [], networks: [], restart: null, image: null, cmd: [] };
      var i = 0;
      for (; i < args.length; i++) {
        var t = args[i];
        if (t.indexOf('=') !== -1 && t[0] === '-') { // --name=foo form
          var eq = t.indexOf('='), k = t.slice(0, eq), v = t.slice(eq + 1);
          applyFlag(r, k, v);
          continue;
        }
        if (FLAGS_WITH_VALUE.indexOf(t) !== -1) { applyFlag(r, t, args[i + 1]); i++; continue; }
        if (t === '-d' || t === '--detach') { r.detached = true; continue; }
        if (t === '-it' || t === '-ti' || t === '-i' || t === '-t' || t === '--rm' || t === '-dit' || t === '-itd') {
          if (t.indexOf('d') !== -1) r.detached = true;
          continue;
        }
        if (t[0] === '-') continue; // unknown flag, skip
        // first bare token = image, the rest is the container command
        r.image = t;
        r.cmd = args.slice(i + 1);
        break;
      }
      return r;
    }
    function applyFlag(r, k, v) {
      if (v == null) return;
      if (k === '--name') r.name = v;
      else if (k === '-p' || k === '--publish') r.ports.push(v);
      else if (k === '-e' || k === '--env') r.envs.push(v);
      else if (k === '-v' || k === '--volume' || k === '--mount') r.volumes.push(v);
      else if (k === '--network' || k === '--net') r.networks.push(v);
      else if (k === '--restart') r.restart = v;
    }

    // ---------------------------------------------------------------- commands
    function cmdRun(args) {
      var r = parseRun(args);
      if (!r.image) return err('"docker run" requires at least 1 argument.\nSee \'docker run --help\'.');
      if (r.name && E.containers.some(function (c) { return c.name === r.name; }))
        return err('docker: Error response from daemon: Conflict. The container name "/' + r.name + '" is already in use by another container. You have to remove (or rename) that container to be able to reuse that name.');
      // record declared volumes
      r.volumes.forEach(function (spec) {
        var vol = spec.split(':')[0];
        if (vol && vol.indexOf('/') === -1 && !findVolume(vol)) E.volumes.push({ name: vol, driver: 'local', mountpoint: '/var/lib/docker/volumes/' + vol + '/_data' });
      });
      // network: default bridge unless one named; create a user-defined one on the fly only if explicitly a known/custom name? Docker errors on unknown net.
      var nets = r.networks.length ? r.networks.slice() : ['bridge'];
      var badNet = nets.filter(function (n) { return !findNetwork(n); })[0];
      if (badNet) return err('docker: Error response from daemon: network ' + badNet + ' not found.');
      var already = hasImage(r.image);
      var im = addImage(r.image);
      var id = genId();
      var name = r.name || (im.repo.split('/').pop() + '_' + genId().slice(0, 6));
      var c = {
        id: id, name: name, image: normImage(r.image), status: r.detached ? 'running' : 'running',
        ports: r.ports.slice(), networks: nets, volumes: r.volumes.slice(), cmd: r.cmd.join(' '),
        created: 'Just now', exitCode: 0, restart: r.restart || 'no'
      };
      E.containers.push(c);
      var pull = already ? '' : ("Unable to find image '" + normImage(r.image) + "' locally\n" + normImage(r.image).split(':')[1] + ": Pulling from library/" + im.repo + "\nStatus: Downloaded newer image for " + normImage(r.image) + "\n");
      if (r.detached) return ok(pull + id);
      return ok(pull + "(running in foreground \u2014 press Ctrl+C to stop in a real terminal)");
    }

    function cmdPs(args) {
      var all = args.indexOf('-a') !== -1 || args.indexOf('--all') !== -1;
      var quiet = args.indexOf('-q') !== -1 || args.indexOf('--quiet') !== -1;
      var list = E.containers.filter(function (c) { return all || c.status === 'running'; });
      if (quiet) return ok(list.map(function (c) { return shortId(c.id); }).join('\n'));
      var head = pad('CONTAINER ID', 15) + pad('IMAGE', 16) + pad('COMMAND', 14) + pad('STATUS', 20) + pad('PORTS', 22) + 'NAMES';
      if (!list.length) return ok(head + '\n');
      var rows = list.map(function (c) {
        var st = c.status === 'running' ? 'Up 2 minutes' : (c.status === 'paused' ? 'Up 2 minutes (Paused)' : 'Exited (' + c.exitCode + ') 1 minute ago');
        var ports = c.ports.map(function (p) { var x = p.split(':'); return (x.length > 1 ? '0.0.0.0:' + x[0] + '->' + x[1] : p) + '/tcp'; }).join(', ');
        return pad(shortId(c.id), 15) + pad(c.image.length > 15 ? c.image.slice(0, 14) : c.image, 16) + pad('"' + (c.cmd || 'docker-ent').slice(0, 10) + '"', 14) + pad(st, 20) + pad(ports, 22) + c.name;
      });
      return ok(head + '\n' + rows.join('\n'));
    }

    function cmdImages(args) {
      var quiet = args.indexOf('-q') !== -1;
      // image filters: --filter reference=foo* / dangling=... (basic)
      var filt = null;
      var fi = args.indexOf('--filter'); if (fi === -1) fi = args.indexOf('-f');
      if (fi !== -1 && args[fi + 1]) filt = args[fi + 1];
      var list = E.images.slice();
      if (filt && filt.indexOf('reference=') === 0) {
        var pat = filt.slice('reference='.length).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        var re = new RegExp('^' + pat);
        list = list.filter(function (im) { return re.test(im.repo) || re.test(im.repo + ':' + im.tag); });
      }
      if (quiet) return ok(list.map(function (im) { return shortId(im.id); }).join('\n'));
      var head = pad('REPOSITORY', 20) + pad('TAG', 12) + pad('IMAGE ID', 15) + 'SIZE';
      if (!list.length) return ok(head + '\n');
      return ok(head + '\n' + list.map(function (im) { return pad(im.repo, 20) + pad(im.tag, 12) + pad(shortId(im.id), 15) + im.size; }).join('\n'));
    }

    function cmdPull(args) {
      var img = args.filter(function (t) { return t[0] !== '-'; })[0];
      if (!img) return err('"docker pull" requires exactly 1 argument.');
      var had = hasImage(img);
      var im = addImage(img);
      var tag = normImage(img).split(':').pop();
      if (had) return ok(tag + ": Pulling from library/" + im.repo + "\nStatus: Image is up to date for " + normImage(img));
      return ok(tag + ": Pulling from library/" + im.repo + "\nDigest: sha256:" + genId() + genId() + "\nStatus: Downloaded newer image for " + normImage(img));
    }

    function cmdBuild(args) {
      var ti = args.indexOf('-t'); if (ti === -1) ti = args.indexOf('--tag');
      var tag = ti !== -1 ? args[ti + 1] : null;
      if (tag) addImage(tag);
      return ok("[+] Building 3.4s (10/10) FINISHED\n => [internal] load build definition from Dockerfile\n => => transferring dockerfile: 142B\n => [1/4] FROM docker.io/library/node:20-alpine\n => [2/4] WORKDIR /app\n => [3/4] COPY . .\n => [4/4] RUN npm ci --omit=dev\n => exporting to image\n => => writing image sha256:" + genId() + "\n" + (tag ? " => => naming to docker.io/library/" + normImage(tag) : " => => (untagged \u2014 use -t name:tag to name it)"));
    }

    function cmdStartStop(sub, args) {
      var targets = args.filter(function (t) { return t[0] !== '-'; });
      if (!targets.length) return err('"docker ' + sub + '" requires at least 1 argument.');
      var lines = [];
      targets.forEach(function (t) {
        var c = findContainer(t);
        if (!c) { lines.push('Error response from daemon: No such container: ' + t); return; }
        if (sub === 'stop') { c.status = 'exited'; c.exitCode = 0; }
        else if (sub === 'start') { c.status = 'running'; }
        else if (sub === 'restart') { c.status = 'running'; }
        else if (sub === 'pause') { if (c.status !== 'running') { lines.push('Error response from daemon: Container ' + t + ' is not running'); return; } c.status = 'paused'; }
        else if (sub === 'unpause') { if (c.status !== 'paused') { lines.push('Error response from daemon: Container ' + t + ' is not paused'); return; } c.status = 'running'; }
        else if (sub === 'kill') { if (c.status !== 'running' && c.status !== 'paused') { lines.push('Error response from daemon: Cannot kill container: ' + t + ': Container ' + c.id + ' is not running'); return; } c.status = 'exited'; c.exitCode = 137; }
        lines.push(t);
      });
      return joinRes(lines);
    }

    function cmdRm(args) {
      var force = args.indexOf('-f') !== -1 || args.indexOf('--force') !== -1;
      var targets = args.filter(function (t) { return t[0] !== '-'; });
      if (!targets.length) return err('"docker rm" requires at least 1 argument.');
      var lines = [];
      targets.forEach(function (t) {
        var c = findContainer(t);
        if (!c) { lines.push('Error response from daemon: No such container: ' + t); return; }
        if ((c.status === 'running' || c.status === 'paused') && !force) {
          lines.push('Error response from daemon: cannot remove container "/' + c.name + '": container is running: stop the container before removing or force remove');
          return;
        }
        E.containers.splice(E.containers.indexOf(c), 1);
        lines.push(t);
      });
      return joinRes(lines);
    }

    function cmdRmi(args) {
      var force = args.indexOf('-f') !== -1 || args.indexOf('--force') !== -1;
      var targets = args.filter(function (t) { return t[0] !== '-'; });
      if (!targets.length) return err('"docker rmi" requires at least 1 argument.');
      var lines = [];
      targets.forEach(function (t) {
        var im = findImage(t);
        if (!im) { lines.push('Error response from daemon: No such image: ' + t); return; }
        var inUse = E.containers.some(function (c) { return c.image === im.repo + ':' + im.tag; });
        if (inUse && !force) {
          lines.push('Error response from daemon: conflict: unable to remove repository reference "' + t + '" (must force) - container is using its referenced image ' + shortId(im.id));
          return;
        }
        E.images.splice(E.images.indexOf(im), 1);
        lines.push('Untagged: ' + im.repo + ':' + im.tag + '\nDeleted: sha256:' + im.id);
      });
      return joinRes(lines);
    }

    function cmdExec(args) {
      // docker exec [-it] <container> <command...>
      var rest = args.filter(function (t) { return t[0] !== '-'; });
      var c = findContainer(rest[0]);
      if (!c) return err('Error response from daemon: No such container: ' + (rest[0] || ''));
      if (c.status !== 'running') return err('Error response from daemon: container ' + c.id + ' is not running');
      var sub = rest.slice(1);
      // special: ping <name> across networks (DNS resolution rules)
      if (sub[0] === 'ping') {
        var targetName = sub.find ? sub.find(function (x) { return x[0] !== '-'; }) : sub.filter(function (x) { return x[0] !== '-'; })[0];
        targetName = sub.filter(function (x) { return x[0] !== '-' && x !== 'ping'; })[0];
        return pingBetween(c, targetName);
      }
      if (sub[0] === 'env' || (sub[0] === 'printenv')) {
        var envLines = ['PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'HOSTNAME=' + shortId(c.id)];
        return ok(envLines.join('\n'));
      }
      if (sub[0] === 'ls') return ok('bin   dev   etc   home  lib   proc  root  sys   tmp   usr   var');
      if (sub[0] === 'cat' && sub[1]) return ok('[simulated contents of ' + sub[1] + ']');
      if (!sub.length || sub[0] === 'sh' || sub[0] === 'bash' || sub[0] === '/bin/sh' || sub[0] === '/bin/bash')
        return ok('root@' + shortId(c.id) + ':/# (interactive shell \u2014 try: docker exec ' + c.name + ' ping <other>, docker exec ' + c.name + ' env, docker exec ' + c.name + ' ls)');
      return ok('[ran "' + sub.join(' ') + '" inside ' + c.name + ']');
    }

    function pingBetween(from, targetName) {
      if (!targetName) return err('ping: usage error: Destination address required');
      var target = findContainer(targetName);
      // default bridge cannot resolve names; user-defined networks have embedded DNS
      var shared = from.networks.filter(function (n) { return target && target.networks.indexOf(n) !== -1; });
      var onlyDefaultBridge = shared.length === 1 && shared[0] === 'bridge';
      if (!target || !shared.length) {
        return err('ping: ' + targetName + ': Name or service not known');
      }
      if (onlyDefaultBridge) {
        return err("ping: bad address '" + targetName + "'\n(the DEFAULT bridge network has no DNS \u2014 containers there are reachable only by IP, not by name. Put both on a user-defined network to ping by name.)");
      }
      return ok('PING ' + targetName + ' (172.18.0.3): 56 data bytes\n64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.070 ms\n64 bytes from 172.18.0.3: seq=1 ttl=64 time=0.062 ms\n\n--- ' + targetName + ' ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss');
    }

    function cmdLogs(args) {
      var follow = args.indexOf('-f') !== -1 || args.indexOf('--follow') !== -1;
      var rest = args.filter(function (t) { return t[0] !== '-'; });
      var c = findContainer(rest[0]);
      if (!c) return err('Error response from daemon: No such container: ' + (rest[0] || ''));
      var base = "2024-05-01T10:00:01Z Server starting...\n2024-05-01T10:00:02Z Listening on port 80\n2024-05-01T10:00:02Z Ready to accept connections";
      if (follow) return ok(base + "\n2024-05-01T10:00:12Z GET / 200\n2024-05-01T10:00:15Z GET /health 200\n^C (following \u2014 press Ctrl+C to stop in a real terminal)");
      return ok(base);
    }

    function cmdInspect(args) {
      var rest = args.filter(function (t) { return t[0] !== '-'; });
      var c = findContainer(rest[0]); var im = c ? null : findImage(rest[0]); var n = (c || im) ? null : findNetwork(rest[0]); var v = (c || im || n) ? null : findVolume(rest[0]);
      if (c) {
        return ok('[\n  {\n    "Id": "' + c.id + '",\n    "Name": "/' + c.name + '",\n    "State": { "Status": "' + c.status + '", "Running": ' + (c.status === 'running') + ', "ExitCode": ' + c.exitCode + ' },\n    "Config": { "Image": "' + c.image + '", "Cmd": ["' + (c.cmd || '') + '"] },\n    "HostConfig": { "RestartPolicy": { "Name": "' + c.restart + '" } },\n    "NetworkSettings": { "Networks": { ' + c.networks.map(function (x) { return '"' + x + '": {"IPAddress": "172.18.0.2"}'; }).join(', ') + ' } },\n    "Mounts": [' + c.volumes.map(function (x) { return '{"Source": "' + x.split(':')[0] + '"}'; }).join(', ') + ']\n  }\n]');
      }
      if (im) return ok('[\n  {\n    "Id": "sha256:' + im.id + '",\n    "RepoTags": ["' + im.repo + ':' + im.tag + '"],\n    "Size": "' + im.size + '",\n    "Architecture": "amd64",\n    "Os": "linux"\n  }\n]');
      if (n) return ok('[\n  {\n    "Name": "' + n.name + '",\n    "Id": "' + n.id + '",\n    "Driver": "' + n.driver + '",\n    "Scope": "' + n.scope + '",\n    "Containers": { ' + E.containers.filter(function (c2) { return c2.networks.indexOf(n.name) !== -1; }).map(function (c2) { return '"' + c2.id + '": {"Name": "' + c2.name + '"}'; }).join(', ') + ' }\n  }\n]');
      if (v) return ok('[\n  {\n    "Name": "' + v.name + '",\n    "Driver": "' + v.driver + '",\n    "Mountpoint": "' + v.mountpoint + '"\n  }\n]');
      return err('Error: No such object: ' + (rest[0] || ''));
    }

    function cmdNetwork(args) {
      var action = args[0];
      var rest = args.slice(1).filter(function (t) { return t[0] !== '-'; });
      if (action === 'ls') {
        var head = pad('NETWORK ID', 15) + pad('NAME', 16) + pad('DRIVER', 10) + 'SCOPE';
        return ok(head + '\n' + E.networks.map(function (n) { return pad(shortId(n.id), 15) + pad(n.name, 16) + pad(n.driver, 10) + n.scope; }).join('\n'));
      }
      if (action === 'create') {
        var name = rest[0];
        if (!name) return err('"docker network create" requires exactly 1 argument.');
        if (findNetwork(name)) return err('Error response from daemon: network with name ' + name + ' already exists');
        var di = args.indexOf('-d'); if (di === -1) di = args.indexOf('--driver');
        var driver = di !== -1 ? args[di + 1] : 'bridge';
        var net = { id: genId(), name: name, driver: driver, scope: 'local', builtin: false };
        E.networks.push(net);
        return ok(net.id);
      }
      if (action === 'rm' || action === 'remove') {
        var lines = [];
        rest.forEach(function (t) {
          var n = findNetwork(t);
          if (!n) { lines.push('Error response from daemon: network ' + t + ' not found'); return; }
          if (n.builtin) { lines.push('Error response from daemon: ' + n.name + ' is a pre-defined network and cannot be removed'); return; }
          var attached = E.containers.some(function (c) { return c.networks.indexOf(n.name) !== -1 && c.status === 'running'; });
          if (attached) { lines.push('Error response from daemon: error while removing network: network ' + n.name + ' has active endpoints'); return; }
          E.networks.splice(E.networks.indexOf(n), 1);
          lines.push(t);
        });
        return joinRes(lines);
      }
      if (action === 'inspect') return cmdInspect(rest);
      if (action === 'connect' || action === 'disconnect') {
        var net2 = findNetwork(rest[0]); var c = findContainer(rest[1]);
        if (!net2) return err('Error response from daemon: network ' + rest[0] + ' not found');
        if (!c) return err('Error response from daemon: No such container: ' + rest[1]);
        if (action === 'connect') { if (c.networks.indexOf(net2.name) === -1) c.networks.push(net2.name); }
        else { var ix = c.networks.indexOf(net2.name); if (ix !== -1) c.networks.splice(ix, 1); }
        return ok('');
      }
      if (action === 'prune') {
        var removed = E.networks.filter(function (n) { return !n.builtin && !E.containers.some(function (c) { return c.networks.indexOf(n.name) !== -1; }); });
        removed.forEach(function (n) { E.networks.splice(E.networks.indexOf(n), 1); });
        return ok('Deleted Networks:\n' + removed.map(function (n) { return n.name; }).join('\n'));
      }
      return err("docker network: '" + (action || '') + "' is not a docker network command.\nUse: ls, create, inspect, connect, disconnect, rm, prune");
    }

    function cmdVolume(args) {
      var action = args[0];
      var rest = args.slice(1).filter(function (t) { return t[0] !== '-'; });
      if (action === 'ls') {
        return ok(pad('DRIVER', 10) + 'VOLUME NAME\n' + E.volumes.map(function (v) { return pad(v.driver, 10) + v.name; }).join('\n'));
      }
      if (action === 'create') {
        var name = rest[0] || ('vol_' + genId().slice(0, 10));
        if (findVolume(name)) return ok(name);
        E.volumes.push({ name: name, driver: 'local', mountpoint: '/var/lib/docker/volumes/' + name + '/_data' });
        return ok(name);
      }
      if (action === 'rm') {
        var lines = [];
        rest.forEach(function (t) {
          var v = findVolume(t);
          if (!v) { lines.push('Error response from daemon: no such volume: ' + t); return; }
          var inUse = E.containers.some(function (c) { return c.volumes.some(function (m) { return m.split(':')[0] === v.name; }); });
          if (inUse) { lines.push('Error response from daemon: remove ' + v.name + ': volume is in use'); return; }
          E.volumes.splice(E.volumes.indexOf(v), 1);
          lines.push(t);
        });
        return joinRes(lines);
      }
      if (action === 'inspect') return cmdInspect(rest);
      if (action === 'prune') {
        var removed = E.volumes.filter(function (v) { return !E.containers.some(function (c) { return c.volumes.some(function (m) { return m.split(':')[0] === v.name; }); }); });
        removed.forEach(function (v) { E.volumes.splice(E.volumes.indexOf(v), 1); });
        return ok('Deleted Volumes:\n' + removed.map(function (v) { return v.name; }).join('\n') + '\nTotal reclaimed space: 0B');
      }
      return err("docker volume: '" + (action || '') + "' is not a docker volume command.\nUse: ls, create, inspect, rm, prune");
    }

    function cmdRename(args) {
      var rest = args.filter(function (t) { return t[0] !== '-'; });
      var c = findContainer(rest[0]);
      if (!c) return err('Error response from daemon: No such container: ' + (rest[0] || ''));
      if (!rest[1]) return err('"docker rename" requires exactly 2 arguments.');
      if (E.containers.some(function (x) { return x.name === rest[1]; })) return err('Error response from daemon: Rename failed: container name "/' + rest[1] + '" is already in use');
      c.name = rest[1];
      return ok('');
    }

    function cmdTag(args) {
      var rest = args.filter(function (t) { return t[0] !== '-'; });
      var im = findImage(rest[0]);
      if (!im) return err('Error response from daemon: No such image: ' + (rest[0] || ''));
      if (!rest[1]) return err('"docker tag" requires exactly 2 arguments.');
      var n = normImage(rest[1]), c = n.split(':'), tag = c.pop(), repo = c.join(':');
      E.images.push({ repo: repo, tag: tag, id: im.id, size: im.size, created: im.created });
      return ok('');
    }

    function cmdTop(args) {
      var c = findContainer(args.filter(function (t) { return t[0] !== '-'; })[0]);
      if (!c) return err('Error response from daemon: No such container: ' + (args[0] || ''));
      if (c.status !== 'running') return err('Error response from daemon: Container ' + c.id + ' is not running');
      return ok('UID    PID    PPID   C   STIME   TTY   TIME       CMD\nroot   1234   1200   0   10:00   ?     00:00:01   ' + (c.cmd || '/docker-entrypoint.sh'));
    }

    function cmdPort(args) {
      var c = findContainer(args.filter(function (t) { return t[0] !== '-'; })[0]);
      if (!c) return err('Error response from daemon: No such container: ' + (args[0] || ''));
      if (!c.ports.length) return ok('');
      return ok(c.ports.map(function (p) { var x = p.split(':'); return (x[1] || x[0]) + '/tcp -> 0.0.0.0:' + x[0]; }).join('\n'));
    }

    function cmdStats() {
      var running = E.containers.filter(function (c) { return c.status === 'running'; });
      var head = pad('CONTAINER ID', 15) + pad('NAME', 16) + pad('CPU %', 8) + pad('MEM USAGE / LIMIT', 22) + 'NET I/O';
      if (!running.length) return ok(head + '\n');
      return ok(head + '\n' + running.map(function (c, i) {
        return pad(shortId(c.id), 15) + pad(c.name, 16) + pad(((i + 1) * 1.7).toFixed(2) + '%', 8) + pad((30 + i * 12) + 'MiB / 512MiB', 22) + '1.2kB / 648B';
      }).join('\n'));
    }

    function cmdSystem(args) {
      if (args[0] === 'df') {
        return ok(pad('TYPE', 16) + pad('TOTAL', 8) + pad('ACTIVE', 8) + 'SIZE\n' +
          pad('Images', 16) + pad(String(E.images.length), 8) + pad(String(E.containers.length ? Math.min(E.images.length, E.containers.length) : 0), 8) + (E.images.length * 120) + 'MB\n' +
          pad('Containers', 16) + pad(String(E.containers.length), 8) + pad(String(E.containers.filter(function (c) { return c.status === 'running'; }).length), 8) + '12MB\n' +
          pad('Local Volumes', 16) + pad(String(E.volumes.length), 8) + pad('0', 8) + '0B\n' +
          pad('Build Cache', 16) + pad('0', 8) + pad('0', 8) + '0B');
      }
      if (args[0] === 'prune') {
        var stopped = E.containers.filter(function (c) { return c.status === 'exited'; });
        stopped.forEach(function (c) { E.containers.splice(E.containers.indexOf(c), 1); });
        var danglingNets = E.networks.filter(function (n) { return !n.builtin && !E.containers.some(function (c) { return c.networks.indexOf(n.name) !== -1; }); });
        danglingNets.forEach(function (n) { E.networks.splice(E.networks.indexOf(n), 1); });
        var allFlag = args.indexOf('-a') !== -1 || args.indexOf('--all') !== -1;
        var removedImgs = [];
        if (allFlag) {
          removedImgs = E.images.filter(function (im) { return !E.containers.some(function (c) { return c.image === im.repo + ':' + im.tag; }); });
          removedImgs.forEach(function (im) { E.images.splice(E.images.indexOf(im), 1); });
        }
        return ok('Deleted Containers:\n' + stopped.map(function (c) { return c.id; }).join('\n') +
          '\nDeleted Networks:\n' + danglingNets.map(function (n) { return n.name; }).join('\n') +
          (allFlag ? '\nDeleted Images:\n' + removedImgs.map(function (im) { return im.repo + ':' + im.tag; }).join('\n') : '') +
          '\nTotal reclaimed space: ' + (stopped.length * 12 + removedImgs.length * 120) + 'MB');
      }
      return err("docker system: use 'df' or 'prune'");
    }

    // ---- docker compose, driven by a parsed compose.yaml (very small YAML reader)
    function parseCompose(text) {
      // minimal: services: \n  name:\n    image: x \n    ports:\n      - "a:b"
      var services = [], cur = null, inServices = false, inPorts = false;
      (text || '').split(/\r?\n/).forEach(function (raw) {
        if (!raw.trim() || raw.trim()[0] === '#') return;
        var indent = raw.match(/^\s*/)[0].length;
        var line = raw.trim();
        if (line === 'services:') { inServices = true; return; }
        if (indent === 0) { inServices = (line === 'services:'); return; }
        if (!inServices) return;
        if (indent === 2 && line.slice(-1) === ':') { cur = { name: line.slice(0, -1), image: null, build: false, ports: [] }; services.push(cur); inPorts = false; return; }
        if (!cur) return;
        if (/^image:/.test(line)) { cur.image = line.replace(/^image:\s*/, '').replace(/["']/g, ''); inPorts = false; }
        else if (/^build:/.test(line)) { cur.build = true; inPorts = false; }
        else if (/^ports:/.test(line)) { inPorts = true; }
        else if (inPorts && line[0] === '-') { cur.ports.push(line.replace(/^-\s*/, '').replace(/["']/g, '')); }
        else { inPorts = false; }
      });
      return services;
    }

    function cmdCompose(args, composeText) {
      var action = args[0];
      var svcs = parseCompose(composeText);
      var project = 'app';
      if (!svcs.length && (action === 'up' || action === 'ps' || action === 'logs' || action === 'down')) {
        return err('no configuration file provided: not found\n(edit the compose.yaml pane above \u2014 it must define a services: block)');
      }
      if (action === 'up') {
        var lines = ['[+] Running ' + (svcs.length + 1) + '/' + (svcs.length + 1), ' \u2714 Network ' + project + '_default  Created'];
        svcs.forEach(function (s) {
          var im = s.image || (project + '-' + s.name);
          addImage(im);
          var cname = project + '-' + s.name + '-1';
          if (!E.containers.some(function (c) { return c.name === cname; })) {
            E.containers.push({ id: genId(), name: cname, image: normImage(im), status: 'running', ports: s.ports.slice(), networks: [project + '_default'], volumes: [], cmd: '', created: 'Just now', exitCode: 0, restart: 'no' });
          }
          lines.push(' \u2714 Container ' + cname + '  Started');
        });
        if (!findNetwork(project + '_default')) E.networks.push({ id: genId(), name: project + '_default', driver: 'bridge', scope: 'local', builtin: false });
        return joinRes(lines);
      }
      if (action === 'down') {
        var removed = E.containers.filter(function (c) { return c.name.indexOf(project + '-') === 0; });
        removed.forEach(function (c) { E.containers.splice(E.containers.indexOf(c), 1); });
        var net = findNetwork(project + '_default'); if (net) E.networks.splice(E.networks.indexOf(net), 1);
        return ok('[+] Running ' + (removed.length + 1) + '/' + (removed.length + 1) + '\n' + removed.map(function (c) { return ' \u2714 Container ' + c.name + '  Removed'; }).join('\n') + '\n \u2714 Network ' + project + '_default  Removed');
      }
      if (action === 'ps') {
        var head = pad('NAME', 20) + pad('IMAGE', 16) + pad('STATUS', 16) + 'PORTS';
        var rows = E.containers.filter(function (c) { return c.name.indexOf(project + '-') === 0; });
        return ok(head + '\n' + rows.map(function (c) { return pad(c.name, 20) + pad(c.image.length > 15 ? c.image.slice(0, 15) : c.image, 16) + pad('Up 2 minutes', 16) + c.ports.join(','); }).join('\n'));
      }
      if (action === 'logs') {
        var rows2 = E.containers.filter(function (c) { return c.name.indexOf(project + '-') === 0; });
        return ok(rows2.map(function (c) { return c.name + '  | ready on ' + (c.ports[0] || 'default port'); }).join('\n'));
      }
      if (action === 'build') { svcs.forEach(function (s) { if (s.build || s.image) addImage(s.image || project + '-' + s.name); }); return ok(svcs.map(function (s) { return '[+] Building ' + s.name + ' ... done'; }).join('\n')); }
      return err("docker compose: use 'up', 'down', 'ps', 'logs', or 'build'");
    }

    // ---------------------------------------------------------------- help
    var HELP = {
      run: 'docker run [OPTIONS] IMAGE [COMMAND]\nCreate and run a new container from an image.\n  -d            run detached (background)\n  -p host:ctr   publish a port\n  --name NAME   assign a name\n  -e K=V        set an env var\n  -v src:dst    mount a volume\n  --network N   attach to a network\n  --restart P   restart policy (no|on-failure|always|unless-stopped)',
      ps: 'docker ps [OPTIONS]\nList containers.\n  -a   show all (default shows just running)\n  -q   only show IDs',
      images: 'docker images [OPTIONS]\nList images.\n  -q                 only show IDs\n  --filter reference=PATTERN   filter by name',
      network: 'docker network COMMAND\n  ls | create | inspect | connect | disconnect | rm | prune',
      volume: 'docker volume COMMAND\n  ls | create | inspect | rm | prune',
      compose: 'docker compose COMMAND\n  up | down | ps | logs | build   (reads the compose.yaml pane)',
      exec: 'docker exec [-it] CONTAINER COMMAND\nRun a command in a RUNNING container. Try: ping <other>, env, ls'
    };

    function helpGeneral() {
      return "Usage: docker [OPTIONS] COMMAND\n\nCommon Commands:\n  run        Create and run a new container from an image\n  ps         List containers\n  images     List images\n  build      Build an image from a Dockerfile\n  pull       Download an image from a registry\n  exec       Execute a command in a running container\n  logs       Fetch the logs of a container\n  inspect    Return low-level information on Docker objects\n\nManagement Commands:\n  network    Manage networks\n  volume     Manage volumes\n  system     Manage Docker (df, prune)\n  compose    Define and run multi-container applications\n\nLifecycle:\n  start stop restart pause unpause kill rm rmi rename tag\n\nInfo:\n  stats top port --version\n\nType 'help <command>' for details, or 'clear' to clear the screen.";
    }

    // ---------------------------------------------------------------- result shims
    function ok(s) { return { out: s, error: false }; }
    function err(s) { return { out: s, error: true }; }
    // For multi-target commands: mark the whole result as an error if ANY line failed.
    function joinRes(lines) {
      var s = lines.join('\n');
      return lines.some(function (l) { return /^Error|^ping: /.test(l); }) ? err(s) : ok(s);
    }

    // ---------------------------------------------------------------- dispatch
    function run(cmdRaw, composeText) {
      var cmd = (cmdRaw || '').trim();
      if (cmd === '') return ok('');
      if (cmd === 'clear' || cmd === 'cls') return { out: '', clear: true, error: false };
      var parts = tokenize(cmd);

      if (parts[0] === 'help' || cmd === '--help' || cmd === '-h') {
        var topic = parts[1];
        if (topic && HELP[topic]) return ok(HELP[topic]);
        if (topic) return err("No help entry for '" + topic + "'. Try: " + Object.keys(HELP).join(', '));
        return ok(helpGeneral());
      }
      if (parts[0] !== 'docker') {
        return err(parts[0] + ": command not found. This playground only runs 'docker ...' commands. Type 'help'.");
      }
      var sub = parts[1];
      var args = parts.slice(2);

      if (sub === '--help' || sub === '-h' || sub === undefined) return ok(helpGeneral());
      if (sub === '--version' || sub === 'version') return ok('Docker version 27.3.1, build simulated\nAPI version: 1.47');
      if (sub === 'run' || sub === 'create') return cmdRun(args);
      if (sub === 'ps') return cmdPs(args);
      if (sub === 'images') return cmdImages(args);
      if (sub === 'pull') return cmdPull(args);
      if (sub === 'build') return cmdBuild(args);
      if (sub === 'start' || sub === 'stop' || sub === 'restart' || sub === 'pause' || sub === 'unpause' || sub === 'kill') return cmdStartStop(sub, args);
      if (sub === 'rm') return cmdRm(args);
      if (sub === 'rmi') return cmdRmi(args);
      if (sub === 'exec') return cmdExec(args);
      if (sub === 'logs') return cmdLogs(args);
      if (sub === 'inspect') return cmdInspect(args);
      if (sub === 'network') return cmdNetwork(args);
      if (sub === 'volume') return cmdVolume(args);
      if (sub === 'rename') return cmdRename(args);
      if (sub === 'tag') return cmdTag(args);
      if (sub === 'top') return cmdTop(args);
      if (sub === 'port') return cmdPort(args);
      if (sub === 'stats') return cmdStats(args);
      if (sub === 'system') return cmdSystem(args);
      if (sub === 'compose') return cmdCompose(args, composeText);
      if (sub === 'info') return ok('Containers: ' + E.containers.length + '\n Running: ' + E.containers.filter(function (c) { return c.status === 'running'; }).length + '\nImages: ' + E.images.length + '\nServer Version: 27.3.1 (simulated)');
      return err("docker: '" + sub + "' is not a docker command.\nSee 'docker --help' or type 'help'.");
    }

    // Replay a list of setup commands silently against the CURRENT state.
    // Returns { ok: bool, errors: [{cmd, out}] } so a caller (DOM or test) can
    // assert the setup for a "Try it" question ran cleanly in a fresh engine.
    function replaySetup(cmds, composeText) {
      var errors = [];
      (cmds || []).forEach(function (c) {
        var res = run(c, composeText || '');
        if (res && res.error) errors.push({ cmd: c, out: res.out });
      });
      return { ok: errors.length === 0, errors: errors };
    }

    // completion candidates for Tab
    function completions() {
      var cmds = ['docker run', 'docker ps', 'docker ps -a', 'docker images', 'docker pull', 'docker build', 'docker start', 'docker stop', 'docker restart', 'docker pause', 'docker unpause', 'docker kill', 'docker rm', 'docker rmi', 'docker exec', 'docker logs', 'docker inspect', 'docker network ls', 'docker network create', 'docker network inspect', 'docker network connect', 'docker network rm', 'docker volume ls', 'docker volume create', 'docker volume inspect', 'docker volume rm', 'docker rename', 'docker tag', 'docker top', 'docker port', 'docker stats', 'docker system df', 'docker system prune', 'docker compose up', 'docker compose down', 'docker compose ps', 'docker compose logs', 'help', 'clear'];
      var names = E.containers.map(function (c) { return c.name; })
        .concat(E.images.map(function (im) { return im.repo + ':' + im.tag; }))
        .concat(E.networks.map(function (n) { return n.name; }))
        .concat(E.volumes.map(function (v) { return v.name; }));
      return { cmds: cmds, names: names };
    }

    return { run: run, state: E, completions: completions, replaySetup: replaySetup, _parseRun: parseRun, _parseCompose: parseCompose };
  }

  // export for node tests AND attach to window for the browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createEngine: createEngine };
  }
  global.DockerSim = { createEngine: createEngine };

  // ---------------------------------------------------------------- DOM layer
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var termBody = document.getElementById('termBody');
    var termInput = document.getElementById('termInput');
    var runBtn = document.getElementById('termRun');
    var composeEl = document.getElementById('composeYaml');
    var panelEl = document.getElementById('statePanel');
    var chalEl = document.getElementById('challengeList');
    if (!termBody || !termInput) return;

    var engine = createEngine({ seed: Date.now() % 100000 });
    var history = [];
    var hpos = -1;

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function printCmd(cmd) {
      var line = document.createElement('div');
      line.className = 'term-line';
      line.innerHTML = '<span class="term-prompt">$</span><span>' + esc(cmd) + '</span>';
      termBody.appendChild(line);
    }
    function printOut(out, isErr) {
      if (out === '' || out == null) return;
      var line = document.createElement('div');
      line.className = 'term-line';
      line.innerHTML = '<span class="term-out" style="' + (isErr ? 'color:#ff8585;' : '') + '">' + esc(out) + '</span>';
      termBody.appendChild(line);
    }

    function execute(cmd) {
      printCmd(cmd);
      var res = engine.run(cmd, composeEl ? composeEl.value : '');
      if (res.clear) { termBody.innerHTML = ''; }
      else printOut(res.out, res.error);
      termBody.scrollTop = termBody.scrollHeight;
      if (cmd.trim()) { history.push(cmd); hpos = history.length; }
      renderPanel();
      checkChallenges();
    }

    // ---- live state panel
    function renderPanel() {
      if (!panelEl) return;
      var s = engine.state;
      function section(title, rows, cols) {
        var h = '<div class="sp-sec"><div class="sp-title">' + title + ' <span class="sp-count">' + rows.length + '</span></div>';
        if (!rows.length) { h += '<div class="sp-empty">none</div></div>'; return h; }
        h += '<table class="sp-table"><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
        h += rows.map(function (r) { return '<tr>' + r.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>'; }).join('');
        h += '</table></div>';
        return h;
      }
      var cont = s.containers.map(function (c) {
        var dot = c.status === 'running' ? 'sp-dot-up' : (c.status === 'paused' ? 'sp-dot-pause' : 'sp-dot-down');
        return ['<span class="sp-dot ' + dot + '"></span>' + esc(c.name), c.image, c.status];
      });
      // containers use raw html in first cell, so build manually
      var html = '';
      html += '<div class="sp-sec"><div class="sp-title">Containers <span class="sp-count">' + s.containers.length + '</span></div>';
      if (!s.containers.length) html += '<div class="sp-empty">none</div>';
      else {
        html += '<table class="sp-table"><tr><th>Name</th><th>Image</th><th>Status</th></tr>';
        html += s.containers.map(function (c) {
          var dot = c.status === 'running' ? 'sp-dot-up' : (c.status === 'paused' ? 'sp-dot-pause' : 'sp-dot-down');
          return '<tr><td><span class="sp-dot ' + dot + '"></span>' + esc(c.name) + '</td><td>' + esc(c.image) + '</td><td>' + esc(c.status) + '</td></tr>';
        }).join('');
        html += '</table></div>';
      }
      html += section('Images', s.images.map(function (im) { return [im.repo + ':' + im.tag, im.size]; }), ['Repository', 'Size']);
      html += section('Networks', s.networks.map(function (n) { return [n.name, n.driver]; }), ['Name', 'Driver']);
      html += section('Volumes', s.volumes.map(function (v) { return [v.name, v.driver]; }), ['Name', 'Driver']);
      panelEl.innerHTML = html;
    }

    // ---- guided challenges
    var challenges = [
      { t: 'Run an nginx container in the background on port 8080', chk: function (s) { return s.containers.some(function (c) { return c.image.indexOf('nginx') === 0 && c.status === 'running' && c.ports.length; }); } },
      { t: 'List all containers including stopped ones (docker ps -a)', chk: function (s, log) { return log.indexOf('docker ps -a') !== -1; } },
      { t: 'Create a user-defined network called mynet', chk: function (s) { return s.networks.some(function (n) { return n.name === 'mynet' && !n.builtin; }); } },
      { t: 'Run two containers on mynet and ping one from the other by name', chk: function (s, log) { return /docker exec \S+ ping/.test(log) && s.networks.some(function (n) { return n.name === 'mynet'; }); }, needPing: true },
      { t: 'Create a named volume and mount it into a container (-v)', chk: function (s) { return s.volumes.length && s.containers.some(function (c) { return c.volumes.length; }); } },
      { t: 'Build an image tagged myapp:1.0 (docker build -t myapp:1.0 .)', chk: function (s) { return s.images.some(function (im) { return im.repo === 'myapp' && im.tag === '1.0'; }); } },
      { t: 'Stop a running container, then remove it', chk: function (s, log) { return /docker stop/.test(log) && /docker rm/.test(log); } },
      { t: 'Inspect a container (docker inspect <name>)', chk: function (s, log) { return /docker inspect/.test(log); } },
      { t: 'Start the sample app with docker compose up', chk: function (s, log) { return /docker compose up/.test(log); } },
      { t: 'Clean up stopped containers with docker system prune', chk: function (s, log) { return /docker system prune/.test(log); } }
    ];
    var fullLog = [];
    function renderChallenges() {
      if (!chalEl) return;
      chalEl.innerHTML = challenges.map(function (c, i) {
        return '<li class="chal" data-i="' + i + '"><span class="chal-box">\u25A1</span>' + esc(c.t) + '</li>';
      }).join('');
    }
    function checkChallenges() {
      if (!chalEl) return;
      var s = engine.state, log = fullLog.join('\n');
      challenges.forEach(function (c, i) {
        var li = chalEl.querySelector('[data-i="' + i + '"]');
        if (!li) return;
        if (c.chk(s, log)) { li.classList.add('done'); li.querySelector('.chal-box').textContent = '\u2714'; }
      });
    }

    // wire input
    function submit() {
      var v = termInput.value;
      if (v.trim() === '') return;
      fullLog.push(v.trim());
      execute(v);
      termInput.value = '';
    }
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { submit(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hpos > 0) { hpos--; termInput.value = history[hpos] || ''; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hpos < history.length - 1) { hpos++; termInput.value = history[hpos] || ''; } else { hpos = history.length; termInput.value = ''; } }
      else if (e.key === 'Tab') {
        e.preventDefault();
        var val = termInput.value;
        var comp = engine.completions();
        var pool = comp.cmds.concat(comp.names);
        var matches = pool.filter(function (x) { return x.indexOf(val) === 0 && x !== val; });
        if (matches.length === 1) termInput.value = matches[0];
        else if (matches.length > 1) { printCmd(val); printOut(matches.join('    ')); }
      }
    });
    if (runBtn) runBtn.addEventListener('click', submit);

    // ---- "Try it" hand-off from the interview page (#try=<question-id>)
    // interview-data.js is loaded before this script, so the question bank is here.
    function findTryQuestion(id) {
      var data = (typeof window !== 'undefined') && window.STUDYHUB_INTERVIEW;
      if (!data || !Array.isArray(data.questions)) return null;
      return data.questions.filter(function (q) { return q.id === id && q.tryIt; })[0] || null;
    }
    function dismissTryCard() {
      var old = document.getElementById('tryCard');
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }
    function showTryCard(q) {
      dismissTryCard();
      var t = q.tryIt || {};
      // replay the setup silently into a FRESH engine so state is clean per visit
      engine = createEngine({ seed: Date.now() % 100000 });
      termBody.innerHTML = '';
      history = []; hpos = -1; fullLog = [];
      var rep = engine.replaySetup(t.setup || [], composeEl ? composeEl.value : '');
      var card = document.createElement('div');
      card.className = 'card';
      card.id = 'tryCard';
      card.style.borderColor = '#2496ED';
      var setupNote = (t.setup && t.setup.length)
        ? '<p class="try-setup">Prepared for you: <code class="inline">' + esc(t.setup.join('  ·  ')) + '</code></p>'
        : '';
      var errNote = rep.ok ? '' : '<p class="try-setup" style="color:#ff8585;">(some setup steps reported: ' + esc(rep.errors.map(function (e) { return e.cmd; }).join(', ')) + ')</p>';
      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">' +
        '<h3 style="margin:0;"><span class="num">\u25B6</span> Try it: interview question</h3>' +
        '<button id="tryClose" type="button" class="toggle-btn" style="padding:4px 12px;">Dismiss</button></div>' +
        '<p style="margin:10px 0 6px;">' + esc(q.q) + '</p>' +
        setupNote + errNote +
        '<p style="margin:6px 0 0;">Suggested first command is prefilled below \u2014 press <strong>Run</strong>. ' +
        '<a href="interview.html#q-' + encodeURIComponent(q.id) + '">\u2190 back to the full answer</a></p>';
      // insert the card at the very top of <main>, above the first card
      var main = document.querySelector('.main');
      var firstCard = main ? main.querySelector('.card') : null;
      // the first card may be nested (e.g. inside the .pg-wrap grid), so insert above
      // the top-level block of <main> that contains it, keeping the card full-width
      if (main && firstCard) {
        var anchor = firstCard;
        while (anchor.parentNode && anchor.parentNode !== main) anchor = anchor.parentNode;
        main.insertBefore(card, anchor);
      }
      else if (main) main.insertBefore(card, main.firstChild);
      var closeBtn = document.getElementById('tryClose');
      if (closeBtn) closeBtn.addEventListener('click', function () { dismissTryCard(); if (location.hash.indexOf('#try=') === 0) { history_replace(); } });
      // prefill the starter command and focus the input
      if (t.starter) { termInput.value = t.starter; termInput.focus(); }
      renderPanel();
      renderChallenges();
      checkChallenges();
    }
    function history_replace() {
      // clear the #try hash without adding a new entry, if supported
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', location.pathname + location.search);
      }
    }
    function handleHash() {
      var h = location.hash || '';
      var m = h.match(/^#try=(.+)$/);
      if (!m) { return; }
      var id = decodeURIComponent(m[1]);
      var q = findTryQuestion(id);
      if (q) showTryCard(q);
    }
    window.addEventListener('hashchange', handleHash);
    handleHash();

    renderPanel();
    renderChallenges();
  });

})(typeof window !== 'undefined' ? window : this);
