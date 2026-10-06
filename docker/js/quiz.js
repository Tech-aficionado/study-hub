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
    { q: "CMD vs ENTRYPOINT: if a Dockerfile has ENTRYPOINT [\"python\"] and CMD [\"app.py\"], what does docker run myimg other.py execute?", opts: ["python app.py", "python other.py", "other.py app.py", "It errors out"], correct: 1 }
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
