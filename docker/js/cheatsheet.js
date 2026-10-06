// Command cheatsheet — standalone module, loaded only on cheatsheet.html

(function () {
  var commands = [
    ["docker run -d -p 8080:80 nginx", "Run a container detached, mapping host port 8080 to container port 80"],
    ["docker ps / docker ps -a", "List running / all containers"],
    ["docker stop <name>", "Gracefully stop a running container"],
    ["docker rm <name>", "Remove a stopped container"],
    ["docker rm -f <name>", "Force stop and remove a container"],
    ["docker images", "List local images"],
    ["docker pull <image>", "Download an image from a registry"],
    ["docker build -t name:tag .", "Build an image from a Dockerfile in current directory"],
    ["docker rmi <image>", "Remove a local image"],
    ["docker exec -it <name> bash", "Open an interactive shell inside a running container"],
    ["docker logs -f <name>", "Stream logs from a container"],
    ["docker inspect <name>", "Full JSON metadata about a container/image"],
    ["docker history <image>", "Show the layer history of an image"],
    ["docker tag src:tag dest:tag", "Create an additional tag for an image"],
    ["docker push user/image:tag", "Push an image to a registry"],
    ["docker login", "Authenticate to a registry"],
    ["docker volume create <name>", "Create a named volume"],
    ["docker volume ls / rm / prune", "List / remove / clean up volumes"],
    ["docker network create <name>", "Create a custom bridge network"],
    ["docker network ls / inspect", "List / inspect networks"],
    ["docker compose up -d", "Start all services defined in docker-compose.yml, detached"],
    ["docker compose down -v", "Stop and remove containers, networks, and volumes"],
    ["docker compose logs -f <svc>", "Follow logs for one Compose service"],
    ["docker system df", "Show disk usage by images/containers/volumes"],
    ["docker system prune -a --volumes", "Remove ALL unused images, containers, networks, volumes"],
    ["docker stats", "Live CPU/memory/network stats for running containers"],
    ["docker cp <container>:/path ./local", "Copy files out of a container to the host"],
    ["docker save -o out.tar image:tag", "Export an image to a tar archive"],
    ["docker load -i out.tar", "Import an image from a tar archive"],
    ["docker scout cves <image>", "Scan an image for known vulnerabilities"],
    ["docker swarm init", "Initialize a Swarm cluster on this node"],
    ["docker service create --replicas N", "Create a replicated service in Swarm"],
    ["docker stack deploy -c compose.yml name", "Deploy a Compose file as a Swarm stack"]
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
