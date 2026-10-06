(function () {
  var KEY = 'studyhub_github_labs_v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var state = load();

  var items = [];
  document.querySelectorAll('.checklist').forEach(function (ul) {
    var lab = ul.getAttribute('data-lab') || 'x';
    Array.prototype.forEach.call(ul.children, function (li, i) {
      var box = li.querySelector('input[type=checkbox]');
      var label = li.querySelector('label');
      if (!box || !label) return;
      var id = lab + ':' + i;
      box.checked = !!state[id];
      if (box.checked) label.classList.add('done');
      box.addEventListener('change', function () {
        state[id] = box.checked;
        if (box.checked) label.classList.add('done'); else label.classList.remove('done');
        save(state);
      });
      items.push(box);
    });
  });
})();
