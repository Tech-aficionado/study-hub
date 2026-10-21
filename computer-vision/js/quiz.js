// Quiz — standalone module, loaded only on quiz.html

(function () {
  var quizData = [
    { q: "In the pinhole camera model, what happens to a point's image size as its depth Z increases?", opts: ["It stays the same", "It shrinks, since x = f·X/Z", "It grows proportionally to Z", "It becomes undefined"], correct: 1 },
    { q: "Why does non-linear (iterative) camera calibration improve on a purely linear (DLT) solution?", opts: ["It is always faster", "It can model lens distortion and minimizes actual reprojection error", "It needs no checkerboard images", "It eliminates the need for intrinsics"], correct: 1 },
    { q: "Which edge detector uses a multi-stage pipeline (smoothing, gradient, non-max suppression, hysteresis thresholding)?", opts: ["Sobel", "Roberts Cross", "Canny", "Laplacian"], correct: 2 },
    { q: "Why is RANSAC robust to outlier correspondences when fitting a model?", opts: ["It averages all correspondences equally", "Models fit from random outlier samples rarely gain consensus from other points", "It requires all points to be inliers", "It only works with exactly 4 points"], correct: 1 },
    { q: "What does the epipolar constraint let you do in stereo matching?", opts: ["Search the entire 2D image for a match", "Collapse the correspondence search to a single 1D line", "Avoid needing two cameras", "Skip camera calibration entirely"], correct: 1 },
    { q: "What is the 'aperture problem' in optical flow?", opts: ["The camera lens is physically too small", "One brightness-constancy equation per pixel cannot alone determine both u and v", "Flow only works with wide apertures", "It refers to lens distortion"], correct: 1 },
    { q: "What makes photometric stereo well-posed, unlike single-image shape from shading?", opts: ["It uses a bigger camera sensor", "Multiple images under different known light directions give enough equations to solve for N and albedo directly", "It ignores surface albedo", "It requires no light source at all"], correct: 1 },
    { q: "Why is recovering shape from a single shaded image considered ill-posed?", opts: ["Cameras cannot capture single images", "One brightness equation per pixel underconstrains the two normal-orientation unknowns", "It requires color images", "Light sources are unknown in all cases"], correct: 1 },
    { q: "In structure from motion, what does 'Euclidean upgrade' refer to?", opts: ["Switching from grayscale to color images", "Converting an ambiguous projective reconstruction into one with correct scale and angles using intrinsics/metric references", "Adding more cameras to the rig", "A step unique to stereo vision only"], correct: 1 },
    { q: "What is the role of bundle adjustment in a structure-from-motion pipeline?", opts: ["It detects edges in each frame", "It jointly refines all camera poses and 3D points by minimizing total reprojection error", "It computes the essential matrix only", "It replaces the need for feature matching"], correct: 1 }
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
      res.style.color = '#3fb950';
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
