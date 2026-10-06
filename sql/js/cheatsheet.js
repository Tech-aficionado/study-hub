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
    ["SELECT DISTINCT col FROM table;", "Return only unique values of a column"],
    ["WHERE col BETWEEN a AND b", "Inclusive range filter (a ≤ col ≤ b)"],
    ["WHERE col NOT IN (a, b)", "Exclude rows matching any listed value"],
    ["CASE WHEN c THEN x ELSE y END", "Inline if/else expression in a query"],
    ["COALESCE(a, b, c)", "First non-NULL argument (default-if-missing)"],
    ["NULLIF(x, 0)", "Returns NULL if x = 0 — guards divide-by-zero"],
    ["COUNT(DISTINCT col)", "Count unique non-NULL values"],
    ["ROUND(x, 2) / CEIL(x) / FLOOR(x)", "Numeric rounding functions"],
    ["LENGTH(s) / UPPER(s) / LOWER(s)", "String length and case functions"],
    ["SUBSTR(s, 2, 3) / substring(s FROM 2 FOR 3)", "Extract part of a string (SQLite / standard)"],
    ["a || b  (CONCAT(a,b) in MySQL)", "String concatenation (|| is OR in MySQL!)"],
    ["REPLACE(s, 'a', 'b')", "Replace all occurrences of a substring"],
    ["CAST(x AS INTEGER)  /  x::int", "Convert a value's type (standard / Postgres)"],
    ["now() / NOW() / datetime('now')", "Current timestamp (PG / MySQL / SQLite)"],
    ["EXTRACT(YEAR FROM d) / strftime('%Y', d)", "Pull a part out of a date (PG / SQLite)"],
    ["RIGHT JOIN b ON ...", "All of table b, matched or NULL from a"],
    ["FULL OUTER JOIN b ON ...", "All rows from both sides (not in MySQL)"],
    ["CROSS JOIN b", "Every combination of rows (Cartesian product)"],
    ["a JOIN a2 ON a.mgr = a2.id", "Self join — a table joined to itself"],
    ["WHERE EXISTS (SELECT 1 FROM b WHERE ...)", "Keep rows that have at least one match"],
    ["WHERE NOT EXISTS (...)", "NULL-safe anti-join (rows with no match)"],
    ["WITH cte AS (SELECT ...) SELECT ... FROM cte", "Common Table Expression (named subquery)"],
    ["WITH RECURSIVE t AS (anchor UNION ALL step)", "Recursive query (hierarchies, series)"],
    ["UNION / UNION ALL", "Stack two result sets (dedup / keep dupes)"],
    ["INTERSECT / EXCEPT", "Rows in both / in first-but-not-second"],
    ["ROW_NUMBER() OVER (PARTITION BY x ORDER BY y)", "Unique sequential number per partition"],
    ["LAG(col) / LEAD(col) OVER (ORDER BY ...)", "Previous / next row's value"],
    ["SUM(x) OVER (ORDER BY d ROWS UNBOUNDED PRECEDING)", "Running total"],
    ["ALTER TABLE t ADD COLUMN c TYPE;", "Add a column to an existing table"],
    ["col NUMERIC(10,2) NOT NULL DEFAULT 0", "Column with type, NOT NULL and a default"],
    ["FOREIGN KEY (fk) REFERENCES t(id) ON DELETE CASCADE", "FK with cascading delete"],
    ["CHECK (price >= 0)", "Enforce a value rule on writes"],
    ["INSERT ... ON CONFLICT (key) DO UPDATE SET ...", "Upsert (PostgreSQL / SQLite)"],
    ["INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col)", "Upsert (MySQL)"],
    ["EXPLAIN QUERY PLAN SELECT ...", "Show SQLite's execution plan"],
    ["BEGIN; ... SAVEPOINT s; ... ROLLBACK TO s;", "Partial rollback inside a transaction"],
    ["SELECT ... FOR UPDATE;", "Pessimistic row lock within a transaction"],
    ["CREATE MATERIALIZED VIEW v AS ...; REFRESH ...", "Cached view (PostgreSQL)"],
    ["CREATE TRIGGER ... AFTER UPDATE ON t ...", "Run SQL automatically on data changes"],
    ["information_schema.tables / sqlite_master", "List tables (standard / SQLite)"],
    ["TRUNCATE TABLE t;", "Fast delete-all (PG/MySQL; not SQLite)"]
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
