/* Kubernetes Playground — an in-browser kubectl simulator over a real-ish cluster model.
 *
 * The core is a pure, DOM-free createEngine() returning { run(cmd), reset(), snapshot(), ... }.
 * It models: nodes, namespaces (default, kube-system), Deployments -> ReplicaSets -> Pods
 * (hash-suffixed names), Services with endpoints computed from label selectors, ConfigMaps,
 * Secrets, Endpoints. It simulates ImagePullBackOff (image contains 'notexist' or ':badtag'),
 * CrashLoopBackOff (command 'exit 1'), and Pending + FailedScheduling (cpu request bigger than
 * any node). Exported for Node tests via module.exports at the bottom; attached to window for UI.
 */
(function () {
  'use strict';

  function createEngine() {
    var state;

    function freshState() {
      var s = {
        ns: ['default', 'kube-system'],
        currentNs: 'default',
        clock: 0,          // simulated seconds, advanced once per command
        nodes: [
          { name: 'node-1', cpu: 4000, labels: { 'kubernetes.io/hostname': 'node-1', 'disktype': 'ssd' } },
          { name: 'node-2', cpu: 4000, labels: { 'kubernetes.io/hostname': 'node-2' } }
        ],
        deployments: {},   // "ns/name" -> deployment
        replicasets: {},   // "ns/name" -> rs
        pods: {},          // "ns/name" -> pod
        services: {},      // "ns/name" -> service
        configmaps: {},    // "ns/name" -> cm
        secrets: {},       // "ns/name" -> secret
        events: [],        // { ns, kind, name, reason, message, time }
        hashCounter: 0,
        rsRevisionByDeploy: {} // deployKey -> last revision int
      };
      return s;
    }
    function reset() { state = freshState(); seedSystem(); }

    // Seed a realistic control plane so `get pods -A` / `-n kube-system` look like a real cluster.
    function seedSystem() {
      function sysPod(name, node) {
        var p = { ns: 'kube-system', name: name, spec: { image: 'registry.k8s.io/system', container: name, cpuRequest: 0, command: null },
          labels: { 'k8s-app': name.split('-')[0], tier: 'control-plane' }, owner: null, restarts: 0, node: node,
          phase: 'Running', ready: true, statusReason: 'Running', createdTick: 0, lastRestartTick: 0, system: true };
        state.pods[key('kube-system', name)] = p;
      }
      sysPod('coredns-5d78c9869d-' + 'abcde', 'node-1');
      sysPod('coredns-5d78c9869d-' + 'fghjk', 'node-2');
      state.nodes.forEach(function (nd) {
        sysPod('etcd-' + nd.name, nd.name);
        sysPod('kube-apiserver-' + nd.name, nd.name);
        sysPod('kube-controller-manager-' + nd.name, nd.name);
        sysPod('kube-scheduler-' + nd.name, nd.name);
        sysPod('kube-proxy-' + nd.name.slice(-1) + 'x2k', nd.name);
      });
      // the always-present default kubernetes API Service
      state.services[key('default', 'kubernetes')] = { ns: 'default', name: 'kubernetes', type: 'ClusterIP',
        selector: {}, port: 443, targetPort: 6443, labels: { component: 'apiserver' }, clusterIP: '10.96.0.1', system: true, createdTick: 0 };
    }
    reset();

    // ---------- helpers ----------
    function out(s) { return { ok: true, output: (s == null ? '' : s) }; }
    function err(s) { return { ok: false, output: s }; }
    function key(ns, name) { return ns + '/' + name; }
    function keys(o) { var a = []; for (var k in o) if (o.hasOwnProperty(k)) a.push(k); return a; }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    var SAFE = 'bcdfghjklmnpqrstvwxz2456789'; // Kubernetes' safe hash alphabet
    function fromSafe(n, len) {
      var s = '';
      n = (n >>> 0) || 1;
      for (var i = 0; i < len; i++) {
        // xorshift mix each step so successive chars don't collapse to one value
        n ^= n << 13; n >>>= 0; n ^= n >> 17; n ^= n << 5; n >>>= 0;
        s += SAFE[n % SAFE.length];
      }
      return s;
    }
    function rand5() {
      // 5-char pod suffix from the safe alphabet
      state.hashCounter++;
      return fromSafe((state.hashCounter * 2654435761) >>> 0, 5);
    }
    function rsHash() {
      // ~9-10 char pod-template-hash from the safe alphabet
      state.hashCounter++;
      var len = 9 + ((state.hashCounter * 2246822519) >>> 0) % 2; // 9 or 10
      return fromSafe((state.hashCounter * 40503) >>> 0, len);
    }
    function addEvent(ns, kind, name, reason, message) {
      state.events.push({ ns: ns, kind: kind, name: name, reason: reason, message: message, time: ++state.hashCounter, tick: state.clock });
      if (state.events.length > 200) state.events.shift();
    }

    // ---------- simulated clock ----------
    function fmtAge(createdTick) {
      var age = state.clock - (createdTick || 0);
      if (age < 0) age = 0;
      if (age < 60) return age + 's';
      if (age < 3600) return Math.floor(age / 60) + 'm';
      if (age < 86400) return Math.floor(age / 3600) + 'h';
      return Math.floor(age / 86400) + 'd';
    }
    // exponential back-off caps the gap at 300s (10,20,40,80,160,300,300,...)
    function backoffGap(n) { return Math.min(300, 10 * Math.pow(2, n)); }
    // Advance the clock once per command and progress crashing pods' restart counts.
    function advanceClock() {
      state.clock += 7; // each command advances the simulated clock ~7s
      keys(state.pods).forEach(function (k) {
        var p = state.pods[k];
        if (p.statusReason === 'CrashLoopBackOff') {
          var gap = backoffGap(p.restarts || 0);
          if (state.clock - (p.lastRestartTick || 0) >= gap) {
            p.restarts = (p.restarts || 0) + 1;
            p.lastRestartTick = state.clock;
            addEvent(p.ns, 'Pod', p.name, 'BackOff', 'Back-off restarting failed container app in pod ' + p.name);
          }
        }
      });
    }

    function selectorMatches(sel, labels) {
      if (!sel) return false;
      for (var k in sel) if (sel.hasOwnProperty(k)) { if (labels[k] !== sel[k]) return false; }
      return keys(sel).length > 0;
    }

    // ---------- pod lifecycle simulation ----------
    function cpuReqOf(spec) { return spec && spec.cpuRequest ? spec.cpuRequest : 0; }
    function imageBad(image) { return /notexist/i.test(image) || /:badtag$/i.test(image); }
    function cmdCrashes(cmd) { return !!cmd && /(^|\s)exit\s+1(\s|$)/.test(cmd); }

    // decide a pod's status given its spec and the cluster
    function evaluatePod(pod) {
      // scheduling: need a node whose cpu >= request
      var fits = state.nodes.some(function (nd) { return cpuReqOf(pod.spec) <= nd.cpu; });
      if (!fits) {
        pod.phase = 'Pending';
        pod.statusReason = 'Pending';
        pod.ready = false;
        pod.node = null;
        if (!pod._schedEvented) { addEvent(pod.ns, 'Pod', pod.name, 'FailedScheduling', '0/' + state.nodes.length + ' nodes are available: insufficient cpu.'); pod._schedEvented = true; }
        return;
      }
      if (!pod.node) {
        // bind to first fitting node
        var nd = state.nodes.filter(function (n) { return cpuReqOf(pod.spec) <= n.cpu; })[0];
        pod.node = nd.name;
        addEvent(pod.ns, 'Pod', pod.name, 'Scheduled', 'Successfully assigned ' + pod.ns + '/' + pod.name + ' to ' + nd.name);
      }
      if (imageBad(pod.spec.image)) {
        pod.phase = 'Pending';
        pod.statusReason = 'ImagePullBackOff';
        pod.ready = false;
        if (!pod._pullEvented) { addEvent(pod.ns, 'Pod', pod.name, 'Failed', 'Failed to pull image "' + pod.spec.image + '": not found'); pod._pullEvented = true; }
        return;
      }
      if (cmdCrashes(pod.spec.command)) {
        pod.phase = 'Running';
        pod.statusReason = 'CrashLoopBackOff';
        pod.ready = false;
        if (!pod._crashEvented) {
          pod.restarts = (pod.restarts || 0) + 1;
          pod.lastRestartTick = state.clock;
          addEvent(pod.ns, 'Pod', pod.name, 'Pulled', 'Successfully pulled image "' + pod.spec.image + '"');
          addEvent(pod.ns, 'Pod', pod.name, 'Started', 'Started container app');
          addEvent(pod.ns, 'Pod', pod.name, 'BackOff', 'Back-off restarting failed container app in pod ' + pod.name);
          pod._crashEvented = true;
        }
        return;
      }
      pod.phase = 'Running';
      pod.statusReason = 'Running';
      pod.ready = true;
      pod.restarts = pod.restarts || 0;
    }

    function makePod(ns, name, spec, labels, owner) {
      var pod = { ns: ns, name: name, spec: clone(spec), labels: clone(labels || {}), owner: owner || null, restarts: 0, node: null, phase: 'Pending', ready: false, statusReason: 'Pending', createdTick: state.clock, lastRestartTick: state.clock };
      evaluatePod(pod);
      state.pods[key(ns, name)] = pod;
      return pod;
    }

    // recompute all pods (e.g. after node/image changes)
    function reevaluateAll() { keys(state.pods).forEach(function (k) { evaluatePod(state.pods[k]); }); }

    // ---------- ReplicaSet / Deployment reconciliation ----------
    function podsOfRs(rsKey) {
      return keys(state.pods).map(function (k) { return state.pods[k]; }).filter(function (p) { return p.owner === rsKey; });
    }
    function reconcileRs(rs) {
      var existing = podsOfRs(key(rs.ns, rs.name));
      // scale up
      while (existing.length < rs.replicas) {
        var pname = rs.name + '-' + rand5();
        var lbls = clone(rs.template.labels);
        lbls['pod-template-hash'] = rs.hash;
        makePod(rs.ns, pname, rs.template.spec, lbls, key(rs.ns, rs.name));
        existing = podsOfRs(key(rs.ns, rs.name));
      }
      // scale down (remove highest/newest first)
      while (existing.length > rs.replicas) {
        var victim = existing.pop();
        delete state.pods[key(victim.ns, victim.name)];
      }
    }
    function deployKey(d) { return key(d.ns, d.name); }

    function reconcileDeployment(d) {
      // ensure a current RS for the current template
      var tmplSig = JSON.stringify(d.template);
      if (d._lastSig !== tmplSig) {
        // find an EXISTING RS of this deployment with the same template (rollback/redeploy case)
        var reused = null;
        keys(state.replicasets).forEach(function (k) {
          var r = state.replicasets[k];
          if (r.owner === deployKey(d) && JSON.stringify(r.template) === tmplSig) reused = r;
        });
        d.revision = (d.revision || 0) + 1;
        var rsName, rs;
        if (reused) {
          // reuse the prior ReplicaSet (same pod-template-hash); it just scales back up
          rs = reused; rsName = reused.name;
          rs.replicas = d.replicas; rs.revision = d.revision;
        } else {
          var h = rsHash();
          rsName = d.name + '-' + h;
          rs = { ns: d.ns, name: rsName, hash: h, replicas: d.replicas, template: clone(d.template), owner: deployKey(d), revision: d.revision, createdSig: tmplSig, createdTick: state.clock };
          state.replicasets[key(d.ns, rsName)] = rs;
        }
        // scale down every OTHER RS of this deployment
        keys(state.replicasets).forEach(function (k) {
          var r = state.replicasets[k];
          if (r.owner === deployKey(d) && r.name !== rsName) { r.replicas = 0; reconcileRs(r); }
        });
        d.currentRs = rsName;
        d._lastSig = tmplSig;
        d.history = d.history || [];
        // reusing an RS moves its revision to the newest number; drop its old history entry
        d.history = d.history.filter(function (hh) { return hh.rs !== rsName; });
        d.history.push({ revision: d.revision, rs: rsName, template: clone(d.template), changeCause: d.pendingChangeCause || '<none>' });
        d.pendingChangeCause = null;
        addEvent(d.ns, 'Deployment', d.name, 'ScalingReplicaSet', 'Scaled up replica set ' + rsName + ' to ' + d.replicas);
      } else {
        // same template -> just sync replica count on current RS
        var cur = state.replicasets[key(d.ns, d.currentRs)];
        if (cur) cur.replicas = d.replicas;
      }
      // reconcile all RSs of this deployment
      keys(state.replicasets).forEach(function (k) {
        var r = state.replicasets[k];
        if (r.owner === deployKey(d)) reconcileRs(r);
      });
    }

    // ---------- parsing ----------
    function parseFlags(tokens) {
      // returns { positional:[], flags:{name:value|true} }
      var pos = [], flags = {};
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.indexOf('--') === 0) {
          var eq = t.indexOf('=');
          if (eq !== -1) { flags[t.slice(2, eq)] = t.slice(eq + 1); }
          else {
            var nm = t.slice(2);
            // boolean-ish flags that take no value
            if (['all-namespaces', 'show-labels', 'watch'].indexOf(nm) !== -1) flags[nm] = true;
            else if (i + 1 < tokens.length && tokens[i + 1].indexOf('-') !== 0) { flags[nm] = tokens[++i]; }
            else flags[nm] = true;
          }
        } else if (t[0] === '-' && t.length > 1) {
          var sh = t.slice(1);
          if (sh === 'A') flags['all-namespaces'] = true;
          else if (sh === 'o' || sh === 'n' || sh === 'l' || sh === 'f') { if (i + 1 < tokens.length) flags[sh] = tokens[++i]; }
          else flags[sh] = true;
        } else pos.push(t);
      }
      return { pos: pos, flags: flags };
    }
    function parseKV(str) {
      // "app=web,tier=front" -> {app:'web',tier:'front'}
      var o = {};
      String(str || '').split(',').forEach(function (p) { var i = p.indexOf('='); if (i !== -1) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
      return o;
    }
    function nsOf(flags) {
      if (flags['all-namespaces']) return null;
      return flags.n || flags.namespace || state.currentNs;
    }

    // ---------- resource aliases ----------
    var ALIAS = {
      po: 'pods', pod: 'pods', pods: 'pods',
      deploy: 'deployments', deployment: 'deployments', deployments: 'deployments',
      rs: 'replicasets', replicaset: 'replicasets', replicasets: 'replicasets',
      svc: 'services', service: 'services', services: 'services',
      no: 'nodes', node: 'nodes', nodes: 'nodes',
      ns: 'namespaces', namespace: 'namespaces', namespaces: 'namespaces',
      cm: 'configmaps', configmap: 'configmaps', configmaps: 'configmaps',
      secret: 'secrets', secrets: 'secrets',
      ep: 'endpoints', endpoints: 'endpoints', endpointslices: 'endpoints',
      all: 'all'
    };
    function canon(r) { return ALIAS[r] || r; }

    // ---------- get ----------
    function endpointsOfService(svc) {
      var eps = [];
      keys(state.pods).forEach(function (k) {
        var p = state.pods[k];
        if (p.ns === svc.ns && p.ready && selectorMatches(svc.selector, p.labels)) eps.push(p);
      });
      return eps;
    }
    function doGet(rest) {
      var pf = parseFlags(rest);
      if (!pf.pos.length) return err('You must specify the type of resource to get. Use "kubectl api-resources" for a complete list.');
      var rawType = pf.pos[0];
      var rtype = canon(rawType);
      if (rawType === 'endpointslices' || rawType === 'endpointslice') rtype = 'endpointslices';
      var name = pf.pos[1];
      var ns = nsOf(pf.flags);
      var oWide = pf.flags.o === 'wide';
      var oYaml = pf.flags.o === 'yaml';
      var showLabels = pf.flags['show-labels'];
      var selFilter = pf.flags.l ? parseKV(pf.flags.l) : null;

      if (rtype === 'all') {
        return out(getAll(ns, oWide));
      }
      var txt = listResource(rtype, ns, name, oWide, showLabels, selFilter, oYaml);
      if (/^(Error from server|error:)/.test(txt)) return err(txt);
      return out(txt);
    }

    // `kubectl get all` — prefixed names, one section per kind, like real kubectl.
    function getAll(ns, oWide) {
      var scope = ns === null ? null : ns;
      function inNs(o) { return scope === null ? true : o.ns === scope; }
      var sections = [];

      var pods = keys(state.pods).map(function (k) { return state.pods[k]; }).filter(inNs);
      if (pods.length) {
        var rows = [['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE']];
        if (scope === null) rows[0] = ['NAMESPACE'].concat(rows[0]);
        pods.forEach(function (p) {
          var r = ['pod/' + p.name, (p.ready ? '1/1' : '0/1'), p.statusReason, String(p.restarts || 0), fmtAge(p.createdTick)];
          if (scope === null) r = [p.ns].concat(r);
          rows.push(r);
        });
        sections.push(table(rows));
      }

      var svcs = keys(state.services).map(function (k) { return state.services[k]; }).filter(inNs);
      if (svcs.length) {
        var sr = [['NAME', 'TYPE', 'CLUSTER-IP', 'EXTERNAL-IP', 'PORT(S)', 'AGE']];
        if (scope === null) sr[0] = ['NAMESPACE'].concat(sr[0]);
        svcs.forEach(function (s) {
          var cip = s.clusterIP || (s.type === 'ExternalName' ? 'None' : ('10.96.0.' + (10 + s.name.length % 40)));
          var ext = s.type === 'LoadBalancer' ? '<pending>' : (s.type === 'ExternalName' ? s.externalName : '<none>');
          var ports = (s.name === 'kubernetes' ? s.port + '/TCP' : s.port + (s.type === 'NodePort' ? ':' + s.nodePort + '/TCP' : '/TCP'));
          var r = ['service/' + s.name, s.type, cip, ext, ports, fmtAge(s.createdTick)];
          if (scope === null) r = [s.ns].concat(r);
          sr.push(r);
        });
        sections.push(table(sr));
      }

      var deps = keys(state.deployments).map(function (k) { return state.deployments[k]; }).filter(inNs);
      if (deps.length) {
        var dr = [['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE']];
        if (scope === null) dr[0] = ['NAMESPACE'].concat(dr[0]);
        deps.forEach(function (d) {
          var ready = podsReadyForDeploy(d);
          var r = ['deployment.apps/' + d.name, ready + '/' + d.replicas, String(d.replicas), String(ready), fmtAge(d.createdTick)];
          if (scope === null) r = [d.ns].concat(r);
          dr.push(r);
        });
        sections.push(table(dr));
      }

      var rss = keys(state.replicasets).map(function (k) { return state.replicasets[k]; }).filter(inNs);
      if (rss.length) {
        var rr = [['NAME', 'DESIRED', 'CURRENT', 'READY', 'AGE']];
        if (scope === null) rr[0] = ['NAMESPACE'].concat(rr[0]);
        rss.forEach(function (r0) {
          var p = podsOfRs(key(r0.ns, r0.name));
          var ready = p.filter(function (x) { return x.ready; }).length;
          var r = ['replicaset.apps/' + r0.name, String(r0.replicas), String(p.length), String(ready), fmtAge(r0.createdTick)];
          if (scope === null) r = [r0.ns].concat(r);
          rr.push(r);
        });
        sections.push(table(rr));
      }

      if (!sections.length) return 'No resources found' + (scope ? ' in ' + scope + ' namespace.' : '.');
      return sections.join('\n\n');
    }

    function matchSel(labels, sel) { if (!sel) return true; for (var k in sel) if (labels[k] !== sel[k]) return false; return true; }

    function listResource(rtype, ns, name, oWide, showLabels, selFilter, oYaml) {
      function nsFilter(obj) { return ns === null ? true : obj.ns === ns; }
      function labelFilter(obj) { return selFilter ? matchSel(obj.labels || {}, selFilter) : true; }
      function nameFilter(obj) { return name ? obj.name === name : true; }

      if (rtype === 'nodes') {
        var rows = [['NAME', 'STATUS', 'ROLES', 'CPU']];
        state.nodes.forEach(function (n) { rows.push([n.name, 'Ready', n.name === 'node-1' ? 'control-plane' : '<none>', (n.cpu / 1000) + ' cores']); });
        return table(rows);
      }
      if (rtype === 'namespaces') {
        var r2 = [['NAME', 'STATUS', 'AGE']];
        state.ns.forEach(function (n) { r2.push([n, 'Active', fmtAge(0)]); });
        return table(r2);
      }
      if (rtype === 'endpoints' || rtype === 'endpointslices') {
        var slices = rtype === 'endpointslices';
        var header0 = slices ? ['NAME', 'ADDRESSTYPE', 'PORTS', 'ENDPOINTS', 'AGE'] : ['NAME', 'ENDPOINTS', 'AGE'];
        var rows0 = [header0];
        var svcs = keys(state.services).map(function (k) { return state.services[k]; })
          .filter(function (s) { return ns === null ? true : s.ns === ns; })
          .filter(function (s) { return name ? (slices ? s.name === name || s.name.indexOf(name + '-') === 0 : s.name === name) : true; });
        if (name && !svcs.length) return 'Error from server (NotFound): ' + rtype + ' "' + name + '" not found';
        if (!svcs.length) return 'No resources found' + (ns ? ' in ' + ns + ' namespace.' : '.');
        svcs.forEach(function (s) {
          var tport = s.targetPort || s.port;
          var eps = endpointsOfService(s).map(function (p) { return podIP(p) + ':' + tport; });
          var epCell = eps.length ? eps.join(',') : '<none>';
          if (slices) rows0.push([s.name + '-' + rsHashShort(), 'IPv4', String(tport), epCell, fmtAge(s.createdTick)]);
          else rows0.push([s.name, epCell, fmtAge(s.createdTick)]);
        });
        return table(rows0);
      }

      var store = state[rtype];
      if (!store) return 'error: the server doesn\'t have a resource type "' + rtype + '"';
      var items = keys(store).map(function (k) { return store[k]; }).filter(function (o) { return nsFilter(o) && labelFilter(o) && nameFilter(o); });
      if (name && !items.length) return 'Error from server (NotFound): ' + rtype + ' "' + name + '" not found';
      if (!items.length) return 'No resources found' + (ns ? ' in ' + ns + ' namespace.' : '.');

      if (oYaml) return yamlFor(rtype, items[0] || items);

      var header, rows;
      if (rtype === 'pods') {
        header = ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'];
        if (oWide) header = header.concat(['IP', 'NODE']);
        if (ns === null) header = ['NAMESPACE'].concat(header);
        rows = [header];
        items.forEach(function (p) {
          var row = [p.name, (p.ready ? '1/1' : '0/1'), p.statusReason, String(p.restarts || 0), fmtAge(p.createdTick)];
          if (oWide) row = row.concat([podIP(p), p.node || '<none>']);
          if (ns === null) row = [p.ns].concat(row);
          if (showLabels) row.push(labelStr(p.labels));
          rows.push(row);
        });
        if (showLabels) rows[0].push('LABELS');
      } else if (rtype === 'deployments') {
        header = ['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE'];
        if (ns === null) header = ['NAMESPACE'].concat(header);
        rows = [header];
        items.forEach(function (d) {
          var ready = podsReadyForDeploy(d);
          var row = [d.name, ready + '/' + d.replicas, String(d.replicas), String(ready), fmtAge(d.createdTick)];
          if (ns === null) row = [d.ns].concat(row);
          if (showLabels) row.push(labelStr(d.labels));
          rows.push(row);
        });
        if (showLabels) rows[0].push('LABELS');
      } else if (rtype === 'replicasets') {
        header = ['NAME', 'DESIRED', 'CURRENT', 'READY', 'AGE'];
        if (ns === null) header = ['NAMESPACE'].concat(header);
        rows = [header];
        items.forEach(function (r) {
          var pods = podsOfRs(key(r.ns, r.name));
          var ready = pods.filter(function (p) { return p.ready; }).length;
          var row = [r.name, String(r.replicas), String(pods.length), String(ready), fmtAge(r.createdTick)];
          if (ns === null) row = [r.ns].concat(row);
          rows.push(row);
        });
      } else if (rtype === 'services') {
        header = ['NAME', 'TYPE', 'CLUSTER-IP', 'EXTERNAL-IP', 'PORT(S)', 'AGE'];
        if (ns === null) header = ['NAMESPACE'].concat(header);
        rows = [header];
        items.forEach(function (s) {
          var cip = s.clusterIP || (s.type === 'ExternalName' ? 'None' : ('10.96.0.' + (10 + s.name.length % 40)));
          var ext = s.type === 'LoadBalancer' ? '<pending>' : (s.type === 'ExternalName' ? s.externalName : '<none>');
          var ports = s.port + (s.type === 'NodePort' ? ':' + s.nodePort + '/TCP' : '/TCP');
          var row = [s.name, s.type, cip, ext, ports, fmtAge(s.createdTick)];
          if (ns === null) row = [s.ns].concat(row);
          rows.push(row);
        });
      } else if (rtype === 'configmaps') {
        header = ['NAME', 'DATA', 'AGE']; rows = [header];
        items.forEach(function (c) { rows.push([c.name, String(keys(c.data).length), fmtAge(c.createdTick)]); });
      } else if (rtype === 'secrets') {
        header = ['NAME', 'TYPE', 'DATA', 'AGE']; rows = [header];
        items.forEach(function (c) { rows.push([c.name, c.type || 'Opaque', String(keys(c.data).length), fmtAge(c.createdTick)]); });
      } else {
        return 'error: unknown resource "' + rtype + '"';
      }
      return table(rows);
    }

    function podsReadyForDeploy(d) {
      var ready = 0;
      keys(state.replicasets).forEach(function (k) {
        var r = state.replicasets[k];
        if (r.owner === deployKey(d)) podsOfRs(k).forEach(function (p) { if (p.ready) ready++; });
      });
      return ready;
    }
    function labelStr(l) { l = l || {}; var a = keys(l).map(function (k) { return k + '=' + l[k]; }); return a.length ? a.join(',') : '<none>'; }
    function podIP(p) {
    // stable per-pod IP derived from a hash of its name, so replicas never share an address
    var h = 0;
    for (var i = 0; i < p.name.length; i++) h = (h * 31 + p.name.charCodeAt(i)) >>> 0;
    return '10.1.' + (p.node === 'node-2' ? 1 : 0) + '.' + (2 + (h % 250));
  }
    function rsHashShort() { return fromSafe((++state.hashCounter * 2654435761) >>> 0, 5); }
    function table(rows) {
      var widths = [];
      rows.forEach(function (r) { r.forEach(function (c, i) { widths[i] = Math.max(widths[i] || 0, String(c).length); }); });
      return rows.map(function (r) { return r.map(function (c, i) { return String(c) + Array(widths[i] - String(c).length + 4).join(' '); }).join('').replace(/\s+$/, ''); }).join('\n');
    }

    function yamlFor(rtype, item) {
      if (rtype === 'pods') {
        return ['apiVersion: v1', 'kind: Pod', 'metadata:', '  name: ' + item.name, '  namespace: ' + item.ns,
          '  labels:'].concat(keys(item.labels).map(function (k) { return '    ' + k + ': ' + item.labels[k]; }))
          .concat(['spec:', '  nodeName: ' + (item.node || 'null'), '  containers:', '  - name: ' + (item.spec.container || 'app'), '    image: ' + item.spec.image,
            'status:', '  phase: ' + item.phase, '  reason: ' + item.statusReason]).join('\n');
      }
      if (rtype === 'services') {
        return ['apiVersion: v1', 'kind: Service', 'metadata:', '  name: ' + item.name, '  namespace: ' + item.ns, 'spec:',
          '  type: ' + item.type, '  selector:'].concat(keys(item.selector || {}).map(function (k) { return '    ' + k + ': ' + item.selector[k]; }))
          .concat(['  ports:', '  - port: ' + item.port, '    targetPort: ' + (item.targetPort || item.port)]).join('\n');
      }
      if (rtype === 'deployments') {
        return ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: ' + item.name, '  namespace: ' + item.ns, 'spec:',
          '  replicas: ' + item.replicas, '  selector:', '    matchLabels:'].concat(keys(item.selector).map(function (k) { return '      ' + k + ': ' + item.selector[k]; })).join('\n');
      }
      return '# -o yaml not available for this type';
    }

    // ---------- describe ----------
    function doDescribe(rest) {
      var pf = parseFlags(rest);
      var rtype = canon(pf.pos[0]);
      var name = pf.pos[1];
      var ns = nsOf(pf.flags) || 'default';
      if (!name) return err('You must specify a resource name.');
      if (rtype === 'pods') {
        var p = state.pods[key(ns, name)];
        if (!p) return err('Error from server (NotFound): pods "' + name + '" not found');
        var crashing = p.statusReason === 'CrashLoopBackOff';
        var pulling = p.statusReason === 'ImagePullBackOff';
        var stateLine = crashing ? 'Waiting (CrashLoopBackOff)' : (pulling ? 'Waiting (ImagePullBackOff)' : (p.ready ? 'Running' : 'Waiting'));
        var lines = ['Name:         ' + p.name, 'Namespace:    ' + p.ns, 'Node:         ' + (p.node || '<none>'),
          'Labels:       ' + labelStr(p.labels), 'Status:       ' + p.phase + (p.statusReason !== p.phase ? ' (' + p.statusReason + ')' : ''),
          'IP:           ' + (p.node ? podIP(p) : '<none>'),
          'Containers:', '  app:', '    Image:          ' + p.spec.image, '    State:          ' + stateLine];
        if (crashing) {
          lines.push('    Last State:     Terminated');
          lines.push('      Reason:       Error');
          lines.push('      Exit Code:    1');
        }
        lines.push('    Ready:          ' + (p.ready ? 'True' : 'False'));
        lines.push('    Restart Count:  ' + (p.restarts || 0));
        lines.push('');
        lines.push('Events:');
        var evs = state.events.filter(function (e) { return e.kind === 'Pod' && e.name === p.name && e.ns === p.ns; });
        if (!evs.length) lines.push('  <none>');
        else {
          lines.push('  Type      Reason             Age   Message');
          evs.forEach(function (e) {
            var typ = (e.reason === 'Failed' || e.reason === 'BackOff' || e.reason === 'FailedScheduling') ? 'Warning' : 'Normal';
            lines.push('  ' + pad(typ, 10) + pad(e.reason, 19) + pad(fmtAge(e.tick), 6) + e.message);
          });
        }
        return out(lines.join('\n'));
      }
      if (rtype === 'services') {
        var s = state.services[key(ns, name)];
        if (!s) return err('Error from server (NotFound): services "' + name + '" not found');
        var eps = endpointsOfService(s).map(function (pp) { return podIP(pp) + ':' + (s.targetPort || s.port); });
        return out(['Name:              ' + s.name, 'Namespace:         ' + s.ns, 'Type:              ' + s.type,
          'Selector:          ' + labelStr(s.selector), 'Port:              ' + s.port + '/TCP', 'TargetPort:        ' + (s.targetPort || s.port) + '/TCP',
          'Endpoints:         ' + (eps.length ? eps.join(',') : '<none>')].join('\n'));
      }
      if (rtype === 'deployments') {
        var d = state.deployments[key(ns, name)];
        if (!d) return err('Error from server (NotFound): deployments "' + name + '" not found');
        return out(['Name:               ' + d.name, 'Namespace:          ' + d.ns, 'Replicas:           ' + d.replicas + ' desired | ' + podsReadyForDeploy(d) + ' available',
          'Selector:           ' + labelStr(d.selector), 'StrategyType:       RollingUpdate',
          'Pod Template:', '  Labels:  ' + labelStr(d.template.labels), '  Image:   ' + d.template.spec.image].join('\n'));
      }
      if (rtype === 'nodes') {
        var n = state.nodes.filter(function (x) { return x.name === name; })[0];
        if (!n) return err('Error from server (NotFound): nodes "' + name + '" not found');
        return out(['Name:    ' + n.name, 'Labels:  ' + labelStr(n.labels), 'Capacity:', '  cpu:  ' + (n.cpu / 1000)].join('\n'));
      }
      return err('describe not supported for "' + rtype + '"');
    }
    function pad(s, n) { s = String(s); return s + Array(Math.max(1, n - s.length + 1)).join(' '); }

    // ---------- create ----------
    function doCreate(rest) {
      var pf = parseFlags(rest);
      var sub = pf.pos[0];
      var ns = nsOf(pf.flags) || state.currentNs;
      if (sub === 'deployment' || sub === 'deploy') {
        var name = pf.pos[1];
        if (!name) return err('error: NAME is required');
        var image = pf.flags.image || 'nginx';
        var replicas = parseInt(pf.flags.replicas || '1', 10);
        return createDeployment(ns, name, image, replicas);
      }
      if (sub === 'namespace' || sub === 'ns') {
        var nn = pf.pos[1]; if (!nn) return err('error: NAME is required');
        if (state.ns.indexOf(nn) === -1) state.ns.push(nn);
        return out('namespace/' + nn + ' created');
      }
      if (sub === 'configmap' || sub === 'cm') {
        var cn = pf.pos[1]; var data = {};
        rest.forEach(function (t) { var m = /^--from-literal=([^=]+)=(.*)$/.exec(t); if (m) data[m[1]] = m[2]; });
        state.configmaps[key(ns, cn)] = { ns: ns, name: cn, labels: {}, data: data, createdTick: state.clock };
        return out('configmap/' + cn + ' created');
      }
      if (sub === 'secret') {
        var st = pf.pos[1]; var sn = pf.pos[2]; var sdata = {};
        rest.forEach(function (t) { var m = /^--from-literal=([^=]+)=(.*)$/.exec(t); if (m) sdata[m[1]] = m[2]; });
        state.secrets[key(ns, sn)] = { ns: ns, name: sn, labels: {}, type: 'Opaque', data: sdata, createdTick: state.clock };
        return out('secret/' + sn + ' created');
      }
      return err('error: unknown create subcommand "' + sub + '"');
    }

    function createDeployment(ns, name, image, replicas) {
      if (state.deployments[key(ns, name)]) return err('error: deployments.apps "' + name + '" already exists');
      var d = {
        ns: ns, name: name, replicas: replicas, image: image,
        labels: { app: name },
        selector: { app: name },
        template: { labels: { app: name }, spec: { image: image, container: name, cpuRequest: 0, command: null } },
        revision: 0, currentRs: null, _lastSig: null, history: [], changeCause: '<none>', createdTick: state.clock
      };
      state.deployments[key(ns, name)] = d;
      reconcileDeployment(d);
      return out('deployment.apps/' + name + ' created');
    }

    // ---------- expose ----------
    function doExpose(rest) {
      var pf = parseFlags(rest);
      // kubectl expose deployment NAME --port --target-port --type --name
      var rtype = canon(pf.pos[0]);
      var target = pf.pos[1];
      var ns = nsOf(pf.flags) || state.currentNs;
      if (rtype !== 'deployments') return err('error: expose currently supports deployments in this playground');
      var d = state.deployments[key(ns, target)];
      if (!d) return err('Error from server (NotFound): deployments "' + target + '" not found');
      var svcName = pf.flags.name || target;
      var type = pf.flags.type || 'ClusterIP';
      var port = parseInt(pf.flags.port || '80', 10);
      var tport = parseInt(pf.flags['target-port'] || port, 10);
      var svc = { ns: ns, name: svcName, type: type, selector: clone(d.selector), port: port, targetPort: tport, labels: {}, createdTick: state.clock };
      if (type === 'NodePort' || type === 'LoadBalancer') svc.nodePort = 30000 + (svcName.length * 7) % 2767;
      state.services[key(ns, svcName)] = svc;
      return out('service/' + svcName + ' exposed');
    }

    // ---------- scale ----------
    function doScale(rest) {
      var pf = parseFlags(rest);
      var ns = nsOf(pf.flags) || state.currentNs;
      var tgt = pf.pos[0] || '';
      var replicas = parseInt(pf.flags.replicas, 10);
      if (isNaN(replicas)) return err('error: --replicas is required');
      var m = /^(deployment|deploy)\/(.+)$/.exec(tgt);
      var name = m ? m[2] : pf.pos[1];
      var d = state.deployments[key(ns, name)];
      if (!d) return err('Error from server (NotFound): deployments "' + name + '" not found');
      d.replicas = replicas;
      reconcileDeployment(d);
      return out('deployment.apps/' + name + ' scaled');
    }

    // ---------- set image ----------
    function doSet(rest) {
      var pf = parseFlags(rest);
      if (pf.pos[0] !== 'image') return err('error: only "set image" is supported');
      var ns = nsOf(pf.flags) || state.currentNs;
      var tgt = pf.pos[1] || '';
      var m = /^(deployment|deploy)\/(.+)$/.exec(tgt);
      var name = m ? m[2] : null;
      var d = name ? state.deployments[key(ns, name)] : null;
      if (!d) return err('Error from server (NotFound): deployments "' + (name || tgt) + '" not found');
      var spec = pf.pos[2]; // container=image
      var im = /^([^=]+)=(.+)$/.exec(spec);
      if (!im) return err('error: expected CONTAINER=IMAGE');
      d.template.spec.image = im[2];
      d.image = im[2];
      // Modern kubectl does not record CHANGE-CAUSE automatically (--record is deprecated);
      // it only appears when the kubernetes.io/change-cause annotation is set.
      d.pendingChangeCause = null;
      reconcileDeployment(d);
      return out('deployment.apps/' + name + ' image updated');
    }

    // ---------- annotate ----------
    function doAnnotate(rest) {
      var pf = parseFlags(rest);
      var ns = nsOf(pf.flags) || state.currentNs;
      var tgt = pf.pos[0] || '';
      var m = /^(deployment|deploy)\/(.+)$/.exec(tgt);
      var name = m ? m[2] : canon(pf.pos[0]) === 'deployments' ? pf.pos[1] : null;
      var d = name ? state.deployments[key(ns, name)] : null;
      if (!d) return err('Error from server (NotFound): deployments "' + (name || tgt) + '" not found');
      var cause = null;
      var joined = rest.join(' ');
      var cm = /kubernetes\.io\/change-cause=(.*)$/.exec(joined);
      if (cm) { cause = cm[1].trim().replace(/^["']|["']$/g, ''); }
      if (cause != null) {
        d.changeCause = cause;
        // stamp the CURRENT revision's history entry so rollout history reflects it
        var cur = (d.history || []).filter(function (h) { return h.rs === d.currentRs; })[0];
        if (cur) cur.changeCause = cause;
      }
      return out('deployment.apps/' + name + ' annotated');
    }

    // ---------- rollout ----------
    function doRollout(rest) {
      var pf = parseFlags(rest);
      var sub = pf.pos[0];
      var ns = nsOf(pf.flags) || state.currentNs;
      var tgt = pf.pos[1] || '';
      var m = /^(deployment|deploy)\/(.+)$/.exec(tgt);
      var name = m ? m[2] : pf.pos[2];
      var d = name ? state.deployments[key(ns, name)] : null;
      if (sub === 'status') {
        if (!d) return err('error: deployment not found');
        return out('deployment "' + name + '" successfully rolled out');
      }
      if (sub === 'history') {
        if (!d) return err('error: deployment not found');
        var lines = ['deployment.apps/' + name, 'REVISION  CHANGE-CAUSE'];
        (d.history || []).slice().sort(function (a, b) { return a.revision - b.revision; }).forEach(function (h) { lines.push(pad(String(h.revision), 10) + (h.changeCause || '<none>')); });
        return out(lines.join('\n'));
      }
      if (sub === 'undo') {
        if (!d) return err('error: deployment not found');
        var hist = d.history || [];
        if (hist.length < 2) return err('error: no rollout history found for deployment "' + name + '"');
        var sorted = hist.slice().sort(function (a, b) { return a.revision - b.revision; });
        var toRev = pf.flags['to-revision'] ? parseInt(pf.flags['to-revision'], 10) : sorted[sorted.length - 2].revision;
        var target = hist.filter(function (h) { return h.revision === toRev; })[0];
        if (!target) return err('error: unable to find specified revision ' + toRev);
        // roll back to that revision's template; reconcile will REUSE its existing RS
        // (same pod-template-hash) and renumber it to the newest revision.
        d.template = clone(target.template);
        d.pendingChangeCause = target.changeCause;
        reconcileDeployment(d);
        return out('deployment.apps/' + name + ' rolled back');
      }
      if (sub === 'restart') {
        if (!d) return err('error: deployment not found');
        d.template.spec._restart = (d.template.spec._restart || 0) + 1;
        reconcileDeployment(d);
        return out('deployment.apps/' + name + ' restarted');
      }
      return err('error: unknown rollout subcommand "' + sub + '"');
    }

    // ---------- delete ----------
    function doDelete(rest) {
      var pf = parseFlags(rest);
      var rtype = canon(pf.pos[0]);
      var name = pf.pos[1];
      var ns = nsOf(pf.flags) || state.currentNs;
      if (!name) return err('error: resource(s) were provided, but no name was specified');
      if (rtype === 'pods') {
        var p = state.pods[key(ns, name)];
        if (!p) return err('Error from server (NotFound): pods "' + name + '" not found');
        var owner = p.owner;
        delete state.pods[key(ns, name)];
        var msg = 'pod "' + name + '" deleted';
        // if owned by a RS, it is recreated
        if (owner && state.replicasets[owner]) { reconcileRs(state.replicasets[owner]); }
        return out(msg);
      }
      if (rtype === 'deployments') {
        var d = state.deployments[key(ns, name)];
        if (!d) return err('Error from server (NotFound): deployments "' + name + '" not found');
        keys(state.replicasets).forEach(function (k) { if (state.replicasets[k].owner === key(ns, name)) { podsOfRs(k).forEach(function (pp) { delete state.pods[key(pp.ns, pp.name)]; }); delete state.replicasets[k]; } });
        delete state.deployments[key(ns, name)];
        return out('deployment.apps "' + name + '" deleted');
      }
      if (rtype === 'services') {
        if (!state.services[key(ns, name)]) return err('Error from server (NotFound): services "' + name + '" not found');
        delete state.services[key(ns, name)]; return out('service "' + name + '" deleted');
      }
      if (rtype === 'configmaps') { delete state.configmaps[key(ns, name)]; return out('configmap "' + name + '" deleted'); }
      if (rtype === 'secrets') { delete state.secrets[key(ns, name)]; return out('secret "' + name + '" deleted'); }
      return err('error: deleting "' + rtype + '" is not supported here');
    }

    // ---------- label ----------
    function doLabel(rest) {
      var pf = parseFlags(rest);
      var rtype = canon(pf.pos[0]);
      var name = pf.pos[1];
      var ns = nsOf(pf.flags) || state.currentNs;
      var store = state[rtype];
      if (!store) return err('error: unknown resource "' + rtype + '"');
      var obj = store[key(ns, name)];
      if (!obj) return err('Error from server (NotFound): ' + rtype + ' "' + name + '" not found');
      obj.labels = obj.labels || {};
      pf.pos.slice(2).forEach(function (t) {
        if (/=/.test(t)) { var kv = t.split('='); obj.labels[kv[0]] = kv[1]; }
        else if (/-$/.test(t)) { delete obj.labels[t.slice(0, -1)]; }
      });
      // relabelling a pod can change which services it backs — nothing else to recompute
      return out(rtype.replace(/s$/, '') + '/' + name + ' labeled');
    }

    // ---------- run ----------
    function doRun(rest) {
      var pf = parseFlags(rest);
      var name = pf.pos[0];
      var ns = nsOf(pf.flags) || state.currentNs;
      if (!name) return err('error: NAME is required');
      var image = pf.flags.image || 'nginx';
      var cmd = null;
      var dd = rest.indexOf('--');
      if (dd !== -1) cmd = rest.slice(dd + 1).join(' ');
      var spec = { image: image, container: name, cpuRequest: 0, command: cmd };
      makePod(ns, name, spec, { run: name });
      return out('pod/' + name + ' created');
    }

    // ---------- logs / exec ----------
    function doLogs(rest) {
      var pf = parseFlags(rest);
      var name = pf.pos[0];
      var ns = nsOf(pf.flags) || state.currentNs;
      if (pf.flags.l) {
        var sel = parseKV(pf.flags.l);
        var ps = keys(state.pods).map(function (k) { return state.pods[k]; }).filter(function (p) { return p.ns === ns && matchSel(p.labels, sel); });
        if (!ps.length) return err('No resources found');
        return out(ps.map(function (p) { return logBody(p); }).join('\n'));
      }
      var pod = state.pods[key(ns, name)];
      if (!pod) {
        // allow deploy/NAME or job/NAME -> first matching pod
        var m = /^(deployment|deploy|job)\/(.+)$/.exec(name || '');
        if (m) { var cand = keys(state.pods).map(function (k) { return state.pods[k]; }).filter(function (p) { return p.ns === ns && p.name.indexOf(m[2]) === 0; })[0]; if (cand) pod = cand; }
      }
      if (!pod) return err('Error from server (NotFound): pods "' + name + '" not found');
      return out(logBody(pod, pf.flags.previous));
    }
    function logBody(pod, prev) {
      if (cmdCrashes(pod.spec.command)) return 'error: process exited with code 1';
      if (imageBad(pod.spec.image)) return 'Error from server (BadRequest): container "app" in pod "' + pod.name + '" is waiting to start: image can\'t be pulled';
      return pod.name + ' | serving on :' + '80\n' + pod.name + ' | request handled 200 OK';
    }
    function doExec(rest) {
      var pf = parseFlags(rest);
      var name = pf.pos[0];
      var ns = nsOf(pf.flags) || state.currentNs;
      var pod = state.pods[key(ns, name)];
      if (!pod) return err('Error from server (NotFound): pods "' + name + '" not found');
      if (!pod.ready) return err('error: unable to upgrade connection: container not running');
      var dd = rest.indexOf('--');
      var cmd = dd !== -1 ? rest.slice(dd + 1).join(' ') : 'sh';
      if (/printenv|env/.test(cmd)) return out('PATH=/usr/bin\nHOSTNAME=' + pod.name);
      if (/^ls/.test(cmd)) return out('bin  dev  etc  usr  var');
      if (/hostname/.test(cmd)) return out(pod.name);
      return out('(simulated shell) ran: ' + cmd);
    }

    // ---------- apply -f (YAML pane) ----------
    function doApply(rest, yamlText) {
      if (!yamlText || !yamlText.trim()) return err('error: no YAML provided (use the editor pane, then "kubectl apply -f -")');
      try {
        var docs = yamlText.split(/^---\s*$/m);
        var msgs = [];
        for (var i = 0; i < docs.length; i++) {
          var d = docs[i].trim(); if (!d) continue;
          var r = applyOneDoc(d);
          if (!r.ok) return r;
          msgs.push(r.output);
        }
        return out(msgs.join('\n'));
      } catch (e) { return err('error parsing YAML: ' + e.message); }
    }

    function parseMiniYaml(text) {
      // Minimal YAML -> JS for our supported kinds. Indentation = 2 spaces.
      var lines = text.replace(/\t/g, '  ').split('\n').filter(function (l) { return l.trim() && l.trim()[0] !== '#'; });
      var root = {};
      var stack = [{ indent: -1, obj: root }];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var indent = line.match(/^ */)[0].length;
        var content = line.trim();
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
        var parent = stack[stack.length - 1].obj;
        var ci = content.indexOf(':');
        if (ci === -1) continue;
        var k = content.slice(0, ci).trim();
        var v = content.slice(ci + 1).trim();
        if (v === '') {
          // could be a map or inline later
          var child = {};
          parent[k] = child;
          stack.push({ indent: indent, obj: child });
        } else {
          // inline map {a: b, c: d}
          if (v[0] === '{') {
            var inner = {};
            v.slice(1, -1).split(',').forEach(function (p) { var e = p.indexOf(':'); if (e !== -1) inner[p.slice(0, e).trim()] = strip(p.slice(e + 1).trim()); });
            parent[k] = inner;
          } else parent[k] = strip(v);
        }
      }
      return root;
    }
    function strip(v) { v = String(v); if ((v[0] === '"' && v.slice(-1) === '"') || (v[0] === "'" && v.slice(-1) === "'")) return v.slice(1, -1); if (/^\d+$/.test(v)) return parseInt(v, 10); return v; }

    function applyOneDoc(doc) {
      var o = parseMiniYaml(doc);
      var kind = o.kind;
      var md = o.metadata || {};
      var name = md.name;
      var ns = md.namespace || state.currentNs;
      if (!kind || !name) return err('error: Deployment/Service/etc requires kind and metadata.name');
      if (kind === 'Deployment') {
        var spec = o.spec || {};
        var sel = (spec.selector && spec.selector.matchLabels) || {};
        var tmpl = spec.template || {};
        var tlabels = (tmpl.metadata && tmpl.metadata.labels) || {};
        // validate selector presence and selector/template label match
        if (!keys(sel).length) return err('error: Deployment.spec.selector: Required value');
        for (var sk in sel) if (sel[sk] !== tlabels[sk]) return err('error: `selector` does not match template `labels` (' + sk + ')');
        var cont = (tmpl.spec && tmpl.spec.containers) ? tmpl.spec.containers : null;
        // our mini-parser can't do list items robustly; accept a single container map under containers
        var image = 'nginx';
        if (tmpl.spec && tmpl.spec.container) image = tmpl.spec.container; // allow a flat convenience field
        if (tmpl.spec && tmpl.spec.image) image = tmpl.spec.image;
        var replicas = spec.replicas || 1;
        var exist = state.deployments[key(ns, name)];
        if (exist) {
          exist.replicas = replicas; exist.template.spec.image = image; exist.template.labels = tlabels; exist.selector = sel;
          reconcileDeployment(exist);
          return out('deployment.apps/' + name + ' configured');
        }
        var d = { ns: ns, name: name, replicas: replicas, image: image, labels: tlabels, selector: sel,
          template: { labels: tlabels, spec: { image: image, container: name, cpuRequest: 0, command: null } },
          revision: 0, currentRs: null, _lastSig: null, history: [], changeCause: '<none>', createdTick: state.clock };
        state.deployments[key(ns, name)] = d;
        reconcileDeployment(d);
        return out('deployment.apps/' + name + ' created');
      }
      if (kind === 'Service') {
        var sp = o.spec || {};
        var svc = { ns: ns, name: name, type: sp.type || 'ClusterIP', selector: sp.selector || {}, port: (sp.ports && sp.ports.port) || sp.port || 80, targetPort: (sp.ports && sp.ports.targetPort) || sp.targetPort || 80, labels: {}, createdTick: state.clock };
        if (!keys(svc.selector).length && svc.type !== 'ExternalName') return err('error: Service.spec.selector is required for this playground');
        state.services[key(ns, name)] = svc;
        return out('service/' + name + (state.services[key(ns, name)] ? ' created' : ' configured'));
      }
      if (kind === 'ConfigMap') {
        state.configmaps[key(ns, name)] = { ns: ns, name: name, labels: {}, data: o.data || {}, createdTick: state.clock };
        return out('configmap/' + name + ' created');
      }
      if (kind === 'Pod') {
        var psp = o.spec || {};
        var img = (psp.container) || (psp.image) || 'nginx';
        makePod(ns, name, { image: img, container: name, cpuRequest: psp.cpuRequest || 0, command: psp.command || null }, (md.labels || {}));
        return out('pod/' + name + ' created');
      }
      return err('error: kind "' + kind + '" is not supported in this playground (try Deployment, Service, ConfigMap, Pod)');
    }

    // ---------- help ----------
    function helpText(cmd) {
      var H = {
        get: 'kubectl get <pods|deploy|rs|svc|nodes|ns|cm|secrets|endpoints|all> [name] [-n ns|-A] [-o wide|yaml] [-l k=v] [--show-labels]',
        describe: 'kubectl describe <pods|svc|deploy|nodes> <name> [-n ns] — detail + Events',
        create: 'kubectl create deployment <name> --image=IMG --replicas=N | create namespace|configmap|secret',
        expose: 'kubectl expose deployment <name> --port=P [--target-port=T] [--type=ClusterIP|NodePort|LoadBalancer]',
        scale: 'kubectl scale deployment/<name> --replicas=N',
        set: 'kubectl set image deployment/<name> <container>=<image>',
        rollout: 'kubectl rollout status|history|undo|restart deployment/<name> [--to-revision=N]',
        delete: 'kubectl delete <pods|deploy|svc|cm|secret> <name>  (a Deployment-owned pod is recreated)',
        logs: 'kubectl logs <pod> [--previous] [-l k=v]',
        exec: 'kubectl exec <pod> -- <cmd>',
        label: 'kubectl label <res> <name> k=v  (k- removes)',
        run: 'kubectl run <name> --image=IMG [-- command]',
        apply: 'kubectl apply -f -   (applies the YAML from the editor pane)'
      };
      if (cmd && H[cmd]) return H[cmd];
      return 'kubectl playground commands:\n  get describe create expose scale set rollout delete logs exec label run apply config\n' +
        'Failures to try: image with "notexist" -> ImagePullBackOff · run ... -- exit 1 -> CrashLoopBackOff · a huge cpu request -> Pending\n' +
        'Type "help <command>" for detail. Tab completes. Up/Down recall history.';
    }

    // ---------- config ----------
    function doConfig(rest) {
      var pf = parseFlags(rest);
      if (pf.pos[0] === 'set-context' && (pf.flags.namespace != null)) { state.currentNs = pf.flags.namespace; return out('Context modified: namespace "' + state.currentNs + '"'); }
      if (pf.pos[0] === 'get-contexts') return out('CURRENT   NAME      NAMESPACE\n*         minikube  ' + state.currentNs);
      if (pf.pos[0] === 'current-context') return out('minikube');
      return out('');
    }

    // ---------- tokenizer & dispatch ----------
    function tokenize(line) {
      var toks = [], re = /"([^"]*)"|'([^']*)'|(\S+)/g, m;
      while ((m = re.exec(line)) !== null) toks.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
      return toks;
    }

    function run(line, yamlText) {
      line = (line || '').trim();
      if (!line) return out('');
      if (line === 'clear') return { ok: true, output: '', clear: true };
      advanceClock();
      var toks = tokenize(line);
      if (toks[0] === 'help') return out(helpText(toks[1]));
      if (toks[0] === 'k') toks[0] = 'kubectl';
      if (toks[0] !== 'kubectl') return err(toks[0] + ': command not found (this is a kubectl playground — try "kubectl get pods" or "help")');
      var sub = toks[1], rest = toks.slice(2);
      switch (sub) {
        case 'get': return doGet(rest);
        case 'describe': return doDescribe(rest);
        case 'create': return doCreate(rest);
        case 'expose': return doExpose(rest);
        case 'scale': return doScale(rest);
        case 'set': return doSet(rest);
        case 'rollout': return doRollout(rest);
        case 'annotate': return doAnnotate(rest);
        case 'delete': return doDelete(rest);
        case 'label': return doLabel(rest);
        case 'run': return doRun(rest);
        case 'logs': return doLogs(rest);
        case 'exec': return doExec(rest);
        case 'apply': return doApply(rest, yamlText);
        case 'config': return doConfig(rest);
        case 'top': return out('NAME       CPU(cores)   MEMORY(bytes)\n(simulated)  5m           20Mi');
        case 'api-resources': return out('NAME          SHORTNAMES   NAMESPACED   KIND\npods          po           true         Pod\ndeployments   deploy       true         Deployment\nservices      svc          true         Service\nnodes         no           false        Node');
        case 'help': case undefined: return out(helpText(rest[0]));
        case 'version': return out('Client Version: v1.33.0 (playground)');
        default: return err('error: unknown command "' + sub + '" for "kubectl". Try "help".');
      }
    }

    // ---------- snapshot for UI ----------
    function snapshot() {
      return {
        currentNs: state.currentNs,
        nodes: clone(state.nodes),
        pods: keys(state.pods).map(function (k) { return { ns: state.pods[k].ns, name: state.pods[k].name, phase: state.pods[k].phase, status: state.pods[k].statusReason, ready: state.pods[k].ready, node: state.pods[k].node, labels: clone(state.pods[k].labels), restarts: state.pods[k].restarts || 0 }; }),
        services: keys(state.services).map(function (k) { var s = state.services[k]; return { ns: s.ns, name: s.name, type: s.type, selector: clone(s.selector), endpoints: endpointsOfService(s).map(function (p) { return p.name; }) }; }),
        deployments: keys(state.deployments).map(function (k) { var d = state.deployments[k]; return { ns: d.ns, name: d.name, replicas: d.replicas, ready: podsReadyForDeploy(d), revision: d.revision }; })
      };
    }

    return { run: run, reset: reset, snapshot: snapshot, _state: function () { return state; } };
  }

  // ===================== BROWSER UI =====================
  function initUI() {
    var termBody = document.getElementById('pgTerm');
    var input = document.getElementById('pgInput');
    var yamlPane = document.getElementById('pgYaml');
    var clusterWrap = document.getElementById('pgCluster');
    var chalWrap = document.getElementById('pgChallenges');
    var qHint = document.getElementById('pgTryHint');
    if (!termBody || !input) return;

    var engine = createEngine();
    var history = [], hpos = -1;
    var flags = {};

    var CHALLENGES = [
      { id: 'c1', text: 'Create a deployment with 3 replicas', done: function (s) { return s.deployments.some(function (d) { return d.replicas >= 3; }); } },
      { id: 'c2', text: 'See 3 Pods Running (kubectl get pods)', done: function (s) { return s.pods.filter(function (p) { return p.ready; }).length >= 3; } },
      { id: 'c3', text: 'Expose the deployment as a Service', done: function (s) { return s.services.length >= 1; } },
      { id: 'c4', text: 'Service has endpoints (selector matches ready Pods)', done: function (s) { return s.services.some(function (sv) { return sv.endpoints.length > 0; }); } },
      { id: 'c5', text: 'Scale the deployment to 5', done: function (s) { return s.deployments.some(function (d) { return d.replicas >= 5; }); } },
      { id: 'c6', text: 'Trigger a rolling update (kubectl set image)', done: function (s) { return s.deployments.some(function (d) { return d.revision >= 2; }); } },
      { id: 'c7', text: 'Cause an ImagePullBackOff (image with "notexist")', done: function (s) { return s.pods.some(function (p) { return p.status === 'ImagePullBackOff'; }); } },
      { id: 'c8', text: 'Cause a CrashLoopBackOff (run ... -- exit 1)', done: function (s) { return s.pods.some(function (p) { return p.status === 'CrashLoopBackOff'; }); } },
      { id: 'c9', text: 'Cause a Pending Pod (cpu request > node) via apply', done: function (s) { return s.pods.some(function (p) { return p.status === 'Pending'; }); } },
      { id: 'c10', text: 'Delete a Deployment-owned Pod and watch it come back', done: function () { return flags._deletedPodRecreated; } },
      { id: 'c11', text: 'Apply a Deployment from the YAML editor', done: function () { return flags._appliedYaml; } },
      { id: 'c12', text: 'Create a ConfigMap', done: function (s) { return flags._madeCm; } }
    ];

    function print(text, cls) {
      var div = document.createElement('div');
      div.className = 'term-line';
      if (cls) div.classList.add(cls);
      var span = document.createElement('span'); span.className = 'term-out'; span.textContent = text;
      div.appendChild(span); termBody.appendChild(div); termBody.scrollTop = termBody.scrollHeight;
    }
    function printCmd(text) {
      var div = document.createElement('div'); div.className = 'term-line';
      div.innerHTML = '<span class="term-prompt">$</span>';
      var span = document.createElement('span'); span.className = 'term-out'; span.textContent = text;
      div.appendChild(span); termBody.appendChild(div);
    }

    function trackFlags(line) {
      var s = engine.snapshot();
      if (/kubectl\s+create\s+(configmap|cm)/.test(line)) flags._madeCm = true;
      if (/kubectl\s+apply\s+-f/.test(line)) flags._appliedYaml = true;
    }

    function execute(line) {
      printCmd(line);
      var before = engine.snapshot();
      var deletedOwnedPod = /kubectl\s+delete\s+(pod|po|pods)\s/.test(line);
      var res = engine.run(line, yamlPane ? yamlPane.value : '');
      if (res.clear) { termBody.innerHTML = ''; renderCluster(); renderChallenges(); return; }
      if (res.output) print(res.output, res.ok ? '' : 'term-err');
      if (deletedOwnedPod) {
        var after = engine.snapshot();
        if (after.pods.filter(function (p) { return p.ready; }).length >= before.pods.filter(function (p) { return p.ready; }).length) flags._deletedPodRecreated = true;
      }
      trackFlags(line);
      renderCluster();
      renderChallenges();
    }

    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

    function renderCluster() {
      var s = engine.snapshot();
      var h = [];
      h.push('<div class="pg-ns">namespace: <strong>' + esc(s.currentNs) + '</strong></div>');
      h.push('<div class="pg-nodes">');
      s.nodes.forEach(function (n) {
        var pods = s.pods.filter(function (p) { return p.node === n.name; });
        h.push('<div class="pg-node"><div class="pg-node-h">🖥️ ' + esc(n.name) + '</div>');
        if (!pods.length) h.push('<div class="pg-empty">no pods</div>');
        pods.forEach(function (p) {
          var cls = p.ready ? 'ok' : (p.status === 'Pending' ? 'pend' : 'bad');
          h.push('<div class="pg-pod ' + cls + '" title="' + esc(p.status) + '">▦ ' + esc(p.name) + ' <span class="pg-pst">' + esc(p.status) + '</span></div>');
        });
        h.push('</div>');
      });
      // pending/unscheduled pods
      var pend = s.pods.filter(function (p) { return !p.node; });
      if (pend.length) { h.push('<div class="pg-node pend-node"><div class="pg-node-h">⏳ unscheduled</div>'); pend.forEach(function (p) { h.push('<div class="pg-pod pend">▦ ' + esc(p.name) + ' <span class="pg-pst">' + esc(p.status) + '</span></div>'); }); h.push('</div>'); }
      h.push('</div>');
      if (s.services.length) {
        h.push('<div class="pg-svcs"><div class="pg-node-h">🔌 Services</div>');
        s.services.forEach(function (sv) {
          h.push('<div class="pg-svc">' + esc(sv.name) + ' <span class="pg-sel">[' + esc(JSON.stringify(sv.selector)) + ']</span> → ' + (sv.endpoints.length ? sv.endpoints.length + ' endpoint(s)' : '<span class="pg-noep">NO ENDPOINTS</span>') + '</div>');
        });
        h.push('</div>');
      }
      clusterWrap.innerHTML = h.join('');
    }

    function renderChallenges() {
      var s = engine.snapshot();
      chalWrap.innerHTML = '';
      CHALLENGES.forEach(function (c) {
        var done = false; try { done = c.done(s); } catch (e) { done = false; }
        var li = document.createElement('li');
        li.innerHTML = '<span class="pg-check">' + (done ? '\u2705' : '\u2b1c') + '</span> ' + c.text;
        if (done) li.className = 'pg-done';
        chalWrap.appendChild(li);
      });
    }

    var VOCAB_SUB = ['get', 'describe', 'create', 'expose', 'scale', 'set', 'rollout', 'annotate', 'delete', 'label', 'run', 'logs', 'exec', 'apply', 'config', 'top', 'api-resources', 'help', 'version'];
    var VOCAB_RES = ['pods', 'deploy', 'deployments', 'rs', 'svc', 'services', 'nodes', 'ns', 'cm', 'configmaps', 'secrets', 'endpoints', 'all'];
    function complete(line) {
      var toks = line.split(/\s+/);
      var vocab;
      if (toks.length <= 1) vocab = ['kubectl'];
      else if (toks[0] === 'kubectl' && toks.length === 2) vocab = VOCAB_SUB;
      else if (toks[0] === 'kubectl' && toks[1] === 'get' && toks.length === 3) vocab = VOCAB_RES;
      else return line;
      var last = toks[toks.length - 1];
      var hits = vocab.filter(function (v) { return v.indexOf(last) === 0; });
      if (hits.length === 1) { toks[toks.length - 1] = hits[0]; return toks.join(' '); }
      if (hits.length > 1) print(hits.join('  '), 'pg-hint-line');
      return line;
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var l = input.value; if (l.trim()) { history.unshift(l); hpos = -1; execute(l); } input.value = ''; }
      else if (e.key === 'Tab') { e.preventDefault(); input.value = complete(input.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hpos < history.length - 1) { hpos++; input.value = history[hpos]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hpos > 0) { hpos--; input.value = history[hpos]; } else { hpos = -1; input.value = ''; } }
    });
    var runBtn = document.getElementById('pgRunBtn');
    if (runBtn) runBtn.addEventListener('click', function () { var l = input.value; if (l.trim()) { history.unshift(l); execute(l); } input.value = ''; input.focus(); });
    var resetBtn = document.getElementById('pgResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', function () { engine.reset(); flags = {}; termBody.innerHTML = ''; seed(); renderCluster(); renderChallenges(); });
    var applyBtn = document.getElementById('pgApplyBtn');
    if (applyBtn) applyBtn.addEventListener('click', function () { history.unshift('kubectl apply -f -'); execute('kubectl apply -f -'); });

    function seed() {
      print('Kubernetes playground — a simulated cluster (2 nodes, namespaces: default, kube-system). Nothing here is real.', 'pg-hint-line');
      print('Try: kubectl create deployment web --image=nginx --replicas=3  →  kubectl get pods  →  kubectl expose deployment web --port=80 --type=NodePort', 'pg-hint-line');
      print('Break things: an image with "notexist" → ImagePullBackOff · kubectl run bad --image=busybox -- exit 1 → CrashLoopBackOff. Type "help".', 'pg-hint-line');
    }

    // ---- interview #try=<id> support ----
    function handleTryHash() {
      if (!qHint) return;
      var m = /try=([\w-]+)/.exec(location.hash || '');
      if (!m) { qHint.style.display = 'none'; return; }
      var data = window.STUDYHUB_INTERVIEW;
      if (!data || !data.questions) return;
      var q = data.questions.filter(function (x) { return x.id === m[1]; })[0];
      if (!q || !q.tryIt) { qHint.style.display = 'none'; return; }
      qHint.style.display = 'block';
      qHint.innerHTML = '<div class="pg-try-q"><strong>Scenario:</strong> ' + esc(q.q) + '</div>';
      if (q.tryIt.seed) { q.tryIt.seed.split('\n').forEach(function (c) { if (c.trim()) execute(c.trim()); }); }
      if (q.tryIt.starter && input) input.value = q.tryIt.starter;
    }

    seed();
    renderCluster();
    renderChallenges();
    handleTryHash();
    window.addEventListener('hashchange', handleTryHash);
    input.focus();
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initUI);
  if (typeof module !== 'undefined' && module.exports) module.exports = { createEngine: createEngine };
})();
