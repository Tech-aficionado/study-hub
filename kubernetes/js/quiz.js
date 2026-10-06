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
    { q: "What does a HorizontalPodAutoscaler (HPA) do?", opts: ["Scales the cluster's physical nodes only", "Automatically adjusts the number of Pod replicas based on a metric like CPU usage", "Resizes a single Pod's memory limit", "Only works with Helm charts"], correct: 1 },
    { q: "On 'kubectl apply', which component is the ONLY one that reads/writes etcd?", opts: ["The scheduler", "The kubelet", "The API server", "kube-proxy"], correct: 2 },
    { q: "What is etcd's role in a cluster?", opts: ["Runs the containers", "A distributed key-value store holding all cluster state (the source of truth)", "Load-balances traffic", "Builds container images"], correct: 1 },
    { q: "Which component decides WHICH node a new Pod runs on?", opts: ["kubelet", "kube-scheduler", "kube-proxy", "etcd"], correct: 1 },
    { q: "What does restartPolicy: Always vs OnFailure vs Never control?", opts: ["Which node a Pod lands on", "Whether/when the kubelet restarts a container within the Pod", "How Services route traffic", "The image pull policy"], correct: 1 },
    { q: "What do init containers do?", opts: ["Run alongside the app forever", "Run one at a time to completion BEFORE any app container starts", "Replace the main container", "Only run on control-plane nodes"], correct: 1 },
    { q: "How do you declare a 'native sidecar' container (v1.29+)?", opts: ["A second entry under spec.containers", "An initContainer with restartPolicy: Always", "A separate Pod", "A DaemonSet"], correct: 1 },
    { q: "What is the difference between a label and an annotation?", opts: ["No difference", "Labels are selectable/identifying; annotations are non-selectable arbitrary metadata", "Annotations are selectable; labels are not", "Labels can only be set by admins"], correct: 1 },
    { q: "Why must a StatefulSet (not a Deployment) back a clustered database?", opts: ["It's faster", "It gives each replica a stable name, its own PVC, and ordered operations", "It uses less memory", "Deployments can't use volumes"], correct: 1 },
    { q: "What does a DaemonSet guarantee?", opts: ["Exactly 3 replicas", "One Pod on every (matching) node", "Pods only on control-plane nodes", "A Pod per namespace"], correct: 1 },
    { q: "Which restartPolicy values are valid for a Job's Pod template?", opts: ["Always only", "OnFailure or Never", "Always or OnFailure", "Any value"], correct: 1 },
    { q: "A headless Service is created with…", opts: ["type: LoadBalancer", "clusterIP: None (DNS returns individual Pod IPs)", "a NodePort", "no selector"], correct: 1 },
    { q: "An Ingress object has no effect unless you also have…", opts: ["a LoadBalancer Service", "an Ingress Controller installed", "a second cluster", "a StatefulSet"], correct: 1 },
    { q: "Which API group/version should a modern Ingress use?", opts: ["extensions/v1beta1", "networking.k8s.io/v1beta1", "networking.k8s.io/v1", "apps/v1"], correct: 2 },
    { q: "A ConfigMap consumed as ENV VARS behaves how when the ConfigMap changes?", opts: ["Updates live instantly", "Does NOT update until the Pod restarts", "Deletes the Pod", "Updates after 24h"], correct: 1 },
    { q: "Most cloud block disks (EBS/PD) support which access mode?", opts: ["ReadWriteMany", "ReadWriteOnce (one node at a time)", "ReadOnlyMany only", "No access modes"], correct: 1 },
    { q: "A container exceeds its MEMORY limit. What happens?", opts: ["It's throttled (slowed)", "It's OOMKilled (exit 137)", "Nothing", "The node reboots"], correct: 1 },
    { q: "A container exceeds its CPU limit. What happens?", opts: ["OOMKilled", "It's throttled (slowed), never killed", "The Pod is evicted", "A new node is added"], correct: 1 },
    { q: "Which QoS class is evicted FIRST under node memory pressure?", opts: ["Guaranteed", "Burstable", "BestEffort", "They're evicted equally"], correct: 2 },
    { q: "A liveness probe failure causes…", opts: ["removal from Service endpoints", "a container restart", "a new node", "nothing"], correct: 1 },
    { q: "A readiness probe failure causes…", opts: ["a container restart", "the Pod to be removed from Service endpoints (no restart)", "an OOMKill", "a rollback"], correct: 1 },
    { q: "An HPA on CPU needs which TWO things to work?", opts: ["Helm and Tiller", "metrics-server installed AND resource requests set on the Pods", "A LoadBalancer and an Ingress", "Two clusters"], correct: 1 },
    { q: "What is the difference between node affinity and taints/tolerations?", opts: ["They're identical", "Affinity = Pod chooses nodes; taints = node repels Pods unless tolerated", "Taints attract Pods", "Affinity only works on control-plane"], correct: 1 },
    { q: "RBAC rules are…", opts: ["allow and deny", "purely additive (allow-only); everything defaults to denied", "deny-only", "ignored by the API server"], correct: 1 },
    { q: "What identity does a Pod use to call the Kubernetes API?", opts: ["The cluster admin", "A ServiceAccount", "The node's root user", "No identity"], correct: 1 },
    { q: "What replaced PodSecurityPolicy (removed in v1.25)?", opts: ["Nothing", "Pod Security Admission enforcing Pod Security Standards", "NetworkPolicy", "RBAC"], correct: 1 },
    { q: "Without any NetworkPolicy, Pod-to-Pod traffic is…", opts: ["fully blocked", "allowed everywhere (even across namespaces)", "allowed only in the same node", "encrypted by default"], correct: 1 },
    { q: "What major change did Helm 3 make over Helm 2?", opts: ["Added Tiller", "Removed the server-side Tiller component (clientless)", "Dropped templating", "Required a database"], correct: 1 },
    { q: "A Pod stuck in 'Pending' most likely means…", opts: ["the image won't pull", "the scheduler can't place it (resources/taint/unbound PVC)", "it's OOMKilled", "the Service has no endpoints"], correct: 1 },
    { q: "A Service exists but nothing responds. First thing to check?", opts: ["Node CPU", "Its endpoints (selector match + Pod readiness + targetPort)", "The Helm release", "etcd backups"], correct: 1 }
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
