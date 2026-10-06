(function () {
  var commands = [
    ["kubectl get pods", "List all Pods in the current namespace"],
    ["kubectl get pods -A", "List Pods across ALL namespaces"],
    ["kubectl get deployments", "List all Deployments"],
    ["kubectl get services", "List all Services"],
    ["kubectl describe pod <name>", "Full details and recent events for a Pod"],
    ["kubectl logs <pod-name>", "View a Pod's container logs"],
    ["kubectl logs -f <pod-name>", "Stream (follow) a Pod's logs live"],
    ["kubectl exec -it <pod-name> -- bash", "Open an interactive shell inside a running Pod"],
    ["kubectl apply -f file.yaml", "Create or update resources from a YAML file"],
    ["kubectl delete -f file.yaml", "Delete resources defined in a YAML file"],
    ["kubectl delete pod <name>", "Delete a specific Pod (a Deployment will recreate it)"],
    ["kubectl scale deployment <name> --replicas=5", "Change the number of running replicas"],
    ["kubectl set image deployment/<name> app=img:tag", "Update a Deployment's container image"],
    ["kubectl rollout status deployment/<name>", "Watch a rolling update's progress"],
    ["kubectl rollout undo deployment/<name>", "Roll back to the previous Deployment version"],
    ["kubectl create namespace <name>", "Create a new namespace"],
    ["kubectl config set-context --current --namespace=<ns>", "Switch your default working namespace"],
    ["kubectl create configmap <name> --from-literal=K=V", "Create a ConfigMap from a key-value pair"],
    ["kubectl create secret generic <name> --from-literal=K=V", "Create a Secret from a key-value pair"],
    ["kubectl autoscale deployment <name> --cpu-percent=70 --min=2 --max=10", "Set up a HorizontalPodAutoscaler"],
    ["kubectl top pods", "Show live CPU/memory usage per Pod"],
    ["kubectl get events --sort-by=.lastTimestamp", "Recent cluster events, oldest first"],
    ["helm install <release> <chart>", "Install a Helm chart as a new release"],
    ["helm upgrade <release> <chart>", "Upgrade an existing Helm release"],
    ["kubectl config get-contexts", "List the clusters/contexts kubectl knows about"],
    ["kubectl config use-context <name>", "Switch kubectl to a different cluster/context"]
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
