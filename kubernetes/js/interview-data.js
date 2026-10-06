/* Kubernetes interview questions — authored for Study Hub. Sources confirmed real.
 * HackerRank cites the competencies listed on its Kubernetes Basic / Intermediate
 * skills-directory pages (confirmed HTTP 200). All other questions cite the specific
 * kubernetes.io page they are grounded in. LeetCode and HackerEarth have no Kubernetes
 * problem sets, so they are not cited for this topic. */
window.STUDYHUB_INTERVIEW = {
  topic: 'kubernetes',
  playground: 'playground.html',
  questions: [

  // ============ CONCEPT — foundations ============
  {
    id: 'k8s-concept-what-is', level: 'easy', category: 'Foundations', type: 'concept',
    q: 'What is Kubernetes and what problem does it solve beyond plain Docker?',
    answer: '<p>Kubernetes is an open-source <strong>container orchestrator</strong>. Docker packages and runs a single container; Kubernetes runs and manages containers across a fleet of machines. You declare a <strong>desired state</strong> (e.g. "5 replicas of this app, always"), and control loops continuously reconcile reality toward it — self-healing, scaling, rolling updates, scheduling and service discovery, none of which plain Docker provides.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — competency overview', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' }
  },
  {
    id: 'k8s-concept-desired-state', level: 'easy', category: 'Foundations', type: 'concept',
    q: 'Explain "desired state" and the reconciliation loop.',
    answer: '<p>You never imperatively "start a container"; you declare what should exist (a Deployment of 5 replicas). Each controller runs a loop forever: <strong>observe</strong> current state, <strong>compare</strong> with the spec, <strong>act</strong> to close the gap. Delete a Pod a Deployment owns and the ReplicaSet controller notices "4 running, 5 wanted" and creates a replacement — no event handler, just the loop converging on desired state.</p>',
    source: { site: 'Kubernetes docs', label: 'Controllers', url: 'https://kubernetes.io/docs/concepts/architecture/controller/' }
  },
  {
    id: 'k8s-concept-cp-vs-worker', level: 'easy', category: 'Architecture', type: 'concept',
    q: 'What are the control-plane and worker-node components, and what does each do?',
    answer: '<p><strong>Control plane:</strong> <code>kube-apiserver</code> (the only front door; everything talks through it), <code>etcd</code> (the key-value store holding all cluster state), <code>kube-scheduler</code> (chooses which node a Pod runs on), <code>kube-controller-manager</code> (the reconciliation loops), and optionally <code>cloud-controller-manager</code>.</p><p><strong>Worker node:</strong> <code>kubelet</code> (agent that runs the Pods assigned to its node), the <strong>container runtime</strong> (containerd/CRI-O), and <code>kube-proxy</code> (programs Service networking).</p>',
    source: { site: 'Kubernetes docs', label: 'Kubernetes Components', url: 'https://kubernetes.io/docs/concepts/overview/components/' }
  },
  {
    id: 'k8s-concept-apply-flow', level: 'hard', category: 'Architecture', type: 'concept',
    q: 'Walk through exactly what happens when you run kubectl apply -f deployment.yaml.',
    answer: '<ol><li>kubectl sends the manifest to the <strong>API server</strong> over HTTPS.</li><li>The API server authenticates, authorizes (RBAC), runs admission controllers, validates, and writes the object to <strong>etcd</strong>.</li><li>The <strong>Deployment controller</strong> sees the new Deployment and creates a <strong>ReplicaSet</strong>.</li><li>The <strong>ReplicaSet controller</strong> creates the required number of Pod objects (unscheduled).</li><li>The <strong>scheduler</strong> binds each Pod to a node.</li><li>That node\'s <strong>kubelet</strong> tells the container runtime to pull the image and start the containers, then reports status back.</li></ol><p>Key insight: no component does it all — each watches the API server and reacts to what the previous one created.</p>',
    source: { site: 'Kubernetes docs', label: 'Cluster Architecture', url: 'https://kubernetes.io/docs/concepts/architecture/' }
  },
  {
    id: 'k8s-concept-etcd', level: 'medium', category: 'Architecture', type: 'concept',
    q: 'What is etcd and why does only the API server talk to it?',
    answer: '<p><code>etcd</code> is a consistent, distributed key-value store holding the entire cluster state — the single source of truth. Only the <strong>API server</strong> reads/writes it, so that all access runs through one place that enforces authentication, authorization and validation. That is why securing the API server (and backing up etcd) secures the cluster: lose etcd without a backup and you lose the cluster\'s memory.</p>',
    source: { site: 'Kubernetes docs', label: 'Operating etcd clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/' }
  },

  // ============ Pods ============
  {
    id: 'k8s-concept-pod', level: 'easy', category: 'Pods', type: 'concept',
    q: 'What is a Pod and why is it the smallest unit instead of a container?',
    answer: '<p>A <strong>Pod</strong> is one or more containers that always run together on the same node, sharing a network namespace (same IP, reach each other on <code>localhost</code>) and able to share volumes. Kubernetes schedules Pods, not bare containers, so helper containers (sidecars) can be co-located with the main app. Usually a Pod holds exactly one container.</p>',
    source: { site: 'Kubernetes docs', label: 'Pods', url: 'https://kubernetes.io/docs/concepts/workloads/pods/' }
  },
  {
    id: 'k8s-concept-pod-phases', level: 'medium', category: 'Pods', type: 'concept',
    q: 'What are the Pod phases, and how do they differ from CrashLoopBackOff/ImagePullBackOff?',
    answer: '<p>Phases (<code>status.phase</code>) are coarse: <strong>Pending, Running, Succeeded, Failed, Unknown</strong>. States like <code>CrashLoopBackOff</code>, <code>ImagePullBackOff</code>, <code>OOMKilled</code> and <code>ContainerCreating</code> are container-level <em>waiting/terminated reasons</em>, not phases — they are what <code>kubectl get pods</code> prints in the STATUS column and what you actually debug with.</p>',
    source: { site: 'Kubernetes docs', label: 'Pod Lifecycle', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/' }
  },
  {
    id: 'k8s-concept-restartpolicy', level: 'medium', category: 'Pods', type: 'concept',
    q: 'What does restartPolicy control, and what are its values?',
    answer: '<p><code>spec.restartPolicy</code> controls the kubelet restarting <em>containers within a Pod</em>: <strong>Always</strong> (default; required by Deployments), <strong>OnFailure</strong> (only non-zero exit; used by retrying Jobs), <strong>Never</strong>. Restarts use exponential back-off (up to 5 min), which is why a repeatedly-crashing container shows <code>CrashLoopBackOff</code>. Note it restarts a container <em>in place</em>; rescheduling onto another node is a separate controller mechanism.</p>',
    source: { site: 'Kubernetes docs', label: 'Pod Lifecycle — restartPolicy', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy' }
  },
  {
    id: 'k8s-concept-init-containers', level: 'medium', category: 'Pods', type: 'concept',
    q: 'What are init containers and how do they differ from sidecars?',
    answer: '<p><strong>Init containers</strong> run one at a time, in order, to completion <em>before</em> any app container starts — used to wait for a dependency or run a migration. A <strong>sidecar</strong> is a long-running helper that runs <em>alongside</em> the app (log shipper, proxy). Since v1.29/stable 1.33, a native sidecar is declared as an init container with <code>restartPolicy: Always</code>, so it starts first, runs throughout, and stops after the app.</p>',
    source: { site: 'Kubernetes docs', label: 'Init Containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/' }
  },

  // ============ Labels ============
  {
    id: 'k8s-concept-labels-annotations', level: 'easy', category: 'Labels', type: 'concept',
    q: 'What is the difference between labels and annotations?',
    answer: '<p><strong>Labels</strong> are identifying, <em>selectable</em> key/value metadata — Services, Deployments and <code>kubectl -l</code> query by them. <strong>Annotations</strong> are non-identifying, <em>non-selectable</em> metadata for humans/tools (build info, change-cause, controller settings) and may be large. Rule of thumb: if you query by it, it is a label; if it is just attached data, it is an annotation.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Intermediate) — Working with Labels', url: 'https://www.hackerrank.com/skills-directory/kubernetes_intermediate' }
  },
  {
    id: 'k8s-coding-selector-mismatch', level: 'medium', category: 'Labels', type: 'coding',
    q: 'A Deployment is rejected at apply time complaining about selector/template labels. Why, and how do you write it correctly?',
    answer: '<p>A Deployment\'s <code>spec.selector.matchLabels</code> must match the Pod template\'s <code>metadata.labels</code>, and the selector is immutable after creation. If they differ the API server rejects it.</p><pre><code>spec:\n  selector:\n    matchLabels: { app: web }\n  template:\n    metadata:\n      labels: { app: web }   # MUST match the selector\n    spec:\n      containers: [{ name: web, image: nginx }]</code></pre>',
    source: { site: 'Kubernetes docs', label: 'Deployments — selector', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#selector' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=3', starter: 'kubectl get pods --show-labels' }
  },

  // ============ Deployments ============
  {
    id: 'k8s-concept-deploy-rs-pod', level: 'easy', category: 'Deployments', type: 'concept',
    q: 'Explain the relationship between a Deployment, a ReplicaSet, and Pods.',
    answer: '<p>A <strong>Deployment</strong> manages <strong>ReplicaSets</strong>; each ReplicaSet keeps N identical Pods running. On every Pod-template change the Deployment creates a <em>new</em> ReplicaSet and scales the old one down — that is what enables rolling updates and instant rollback (the old ReplicaSet is kept at 0 and scaled back up on undo). You almost never manage a ReplicaSet directly.</p>',
    source: { site: 'Kubernetes docs', label: 'Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' }
  },
  {
    id: 'k8s-concept-maxsurge', level: 'hard', category: 'Deployments', type: 'concept',
    q: 'What do maxSurge and maxUnavailable control in a RollingUpdate?',
    answer: '<p>During a rolling update: <strong>maxSurge</strong> (default 25%) is how many extra Pods above desired may exist (faster rollout, more peak resources); <strong>maxUnavailable</strong> (default 25%) is how many may be missing below desired. Set <code>maxUnavailable: 0</code> for strict zero-downtime. They can\'t both be 0 (no room to progress). The alternative strategy, <code>Recreate</code>, kills all old Pods first — a downtime gap, needed when two versions can\'t coexist.</p>',
    source: { site: 'Kubernetes docs', label: 'Deployments — RollingUpdate', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment' }
  },
  {
    id: 'k8s-coding-rolling-update', level: 'medium', category: 'Deployments', type: 'coding',
    q: 'Ship a new image with zero downtime, verify the rollout, and roll back if it is bad.',
    answer: '<pre><code>kubectl set image deployment/web app=myapp:2.0\nkubectl annotate deployment/web kubernetes.io/change-cause="to 2.0"\nkubectl rollout status deployment/web\n# bad? instant rollback:\nkubectl rollout undo deployment/web\nkubectl rollout history deployment/web</code></pre><p>A new rollout only triggers on a <em>template</em> change; changing just <code>replicas</code> scales in place.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — Deployments and Clusters', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=3', starter: 'kubectl set image deployment/web web=nginx:1.27' }
  },
  {
    id: 'k8s-scenario-canary', level: 'hard', category: 'Deployments', type: 'scenario',
    q: 'How do you do a canary or blue-green release in Kubernetes? Can a plain Deployment do it?',
    answer: '<p>A plain Deployment only does <em>rolling</em> updates — it cannot weight traffic by percentage. You assemble the patterns:</p><ul><li><strong>Blue-green:</strong> two Deployments (blue=current, green=new); a Service selector points at one; flip the selector to cut over instantly.</li><li><strong>Canary:</strong> a shared label Service across a large stable Deployment + a tiny canary Deployment gives replicas-proportional traffic; for precise percentages use an Ingress controller, a service mesh (Istio/Linkerd), the Gateway API\'s weighted backendRefs, or Argo Rollouts.</li></ul><p>Honest answer in an interview: name the building blocks, don\'t claim a Deployment field does it.</p>',
    source: { site: 'Kubernetes docs', label: 'Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' }
  },

  // ============ StatefulSets / DaemonSets / Jobs ============
  {
    id: 'k8s-concept-statefulset', level: 'hard', category: 'Workloads', type: 'concept',
    q: 'When would you use a StatefulSet instead of a Deployment?',
    answer: '<p>When each replica needs a <strong>stable identity</strong> — a predictable name (<code>db-0</code>, <code>db-1</code>) and DNS via a headless Service, its <strong>own persistent disk</strong> (via <code>volumeClaimTemplates</code>, one PVC per Pod that follows it across reschedules), and <strong>ordered</strong> startup/scaling/updates. Databases, queues and clustered stores need this; stateless web apps don\'t and should use a Deployment.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Intermediate) — Stateful Applications', url: 'https://www.hackerrank.com/skills-directory/kubernetes_intermediate' }
  },
  {
    id: 'k8s-concept-daemonset', level: 'medium', category: 'Workloads', type: 'concept',
    q: 'What is a DaemonSet and what runs as one?',
    answer: '<p>A <strong>DaemonSet</strong> ensures one copy of a Pod runs on every (matching) node, adding/removing Pods automatically as nodes join/leave — there is no replica count. Used for node-level agents: log collectors (Fluent Bit), node-exporter, CNI plugins, <code>kube-proxy</code>, CSI node drivers. Add tolerations so it can also run on tainted/control-plane nodes.</p>',
    source: { site: 'Kubernetes docs', label: 'DaemonSet', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/' }
  },
  {
    id: 'k8s-concept-job-cronjob', level: 'medium', category: 'Workloads', type: 'concept',
    q: 'What is the difference between a Job and a CronJob, and what restartPolicy must a Job use?',
    answer: '<p>A <strong>Job</strong> runs a Pod to completion (retries on failure via <code>backoffLimit</code>, then stops) — migrations, backups, batch. A <strong>CronJob</strong> creates Jobs on a schedule (UTC unless <code>spec.timeZone</code> set). A Job\'s template must use <code>restartPolicy: OnFailure</code> or <code>Never</code> (never <code>Always</code>). CronJobs guarantee at-least-once, so make the work idempotent.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — Workloads (jobs & crons)', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' }
  },
  {
    id: 'k8s-coding-cronjob', level: 'medium', category: 'Workloads', type: 'coding',
    q: 'Write a CronJob that runs a backup every night at 02:00 and never overlaps.',
    answer: '<pre><code>apiVersion: batch/v1\nkind: CronJob\nmetadata: { name: backup }\nspec:\n  schedule: "0 2 * * *"\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n          - name: backup\n            image: myapp:1.0\n            command: ["sh","-c","pg_dump ... | gzip > /b/db.gz"]</code></pre><p><code>concurrencyPolicy: Forbid</code> skips a new run while the previous is still going.</p>',
    source: { site: 'Kubernetes docs', label: 'CronJob', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/' }
  },

  // ============ Services & networking ============
  {
    id: 'k8s-concept-why-service', level: 'easy', category: 'Networking', type: 'concept',
    q: 'Why do Pods need a Service in front of them?',
    answer: '<p>Pods are disposable: each restart or scale gives a new IP. A <strong>Service</strong> is a stable virtual IP + DNS name that load-balances across whichever healthy Pods currently match its label selector, so callers never chase changing Pod IPs.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — Accessing applications with Services', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' }
  },
  {
    id: 'k8s-concept-service-types', level: 'medium', category: 'Networking', type: 'concept',
    q: 'Compare ClusterIP, NodePort, LoadBalancer, ExternalName and headless Services.',
    answer: '<p><strong>ClusterIP</strong> (default): internal-only. <strong>NodePort</strong>: a fixed port on every node (30000–32767), dev/test external access. <strong>LoadBalancer</strong>: a real external IP via the cloud. <strong>ExternalName</strong>: a CNAME to an outside host (no selector/Pods). <strong>Headless</strong> (<code>clusterIP: None</code>): no virtual IP — DNS returns the individual Pod IPs, used by StatefulSets. They nest: NodePort is a ClusterIP + node port; LoadBalancer is a NodePort + cloud LB.</p>',
    source: { site: 'Kubernetes docs', label: 'Service', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' }
  },
  {
    id: 'k8s-concept-dns', level: 'easy', category: 'Networking', type: 'concept',
    q: 'How does one Pod reach a Service by name?',
    answer: '<p>CoreDNS gives every Service a name of the form <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>. Within the same namespace the short name works (<code>my-app</code>); across namespaces use <code>my-app.staging</code>. Always use names, never IPs — names are stable, Pod IPs are not.</p>',
    source: { site: 'Kubernetes docs', label: 'DNS for Services and Pods', url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/' }
  },
  {
    id: 'k8s-concept-endpointslices', level: 'medium', category: 'Networking', type: 'concept',
    q: 'What are EndpointSlices and how do they relate to a Service?',
    answer: '<p>A Service\'s selector doesn\'t route by itself. The EndpointSlice controller watches for matching, <em>Ready</em> Pods and records their IP:port into <strong>EndpointSlice</strong> objects; <code>kube-proxy</code> (or the CNI) programs the dataplane from them. EndpointSlices replaced the single <code>Endpoints</code> object, which didn\'t scale past thousands of endpoints, by sharding into many small objects.</p>',
    source: { site: 'Kubernetes docs', label: 'EndpointSlices', url: 'https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/' }
  },
  {
    id: 'k8s-concept-ingress', level: 'medium', category: 'Networking', type: 'concept',
    q: 'What is an Ingress and why does it need an Ingress Controller?',
    answer: '<p>An <strong>Ingress</strong> (<code>networking.k8s.io/v1</code>) is a set of L7 rules routing HTTP(S) by host/path to internal Services behind one IP + TLS cert. The <code>Ingress</code> object is only rules — you must install an <strong>Ingress Controller</strong> (ingress-nginx, Traefik, a cloud one) that actually serves the traffic. No controller = the Ingress does nothing. In v1, <code>pathType</code> is required and the backend is <code>service.name</code>+<code>service.port</code>.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Intermediate) — Ingress Controller', url: 'https://www.hackerrank.com/skills-directory/kubernetes_intermediate' }
  },
  {
    id: 'k8s-concept-gateway-api', level: 'hard', category: 'Networking', type: 'concept',
    q: 'What is the Gateway API and how does it improve on Ingress?',
    answer: '<p>The <strong>Gateway API</strong> (<code>gateway.networking.k8s.io</code>, GA since v1.0) is the role-oriented successor to Ingress. It splits the single overloaded object into <strong>GatewayClass</strong> (implementation), <strong>Gateway</strong> (listeners/ports/TLS, owned by operators) and <strong>HTTPRoute</strong> (routing rules, owned by developers). Header-based routing, weighted traffic splitting (native canary) and cross-namespace refs are first-class fields instead of controller-specific annotations.</p>',
    source: { site: 'Kubernetes docs', label: 'Gateway API', url: 'https://kubernetes.io/docs/concepts/services-networking/gateway/' }
  },
  {
    id: 'k8s-scenario-no-endpoints', level: 'hard', category: 'Networking', type: 'scenario',
    q: 'A Service exists but nothing responds through it. How do you diagnose it?',
    answer: '<p>Almost always <strong>empty endpoints</strong>. Check <code>kubectl get endpointslices -l kubernetes.io/service-name=&lt;svc&gt;</code> or the <code>Endpoints:</code> line in <code>kubectl describe svc</code>. Three usual causes: (1) the Service <code>selector</code> doesn\'t match the Pods\' labels; (2) Pods are failing their readiness probe (not Ready → not an endpoint); (3) <code>targetPort</code> ≠ the real <code>containerPort</code>. Fix the mismatch, not the Service type.</p>',
    source: { site: 'Kubernetes docs', label: 'Debug Services', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=2\nkubectl expose deployment web --port=80 --type=ClusterIP', starter: 'kubectl describe svc web' }
  },

  // ============ Config & storage ============
  {
    id: 'k8s-concept-cm-vs-secret', level: 'easy', category: 'Config', type: 'concept',
    q: 'What is the difference between a ConfigMap and a Secret?',
    answer: '<p>Both inject configuration into Pods, keeping it out of the image. A <strong>ConfigMap</strong> holds non-secret config; a <strong>Secret</strong> is for sensitive data and is stored <strong>base64-encoded</strong> — which is encoding, not encryption. A Secret is not secure by default; it needs encryption-at-rest and tight RBAC.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — configs and secret data', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' }
  },
  {
    id: 'k8s-concept-env-vs-volume', level: 'medium', category: 'Config', type: 'concept',
    q: 'What is the difference between consuming a ConfigMap as env vars vs as a mounted volume?',
    answer: '<p><strong>Env vars</strong> are set once at container start and do <em>not</em> update when the ConfigMap changes — you must restart the Pod (<code>kubectl rollout restart</code>). <strong>Mounted volumes</strong> expose each key as a file and <em>do</em> refresh in place (with a short delay). Use env for simple scalars, volumes for config files, certs, or values the app re-reads.</p>',
    source: { site: 'Kubernetes docs', label: 'ConfigMaps', url: 'https://kubernetes.io/docs/concepts/configuration/configmap/' }
  },
  {
    id: 'k8s-concept-secret-encryption', level: 'hard', category: 'Config', type: 'concept',
    q: 'How do you actually make Secrets secure?',
    answer: '<p>By default a Secret is only base64 in etcd. Harden it with: <strong>encryption at rest</strong> (API server <code>EncryptionConfiguration</code>, AES-GCM or a KMS provider) — the most important fix; tight <strong>RBAC</strong> on who can get/list Secrets; an <strong>external store</strong> (Vault, cloud secret manager, External Secrets Operator); and preferring volume mounts over env vars for secrets. Never commit raw Secret YAML to Git.</p>',
    source: { site: 'Kubernetes docs', label: 'Encrypting Secret Data at Rest', url: 'https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/' }
  },
  {
    id: 'k8s-concept-pv-pvc', level: 'medium', category: 'Storage', type: 'concept',
    q: 'Explain PersistentVolume, PersistentVolumeClaim and StorageClass.',
    answer: '<p>A <strong>PV</strong> is a piece of real cluster storage (cloud disk, NFS). A <strong>PVC</strong> is a Pod\'s request for storage ("10Gi RWO"); the Pod mounts the PVC, not the PV. A <strong>StorageClass</strong> describes a kind of storage so a matching PV is <em>dynamically provisioned</em> on demand when a PVC references it. You rarely create PVs by hand — you create a PVC and the StorageClass\'s provisioner creates the PV and the real disk.</p>',
    source: { site: 'Kubernetes docs', label: 'Persistent Volumes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' }
  },
  {
    id: 'k8s-concept-access-modes', level: 'hard', category: 'Storage', type: 'concept',
    q: 'What are the PV access modes and which is the common gotcha?',
    answer: '<p><strong>ReadWriteOnce (RWO)</strong> — one node mounts it read-write; <strong>ReadOnlyMany (ROX)</strong>; <strong>ReadWriteMany (RWX)</strong> — many nodes read-write (needs file storage like NFS/CephFS); <strong>ReadWriteOncePod (RWOP)</strong> — exactly one Pod. Gotcha: most cloud block disks (EBS, PD) are RWO only, so spreading a RWO-backed Deployment across nodes leaves Pods stuck ContainerCreating with a multi-attach error. Need shared RW across nodes → use an RWX file storage class.</p>',
    source: { site: 'Kubernetes docs', label: 'Persistent Volumes — Access Modes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes' }
  },

  // ============ Resources, probes, autoscaling ============
  {
    id: 'k8s-concept-requests-limits', level: 'medium', category: 'Resources', type: 'concept',
    q: 'What is the difference between resource requests and limits?',
    answer: '<p><strong>requests</strong> are what the scheduler uses to place a Pod — a node is "full" when the sum of requests meets capacity, regardless of actual usage; they are also the guaranteed floor. <strong>limits</strong> are the hard runtime ceiling. CPU over its limit is <em>throttled</em> (compressible); memory over its limit is <em>OOMKilled</em> (incompressible, exit 137).</p>',
    source: { site: 'Kubernetes docs', label: 'Resource Management for Pods', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' }
  },
  {
    id: 'k8s-concept-qos', level: 'hard', category: 'Resources', type: 'concept',
    q: 'What are the QoS classes and why do they matter?',
    answer: '<p>Derived from requests/limits: <strong>Guaranteed</strong> (every container has requests == limits for cpu & memory), <strong>Burstable</strong> (some requests set but not Guaranteed), <strong>BestEffort</strong> (none set). Under node memory pressure the kubelet evicts BestEffort first, Guaranteed last. Set requests==limits for critical workloads; never leave production Pods BestEffort.</p>',
    source: { site: 'Kubernetes docs', label: 'Pod Quality of Service Classes', url: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/' }
  },
  {
    id: 'k8s-scenario-oomkilled', level: 'hard', category: 'Resources', type: 'scenario',
    q: 'A container keeps restarting with exit code 137. What is it and how do you fix it?',
    answer: '<p>Exit <strong>137</strong> = 128 + 9 (SIGKILL) = <strong>OOMKilled</strong>: it exceeded its memory limit. Confirm with <code>kubectl describe pod</code> (Last State: Terminated, Reason: OOMKilled) and <code>kubectl top pod</code> for live usage. Fix by raising the memory limit if usage is legitimate, fixing a leak if it climbs forever, or reducing in-app caches/concurrency. Repeated OOM shows as restarts and often CrashLoopBackOff.</p>',
    source: { site: 'Kubernetes docs', label: 'Resource Management — exceeding limits', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' },
    tryIt: { seed: 'kubectl run crasher --image=busybox -- exit 1', starter: 'kubectl get pods' }
  },
  {
    id: 'k8s-concept-probes', level: 'medium', category: 'Probes', type: 'concept',
    q: 'What is the difference between liveness, readiness and startup probes?',
    answer: '<p><strong>liveness</strong> → is it wedged? failure <em>restarts</em> the container. <strong>readiness</strong> → ready to serve? failure <em>removes</em> it from Service endpoints (no restart). <strong>startup</strong> → has a slow app booted? it <em>gates</em> the other two until it passes. Classic mistake: putting readiness logic (e.g. "is the DB up") in a liveness probe — a transient blip then restarts every Pod instead of just de-routing them.</p>',
    source: { site: 'Kubernetes docs', label: 'Configure Liveness, Readiness and Startup Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' }
  },
  {
    id: 'k8s-concept-hpa', level: 'medium', category: 'Autoscaling', type: 'concept',
    q: 'What does a HorizontalPodAutoscaler do and what are its two prerequisites?',
    answer: '<p>An <strong>HPA</strong> adjusts a Deployment\'s <code>replicas</code> to keep a metric (e.g. CPU%) near a target. Two prerequisites: the Pods must have resource <strong>requests</strong> set (the % is relative to the request), and <strong>metrics-server</strong> (or a custom-metrics adapter) must be installed. Missing either shows the metric as <code>&lt;unknown&gt;</code> and it never scales.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Basic) — Scaling applications', url: 'https://www.hackerrank.com/skills-directory/kubernetes_basic' }
  },
  {
    id: 'k8s-concept-hpa-vpa-ca', level: 'hard', category: 'Autoscaling', type: 'concept',
    q: 'Compare HPA, VPA and the Cluster Autoscaler.',
    answer: '<p>Three layers: <strong>HPA</strong> scales the number of Pod replicas (out/in); <strong>VPA</strong> right-sizes each Pod\'s requests/limits (up/down); <strong>Cluster Autoscaler</strong> adds/removes <em>nodes</em> when Pods can\'t schedule / nodes are idle (Karpenter is a popular alternative). "Scale the app" = HPA/VPA; "scale the cluster" = Cluster Autoscaler. Don\'t run VPA and CPU-based HPA on the same workload — they fight.</p>',
    source: { site: 'Kubernetes docs', label: 'Horizontal Pod Autoscaling', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/' }
  },

  // ============ Namespaces / scheduling ============
  {
    id: 'k8s-concept-namespace', level: 'easy', category: 'Namespaces', type: 'concept',
    q: 'What is a Namespace and what does it NOT isolate?',
    answer: '<p>A <strong>Namespace</strong> partitions a cluster into logical sections (dev/staging/prod/per-team) with per-namespace names, RBAC and quotas. It does <em>not</em> isolate network traffic by default (Pods across namespaces can talk unless a NetworkPolicy stops them), does not contain cluster-scoped objects (Nodes, PVs, StorageClasses, ClusterRoles), and DNS crosses namespaces.</p>',
    source: { site: 'Kubernetes docs', label: 'Namespaces', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/' }
  },
  {
    id: 'k8s-concept-quota-limitrange', level: 'medium', category: 'Namespaces', type: 'concept',
    q: 'What is the difference between a ResourceQuota and a LimitRange?',
    answer: '<p>A <strong>ResourceQuota</strong> caps a namespace\'s <em>aggregate</em> consumption (total cpu/memory requests & limits, object counts). A <strong>LimitRange</strong> governs <em>each</em> Pod/Container (default requests/limits when omitted, enforced min/max). They pair up: a quota forces Pods to declare resources, and a LimitRange supplies sane defaults so developers don\'t have to annotate every Pod.</p>',
    source: { site: 'Kubernetes docs', label: 'Resource Quotas', url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/' }
  },
  {
    id: 'k8s-concept-affinity-taints', level: 'hard', category: 'Scheduling', type: 'concept',
    q: 'Explain the difference between node affinity and taints/tolerations.',
    answer: '<p><strong>Affinity</strong> is a Pod <em>choosing</em> nodes (nodeSelector/nodeAffinity: hard <code>required...</code> or soft <code>preferred...</code>). <strong>Taints</strong> are a node <em>repelling</em> Pods ("don\'t schedule here unless you tolerate this"); only Pods with a matching <strong>toleration</strong> can land there. Control-plane nodes are tainted so workloads avoid them; DaemonSets carry tolerations so they can run everywhere. Tolerating ≠ requiring — pair with affinity to actively target a node.</p>',
    source: { site: 'Kubernetes docs', label: 'Taints and Tolerations', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/' }
  },
  {
    id: 'k8s-concept-topology-spread', level: 'medium', category: 'Scheduling', type: 'concept',
    q: 'How do you spread replicas evenly across zones or nodes?',
    answer: '<p>Use <strong>topologySpreadConstraints</strong> with a <code>maxSkew</code> and a <code>topologyKey</code> (e.g. <code>topology.kubernetes.io/zone</code>), plus <code>whenUnsatisfiable: DoNotSchedule</code> for a hard rule. It is the modern, cleaner replacement for hand-written podAntiAffinity when the goal is "spread evenly" rather than "never co-locate".</p>',
    source: { site: 'Kubernetes docs', label: 'Pod Topology Spread Constraints', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/' }
  },

  // ============ Security / RBAC ============
  {
    id: 'k8s-concept-rbac', level: 'medium', category: 'Security', type: 'concept',
    q: 'Explain RBAC: Role, ClusterRole, RoleBinding, ClusterRoleBinding.',
    answer: '<p>RBAC answers "can this identity perform this verb on this resource?". A <strong>Role</strong> lists allowed verbs on resources in one namespace; a <strong>ClusterRole</strong> is cluster-wide / for cluster-scoped resources. A <strong>RoleBinding</strong> grants a (Cluster)Role to subjects in a namespace; a <strong>ClusterRoleBinding</strong> grants cluster-wide. RBAC is purely additive — no deny rules; everything defaults to denied.</p>',
    source: { site: 'Kubernetes docs', label: 'Using RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' }
  },
  {
    id: 'k8s-concept-serviceaccount', level: 'medium', category: 'Security', type: 'concept',
    q: 'What is a ServiceAccount and how does it differ from a user?',
    answer: '<p>Users (humans) authenticate externally and aren\'t Kubernetes objects. A <strong>ServiceAccount</strong> is the in-cluster identity a <em>Pod</em> runs as, so the Pod can call the API with scoped permissions. Every Pod gets the namespace\'s <code>default</code> SA unless you set <code>serviceAccountName</code>. Modern clusters mount short-lived projected tokens; set <code>automountServiceAccountToken: false</code> for Pods that don\'t need API access.</p>',
    source: { site: 'Kubernetes docs', label: 'Service Accounts', url: 'https://kubernetes.io/docs/concepts/security/service-accounts/' }
  },
  {
    id: 'k8s-coding-can-i', level: 'easy', category: 'Security', type: 'coding',
    q: 'How do you check what a user or ServiceAccount is allowed to do?',
    answer: '<pre><code>kubectl auth can-i list pods -n staging\nkubectl auth can-i create deployments --as=alice -n staging\nkubectl auth can-i --list -n staging   # everything you can do</code></pre><p>Cardinal sins to avoid: binding <code>cluster-admin</code> to a ServiceAccount, and granting get/list on Secrets cluster-wide — both turn one compromised Pod into cluster takeover.</p>',
    source: { site: 'Kubernetes docs', label: 'Authorization — checking access', url: 'https://kubernetes.io/docs/reference/access-authn-authz/authorization/#checking-api-access' }
  },
  {
    id: 'k8s-concept-securitycontext', level: 'medium', category: 'Security', type: 'concept',
    q: 'What hardening does a securityContext provide?',
    answer: '<p>A <code>securityContext</code> controls container privileges: <code>runAsNonRoot</code>/<code>runAsUser</code> (don\'t run as root), <code>allowPrivilegeEscalation: false</code>, <code>readOnlyRootFilesystem: true</code>, <code>capabilities.drop: ["ALL"]</code>, and <code>privileged: false</code>. A hardened baseline drops all capabilities, runs non-root, and mounts the rootfs read-only.</p>',
    source: { site: 'Kubernetes docs', label: 'Configure a Security Context', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' }
  },
  {
    id: 'k8s-concept-psa', level: 'hard', category: 'Security', type: 'concept',
    q: 'What replaced PodSecurityPolicy, and what are the Pod Security Standards?',
    answer: '<p>PodSecurityPolicy was removed in v1.25; its replacement is <strong>Pod Security Admission</strong>, a built-in controller enforcing three <strong>Pod Security Standards</strong> per namespace: <strong>privileged</strong> (unrestricted), <strong>baseline</strong> (blocks known-dangerous), <strong>restricted</strong> (heavily hardened — runAsNonRoot, drop ALL caps, seccomp). You opt in with namespace labels in modes <code>enforce</code>/<code>audit</code>/<code>warn</code>. For custom rules use Kyverno or OPA/Gatekeeper.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Intermediate) — Pod Security Policies', url: 'https://www.hackerrank.com/skills-directory/kubernetes_intermediate' }
  },
  {
    id: 'k8s-concept-networkpolicy', level: 'hard', category: 'Security', type: 'concept',
    q: 'What is a NetworkPolicy and what is the default behaviour without one?',
    answer: '<p>By default <strong>all Pods can talk to all Pods</strong>, across namespaces. A <strong>NetworkPolicy</strong> restricts ingress/egress by label selector (allow-list, additive) — but only if the CNI enforces it (Calico, Cilium do). The foundational move is a default-deny policy, then open exactly what\'s needed. Two traps: a CNI that ignores policies silently enforces nothing, and once any policy selects a Pod it becomes default-deny for that direction (don\'t forget DNS egress).</p>',
    source: { site: 'Kubernetes docs', label: 'Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' }
  },

  // ============ Helm / tooling ============
  {
    id: 'k8s-concept-helm', level: 'medium', category: 'Helm', type: 'concept',
    q: 'What is Helm and what are a Chart, Release and Values?',
    answer: '<p><strong>Helm</strong> is the Kubernetes package manager. A <strong>Chart</strong> is a package of templated manifests + default values; a <strong>Release</strong> is an installed instance of a chart (named, with revision history); <strong>Values</strong> fill the templates (<code>values.yaml</code>, overridden with <code>--set</code>/<code>-f</code>). <code>helm upgrade --install</code> installs or upgrades in one step; <code>helm rollback</code> uses the stored history.</p>',
    source: { site: 'Kubernetes docs', label: 'Helm (Related tools)', url: 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/' }
  },
  {
    id: 'k8s-concept-helm3-tiller', level: 'medium', category: 'Helm', type: 'concept',
    q: 'What changed between Helm 2 and Helm 3?',
    answer: '<p>Helm 3 removed the server-side <strong>Tiller</strong> component — the big security complaint about Helm 2 (Tiller ran with broad cluster permissions). Helm 3 is a client-only tool that stores release state as Secrets in the cluster and relies on the user\'s own RBAC. If an interviewer mentions Tiller: "that\'s Helm 2; Helm 3 is clientless."</p>',
    source: { site: 'Kubernetes docs', label: 'Managing Kubernetes Objects', url: 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/' }
  },
  {
    id: 'k8s-concept-kustomize', level: 'medium', category: 'Helm', type: 'concept',
    q: 'How does Kustomize differ from Helm?',
    answer: '<p><strong>Kustomize</strong> is template-free: it layers <em>overlays</em> (patches) on a base set of plain YAML, and is built into kubectl (<code>kubectl apply -k</code>). <strong>Helm</strong> uses Go templating + values and has releases/history/packaging. Rule of thumb: Kustomize for simple per-environment patches with no new DSL; Helm for packaging/distribution and complex parameterization. GitOps tools (Argo CD, Flux) can drive either.</p>',
    source: { site: 'Kubernetes docs', label: 'Declarative Management with Kustomize', url: 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/' }
  },

  // ============ kubectl / coding ============
  {
    id: 'k8s-coding-apply-vs-create', level: 'easy', category: 'kubectl', type: 'coding',
    q: 'What is the difference between kubectl apply and kubectl create?',
    answer: '<p><code>create</code> is imperative — "make this now, fail if it already exists". <code>apply</code> is declarative — "make reality match this file" (creates or updates), tracking the last-applied config so later applies compute a diff. Use <code>apply</code> for anything in version control / GitOps; <code>create</code> for one-off imperative actions.</p>',
    source: { site: 'Kubernetes docs', label: 'Declarative vs Imperative Management', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=2', starter: 'kubectl get all' }
  },
  {
    id: 'k8s-coding-debug-pod', level: 'medium', category: 'kubectl', type: 'coding',
    q: 'A Pod is misbehaving. What are the first commands you run to diagnose it?',
    answer: '<pre><code>kubectl get pods -o wide            # status, restarts, node\nkubectl describe pod &lt;pod&gt;           # Events at the bottom name the cause\nkubectl logs &lt;pod&gt; --previous        # the crashed instance\'s output\nkubectl get events --sort-by=.lastTimestamp</code></pre><p>The STATUS column tells you <em>which</em> failure; <code>describe</code> Events + <code>logs --previous</code> tell you <em>why</em>. Never fix from the status alone.</p>',
    source: { site: 'Kubernetes docs', label: 'Debug Running Pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=3', starter: 'kubectl get pods -o wide' }
  },
  {
    id: 'k8s-coding-kubeconfig', level: 'medium', category: 'kubectl', type: 'coding',
    q: 'What is a kubeconfig context and how do you switch cluster/namespace safely?',
    answer: '<p>A <strong>context</strong> pairs a cluster + a user + a default namespace; <code>current-context</code> is the single pointer deciding where commands go.</p><pre><code>kubectl config get-contexts\nkubectl config current-context        # check BEFORE anything destructive\nkubectl config use-context kind-dev\nkubectl config set-context --current --namespace=staging</code></pre><p>The classic incident is running against prod because the context was stale — verify it first.</p>',
    source: { site: 'Kubernetes docs', label: 'Configure Access to Multiple Clusters', url: 'https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/' }
  },

  // ============ Troubleshooting scenarios ============
  {
    id: 'k8s-scenario-imagepull', level: 'medium', category: 'Troubleshooting', type: 'scenario',
    q: 'A Pod is stuck in ImagePullBackOff. How do you diagnose and fix it?',
    answer: '<p><code>kubectl describe pod</code> → the Events name the reason: a wrong name/tag (<code>manifest unknown</code> → fix the reference), a private registry with no creds (create a <code>docker-registry</code> Secret and reference it via <code>imagePullSecrets</code>), or Docker Hub rate limiting (<code>toomanyrequests</code> → authenticate/mirror). It is a pull problem, not a scheduling or runtime one.</p>',
    source: { site: 'Kubernetes docs', label: 'Debug Pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/' },
    tryIt: { seed: 'kubectl create deployment bad --image=myrepo/notexist:1.0 --replicas=1', starter: 'kubectl get pods' }
  },
  {
    id: 'k8s-scenario-crashloop', level: 'hard', category: 'Troubleshooting', type: 'scenario',
    q: 'A Pod is in CrashLoopBackOff. Walk through diagnosing it.',
    answer: '<p>CrashLoop is a <em>symptom</em>: the container starts, exits, and the kubelet keeps restarting with growing back-off. Read the cause with <code>kubectl logs &lt;pod&gt; --previous</code> and <code>kubectl describe pod</code> (Last State → Reason + exit code). Common causes: a boot error (bad config/missing env or Secret/unreachable dependency), exit 137 = OOMKilled, a failing liveness probe restarting a slow-but-healthy app (add a startupProbe), or a container with no long-running process.</p>',
    source: { site: 'Kubernetes docs', label: 'Debug Running Pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/' },
    tryIt: { seed: 'kubectl run crasher --image=busybox -- exit 1', starter: 'kubectl logs crasher --previous' }
  },
  {
    id: 'k8s-scenario-pending', level: 'hard', category: 'Troubleshooting', type: 'scenario',
    q: 'A Pod is stuck in Pending. What does that mean and how do you find the cause?',
    answer: '<p>Pending = the scheduler can\'t place it. <code>kubectl describe pod</code> → the <code>FailedScheduling</code> Event gives the reason: insufficient cpu/memory (requests exceed any node — lower requests or add nodes), a taint the Pod doesn\'t tolerate, an unbound PVC (no StorageClass / can\'t bind), or node affinity/selector matching no node.</p>',
    source: { site: 'Kubernetes docs', label: 'Debug Pods — Pending', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/' },
    tryIt: { seed: '', starter: 'kubectl get pods   # then paste a Pod with a huge cpuRequest into the YAML pane and Apply' }
  },
  {
    id: 'k8s-scenario-node-ops', level: 'medium', category: 'Troubleshooting', type: 'scenario',
    q: 'You need to take a node down for maintenance. What is the safe procedure?',
    answer: '<p><code>kubectl cordon &lt;node&gt;</code> marks it unschedulable (no new Pods), then <code>kubectl drain &lt;node&gt; --ignore-daemonsets --delete-emptydir-data</code> evicts the existing Pods (respecting PodDisruptionBudgets) so controllers reschedule them elsewhere. After maintenance, <code>kubectl uncordon &lt;node&gt;</code> returns it to the pool. DaemonSet Pods are left in place by design.</p>',
    source: { site: 'HackerRank', label: 'Kubernetes (Intermediate) — Node Operations (cordon/drain)', url: 'https://www.hackerrank.com/skills-directory/kubernetes_intermediate' }
  },
  {
    id: 'k8s-scenario-rollback', level: 'medium', category: 'Troubleshooting', type: 'scenario',
    q: 'You deployed a broken image to production. How do you roll back fast, and why is it instant?',
    answer: '<p><code>kubectl rollout undo deployment/&lt;name&gt;</code> (or <code>--to-revision=N</code>). It is near-instant because the previous ReplicaSet still exists scaled to 0 — undo just scales the old one up and the new one down, no image rebuild. That is why you don\'t manually delete old ReplicaSets; <code>revisionHistoryLimit</code> (default 10) controls how many are kept.</p>',
    source: { site: 'Kubernetes docs', label: 'Deployments — Rolling Back', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment' },
    tryIt: { seed: 'kubectl create deployment web --image=nginx --replicas=3\nkubectl set image deployment/web web=nginx:badtag', starter: 'kubectl rollout undo deployment/web' }
  },
  {
    id: 'k8s-scenario-stuck-terminating', level: 'hard', category: 'Troubleshooting', type: 'scenario',
    q: 'A Pod (or Namespace) is stuck in Terminating. What is usually going on?',
    answer: '<p>Something is holding deletion. For a Pod: a <strong>finalizer</strong> hasn\'t completed, a volume won\'t detach, or the node is unreachable (the Pod can\'t be confirmed dead). For a Namespace: a resource in it has a finalizer that never runs (often a dangling API service/CRD). Diagnose with <code>kubectl get &lt;obj&gt; -o yaml</code> and look at <code>metadata.finalizers</code>; fix the underlying controller rather than force-removing finalizers, which can orphan real resources.</p>',
    source: { site: 'Kubernetes docs', label: 'Using Finalizers', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/' }
  },

  // ============ Extensibility ============
  {
    id: 'k8s-concept-crd-operator', level: 'hard', category: 'Extensibility', type: 'concept',
    q: 'What are CRDs and Operators?',
    answer: '<p>A <strong>CustomResourceDefinition (CRD)</strong> adds a new object kind to the API server (e.g. <code>kind: PostgresCluster</code>), so you can store and <code>kubectl get</code> it like any built-in. An <strong>Operator</strong> is a custom controller watching that CRD and running a reconciliation loop that encodes operational knowledge — provisioning, backups, failover, upgrades — turning "a human runbook" into software. StatefulSet is the primitive; an Operator is the production experience for stateful apps.</p>',
    source: { site: 'Kubernetes docs', label: 'Operator pattern', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/operator/' }
  },
  {
    id: 'k8s-concept-pdb', level: 'medium', category: 'Extensibility', type: 'concept',
    q: 'What is a PodDisruptionBudget?',
    answer: '<p>A <strong>PodDisruptionBudget (PDB)</strong> limits how many Pods of an app can be voluntarily disrupted at once (via <code>minAvailable</code> or <code>maxUnavailable</code>). It protects availability during <em>voluntary</em> disruptions — node drains, cluster autoscaler scale-down, rolling node upgrades — so draining a node won\'t take all replicas of a service down simultaneously. It doesn\'t guard against involuntary events (a node crashing).</p>',
    source: { site: 'Kubernetes docs', label: 'Pod Disruption Budgets', url: 'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/' }
  }

  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = window.STUDYHUB_INTERVIEW;
