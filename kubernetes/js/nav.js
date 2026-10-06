document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\u2638\uFE0F</span><div><h1>Kubernetes Study</h1><span>Beginner \u2192 Advanced</span></div></div>',

    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 Why Kubernetes?</a>',
    '<a class="nav-item" href="architecture.html">\u2461 Architecture in depth</a>',
    '<a class="nav-item" href="setup.html">\u2462 Local setup (kind/minikube)</a>',
    '<a class="nav-item" href="kubectl.html">\u2463 kubectl &amp; kubeconfig</a>',

    '<div class="nav-title">Workloads</div>',
    '<a class="nav-item" href="pods-deployments.html">\u2464 Pods in depth</a>',
    '<a class="nav-item" href="labels-selectors.html">\u2465 Labels &amp; selectors</a>',
    '<a class="nav-item" href="deployments.html">\u2466 Deployments in depth</a>',
    '<a class="nav-item" href="statefulsets.html">\u2467 StatefulSets</a>',
    '<a class="nav-item" href="daemonsets.html">\u2468 DaemonSets</a>',
    '<a class="nav-item" href="jobs-cronjobs.html">\u2469 Jobs &amp; CronJobs</a>',

    '<div class="nav-title">Networking</div>',
    '<a class="nav-item" href="services-networking.html">\u246A Services &amp; DNS</a>',
    '<a class="nav-item" href="ingress-gateway.html">\u246B Ingress &amp; Gateway API</a>',

    '<div class="nav-title">Config &amp; Storage</div>',
    '<a class="nav-item" href="config-storage.html">\u246C ConfigMaps &amp; Secrets</a>',
    '<a class="nav-item" href="storage.html">\u246D Storage (PV/PVC)</a>',

    '<div class="nav-title">Running reliably</div>',
    '<a class="nav-item" href="resources-qos.html">\u246E Resources &amp; QoS</a>',
    '<a class="nav-item" href="probes.html">\u246F Health probes</a>',
    '<a class="nav-item" href="autoscaling.html">\u2470 Autoscaling (HPA/VPA/CA)</a>',
    '<a class="nav-item" href="namespaces-quotas.html">\u2471 Namespaces &amp; quotas</a>',
    '<a class="nav-item" href="scheduling.html">\u2472 Scheduling &amp; affinity</a>',

    '<div class="nav-title">Security &amp; Packaging</div>',
    '<a class="nav-item" href="rbac.html">\u2473 RBAC &amp; ServiceAccounts</a>',
    '<a class="nav-item" href="security.html">\uD83D\uDEE1\uFE0F Pod security &amp; NetworkPolicy</a>',
    '<a class="nav-item" href="helm.html">\u2388 Helm</a>',
    '<a class="nav-item" href="advanced.html">\uD83C\uDF9B\uFE0F Advanced recap</a>',
    '<a class="nav-item" href="troubleshooting.html">\uD83E\uDE7A Troubleshooting runbook</a>',

    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="playground.html">\uD83D\uDD79\uFE0F Playground</a>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83D\uDCBC Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\uD83C\uDFA5 Video Library</a>',
    '<a class="nav-item" href="labs.html">\uD83E\uDDEA Labs</a>'
  ].join('');

  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
