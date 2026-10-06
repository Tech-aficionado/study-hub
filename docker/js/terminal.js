// CLI Playground simulator — standalone module, loaded only on terminal.html

(function () {
  var termBody = document.getElementById('termBody');
  var termInput = document.getElementById('termInput');
  if (!termBody || !termInput) return;

  var simImages = [];
  var simContainers = [];

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function randId() {
    return Math.random().toString(16).slice(2, 14);
  }
  // Images are stored once with a stable ID/size so repeated "docker images" calls agree.
  function normImage(name) { return name.indexOf(':') === -1 ? name + ':latest' : name; }
  function hasImage(name) {
    var n = normImage(name);
    return simImages.some(function (im) { return im.name === n; });
  }
  function addImage(name) {
    if (hasImage(name)) return;
    simImages.push({ name: normImage(name), id: randId().slice(0, 12), size: (20 + Math.floor(Math.random() * 180)) + 'MB' });
  }
  function termPrint(cmd, output) {
    var cmdLine = document.createElement('div');
    cmdLine.className = 'term-line';
    cmdLine.innerHTML = '<span class="term-prompt">$</span><span>' + escapeHtml(cmd) + '</span>';
    termBody.appendChild(cmdLine);
    if (output !== null && output !== undefined) {
      var outLine = document.createElement('div');
      outLine.className = 'term-line';
      outLine.innerHTML = '<span class="term-out">' + escapeHtml(output) + '</span>';
      termBody.appendChild(outLine);
    }
    termBody.scrollTop = termBody.scrollHeight;
  }

  function simulate(cmdRaw) {
    var cmd = cmdRaw.trim();
    if (cmd === 'clear') { termBody.innerHTML = ''; return; }
    var parts = cmd.split(/\s+/);

    if (cmd === 'docker --help' || cmd === '--help') {
      return termPrint(cmd, "Usage: docker [COMMAND]\n\nCommon: run, ps, images, pull, build, stop, rm, rmi, exec, logs, volume, network, compose\nType 'clear' to clear the screen.");
    }
    if (parts[0] !== 'docker') {
      return termPrint(cmd, cmd + ": command not found. Try a command starting with 'docker'.");
    }
    var sub = parts[1];

    if (sub === 'run') {
      // Real argument parsing: the image is the FIRST non-flag token after "run";
      // anything after it is the command to run inside the container (e.g. "ubuntu bash").
      var flagsWithValue = ['-p', '--publish', '--name', '-e', '--env', '-v', '--volume', '--network', '--memory', '-m', '--cpus', '-w', '--workdir', '--user', '-u', '--mount', '--restart', '--tmpfs'];
      var detached = false, name = null, port = null, imageGuess = null;
      for (var i = 2; i < parts.length; i++) {
        var t = parts[i];
        if (t === '--detach' || /^-[a-z]+$/.test(t) && t.indexOf('d') !== -1) detached = true;
        if (t.indexOf('=') !== -1 && t.indexOf('-') === 0) continue;
        if (flagsWithValue.indexOf(t) !== -1) {
          var v = parts[i + 1];
          if (t === '--name') name = v;
          if (t === '-p' || t === '--publish') port = v;
          i++;
          continue;
        }
        if (t.indexOf('-') === 0) continue;
        imageGuess = t;
        break;
      }
      if (!imageGuess) return termPrint(cmd, "\"docker run\" requires at least 1 argument: an image name.");
      if (name && simContainers.some(function (c) { return c.name === name; })) {
        return termPrint(cmd, 'docker: Error response from daemon: Conflict. The container name "/' + name + '" is already in use.');
      }
      if (!name) name = 'container_' + randId().slice(0, 6);
      var id = randId();
      var alreadyLocal = hasImage(imageGuess);
      simContainers.push({ id: id, name: name, image: imageGuess, status: 'Up', port: port });
      addImage(imageGuess);
      var pullMsg = alreadyLocal ? '' : "Unable to find image '" + imageGuess + "' locally\nPulling " + imageGuess + "...\nStatus: Downloaded newer image for " + imageGuess + "\n";
      if (detached) return termPrint(cmd, pullMsg + id);
      return termPrint(cmd, pullMsg + "(running in foreground — in a real terminal press Ctrl+C to stop)");
    }
    if (sub === 'ps') {
      var showAll = parts.indexOf('-a') !== -1 || parts.indexOf('--all') !== -1;
      var visible = simContainers.filter(function (c) { return showAll || c.status === 'Up'; });
      if (visible.length === 0) return termPrint(cmd, "CONTAINER ID   IMAGE   STATUS   PORTS   NAMES\n(" + (showAll ? 'no containers' : 'no running containers — try docker ps -a') + ")");
      var out = "CONTAINER ID   IMAGE          STATUS      PORTS                  NAMES\n";
      visible.forEach(function (c) {
        out += c.id.slice(0, 12) + "   " + c.image.padEnd(13) + "  " + (c.status === 'Up' ? 'Up 2 minutes' : 'Exited (0)') + "  " + ((c.port ? ('0.0.0.0:' + c.port) : '')).padEnd(22) + " " + c.name + "\n";
      });
      return termPrint(cmd, out.trim());
    }
    if (sub === 'images') {
      if (simImages.length === 0) return termPrint(cmd, "REPOSITORY   TAG       IMAGE ID       SIZE\n(no images)");
      var out2 = "REPOSITORY        TAG       IMAGE ID       SIZE\n";
      simImages.forEach(function (img) {
        var p2 = img.name.split(':');
        out2 += p2[0].padEnd(18) + p2[1].padEnd(10) + img.id + "   " + img.size + "\n";
      });
      return termPrint(cmd, out2.trim());
    }
    if (sub === 'pull') {
      var img = parts[2];
      if (!img) return termPrint(cmd, "\"docker pull\" requires exactly 1 argument: an image name.");
      var had = hasImage(img);
      addImage(img);
      if (had) return termPrint(cmd, normImage(img).split(':')[1] + ": Pulling from library/" + img.split(':')[0] + "\nStatus: Image is up to date for " + normImage(img));
      return termPrint(cmd, normImage(img).split(':')[1] + ": Pulling from library/" + img.split(':')[0] + "\nDigest: sha256:" + randId() + randId() + "\nStatus: Downloaded newer image for " + normImage(img));
    }
    if (sub === 'build') {
      var tagMatch = cmd.match(/-t\s+(\S+)/);
      var tag = tagMatch ? tagMatch[1] : null;
      if (tag) addImage(tag);
      return termPrint(cmd, "[+] Building 4.2s (10/10) FINISHED\n => [1/4] FROM base-image\n => [2/4] WORKDIR /app\n => [3/4] COPY . .\n => [4/4] RUN build steps\n => exporting to image\n" + (tag ? " => naming to " + normImage(tag) : " => writing image (untagged — use -t name:tag to name it)"));
    }
    function findContainer(t) {
      return simContainers.filter(function (c) { return t && (c.name === t || c.id.indexOf(t) === 0); })[0];
    }
    if (sub === 'stop' || sub === 'start') {
      var target = parts[parts.length - 1];
      var c = parts.length > 2 ? findContainer(target) : null;
      if (!c) return termPrint(cmd, "Error response from daemon: No such container: " + (parts.length > 2 ? target : '(missing name)'));
      c.status = sub === 'stop' ? 'Exited' : 'Up';
      return termPrint(cmd, target);
    }
    if (sub === 'rm') {
      var force = parts.indexOf('-f') !== -1 || parts.indexOf('--force') !== -1;
      var target2 = parts[parts.length - 1];
      var c2 = parts.length > 2 ? findContainer(target2) : null;
      if (!c2) return termPrint(cmd, "Error response from daemon: No such container: " + target2);
      if (c2.status === 'Up' && !force) {
        return termPrint(cmd, "Error response from daemon: cannot remove container \"/" + c2.name + "\": container is running: stop the container before removing or force remove");
      }
      simContainers.splice(simContainers.indexOf(c2), 1);
      return termPrint(cmd, target2);
    }
    if (sub === 'rmi') {
      var target3 = parts[parts.length - 1];
      var n3 = normImage(target3);
      var im3 = simImages.filter(function (im) { return im.name === n3 || im.id.indexOf(target3) === 0; })[0];
      if (!im3) return termPrint(cmd, "Error response from daemon: No such image: " + target3);
      var inUse = simContainers.some(function (c) { return normImage(c.image) === im3.name; });
      if (inUse && parts.indexOf('-f') === -1) {
        return termPrint(cmd, "Error response from daemon: conflict: unable to remove repository reference \"" + im3.name + "\" - container is using its referenced image");
      }
      simImages.splice(simImages.indexOf(im3), 1);
      return termPrint(cmd, "Untagged: " + im3.name + "\nDeleted: sha256:" + im3.id);
    }
    if (sub === 'exec') {
      return termPrint(cmd, "root@" + randId().slice(0, 12) + ":/# (simulated shell — type exit to leave in a real terminal)");
    }
    if (sub === 'logs') {
      var target4 = parts[parts.length - 1];
      return termPrint(cmd, "[simulated log output for " + target4 + "]\n" + new Date().toISOString() + " Server started on port 80\n" + new Date().toISOString() + " Ready to accept connections");
    }
    if (sub === 'volume') {
      if (parts[2] === 'ls') return termPrint(cmd, "VOLUME NAME\n" + (simContainers.length ? "app_data\ndb_data" : "(no volumes)"));
      if (parts[2] === 'create') return termPrint(cmd, parts[3] || 'volume_' + randId().slice(0, 8));
      return termPrint(cmd, "docker volume: use 'ls' or 'create'");
    }
    if (sub === 'network') {
      if (parts[2] === 'ls') return termPrint(cmd, "NETWORK ID     NAME      DRIVER    SCOPE\n" + randId().slice(0, 12) + "   bridge    bridge    local\n" + randId().slice(0, 12) + "   host      host      local");
      return termPrint(cmd, "docker network: use 'ls'");
    }
    if (sub === 'compose') {
      if (parts[2] === 'up') return termPrint(cmd, "[+] Running 3/3\n \u2714 Network app_default      Created\n \u2714 Container app-db-1       Started\n \u2714 Container app-web-1      Started");
      if (parts[2] === 'down') return termPrint(cmd, "[+] Running 3/3\n \u2714 Container app-web-1      Removed\n \u2714 Container app-db-1       Removed\n \u2714 Network app_default      Removed");
      if (parts[2] === 'ps') return termPrint(cmd, "NAME        IMAGE     STATUS\napp-web-1   myapp     Up 2 minutes\napp-db-1    postgres  Up 2 minutes");
      return termPrint(cmd, "docker compose: try 'up', 'down', or 'ps'");
    }
    if (sub === 'stats') {
      return termPrint(cmd, "CONTAINER   CPU %   MEM USAGE   NET I/O\n" + (simContainers[0] ? simContainers[0].name : 'web') + "       2.3%    45MiB / 512MiB   1.2kB / 648B");
    }
    if (sub === '--version') {
      return termPrint(cmd, "Docker version 27.3.1, build simulated");
    }
    return termPrint(cmd, "docker: '" + sub + "' is not recognized by this simulator. Try: run, ps, ps -a, images, pull, build, start, stop, rm, rmi, exec, logs, volume ls, network ls, compose up/down/ps, stats, --help");
  }

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && termInput.value.trim() !== '') {
      simulate(termInput.value);
      termInput.value = '';
    }
  });
})();
