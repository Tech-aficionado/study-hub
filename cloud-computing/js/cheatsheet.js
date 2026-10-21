// Quick reference term search — standalone module, loaded only on cheatsheet.html

(function () {
  var commands = [
    ["IaaS", "Infrastructure as a Service — rent raw compute/storage/network, manage OS up"],
    ["PaaS", "Platform as a Service — rent a ready runtime, deploy just your app code"],
    ["SaaS", "Software as a Service — rent a complete ready-to-use application"],
    ["DaaS", "Desktop as a Service — a virtual desktop delivered and managed from the cloud"],
    ["FaaS / Serverless", "Run individual functions on demand, no server management at all"],
    ["MaaS", "Monitoring as a Service — outsourced infrastructure/app health monitoring"],
    ["CaaS (Communication)", "Communication as a Service — outsourced voice/video/messaging infra"],
    ["CaaS (Containers)", "Containers as a Service — managed container orchestration (ECS, EKS, AKS)"],
    ["Public cloud", "Shared, provider-owned infrastructure available to any customer"],
    ["Private cloud", "Dedicated infrastructure for a single organization"],
    ["Community cloud", "Shared by a group of organizations with common compliance/mission needs"],
    ["Hybrid cloud", "A mix of private and public, with workloads able to move between them"],
    ["Multi-cloud", "Using more than one cloud provider, often to avoid lock-in or for resilience"],
    ["Elasticity", "The ability to scale resources up or down automatically to match demand"],
    ["Resource pooling", "A provider's physical resources serve multiple tenants from a shared pool"],
    ["Measured service", "Usage is metered, monitored and billed (pay-as-you-go)"],
    ["Virtualization", "A software layer that lets one physical machine run as many isolated VMs"],
    ["System VM", "Virtualizes an entire machine including a full guest OS"],
    ["Process VM", "Virtualizes a single process/application's runtime (e.g. JVM, CLR)"],
    ["Hypervisor / VMM", "The software layer that creates and manages virtual machines"],
    ["Type 1 hypervisor", "Bare-metal — runs directly on hardware (Xen, KVM, ESXi, Hyper-V)"],
    ["Type 2 hypervisor", "Hosted — runs as an application on top of a host OS (VirtualBox)"],
    ["Xen", "Open-source Type 1 hypervisor using paravirtualization; powered early AWS EC2"],
    ["KVM", "Kernel-based Virtual Machine — turns the Linux kernel itself into a hypervisor"],
    ["VMware ESXi", "Mature commercial Type 1 enterprise hypervisor, part of the vSphere suite"],
    ["VirtualBox", "Free, cross-platform Type 2 hypervisor popular for desktop/dev VMs"],
    ["Hyper-V", "Microsoft's native Type 1 hypervisor, built into Windows; backbone of Azure"],
    ["Binary translation", "Translating guest instructions to host instructions ahead of execution, often JIT"],
    ["Interpretation", "Emulating guest instructions one at a time in software — simple but slower"],
    ["HLL VM", "High-Level-Language VM — runs an abstract bytecode above any specific hardware (JVM)"],
    ["Live migration", "Moving a running VM between physical hosts with near-zero downtime"],
    ["Eucalyptus", "Open-source, EC2-API-compatible software for private/hybrid clouds"],
    ["Nimbus", "Open-source IaaS toolkit for turning scientific-computing clusters into clouds"],
    ["OpenNebula", "Open-source cloud management platform for private and hybrid clouds"],
    ["CloudSim", "Java-based simulation toolkit for modeling cloud data centers and scheduling"],
    ["Vendor lock-in", "Being dependent on one provider's proprietary APIs, making migration costly"],
    ["Shared responsibility model", "Provider secures the cloud infrastructure; customer secures what they put in it"],
    ["Open Cloud Consortium (OCC)", "Nonprofit supporting cloud standards, testbeds and performance benchmarks"],
    ["DMTF", "Distributed Management Task Force — vendor-neutral IT/cloud management standards (CIMI)"],
    ["OCCI", "Open Cloud Computing Interface — standardized API for managing cloud infra across vendors"],
    ["AMQP", "Advanced Message Queuing Protocol — vendor-neutral messaging between cloud apps"],
    ["CRM", "Customer Relationship Management — cloud platforms centralizing customer/deal data"],
    ["Groupware", "Cloud tools combining chat, file sharing and calls into one shared workspace"],
    ["NIST cloud definition", "On-demand self-service, broad network access, pooling, elasticity, measured service"]
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
