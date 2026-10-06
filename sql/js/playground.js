/* SQL Playground — real SQLite in the browser via sql.js (vendored).
 * The DOM-free parts (sample-DB schema SQL + example queries) are exported for
 * node testing via module.exports at the bottom. */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Deterministic sample database (a tiny e-commerce + HR schema).
  //    Pure string builder — no DOM, no sql.js — so a node test can run it.
  // ---------------------------------------------------------------------------
  function buildSchemaSQL() {
    var sql = [];

    sql.push(
      'CREATE TABLE categories (',
      '  id INTEGER PRIMARY KEY,',
      '  name TEXT NOT NULL UNIQUE',
      ');',
      'CREATE TABLE products (',
      '  id INTEGER PRIMARY KEY,',
      '  name TEXT NOT NULL,',
      '  category_id INTEGER REFERENCES categories(id),',
      '  price NUMERIC NOT NULL CHECK (price >= 0),',
      '  stock INTEGER NOT NULL DEFAULT 0',
      ');',
      'CREATE TABLE customers (',
      '  id INTEGER PRIMARY KEY,',
      '  name TEXT NOT NULL,',
      '  email TEXT UNIQUE,',
      '  city TEXT,',
      '  country TEXT,',
      "  created_at TEXT NOT NULL DEFAULT '2023-01-01'",
      ');',
      'CREATE TABLE orders (',
      '  id INTEGER PRIMARY KEY,',
      '  customer_id INTEGER NOT NULL REFERENCES customers(id),',
      '  order_date TEXT NOT NULL,',
      "  status TEXT NOT NULL DEFAULT 'pending'",
      ');',
      'CREATE TABLE order_items (',
      '  id INTEGER PRIMARY KEY,',
      '  order_id INTEGER NOT NULL REFERENCES orders(id),',
      '  product_id INTEGER NOT NULL REFERENCES products(id),',
      '  quantity INTEGER NOT NULL CHECK (quantity > 0),',
      '  unit_price NUMERIC NOT NULL',
      ');',
      'CREATE TABLE departments (',
      '  id INTEGER PRIMARY KEY,',
      '  name TEXT NOT NULL UNIQUE',
      ');',
      'CREATE TABLE employees (',
      '  id INTEGER PRIMARY KEY,',
      '  name TEXT NOT NULL,',
      '  department_id INTEGER REFERENCES departments(id),',
      '  manager_id INTEGER REFERENCES employees(id),',
      '  salary NUMERIC NOT NULL,',
      '  hire_date TEXT NOT NULL',
      ');'
    );

    // ---- categories ----
    var categories = [
      [1, 'Electronics'], [2, 'Books'], [3, 'Home & Kitchen'],
      [4, 'Toys'], [5, 'Clothing']
    ];
    categories.forEach(function (c) {
      sql.push("INSERT INTO categories (id, name) VALUES (" + c[0] + ", '" + c[1] + "');");
    });

    // ---- products (deterministic generator) ----
    var productNames = {
      1: ['Wireless Mouse', 'USB-C Charger', 'Noise-Cancelling Headphones', 'Mechanical Keyboard', '4K Monitor', 'Webcam', 'Portable SSD', 'Smart Speaker'],
      2: ['SQL in Depth', 'Clean Code', 'The Pragmatic Programmer', 'Designing Data Systems', 'Database Internals'],
      3: ['Chef Knife', 'Cast Iron Pan', 'French Press', 'Blender', 'Toaster'],
      4: ['Building Blocks', 'Puzzle 1000pc', 'RC Car', 'Board Game'],
      5: ['Cotton T-Shirt', 'Hoodie', 'Running Socks', 'Denim Jacket', 'Beanie']
    };
    var pid = 1, priceSeed = 7;
    var products = [];
    Object.keys(productNames).forEach(function (catId) {
      productNames[catId].forEach(function (pname) {
        // deterministic pseudo-price in [5, 320) and stock in [0, 200)
        priceSeed = (priceSeed * 37 + 11) % 313;
        var price = (priceSeed + 5) + 0.99;
        var stock = (priceSeed * 7) % 200;
        products.push([pid, pname, Number(catId), price, stock]);
        sql.push("INSERT INTO products (id, name, category_id, price, stock) VALUES (" +
          pid + ", '" + pname.replace(/'/g, "''") + "', " + catId + ", " + price.toFixed(2) + ", " + stock + ");");
        pid++;
      });
    });
    var PRODUCT_COUNT = products.length;

    // ---- customers ----
    var cityCountry = [
      ['Berlin', 'Germany'], ['Munich', 'Germany'], ['Paris', 'France'],
      ['Lyon', 'France'], ['Madrid', 'Spain'], ['Lisbon', 'Portugal'],
      ['Amsterdam', 'Netherlands'], ['Rome', 'Italy'], ['Vienna', 'Austria'],
      ['Dublin', 'Ireland'], ['Oslo', 'Norway'], ['Stockholm', 'Sweden']
    ];
    var firstNames = ['Ana', 'Ben', 'Carla', 'David', 'Elena', 'Felix', 'Greta', 'Hugo', 'Iris', 'Jonas', 'Klara', 'Leo', 'Mia', 'Nico', 'Olivia', 'Paul', 'Quinn', 'Rosa', 'Sven', 'Tina'];
    var lastNames = ['Weber', 'Dubois', 'Garcia', 'Rossi', 'Jansen', 'Silva', 'Novak', 'Berg', 'Costa', 'Haas'];
    var CUSTOMER_COUNT = 40;
    for (var ci = 1; ci <= CUSTOMER_COUNT; ci++) {
      var fn = firstNames[(ci * 3) % firstNames.length];
      var ln = lastNames[(ci * 7) % lastNames.length];
      var loc = cityCountry[(ci * 5) % cityCountry.length];
      var month = ((ci * 2) % 12) + 1;
      var day = ((ci * 3) % 27) + 1;
      var created = '2023-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var email = (fn + '.' + ln + ci).toLowerCase() + '@example.com';
      sql.push("INSERT INTO customers (id, name, email, city, country, created_at) VALUES (" +
        ci + ", '" + (fn + ' ' + ln) + "', '" + email + "', '" + loc[0] + "', '" + loc[1] + "', '" + created + "');");
    }

    // ---- orders + order_items (deterministic) ----
    var statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    var oid = 1, oiid = 1;
    var ORDER_COUNT = 120;
    for (var o = 1; o <= ORDER_COUNT; o++) {
      var cust = ((o * 13) % CUSTOMER_COUNT) + 1;
      var mo = ((o * 7) % 12) + 1;
      var dy = ((o * 11) % 27) + 1;
      var odate = '2024-' + String(mo).padStart(2, '0') + '-' + String(dy).padStart(2, '0');
      var status = statuses[(o * 3) % statuses.length];
      sql.push("INSERT INTO orders (id, customer_id, order_date, status) VALUES (" +
        oid + ", " + cust + ", '" + odate + "', '" + status + "');");
      // 1..3 items per order
      var itemCount = (o % 3) + 1;
      for (var k = 0; k < itemCount; k++) {
        var prod = (((o * 17) + (k * 5)) % PRODUCT_COUNT) + 1;
        var qty = ((o + k) % 4) + 1;
        var up = products[prod - 1][3];
        sql.push("INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (" +
          oiid + ", " + oid + ", " + prod + ", " + qty + ", " + up.toFixed(2) + ");");
        oiid++;
      }
      oid++;
    }

    // ---- departments + employees (with manager_id self-reference) ----
    var departments = [[1, 'Engineering'], [2, 'Sales'], [3, 'Marketing'], [4, 'Support'], [5, 'Finance']];
    departments.forEach(function (d) {
      sql.push("INSERT INTO departments (id, name) VALUES (" + d[0] + ", '" + d[1] + "');");
    });
    // employee 1 = CEO (no manager); 2-6 = managers of each dept; 7..= staff
    var emps = [
      [1, 'Dana Chief', null, null, 240000, '2015-02-01'],
      [2, 'Erik Lead', 1, 1, 165000, '2016-05-10'],
      [3, 'Farah Lead', 2, 1, 158000, '2016-08-21'],
      [4, 'Gabriel Lead', 3, 1, 142000, '2017-01-15'],
      [5, 'Hana Lead', 4, 1, 138000, '2017-03-30'],
      [6, 'Ivan Lead', 5, 1, 171000, '2016-11-11']
    ];
    var staffFirst = ['Aaron', 'Bianca', 'Cedric', 'Diana', 'Elias', 'Fiona', 'Georg', 'Helena', 'Igor', 'Julia', 'Kai', 'Lena', 'Marco', 'Nadia', 'Omar', 'Petra', 'Rafael', 'Sofia', 'Timo', 'Vera', 'Wim', 'Xenia', 'Yannick', 'Zara'];
    var eid = 7;
    for (var s = 0; s < staffFirst.length; s++) {
      var dept = (s % 5) + 1;
      var mgr = dept + 1; // dept 1 -> manager emp 2, etc.
      var sal = 70000 + ((s * 4337) % 60000);
      var hy = 2018 + (s % 6);
      var hm = ((s * 5) % 12) + 1;
      var hd = ((s * 7) % 27) + 1;
      var hire = hy + '-' + String(hm).padStart(2, '0') + '-' + String(hd).padStart(2, '0');
      emps.push([eid, staffFirst[s] + ' Staff', dept, mgr, sal, hire]);
      eid++;
    }
    emps.forEach(function (e) {
      sql.push("INSERT INTO employees (id, name, department_id, manager_id, salary, hire_date) VALUES (" +
        e[0] + ", '" + e[1] + "', " + (e[2] == null ? 'NULL' : e[2]) + ", " +
        (e[3] == null ? 'NULL' : e[3]) + ", " + e[4] + ", '" + e[5] + "');");
    });

    return sql.join('\n');
  }

  // ---------------------------------------------------------------------------
  // 2. Example queries grouped by concept (shown in the UI, run in node test).
  // ---------------------------------------------------------------------------
  var EXAMPLES = [
    { group: 'Basics', label: 'All customers', sql: 'SELECT * FROM customers LIMIT 10;' },
    { group: 'Basics', label: 'Pick columns + filter', sql: "SELECT name, city, country\nFROM customers\nWHERE country = 'Germany';" },
    { group: 'Basics', label: 'Sort + paginate', sql: 'SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 5 OFFSET 0;' },
    { group: 'Filtering', label: 'LIKE / IN / BETWEEN', sql: "SELECT name, price FROM products\nWHERE name LIKE '%a%'\n  AND price BETWEEN 20 AND 100\n  AND category_id IN (1, 2);" },
    { group: 'Filtering', label: 'NULL check (employees w/o manager)', sql: 'SELECT name FROM employees WHERE manager_id IS NULL;' },
    { group: 'Filtering', label: 'CASE expression', sql: "SELECT name, price,\n  CASE WHEN price >= 100 THEN 'premium'\n       WHEN price >= 30  THEN 'mid'\n       ELSE 'budget' END AS tier\nFROM products\nORDER BY price DESC\nLIMIT 10;" },
    { group: 'Aggregation', label: 'Count & average', sql: 'SELECT COUNT(*) AS products, ROUND(AVG(price), 2) AS avg_price\nFROM products;' },
    { group: 'Aggregation', label: 'GROUP BY category', sql: 'SELECT c.name AS category, COUNT(*) AS n, ROUND(AVG(p.price), 2) AS avg_price\nFROM products p\nJOIN categories c ON c.id = p.category_id\nGROUP BY c.name\nORDER BY n DESC;' },
    { group: 'Aggregation', label: 'HAVING (busy customers)', sql: 'SELECT customer_id, COUNT(*) AS orders\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) >= 4\nORDER BY orders DESC;' },
    { group: 'Joins', label: 'INNER JOIN', sql: 'SELECT o.id AS order_id, cu.name AS customer, o.status\nFROM orders o\nINNER JOIN customers cu ON cu.id = o.customer_id\nLIMIT 10;' },
    { group: 'Joins', label: 'LEFT JOIN (customers w/ 0 orders)', sql: 'SELECT cu.name\nFROM customers cu\nLEFT JOIN orders o ON o.customer_id = cu.id\nWHERE o.id IS NULL;' },
    { group: 'Joins', label: 'SELF JOIN (employee → manager)', sql: 'SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id\nORDER BY e.id\nLIMIT 12;' },
    { group: 'Subqueries', label: 'IN subquery', sql: "SELECT name FROM customers\nWHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled');" },
    { group: 'Subqueries', label: 'Correlated EXISTS', sql: 'SELECT cu.name\nFROM customers cu\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = cu.id)\nLIMIT 10;' },
    { group: 'Subqueries', label: 'Scalar subquery (above-avg products)', sql: 'SELECT name, price FROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC;' },
    { group: 'CTEs', label: 'Simple CTE', sql: 'WITH order_totals AS (\n  SELECT order_id, SUM(quantity * unit_price) AS total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT * FROM order_totals ORDER BY total DESC LIMIT 10;' },
    { group: 'CTEs', label: 'Recursive CTE (1..10)', sql: 'WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;' },
    { group: 'Set ops', label: 'UNION', sql: "SELECT city FROM customers WHERE country = 'Germany'\nUNION\nSELECT city FROM customers WHERE country = 'France';" },
    { group: 'Window', label: 'ROW_NUMBER per department', sql: 'SELECT name, department_id, salary,\n  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn\nFROM employees\nORDER BY department_id, rn;' },
    { group: 'Window', label: 'Running total of order values', sql: 'WITH t AS (\n  SELECT o.id, o.order_date,\n         SUM(oi.quantity * oi.unit_price) AS value\n  FROM orders o JOIN order_items oi ON oi.order_id = o.id\n  GROUP BY o.id\n)\nSELECT id, order_date, value,\n  SUM(value) OVER (ORDER BY id) AS running_total\nFROM t ORDER BY id LIMIT 15;' },
    { group: 'Window', label: 'LAG — compare to previous row', sql: 'SELECT name, salary,\n  LAG(salary) OVER (ORDER BY salary) AS prev_salary,\n  salary - LAG(salary) OVER (ORDER BY salary) AS diff\nFROM employees\nORDER BY salary\nLIMIT 12;' },
    { group: 'Modify', label: 'INSERT + read back (safe)', sql: "INSERT INTO categories (id, name) VALUES (99, 'Garden');\nSELECT * FROM categories WHERE id = 99;" },
    { group: 'Analysis', label: 'EXPLAIN QUERY PLAN', sql: 'EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 5;' }
  ];

  // ---------------------------------------------------------------------------
  // 3. Browser UI (skipped entirely under node).
  // ---------------------------------------------------------------------------
  function initUI() {
    var statusEl = document.getElementById('pgStatus');
    var editor = document.getElementById('pgEditor');
    var runBtn = document.getElementById('pgRun');
    var resetBtn = document.getElementById('pgReset');
    var resultsEl = document.getElementById('pgResults');
    var schemaEl = document.getElementById('pgSchema');
    var examplesEl = document.getElementById('pgExamples');
    var historyEl = document.getElementById('pgHistory');
    var saveBtn = document.getElementById('pgSave');
    var loadBtn = document.getElementById('pgLoad');
    var tryBanner = document.getElementById('pgTry');
    if (!editor || !runBtn || !resultsEl) return;

    var SQL = null, db = null;
    var LS_DB = 'studyhub_sql_db_v1';
    var LS_HIST = 'studyhub_sql_history_v1';

    function setStatus(msg, kind) {
      statusEl.textContent = msg;
      statusEl.className = 'pg-status' + (kind ? ' pg-' + kind : '');
    }

    function freshDB(bytes) {
      if (db) { try { db.close(); } catch (e) {} }
      db = bytes ? new SQL.Database(bytes) : new SQL.Database();
      if (!bytes) db.run(buildSchemaSQL());
      renderSchema();
    }

    function renderSchema() {
      if (!schemaEl || !db) return;
      schemaEl.innerHTML = '';
      var res = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
      if (!res.length) return;
      res[0].values.forEach(function (row) {
        var table = row[0];
        var cols = db.exec('PRAGMA table_info(' + table + ');');
        var wrap = document.createElement('div');
        wrap.className = 'pg-table';
        var head = document.createElement('button');
        head.type = 'button';
        head.className = 'pg-table-name';
        head.textContent = table;
        head.title = 'Click to insert "' + table + '" into the editor';
        head.addEventListener('click', function () { insertAtCursor(table); });
        wrap.appendChild(head);
        if (cols.length) {
          var ul = document.createElement('ul');
          cols[0].values.forEach(function (cr) {
            var cname = cr[1], ctype = cr[2], pk = cr[5];
            var li = document.createElement('li');
            li.innerHTML = '<button type="button" class="pg-col">' + cname + '</button>' +
              '<span class="pg-coltype">' + (ctype || '') + (pk ? ' PK' : '') + '</span>';
            li.querySelector('.pg-col').addEventListener('click', function () { insertAtCursor(cname); });
            ul.appendChild(li);
          });
          wrap.appendChild(ul);
        }
        schemaEl.appendChild(wrap);
      });
    }

    function insertAtCursor(text) {
      var start = editor.selectionStart, end = editor.selectionEnd;
      var v = editor.value;
      editor.value = v.slice(0, start) + text + v.slice(end);
      editor.selectionStart = editor.selectionEnd = start + text.length;
      editor.focus();
    }

    function esc(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderResult(container, res, ms) {
      var box = document.createElement('div');
      box.className = 'pg-result';
      if (!res) {
        box.innerHTML = '<div class="pg-meta">Statement executed — no rows returned <span class="pg-time">' + ms + ' ms</span></div>';
        container.appendChild(box);
        return;
      }
      var cols = res.columns, vals = res.values;
      var html = '<div class="pg-meta">' + vals.length + ' row' + (vals.length === 1 ? '' : 's') +
        ' <span class="pg-time">' + ms + ' ms</span></div>';
      html += '<div class="pg-tablewrap"><table><thead><tr>';
      cols.forEach(function (c) { html += '<th>' + esc(c) + '</th>'; });
      html += '</tr></thead><tbody>';
      vals.forEach(function (r) {
        html += '<tr>';
        r.forEach(function (cell) { html += '<td>' + (cell === null ? '<span class="pg-null">NULL</span>' : esc(cell)) + '</td>'; });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      // CSV export for this result
      box.innerHTML = html;
      var csvBtn = document.createElement('button');
      csvBtn.type = 'button'; csvBtn.className = 'toggle-btn pg-csv'; csvBtn.textContent = '⬇️ CSV';
      csvBtn.addEventListener('click', function () { exportCSV(cols, vals); });
      box.querySelector('.pg-meta').appendChild(csvBtn);
      container.appendChild(box);
    }

    function exportCSV(cols, vals) {
      function cell(v) {
        if (v === null) return '';
        var s = String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }
      var lines = [cols.map(cell).join(',')];
      vals.forEach(function (r) { lines.push(r.map(cell).join(',')); });
      var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'query-result.csv';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }

    function loadHistory() { try { return JSON.parse(localStorage.getItem(LS_HIST) || '[]'); } catch (e) { return []; } }
    function pushHistory(sql) {
      var h = loadHistory();
      h.unshift({ sql: sql, at: Date.now() });
      h = h.slice(0, 20);
      try { localStorage.setItem(LS_HIST, JSON.stringify(h)); } catch (e) {}
      renderHistory();
    }
    function renderHistory() {
      if (!historyEl) return;
      var h = loadHistory();
      historyEl.innerHTML = '';
      if (!h.length) { historyEl.innerHTML = '<li class="pg-hist-empty">No queries yet.</li>'; return; }
      h.forEach(function (item) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'pg-hist-item';
        btn.textContent = item.sql.replace(/\s+/g, ' ').slice(0, 70);
        btn.title = item.sql;
        btn.addEventListener('click', function () { editor.value = item.sql; editor.focus(); });
        li.appendChild(btn);
        historyEl.appendChild(li);
      });
    }

    function run() {
      if (!db) { setStatus('Database not ready yet.', 'warn'); return; }
      var sql = editor.value.trim();
      if (!sql) { setStatus('Type a query first.', 'warn'); return; }
      resultsEl.innerHTML = '';
      var t0 = (performance && performance.now) ? performance.now() : Date.now();
      try {
        var stmts = db.exec(sql); // array of {columns, values}
        var t1 = (performance && performance.now) ? performance.now() : Date.now();
        var ms = (t1 - t0).toFixed(1);
        if (!stmts.length) {
          renderResult(resultsEl, null, ms);
        } else {
          stmts.forEach(function (r) { renderResult(resultsEl, r, ms); });
        }
        setStatus('OK', 'ok');
        pushHistory(sql);
      } catch (err) {
        var box = document.createElement('div');
        box.className = 'pg-result pg-error';
        box.innerHTML = '<strong>Error:</strong> ' + esc(err.message || String(err));
        resultsEl.appendChild(box);
        setStatus('Query failed', 'err');
      }
    }

    function renderExamples() {
      if (!examplesEl) return;
      var groups = {};
      EXAMPLES.forEach(function (ex) { (groups[ex.group] = groups[ex.group] || []).push(ex); });
      examplesEl.innerHTML = '';
      Object.keys(groups).forEach(function (g) {
        var h = document.createElement('div'); h.className = 'pg-ex-group'; h.textContent = g;
        examplesEl.appendChild(h);
        groups[g].forEach(function (ex) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'pg-ex';
          b.textContent = ex.label;
          b.addEventListener('click', function () { editor.value = ex.sql; editor.focus(); run(); });
          examplesEl.appendChild(b);
        });
      });
    }

    // ---- #try=<questionId> deep link (uses interview-data.js) ----
    function applyTryLink() {
      var m = /(?:^|[#&])try=([^&]+)/.exec(location.hash);
      if (!m || !tryBanner) return;
      var id = decodeURIComponent(m[1]);
      var data = window.STUDYHUB_INTERVIEW;
      if (!data || !Array.isArray(data.questions)) return;
      var q = data.questions.filter(function (x) { return x.id === id; })[0];
      if (!q || !q.tryIt) return;
      try {
        if (q.tryIt.setup) { freshDB(); db.run(q.tryIt.setup); renderSchema(); }
      } catch (e) {
        setStatus('Could not load question setup: ' + (e.message || e), 'warn');
      }
      editor.value = q.tryIt.starter || '';
      tryBanner.hidden = false;
      tryBanner.innerHTML = '<strong>Interview practice:</strong> ' + esc(q.q) +
        ' <span class="pg-try-src">The sample DB has been replaced with this question\u2019s tables.</span>';
      tryBanner.scrollIntoView({ block: 'start' });
    }

    // ---- boot sql.js ----
    setStatus('Loading SQLite engine…', 'warn');
    if (typeof initSqlJs !== 'function') {
      setStatus('WebAssembly / sql.js is unavailable in this browser, so the live playground cannot run. The notes and examples still work.', 'err');
      return;
    }
    initSqlJs({ locateFile: function (f) { return 'vendor/' + f; } }).then(function (SQLlib) {
      SQL = SQLlib;
      freshDB();
      renderExamples();
      renderHistory();
      setStatus('Ready — SQLite ' + (SQL ? 'loaded' : '') + '. Press Run (or Ctrl/Cmd+Enter).', 'ok');
      applyTryLink();
    }).catch(function (e) {
      setStatus('Failed to load SQLite engine: ' + (e.message || e), 'err');
    });

    // ---- wire controls ----
    runBtn.addEventListener('click', run);
    editor.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      freshDB(); setStatus('Database reset to the original sample data.', 'ok');
      resultsEl.innerHTML = '';
    });
    if (saveBtn) saveBtn.addEventListener('click', function () {
      if (!db) return;
      try {
        var data = db.export();
        var b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
        localStorage.setItem(LS_DB, b64);
        setStatus('Database saved to this browser.', 'ok');
      } catch (e) { setStatus('Save failed: ' + (e.message || e), 'err'); }
    });
    if (loadBtn) loadBtn.addEventListener('click', function () {
      try {
        var b64 = localStorage.getItem(LS_DB);
        if (!b64) { setStatus('No saved database found.', 'warn'); return; }
        var bytes = new Uint8Array(atob(b64).split('').map(function (c) { return c.charCodeAt(0); }));
        freshDB(bytes);
        setStatus('Saved database loaded.', 'ok');
      } catch (e) { setStatus('Load failed: ' + (e.message || e), 'err'); }
    });
    window.addEventListener('hashchange', applyTryLink);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initUI);
    } else {
      initUI();
    }
  }

  // Export the DOM-free core for node testing.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildSchemaSQL: buildSchemaSQL, EXAMPLES: EXAMPLES };
  }
})(typeof window !== 'undefined' ? window : this);
