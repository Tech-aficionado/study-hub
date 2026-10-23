// Study Hub -- Personal Topic Lock
// Gates access to personal B.Tech topics (cloud-computing, computer-vision,
// deep-learning, financial-literacy -- and ethics-for-engineering once added)
// with a password and, where supported, a device fingerprint/biometric
// unlock via WebAuthn platform authenticators (Windows Hello, Touch ID,
// Android fingerprint).
//
// Honesty note (client-side static site, no backend):
// - Password is never stored in plaintext. We store a salted SHA-256 hash
//   in localStorage and compare hashes. Anyone with access to this same
//   browser profile's devtools/localStorage could still inspect this script
//   and brute-force offline -- this stops casual/shoulder access, it is not
//   a real security boundary.
// - Fingerprint unlock uses a real OS biometric prompt (WebAuthn platform
//   authenticator). Because there is no server to hold/verify a public key,
//   we treat "a platform credential registered on this device successfully
//   asserts" as the unlock signal. That is genuine hardware-backed biometric
//   gating for a single personal device, not a full relying-party protocol.

(function () {
  var LOCK_NS = 'studyhub_lock_';
  var SESSION_KEY = LOCK_NS + 'unlocked'; // sessionStorage: unlocked for this browser session
  var HASH_KEY = LOCK_NS + 'pwhash';
  var SALT_KEY = LOCK_NS + 'salt';
  var CRED_ID_KEY = LOCK_NS + 'webauthn_cred_id';

  function hasPassword() {
    try { return !!localStorage.getItem(HASH_KEY); } catch (e) { return false; }
  }

  function hasFingerprint() {
    try { return !!localStorage.getItem(CRED_ID_KEY); } catch (e) { return false; }
  }

  function isUnlocked() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function setUnlocked() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  function bufToHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function randomSalt() {
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return bufToHex(arr);
  }

  function sha256Hex(text) {
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(bufToHex);
  }

  function hashPassword(password, salt) {
    return sha256Hex(salt + ':' + password);
  }

  function setPassword(password) {
    var salt = randomSalt();
    return hashPassword(password, salt).then(function (hash) {
      try {
        localStorage.setItem(SALT_KEY, salt);
        localStorage.setItem(HASH_KEY, hash);
      } catch (e) {}
    });
  }

  function checkPassword(password) {
    var salt = '';
    try { salt = localStorage.getItem(SALT_KEY) || ''; } catch (e) {}
    return hashPassword(password, salt).then(function (hash) {
      var stored = '';
      try { stored = localStorage.getItem(HASH_KEY) || ''; } catch (e) {}
      return hash === stored;
    });
  }

  function webAuthnSupported() {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
  }

  function randomChallenge() {
    var arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return arr;
  }

  function registerFingerprint() {
    if (!webAuthnSupported()) return Promise.reject(new Error('not supported'));
    var userId = new Uint8Array(16);
    crypto.getRandomValues(userId);
    return navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: 'Study Hub (Personal)' },
        user: { id: userId, name: 'studyhub-owner', displayName: 'Study Hub Owner' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000
      }
    }).then(function (cred) {
      var id = bufToHex(cred.rawId);
      try { localStorage.setItem(CRED_ID_KEY, id); } catch (e) {}
      return id;
    });
  }

  function unlockWithFingerprint() {
    if (!webAuthnSupported()) return Promise.reject(new Error('not supported'));
    var credIdHex = '';
    try { credIdHex = localStorage.getItem(CRED_ID_KEY) || ''; } catch (e) {}
    if (!credIdHex) return Promise.reject(new Error('no registered fingerprint'));
    var rawId = new Uint8Array(credIdHex.match(/.{1,2}/g).map(function (b) { return parseInt(b, 16); }));
    return navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        allowCredentials: [{ id: rawId, type: 'public-key', transports: ['internal'] }],
        userVerification: 'required',
        timeout: 60000
      }
    }).then(function (assertion) {
      return !!assertion;
    });
  }

  function forgetDevice() {
    try {
      localStorage.removeItem(HASH_KEY);
      localStorage.removeItem(SALT_KEY);
      localStorage.removeItem(CRED_ID_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  window.StudyHubLock = {
    hasPassword: hasPassword,
    hasFingerprint: hasFingerprint,
    isUnlocked: isUnlocked,
    setUnlocked: setUnlocked,
    setPassword: setPassword,
    checkPassword: checkPassword,
    webAuthnSupported: webAuthnSupported,
    registerFingerprint: registerFingerprint,
    unlockWithFingerprint: unlockWithFingerprint,
    forgetDevice: forgetDevice
  };
})();
