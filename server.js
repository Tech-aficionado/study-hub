// Study Hub -- server with real, server-checked access control.
//
// Cloud Computing, Computer Vision, Deep Learning and Financial Literacy
// (your personal B.Tech material) are served to everyone, same as before.
//
// Docker, Kubernetes, Git, GitHub and SQL are gated behind a login: the
// server itself refuses to serve any file under those five folders unless
// the request carries a valid, server-issued session cookie. This is a real
// access boundary (unlike the earlier client-side lock): a direct request
// for e.g. /docker/index.html with no valid session gets a redirect to
// /login, never the file's bytes.
//
// Required environment variable (set in Render's dashboard, never committed):
//   ACCESS_PASSWORD   -- the password that unlocks the 5 locked topics
//   SESSION_SECRET     -- (optional) secret used to sign the session cookie;
//                          a random one is generated at boot if unset, which
//                          means sessions reset on every restart/deploy --
//                          set this explicitly for persistent logins.

'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const credentialStore = require('./credential-store');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// WebAuthn "relying party" identity. RP_ID must be the bare hostname the
// site is served from (no scheme, no port) -- Render gives you one at
// deploy time (e.g. study-hub.onrender.com) or your own custom domain.
// Set RP_ID and RP_ORIGIN as env vars once you know the real deployed host;
// they default to localhost for local dev.
const RP_ID = process.env.RP_ID || 'localhost';
const RP_ORIGIN = process.env.RP_ORIGIN || `http://localhost:${PORT}`;
const RP_NAME = 'Study Hub (Personal)';

if (!ACCESS_PASSWORD) {
  console.warn(
    '[study-hub] WARNING: ACCESS_PASSWORD is not set. The locked topics ' +
    '(docker, kubernetes, git, github, sql) are UNREACHABLE until it is ' +
    'set, because there is no password to check logins against. Set it in ' +
    "Render's dashboard under Environment, or in a local .env for dev."
  );
}

// Folders that require a login. Every request whose path starts with one of
// these (after normalization) is gated.
const LOCKED_TOPICS = ['docker', 'kubernetes', 'git', 'github', 'sql'];

app.set('trust proxy', 1); // Render sits behind a proxy; needed for secure cookies.

app.use(
  session({
    name: 'studyhub.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

app.use(express.urlencoded({ extended: false }));

function isLockedPath(urlPath) {
  // Normalize: strip leading slash, split on '/', check the first segment.
  const segment = urlPath.replace(/^\/+/, '').split('/')[0];
  return LOCKED_TOPICS.includes(segment);
}

function isAuthenticated(req) {
  return !!(req.session && req.session.authenticated);
}

// Gate: runs before static file serving. Any request into a locked topic
// folder without a valid session is redirected to /login, never served.
app.use((req, res, next) => {
  if (isLockedPath(req.path) && !isAuthenticated(req)) {
    const next_url = encodeURIComponent(req.originalUrl || '/');
    return res.redirect('/login?next=' + next_url);
  }
  next();
});

// Login page (GET) -- plain server-rendered HTML, no client-side secret logic.
app.get('/login', (req, res) => {
  const nextUrl = typeof req.query.next === 'string' ? req.query.next : '/';
  const error = req.query.error === '1';
  const hasFingerprint = !!credentialStore.load();
  res.set('Cache-Control', 'no-store');
  res.send(renderLoginPage(nextUrl, error, hasFingerprint));
});

// Login submit (POST) -- password is checked on the SERVER, never in the browser.
app.post('/login', (req, res) => {
  const submitted = typeof req.body.password === 'string' ? req.body.password : '';
  const nextUrl = typeof req.body.next === 'string' ? req.body.next : '/';

  if (!ACCESS_PASSWORD) {
    return res.status(503).send('Server is not configured with ACCESS_PASSWORD yet.');
  }

  const ok = timingSafeEqual(submitted, ACCESS_PASSWORD);
  if (!ok) {
    return res.redirect('/login?error=1&next=' + encodeURIComponent(nextUrl));
  }

  req.session.authenticated = true;
  const safeNext = isSafeInternalPath(nextUrl) ? nextUrl : '/';
  res.redirect(safeNext);
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Small account page, reachable once logged in: register a fingerprint, or
// log out. Linked from the breadcrumb bar injected into locked topic pages.
app.get('/account', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login?next=' + encodeURIComponent('/account'));
  const hasFingerprint = !!credentialStore.load();
  res.set('Cache-Control', 'no-store');
  res.send(renderAccountPage(hasFingerprint));
});

// ---------------------------------------------------------------------
// WebAuthn (fingerprint / Windows Hello / Touch ID) -- a real second
// factor. The credential's PUBLIC KEY is stored server-side
// (data/webauthn-credential.json) and every unlock is a signature the
// server verifies -- unlike a client-only check, this cannot be spoofed
// by editing localStorage.
//
// CAVEAT: Render's filesystem is ephemeral. A redeploy or restart wipes
// data/webauthn-credential.json, so a registered fingerprint stops working
// after the next deploy and must be re-registered. Password login (env-var
// based) is unaffected. For a fingerprint credential that survives
// deploys, this would need an external store (e.g. a tiny Postgres/Redis
// add-on) -- not set up here to keep this a single free web service.
// ---------------------------------------------------------------------

// Registration only works once you already have a session (i.e. you just
// logged in with the password) -- this stops a stranger from registering
// their own fingerprint as the site's credential.
app.post('/webauthn/register/options', requireAuthenticated, async (req, res) => {
  const existing = credentialStore.load();
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: 'studyhub-owner',
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred'
    },
    excludeCredentials: existing
      ? [{ id: existing.credentialID, transports: existing.transports }]
      : []
  });
  req.session.webauthnRegChallenge = options.challenge;
  res.json(options);
});

app.post('/webauthn/register/verify', requireAuthenticated, express.json(), async (req, res) => {
  const expectedChallenge = req.session.webauthnRegChallenge;
  if (!expectedChallenge) {
    return res.status(400).json({ ok: false, error: 'No pending registration challenge.' });
  }
  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID
    });
    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ ok: false, error: 'Verification failed.' });
    }
    const { credential } = verification.registrationInfo;
    credentialStore.save({
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: req.body.response && req.body.response.transports
    });
    delete req.session.webauthnRegChallenge;
    res.json({ ok: true });
  } catch (err) {
    console.error('[study-hub] WebAuthn registration error:', err.message);
    res.status(400).json({ ok: false, error: 'Registration failed.' });
  }
});

app.post('/webauthn/login/options', async (req, res) => {
  const existing = credentialStore.load();
  if (!existing) {
    return res.status(404).json({ ok: false, error: 'No fingerprint registered yet.' });
  }
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    allowCredentials: [{ id: existing.credentialID, transports: existing.transports }]
  });
  req.session.webauthnAuthChallenge = options.challenge;
  res.json(options);
});

app.post('/webauthn/login/verify', express.json(), async (req, res) => {
  const existing = credentialStore.load();
  const expectedChallenge = req.session.webauthnAuthChallenge;
  if (!existing || !expectedChallenge) {
    return res.status(400).json({ ok: false, error: 'No pending login challenge.' });
  }
  try {
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: existing.credentialID,
        publicKey: Buffer.from(existing.publicKey, 'base64url'),
        counter: existing.counter,
        transports: existing.transports
      }
    });
    if (!verification.verified) {
      return res.status(400).json({ ok: false, error: 'Verification failed.' });
    }
    existing.counter = verification.authenticationInfo.newCounter;
    credentialStore.save(existing);
    delete req.session.webauthnAuthChallenge;
    req.session.authenticated = true;
    res.json({ ok: true });
  } catch (err) {
    console.error('[study-hub] WebAuthn login error:', err.message);
    res.status(400).json({ ok: false, error: 'Login failed.' });
  }
});

function requireAuthenticated(req, res, next) {
  if (!isAuthenticated(req)) return res.status(401).json({ ok: false, error: 'Not logged in.' });
  next();
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal length to avoid a trivial timing leak
    // on length; crypto.timingSafeEqual requires equal-length buffers.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function isSafeInternalPath(p) {
  // Only allow redirecting back to a same-site relative path, never an
  // absolute URL to another host (open-redirect guard).
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderAccountPage(hasFingerprint) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account · Study Hub</title>
<style>
  :root{
    --bg:#0b0d12; --bg2:#121520; --bg3:#171b28; --card:#141825;
    --border:#262b3b; --text:#eef1f8; --muted:#8c93a8;
    --accent:#6e7bff; --accent2:#9aa5ff; --accent3:#4ee1c2; --danger:#ff6e6e;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{
    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    background:radial-gradient(circle at 20% -10%, #1b2140 0%, var(--bg) 55%);
    color:var(--text); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .card{
    width:100%; max-width:420px; background:linear-gradient(180deg,var(--bg3),var(--card));
    border:1px solid var(--border); border-radius:20px; padding:32px; box-shadow:0 20px 60px rgba(0,0,0,.4);
  }
  h1{font-size:18px; margin:0 0 6px; font-weight:800;}
  .sub{color:var(--muted); font-size:13px; margin:0 0 22px; line-height:1.5;}
  button{
    width:100%; padding:12px; border-radius:12px; border:none; font-size:14px; font-weight:700; cursor:pointer; margin-bottom:10px;
  }
  .btn-fingerprint{background:rgba(78,225,194,.14); color:var(--accent3); border:1px solid rgba(78,225,194,.3);}
  .btn-ghost{background:transparent; color:var(--muted); border:1px solid var(--border);}
  .status{font-size:12.5px; margin:10px 0; min-height:16px;}
  .status.ok{color:var(--accent3);}
  .status.err{color:var(--danger);}
  .note{font-size:11px; color:var(--muted); margin-top:16px; line-height:1.6; border-top:1px solid var(--border); padding-top:14px;}
  a{color:var(--accent2); text-decoration:none; font-size:12.5px;}
</style>
</head>
<body>
<div class="card">
  <h1>Account</h1>
  <p class="sub">You're logged in. Manage fingerprint unlock for Docker, Kubernetes, Git, GitHub and SQL below.</p>

  ${hasFingerprint
    ? '<p class="status ok">✅ Fingerprint / Windows Hello is registered on this device.</p>'
    : `<button type="button" class="btn-fingerprint" id="registerBtn">👆 Add fingerprint / Windows Hello unlock</button>`
  }
  <div class="status" id="regStatus"></div>

  <form method="POST" action="/logout">
    <button type="submit" class="btn-ghost">Log out</button>
  </form>

  <p class="note">
    Fingerprint registration is stored on the server, but Render's free-tier
    filesystem is wiped on every redeploy -- if a redeploy happens, you'll
    need to log in with the password once and re-register the fingerprint.
    The password itself is unaffected by deploys.
  </p>
  <p style="margin-top:14px;"><a href="/">← Back to Study Hub</a></p>
</div>
${!hasFingerprint ? `
<script>
  function bufToB64url(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
  }
  function b64urlToBuf(s) {
    s = s.replace(/-/g,'+').replace(/_/g,'/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  document.getElementById('registerBtn').addEventListener('click', async function () {
    var statusEl = document.getElementById('regStatus');
    statusEl.className = 'status';
    statusEl.textContent = 'Starting registration...';
    try {
      var optsRes = await fetch('/webauthn/register/options', { method: 'POST' });
      var options = await optsRes.json();
      options.challenge = b64urlToBuf(options.challenge);
      options.user.id = b64urlToBuf(options.user.id);
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map(function (c) {
          return Object.assign({}, c, { id: b64urlToBuf(c.id) });
        });
      }
      var credential = await navigator.credentials.create({ publicKey: options });
      var body = {
        id: credential.id,
        rawId: bufToB64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufToB64url(credential.response.attestationObject),
          clientDataJSON: bufToB64url(credential.response.clientDataJSON),
          transports: credential.response.getTransports ? credential.response.getTransports() : []
        }
      };
      var verifyRes = await fetch('/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var result = await verifyRes.json();
      if (result.ok) {
        statusEl.className = 'status ok';
        statusEl.textContent = '✅ Fingerprint registered. Reloading...';
        setTimeout(function () { location.reload(); }, 900);
      } else {
        statusEl.className = 'status err';
        statusEl.textContent = 'Registration failed: ' + (result.error || 'unknown error');
      }
    } catch (e) {
      statusEl.className = 'status err';
      statusEl.textContent = 'Registration cancelled or not supported on this device/browser.';
    }
  });
</script>
` : ''}
</body>
</html>`;
}

function renderLoginPage(nextUrl, hasError, hasFingerprint) {
  const safeNext = escapeHtml(isSafeInternalPath(nextUrl) ? nextUrl : '/');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Locked · Study Hub</title>
<style>
  :root{
    --bg:#0b0d12; --bg2:#121520; --bg3:#171b28; --card:#141825;
    --border:#262b3b; --text:#eef1f8; --muted:#8c93a8;
    --accent:#6e7bff; --accent2:#9aa5ff; --accent3:#4ee1c2; --danger:#ff6e6e;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;}
  body{
    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    background:radial-gradient(circle at 20% -10%, #1b2140 0%, var(--bg) 55%);
    color:var(--text); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .card{
    width:100%; max-width:380px; background:linear-gradient(180deg,var(--bg3),var(--card));
    border:1px solid var(--border); border-radius:20px; padding:36px 32px; text-align:center;
    box-shadow:0 20px 60px rgba(0,0,0,.4);
  }
  .lock-icon{
    width:60px; height:60px; margin:0 auto 18px; border-radius:16px; display:flex; align-items:center; justify-content:center;
    font-size:28px; background:linear-gradient(135deg,var(--accent),var(--accent3)); box-shadow:0 8px 24px rgba(110,123,255,.35);
  }
  h1{font-size:19px; margin:0 0 6px; font-weight:800;}
  .sub{color:var(--muted); font-size:13px; margin:0 0 26px;}
  input[type=password]{
    width:100%; padding:13px 14px; border-radius:12px; border:1px solid var(--border);
    background:var(--bg2); color:var(--text); font-size:15px; margin-bottom:12px; outline:none;
  }
  input[type=password]:focus{border-color:var(--accent);}
  button{
    width:100%; padding:13px; border-radius:12px; border:none; font-size:14.5px; font-weight:700; cursor:pointer;
    margin-bottom:10px;
  }
  button:active{transform:scale(.98);}
  .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff;}
  .btn-fingerprint{background:rgba(78,225,194,.14); color:var(--accent3); border:1px solid rgba(78,225,194,.3);}
  .err{color:var(--danger); font-size:12.5px; min-height:16px; margin:-2px 0 10px;}
  .divider{display:flex; align-items:center; gap:10px; color:var(--muted); font-size:11px; margin:14px 0; text-transform:uppercase; letter-spacing:.06em;}
  .divider::before,.divider::after{content:''; flex:1; height:1px; background:var(--border);}
  .back-link{display:inline-block; margin-top:18px; color:var(--muted); font-size:12.5px; text-decoration:none;}
  .back-link:hover{color:var(--accent2);}
</style>
</head>
<body>
<div class="card">
  <div class="lock-icon">🔒</div>
  <h1>Personal Study Topics</h1>
  <p class="sub">Docker, Kubernetes, Git, GitHub and SQL are password-protected.</p>
  <form method="POST" action="/login" id="loginForm">
    <input type="hidden" name="next" value="${safeNext}">
    <input type="password" name="password" placeholder="Enter password" autocomplete="current-password" autofocus>
    <div class="err">${hasError ? 'Incorrect password.' : ''}</div>
    <button type="submit" class="btn-primary">Unlock</button>
  </form>
  ${hasFingerprint ? `
  <div class="divider">or</div>
  <button type="button" class="btn-fingerprint" id="fingerprintBtn">👆 Unlock with fingerprint / Windows Hello</button>
  <div class="err" id="fpErr"></div>
  ` : ''}
  <a class="back-link" href="/">← Back to Study Hub</a>
</div>
${hasFingerprint ? `
<script>
  function bufToB64url(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
  }
  function b64urlToBuf(s) {
    s = s.replace(/-/g,'+').replace(/_/g,'/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  document.getElementById('fingerprintBtn').addEventListener('click', async function () {
    var errEl = document.getElementById('fpErr');
    errEl.textContent = '';
    try {
      var optsRes = await fetch('/webauthn/login/options', { method: 'POST' });
      if (!optsRes.ok) throw new Error('no-credential');
      var options = await optsRes.json();
      options.challenge = b64urlToBuf(options.challenge);
      options.allowCredentials = (options.allowCredentials || []).map(function (c) {
        return Object.assign({}, c, { id: b64urlToBuf(c.id) });
      });
      var assertion = await navigator.credentials.get({ publicKey: options });
      var body = {
        id: assertion.id,
        rawId: bufToB64url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufToB64url(assertion.response.authenticatorData),
          clientDataJSON: bufToB64url(assertion.response.clientDataJSON),
          signature: bufToB64url(assertion.response.signature),
          userHandle: assertion.response.userHandle ? bufToB64url(assertion.response.userHandle) : undefined
        }
      };
      var verifyRes = await fetch('/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var result = await verifyRes.json();
      if (result.ok) {
        location.href = ${JSON.stringify(safeNext)} || '/';
      } else {
        errEl.textContent = 'Fingerprint check failed.';
      }
    } catch (e) {
      errEl.textContent = 'Fingerprint unlock failed or was cancelled.';
    }
  });
</script>
` : ''}
</body>
</html>`;
}

// Static files -- everything else (hub, the 4 open topics, shared css/js,
// icons, manifest) is served unconditionally; the 5 locked topics only reach
// here once the gate above has let the request through.
app.use(express.static(ROOT, { extensions: ['html'] }));

app.use((req, res) => {
  res.status(404).send('Not found.');
});

app.listen(PORT, () => {
  console.log(`Study Hub listening on port ${PORT}`);
});
