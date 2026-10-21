// Injects the shared sidebar nav into every page's #sidebar element.
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83D\uDC41\uFE0F</span><div><h1>Computer Vision</h1><span>BTAI711A \u00B7 3 credits</span></div></div>',
    '<div class="nav-title">Unit 1</div>',
    '<a class="nav-item" href="index.html">\u2460 Image Formation & Calibration</a>',
    '<div class="nav-title">Unit 2</div>',
    '<a class="nav-item" href="feature-detection.html">\u2461 Feature Detection & Matching</a>',
    '<div class="nav-title">Unit 3</div>',
    '<a class="nav-item" href="stereo-vision.html">\u2462 Stereo Vision</a>',
    '<div class="nav-title">Unit 4</div>',
    '<a class="nav-item" href="shape-from-shading.html">\u2463 Shape from Shading</a>',
    '<div class="nav-title">Unit 5</div>',
    '<a class="nav-item" href="structure-from-motion.html">\u2464 Structure from Motion</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Quick-Reference Cheatsheet</a>',
    '<a class="nav-item" href="interview.html">\uD83C\uDFAF Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE0 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>'
  ].join('');

  // Re-apply active highlighting now that nav exists.
  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
