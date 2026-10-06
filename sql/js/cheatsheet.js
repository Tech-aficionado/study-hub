(function () {
  var commands = [
    ["SELECT col1, col2 FROM table;", "Retrieve specific columns from a table"],
    ["SELECT * FROM table;", "Retrieve all columns — avoid in production code"],
    ["WHERE col = value", "Filter rows by an exact match"],
    ["WHERE col LIKE '%text%'", "Filter rows containing a substring (wildcard match)"],
    ["WHERE col IN (a, b, c)", "Filter rows where col matches any value in the list"],
    ["WHERE col IS NULL", "Filter rows where col has no value"],
    ["ORDER BY col DESC", "Sort results, descending (ASC is default)"],
    ["LIMIT 10 OFFSET 20", "Pagination — skip 20 rows, return the next 10"],
    ["INSERT INTO table (col) VALUES (val);", "Add a new row"],
    ["UPDATE table SET col = val WHERE id = 1;", "Modify existing rows (always use WHERE!)"],
    ["DELETE FROM table WHERE id = 1;", "Remove rows (always use WHERE!)"],
    ["INNER JOIN b ON a.id = b.a_id", "Return only rows matching in both tables"],
    ["LEFT JOIN b ON a.id = b.a_id", "Return all of table a, matched or NULL from b"],
    ["GROUP BY col", "Aggregate rows into groups by a column's value"],
    ["HAVING COUNT(*) > 5", "Filter GROUPS after aggregation (not individual rows)"],
    ["COUNT(*) / SUM() / AVG() / MIN() / MAX()", "The five core aggregate functions"],
    ["CREATE TABLE t (id SERIAL PRIMARY KEY, ...)", "Define a new table (SERIAL is PostgreSQL; MySQL uses INT AUTO_INCREMENT)"],
    ["col INTEGER REFERENCES other(id)", "Define a foreign key constraint"],
    ["CREATE INDEX idx ON table(col);", "Speed up lookups/joins on a column"],
    ["EXPLAIN ANALYZE SELECT ...", "Show the actual query execution plan"],
    ["BEGIN; ... COMMIT;", "Group statements into an atomic transaction"],
    ["ROLLBACK;", "Undo everything since the last BEGIN"],
    ["CREATE VIEW v AS SELECT ...", "Save a query as a reusable virtual table"],
    ["RANK() OVER (ORDER BY col)", "Window function — rank rows without collapsing them"],
    ["SELECT DISTINCT col FROM table;", "Return only unique values of a column"]
  ];

  var tbody = document.getElementById('cmdTableBody');
  if (tbody) {
    commands.forEach(function (pair) {
      var cmd = pair[0], desc = pair[1];
      var tr = document.createElement('tr');
      tr.dataset.search = (cmd + ' ' + desc).toLowerCase();
      tr.innerHTML = '<td><code class="inline">' + cmd + '</code></td><td>' + desc + '</td>';
      tbody.appendChild(tr);
    });
  }

  var cmdSearch = document.getElementById('cmdSearch');
  if (cmdSearch) {
    cmdSearch.addEventListener('input', function (e) {
      var q = e.target.value.toLowerCase();
      document.querySelectorAll('#cmdTableBody tr').forEach(function (tr) {
        tr.style.display = tr.dataset.search.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }
})();
