// Quiz — standalone module, loaded only on quiz.html

(function () {
  var quizData = [
    { q: "What is the main difference between a Docker image and a container?", opts: ["An image is a running instance; a container is a static file", "A container is a running (or stopped) instance of an image", "They are exactly the same thing", "Images only exist in the cloud"], correct: 1 },
    { q: "Which instruction creates a NEW layer when it runs in a Dockerfile?", opts: ["WORKDIR", "ENV", "RUN", "EXPOSE"], correct: 2 },
    { q: "What does docker run -p 8080:80 nginx mean?", opts: ["Container port 8080 maps to host port 80", "Host port 8080 maps to container port 80", "It limits the container to 8080MB", "It sets a timeout of 80 seconds"], correct: 1 },
    { q: "Which storage type is best for persisting a production database's data?", opts: ["tmpfs mount", "Bind mount to a temp folder", "Named volume", "Writable container layer"], correct: 2 },
    { q: "In a user-defined bridge network, how do containers typically reach each other?", opts: ["By container NAME, via Docker's internal DNS", "Only by hardcoded IP address", "They cannot communicate at all", "Only through the host's public IP"], correct: 0 },
    { q: "What is the main benefit of a multi-stage Dockerfile build?", opts: ["It makes builds slower but safer", "It removes the need for a Dockerfile", "It keeps build-only tools out of the final image, shrinking its size", "It automatically fixes security vulnerabilities"], correct: 2 },
    { q: "Why should production images avoid the :latest tag?", opts: [":latest images are always broken", "It makes builds non-reproducible since the tag's target can silently change", "Docker Hub charges more for :latest", "':latest' cannot be pulled"], correct: 1 },
    { q: "Which command shows live CPU/memory usage per running container?", opts: ["docker inspect", "docker stats", "docker top", "docker system df"], correct: 1 },
    { q: "What's the risk of mounting /var/run/docker.sock into a container?", opts: ["No risk, it's read-only by default", "It grants root-equivalent access to the host — a container escape vector", "It only exposes container names", "It slows down the container slightly"], correct: 1 },
    { q: "CMD vs ENTRYPOINT: if a Dockerfile has ENTRYPOINT [\"python\"] and CMD [\"app.py\"], what does docker run myimg other.py execute?", opts: ["python app.py", "python other.py", "other.py app.py", "It errors out"], correct: 1 },
    { q: "What does the HEALTHCHECK exit code 0 mean?", opts: ["Container is unhealthy", "Container is healthy", "Reserved — do not use", "Check timed out"], correct: 1 },
    { q: "Which restart policy keeps a container stopped after you manually stop it, even across daemon restarts?", opts: ["always", "on-failure", "unless-stopped", "no"], correct: 2 },
    { q: "A restart policy only takes effect after the container has run successfully for at least how long?", opts: ["1 second", "10 seconds", "60 seconds", "immediately"], correct: 1 },
    { q: "What does EXPOSE 80 do in a Dockerfile?", opts: ["Publishes port 80 to the host", "Only documents that the app listens on 80 (metadata)", "Opens a firewall rule", "Maps 80 to a random host port"], correct: 1 },
    { q: "Which command adds a second name pointing at an existing image, without copying any bytes?", opts: ["docker build", "docker commit", "docker tag", "docker push"], correct: 2 },
    { q: "Where should a database's data live so a redeploy doesn't lose it?", opts: ["The container's writable layer", "A named volume", "An ENV variable", "The image itself"], correct: 1 },
    { q: "On the DEFAULT bridge network, how can two containers reach each other?", opts: ["By container name via DNS", "Only by IP address", "They cannot at all", "Via the host's public DNS"], correct: 1 },
    { q: "What does docker exec require of the target container?", opts: ["It must be stopped", "It must be running", "It must have a volume", "It must be privileged"], correct: 1 },
    { q: "Why should secrets NOT be passed as a Dockerfile ARG or ENV?", opts: ["They slow the build", "They are stored in the image layer history and are recoverable", "ARG is deprecated", "They break caching"], correct: 1 },
    { q: "What is the purpose of a .dockerignore file?", opts: ["List images to delete", "Exclude files from the build context", "Ignore failed builds", "Hide containers from docker ps"], correct: 1 },
    { q: "Which command shows a container's exit code and whether it was OOM-killed?", opts: ["docker logs", "docker inspect", "docker images", "docker pull"], correct: 1 },
    { q: "An exit code of 137 most often indicates what?", opts: ["Clean exit", "Segmentation fault", "SIGKILL, often an out-of-memory kill", "Image not found"], correct: 2 },
    { q: "What does docker buildx let you do that a plain build does not?", opts: ["Run containers", "Build images for multiple CPU architectures", "Scan for CVEs", "Push to Swarm"], correct: 1 },
    { q: "On Windows, which component provides the Linux kernel Docker Desktop needs?", opts: ["Cygwin", "WSL2", "MinGW", "PowerShell"], correct: 1 },
    { q: "In Compose, depends_on alone guarantees what about a dependency?", opts: ["It is fully ready to accept connections", "Only that it was STARTED first (not ready)", "It is healthy", "It has a volume"], correct: 1 },
    { q: "To wait for a dependency to be truly ready in Compose, you combine depends_on with:", opts: ["A longer timeout", "A healthcheck and condition: service_healthy", "restart: always", "A second network"], correct: 1 },
    { q: "Which command creates and runs a container in one step?", opts: ["docker create", "docker start", "docker run", "docker exec"], correct: 2 },
    { q: "What does docker system prune -a --volumes remove?", opts: ["Only stopped containers", "All unused images AND unused volumes (plus containers, networks, cache)", "Only dangling images", "Nothing without confirmation flag"], correct: 1 },
    { q: "Which Dockerfile instruction's data is lost when the container is removed if not backed by a volume?", opts: ["The writable container layer", "The FROM base image", "The RUN cache", "The ENV values"], correct: 0 },
    { q: "docker init is used to:", opts: ["Initialize a Swarm cluster", "Scaffold a Dockerfile, .dockerignore and compose.yaml for a project", "Start the daemon", "Create a volume"], correct: 1 }
  ];

  var quizScore = 0;
  var quizContainer = document.getElementById('quizContainer');

  function buildQuiz() {
    if (!quizContainer) return;
    quizContainer.innerHTML = '';
    quizData.forEach(function (item, qi) {
      var block = document.createElement('div');
      block.className = 'quiz-q';
      block.innerHTML = '<strong>Q' + (qi + 1) + '. ' + item.q + '</strong><div class="quiz-opts"></div><div class="quiz-result" id="qres' + qi + '"></div>';
      var optsWrap = block.querySelector('.quiz-opts');
      item.opts.forEach(function (opt, oi) {
        var d = document.createElement('div');
        d.className = 'quiz-opt';
        d.textContent = opt;
        d.addEventListener('click', function () { answerQuiz(qi, oi, optsWrap); });
        optsWrap.appendChild(d);
      });
      quizContainer.appendChild(block);
    });
    var qt = document.getElementById('quizTotal');
    if (qt) qt.textContent = quizData.length;
  }

  function answerQuiz(qi, oi, wrap) {
    if (wrap.dataset.locked) return;
    wrap.dataset.locked = '1';
    var item = quizData[qi];
    Array.prototype.forEach.call(wrap.children, function (c, i) {
      if (i === item.correct) c.classList.add('correct');
      else if (i === oi) c.classList.add('wrong');
    });
    var res = document.getElementById('qres' + qi);
    if (oi === item.correct) {
      quizScore++;
      res.textContent = '✅ Correct!';
      res.style.color = '#3fb950';
    } else {
      res.textContent = '❌ Correct answer: ' + item.opts[item.correct];
      res.style.color = '#f85149';
    }
    var qs = document.getElementById('quizScore');
    if (qs) qs.textContent = quizScore;
  }

  var resetBtn = document.getElementById('resetQuizBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      quizScore = 0;
      var qs = document.getElementById('quizScore');
      if (qs) qs.textContent = 0;
      buildQuiz();
    });
  }

  buildQuiz();
})();
