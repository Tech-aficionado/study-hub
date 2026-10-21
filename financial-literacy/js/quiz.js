// Quiz — standalone module, loaded only on quiz.html

(function () {
  var quizData = [
    { q: "In the accounting equation Assets = Liabilities + Equity, if a business takes a bank loan in cash, what happens?", opts: ["Only assets increase, nothing else changes", "Assets increase and liabilities increase by the same amount", "Equity decreases", "The equation temporarily goes out of balance"], correct: 1 },
    { q: "What is the correct order of the accounting flow?", opts: ["Ledger → Journal → Financial Statements → Trial Balance", "Journal → Ledger → Trial Balance → Financial Statements", "Trial Balance → Journal → Ledger → Financial Statements", "Financial Statements → Journal → Ledger → Trial Balance"], correct: 1 },
    { q: "Which ratio measures a company's ability to pay short-term debts WITHOUT relying on selling inventory first?", opts: ["Current Ratio", "Quick (Acid-Test) Ratio", "Debt-Equity Ratio", "Net Profit Ratio"], correct: 1 },
    { q: "A common-size statement expresses every line item as a percentage of what base, on the income statement?", opts: ["Total assets", "Net sales", "Fixed cost", "Opening stock"], correct: 1 },
    { q: "Which branch of accounting is primarily meant for OUTSIDE users like shareholders, lenders, and tax authorities?", opts: ["Cost Accounting", "Management Accounting", "Financial Accounting", "Budgetary Accounting"], correct: 2 },
    { q: "Which branch of accounting focuses specifically on ascertaining and controlling the cost per unit of a product?", opts: ["Financial Accounting", "Cost Accounting", "Tax Accounting", "Management Accounting"], correct: 1 },
    { q: "A budget prepared for several different activity levels, which can be adjusted to match actual output, is called a:", opts: ["Fixed Budget", "Master Budget", "Flexible Budget", "Zero-Based Budget"], correct: 2 },
    { q: "In Zero-Based Budgeting, what must happen to every expense each period?", opts: ["It is automatically carried forward unchanged", "It must be freshly justified from scratch", "It is increased by a fixed inflation percentage", "It is ignored unless it exceeds last year's figure"], correct: 1 },
    { q: "Under marginal costing, how is Contribution calculated?", opts: ["Sales minus Fixed Cost", "Sales minus Variable Cost", "Fixed Cost minus Variable Cost", "Sales minus Total Cost"], correct: 1 },
    { q: "A product has a selling price of ₹400, variable cost of ₹250 per unit, and total fixed costs of ₹6,00,000. What is the Break-Even Point in units?", opts: ["1,500 units", "2,400 units", "4,000 units", "6,000 units"], correct: 2 }
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
