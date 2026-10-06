(function () {
  var quizData = [
    { q: "What does 'relational' refer to in a relational database?", opts: ["The database runs on relative paths", "The links/relationships between tables via keys", "Only databases with family-related data", "A type of NoSQL database"], correct: 1 },
    { q: "Why doesn't `WHERE col = NULL` work as expected?", opts: ["NULL means zero, so it should work", "NULL means 'unknown' — comparing unknown to unknown is also unknown, not true. Use IS NULL instead", "It's a typo and should be ISNULL()", "NULL columns can't be queried at all"], correct: 1 },
    { q: "What's the danger of running UPDATE or DELETE without a WHERE clause?", opts: ["Nothing, SQL blocks it automatically", "It affects EVERY row in the table", "It only affects the first row", "It requires admin permission automatically"], correct: 1 },
    { q: "What does an INNER JOIN return?", opts: ["All rows from both tables regardless of match", "Only rows that have a match in BOTH tables", "Only rows from the left table", "A random sample of matching rows"], correct: 1 },
    { q: "What's a common use case for LEFT JOIN that INNER JOIN can't do?", opts: ["Finding rows that exist in NEITHER table", "Finding all rows from one table including those with NO match (e.g. users with zero orders)", "Deleting unmatched rows", "Sorting results alphabetically"], correct: 1 },
    { q: "What's the difference between WHERE and HAVING?", opts: ["They are exactly the same", "WHERE filters rows BEFORE grouping; HAVING filters groups AFTER aggregation", "HAVING is used only for INSERT statements", "WHERE only works with JOIN"], correct: 1 },
    { q: "What is a primary key?", opts: ["Any column with a number in it", "A column (or set of columns) that uniquely identifies each row in a table", "The first column defined in a table", "A column that must contain NULL"], correct: 1 },
    { q: "What problem does normalization solve?", opts: ["It makes queries slower on purpose", "It prevents the same fact from being duplicated across many rows, avoiding contradictory data", "It compresses the database file size", "It's only relevant for NoSQL databases"], correct: 1 },
    { q: "What is the main purpose of a database INDEX?", opts: ["To make INSERT statements faster", "To let the database find matching rows without scanning the whole table", "To automatically back up the table", "To encrypt sensitive columns"], correct: 1 },
    { q: "In ACID, what does 'Atomicity' guarantee?", opts: ["Data is split into the smallest possible units", "All statements in a transaction succeed together, or none of them do", "Only one user can access the database at a time", "Queries run instantly with zero latency"], correct: 1 }
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
