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
    ["docker stack deploy -c compose.yml name", "Deploy a Compose file as a Swarm stack"],
    ["docker run -it ubuntu bash", "Run interactively with a TTY and open a shell"],
    ["docker run --rm alpine echo hi", "Run a one-off container and auto-remove it on exit"],
    ["docker run -d --restart unless-stopped nginx", "Run with a restart policy that survives reboots"],
    ["docker update --restart on-failure:5 web", "Change an existing container's restart policy"],
    ["docker create --name web nginx", "Create a container without starting it"],
    ["docker start / stop / restart <name>", "Start / gracefully stop / restart a container"],
    ["docker pause / unpause <name>", "Freeze / resume a container's processes"],
    ["docker kill <name>", "Send SIGKILL immediately (no grace period)"],
    ["docker rename old new", "Rename a container"],
    ["docker port <name>", "Show the published port mappings of a container"],
    ["docker top <name>", "Show the processes running inside a container"],
    ["docker diff <name>", "Show files changed in the container vs its image"],
    ["docker commit <name> img:tag", "Create an image from a container's current state"],
    ["docker attach <name>", "Attach your terminal to a running container's main process"],
    ["docker wait <name>", "Block until a container stops, then print its exit code"],
    ["docker events", "Stream real-time daemon events (create, start, die, oom)"],
    ["docker info", "Show system-wide Docker configuration and counts"],
    ["docker version", "Show client and daemon versions"],
    ["docker run -e KEY=val img", "Set an environment variable in the container"],
    ["docker run --env-file app.env img", "Load environment variables from a file"],
    ["docker run -v $(pwd):/app img", "Bind-mount the current directory into the container"],
    ["docker run --mount type=volume,src=d,dst=/data img", "Mount a volume with the explicit --mount syntax"],
    ["docker run --network mynet img", "Attach a container to a specific network"],
    ["docker network connect / disconnect net c", "Attach / detach a running container to a network"],
    ["docker network prune", "Remove all unused networks"],
    ["docker volume inspect <name>", "Show a volume's mountpoint and metadata"],
    ["docker image prune -a", "Remove all images not used by a container"],
    ["docker container prune", "Remove all stopped containers"],
    ["docker builder prune", "Remove the build cache"],
    ["docker build -f path/Dockerfile -t img .", "Build using a Dockerfile at a specific path"],
    ["docker build --no-cache -t img .", "Build ignoring the layer cache"],
    ["docker build --target stage -t img .", "Build only up to a named multi-stage target"],
    ["docker buildx build --platform linux/amd64,linux/arm64 -t img --push .", "Build and push a multi-platform image"],
    ["docker build --secret id=tok,src=tok.txt .", "Pass a build secret without baking it into a layer"],
    ["docker init", "Scaffold Dockerfile, .dockerignore and compose.yaml for a project"],
    ["docker compose up --build", "Rebuild images then start all services"],
    ["docker compose up -d --scale web=3", "Start with 3 replicas of the web service"],
    ["docker compose restart <svc>", "Restart one Compose service"],
    ["docker compose exec web sh", "Open a shell in a running Compose service"],
    ["docker compose config", "Validate and print the resolved compose configuration"],
    ["docker run --health-cmd='curl -f localhost || exit 1' img", "Set a healthcheck at run time"],
    ["docker run --memory=512m --cpus=1.5 img", "Limit a container's memory and CPU"],
    ["docker run --read-only --tmpfs /tmp img", "Run with a read-only rootfs plus a writable tmpfs"],
    ["docker run --cap-drop ALL --cap-add NET_BIND_SERVICE img", "Drop all capabilities, add back only what's needed"],
    ["docker run -u 1000:1000 img", "Run as a specific non-root user/group"],
    ["docker run --log-opt max-size=10m --log-opt max-file=3 img", "Cap log file size with rotation"],
    ["docker scout quickview <image>", "Quick vulnerability/overview summary for an image"],
    ["docker image inspect img", "Show low-level JSON metadata for an image"],
    ["docker manifest inspect img", "Inspect a multi-arch manifest list"]
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
