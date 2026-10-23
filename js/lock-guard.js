// Study Hub -- Lock Guard
// Include this script (before page content is meaningfully visible) on every
// page of a locked personal topic. Redirects to the shared lock screen if the
// current browser session hasn't unlocked yet.
//
// Usage from a topic page at D:\StudyHub\<topic>\<page>.html:
//   <script src="../js/lock.js"></script>
//   <script src="../js/lock-guard.js"></script>

(function () {
  if (!window.StudyHubLock || !window.StudyHubLock.isUnlocked()) {
    var here = location.pathname.split('/').slice(-2).join('/'); // "<topic>/<page>.html"
    location.replace('../lock.html?next=' + encodeURIComponent(here));
  }
})();
