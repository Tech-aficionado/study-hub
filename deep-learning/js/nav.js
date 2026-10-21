// Injects the shared sidebar nav into every page's #sidebar element.
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = [
    '<div class="brand"><span class="logo">\uD83E\uDDE0</span><div><h1>Deep Learning</h1><span>BTAI713B \u00B7 3 Credits \u00B7 DSE</span></div></div>',
    '<div class="nav-title">Foundations</div>',
    '<a class="nav-item" href="index.html">\u2460 Introduction to Deep Learning</a>',
    '<a class="nav-item" href="neural-networks.html">\u2461 Neural Networks & Backprop</a>',
    '<div class="nav-title">Architectures</div>',
    '<a class="nav-item" href="cnn.html">\u2462 Convolutional Neural Networks</a>',
    '<a class="nav-item" href="rnn.html">\u2463 Recurrent Neural Networks</a>',
    '<div class="nav-title">Beyond the Basics</div>',
    '<a class="nav-item" href="advanced-topics.html">\u2464 Advanced Topics & Applications</a>',
    '<div class="nav-title">Practice</div>',
    '<a class="nav-item" href="cheatsheet.html">\uD83D\uDCCB Quick Reference</a>',
    '<a class="nav-item" href="interview.html">\uD83C\uDFAF Interview Questions</a>',
    '<a class="nav-item" href="quiz.html">\uD83E\uDDE9 Quiz</a>',
    '<a class="nav-item" href="videos.html">\u25B6\uFE0F Video Library</a>'
  ].join('');

  // Re-apply active highlighting now that nav exists.
  var here = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    if (item.getAttribute('href') === here) item.classList.add('active');
  });
});
