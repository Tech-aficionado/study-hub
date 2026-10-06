// Docker interview questions — data for the shared renderer (../js/interview.js).
// Every answer is written here from scratch and grounded in the official Docker
// docs. Every source URL was confirmed reachable while building this page.
//
// Source honesty (reported in full in the build report):
//  - HackerRank: the two public Docker skills-directory pages (basic + intermediate)
//    were fetched and their competency lists match the questions tagged to them.
//  - Docker docs: deep links taken from pages fetched during the build.
//  - LeetCode / HackerEarth: neither hosts Docker-specific material — LeetCode is an
//    algorithms judge (no Docker track) and HackerEarth's Docker pages 404 — so no
//    question is falsely attributed to them. Remaining questions cite official docs
//    or reputable, confirmed prep pages, labelled by their true site.
window.STUDYHUB_INTERVIEW = {
  topic: 'docker',
  playground: 'terminal.html',
  questions: [
    // ===================== EASY / CONCEPT =====================
    {
      id: 'docker-q1', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is Docker and what core problem does it solve?',
      answer: '<p>Docker is a platform for packaging an application together with <strong>everything it needs to run</strong> — code, runtime, system libraries and configuration — into a single portable unit called a <strong>container</strong>.</p><p>The problem it solves is environment drift: the classic <em>"it works on my machine"</em> failure, where an app runs on a laptop but breaks on a teammate\'s machine or in production because of a different OS, a missing library, or a config mismatch. Because the container carries its own environment, it behaves identically everywhere Docker runs.</p>',
      source: { site: 'HackerRank', label: 'Docker (Basic) — skills directory', url: 'https://www.hackerrank.com/skills-directory/docker_basic' }
    },
    {
      id: 'docker-q2', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is the difference between an image and a container?',
      answer: '<p>An <strong>image</strong> is a read-only template — a frozen snapshot of a filesystem plus metadata (default command, env, ports). It does nothing on its own.</p><p>A <strong>container</strong> is a running (or stopped) <em>instance</em> of an image, with a thin writable layer on top. One image can start many containers.</p><p>Analogy: the image is the blueprint (or a class); a container is the house built from it (or an object instance).</p>',
      source: { site: 'HackerRank', label: 'Docker (Basic) — Docker Images', url: 'https://www.hackerrank.com/skills-directory/docker_basic' }
    },
    {
      id: 'docker-q3', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'How do containers differ from virtual machines?',
      answer: '<p>A <strong>VM</strong> virtualises hardware and boots a full guest operating system (its own kernel), so it is heavy (gigabytes) and slow to start (minutes).</p><p>A <strong>container</strong> shares the host\'s single OS kernel and isolates only the process and its filesystem using Linux namespaces and cgroups. It is lightweight (megabytes) and starts in milliseconds.</p><p>Trade-off: VMs give stronger isolation (separate kernels); containers give density and speed.</p>',
      source: { site: 'DataCamp', label: 'Docker Interview Questions', url: 'https://www.datacamp.com/blog/docker-interview-questions' }
    },
    {
      id: 'docker-q4', level: 'easy', category: 'Images & Layers', type: 'concept',
      q: 'What is a Dockerfile?',
      answer: '<p>A <strong>Dockerfile</strong> is a plain-text recipe listing the steps to assemble an image: which base image to start from (<code>FROM</code>), what to copy in (<code>COPY</code>), what to install (<code>RUN</code>), and what to run when a container starts (<code>CMD</code>/<code>ENTRYPOINT</code>).</p><pre><code>FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]</code></pre><p>You turn it into an image with <code>docker build -t myapp:1.0 .</code></p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q5', level: 'easy', category: 'Images & Layers', type: 'concept',
      q: 'What are image layers and why do they matter?',
      answer: '<p>Each instruction in a Dockerfile that changes the filesystem (<code>FROM</code>, <code>RUN</code>, <code>COPY</code>, <code>ADD</code>) creates a new read-only <strong>layer</strong>. Layers stack to form the image.</p><p>Two payoffs:</p><ul><li><strong>Caching</strong> — if a layer\'s inputs are unchanged, Docker reuses the cached layer and skips rebuilding it, so builds are fast.</li><li><strong>Sharing</strong> — layers are content-addressed, so many images sharing the same base store it on disk and pull it over the network only once.</li></ul><p>Instructions like <code>WORKDIR</code>, <code>ENV</code> and <code>EXPOSE</code> add metadata only, not a filesystem layer.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — overview', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q6', level: 'easy', category: 'CLI Basics', type: 'coding',
      q: 'Write the command to run an nginx container in the background, mapping host port 8080 to container port 80, named "web".',
      answer: '<pre><code>docker run -d -p 8080:80 --name web nginx</code></pre><p><code>-d</code> detaches (runs in the background and prints the container ID), <code>-p 8080:80</code> publishes host port 8080 to container port 80 (the format is always <code>HOST:CONTAINER</code>), and <code>--name web</code> gives it a stable name instead of a random one.</p>',
      source: { site: 'HackerRank', label: 'Docker (Basic) — Running applications with Docker', url: 'https://www.hackerrank.com/skills-directory/docker_basic' },
      tryIt: { setup: [], starter: 'docker run -d -p 8080:80 --name web nginx' }
    },
    {
      id: 'docker-q7', level: 'easy', category: 'CLI Basics', type: 'coding',
      q: 'What is the difference between `docker ps` and `docker ps -a`?',
      answer: '<p><code>docker ps</code> lists only <strong>running</strong> containers.</p><p><code>docker ps -a</code> (or <code>--all</code>) lists <strong>every</strong> container, including stopped and exited ones. A container that has exited vanishes from plain <code>docker ps</code> but is still there — <code>-a</code> is how you find it to inspect its exit code or remove it.</p>',
      source: { site: 'HackerRank', label: 'Docker (Intermediate) — Basic DevOps', url: 'https://www.hackerrank.com/skills-directory/docker_intermediate' },
      tryIt: { setup: ['docker run -d --name web nginx', 'docker run -d --name old alpine', 'docker stop old'], starter: 'docker ps -a' }
    },
    {
      id: 'docker-q8', level: 'easy', category: 'CLI Basics', type: 'concept',
      q: 'How do you stop, start and remove a container?',
      answer: '<ul><li><code>docker stop &lt;name&gt;</code> — sends SIGTERM, then SIGKILL after a grace period (default 10s). Graceful.</li><li><code>docker start &lt;name&gt;</code> — restarts a stopped container, keeping its data and config.</li><li><code>docker rm &lt;name&gt;</code> — deletes a <em>stopped</em> container. It refuses a running one unless you add <code>-f</code> (force), which kills then removes it.</li></ul><p><code>docker kill</code> is the hard stop — it sends SIGKILL immediately (no grace period).</p>',
      source: { site: 'Docker docs', label: 'Start containers automatically', url: 'https://docs.docker.com/engine/containers/start-containers-automatically/' },
      tryIt: { setup: ['docker run -d --name web nginx'], starter: 'docker stop web' }
    },
    {
      id: 'docker-q9', level: 'easy', category: 'Registries', type: 'concept',
      q: 'What is Docker Hub, and what do pull/push do?',
      answer: '<p><strong>Docker Hub</strong> is the default public registry — a hosted library of images.</p><ul><li><code>docker pull nginx</code> downloads an image from the registry to your machine.</li><li><code>docker push user/myapp:1.0</code> uploads your image to a repository you own (after <code>docker login</code>).</li></ul><p>If you <code>docker run</code> an image you don\'t have locally, Docker pulls it automatically first.</p>',
      source: { site: 'HackerRank', label: 'Docker (Basic) — Deploying images to a Docker Registry', url: 'https://www.hackerrank.com/skills-directory/docker_basic' }
    },
    {
      id: 'docker-q10', level: 'easy', category: 'Images & Layers', type: 'concept',
      q: 'What does the :latest tag mean and why avoid it in production?',
      answer: '<p><code>:latest</code> is just the default tag Docker assumes when you omit one — it is <strong>not</strong> a promise of "newest" or "stable". It is a moving pointer: whoever publishes the repo can repoint <code>:latest</code> at any time.</p><p>Relying on it makes builds <strong>non-reproducible</strong> — the same Dockerfile can produce different images on different days, and a redeploy can silently pull a changed base. In production, pin an explicit version (<code>nginx:1.27.1</code>) or, for full immutability, a digest (<code>nginx@sha256:...</code>).</p>',
      source: { site: 'KodeKloud', label: 'Docker Interview Questions', url: 'https://kodekloud.com/blog/docker-interview-questions/' }
    },

    // ===================== MEDIUM / CONCEPT & CODING =====================
    {
      id: 'docker-q11', level: 'medium', category: 'Images & Layers', type: 'concept',
      q: 'Explain the difference between CMD and ENTRYPOINT.',
      answer: '<p>Both define what runs when a container starts, but they combine differently:</p><ul><li><strong>ENTRYPOINT</strong> is the fixed executable. In exec form it is <em>not</em> overridden by <code>docker run</code> arguments — those are appended as arguments to it.</li><li><strong>CMD</strong> supplies <em>default arguments</em> (or a default command). It <em>is</em> overridden when the user passes arguments to <code>docker run</code>.</li></ul><p>With <code>ENTRYPOINT ["python"]</code> and <code>CMD ["app.py"]</code>: <code>docker run img</code> runs <code>python app.py</code>, while <code>docker run img other.py</code> runs <code>python other.py</code> (the CMD default is replaced, the ENTRYPOINT stays). Use the exec form for both so your process is PID 1 and receives signals like SIGTERM from <code>docker stop</code>.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — CMD / ENTRYPOINT interaction', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q12', level: 'medium', category: 'Storage', type: 'concept',
      q: 'Compare volumes, bind mounts and tmpfs mounts. When would you use each?',
      answer: '<table><thead><tr><th>Type</th><th>Where it lives</th><th>Use for</th></tr></thead><tbody><tr><td><strong>Named volume</strong></td><td>Docker-managed area on the host (<code>/var/lib/docker/volumes</code>)</td><td>Persistent app data (databases). Portable, backup-friendly, the default choice.</td></tr><tr><td><strong>Bind mount</strong></td><td>Any exact path on the host you choose</td><td>Live source code in development (edit on host, see it in the container).</td></tr><tr><td><strong>tmpfs</strong></td><td>Host RAM only — never written to disk</td><td>Secrets or scratch data that must not persist.</td></tr></tbody></table><p>Key point: a container\'s own writable layer is lost when the container is removed, so anything you must keep goes in a volume.</p>',
      source: { site: 'Docker docs', label: 'Engine storage — volumes', url: 'https://docs.docker.com/engine/storage/volumes/' }
    },
    {
      id: 'docker-q13', level: 'medium', category: 'Storage', type: 'coding',
      q: 'How do you create a named volume and mount it into a container?',
      answer: '<pre><code>docker volume create db_data\ndocker run -d --name db -v db_data:/var/lib/postgresql/data postgres</code></pre><p>The <code>-v NAME:PATH</code> syntax mounts volume <code>db_data</code> at the given path inside the container. The newer, more explicit form is <code>--mount source=db_data,target=/var/lib/postgresql/data</code>. Inspect with <code>docker volume inspect db_data</code>; list with <code>docker volume ls</code>; reclaim unused ones with <code>docker volume prune</code>.</p>',
      source: { site: 'Docker docs', label: 'Engine storage — volumes', url: 'https://docs.docker.com/engine/storage/volumes/' },
      tryIt: { setup: [], starter: 'docker volume create db_data' }
    },
    {
      id: 'docker-q14', level: 'medium', category: 'Networking', type: 'concept',
      q: 'Name the built-in Docker network drivers and what each does.',
      answer: '<ul><li><strong>bridge</strong> (default) — a private virtual switch on the host; containers get an internal IP and can reach each other.</li><li><strong>host</strong> — no network isolation; the container shares the host\'s network stack directly (no port mapping needed).</li><li><strong>none</strong> — networking fully disabled.</li><li><strong>overlay</strong> — spans multiple Docker hosts; used by Swarm so containers on different machines share a network.</li><li><strong>macvlan</strong> — gives the container its own MAC address so it appears as a physical device on the LAN.</li><li><strong>ipvlan</strong> — like macvlan but shares the host\'s MAC, giving L2/L3 control.</li></ul>',
      source: { site: 'Docker docs', label: 'Engine network drivers', url: 'https://docs.docker.com/engine/network/drivers/' }
    },
    {
      id: 'docker-q15', level: 'medium', category: 'Networking', type: 'scenario',
      q: 'Two containers need to talk by name. Why does a user-defined bridge work but the default bridge does not?',
      answer: '<p>A <strong>user-defined bridge network</strong> runs Docker\'s embedded DNS server, so a container can reach another by its <strong>container name</strong> — Docker resolves the name to the current IP automatically. This is the recommended pattern.</p><p>The <strong>default</strong> <code>bridge</code> network has <em>no</em> automatic DNS for names; containers there can only reach each other by IP address (or the deprecated <code>--link</code>).</p><pre><code>docker network create appnet\ndocker run -d --name db --network appnet postgres\ndocker run -d --name api --network appnet myapi\n# inside api:  ping db   → resolves, because appnet is user-defined</code></pre>',
      source: { site: 'Docker docs', label: 'Bridge network driver', url: 'https://docs.docker.com/engine/network/drivers/bridge/' },
      tryIt: { setup: ['docker network create appnet', 'docker run -d --name db --network appnet postgres', 'docker run -d --name api --network appnet node'], starter: 'docker exec api ping db' }
    },
    {
      id: 'docker-q16', level: 'medium', category: 'Networking', type: 'coding',
      q: 'How do you publish a port, and what does `-p 127.0.0.1:8080:80` restrict?',
      answer: '<p><code>docker run -p 8080:80 nginx</code> maps host port 8080 to container port 80 (format <code>HOST:CONTAINER</code>). Flipping the two is the most common "why can\'t I reach my app" bug.</p><p><code>-p 127.0.0.1:8080:80</code> binds the published port only to the host\'s loopback interface, so the service is reachable from the host itself but <strong>not</strong> from other machines on the network — a simple way to keep an internal service private.</p><p><code>-P</code> (capital) publishes every <code>EXPOSE</code>d port to a random free host port.</p>',
      source: { site: 'Docker docs', label: 'Port publishing and mapping', url: 'https://docs.docker.com/engine/network/' }
    },
    {
      id: 'docker-q17', level: 'medium', category: 'Compose', type: 'concept',
      q: 'What is Docker Compose and what problem does it solve?',
      answer: '<p>Compose lets you define a multi-container application declaratively in one <code>compose.yaml</code> file — services, images, ports, volumes, networks, environment and dependencies — instead of typing many long <code>docker run</code> commands.</p><p>One command, <code>docker compose up</code>, then creates the network and starts every service; <code>docker compose down</code> tears it all back down. It is the standard way to run an app plus its database and cache together in development.</p>',
      source: { site: 'Docker docs', label: 'Docker Compose', url: 'https://docs.docker.com/compose/' }
    },
    {
      id: 'docker-q18', level: 'medium', category: 'Compose', type: 'coding',
      q: 'Write a compose.yaml with a web service built from a Dockerfile and a postgres database it depends on.',
      answer: '<pre><code>services:\n  web:\n    build: .\n    ports:\n      - "8080:80"\n    environment:\n      - DATABASE_URL=postgres://db:5432/app\n    depends_on:\n      - db\n  db:\n    image: postgres:16\n    environment:\n      - POSTGRES_PASSWORD=secret\n    volumes:\n      - db_data:/var/lib/postgresql/data\nvolumes:\n  db_data:</code></pre><p><code>build: .</code> builds <code>web</code> from the local Dockerfile; <code>image:</code> pulls a ready image for <code>db</code>. Compose puts both on a shared default network, so <code>web</code> reaches the database at the hostname <code>db</code>. <code>depends_on</code> controls start order (not readiness — pair it with a healthcheck for that). The named volume <code>db_data</code> persists the database.</p>',
      source: { site: 'Docker docs', label: 'Compose file reference — services', url: 'https://docs.docker.com/reference/compose-file/services/' },
      tryIt: { setup: [], starter: 'docker compose up' }
    },
    {
      id: 'docker-q19', level: 'medium', category: 'Images & Layers', type: 'scenario',
      q: 'Your image is 1.2 GB for a 10 MB Go binary. How do you shrink it?',
      answer: '<p>The image is carrying the whole build toolchain. Use a <strong>multi-stage build</strong>: compile in a fat builder stage, then copy only the finished binary into a tiny final stage.</p><pre><code>FROM golang:1.22 AS build\nWORKDIR /src\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /app ./cmd\n\nFROM scratch\nCOPY --from=build /app /app\nENTRYPOINT ["/app"]</code></pre><p>The final image contains just the static binary — a few MB. Other levers: a slim/alpine base, combining <code>RUN</code> steps and cleaning package caches in the same layer, and a good <code>.dockerignore</code> so the build context stays small.</p>',
      source: { site: 'Docker docs', label: 'Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' }
    },
    {
      id: 'docker-q20', level: 'medium', category: 'CLI Basics', type: 'coding',
      q: 'How do you get an interactive shell inside a running container, and view its logs?',
      answer: '<pre><code>docker exec -it web sh        # or bash if the image has it\ndocker logs web               # print collected stdout/stderr\ndocker logs -f web            # follow (stream) new output</code></pre><p><code>exec</code> runs a new process inside an <strong>already-running</strong> container — it fails on a stopped one. <code>-it</code> gives an interactive TTY. <code>docker logs</code> reads whatever the container\'s main process wrote to stdout/stderr, which is why apps in containers should log to stdout rather than to files.</p>',
      source: { site: 'HackerRank', label: 'Docker (Intermediate) — Running Multiple Services', url: 'https://www.hackerrank.com/skills-directory/docker_intermediate' },
      tryIt: { setup: ['docker run -d --name web nginx'], starter: 'docker exec -it web sh' }
    },
    {
      id: 'docker-q21', level: 'medium', category: 'Images & Layers', type: 'concept',
      q: 'What is the difference between COPY and ADD?',
      answer: '<p><code>COPY</code> copies local files/directories from the build context into the image. That is all it does — predictable and preferred.</p><p><code>ADD</code> does the same but with two extra behaviours: it can fetch a remote URL, and it <strong>auto-extracts</strong> a local tar archive into the destination. Those surprises are why best practice is: use <code>COPY</code> by default, and reach for <code>ADD</code> only when you specifically want tar auto-extraction.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — ADD / COPY', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q22', level: 'medium', category: 'Images & Layers', type: 'scenario',
      q: 'Rebuilds re-run `npm install` every time even when only source changed. How do you fix the layer ordering?',
      answer: '<p>Order instructions from <strong>least-frequently-changed to most</strong>, so the cache survives. Copy the dependency manifest and install <em>before</em> copying the rest of the source:</p><pre><code>COPY package*.json ./\nRUN npm ci\nCOPY . .</code></pre><p>Now editing a source file only busts the final <code>COPY . .</code> layer; the <code>npm ci</code> layer stays cached as long as <code>package*.json</code> is unchanged. If you copy everything first, any source edit invalidates the install layer and reinstalls needlessly.</p>',
      source: { site: 'Docker docs', label: 'Building best practices', url: 'https://docs.docker.com/build/building/best-practices/' }
    },
    {
      id: 'docker-q23', level: 'medium', category: 'Reliability', type: 'coding',
      q: 'What are the four restart policies and when do you use each?',
      answer: '<table><thead><tr><th>Policy</th><th>Behaviour</th></tr></thead><tbody><tr><td><code>no</code></td><td>Never restart automatically (default).</td></tr><tr><td><code>on-failure[:N]</code></td><td>Restart only on a non-zero exit; optional max retry count.</td></tr><tr><td><code>always</code></td><td>Always restart; also starts on daemon restart. A manual stop keeps it down until the daemon restarts.</td></tr><tr><td><code>unless-stopped</code></td><td>Like <code>always</code>, but a manual stop stays stopped even across daemon restarts.</td></tr></tbody></table><pre><code>docker run -d --restart unless-stopped --name redis redis\ndocker update --restart on-failure:5 web   # change it later</code></pre><p>A restart policy only kicks in after the container has run successfully for at least 10 seconds, which prevents a crash-loop on a container that never starts.</p>',
      source: { site: 'Docker docs', label: 'Start containers automatically — restart policies', url: 'https://docs.docker.com/engine/containers/start-containers-automatically/' },
      tryIt: { setup: [], starter: 'docker run -d --restart unless-stopped --name redis redis' }
    },
    {
      id: 'docker-q24', level: 'medium', category: 'Reliability', type: 'concept',
      q: 'What does a HEALTHCHECK do and what are its states?',
      answer: '<p><code>HEALTHCHECK</code> tells Docker a command to run periodically to test whether the container is actually working — catching a server stuck in a loop even though its process is still alive.</p><pre><code>HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD curl -f http://localhost/ || exit 1</code></pre><p>The command\'s exit code is the verdict: <strong>0 = healthy</strong>, <strong>1 = unhealthy</strong> (2 is reserved). The status starts as <code>starting</code>, becomes <code>healthy</code> on a pass, and flips to <code>unhealthy</code> after <code>--retries</code> consecutive failures. Defaults: interval 30s, timeout 30s, retries 3, start-period 0s. See the status with <code>docker ps</code> or <code>docker inspect</code>.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — HEALTHCHECK', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q25', level: 'medium', category: 'CLI Basics', type: 'coding',
      q: 'What does `docker tag` do, and how is it different from building a new image?',
      answer: '<p><code>docker tag</code> adds another name/tag that points at an <strong>existing</strong> image ID — it creates no new content and copies no bytes. It is how you give an image a registry-qualified name before pushing:</p><pre><code>docker tag myapp:1.0 registry.example.com/team/myapp:1.0\ndocker push registry.example.com/team/myapp:1.0</code></pre><p>Both tags share the same image ID, so <code>docker images</code> shows two rows with identical IDs. Building (<code>docker build</code>) actually produces new layers; tagging just relabels.</p>',
      source: { site: 'HackerRank', label: 'Docker (Intermediate) — Tags and Labels', url: 'https://www.hackerrank.com/skills-directory/docker_intermediate' },
      tryIt: { setup: ['docker pull nginx'], starter: 'docker tag nginx:latest registry.example.com/team/nginx:1.0' }
    },
    {
      id: 'docker-q26', level: 'medium', category: 'Storage', type: 'scenario',
      q: 'A teammate says "my container lost all its data after a redeploy." What happened and how do you prevent it?',
      answer: '<p>Data written inside the container\'s own writable layer is destroyed when that container is removed — and a redeploy removes the old container and creates a new one. Nothing was persisted.</p><p>Fix: store stateful data in a <strong>named volume</strong> (or a bind mount) so it lives outside the container lifecycle.</p><pre><code>docker run -d -v db_data:/var/lib/postgresql/data postgres</code></pre><p>Now a redeploy mounts the same <code>db_data</code> volume into the fresh container and the data is intact. In Compose, declare it under <code>volumes:</code>.</p>',
      source: { site: 'Docker docs', label: 'Engine storage — volumes', url: 'https://docs.docker.com/engine/storage/volumes/' }
    },
    {
      id: 'docker-q27', level: 'medium', category: 'Images & Layers', type: 'concept',
      q: 'What is a .dockerignore file and why does it matter?',
      answer: '<p><code>.dockerignore</code> lists paths excluded from the <strong>build context</strong> — the files sent to the daemon when you run <code>docker build</code>. It works like <code>.gitignore</code>.</p><p>Why it matters: without it, a <code>COPY . .</code> can drag in <code>node_modules</code>, <code>.git</code>, local secrets and build artifacts — bloating the context (slow builds), busting the cache, and leaking files into the image. A good <code>.dockerignore</code> keeps the context lean and builds reproducible.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — .dockerignore', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q28', level: 'medium', category: 'CLI Basics', type: 'coding',
      q: 'How do you reclaim disk space used by Docker?',
      answer: '<pre><code>docker system df                 # show what is using space\ndocker system prune              # remove stopped containers, unused networks, dangling images, build cache\ndocker system prune -a --volumes # also remove unused images AND unused volumes</code></pre><p><code>docker system df</code> breaks usage down by images, containers, volumes and build cache. Be careful with <code>-a --volumes</code> — it deletes <em>all</em> images not used by a container and <em>all</em> unused volumes, which can wipe data you meant to keep.</p>',
      source: { site: 'Docker docs', label: 'Prune unused Docker objects', url: 'https://docs.docker.com/engine/manage-resources/pruning/' },
      tryIt: { setup: ['docker run -d --name web nginx', 'docker run -d --name old alpine', 'docker stop old'], starter: 'docker system df' }
    },
    {
      id: 'docker-q29', level: 'medium', category: 'Compose', type: 'concept',
      q: 'In Compose, what is the difference between depends_on and a healthcheck-based condition?',
      answer: '<p><code>depends_on</code> alone only controls <strong>start order</strong> — Compose starts <code>db</code> before <code>web</code>, but "started" is not "ready". The database process may still be initialising when <code>web</code> tries to connect.</p><p>To wait for actual readiness, give the dependency a <strong>healthcheck</strong> and depend on its condition:</p><pre><code>services:\n  db:\n    image: postgres:16\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n  web:\n    depends_on:\n      db:\n        condition: service_healthy</code></pre>',
      source: { site: 'Docker docs', label: 'Compose — control startup order', url: 'https://docs.docker.com/compose/how-tos/startup-order/' }
    },
    {
      id: 'docker-q30', level: 'medium', category: 'Reliability', type: 'coding',
      q: 'How do you inspect low-level details of a container, and read a specific field?',
      answer: '<p><code>docker inspect &lt;name&gt;</code> returns a JSON array with the full configuration and runtime state — image, state, mounts, networks, restart policy, env. To pull one field, use a Go-template with <code>--format</code>:</p><pre><code>docker inspect web\ndocker inspect -f \'{{.State.Status}}\' web\ndocker inspect -f \'{{.NetworkSettings.IPAddress}}\' web</code></pre><p><code>inspect</code> also works on images, networks and volumes, so it is the go-to tool when something behaves unexpectedly.</p>',
      source: { site: 'Docker docs', label: 'Reference — docker inspect', url: 'https://docs.docker.com/reference/cli/docker/inspect/' },
      tryIt: { setup: ['docker run -d -p 8080:80 --name web nginx'], starter: 'docker inspect web' }
    },

    // ===================== HARD / ADVANCED =====================
    {
      id: 'docker-q31', level: 'hard', category: 'Architecture', type: 'concept',
      q: 'How does Docker achieve isolation under the hood?',
      answer: '<p>Containers are ordinary Linux processes made to look isolated by three kernel features:</p><ul><li><strong>Namespaces</strong> give each container its own view of a resource: PID (own process tree), NET (own interfaces), MNT (own filesystem mounts), UTS (own hostname), IPC, and USER.</li><li><strong>cgroups</strong> (control groups) limit and account for resource usage — CPU, memory, block I/O — so one container can\'t starve the host.</li><li><strong>Union filesystems</strong> (overlay2) stack the image\'s read-only layers plus a thin writable layer per container, enabling copy-on-write.</li></ul><p>There is no guest kernel — every container shares the host kernel, which is why containers are light but also why kernel-level isolation is weaker than a VM\'s.</p>',
      source: { site: 'Docker docs', label: 'Engine — storage drivers (overlayfs)', url: 'https://docs.docker.com/engine/storage/drivers/' }
    },
    {
      id: 'docker-q32', level: 'hard', category: 'Security', type: 'scenario',
      q: 'Why is mounting /var/run/docker.sock into a container dangerous?',
      answer: '<p>The Docker socket is the daemon\'s control API, and the daemon runs as <strong>root</strong> on the host. A container with the socket mounted can tell the daemon to start a new container that bind-mounts the host\'s <code>/</code> as read-write — giving it full root control of the host. It is effectively a container-escape / privilege-escalation primitive.</p><p>Mitigations: avoid mounting it; if a tool genuinely needs the API, use a socket proxy that allows only specific read-only endpoints, or rootless Docker. Treat "mount docker.sock" in any image as a red flag during review.</p>',
      source: { site: 'Docker docs', label: 'Protect the Docker daemon socket', url: 'https://docs.docker.com/engine/security/protect-access/' }
    },
    {
      id: 'docker-q33', level: 'hard', category: 'Security', type: 'concept',
      q: 'List several practices for hardening a production image and runtime.',
      answer: '<ul><li><strong>Run as non-root</strong> — add a <code>USER</code> instruction; many base images default to root.</li><li><strong>Minimal base</strong> — distroless/alpine/scratch shrinks the attack surface and CVE count.</li><li><strong>Pin versions / use digests</strong> for reproducibility.</li><li><strong>Drop capabilities</strong> — <code>--cap-drop ALL</code> then add back only what\'s needed; use <code>--read-only</code> rootfs with explicit tmpfs.</li><li><strong>No secrets in layers</strong> — use build secrets (<code>RUN --mount=type=secret</code>) or runtime secrets, never <code>ENV</code>/<code>ARG</code> for passwords.</li><li><strong>Scan images</strong> — <code>docker scout cves</code> or Trivy in CI.</li><li><strong>Set a HEALTHCHECK</strong> and resource limits (<code>--memory</code>, <code>--cpus</code>).</li></ul>',
      source: { site: 'Docker docs', label: 'Build — secrets', url: 'https://docs.docker.com/build/building/secrets/' }
    },
    {
      id: 'docker-q34', level: 'hard', category: 'Build', type: 'concept',
      q: 'What is buildx and how do you build a multi-platform image?',
      answer: '<p><code>docker buildx</code> is the extended builder powered by <strong>BuildKit</strong>. Among other things it builds a single image that works on multiple CPU architectures (amd64, arm64) using QEMU emulation or native nodes, producing a multi-arch manifest list.</p><pre><code>docker buildx create --use\ndocker buildx build --platform linux/amd64,linux/arm64 \\\n  -t user/myapp:1.0 --push .</code></pre><p>Consumers pulling <code>user/myapp:1.0</code> automatically get the variant matching their architecture. BuildKit also brings parallel stage builds, better caching, and <code>RUN --mount</code> for cache/secret mounts.</p>',
      source: { site: 'Docker docs', label: 'Build — multi-platform images', url: 'https://docs.docker.com/build/building/multi-platform/' }
    },
    {
      id: 'docker-q35', level: 'hard', category: 'Reliability', type: 'scenario',
      q: 'A container catches SIGTERM too late and docker stop takes the full 10s then SIGKILLs it. Why, and how do you fix it?',
      answer: '<p>Almost always the process is not PID 1. If the Dockerfile uses the <strong>shell form</strong> (<code>CMD npm start</code>), the command runs under <code>/bin/sh -c</code>, so the shell is PID 1 and does not forward signals to your app — the app never sees SIGTERM and <code>docker stop</code> falls back to SIGKILL after the grace period.</p><p>Fixes: use the <strong>exec form</strong> (<code>CMD ["node","server.js"]</code>) so your process is PID 1 and receives signals; or add a tiny init with <code>--init</code> (tini) to reap zombies and forward signals; and handle SIGTERM in the app to shut down gracefully.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — ENTRYPOINT / signals', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q36', level: 'hard', category: 'Architecture', type: 'concept',
      q: 'What is the difference between Docker Engine and Docker Desktop?',
      answer: '<p><strong>Docker Engine</strong> is the core: the <code>dockerd</code> daemon, containerd, runc and the CLI. It runs natively on Linux and is what powers servers and CI.</p><p><strong>Docker Desktop</strong> is a developer product for macOS, Windows and Linux. Because containers need a Linux kernel, on Mac/Windows Desktop runs the Engine inside a lightweight Linux VM and adds a GUI, Kubernetes, a VPN-friendly network, volume sharing, and extensions. On Windows it uses WSL2 as that Linux backend. Desktop requires a paid license for larger companies; Engine is open source.</p>',
      source: { site: 'Docker docs', label: 'Docker Engine install', url: 'https://docs.docker.com/engine/install/' }
    },
    {
      id: 'docker-q37', level: 'hard', category: 'Networking', type: 'scenario',
      q: 'A web container can curl the database by IP but not by name. Walk through the diagnosis.',
      answer: '<p>IP works, name fails ⇒ a DNS resolution problem, not connectivity.</p><ol><li>Check which network each container is on: <code>docker inspect -f \'{{json .NetworkSettings.Networks}}\' web</code>. If they share only the <strong>default</strong> <code>bridge</code>, there is no name DNS there — that is the cause.</li><li>Confirm the target name/alias actually exists on a <strong>user-defined</strong> network (<code>docker network inspect appnet</code>).</li><li>Fix: put both on the same user-defined network (<code>docker network connect appnet web</code>), and connect by the container\'s name or network alias.</li></ol><p>Also verify you are using the service/container name, not a stale IP, since IPs change across restarts.</p>',
      source: { site: 'Docker docs', label: 'Bridge network driver', url: 'https://docs.docker.com/engine/network/drivers/bridge/' }
    },
    {
      id: 'docker-q38', level: 'hard', category: 'Security', type: 'coding',
      q: 'How do you pass a secret to a build without baking it into an image layer?',
      answer: '<p>Never use <code>ARG</code>/<code>ENV</code> for secrets — they persist in the image history. Use BuildKit\'s secret mount, which exposes the value only during one <code>RUN</code> and never writes it to a layer:</p><pre><code># Dockerfile\nRUN --mount=type=secret,id=npmtoken \\\n    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci</code></pre><pre><code># build\nDOCKER_BUILDKIT=1 docker build \\\n  --secret id=npmtoken,src=./npm_token.txt -t myapp .</code></pre><p>For runtime secrets, use Swarm/Compose secrets or an external secrets manager, injected as mounted files rather than env vars.</p>',
      source: { site: 'Docker docs', label: 'Build — secrets', url: 'https://docs.docker.com/build/building/secrets/' }
    },
    {
      id: 'docker-q39', level: 'hard', category: 'Orchestration', type: 'concept',
      q: 'What is Docker Swarm and how does an overlay network fit in?',
      answer: '<p><strong>Swarm</strong> is Docker\'s built-in clustering/orchestration mode. You <code>docker swarm init</code> on a manager, join worker nodes, and deploy <strong>services</strong> (<code>docker service create --replicas 3</code>) or a whole stack (<code>docker stack deploy -c compose.yml app</code>). Swarm schedules replicas across nodes, restarts failed tasks, and does rolling updates and load balancing via a routing mesh.</p><p>An <strong>overlay</strong> network spans all nodes, so a container on node A can reach one on node B by service name as if on one LAN — this is what makes multi-host service discovery work.</p>',
      source: { site: 'Docker docs', label: 'Swarm mode', url: 'https://docs.docker.com/engine/swarm/' }
    },
    {
      id: 'docker-q40', level: 'hard', category: 'Build', type: 'scenario',
      q: 'How would you debug why a Docker build fails at a specific RUN step?',
      answer: '<ol><li>Read the BuildKit output — the failing <code>RUN</code>, its exit code and stderr are printed.</li><li>Build up to the step before it and open a shell: comment out the failing line (or use a named stage) and <code>docker build --target=&lt;stage&gt; -t dbg .</code>, then <code>docker run -it dbg sh</code> and run the command by hand to see the real error.</li><li>Disable cache to rule out a stale layer: <code>docker build --no-cache</code>.</li><li>Use <code>--progress=plain</code> for full, unfolded logs.</li><li>Common culprits: missing files (bad context / <code>.dockerignore</code>), network needed in a <code>RUN</code>, wrong base arch, or a package mirror that moved (e.g. Debian bullseye retired — switch to bookworm).</li></ol>',
      source: { site: 'Docker docs', label: 'Build — overview', url: 'https://docs.docker.com/build/' }
    },
    {
      id: 'docker-q41', level: 'hard', category: 'Observability', type: 'coding',
      q: 'Which commands help you observe a running container\'s resource use and processes?',
      answer: '<pre><code>docker stats            # live CPU %, mem usage/limit, net & block I/O\ndocker stats web db     # just these containers\ndocker top web          # processes running inside the container\ndocker logs -f web      # follow the app output\ndocker events           # stream daemon-level events (create/start/die/oom)</code></pre><p><code>docker stats</code> is the quick "is it hot?" check; <code>docker top</code> shows the in-container process table; <code>docker events</code> surfaces lifecycle and OOM-kill events that explain mysterious restarts.</p>',
      source: { site: 'Docker docs', label: 'Engine — runtime metrics', url: 'https://docs.docker.com/engine/containers/runmetrics/' },
      tryIt: { setup: ['docker run -d --name web nginx', 'docker run -d --name cache redis'], starter: 'docker stats' }
    },
    {
      id: 'docker-q42', level: 'hard', category: 'Build', type: 'concept',
      q: 'What is `docker init` and when is it useful?',
      answer: '<p><code>docker init</code> is an interactive CLI that scaffolds Docker assets for an existing project. It detects the language/framework and generates a sensible starter <code>Dockerfile</code>, <code>.dockerignore</code>, <code>compose.yaml</code> and a <code>README.Docker.md</code>.</p><p>It is useful for quickly containerising a project with reasonable defaults (multi-stage build, non-root user, slim base) instead of writing boilerplate by hand — a good starting point you then tune.</p>',
      source: { site: 'Docker docs', label: 'Reference — docker init', url: 'https://docs.docker.com/reference/cli/docker/init/' }
    },
    {
      id: 'docker-q43', level: 'hard', category: 'Architecture', type: 'concept',
      q: 'What role do WSL2 and the Linux kernel play when running Docker on Windows?',
      answer: '<p>Containers need a Linux kernel. On Windows, Docker Desktop uses <strong>WSL2</strong> (Windows Subsystem for Linux 2), which runs a real, lightweight Linux kernel in a managed VM. The Docker daemon runs inside the WSL2 distro, and the Windows CLI talks to it.</p><p>Benefits over the older Hyper-V backend: faster filesystem and startup, dynamic memory, and native access to your code from WSL distros. Best practice: keep project files <em>inside</em> the WSL2 filesystem (e.g. <code>\\\\wsl$</code>) rather than on the Windows drive, because cross-filesystem bind mounts are much slower.</p>',
      source: { site: 'Docker docs', label: 'Docker Desktop — WSL', url: 'https://docs.docker.com/desktop/features/wsl/' }
    },
    {
      id: 'docker-q44', level: 'hard', category: 'Reliability', type: 'concept',
      q: 'How does logging work in Docker and what are logging drivers?',
      answer: '<p>Docker captures a container\'s <strong>stdout and stderr</strong>; <code>docker logs</code> replays them. How those streams are stored/forwarded is set by the <strong>logging driver</strong>.</p><ul><li><code>json-file</code> (default) — JSON files on the host; supports <code>docker logs</code>. Add rotation (<code>max-size</code>, <code>max-file</code>) or they grow unbounded.</li><li><code>local</code> — more efficient on-disk format with built-in rotation.</li><li><code>journald</code>, <code>syslog</code>, <code>fluentd</code>, <code>awslogs</code>, <code>splunk</code>, <code>gelf</code> — ship logs to a central system.</li></ul><p>Set it per-container (<code>--log-driver</code>, <code>--log-opt</code>) or daemon-wide in <code>daemon.json</code>. Design apps to log to stdout, not files, so the driver can see them.</p>',
      source: { site: 'Docker docs', label: 'Engine — configure logging drivers', url: 'https://docs.docker.com/engine/logging/configure/' }
    },
    {
      id: 'docker-q45', level: 'hard', category: 'Build', type: 'scenario',
      q: 'Two services share 90% of their Dockerfile. How do you avoid duplicating it?',
      answer: '<p>Use a shared base stage in a multi-stage Dockerfile and branch from it:</p><pre><code>FROM node:20-alpine AS base\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\n\nFROM base AS web\nCMD ["node", "web.js"]\n\nFROM base AS worker\nCMD ["node", "worker.js"]</code></pre><p>Build each with <code>--target</code> (<code>docker build --target web -t web .</code>). The <code>base</code> layers are built once and cached, so both targets reuse them. In Compose, point each service\'s <code>build.target</code> at the stage.</p>',
      source: { site: 'Docker docs', label: 'Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' }
    },
    {
      id: 'docker-q46', level: 'hard', category: 'Security', type: 'concept',
      q: 'How do environment variables and secrets differ for configuring a container?',
      answer: '<p><strong>Env vars</strong> (<code>-e KEY=val</code>, <code>--env-file</code>, Compose <code>environment:</code>) are fine for non-sensitive config — ports, feature flags, log level. But they are visible in <code>docker inspect</code>, in the process environment, and often in logs, so they are a <em>poor</em> place for passwords and tokens.</p><p><strong>Secrets</strong> should be delivered as mounted files instead: build-time via <code>RUN --mount=type=secret</code>, runtime via Swarm/Compose <code>secrets:</code> (mounted under <code>/run/secrets/</code>) or an external manager (Vault, cloud secret stores). The app reads the file; the value never lands in an image layer or <code>inspect</code> output.</p>',
      source: { site: 'Docker docs', label: 'Compose — secrets', url: 'https://docs.docker.com/compose/how-tos/use-secrets/' }
    },
    {
      id: 'docker-q47', level: 'medium', category: 'CLI Basics', type: 'coding',
      q: 'What is the difference between `docker create`, `docker start` and `docker run`?',
      answer: '<ul><li><code>docker create</code> — makes a container from an image but does <strong>not</strong> start it; prints the ID. Useful to configure then start later.</li><li><code>docker start</code> — starts an already-created or stopped container.</li><li><code>docker run</code> — the common shortcut: <code>create</code> + <code>start</code> in one step.</li></ul><p>So <code>docker run nginx</code> ≈ <code>docker create nginx</code> followed by <code>docker start</code> on the returned ID.</p>',
      source: { site: 'Docker docs', label: 'Reference — docker run', url: 'https://docs.docker.com/reference/cli/docker/container/run/' }
    },
    {
      id: 'docker-q48', level: 'medium', category: 'Networking', type: 'coding',
      q: 'How do you create a network, attach a running container to it, and detach it?',
      answer: '<pre><code>docker network create appnet\ndocker network connect appnet web       # attach running container\ndocker network disconnect appnet web    # detach it\ndocker network inspect appnet           # see attached containers\ndocker network rm appnet                # remove (must have no active endpoints)</code></pre><p>A container can be on several networks at once. You cannot remove a built-in network (<code>bridge</code>/<code>host</code>/<code>none</code>) or one that still has running containers attached.</p>',
      source: { site: 'Docker docs', label: 'Engine network drivers', url: 'https://docs.docker.com/engine/network/drivers/' },
      tryIt: { setup: ['docker run -d --name web nginx'], starter: 'docker network create appnet' }
    },
    {
      id: 'docker-q49', level: 'easy', category: 'CLI Basics', type: 'coding',
      q: 'How do you build an image from a Dockerfile and tag it?',
      answer: '<pre><code>docker build -t myapp:1.0 .</code></pre><p><code>-t myapp:1.0</code> names (tags) the image, and the final <code>.</code> is the <strong>build context</strong> — the directory sent to the builder, from which <code>COPY</code>/<code>ADD</code> read. Point at a specific file with <code>-f path/to/Dockerfile</code>. Without <code>-t</code> the image is built but left untagged (dangling), identifiable only by ID.</p>',
      source: { site: 'HackerRank', label: 'Docker (Basic) — Docker Images', url: 'https://www.hackerrank.com/skills-directory/docker_basic' },
      tryIt: { setup: [], starter: 'docker build -t myapp:1.0 .' }
    },
    {
      id: 'docker-q50', level: 'medium', category: 'Images & Layers', type: 'concept',
      q: 'What does EXPOSE do — does it publish a port?',
      answer: '<p>No. <code>EXPOSE 80</code> is <strong>documentation/metadata</strong> only — it declares that the app listens on port 80, so tools and <code>docker run -P</code> know about it. It does <strong>not</strong> open the port to the host.</p><p>To actually reach the service from the host you must publish it at run time: <code>docker run -p 8080:80</code> (explicit) or <code>docker run -P</code> (auto-map every EXPOSEd port to random host ports). A common beginner bug is adding <code>EXPOSE</code> and expecting the app to be reachable without <code>-p</code>.</p>',
      source: { site: 'Docker docs', label: 'Dockerfile reference — EXPOSE', url: 'https://docs.docker.com/reference/dockerfile/' }
    },
    {
      id: 'docker-q51', level: 'hard', category: 'Observability', type: 'scenario',
      q: 'A container keeps restarting and `docker logs` shows nothing useful. How do you find out why?',
      answer: '<ol><li><code>docker ps -a</code> — read the <strong>exit code</strong>. 137 = SIGKILL (often OOM); 139 = segfault; 0 with a restart policy = the process just finished.</li><li><code>docker inspect -f \'{{.State.OOMKilled}} {{.State.ExitCode}} {{.State.Error}}\' &lt;c&gt;</code> — confirms an OOM kill and shows the last error.</li><li><code>docker events</code> while it cycles — shows <code>die</code>/<code>oom</code> events in real time.</li><li>If OOM: raise <code>--memory</code> or fix the leak. If exit 0 + <code>restart: always</code>: the container\'s main process exits immediately (wrong CMD, or a one-shot command where a long-running one was expected).</li><li>Capture logs before they rotate; add a <code>HEALTHCHECK</code> so health, not just liveness, is visible.</li></ol>',
      source: { site: 'Docker docs', label: 'Engine — runtime metrics', url: 'https://docs.docker.com/engine/containers/runmetrics/' }
    },
    {
      id: 'docker-q52', level: 'medium', category: 'Reliability', type: 'concept',
      q: 'What is the difference between `docker stop` and `docker kill`?',
      answer: '<p><code>docker stop</code> is graceful: it sends <strong>SIGTERM</strong>, waits a grace period (default 10s, tunable with <code>-t</code>), then sends <strong>SIGKILL</strong> only if the process hasn\'t exited. This lets the app flush and shut down cleanly.</p><p><code>docker kill</code> is immediate: it sends <strong>SIGKILL</strong> (or a signal you pass with <code>--signal</code>) right away, with no grace period — the process has no chance to clean up. Use <code>stop</code> normally; <code>kill</code> only when a container is wedged.</p>',
      source: { site: 'Docker docs', label: 'Reference — docker stop', url: 'https://docs.docker.com/reference/cli/docker/container/stop/' }
    }
  ]
};
