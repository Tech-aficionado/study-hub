// Tiny JSON-file store for the one WebAuthn credential this personal site
// supports. A real multi-user app would use a database; Study Hub has
// exactly one owner, so a single file is the right-sized solution.

'use strict';

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'webauthn-credential.json');

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function save(credential) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(credential, null, 2), 'utf8');
}

function clear() {
  try {
    fs.unlinkSync(STORE_PATH);
  } catch (e) {
    // already absent, nothing to do
  }
}

module.exports = { load, save, clear, STORE_PATH };
