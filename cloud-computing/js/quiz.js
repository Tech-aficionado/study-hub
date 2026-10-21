// Quiz — standalone module, loaded only on quiz.html
// 10 questions, 2 per unit: (1) What is Cloud Computing, (2) Cloud Services,
// (3) Collaborating via Cloud, (4) Virtualization, (5) Security & Standards.

(function () {
  var quizData = [
    // Unit 1 — What is Cloud Computing?
    { q: "Which of these is NOT one of NIST's five essential characteristics of cloud computing?", opts: ["On-demand self-service", "Rapid elasticity", "Measured service", "Mandatory vendor lock-in"], correct: 3, explain: "Lock-in is a risk of cloud adoption, not a defining characteristic — NIST's five are self-service, broad network access, resource pooling, elasticity and measured service." },
    { q: "Which open-source toolkit is used purely to SIMULATE cloud data centers and scheduling policies for research, rather than run a real cloud?", opts: ["Eucalyptus", "OpenNebula", "CloudSim", "Nimbus"], correct: 2, explain: "CloudSim is a Java-based simulation framework — Eucalyptus, OpenNebula and Nimbus all manage real infrastructure." },
    // Unit 2 — Cloud Services
    { q: "In the pizza analogy for service models, ordering a ready-to-eat pizza delivered to your door best matches which model?", opts: ["IaaS", "PaaS", "SaaS", "DaaS"], correct: 2, explain: "SaaS hands you the complete, ready-to-use product — like a delivered, ready-to-eat pizza." },
    { q: "Which deployment model is shared by several organizations with common compliance or mission needs, but not open to the general public?", opts: ["Public", "Private", "Community", "Hybrid"], correct: 2, explain: "A community cloud is scoped to a specific group of organizations with shared requirements — narrower than public, broader than private." },
    // Unit 3 — Collaborating using Cloud Services
    { q: "What is the main collaboration advantage of cloud-based word processing (e.g. Google Docs) over a locally saved file?", opts: ["It requires no internet connection", "Multiple people can edit the same document simultaneously with live sync", "It cannot be shared with anyone", "It only works on one specific device"], correct: 1, explain: "The document lives on provider-managed storage, so any authorized device becomes a live, simultaneous editor." },
    { q: "Which cloud service category centralizes customer contacts, deal pipelines and support history for sales and support teams?", opts: ["CRM", "DaaS", "Hypervisor", "CIMI"], correct: 0, explain: "Customer Relationship Management (CRM) platforms like Salesforce centralize exactly this data for teams." },
    // Unit 4 — Virtualization for Cloud
    { q: "Which type of virtual machine virtualizes a single application's runtime rather than an entire operating system?", opts: ["System VM", "Process VM", "Type 1 hypervisor", "Type 2 hypervisor"], correct: 1, explain: "A Process VM (e.g. the JVM) virtualizes just one program's execution environment, not a whole machine." },
    { q: "Which hypervisor is built directly into the Linux kernel, turning Linux itself into a Type 1 hypervisor?", opts: ["VirtualBox", "Hyper-V", "KVM", "VMware Workstation"], correct: 2, explain: "KVM (Kernel-based Virtual Machine) is part of the Linux kernel and underlies most OpenStack/cloud deployments." },
    // Unit 5 — Security, Standards and Applications
    { q: "Which organization develops the Cloud Infrastructure Management Interface (CIMI) for vendor-neutral cloud management?", opts: ["Open Cloud Consortium (OCC)", "Distributed Management Task Force (DMTF)", "NIST", "ICANN"], correct: 1, explain: "DMTF develops CIMI and other vendor-neutral IT management standards, including for cloud infrastructure." },
    { q: "Under the shared responsibility model, who is responsible for securing the customer's own data and access configuration?", opts: ["The cloud provider only", "The customer, regardless of service model", "Neither party", "A third-party auditor automatically"], correct: 1, explain: "The provider secures the underlying cloud infrastructure, but the customer always remains responsible for securing what they put into it — their data, identities and configuration." }
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
      res.textContent = '✅ Correct! ' + item.explain;
      res.style.color = '#3fdd94';
    } else {
      res.textContent = '❌ Correct answer: ' + item.opts[item.correct] + ' — ' + item.explain;
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
