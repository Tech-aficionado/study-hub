#!/usr/bin/env python3
"""Generate the remaining static pages for the Docker Mastery multi-page site."""
import os

ROOT = r"D:\DockerMasteryDashboard"

SHELL_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Docker Mastery</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<button class="menu-toggle" id="menuToggle">☰</button>
<div class="overlay" id="overlay"></div>
<div class="layout">
  <nav class="sidebar" id="sidebar"></nav>
  <main class="main">
"""

SHELL_TAIL = """
    <footer>Docker Mastery Dashboard · multi-page static site · served locally</footer>
  </main>
</div>
<script src="js/nav.js"></script>
<script src="js/common.js"></script>
{extra_script}</body>
</html>
"""

def write_page(filename, title, body, extra_script=""):
    content = SHELL_HEAD.format(title=title) + body + SHELL_TAIL.format(extra_script=extra_script)
    path = os.path.join(ROOT, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", filename)

# ---------- architecture.html ----------
write_page("architecture.html", "Architecture", """
    <h2 class="page-title">🏗️ Docker Architecture <span class="badge beginner">Beginner</span></h2>
    <p class="page-sub">Client, daemon, and the pieces that work together.</p>

    <div class="card">
      <h3><span class="num">1</span> Client–Server model</h3>
      <div class="svgpanel">
        <svg viewBox="0 0 640 180" xmlns="http://www.w3.org/2000/svg">
          <defs><marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#58b9ff"/></marker></defs>
          <rect x="20" y="60" width="140" height="56" rx="10" fill="#1c2129" stroke="#2496ED" stroke-width="2"/>
          <text x="90" y="84" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">Docker CLI</text>
          <text x="90" y="101" text-anchor="middle" fill="#8b949e" font-size="10.5">docker run / build / pull</text>
          <line x1="162" y1="88" x2="248" y2="88" stroke="#58b9ff" stroke-width="2" marker-end="url(#arrow1)"/>
          <line x1="248" y1="100" x2="162" y2="100" stroke="#58b9ff" stroke-width="2" marker-end="url(#arrow1)"/>
          <text x="205" y="78" text-anchor="middle" fill="#8b949e" font-size="10">REST API</text>
          <rect x="250" y="60" width="140" height="56" rx="10" fill="#1c2129" stroke="#3fb950" stroke-width="2"/>
          <text x="320" y="84" text-anchor="middle" fill="#e6edf3" font-size="13" font-weight="700">dockerd</text>
          <text x="320" y="101" text-anchor="middle" fill="#8b949e" font-size="10.5">the Docker daemon</text>
          <line x1="392" y1="78" x2="470" y2="40" stroke="#58b9ff" stroke-width="1.5" marker-end="url(#arrow1)"/>
          <line x1="392" y1="88" x2="470" y2="88" stroke="#58b9ff" stroke-width="1.5" marker-end="url(#arrow1)"/>
          <line x1="392" y1="98" x2="470" y2="136" stroke="#58b9ff" stroke-width="1.5" marker-end="url(#arrow1)"/>
          <rect x="472" y="20" width="146" height="34" rx="7" fill="#1c2129" stroke="#bc8cff"/><text x="545" y="41" text-anchor="middle" fill="#e6edf3" font-size="11.5">Images</text>
          <rect x="472" y="71" width="146" height="34" rx="7" fill="#1c2129" stroke="#bc8cff"/><text x="545" y="92" text-anchor="middle" fill="#e6edf3" font-size="11.5">Containers</text>
          <rect x="472" y="122" width="146" height="34" rx="7" fill="#1c2129" stroke="#bc8cff"/><text x="545" y="143" text-anchor="middle" fill="#e6edf3" font-size="11.5">Networks & Volumes</text>
        </svg>
      </div>
      <p>The <code class="inline">docker</code> command you type is a <strong>client</strong>. It talks to the <strong>Docker daemon (dockerd)</strong>, which does the real work of building, running, and managing containers. They can even be on different machines.</p>
    </div>

    <div class="card">
      <h3><span class="num">2</span> The building blocks</h3>
      <table>
        <tr><th>Component</th><th>Role</th></tr>
        <tr><td><strong>Image</strong></td><td>Read-only template — code + dependencies + config, nothing running yet</td></tr>
        <tr><td><strong>Container</strong></td><td>A running (or stopped) instance of an image</td></tr>
        <tr><td><strong>Dockerfile</strong></td><td>Text recipe describing how to build an image</td></tr>
        <tr><td><strong>Registry</strong></td><td>Storage/distribution for images (Docker Hub, ECR, GHCR)</td></tr>
        <tr><td><strong>Volume</strong></td><td>Persistent storage that survives container deletion</td></tr>
        <tr><td><strong>Network</strong></td><td>Virtual network letting containers talk to each other / the host</td></tr>
      </table>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Linux kernel features that make it possible</h3>
      <ul>
        <li><strong>Namespaces</strong> — isolate what a process can SEE (PIDs, network interfaces, mount points, hostname)</li>
        <li><strong>Control Groups (cgroups)</strong> — limit what a process can USE (CPU, memory, disk I/O)</li>
        <li><strong>Union filesystems (OverlayFS)</strong> — stack read-only image layers with one writable layer on top</li>
      </ul>
      <div class="callout">On Windows/Mac, Docker Desktop runs a lightweight Linux VM under the hood — this explains why it uses some RAM even when idle.</div>
    </div>
""")

# ---------- install.html ----------
write_page("install.html", "Install & Setup", """
    <h2 class="page-title">⚙️ Install & First Steps <span class="badge beginner">Beginner</span></h2>
    <p class="page-sub">Get Docker running on your machine.</p>

    <div class="card">
      <h3><span class="num">1</span> Install Docker Desktop (Windows/Mac)</h3>
      <p>Download from <a href="https://www.docker.com/products/docker-desktop/" target="_blank">docker.com/products/docker-desktop</a>. On Windows it requires WSL2 (enabled automatically). On Linux, install <code class="inline">docker-ce</code> via your package manager instead.</p>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># verify install</span>
docker --version
docker compose version
docker run hello-world</pre>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Sanity-check your setup</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker info          <span class="cmt"># daemon status, resources</span>
docker system df     <span class="cmt"># disk usage by images/containers/volumes</span></pre>
      <div class="callout tip">Try the live <a href="terminal.html">CLI Playground</a> — a simulated terminal that teaches real command syntax without needing Docker installed.</div>
    </div>
""")

# ---------- images.html ----------
write_page("images.html", "Images & Layers", """
    <h2 class="page-title">📦 Images & Layers <span class="badge beginner">Beginner</span></h2>
    <p class="page-sub">How Docker images are built from stacked, cached layers.</p>

    <div class="card">
      <h3><span class="num">1</span> Images are layered</h3>
      <p>Every instruction in a Dockerfile (<code class="inline">RUN</code>, <code class="inline">COPY</code>, <code class="inline">ADD</code>) creates a new, cached, read-only <strong>layer</strong>. When you run a container, Docker adds one thin <strong>writable layer</strong> on top.</p>
      <div class="svgpanel">
        <svg viewBox="0 0 460 230" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="10" width="400" height="36" rx="7" fill="rgba(248,81,73,.14)" stroke="#f85149" stroke-dasharray="5 4"/>
          <text x="50" y="33" fill="#f85149" font-size="12" font-weight="700">✎ Writable layer</text>
          <text x="300" y="33" fill="#8b949e" font-size="10.5">(created at runtime)</text>
          <rect x="30" y="54" width="400" height="34" rx="6" fill="#1c2129" stroke="#30363d"/><text x="50" y="76" fill="#e6edf3" font-size="12" font-family="monospace">RUN pip install -r requirements.txt</text>
          <rect x="30" y="96" width="400" height="34" rx="6" fill="#1c2129" stroke="#30363d"/><text x="50" y="118" fill="#e6edf3" font-size="12" font-family="monospace">COPY . /app</text>
          <rect x="30" y="138" width="400" height="34" rx="6" fill="#1c2129" stroke="#30363d"/><text x="50" y="160" fill="#e6edf3" font-size="12" font-family="monospace">RUN apt-get install curl</text>
          <rect x="30" y="180" width="400" height="38" rx="7" fill="rgba(63,185,80,.14)" stroke="#3fb950"/><text x="50" y="204" fill="#3fb950" font-size="12" font-weight="700" font-family="monospace">FROM python:3.12-slim</text>
          <text x="330" y="204" fill="#8b949e" font-size="10.5">base image</text>
        </svg>
      </div>
      <div class="callout">Layers are cached and shared across images. If two images both start <code class="inline">FROM python:3.12-slim</code>, that base layer is stored once and downloaded once.</div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Essential image commands</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker pull nginx:latest        <span class="cmt"># download an image</span>
docker images                  <span class="cmt"># list local images</span>
docker build -t myapp:1.0 .    <span class="cmt"># build from Dockerfile</span>
docker tag myapp:1.0 myapp:latest
docker rmi myapp:1.0           <span class="cmt"># remove an image</span>
docker history myapp:1.0       <span class="cmt"># inspect layers</span>
docker inspect myapp:1.0       <span class="cmt"># full metadata as JSON</span></pre>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Image tags & versioning</h3>
      <p>Format: <code class="inline">[registry/]repository[:tag]</code>. Omitting the tag assumes <code class="inline">:latest</code> — <strong>not</strong> guaranteed to be the newest stable version.</p>
      <div class="callout warn">⚠️ Never rely on <code class="inline">:latest</code> in production — it makes builds non-reproducible. Use <code class="inline">python:3.12.4-slim</code>, not <code class="inline">python:latest</code>.</div>
    </div>
""")

# ---------- containers.html ----------
write_page("containers.html", "Containers", """
    <h2 class="page-title">📋 Working with Containers <span class="badge beginner">Beginner</span></h2>
    <p class="page-sub">Running, inspecting, and managing containers day to day.</p>

    <div class="card">
      <h3><span class="num">1</span> Container lifecycle</h3>
      <div class="svgpanel">
        <svg viewBox="0 0 640 160" xmlns="http://www.w3.org/2000/svg">
          <defs><marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b949e"/></marker></defs>
          <rect x="10" y="55" width="110" height="44" rx="22" fill="#1c2129" stroke="#58b9ff"/><text x="65" y="81" text-anchor="middle" fill="#e6edf3" font-size="12">Created</text>
          <line x1="120" y1="77" x2="178" y2="77" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow2)"/><text x="149" y="68" text-anchor="middle" fill="#8b949e" font-size="9.5">start</text>
          <rect x="180" y="50" width="110" height="54" rx="27" fill="rgba(63,185,80,.14)" stroke="#3fb950"/><text x="235" y="81" text-anchor="middle" fill="#3fb950" font-size="12.5" font-weight="700">Running</text>
          <line x1="290" y1="65" x2="348" y2="30" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow2)"/><text x="330" y="40" text-anchor="middle" fill="#8b949e" font-size="9.5">pause</text>
          <line x1="290" y1="90" x2="348" y2="125" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow2)"/><text x="330" y="118" text-anchor="middle" fill="#8b949e" font-size="9.5">stop</text>
          <rect x="350" y="8" width="110" height="44" rx="22" fill="#1c2129" stroke="#bc8cff"/><text x="405" y="34" text-anchor="middle" fill="#e6edf3" font-size="12">Paused</text>
          <rect x="350" y="100" width="110" height="48" rx="24" fill="#1c2129" stroke="#30363d"/><text x="405" y="128" text-anchor="middle" fill="#e6edf3" font-size="12">Stopped</text>
          <line x1="460" y1="124" x2="518" y2="124" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow2)"/><text x="489" y="115" text-anchor="middle" fill="#8b949e" font-size="9.5">rm</text>
          <rect x="520" y="100" width="110" height="48" rx="24" fill="rgba(248,81,73,.14)" stroke="#f85149"/><text x="575" y="128" text-anchor="middle" fill="#f85149" font-size="12" font-weight="700">Removed</text>
        </svg>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Running containers</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker run nginx                      <span class="cmt"># run in foreground</span>
docker run -d nginx                   <span class="cmt"># detached (background)</span>
docker run -d -p 8080:80 nginx        <span class="cmt"># map host:container port</span>
docker run -it ubuntu bash            <span class="cmt"># interactive shell</span>
docker run --name myweb -d nginx      <span class="cmt"># custom name</span>
docker run --rm alpine echo hi        <span class="cmt"># auto-remove when it exits</span>
docker run -e KEY=value nginx         <span class="cmt"># set env variable</span>
docker run --memory=512m --cpus=1 nginx  <span class="cmt"># resource limits</span></pre>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Managing running containers</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker ps                   <span class="cmt"># list running containers</span>
docker ps -a                <span class="cmt"># list ALL (incl. stopped)</span>
docker logs -f myweb        <span class="cmt"># stream logs</span>
docker exec -it myweb bash  <span class="cmt"># shell into a running container</span>
docker stop myweb
docker start myweb
docker restart myweb
docker rm myweb
docker rm -f myweb          <span class="cmt"># force stop + remove</span>
docker stats                <span class="cmt"># live CPU/mem usage</span></pre>
      <div class="callout tip">💡 Try all of these in the <a href="terminal.html">CLI Playground</a> before touching a real terminal.</div>
    </div>
""")

# ---------- dockerfile.html ----------
write_page("dockerfile.html", "Dockerfile", """
    <h2 class="page-title">📝 Writing Dockerfiles <span class="badge intermediate">Intermediate</span></h2>
    <p class="page-sub">The recipe that builds your image.</p>

    <div class="card">
      <h3><span class="num">1</span> Anatomy of a Dockerfile</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># 1. Base image to build from</span>
FROM node:20-alpine

<span class="cmt"># 2. Metadata (optional)</span>
LABEL maintainer="you@example.com"

<span class="cmt"># 3. Set working directory inside the image</span>
WORKDIR /app

<span class="cmt"># 4. Copy dependency manifests FIRST (layer caching!)</span>
COPY package*.json ./
RUN npm ci --production

<span class="cmt"># 5. Copy the rest of the source</span>
COPY . .

<span class="cmt"># 6. Document the port the app listens on</span>
EXPOSE 3000

<span class="cmt"># 7. Run as non-root user (security)</span>
USER node

<span class="cmt"># 8. The command that runs when the container starts</span>
CMD ["node", "server.js"]</pre>
      <div class="videopanel">
        <div class="vhead">
          <span class="vtitle"><span class="ytdot">▶</span> Docker Tutorial for Beginners [FULL COURSE]</span>
          <span class="vcreator">TechWorld with Nana · Austria</span>
        </div>
        <div class="video-frame-wrap">
          <iframe src="https://www.youtube.com/embed/3c-iBn73dDE" title="Docker Tutorial for Beginners" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Key instructions reference</h3>
      <table>
        <tr><th>Instruction</th><th>Purpose</th></tr>
        <tr><td><code class="inline">FROM</code></td><td>Base image — always the first instruction</td></tr>
        <tr><td><code class="inline">RUN</code></td><td>Execute a command at BUILD time, creates a new layer</td></tr>
        <tr><td><code class="inline">COPY</code></td><td>Copy files from build context into the image</td></tr>
        <tr><td><code class="inline">ADD</code></td><td>Like COPY, but also extracts tar files & fetches URLs</td></tr>
        <tr><td><code class="inline">WORKDIR</code></td><td>Set the working directory for subsequent instructions</td></tr>
        <tr><td><code class="inline">ENV</code></td><td>Set environment variable, persists into running container</td></tr>
        <tr><td><code class="inline">EXPOSE</code></td><td>Document which port the app uses</td></tr>
        <tr><td><code class="inline">CMD</code></td><td>Default command when container starts (overridable)</td></tr>
        <tr><td><code class="inline">ENTRYPOINT</code></td><td>Fixed executable; CMD becomes its args</td></tr>
        <tr><td><code class="inline">USER</code></td><td>Switch to a non-root user</td></tr>
        <tr><td><code class="inline">ARG</code></td><td>Build-time-only variable</td></tr>
        <tr><td><code class="inline">VOLUME</code></td><td>Create a mount point for persistent storage</td></tr>
        <tr><td><code class="inline">HEALTHCHECK</code></td><td>Periodic container health check</td></tr>
      </table>
    </div>

    <div class="card">
      <h3><span class="num">3</span> CMD vs ENTRYPOINT — the classic confusion</h3>
      <div class="grid-2">
        <div>
          <p><strong>CMD alone</strong> — fully overridable:</p>
          <pre class="code-block">CMD ["python", "app.py"]
<span class="cmt"># docker run myimg → runs python app.py
# docker run myimg bash → runs bash instead</span></pre>
        </div>
        <div>
          <p><strong>ENTRYPOINT + CMD</strong> — CMD becomes default args:</p>
          <pre class="code-block">ENTRYPOINT ["python"]
CMD ["app.py"]
<span class="cmt"># docker run myimg → python app.py
# docker run myimg other.py → python other.py</span></pre>
        </div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">4</span> Layer-caching best practices</h3>
      <ul>
        <li>Order instructions from least to most frequently changing.</li>
        <li>Combine related <code class="inline">RUN</code> commands with <code class="inline">&&</code>.</li>
        <li>Use a <code class="inline">.dockerignore</code> to exclude <code class="inline">node_modules</code>, <code class="inline">.git</code>, logs.</li>
        <li>Prefer slim/alpine base images.</li>
      </ul>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># .dockerignore example</span>
node_modules
.git
*.log
.env
Dockerfile
.dockerignore</pre>
    </div>
""")

# ---------- volumes.html ----------
write_page("volumes.html", "Volumes & Storage", """
    <h2 class="page-title">💾 Volumes & Storage <span class="badge intermediate">Intermediate</span></h2>
    <p class="page-sub">Persisting data beyond a container's lifetime.</p>

    <div class="card">
      <h3><span class="num">1</span> Why volumes exist</h3>
      <p>A container's writable layer is deleted with the container. Volumes decouple data from the container's lifecycle — essential for databases, uploads, and anything you can't afford to lose.</p>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Three storage types</h3>
      <table>
        <tr><th>Type</th><th>Managed by</th><th>Use case</th></tr>
        <tr><td><strong>Named volume</strong></td><td>Docker</td><td>Databases, persistent app data — <strong>recommended default</strong></td></tr>
        <tr><td><strong>Bind mount</strong></td><td>You (host path)</td><td>Local dev — live-reload source code into container</td></tr>
        <tr><td><strong>tmpfs mount</strong></td><td>RAM only (Linux)</td><td>Sensitive, ephemeral data</td></tr>
      </table>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># named volume</span>
docker volume create dbdata
docker run -d -v dbdata:/var/lib/postgresql/data postgres

<span class="cmt"># bind mount (host path : container path)</span>
docker run -d -v $(pwd)/src:/app/src myapp

<span class="cmt"># tmpfs</span>
docker run -d --tmpfs /app/cache myapp

<span class="cmt"># manage volumes</span>
docker volume ls
docker volume inspect dbdata
docker volume rm dbdata
docker volume prune   <span class="cmt"># remove all unused volumes</span></pre>
    </div>

    <div class="callout warn">⚠️ <code class="inline">docker volume prune</code> permanently deletes data in unused volumes. Always check <code class="inline">docker volume ls</code> first.</div>
""")

# ---------- networking.html ----------
write_page("networking.html", "Networking", """
    <h2 class="page-title">🌐 Networking <span class="badge intermediate">Intermediate</span></h2>
    <p class="page-sub">How containers talk to each other and the outside world.</p>

    <div class="card">
      <h3><span class="num">1</span> Network drivers</h3>
      <table>
        <tr><th>Driver</th><th>Behavior</th></tr>
        <tr><td><strong>bridge</strong> (default)</td><td>Private internal network; containers reach each other by name</td></tr>
        <tr><td><strong>host</strong></td><td>Container shares the host's network stack directly</td></tr>
        <tr><td><strong>none</strong></td><td>No networking at all</td></tr>
        <tr><td><strong>overlay</strong></td><td>Multi-host networking for Swarm/clusters</td></tr>
      </table>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Custom bridge networks + DNS</h3>
      <p>Containers on the <em>same user-defined bridge network</em> can reach each other by container name — Docker runs an internal DNS server for this.</p>
      <div class="svgpanel">
        <svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="20" width="500" height="150" rx="14" fill="none" stroke="#2496ED" stroke-width="1.5" stroke-dasharray="6 5"/>
          <text x="280" y="42" text-anchor="middle" fill="#58b9ff" font-size="12" font-weight="700">bridge network: mynet</text>
          <rect x="70" y="70" width="120" height="56" rx="9" fill="#1c2129" stroke="#3fb950"/><text x="130" y="94" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="700">api</text><text x="130" y="111" text-anchor="middle" fill="#8b949e" font-size="10">container</text>
          <rect x="370" y="70" width="120" height="56" rx="9" fill="#1c2129" stroke="#bc8cff"/><text x="430" y="94" text-anchor="middle" fill="#e6edf3" font-size="12" font-weight="700">db</text><text x="430" y="111" text-anchor="middle" fill="#8b949e" font-size="10">postgres</text>
          <line x1="192" y1="98" x2="368" y2="98" stroke="#58b9ff" stroke-width="2"/>
          <circle cx="280" cy="98" r="18" fill="#0a0e14" stroke="#58b9ff"/><text x="280" y="102" text-anchor="middle" fill="#58b9ff" font-size="9">DNS</text>
          <text x="280" y="140" text-anchor="middle" fill="#8b949e" font-size="11">api → connects to "db" by name, Docker resolves the IP</text>
        </svg>
      </div>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker network create mynet
docker run -d --name db --network mynet postgres
docker run -d --name api --network mynet myapi
<span class="cmt"># inside 'api' container, connect to postgres via hostname "db"</span>

docker network ls
docker network inspect mynet
docker network connect mynet existing_container
docker network rm mynet</pre>
      <div class="videopanel">
        <div class="vhead">
          <span class="vtitle"><span class="ytdot">▶</span> Docker Networking is CRAZY!! (you NEED to learn it)</span>
          <span class="vcreator">NetworkChuck · USA</span>
        </div>
        <div class="video-frame-wrap">
          <iframe src="https://www.youtube.com/embed/bKFMS5C4CG0" title="Docker Networking" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Port publishing</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker run -p 8080:80 nginx     <span class="cmt"># host:8080 → container:80</span>
docker run -p 127.0.0.1:8080:80 nginx   <span class="cmt"># bind only to localhost</span>
docker run -P nginx             <span class="cmt"># publish ALL exposed ports to random host ports</span></pre>
      <div class="callout">Format is always <code class="inline">HOST_PORT:CONTAINER_PORT</code>. Mixing these up is the #1 "why can't I reach my app" bug.</div>
    </div>
""")

# ---------- compose.html ----------
write_page("compose.html", "Docker Compose", """
    <h2 class="page-title">🧩 Docker Compose <span class="badge intermediate">Intermediate</span></h2>
    <p class="page-sub">Running multi-container apps declaratively.</p>

    <div class="card">
      <h3><span class="num">1</span> Why Compose</h3>
      <p>Real apps are multiple containers (web + API + database + cache). Compose lets you define the whole stack declaratively in one YAML file and bring it all up/down with one command.</p>
      <div class="videopanel">
        <div class="vhead">
          <span class="vtitle"><span class="ytdot">▶</span> Ultimate Docker Compose Tutorial</span>
          <span class="vcreator">TechWorld with Nana · Austria</span>
        </div>
        <div class="video-frame-wrap">
          <iframe src="https://www.youtube.com/embed/SXwC9fSwct8" title="Ultimate Docker Compose Tutorial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> A real-world example</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># docker-compose.yml</span>
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/app
    depends_on:
      - db
    volumes:
      - ./src:/app/src          <span class="cmt"># live reload in dev</span>

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - dbdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  dbdata:</pre>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Compose commands</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker compose up -d          <span class="cmt"># start all services, detached</span>
docker compose ps             <span class="cmt"># status of the stack</span>
docker compose logs -f web    <span class="cmt"># follow logs for one service</span>
docker compose exec web bash  <span class="cmt"># shell into a service</span>
docker compose build          <span class="cmt"># rebuild images</span>
docker compose down           <span class="cmt"># stop & remove containers/networks</span>
docker compose down -v        <span class="cmt"># also remove volumes</span>
docker compose config         <span class="cmt"># validate & print resolved config</span></pre>
      <div class="callout tip">💡 <code class="inline">depends_on</code> controls start ORDER, not readiness. Add a <code class="inline">healthcheck</code> + <code class="inline">condition: service_healthy</code> for real readiness.</div>
    </div>
""")

# ---------- registry.html ----------
write_page("registry.html", "Registries & Docker Hub", """
    <h2 class="page-title">☁️ Registries & Docker Hub <span class="badge intermediate">Intermediate</span></h2>
    <p class="page-sub">Storing and distributing your images.</p>

    <div class="card">
      <h3><span class="num">1</span> Pushing your own image</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker login
docker tag myapp:1.0 yourusername/myapp:1.0
docker push yourusername/myapp:1.0
docker pull yourusername/myapp:1.0</pre>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Common registries</h3>
      <table>
        <tr><th>Registry</th><th>Notes</th></tr>
        <tr><td>Docker Hub</td><td>Default public registry; free tier has pull-rate limits</td></tr>
        <tr><td>GitHub Container Registry (ghcr.io)</td><td>Tied to GitHub repos/orgs, great for CI</td></tr>
        <tr><td>AWS ECR</td><td>Private registry integrated with IAM/ECS/EKS</td></tr>
        <tr><td>Self-hosted (registry:2)</td><td>Run your own with the official registry image</td></tr>
      </table>
    </div>

    <div class="callout warn">⚠️ Never bake secrets/API keys into an image layer — anyone with the image can extract them with <code class="inline">docker history</code>. Use build secrets or runtime env injection instead.</div>
""")

# ---------- multistage.html ----------
write_page("multistage.html", "Multi-stage Builds", """
    <h2 class="page-title">🏭 Multi-stage Builds <span class="badge advanced">Advanced</span></h2>
    <p class="page-sub">Keep build tools out of your production image.</p>

    <div class="card">
      <h3><span class="num">1</span> The problem: bloated images</h3>
      <p>Compiling code needs a toolchain that bloats the final image. Multi-stage builds let you use one stage to <em>build</em>, and copy only the final artifact into a lean runtime stage.</p>
      <div class="svgpanel">
        <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
          <defs><marker id="arrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#58b9ff"/></marker></defs>
          <rect x="20" y="30" width="200" height="90" rx="10" fill="rgba(248,81,73,.1)" stroke="#f85149" stroke-dasharray="5 4"/>
          <text x="120" y="55" text-anchor="middle" fill="#f85149" font-size="12" font-weight="700">Stage 1: builder</text>
          <text x="120" y="75" text-anchor="middle" fill="#8b949e" font-size="10.5">golang:1.22 (~800MB)</text>
          <text x="120" y="93" text-anchor="middle" fill="#8b949e" font-size="10.5">compiles /app/server</text>
          <text x="120" y="111" text-anchor="middle" fill="#8b949e" font-size="10" font-style="italic">discarded after build</text>
          <line x1="220" y1="75" x2="320" y2="75" stroke="#58b9ff" stroke-width="2" marker-end="url(#arrow3)"/>
          <text x="270" y="65" text-anchor="middle" fill="#8b949e" font-size="9.5">COPY --from=builder</text>
          <rect x="330" y="30" width="200" height="90" rx="10" fill="rgba(63,185,80,.1)" stroke="#3fb950"/>
          <text x="430" y="55" text-anchor="middle" fill="#3fb950" font-size="12" font-weight="700">Stage 2: final</text>
          <text x="430" y="75" text-anchor="middle" fill="#8b949e" font-size="10.5">alpine:3.19 (~5MB)</text>
          <text x="430" y="93" text-anchor="middle" fill="#8b949e" font-size="10.5">+ server binary only</text>
          <text x="430" y="111" text-anchor="middle" fill="#3fb950" font-size="10" font-weight="700">= ~15MB shipped image</text>
        </svg>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Example: Go binary</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># Stage 1: build</span>
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

<span class="cmt"># Stage 2: minimal runtime (final image)</span>
FROM alpine:3.19
COPY --from=builder /app/server /usr/local/bin/server
ENTRYPOINT ["server"]</pre>
      <div class="callout tip">Result: a ~15MB final image instead of a 1GB+ image carrying the entire Go toolchain.</div>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Example: React/Node frontend</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]</pre>
    </div>
""")

# ---------- swarm.html ----------
write_page("swarm.html", "Swarm & Orchestration", """
    <h2 class="page-title">🚢 Orchestration: Swarm & Beyond <span class="badge advanced">Advanced</span></h2>
    <p class="page-sub">Running containers across a cluster, not just one host.</p>

    <div class="card">
      <h3><span class="num">1</span> Why orchestration</h3>
      <p>A single <code class="inline">docker run</code> doesn't scale, self-heal, or load-balance across multiple machines. Orchestrators schedule containers across a cluster, restart failed ones, and scale services up/down.</p>
      <div class="svgpanel">
        <svg viewBox="0 0 560 170" xmlns="http://www.w3.org/2000/svg">
          <rect x="220" y="10" width="120" height="40" rx="8" fill="rgba(36,150,237,.15)" stroke="#2496ED"/>
          <text x="280" y="35" text-anchor="middle" fill="#58b9ff" font-size="12" font-weight="700">Manager Node</text>
          <line x1="280" y1="50" x2="100" y2="100" stroke="#30363d" stroke-width="1.5"/>
          <line x1="280" y1="50" x2="280" y2="100" stroke="#30363d" stroke-width="1.5"/>
          <line x1="280" y1="50" x2="460" y2="100" stroke="#30363d" stroke-width="1.5"/>
          <rect x="40" y="100" width="120" height="50" rx="8" fill="#1c2129" stroke="#3fb950"/><text x="100" y="121" text-anchor="middle" fill="#e6edf3" font-size="11" font-weight="700">Worker 1</text><text x="100" y="137" text-anchor="middle" fill="#8b949e" font-size="9.5">web replica x2</text>
          <rect x="220" y="100" width="120" height="50" rx="8" fill="#1c2129" stroke="#3fb950"/><text x="280" y="121" text-anchor="middle" fill="#e6edf3" font-size="11" font-weight="700">Worker 2</text><text x="280" y="137" text-anchor="middle" fill="#8b949e" font-size="9.5">web replica x2</text>
          <rect x="400" y="100" width="120" height="50" rx="8" fill="#1c2129" stroke="#3fb950"/><text x="460" y="121" text-anchor="middle" fill="#e6edf3" font-size="11" font-weight="700">Worker 3</text><text x="460" y="137" text-anchor="middle" fill="#8b949e" font-size="9.5">web replica x1</text>
        </svg>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Docker Swarm (built-in, simplest)</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker swarm init                       <span class="cmt"># turn this node into a manager</span>
docker service create --name web -p 80:80 --replicas 3 nginx
docker service scale web=5
docker service ls
docker service ps web
docker node ls
docker stack deploy -c docker-compose.yml mystack</pre>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Swarm vs Kubernetes</h3>
      <table>
        <tr><th>Aspect</th><th>Swarm</th><th>Kubernetes</th></tr>
        <tr><td>Setup complexity</td><td>Very low</td><td>High (many moving parts)</td></tr>
        <tr><td>Ecosystem</td><td>Small</td><td>Huge — the industry standard</td></tr>
        <tr><td>Config format</td><td>Compose-based</td><td>Verbose YAML manifests, Helm charts</td></tr>
        <tr><td>Best for</td><td>Small teams</td><td>Production at scale</td></tr>
      </table>
      <div class="callout">Most companies hiring for "Docker" skills run Kubernetes in production — learn Swarm cheaply, then transfer the intuition.</div>
    </div>
""")

# ---------- security.html ----------
write_page("security.html", "Security Hardening", """
    <h2 class="page-title">🔒 Security Hardening <span class="badge advanced">Advanced</span></h2>
    <p class="page-sub">Production-grade image and runtime hardening.</p>

    <div class="card">
      <h3><span class="num">1</span> Checklist for production images</h3>
      <ul class="checklist" id="securityChecklist">
        <li><input type="checkbox" id="sc1"><label for="sc1">Run as a non-root <code class="inline">USER</code>, never root</label></li>
        <li><input type="checkbox" id="sc2"><label for="sc2">Use minimal base images (alpine, distroless, slim)</label></li>
        <li><input type="checkbox" id="sc3"><label for="sc3">Pin exact image versions/digests, never <code class="inline">:latest</code></label></li>
        <li><input type="checkbox" id="sc4"><label for="sc4">Scan images for CVEs (docker scout, Trivy, Grype)</label></li>
        <li><input type="checkbox" id="sc5"><label for="sc5">Never bake secrets into image layers</label></li>
        <li><input type="checkbox" id="sc6"><label for="sc6">Set <code class="inline">--read-only</code> filesystem where possible</label></li>
        <li><input type="checkbox" id="sc7"><label for="sc7">Drop unneeded Linux capabilities (<code class="inline">--cap-drop=ALL</code>)</label></li>
        <li><input type="checkbox" id="sc8"><label for="sc8">Set CPU/memory limits to prevent noisy-neighbor DoS</label></li>
        <li><input type="checkbox" id="sc9"><label for="sc9">Keep the Docker daemon & host OS patched</label></li>
        <li><input type="checkbox" id="sc10"><label for="sc10">Use a .dockerignore to avoid leaking .git/.env</label></li>
      </ul>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Scanning & non-root example</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># scan an image for known vulnerabilities</span>
docker scout cves myapp:1.0

<span class="cmt"># run with hardened flags</span>
docker run --read-only --cap-drop=ALL --security-opt=no-new-privileges \\
  --memory=256m --cpus=0.5 myapp:1.0</pre>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># Dockerfile: create and switch to a non-root user</span>
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser</pre>
    </div>

    <div class="callout danger">🚨 The Docker socket (/var/run/docker.sock) is root-equivalent access to the host. Never mount it into a container unless you fully trust that image.</div>
""")

# ---------- performance.html ----------
write_page("performance.html", "Performance", """
    <h2 class="page-title">⚡ Performance & Optimization <span class="badge advanced">Advanced</span></h2>
    <p class="page-sub">Smaller images, faster builds.</p>

    <div class="card">
      <h3><span class="num">1</span> Shrinking image size</h3>
      <ul>
        <li>Use alpine or distroless base images instead of full OS images</li>
        <li>Multi-stage builds to drop build-only tooling</li>
        <li>Combine RUN commands + clean package-manager caches in the same layer</li>
        <li>Use BuildKit cache mounts</li>
      </ul>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># bad: cache persists even after cleanup in next line</span>
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

<span class="cmt"># good: single layer, cache cleaned within the SAME layer</span>
RUN apt-get update && apt-get install -y curl \\
    && rm -rf /var/lib/apt/lists/*</pre>
    </div>

    <div class="card">
      <h3><span class="num">2</span> BuildKit cache mounts (fast rebuilds)</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># syntax=docker/dockerfile:1</span>
RUN --mount=type=cache,target=/root/.npm \\
    npm ci

RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt</pre>
      <p>Cache mounts persist a directory ACROSS builds, so dependency installs reuse their cache even when source code changes.</p>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Monitoring resource usage</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button>docker stats                      <span class="cmt"># live CPU/mem/network/IO per container</span>
docker system df -v               <span class="cmt"># detailed disk usage breakdown</span>
docker system prune -a --volumes  <span class="cmt"># nuke everything unused (careful!)</span></pre>
      <div class="callout warn">⚠️ <code class="inline">docker system prune -a --volumes</code> removes ALL unused images, containers, networks AND volumes. Irreversible for anything not currently referenced.</div>
    </div>
""")

# ---------- cicd.html ----------
write_page("cicd.html", "CI/CD Integration", """
    <h2 class="page-title">🔁 CI/CD Integration <span class="badge advanced">Advanced</span></h2>
    <p class="page-sub">Building and shipping images in a pipeline.</p>

    <div class="card">
      <h3><span class="num">1</span> GitHub Actions example</h3>
      <pre class="code-block"><button class="copy-btn">Copy</button><span class="cmt"># .github/workflows/docker.yml</span>
name: Build and Push
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USER }}
          password: ${{ secrets.DOCKER_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: yourname/app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max</pre>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Patterns worth adopting</h3>
      <ul>
        <li>Tag images with the git commit SHA, not just latest</li>
        <li>Build once, promote the same image through dev → staging → prod</li>
        <li>Run vulnerability scans as a CI gate before push</li>
        <li>Use BuildKit's remote cache to speed up CI builds</li>
      </ul>
    </div>
""")

# ---------- terminal.html ----------
TERMINAL_SCRIPT = """<script src="js/terminal.js"></script>
"""
write_page("terminal.html", "CLI Playground", """
    <h2 class="page-title">💻 CLI Playground</h2>
    <p class="page-sub">A simulated Docker terminal. Type real commands and get realistic output — nothing is actually installed or run.</p>

    <div class="card">
      <div class="terminal">
        <div class="term-head"><span class="dot" style="background:#ff5f56;"></span><span class="dot" style="background:#ffbd2e;"></span><span class="dot" style="background:#27c93f;"></span>&nbsp;docker-sim — bash</div>
        <div class="term-body" id="termBody">
          <div class="term-line"><span class="term-out">Simulated Docker CLI. Try: docker run -d -p 8080:80 nginx, docker ps, docker images, docker build -t myapp . , docker --help</span></div>
        </div>
        <div class="term-input-row">
          <span class="term-prompt">$</span>
          <input type="text" id="termInput" placeholder="type a docker command and hit Enter..." autocomplete="off">
        </div>
        <div class="term-hint">Supports: run, ps, images, pull, build, stop, rm, rmi, exec, logs, volume ls, network ls, compose up, --help, clear</div>
      </div>
    </div>
""", extra_script=TERMINAL_SCRIPT)

# ---------- cheatsheet.html ----------
CHEATSHEET_SCRIPT = """<script src="js/cheatsheet.js"></script>
"""
write_page("cheatsheet.html", "Command Cheatsheet", """
    <h2 class="page-title">📋 Command Cheatsheet</h2>
    <input type="text" class="cmd-ref-search" id="cmdSearch" placeholder="🔍 Search commands (e.g. 'volume', 'network', 'build')...">
    <div class="card">
      <table>
        <thead><tr><th>Command</th><th>Description</th></tr></thead>
        <tbody id="cmdTableBody"></tbody>
      </table>
    </div>
""", extra_script=CHEATSHEET_SCRIPT)

# ---------- quiz.html ----------
QUIZ_SCRIPT = """<script src="js/quiz.js"></script>
"""
write_page("quiz.html", "Quiz", """
    <h2 class="page-title">🧠 Knowledge Check</h2>
    <p class="page-sub">Click an answer — instant feedback, score tracked at the bottom.</p>
    <div class="card" id="quizContainer"></div>
    <div class="card">
      <h3>Your score: <span id="quizScore">0</span> / <span id="quizTotal">0</span></h3>
      <button class="toggle-btn" id="resetQuizBtn">Reset Quiz</button>
    </div>
""", extra_script=QUIZ_SCRIPT)

# ---------- videos.html ----------
write_page("videos.html", "Video Library", """
    <h2 class="page-title">▶️ Video Library</h2>
    <p class="page-sub">Curated Docker videos from well-known creators, embedded directly on this page (served from your own local server, not inside a sandboxed widget — so playback works normally).</p>

    <div class="card">
      <h3><span class="num">1</span> Docker in 100 Seconds</h3>
      <div class="videopanel">
        <div class="vhead"><span class="vtitle"><span class="ytdot">▶</span> Docker in 100 Seconds</span><span class="vcreator">Fireship · USA</span></div>
        <div class="video-frame-wrap"><iframe src="https://www.youtube.com/embed/Gjnup-PuquQ" title="Docker in 100 Seconds" allowfullscreen loading="lazy"></iframe></div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">2</span> Docker Tutorial for Beginners [FULL COURSE]</h3>
      <div class="videopanel">
        <div class="vhead"><span class="vtitle"><span class="ytdot">▶</span> Docker Tutorial for Beginners</span><span class="vcreator">TechWorld with Nana · Austria</span></div>
        <div class="video-frame-wrap"><iframe src="https://www.youtube.com/embed/3c-iBn73dDE" title="Docker Tutorial for Beginners" allowfullscreen loading="lazy"></iframe></div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">3</span> Docker Networking is CRAZY!!</h3>
      <div class="videopanel">
        <div class="vhead"><span class="vtitle"><span class="ytdot">▶</span> Docker Networking is CRAZY!!</span><span class="vcreator">NetworkChuck · USA</span></div>
        <div class="video-frame-wrap"><iframe src="https://www.youtube.com/embed/bKFMS5C4CG0" title="Docker Networking" allowfullscreen loading="lazy"></iframe></div>
      </div>
    </div>

    <div class="card">
      <h3><span class="num">4</span> Ultimate Docker Compose Tutorial</h3>
      <div class="videopanel">
        <div class="vhead"><span class="vtitle"><span class="ytdot">▶</span> Ultimate Docker Compose Tutorial</span><span class="vcreator">TechWorld with Nana · Austria</span></div>
        <div class="video-frame-wrap"><iframe src="https://www.youtube.com/embed/SXwC9fSwct8" title="Ultimate Docker Compose Tutorial" allowfullscreen loading="lazy"></iframe></div>
      </div>
    </div>
""")

# ---------- labs.html ----------
write_page("labs.html", "Hands-on Labs", """
    <h2 class="page-title">🧪 Hands-on Labs</h2>
    <p class="page-sub">Do these on your real machine once Docker is installed. Check them off mentally as you complete them.</p>

    <div class="card">
      <h3>Lab 1 — <span class="badge beginner">Beginner</span> Run your first containers</h3>
      <ol>
        <li>Run <code class="inline">docker run hello-world</code> and read the output.</li>
        <li>Run nginx: <code class="inline">docker run -d -p 8080:80 --name web nginx</code>, open <a href="http://localhost:8080" target="_blank">localhost:8080</a>.</li>
        <li>View logs, exec in: <code class="inline">docker logs web</code>, <code class="inline">docker exec -it web bash</code>.</li>
        <li>Clean up: <code class="inline">docker stop web && docker rm web</code>.</li>
      </ol>
    </div>

    <div class="card">
      <h3>Lab 2 — <span class="badge beginner">Beginner</span> Build your own image</h3>
      <ol>
        <li>Create a folder with a one-line app.py or index.html.</li>
        <li>Write a Dockerfile that copies it into an appropriate base image.</li>
        <li>Build: <code class="inline">docker build -t my-first-image .</code></li>
        <li>Run it, check its size with <code class="inline">docker images</code>.</li>
      </ol>
    </div>

    <div class="card">
      <h3>Lab 3 — <span class="badge intermediate">Intermediate</span> Multi-container app with Compose</h3>
      <ol>
        <li>Create a docker-compose.yml with a web service + a Postgres or Redis service.</li>
        <li>Bring it up: <code class="inline">docker compose up -d</code>.</li>
        <li>Confirm web can reach the database by service name (not localhost!).</li>
        <li>Tear down with volumes: <code class="inline">docker compose down -v</code>.</li>
      </ol>
    </div>

    <div class="card">
      <h3>Lab 4 — <span class="badge advanced">Advanced</span> Multi-stage build + size comparison</h3>
      <ol>
        <li>Build a single-stage Dockerfile for a compiled app and note the size.</li>
        <li>Rewrite as multi-stage and rebuild.</li>
        <li>Compare sizes — aim for &gt;10x reduction.</li>
      </ol>
    </div>

    <div class="card">
      <h3>Lab 5 — <span class="badge advanced">Advanced</span> Harden an image</h3>
      <ol>
        <li>Add a non-root USER to any Dockerfile you've written.</li>
        <li>Run with <code class="inline">--read-only --cap-drop=ALL</code>, fix mounts as needed.</li>
        <li>Scan it: <code class="inline">docker scout cves &lt;image&gt;</code> and address HIGH/CRITICAL findings.</li>
      </ol>
    </div>
""")

print("done")
