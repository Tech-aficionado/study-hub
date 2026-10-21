// Cloud Computing interview questions — data for the shared renderer (../js/interview.js).
// 20 questions across easy/medium/hard, covering service models, virtualization,
// deployment models and security. Source field cites generic official documentation
// where no specific confirmed URL was verified.
window.STUDYHUB_INTERVIEW = {
  topic: 'cloud-computing',
  questions: [
    // ===================== EASY =====================
    {
      id: 'cc-q1', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is cloud computing, in plain terms?',
      answer: '<p>Cloud computing is the delivery of computing resources — servers, storage, databases, networking, software — <strong>on demand over the internet</strong>, with pay-as-you-go pricing, instead of an organization buying and maintaining its own physical hardware.</p><p>NIST defines it by five essential characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service.</p>',
      source: { site: 'NIST', label: 'The NIST Definition of Cloud Computing', url: 'https://www.nist.gov' }
    },
    {
      id: 'cc-q2', level: 'easy', category: 'Service Models', type: 'concept',
      q: 'What is the difference between IaaS, PaaS and SaaS?',
      answer: '<p><strong>IaaS</strong> (Infrastructure as a Service) rents raw infrastructure — VMs, storage, networking — and you manage everything from the OS up (e.g. AWS EC2).</p><p><strong>PaaS</strong> (Platform as a Service) additionally manages the OS and runtime, so you deploy only your application code (e.g. Google App Engine).</p><p><strong>SaaS</strong> (Software as a Service) delivers a complete, ready-to-use application; you just bring your data and configuration (e.g. Salesforce, Gmail).</p>',
      source: { site: 'AWS documentation', label: 'Types of Cloud Computing', url: 'https://aws.amazon.com/types-of-cloud-computing/' }
    },
    {
      id: 'cc-q3', level: 'easy', category: 'Deployment Models', type: 'concept',
      q: 'What are the four cloud deployment models?',
      answer: '<p><strong>Public</strong> — shared, provider-owned infrastructure open to any customer.</p><p><strong>Private</strong> — dedicated infrastructure for a single organization.</p><p><strong>Community</strong> — shared by a group of organizations with common compliance or mission needs.</p><p><strong>Hybrid</strong> — a combination of two or more models, with workloads able to move between them.</p>',
      source: { site: 'Azure documentation', label: 'Cloud deployment models overview', url: 'https://learn.microsoft.com/azure' }
    },
    {
      id: 'cc-q4', level: 'easy', category: 'Service Models', type: 'concept',
      q: 'What is DaaS and how is it different from SaaS?',
      answer: '<p><strong>DaaS (Desktop as a Service)</strong> delivers a virtual desktop — a full OS desktop environment with the user\'s apps and files — streamed from the cloud to any device (e.g. Amazon WorkSpaces, Windows 365).</p><p>SaaS delivers a single application; DaaS delivers an entire desktop experience that can host many applications, managed centrally by IT for patching, backup and security.</p>',
      source: { site: 'AWS documentation', label: 'What is DaaS?', url: 'https://aws.amazon.com' }
    },
    {
      id: 'cc-q5', level: 'easy', category: 'Virtualization', type: 'concept',
      q: 'What is virtualization and why does cloud computing depend on it?',
      answer: '<p><strong>Virtualization</strong> is a software layer (the hypervisor) that lets one physical machine run as many isolated virtual machines. Without it, a provider could not safely let multiple customers share one physical server — one workload would occupy the whole machine.</p><p>Virtualization is what makes <strong>multi-tenancy</strong> possible, and multi-tenancy is what makes cloud economics (shared, pooled resources billed by consumption) work in the first place.</p>',
      source: { site: 'VMware documentation', label: 'What is virtualization?', url: 'https://www.vmware.com' }
    },
    {
      id: 'cc-q6', level: 'easy', category: 'Virtualization', type: 'concept',
      q: 'What is the difference between a System VM and a Process VM?',
      answer: '<p>A <strong>System VM</strong> virtualizes an entire physical machine, including a full guest operating system — several of these can run concurrently on one host, each fully isolated.</p><p>A <strong>Process VM</strong> virtualizes only a single application\'s runtime environment, not a whole OS — the Java Virtual Machine (JVM) is the classic example, giving "write once, run anywhere" portability to one program.</p>',
      source: { site: 'Oracle documentation', label: 'Java Virtual Machine overview', url: 'https://docs.oracle.com' }
    },
    {
      id: 'cc-q7', level: 'easy', category: 'Security', type: 'concept',
      q: 'What is the shared responsibility model in cloud security?',
      answer: '<p>The <strong>shared responsibility model</strong> splits security duties between the cloud provider and the customer. The provider secures the underlying cloud infrastructure — physical data centers, host virtualization, network backbone. The customer remains responsible for securing whatever they put <em>in</em> the cloud: their data, identity and access configuration, and (depending on the service model) the guest OS and application code.</p>',
      source: { site: 'AWS documentation', label: 'Shared Responsibility Model', url: 'https://aws.amazon.com/compliance/shared-responsibility-model/' }
    },
    {
      id: 'cc-q8', level: 'easy', category: 'Collaboration', type: 'concept',
      q: 'How does cloud-based document editing (e.g. Google Docs) enable real-time collaboration?',
      answer: '<p>The document itself is stored on provider-managed cloud storage rather than on one person\'s device. Because every authorized client connects to that same central copy, multiple people can view and edit <em>simultaneously</em>, see each other\'s changes and cursors live, and rely on automatic versioning — eliminating the old pattern of emailing a file back and forth.</p>',
      source: { site: 'Google documentation', label: 'How Google Docs collaboration works', url: 'https://support.google.com' }
    },
    // ===================== MEDIUM =====================
    {
      id: 'cc-q9', level: 'medium', category: 'Virtualization', type: 'concept',
      q: 'What is a hypervisor, and what key properties must it guarantee?',
      answer: '<p>A <strong>hypervisor</strong> (Virtual Machine Monitor) is the software layer that creates, runs and manages virtual machines on top of physical hardware, multiplexing CPU, memory, storage and I/O among them.</p><p>A correct hypervisor must guarantee: <strong>equivalence/fidelity</strong> (software in the VM behaves as if on real hardware), <strong>resource control</strong> (the hypervisor, not the guest, has final authority over physical resources), and <strong>efficiency</strong> (most instructions execute directly on hardware with minimal overhead).</p>',
      source: { site: 'VMware documentation', label: 'Hypervisor technology', url: 'https://www.vmware.com' }
    },
    {
      id: 'cc-q10', level: 'medium', category: 'Virtualization', type: 'concept',
      q: 'Compare Type 1 and Type 2 hypervisors with examples.',
      answer: '<p><strong>Type 1 (bare-metal)</strong> hypervisors run directly on the physical hardware with no underlying host OS — examples: Xen, KVM, VMware ESXi, Microsoft Hyper-V. They are the standard choice for production cloud infrastructure because of lower overhead and a smaller attack surface.</p><p><strong>Type 2 (hosted)</strong> hypervisors run as an application on top of a conventional host OS — example: Oracle VirtualBox, VMware Workstation. They are convenient for desktop development/testing but add an extra OS layer of overhead, making them less common in production clouds.</p>',
      source: { site: 'Microsoft documentation', label: 'Hyper-V architecture', url: 'https://learn.microsoft.com' }
    },
    {
      id: 'cc-q11', level: 'medium', category: 'Virtualization', type: 'concept',
      q: 'What is the difference between interpretation and binary translation as VM execution strategies?',
      answer: '<p><strong>Interpretation</strong> fetches, decodes and emulates each guest instruction one at a time, entirely in software. It is simple and highly portable, but every instruction pays emulation overhead, making it slow.</p><p><strong>Binary translation</strong> instead translates blocks of guest instructions into equivalent host instructions ahead of time (often just-in-time, with caching of translated blocks), trading upfront translation cost for much faster repeated execution. Modern hypervisors largely avoid both for CPU-bound code by using hardware-assisted virtualization (Intel VT-x/AMD-V) where possible.</p>',
      source: { site: 'Intel documentation', label: 'Intel VT-x virtualization technology', url: 'https://www.intel.com' }
    },
    {
      id: 'cc-q12', level: 'medium', category: 'Service Models', type: 'scenario',
      q: 'A startup wants to deploy a web app quickly without managing servers or OS patching, but still write custom backend code. Which service model fits best, and why?',
      answer: '<p><strong>PaaS</strong> fits best. It gives the startup a managed runtime and OS (so they never patch servers), while still letting them deploy their own custom application code — unlike SaaS, which offers no code-level customization, and unlike IaaS, which would leave them responsible for OS management and patching they explicitly want to avoid.</p>',
      source: { site: 'Google Cloud documentation', label: 'App Engine overview', url: 'https://cloud.google.com/appengine' }
    },
    {
      id: 'cc-q13', level: 'medium', category: 'Deployment Models', type: 'scenario',
      q: 'A hospital system needs to keep patient records on infrastructure it fully controls for compliance, but wants to burst non-sensitive analytics workloads to a public cloud for cost efficiency. Which deployment model fits?',
      answer: '<p><strong>Hybrid cloud.</strong> The patient-record workload stays on a private cloud (or on-prem) to satisfy compliance and full control requirements, while non-sensitive analytics workloads burst to public cloud capacity when needed. This combination — distinct infrastructures working together with workloads able to move between them — is the defining trait of hybrid cloud.</p>',
      source: { site: 'Microsoft Azure documentation', label: 'Hybrid cloud overview', url: 'https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-hybrid-cloud' }
    },
    {
      id: 'cc-q14', level: 'medium', category: 'Business Models', type: 'concept',
      q: 'What is vendor lock-in and how does it typically arise in cloud adoption?',
      answer: '<p><strong>Vendor lock-in</strong> is the condition where switching from one cloud provider to another becomes prohibitively costly or complex, usually because an organization has deeply integrated with that provider\'s proprietary APIs, managed services, or data formats (e.g. a serverless function tightly coupled to one provider\'s event model, or data stored in a proprietary database format).</p><p>Mitigations include favoring open standards/APIs, containerizing workloads for portability, and designing an explicit multi-cloud or exit strategy up front.</p>',
      source: { site: 'AWS documentation', label: 'Avoiding lock-in', url: 'https://aws.amazon.com' }
    },
    {
      id: 'cc-q15', level: 'medium', category: 'Security', type: 'concept',
      q: 'What role does the Distributed Management Task Force (DMTF) play in cloud standards?',
      answer: '<p>The <strong>DMTF</strong> develops vendor-neutral management standards across IT, and in cloud specifically produced the <strong>Cloud Infrastructure Management Interface (CIMI)</strong> — a standardized API intended to let management tools manage resources across different cloud providers\' infrastructure rather than being locked into one vendor-specific control plane.</p>',
      source: { site: 'DMTF documentation', label: 'Cloud Infrastructure Management Interface', url: 'https://www.dmtf.org' }
    },
    {
      id: 'cc-q16', level: 'medium', category: 'Collaboration', type: 'concept',
      q: 'How do cloud-based project management tools (e.g. Jira, Asana) help with workload management across a distributed team?',
      answer: '<p>They centralize task assignment, status and timelines so that overload or idle capacity is visible to the whole team in real time, not hidden in someone\'s inbox. Many also automate workflows — e.g. auto-routing a new ticket to whichever team member\'s queue is shortest — and provide reporting dashboards that let managers rebalance work based on actual data instead of guesswork.</p>',
      source: { site: 'Atlassian documentation', label: 'Jira workload management', url: 'https://www.atlassian.com' }
    },
    // ===================== HARD =====================
    {
      id: 'cc-q17', level: 'hard', category: 'Virtualization', type: 'concept',
      q: 'Explain how a High-Level-Language VM (HLL VM) like the JVM differs fundamentally from a System VM in what it virtualizes.',
      answer: '<p>A <strong>System VM</strong> virtualizes a real hardware instruction set architecture (ISA) — the guest OS believes it is running on real (or paravirtualized) hardware, and any OS/binary built for that ISA can run inside it.</p><p>An <strong>HLL VM</strong> (e.g. the JVM, or .NET\'s CLR) does not virtualize any real ISA at all. Instead, it defines its own <em>abstract</em> bytecode instruction set that sits above any specific hardware. A compiler targets that bytecode once, and the HLL VM interprets or JIT-compiles it to whatever real hardware it happens to run on — this is what gives Java its "write once, run anywhere" portability, as a Process VM rather than a full-machine virtualization layer.</p>',
      source: { site: 'Oracle documentation', label: 'JVM Specification', url: 'https://docs.oracle.com/javase/specs/' }
    },
    {
      id: 'cc-q18', level: 'hard', category: 'Virtualization', type: 'scenario',
      q: 'A cloud provider notices "noisy neighbor" performance complaints — one tenant\'s VM occasionally degrades another co-located tenant\'s performance. What virtualization-layer mechanisms address this, and why does virtualization make the problem possible in the first place?',
      answer: '<p>The problem exists <em>because</em> virtualization enables multi-tenancy: several VMs share the same physical CPU, memory bandwidth, disk I/O and network interface, mediated by the hypervisor. If the hypervisor does not strictly enforce limits, one VM\'s burst usage can starve a neighbor.</p><p>Fixes live at the hypervisor/VMM resource-control layer: CPU scheduling quotas and pinning (reserving specific cores), memory ballooning/limits, I/O throttling (QoS policies on disk and network bandwidth), and cgroup-style resource isolation. This is exactly the <strong>resource control</strong> property a correct VMM must guarantee — it must have ultimate authority to enforce fair allocation, not just let guests compete freely.</p>',
      source: { site: 'VMware documentation', label: 'Resource management and DRS', url: 'https://www.vmware.com' }
    },
    {
      id: 'cc-q19', level: 'hard', category: 'Security', type: 'scenario',
      q: 'A SaaS vendor suffers a vulnerability that lets one tenant\'s API calls occasionally return another tenant\'s data. What class of failure is this, and what architectural principle was violated?',
      answer: '<p>This is a <strong>multi-tenancy isolation failure</strong> — one of the core cloud security challenges specific to SaaS, where many customers share the same application instance and underlying data store. The architectural principle violated is <strong>tenant isolation</strong>: every query, cache layer and authorization check must scope strictly to the requesting tenant\'s own data, typically enforced via a tenant ID embedded in every data access path and validated independently at the authorization layer (never trusted purely from client input).</p><p>Because SaaS customers have essentially no visibility into the vendor\'s internals, this class of bug is especially dangerous — it is also why due-diligence certifications like SOC 2 and ISO 27001 specifically audit tenant-isolation controls.</p>',
      source: { site: 'OWASP documentation', label: 'Multi-tenancy security considerations', url: 'https://owasp.org' }
    },
    {
      id: 'cc-q20', level: 'hard', category: 'Standards', type: 'concept',
      q: 'Why does the industry need standards like OCCI and CIMI at all, given that most major providers already expose REST APIs for their cloud resources?',
      answer: '<p>Each major provider\'s REST API (AWS, Azure, GCP) is <strong>proprietary</strong> — different authentication schemes, different resource models, different terminology for conceptually identical things (a "VM" vs an "instance" vs a "compute node"). A management tool written against one provider\'s API cannot speak to another\'s without a provider-specific adapter.</p><p><strong>OCCI</strong> (Open Cloud Computing Interface) and <strong>CIMI</strong> (DMTF\'s Cloud Infrastructure Management Interface) exist to define a vendor-neutral management API that any compliant provider or tool can implement, so that infrastructure management code and multi-cloud tooling can, in principle, work across providers without being rewritten for each one — directly reducing the vendor lock-in that proprietary-only APIs create.</p>',
      source: { site: 'DMTF documentation', label: 'CIMI specification overview', url: 'https://www.dmtf.org/standards/cmwg' }
    }
  ]
};
