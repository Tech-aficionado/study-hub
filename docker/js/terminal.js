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
      var detached = cmd.indexOf('-d') !== -1;
      var nameMatch = cmd.match(/--name\s+(\S+)/);
      var portMatch = cmd.match(/-p\s+(\S+)/);
      var imageGuess = parts[parts.length - 1];
      var name = nameMatch ? nameMatch[1] : 'container_' + randId().slice(0, 6);
      var id = randId();
      simContainers.push({ id: id, name: name, image: imageGuess, status: 'Up', port: portMatch ? portMatch[1] : null });
      if (simImages.indexOf(imageGuess) === -1) simImages.push(imageGuess);
      if (detached) return termPrint(cmd, id);
      return termPrint(cmd, "Pulling " + imageGuess + "...\nStatus: Downloaded newer image for " + imageGuess + "\n(running in foreground — press Ctrl+C to simulate stop)");
    }
    if (sub === 'ps') {
      if (simContainers.length === 0) return termPrint(cmd, "CONTAINER ID   IMAGE   COMMAND   STATUS   PORTS   NAMES\n(no containers running)");
      var out = "CONTAINER ID   IMAGE          STATUS      PORTS                  NAMES\n";
      simContainers.forEach(function (c) {
        out += c.id.slice(0, 12) + "   " + c.image.padEnd(13) + "  " + (c.status === 'Up' ? 'Up 2 minutes' : 'Exited (0)') + "  " + ((c.port ? ('0.0.0.0:' + c.port) : '')).padEnd(22) + " " + c.name + "\n";
      });
      return termPrint(cmd, out.trim());
    }
    if (sub === 'images') {
      if (simImages.length === 0) return termPrint(cmd, "REPOSITORY   TAG       IMAGE ID       SIZE\n(no images)");
      var out2 = "REPOSITORY        TAG       IMAGE ID       SIZE\n";
      simImages.forEach(function (img) {
        var p2 = img.split(':');
        out2 += (p2[0] || img).padEnd(18) + (p2[1] || 'latest').padEnd(10) + randId().slice(0, 12) + "   " + (20 + Math.floor(Math.random() * 180)) + "MB\n";
      });
      return termPrint(cmd, out2.trim());
    }
    if (sub === 'pull') {
      var img = parts[2] || 'image';
      simImages.push(img);
      return termPrint(cmd, img + ": Pulling from library\nDigest: sha256:" + randId() + randId() + "\nStatus: Downloaded newer image for " + img);
    }
    if (sub === 'build') {
      var tagMatch = cmd.match(/-t\s+(\S+)/);
      var tag = tagMatch ? tagMatch[1] : 'myimage:latest';
      simImages.push(tag);
      return termPrint(cmd, "[+] Building 4.2s (10/10) FINISHED\n => [1/4] FROM base-image\n => [2/4] WORKDIR /app\n => [3/4] COPY . .\n => [4/4] RUN build steps\n => exporting to image\nSuccessfully tagged " + tag);
    }
    if (sub === 'stop') {
      var target = parts[2];
      var c = simContainers.filter(function (c) { return c.name === target || c.id.indexOf(target || '') === 0; })[0];
      if (c) { c.status = 'Exited'; return termPrint(cmd, target); }
      return termPrint(cmd, "Error: No such container: " + target);
    }
    if (sub === 'rm') {
      var target2 = parts[2];
      var idx = -1;
      simContainers.forEach(function (c, i) { if (c.name === target2 || c.id.indexOf(target2 || '') === 0) idx = i; });
      if (idx >= 0) { simContainers.splice(idx, 1); return termPrint(cmd, target2); }
      return termPrint(cmd, "Error: No such container: " + target2);
    }
    if (sub === 'rmi') {
      var target3 = parts[2];
      var idx2 = -1;
      simImages.forEach(function (i, k) { if (i === target3 || i.indexOf(target3 || '') === 0) idx2 = k; });
      if (idx2 >= 0) { simImages.splice(idx2, 1); return termPrint(cmd, "Deleted: " + target3); }
      return termPrint(cmd, "Error: No such image: " + target3);
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
    return termPrint(cmd, "docker: '" + sub + "' is not recognized by this simulator. Try: run, ps, images, pull, build, stop, rm, rmi, exec, logs, volume ls, network ls, compose up/down/ps, stats, --help");
  }

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && termInput.value.trim() !== '') {
      simulate(termInput.value);
      termInput.value = '';
    }
  });
})();
