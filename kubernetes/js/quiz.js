(function () {
  var quizData = [
    { q: "What problem does Kubernetes solve beyond plain Docker?", opts: ["It makes images smaller", "Automatically running, healing, and scaling containers across many machines", "It replaces the need for a Dockerfile", "It's a faster version of Docker"], correct: 1 },
    { q: "What does 'desired state' mean in Kubernetes?", opts: ["The state you manually set each container to every time", "A description of what SHOULD be running, which Kubernetes continuously works to match", "A log of past deployments", "The initial boot configuration only"], correct: 1 },
    { q: "What is the smallest deployable unit in Kubernetes?", opts: ["A container directly", "A Pod, which wraps one or more containers", "A Node", "A Deployment"], correct: 1 },
    { q: "What's the relationship between a Deployment and a ReplicaSet?", opts: ["They are unrelated objects", "A Deployment manages ReplicaSets, adding rolling updates and rollback on top", "A ReplicaSet manages Deployments", "ReplicaSets are deprecated and never used"], correct: 1 },
    { q: "Why do Pods need a Service in front of them?", opts: ["Pods can't run without one", "Pods get new IPs when recreated — a Service provides a stable address that routes to healthy Pods", "Services make Pods start faster", "It's only needed for external traffic, never internal"], correct: 1 },
    { q: "Which Service type is reachable from the public internet via a cloud provider's load balancer?", opts: ["ClusterIP", "LoadBalancer", "NodePort only", "None — Kubernetes has no external access"], correct: 1 },
    { q: "What's the difference between a ConfigMap and a Secret?", opts: ["No difference, they're interchangeable", "Both store config outside the image; Secret is intended for sensitive data (though base64, not encrypted, by default)", "ConfigMaps are deprecated", "Secrets can only be created by the cluster admin"], correct: 1 },
    { q: "Why does a database need a PersistentVolumeClaim, not just a regular Volume?", opts: ["PVCs are faster", "A PVC's storage survives even if the Pod is deleted and recreated; a plain Volume does not outlive the Pod", "PVCs are required by law for databases", "There's no real difference"], correct: 1 },
    { q: "What does a readiness probe control?", opts: ["Whether the container restarts on crash", "Whether the Service sends traffic to this Pod yet", "How much CPU the Pod can use", "The Pod's scheduled node"], correct: 1 },
    { q: "What does a HorizontalPodAutoscaler (HPA) do?", opts: ["Scales the cluster's physical nodes only", "Automatically adjusts the number of Pod replicas based on a metric like CPU usage", "Resizes a single Pod's memory limit", "Only works with Helm charts"], correct: 1 }
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
      res.style.color = '#3fdd94';
    } else {
      res.textContent = '❌ Correct answer: ' + item.opts[item.correct];
      res.style.color = '#ff6b6b';
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
