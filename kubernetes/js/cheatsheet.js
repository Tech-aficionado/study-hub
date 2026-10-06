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
    ["kubectl config use-context <name>", "Switch kubectl to a different cluster/context"],
    ["kubectl config current-context", "Show which context commands currently target"],
    ["kubectl get pods -o wide", "Pods with extra columns (IP, node)"],
    ["kubectl get pods --show-labels", "Pods with their labels"],
    ["kubectl get pods -l app=web", "Filter Pods by label selector"],
    ["kubectl get all -A", "Common resources across every namespace"],
    ["kubectl get endpointslices", "The IP:port endpoints backing Services"],
    ["kubectl get pod <name> -o yaml", "Full YAML of a single object"],
    ["kubectl explain deployment.spec.strategy", "Offline schema docs for a field"],
    ["kubectl api-resources", "Every resource type and its short name"],
    ["kubectl run tmp --rm -it --image=busybox -- sh", "Throwaway debug Pod with a shell"],
    ["kubectl exec -it <pod> -c <ctr> -- sh", "Shell into a specific container"],
    ["kubectl logs <pod> --previous", "Logs from the previous (crashed) container"],
    ["kubectl logs -f -l app=web", "Follow logs across all matching Pods"],
    ["kubectl cp <pod>:/path ./local", "Copy a file out of a Pod"],
    ["kubectl rollout pause deployment/<name>", "Freeze a rollout mid-way (for canary)"],
    ["kubectl rollout resume deployment/<name>", "Resume a paused rollout"],
    ["kubectl rollout restart deployment/<name>", "Restart all Pods (re-read ConfigMaps/Secrets)"],
    ["kubectl rollout undo deployment/<name> --to-revision=N", "Roll back to a specific revision"],
    ["kubectl annotate deployment/<name> kubernetes.io/change-cause='msg'", "Record a change-cause for rollout history"],
    ["kubectl label pod <name> key=val", "Add or change a label"],
    ["kubectl label pod <name> key-", "Remove a label (trailing dash)"],
    ["kubectl expose deployment <name> --port=80 --type=NodePort", "Create a Service for a Deployment"],
    ["kubectl port-forward svc/<name> 8080:80", "Tunnel a Service port to localhost"],
    ["kubectl get svc <name> -o jsonpath='{.spec.clusterIP}'", "Extract one field with JSONPath"],
    ["kubectl create job --from=cronjob/<name> run-1", "Manually trigger a CronJob now"],
    ["kubectl get jobs --watch", "Watch Jobs progress live"],
    ["kubectl create configmap <n> --from-file=app.conf", "ConfigMap from a file (filename=key)"],
    ["kubectl create secret tls <n> --cert=c.crt --key=c.key", "TLS Secret for Ingress"],
    ["kubectl create secret docker-registry regcred --docker-server=... --docker-username=... --docker-password=...", "Private-registry pull Secret"],
    ["kubectl get pvc", "List PersistentVolumeClaims and their status"],
    ["kubectl get storageclass", "List StorageClasses (default marked)"],
    ["kubectl describe pvc <name>", "Why a PVC is Pending/Bound"],
    ["kubectl auth can-i list pods -n <ns>", "Check your own permissions"],
    ["kubectl auth can-i create deploy --as=alice", "Check another identity's permissions"],
    ["kubectl auth can-i --list", "List everything you're allowed to do"],
    ["kubectl create serviceaccount <name>", "Create a ServiceAccount"],
    ["kubectl taint nodes <node> key=val:NoSchedule", "Add a taint to repel Pods"],
    ["kubectl cordon <node>", "Mark a node unschedulable"],
    ["kubectl drain <node> --ignore-daemonsets --delete-emptydir-data", "Evict Pods for maintenance"],
    ["kubectl uncordon <node>", "Return a node to the schedulable pool"],
    ["kubectl top nodes", "Live CPU/memory per node (needs metrics-server)"],
    ["kubectl get hpa", "List HorizontalPodAutoscalers and their targets"],
    ["kubectl describe node <name>", "Node capacity, taints, and running Pods"],
    ["kubectl apply -k ./overlay", "Apply a Kustomize overlay"],
    ["helm upgrade --install <rel> ./chart -f values.yaml", "Install or upgrade a release in one step"],
    ["helm template <rel> ./chart", "Render a chart locally without applying"],
    ["helm rollback <rel> <revision>", "Roll back a Helm release"],
    ["helm list", "List installed Helm releases"],
    ["kubectl get events --sort-by=.lastTimestamp", "Recent cluster events, oldest first"],
    ["kubectl delete pod <name> --grace-period=0 --force", "Force-delete a stuck Pod (last resort)"]
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
