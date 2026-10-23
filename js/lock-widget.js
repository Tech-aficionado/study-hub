// Study Hub -- Lock Settings Widget
// Adds a small "Lock" control into the hub-bar of locked-topic pages, letting
// the user register a fingerprint/Windows Hello unlock for next time, or
// manually re-lock the current session.

document.addEventListener('DOMContentLoaded', function () {
  if (!window.StudyHubLock) return;
  var bar = document.querySelector('.hub-bar');
  if (!bar) return;

  var box = document.createElement('div');
  box.style.marginLeft = 'auto';
  box.style.display = 'flex';
  box.style.gap = '8px';
  box.style.alignItems = 'center';

  if (window.StudyHubLock.webAuthnSupported() && !window.StudyHubLock.hasFingerprint()) {
    var regBtn = document.createElement('button');
    regBtn.textContent = '👆 Add fingerprint unlock';
    regBtn.style.cssText = 'font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:20px;border:1px solid rgba(78,225,194,.35);background:rgba(78,225,194,.12);color:#4ee1c2;cursor:pointer;';
    regBtn.addEventListener('click', function () {
      window.StudyHubLock.registerFingerprint().then(function () {
        regBtn.textContent = '✅ Fingerprint added';
        setTimeout(function () { box.removeChild(regBtn); }, 1500);
      }).catch(function () {
        alert('Could not register a fingerprint/Windows Hello credential on this device/browser.');
      });
    });
    box.appendChild(regBtn);
  }

  var lockBtn = document.createElement('button');
  lockBtn.textContent = '🔒 Lock now';
  lockBtn.style.cssText = 'font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:20px;border:1px solid #262b3b;background:transparent;color:#8c93a8;cursor:pointer;';
  lockBtn.addEventListener('click', function () {
    try { sessionStorage.removeItem('studyhub_lock_unlocked'); } catch (e) {}
    location.href = '../lock.html';
  });
  box.appendChild(lockBtn);

  bar.appendChild(box);
});
