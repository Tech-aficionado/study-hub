// Study Hub -- adds an "Account" link (fingerprint management / logout)
// into the breadcrumb bar on pages that are server-gated. Served from the
// shared js/ folder; only loaded by the 5 locked topics' pages.
document.addEventListener('DOMContentLoaded', function () {
  var bar = document.querySelector('.hub-bar');
  if (!bar) return;
  var link = document.createElement('a');
  link.href = '/account';
  link.textContent = '🔐 Account';
  link.style.marginLeft = 'auto';
  link.style.fontSize = '12px';
  bar.appendChild(link);
});
