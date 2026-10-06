/* SQL interview questions — authored for Study Hub. Sources confirmed real. */
window.STUDYHUB_INTERVIEW = {
  topic: 'sql',
  playground: 'playground.html',
  questions: [

  // ===================== LeetCode — coding =====================
  {
    id: 'sql-lc-175-combine-two-tables', level: 'easy', category: 'Joins', type: 'coding',
    q: 'Combine Two Tables: report the first name, last name, city and state of every person, including people who have no address row.',
    answer: '<p>Because every person must appear even when they have no matching address, this is a <code>LEFT JOIN</code> from <code>Person</code> to <code>Address</code>. An <code>INNER JOIN</code> would silently drop addressless people.</p><pre><code>SELECT p.firstName, p.lastName, a.city, a.state\nFROM Person p\nLEFT JOIN Address a ON a.personId = p.personId;</code></pre><p>Unmatched rows get <code>NULL</code> for city/state, which is exactly what the problem asks for.</p>',
    source: { site: 'LeetCode', label: '175. Combine Two Tables', url: 'https://leetcode.com/problems/combine-two-tables/' },
    tryIt: {
      setup: "CREATE TABLE Person(personId INT PRIMARY KEY, lastName TEXT, firstName TEXT);\nCREATE TABLE Address(addressId INT PRIMARY KEY, personId INT, city TEXT, state TEXT);\nINSERT INTO Person VALUES (1,'Wang','Allen'),(2,'Alice','Bob');\nINSERT INTO Address VALUES (1,2,'New York City','New York'),(2,3,'Leetcode','California');",
      starter: "SELECT p.firstName, p.lastName, a.city, a.state\nFROM Person p\nLEFT JOIN Address a ON a.personId = p.personId;"
    }
  },
  {
    id: 'sql-lc-176-second-highest', level: 'medium', category: 'Ranking', type: 'coding',
    q: 'Second Highest Salary: return the second highest distinct salary, or NULL when there is no second one.',
    answer: '<p>Two robust approaches. The first wraps the query in an outer <code>SELECT</code> so an empty inner result becomes <code>NULL</code> instead of no rows:</p><pre><code>SELECT (\n  SELECT DISTINCT salary\n  FROM Employee\n  ORDER BY salary DESC\n  LIMIT 1 OFFSET 1\n) AS SecondHighestSalary;</code></pre><p><strong>DISTINCT</strong> handles ties at the top; <strong>OFFSET 1</strong> skips the highest. The window-function form uses <code>DENSE_RANK()</code> and filters rank 2.</p>',
    source: { site: 'LeetCode', label: '176. Second Highest Salary', url: 'https://leetcode.com/problems/second-highest-salary/' },
    tryIt: {
      setup: "CREATE TABLE Employee(id INT PRIMARY KEY, salary INT);\nINSERT INTO Employee VALUES (1,100),(2,200),(3,300);",
      starter: "SELECT (\n  SELECT DISTINCT salary FROM Employee\n  ORDER BY salary DESC LIMIT 1 OFFSET 1\n) AS SecondHighestSalary;"
    }
  },
  {
    id: 'sql-lc-177-nth-highest', level: 'medium', category: 'Ranking', type: 'coding',
    q: 'Nth Highest Salary: write a query (or function) returning the Nth highest distinct salary.',
    answer: '<p>The portable SELECT form uses <code>DENSE_RANK()</code> so ties share a rank and there are no gaps:</p><pre><code>SELECT DISTINCT salary AS getNthHighestSalary\nFROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rk\n  FROM Employee\n) t\nWHERE rk = 2;   -- N = 2 here</code></pre><p>With <code>LIMIT</code>/<code>OFFSET</code> you compute <code>OFFSET N-1</code> (e.g. <code>OFFSET 1</code> for 2nd). Wrap it in an outer SELECT so a missing level returns NULL.</p>',
    source: { site: 'LeetCode', label: '177. Nth Highest Salary', url: 'https://leetcode.com/problems/nth-highest-salary/' },
    tryIt: {
      setup: "CREATE TABLE Employee(id INT PRIMARY KEY, salary INT);\nINSERT INTO Employee VALUES (1,100),(2,200),(3,300);",
      starter: "SELECT DISTINCT salary AS NthHighestSalary\nFROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rk FROM Employee) t\nWHERE rk = 2;"
    }
  },
  {
    id: 'sql-lc-178-rank-scores', level: 'medium', category: 'Ranking', type: 'coding',
    q: 'Rank Scores: rank scores highest first, with ties sharing a rank and no gaps after a tie.',
    answer: '<p>"Ties share a rank, no gaps" is the exact definition of <code>DENSE_RANK()</code>:</p><pre><code>SELECT score,\n  DENSE_RANK() OVER (ORDER BY score DESC) AS "rank"\nFROM Scores\nORDER BY score DESC;</code></pre><p><code>RANK()</code> would leave gaps after ties (1,1,3); <code>DENSE_RANK()</code> gives 1,1,2 — which the problem wants.</p>',
    source: { site: 'LeetCode', label: '178. Rank Scores', url: 'https://leetcode.com/problems/rank-scores/' },
    tryIt: {
      setup: "CREATE TABLE Scores(id INT PRIMARY KEY, score REAL);\nINSERT INTO Scores VALUES (1,3.5),(2,3.65),(3,4.0),(4,3.85),(5,4.0),(6,3.65);",
      starter: "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS rnk\nFROM Scores ORDER BY score DESC;"
    }
  },
  {
    id: 'sql-lc-180-consecutive', level: 'medium', category: 'Window functions', type: 'coding',
    q: 'Consecutive Numbers: find all numbers that appear at least three times in a row (by increasing id).',
    answer: '<p>Compare each row to its two predecessors with <code>LAG()</code>:</p><pre><code>WITH t AS (\n  SELECT num,\n    LAG(num,1) OVER (ORDER BY id) AS p1,\n    LAG(num,2) OVER (ORDER BY id) AS p2\n  FROM Logs\n)\nSELECT DISTINCT num AS ConsecutiveNums\nFROM t WHERE num = p1 AND num = p2;</code></pre><p>A self-join on <code>id = id+1</code> and <code>id+2</code> also works; the LAG version is cleaner and index-friendly.</p>',
    source: { site: 'LeetCode', label: '180. Consecutive Numbers', url: 'https://leetcode.com/problems/consecutive-numbers/' },
    tryIt: {
      setup: "CREATE TABLE Logs(id INT PRIMARY KEY, num INT);\nINSERT INTO Logs VALUES (1,1),(2,1),(3,1),(4,2),(5,1),(6,2),(7,2);",
      starter: "WITH t AS (SELECT num, LAG(num,1) OVER (ORDER BY id) p1, LAG(num,2) OVER (ORDER BY id) p2 FROM Logs)\nSELECT DISTINCT num AS ConsecutiveNums FROM t WHERE num=p1 AND num=p2;"
    }
  },
  {
    id: 'sql-lc-181-earn-more-manager', level: 'easy', category: 'Joins', type: 'coding',
    q: 'Employees Earning More Than Their Managers: list employees who earn strictly more than their own manager.',
    answer: '<p>A self-join: alias the table once as the employee and once as the manager, join on <code>managerId</code>, and compare salaries.</p><pre><code>SELECT e.name AS Employee\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nWHERE e.salary > m.salary;</code></pre>',
    source: { site: 'LeetCode', label: '181. Employees Earning More Than Their Managers', url: 'https://leetcode.com/problems/employees-earning-more-than-their-managers/' },
    tryIt: {
      setup: "CREATE TABLE Employee(id INT PRIMARY KEY, name TEXT, salary INT, managerId INT);\nINSERT INTO Employee VALUES (1,'Joe',70000,3),(2,'Henry',80000,4),(3,'Sam',60000,NULL),(4,'Max',90000,NULL);",
      starter: "SELECT e.name AS Employee\nFROM Employee e JOIN Employee m ON e.managerId = m.id\nWHERE e.salary > m.salary;"
    }
  },
  {
    id: 'sql-lc-182-duplicate-emails', level: 'easy', category: 'Aggregation', type: 'coding',
    q: 'Duplicate Emails: report every email that appears more than once in the Person table.',
    answer: '<p>Group by email and keep groups with a count above one — a textbook <code>HAVING</code> case:</p><pre><code>SELECT email\nFROM Person\nGROUP BY email\nHAVING COUNT(*) > 1;</code></pre><p><code>WHERE</code> cannot do this because the filter is on an aggregate, which only exists after grouping.</p>',
    source: { site: 'LeetCode', label: '182. Duplicate Emails', url: 'https://leetcode.com/problems/duplicate-emails/' },
    tryIt: {
      setup: "CREATE TABLE Person(id INT PRIMARY KEY, email TEXT);\nINSERT INTO Person VALUES (1,'a@b.com'),(2,'c@d.com'),(3,'a@b.com');",
      starter: "SELECT email FROM Person GROUP BY email HAVING COUNT(*) > 1;"
    }
  },
  {
    id: 'sql-lc-183-never-order', level: 'easy', category: 'Joins', type: 'coding',
    q: 'Customers Who Never Order: list customers who have never placed an order.',
    answer: '<p>Two clean ways. An anti-join with <code>LEFT JOIN ... IS NULL</code>:</p><pre><code>SELECT c.name AS Customers\nFROM Customers c\nLEFT JOIN Orders o ON o.customerId = c.id\nWHERE o.id IS NULL;</code></pre><p>Or <code>NOT EXISTS</code> (NULL-safe, often the planner\'s favourite):</p><pre><code>SELECT name AS Customers FROM Customers c\nWHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customerId = c.id);</code></pre>',
    source: { site: 'LeetCode', label: '183. Customers Who Never Order', url: 'https://leetcode.com/problems/customers-who-never-order/' },
    tryIt: {
      setup: "CREATE TABLE Customers(id INT PRIMARY KEY, name TEXT);\nCREATE TABLE Orders(id INT PRIMARY KEY, customerId INT);\nINSERT INTO Customers VALUES (1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max');\nINSERT INTO Orders VALUES (1,3),(2,1);",
      starter: "SELECT c.name AS Customers\nFROM Customers c LEFT JOIN Orders o ON o.customerId = c.id\nWHERE o.id IS NULL;"
    }
  },
  {
    id: 'sql-lc-184-dept-highest', level: 'medium', category: 'Window functions', type: 'coding',
    q: 'Department Highest Salary: for each department, list the employee(s) earning the top salary.',
    answer: '<p>Rank within each department and keep rank 1. Use <code>RANK()</code> (not <code>ROW_NUMBER</code>) so ties for the top are all returned.</p><pre><code>WITH r AS (\n  SELECT e.name AS emp, d.name AS dept, e.salary,\n    RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rk\n  FROM Employee e JOIN Department d ON d.id = e.departmentId\n)\nSELECT dept AS Department, emp AS Employee, salary AS Salary\nFROM r WHERE rk = 1;</code></pre>',
    source: { site: 'LeetCode', label: '184. Department Highest Salary', url: 'https://leetcode.com/problems/department-highest-salary/' },
    tryIt: {
      setup: "CREATE TABLE Department(id INT PRIMARY KEY, name TEXT);\nCREATE TABLE Employee(id INT PRIMARY KEY, name TEXT, salary INT, departmentId INT);\nINSERT INTO Department VALUES (1,'IT'),(2,'Sales');\nINSERT INTO Employee VALUES (1,'Joe',70000,1),(2,'Jim',90000,1),(3,'Henry',80000,2),(4,'Sam',60000,2),(5,'Max',90000,1);",
      starter: "WITH r AS (SELECT e.name emp, d.name dept, e.salary, RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) rk FROM Employee e JOIN Department d ON d.id=e.departmentId)\nSELECT dept AS Department, emp AS Employee, salary AS Salary FROM r WHERE rk=1;"
    }
  },
  {
    id: 'sql-lc-185-dept-top-three', level: 'hard', category: 'Window functions', type: 'coding',
    q: 'Department Top Three Salaries: list employees whose salary is in the top three distinct salaries of their department.',
    answer: '<p>"Top three <em>distinct</em> salaries" means <code>DENSE_RANK()</code> (ties collapse) filtered to rank &le; 3. A department can return more than three rows if salaries tie.</p><pre><code>WITH r AS (\n  SELECT e.name AS emp, d.name AS dept, e.salary,\n    DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rk\n  FROM Employee e JOIN Department d ON d.id = e.departmentId\n)\nSELECT dept AS Department, emp AS Employee, salary AS Salary\nFROM r WHERE rk <= 3;</code></pre>',
    source: { site: 'LeetCode', label: '185. Department Top Three Salaries', url: 'https://leetcode.com/problems/department-top-three-salaries/' },
    tryIt: {
      setup: "CREATE TABLE Department(id INT PRIMARY KEY, name TEXT);\nCREATE TABLE Employee(id INT PRIMARY KEY, name TEXT, salary INT, departmentId INT);\nINSERT INTO Department VALUES (1,'IT'),(2,'Sales');\nINSERT INTO Employee VALUES (1,'Joe',85000,1),(2,'Henry',80000,2),(3,'Sam',60000,2),(4,'Max',90000,1),(5,'Janet',69000,1),(6,'Randy',85000,1),(7,'Will',70000,1);",
      starter: "WITH r AS (SELECT e.name emp, d.name dept, e.salary, DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) rk FROM Employee e JOIN Department d ON d.id=e.departmentId)\nSELECT dept AS Department, emp AS Employee, salary AS Salary FROM r WHERE rk<=3;"
    }
  },
  {
    id: 'sql-lc-196-delete-dupe-emails', level: 'easy', category: 'Modifying data', type: 'coding',
    q: 'Delete Duplicate Emails: keep only the row with the smallest id for each email; delete the rest.',
    answer: '<p>Delete rows that share an email with a smaller id. Portable form (PostgreSQL/SQLite):</p><pre><code>DELETE FROM Person\nWHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email);</code></pre><p>MySQL self-join form:</p><pre><code>DELETE p1 FROM Person p1\nJOIN Person p2 ON p1.email = p2.email AND p1.id > p2.id;</code></pre>',
    source: { site: 'LeetCode', label: '196. Delete Duplicate Emails', url: 'https://leetcode.com/problems/delete-duplicate-emails/' },
    tryIt: {
      setup: "CREATE TABLE Person(id INT PRIMARY KEY, email TEXT);\nINSERT INTO Person VALUES (1,'john@example.com'),(2,'bob@example.com'),(3,'john@example.com');",
      starter: "DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email);\nSELECT * FROM Person;"
    }
  },
  {
    id: 'sql-lc-197-rising-temp', level: 'easy', category: 'Window functions', type: 'coding',
    q: 'Rising Temperature: find the ids of days whose temperature is higher than the immediately previous dated day.',
    answer: '<p>Self-join each day to the day exactly one date earlier, or use <code>LAG()</code> over the date:</p><pre><code>WITH t AS (\n  SELECT id, recordDate, temperature,\n    LAG(temperature) OVER (ORDER BY recordDate) AS prev_t,\n    LAG(recordDate)  OVER (ORDER BY recordDate) AS prev_d\n  FROM Weather\n)\nSELECT id FROM t\nWHERE temperature > prev_t\n  AND julianday(recordDate) - julianday(prev_d) = 1;</code></pre><p>Checking the date gap matters — "previous row" is not always "yesterday" if dates are missing.</p>',
    source: { site: 'LeetCode', label: '197. Rising Temperature', url: 'https://leetcode.com/problems/rising-temperature/' },
    tryIt: {
      setup: "CREATE TABLE Weather(id INT PRIMARY KEY, recordDate TEXT, temperature INT);\nINSERT INTO Weather VALUES (1,'2015-01-01',10),(2,'2015-01-02',25),(3,'2015-01-03',20),(4,'2015-01-04',30);",
      starter: "WITH t AS (SELECT id, recordDate, temperature, LAG(temperature) OVER (ORDER BY recordDate) pt, LAG(recordDate) OVER (ORDER BY recordDate) pd FROM Weather)\nSELECT id FROM t WHERE temperature > pt AND julianday(recordDate)-julianday(pd)=1;"
    }
  },
  {
    id: 'sql-lc-595-big-countries', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: 'Big Countries: report name, population and area of countries with area >= 3,000,000 OR population >= 25,000,000.',
    answer: '<p>A straight <code>WHERE</code> with <code>OR</code>:</p><pre><code>SELECT name, population, area\nFROM World\nWHERE area >= 3000000 OR population >= 25000000;</code></pre><p>No index trick needed; the point is correctly using OR rather than AND for an "either condition" requirement.</p>',
    source: { site: 'LeetCode', label: '595. Big Countries', url: 'https://leetcode.com/problems/big-countries/' },
    tryIt: {
      setup: "CREATE TABLE World(name TEXT PRIMARY KEY, continent TEXT, area INT, population INT, gdp INT);\nINSERT INTO World VALUES ('Afghanistan','Asia',652230,25500100,20343000),('Albania','Europe',28748,2831741,12960000),('Algeria','Africa',2381741,37100000,188681000);",
      starter: "SELECT name, population, area FROM World\nWHERE area >= 3000000 OR population >= 25000000;"
    }
  },

  // ===================== HackerRank — coding =====================
  {
    id: 'sql-hr-revising-select', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: 'Revising the Select Query I: query all columns for American cities (CountryCode USA) with population over 100000.',
    answer: '<p>A single filtered SELECT with two conditions ANDed together:</p><pre><code>SELECT *\nFROM CITY\nWHERE CountryCode = \'USA\' AND POPULATION > 100000;</code></pre>',
    source: { site: 'HackerRank', label: 'Revising the Select Query I', url: 'https://www.hackerrank.com/challenges/revising-the-select-query/problem' },
    tryIt: {
      setup: "CREATE TABLE CITY(ID INT PRIMARY KEY, NAME TEXT, CountryCode TEXT, District TEXT, POPULATION INT);\nINSERT INTO CITY VALUES (1,'New York','USA','NY',8000000),(2,'Berlin','DEU','BE',3500000),(3,'Houston','USA','TX',2300000),(4,'Smallville','USA','KS',50000);",
      starter: "SELECT * FROM CITY WHERE CountryCode = 'USA' AND POPULATION > 100000;"
    }
  },
  {
    id: 'sql-hr-station-5', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: 'Weather Observation Station 5: find the shortest and longest CITY names (and their lengths); break ties alphabetically.',
    answer: '<p>Two queries, each ordering by name length then name, taking the first row. In one engine you can do both with window functions, but HackerRank accepts two statements:</p><pre><code>SELECT CITY, LENGTH(CITY) FROM STATION\nORDER BY LENGTH(CITY) ASC, CITY ASC LIMIT 1;\n\nSELECT CITY, LENGTH(CITY) FROM STATION\nORDER BY LENGTH(CITY) DESC, CITY ASC LIMIT 1;</code></pre><p>The tie-break <code>CITY ASC</code> picks the alphabetically first when several names share the extreme length.</p>',
    source: { site: 'HackerRank', label: 'Weather Observation Station 5', url: 'https://www.hackerrank.com/challenges/weather-observation-station-5/problem' },
    tryIt: {
      setup: "CREATE TABLE STATION(ID INT PRIMARY KEY, CITY TEXT, STATE TEXT, LAT_N REAL, LONG_W REAL);\nINSERT INTO STATION VALUES (1,'DEF','AA',1,1),(2,'ABC','BB',2,2),(3,'PQRS','CC',3,3),(4,'WXY','DD',4,4);",
      starter: "SELECT CITY, LENGTH(CITY) FROM STATION ORDER BY LENGTH(CITY) ASC, CITY ASC LIMIT 1;\nSELECT CITY, LENGTH(CITY) FROM STATION ORDER BY LENGTH(CITY) DESC, CITY ASC LIMIT 1;"
    }
  },
  {
    id: 'sql-hr-employee-salaries', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: 'Employee Salaries: print names of employees earning more than 2000/month who have worked fewer than 10 months, ordered by employee_id.',
    answer: '<p>Filter on both columns, then order by the key:</p><pre><code>SELECT name\nFROM Employee\nWHERE salary > 2000 AND months < 10\nORDER BY employee_id;</code></pre>',
    source: { site: 'HackerRank', label: 'Employee Salaries', url: 'https://www.hackerrank.com/challenges/salary-of-employees/problem' },
    tryIt: {
      setup: "CREATE TABLE Employee(employee_id INT PRIMARY KEY, name TEXT, months INT, salary INT);\nINSERT INTO Employee VALUES (1,'Angela',1,3443),(2,'Michael',6,2017),(3,'Todd',5,3396),(4,'Joe',9,3573),(5,'Low',12,1900);",
      starter: "SELECT name FROM Employee WHERE salary > 2000 AND months < 10 ORDER BY employee_id;"
    }
  },
  {
    id: 'sql-hr-average-population', level: 'easy', category: 'Aggregation', type: 'coding',
    q: 'Average Population: return the average population of all cities, rounded down to the nearest integer.',
    answer: '<p>Average then floor. In SQLite <code>CAST(AVG(..) AS INT)</code> truncates toward zero (fine for positive populations); in MySQL use <code>FLOOR</code>:</p><pre><code>SELECT FLOOR(AVG(POPULATION)) FROM CITY;   -- MySQL\nSELECT CAST(AVG(POPULATION) AS INT) FROM CITY;  -- SQLite</code></pre>',
    source: { site: 'HackerRank', label: 'Average Population', url: 'https://www.hackerrank.com/challenges/average-population/problem' },
    tryIt: {
      setup: "CREATE TABLE CITY(ID INT PRIMARY KEY, NAME TEXT, CountryCode TEXT, District TEXT, POPULATION INT);\nINSERT INTO CITY VALUES (1,'A','X','D',100),(2,'B','X','D',201),(3,'C','X','D',350);",
      starter: "SELECT CAST(AVG(POPULATION) AS INT) AS avg_pop FROM CITY;"
    }
  },
  {
    id: 'sql-hr-the-report', level: 'medium', category: 'Joins', type: 'coding',
    q: 'The Report: join Students to Grades to produce Name, Grade, Mark; hide names of students below grade 8 (print NULL), with the specified ordering.',
    answer: '<p>A non-equi join: match each mark to the grade band whose <code>min_mark..max_mark</code> range contains it, then null the name below grade 8.</p><pre><code>SELECT CASE WHEN g.grade >= 8 THEN s.name ELSE NULL END AS name,\n       g.grade, s.marks\nFROM Students s\nJOIN Grades g ON s.marks BETWEEN g.min_mark AND g.max_mark\nORDER BY g.grade DESC,\n         CASE WHEN g.grade >= 8 THEN s.name END ASC,\n         s.marks ASC;</code></pre>',
    source: { site: 'HackerRank', label: 'The Report', url: 'https://www.hackerrank.com/challenges/the-report/problem' },
    tryIt: {
      setup: "CREATE TABLE Students(id INT PRIMARY KEY, name TEXT, marks INT);\nCREATE TABLE Grades(grade INT PRIMARY KEY, min_mark INT, max_mark INT);\nINSERT INTO Grades VALUES (1,0,9),(2,10,19),(3,20,29),(4,30,39),(5,40,49),(6,50,59),(7,60,69),(8,70,79),(9,80,89),(10,90,100);\nINSERT INTO Students VALUES (1,'Maria',99),(2,'Jane',81),(3,'Julia',88),(4,'Scarlet',78),(5,'Ashley',63);",
      starter: "SELECT CASE WHEN g.grade>=8 THEN s.name END AS name, g.grade, s.marks\nFROM Students s JOIN Grades g ON s.marks BETWEEN g.min_mark AND g.max_mark\nORDER BY g.grade DESC, CASE WHEN g.grade>=8 THEN s.name END ASC, s.marks ASC;"
    }
  },
  {
    id: 'sql-hr-challenges', level: 'hard', category: 'Aggregation', type: 'coding',
    q: 'Challenges: count challenges created by each student; keep the max, and ties only when the tied count equals the max.',
    answer: '<p>Count per hacker, then exclude counts that are shared by more than one hacker <em>unless</em> that count is the overall maximum. Done with a correlated/grouped filter:</p><pre><code>WITH c AS (\n  SELECT h.hacker_id, h.name, COUNT(*) AS n\n  FROM Hackers h JOIN Challenges ch ON ch.hacker_id = h.hacker_id\n  GROUP BY h.hacker_id, h.name\n)\nSELECT hacker_id, name, n FROM c\nWHERE n = (SELECT MAX(n) FROM c)\n   OR n IN (SELECT n FROM c GROUP BY n HAVING COUNT(*) = 1)\nORDER BY n DESC, hacker_id;</code></pre>',
    source: { site: 'HackerRank', label: 'Challenges', url: 'https://www.hackerrank.com/challenges/challenges/problem' },
    tryIt: {
      setup: "CREATE TABLE Hackers(hacker_id INT PRIMARY KEY, name TEXT);\nCREATE TABLE Challenges(challenge_id INT PRIMARY KEY, hacker_id INT);\nINSERT INTO Hackers VALUES (21283,'Angela'),(88255,'Patrick'),(96196,'Lisa');\nINSERT INTO Challenges VALUES (1,21283),(2,21283),(3,21283),(4,21283),(5,21283),(6,21283),(7,88255),(8,88255),(9,88255),(10,88255),(11,88255),(12,96196);",
      starter: "WITH c AS (SELECT h.hacker_id, h.name, COUNT(*) n FROM Hackers h JOIN Challenges ch ON ch.hacker_id=h.hacker_id GROUP BY h.hacker_id, h.name)\nSELECT hacker_id, name, n FROM c WHERE n=(SELECT MAX(n) FROM c) OR n IN (SELECT n FROM c GROUP BY n HAVING COUNT(*)=1) ORDER BY n DESC, hacker_id;"
    }
  },
  {
    id: 'sql-hr-top-competitors', level: 'medium', category: 'Joins', type: 'coding',
    q: 'Top Competitors: print hacker_id and name of hackers who earned a full score in more than one challenge, ordered by that count desc then hacker_id.',
    answer: '<p>A full score means a submission score equal to the challenge\'s difficulty max. Join submissions to the difficulty table on both challenge difficulty and score, group per hacker, keep counts > 1.</p><pre><code>SELECT h.hacker_id, h.name\nFROM Submissions s\nJOIN Challenges c  ON c.challenge_id = s.challenge_id\nJOIN Difficulty d  ON d.difficulty_level = c.difficulty_level\nJOIN Hackers h     ON h.hacker_id = s.hacker_id\nWHERE s.score = d.score\nGROUP BY h.hacker_id, h.name\nHAVING COUNT(*) > 1\nORDER BY COUNT(*) DESC, h.hacker_id;</code></pre>',
    source: { site: 'HackerRank', label: 'Top Competitors', url: 'https://www.hackerrank.com/challenges/full-score/problem' },
    tryIt: {
      setup: "CREATE TABLE Hackers(hacker_id INT PRIMARY KEY, name TEXT);\nCREATE TABLE Difficulty(difficulty_level INT PRIMARY KEY, score INT);\nCREATE TABLE Challenges(challenge_id INT PRIMARY KEY, hacker_id INT, difficulty_level INT);\nCREATE TABLE Submissions(submission_id INT PRIMARY KEY, hacker_id INT, challenge_id INT, score INT);\nINSERT INTO Hackers VALUES (86870,'Teddy'),(90411,'Joe');\nINSERT INTO Difficulty VALUES (1,20),(2,30),(6,100);\nINSERT INTO Challenges VALUES (71055,86870,2),(66730,90411,6);\nINSERT INTO Submissions VALUES (1,86870,71055,30),(2,90411,71055,30),(3,90411,66730,100);",
      starter: "SELECT h.hacker_id, h.name FROM Submissions s\nJOIN Challenges c ON c.challenge_id=s.challenge_id\nJOIN Difficulty d ON d.difficulty_level=c.difficulty_level\nJOIN Hackers h ON h.hacker_id=s.hacker_id\nWHERE s.score=d.score GROUP BY h.hacker_id, h.name HAVING COUNT(*)>1\nORDER BY COUNT(*) DESC, h.hacker_id;"
    }
  },
  {
    id: 'sql-hr-binary-tree-nodes', level: 'medium', category: 'Advanced SELECT', type: 'coding',
    q: 'Binary Tree Nodes: classify each node as Root (no parent), Leaf (no children) or Inner, ordered by node value.',
    answer: '<p>Root has <code>P IS NULL</code>; a leaf is any node that never appears as a parent; everything else is inner.</p><pre><code>SELECT N,\n  CASE\n    WHEN P IS NULL THEN \'Root\'\n    WHEN N NOT IN (SELECT P FROM BST WHERE P IS NOT NULL) THEN \'Leaf\'\n    ELSE \'Inner\'\n  END AS node_type\nFROM BST\nORDER BY N;</code></pre>',
    source: { site: 'HackerRank', label: 'Binary Tree Nodes', url: 'https://www.hackerrank.com/challenges/binary-search-tree-1/problem' },
    tryIt: {
      setup: "CREATE TABLE BST(N INT PRIMARY KEY, P INT);\nINSERT INTO BST VALUES (1,2),(3,2),(6,8),(9,8),(2,5),(8,5),(5,NULL);",
      starter: "SELECT N, CASE WHEN P IS NULL THEN 'Root' WHEN N NOT IN (SELECT P FROM BST WHERE P IS NOT NULL) THEN 'Leaf' ELSE 'Inner' END AS node_type\nFROM BST ORDER BY N;"
    }
  },
  {
    id: 'sql-hr-occupations', level: 'medium', category: 'Advanced SELECT', type: 'coding',
    q: 'Occupations: pivot the Occupation column so names appear in four columns (Doctor, Professor, Singer, Actor), each alphabetised, NULL-padded.',
    answer: '<p>Give each name a row number within its occupation, then pivot with conditional aggregation grouped by that row number.</p><pre><code>WITH r AS (\n  SELECT Name, Occupation,\n    ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name) AS rn\n  FROM OCCUPATIONS\n)\nSELECT MAX(CASE WHEN Occupation=\'Doctor\'    THEN Name END),\n       MAX(CASE WHEN Occupation=\'Professor\' THEN Name END),\n       MAX(CASE WHEN Occupation=\'Singer\'    THEN Name END),\n       MAX(CASE WHEN Occupation=\'Actor\'     THEN Name END)\nFROM r GROUP BY rn ORDER BY rn;</code></pre>',
    source: { site: 'HackerRank', label: 'Occupations', url: 'https://www.hackerrank.com/challenges/occupations/problem' },
    tryIt: {
      setup: "CREATE TABLE OCCUPATIONS(Name TEXT, Occupation TEXT);\nINSERT INTO OCCUPATIONS VALUES ('Jenny','Doctor'),('Samantha','Doctor'),('Ashley','Professor'),('Ketty','Professor'),('Christeen','Professor'),('Meera','Singer'),('Priya','Singer'),('Jane','Actor'),('Julia','Actor'),('Maria','Actor');",
      starter: "WITH r AS (SELECT Name, Occupation, ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name) rn FROM OCCUPATIONS)\nSELECT MAX(CASE WHEN Occupation='Doctor' THEN Name END) AS Doctor, MAX(CASE WHEN Occupation='Professor' THEN Name END) AS Professor, MAX(CASE WHEN Occupation='Singer' THEN Name END) AS Singer, MAX(CASE WHEN Occupation='Actor' THEN Name END) AS Actor FROM r GROUP BY rn ORDER BY rn;"
    }
  },
  {
    id: 'sql-hr-new-companies', level: 'medium', category: 'Joins', type: 'coding',
    q: 'New Companies: for each company print the founder and the distinct counts of lead managers, senior managers, managers and employees, ordered by company_code (as text).',
    answer: '<p>Left-join the four hierarchy tables to the company and count DISTINCT codes at each level (the tables may contain duplicates).</p><pre><code>SELECT c.company_code, c.founder,\n  COUNT(DISTINCT lm.lead_manager_code),\n  COUNT(DISTINCT sm.senior_manager_code),\n  COUNT(DISTINCT m.manager_code),\n  COUNT(DISTINCT e.employee_code)\nFROM Company c\nLEFT JOIN Lead_Manager   lm ON lm.company_code = c.company_code\nLEFT JOIN Senior_Manager sm ON sm.company_code = c.company_code\nLEFT JOIN Manager        m  ON m.company_code  = c.company_code\nLEFT JOIN Employee       e  ON e.company_code  = c.company_code\nGROUP BY c.company_code, c.founder\nORDER BY c.company_code;</code></pre><p>Ordering is textual, so <code>C_10</code> sorts before <code>C_2</code>.</p>',
    source: { site: 'HackerRank', label: 'New Companies', url: 'https://www.hackerrank.com/challenges/the-company/problem' },
    tryIt: {
      setup: "CREATE TABLE Company(company_code TEXT PRIMARY KEY, founder TEXT);\nCREATE TABLE Lead_Manager(lead_manager_code TEXT, company_code TEXT);\nCREATE TABLE Senior_Manager(senior_manager_code TEXT, lead_manager_code TEXT, company_code TEXT);\nCREATE TABLE Manager(manager_code TEXT, senior_manager_code TEXT, lead_manager_code TEXT, company_code TEXT);\nCREATE TABLE Employee(employee_code TEXT, manager_code TEXT, senior_manager_code TEXT, lead_manager_code TEXT, company_code TEXT);\nINSERT INTO Company VALUES ('C1','Monika'),('C2','Samantha');\nINSERT INTO Lead_Manager VALUES ('LM1','C1'),('LM2','C2');\nINSERT INTO Senior_Manager VALUES ('SM1','LM1','C1'),('SM2','LM1','C1'),('SM3','LM2','C2');\nINSERT INTO Manager VALUES ('M1','SM1','LM1','C1'),('M2','SM3','LM2','C2'),('M3','SM3','LM2','C2');\nINSERT INTO Employee VALUES ('E1','M1','SM1','LM1','C1'),('E2','M1','SM1','LM1','C1'),('E3','M2','SM3','LM2','C2'),('E4','M3','SM3','LM2','C2');",
      starter: "SELECT c.company_code, c.founder, COUNT(DISTINCT lm.lead_manager_code), COUNT(DISTINCT sm.senior_manager_code), COUNT(DISTINCT m.manager_code), COUNT(DISTINCT e.employee_code)\nFROM Company c LEFT JOIN Lead_Manager lm ON lm.company_code=c.company_code LEFT JOIN Senior_Manager sm ON sm.company_code=c.company_code LEFT JOIN Manager m ON m.company_code=c.company_code LEFT JOIN Employee e ON e.company_code=c.company_code\nGROUP BY c.company_code, c.founder ORDER BY c.company_code;"
    }
  },

  // ===================== More coding (LeetCode + HackerRank) =====================
  {
    id: 'sql-lc-577-employee-bonus', level: 'easy', category: 'Joins', type: 'coding',
    q: 'Employee Bonus: report the name and bonus of employees whose bonus is less than 1000 (including employees with no bonus row).',
    answer: '<p>LEFT JOIN so employees without a bonus row appear; <code>NULL < 1000</code> is unknown, so include the NULL case explicitly.</p><pre><code>SELECT e.name, b.bonus\nFROM Employee e\nLEFT JOIN Bonus b ON b.empId = e.empId\nWHERE b.bonus < 1000 OR b.bonus IS NULL;</code></pre>',
    source: { site: 'LeetCode', label: '577. Employee Bonus', url: 'https://leetcode.com/problems/employee-bonus/' },
    tryIt: {
      setup: "CREATE TABLE Employee(empId INT PRIMARY KEY, name TEXT, supervisor INT, salary INT);\nCREATE TABLE Bonus(empId INT PRIMARY KEY, bonus INT);\nINSERT INTO Employee VALUES (3,'Brad',NULL,4000),(1,'John',3,1000),(2,'Dan',3,2000),(4,'Thomas',3,4000);\nINSERT INTO Bonus VALUES (2,500),(4,2000);",
      starter: "SELECT e.name, b.bonus FROM Employee e LEFT JOIN Bonus b ON b.empId=e.empId\nWHERE b.bonus < 1000 OR b.bonus IS NULL;"
    }
  },
  {
    id: 'sql-lc-596-classes-5', level: 'easy', category: 'Aggregation', type: 'coding',
    q: 'Classes With at Least 5 Students: list classes that have 5 or more students.',
    answer: '<p>Group by class and keep groups of size &ge; 5. If the data can contain duplicate (student, class) rows, use <code>COUNT(DISTINCT student)</code>.</p><pre><code>SELECT class\nFROM Courses\nGROUP BY class\nHAVING COUNT(DISTINCT student) >= 5;</code></pre>',
    source: { site: 'LeetCode', label: '596. Classes With at Least 5 Students', url: 'https://leetcode.com/problems/classes-with-at-least-5-students/' },
    tryIt: {
      setup: "CREATE TABLE Courses(student TEXT, class TEXT);\nINSERT INTO Courses VALUES ('A','Math'),('B','Math'),('C','Math'),('D','Math'),('E','Math'),('F','Biology');",
      starter: "SELECT class FROM Courses GROUP BY class HAVING COUNT(DISTINCT student) >= 5;"
    }
  },
  {
    id: 'sql-lc-620-not-boring', level: 'easy', category: 'Filtering', type: 'coding',
    q: 'Not Boring Movies: list movies with an odd id and a description that is not "boring", ordered by rating descending.',
    answer: '<p>Odd id via modulo, exclude the boring description, sort by rating:</p><pre><code>SELECT * FROM cinema\nWHERE id % 2 = 1 AND description <> \'boring\'\nORDER BY rating DESC;</code></pre>',
    source: { site: 'LeetCode', label: '620. Not Boring Movies', url: 'https://leetcode.com/problems/not-boring-movies/' },
    tryIt: {
      setup: "CREATE TABLE cinema(id INT PRIMARY KEY, movie TEXT, description TEXT, rating REAL);\nINSERT INTO cinema VALUES (1,'War','great 3D',8.9),(2,'Science','fiction',8.5),(3,'irish','boring',6.2),(4,'Ice song','Fantacy',8.6),(5,'House card','Interesting',9.1);",
      starter: "SELECT * FROM cinema WHERE id % 2 = 1 AND description <> 'boring' ORDER BY rating DESC;"
    }
  },
  {
    id: 'sql-lc-627-swap-salary', level: 'easy', category: 'Modifying data', type: 'coding',
    q: 'Swap Salary: swap all "m" and "f" sex values in a single UPDATE (no intermediate temp table).',
    answer: '<p>Use a <code>CASE</code> inside one UPDATE so both values flip in a single pass:</p><pre><code>UPDATE Salary\nSET sex = CASE sex WHEN \'m\' THEN \'f\' ELSE \'m\' END;</code></pre><p>Doing it as two UPDATEs (<code>SET sex=\'f\' WHERE sex=\'m\'</code> then the reverse) would convert everything to one value — the CASE is the point.</p>',
    source: { site: 'LeetCode', label: '627. Swap Salary', url: 'https://leetcode.com/problems/swap-salary/' },
    tryIt: {
      setup: "CREATE TABLE Salary(id INT PRIMARY KEY, name TEXT, sex TEXT, salary INT);\nINSERT INTO Salary VALUES (1,'A','m',2500),(2,'B','f',1500),(3,'C','m',5500),(4,'D','f',500);",
      starter: "UPDATE Salary SET sex = CASE sex WHEN 'm' THEN 'f' ELSE 'm' END;\nSELECT * FROM Salary;"
    }
  },
  {
    id: 'sql-lc-586-customer-most-orders', level: 'medium', category: 'Aggregation', type: 'coding',
    q: 'Find the customer who placed the most orders (assume a single clear winner).',
    answer: '<p>Group by customer, order by the count descending, take the top row:</p><pre><code>SELECT customer_number\nFROM Orders\nGROUP BY customer_number\nORDER BY COUNT(*) DESC\nLIMIT 1;</code></pre><p>For ties you would instead keep every customer whose count equals the max via a subquery.</p>',
    source: { site: 'LeetCode', label: '586. Customer Placing the Largest Number of Orders', url: 'https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/' },
    tryIt: {
      setup: "CREATE TABLE Orders(order_number INT PRIMARY KEY, customer_number INT);\nINSERT INTO Orders VALUES (1,1),(2,2),(3,3),(4,3);",
      starter: "SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;"
    }
  },
  {
    id: 'sql-lc-511-first-login', level: 'easy', category: 'Aggregation', type: 'coding',
    q: 'Game Play Analysis I: find the first login date for each player.',
    answer: '<p>Minimum event date per player:</p><pre><code>SELECT player_id, MIN(event_date) AS first_login\nFROM Activity\nGROUP BY player_id;</code></pre>',
    source: { site: 'LeetCode', label: '511. Game Play Analysis I', url: 'https://leetcode.com/problems/game-play-analysis-i/' },
    tryIt: {
      setup: "CREATE TABLE Activity(player_id INT, device_id INT, event_date TEXT, games_played INT);\nINSERT INTO Activity VALUES (1,2,'2016-03-01',5),(1,2,'2016-05-02',6),(2,3,'2017-06-25',1),(3,1,'2016-03-02',0),(3,4,'2018-07-03',5);",
      starter: "SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;"
    }
  },
  {
    id: 'sql-lc-197b-dup-authors', level: 'medium', category: 'Subqueries', type: 'coding',
    q: 'Big Countries variant: return country names whose area is above the average area of all countries.',
    answer: '<p>A scalar subquery supplies the average, compared per row:</p><pre><code>SELECT name FROM World\nWHERE area > (SELECT AVG(area) FROM World);</code></pre><p>The inner query runs once; this is NOT correlated, so it is efficient.</p>',
    source: { site: 'LeetCode', label: '595. Big Countries', url: 'https://leetcode.com/problems/big-countries/' },
    tryIt: {
      setup: "CREATE TABLE World(name TEXT PRIMARY KEY, continent TEXT, area INT, population INT, gdp INT);\nINSERT INTO World VALUES ('Afghanistan','Asia',652230,25500100,20343000),('Albania','Europe',28748,2831741,12960000),('Algeria','Africa',2381741,37100000,188681000);",
      starter: "SELECT name FROM World WHERE area > (SELECT AVG(area) FROM World);"
    }
  },
  {
    id: 'sql-hr-japan-cities', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: "Japanese Cities' Attributes: query all attributes of every Japanese city (COUNTRYCODE = JPN).",
    answer: '<p>A single-condition SELECT returning all columns:</p><pre><code>SELECT * FROM CITY WHERE COUNTRYCODE = \'JPN\';</code></pre>',
    source: { site: 'HackerRank', label: "Japanese Cities' Attributes", url: 'https://www.hackerrank.com/challenges/japanese-cities-attributes/problem' },
    tryIt: {
      setup: "CREATE TABLE CITY(ID INT PRIMARY KEY, NAME TEXT, COUNTRYCODE TEXT, DISTRICT TEXT, POPULATION INT);\nINSERT INTO CITY VALUES (1,'Tokyo','JPN','Tokyo-to',8000000),(2,'Berlin','DEU','Berlin',3500000),(3,'Osaka','JPN','Osaka',2600000);",
      starter: "SELECT * FROM CITY WHERE COUNTRYCODE = 'JPN';"
    }
  },
  {
    id: 'sql-hr-station-4', level: 'easy', category: 'Aggregation', type: 'coding',
    q: 'Weather Observation Station 4: find the difference between the total number of CITY entries and the number of distinct CITY entries.',
    answer: '<p>Subtract the distinct count from the total count in one query:</p><pre><code>SELECT COUNT(CITY) - COUNT(DISTINCT CITY) FROM STATION;</code></pre>',
    source: { site: 'HackerRank', label: 'Weather Observation Station 4', url: 'https://www.hackerrank.com/challenges/weather-observation-station-4/problem' },
    tryIt: {
      setup: "CREATE TABLE STATION(ID INT PRIMARY KEY, CITY TEXT, STATE TEXT, LAT_N REAL, LONG_W REAL);\nINSERT INTO STATION VALUES (1,'New York','NY',1,1),(2,'New York','NY',2,2),(3,'Bengaluru','KA',3,3);",
      starter: "SELECT COUNT(CITY) - COUNT(DISTINCT CITY) AS diff FROM STATION;"
    }
  },
  {
    id: 'sql-hr-higher-75', level: 'easy', category: 'Basic SELECT', type: 'coding',
    q: 'Higher Than 75 Marks: list names of students scoring above 75, ordered by the last three characters of the name, then by ascending ID.',
    answer: '<p>Order by a substring of the name taken from the right. In SQLite/MySQL use <code>RIGHT(Name,3)</code> (or <code>SUBSTR(Name,-3,3)</code> in SQLite):</p><pre><code>SELECT Name FROM STUDENTS\nWHERE Marks > 75\nORDER BY SUBSTR(Name, -3, 3), ID;   -- SQLite\n-- MySQL: ORDER BY RIGHT(Name,3), ID</code></pre>',
    source: { site: 'HackerRank', label: 'Higher Than 75 Marks', url: 'https://www.hackerrank.com/challenges/more-than-75-marks/problem' },
    tryIt: {
      setup: "CREATE TABLE STUDENTS(ID INT PRIMARY KEY, Name TEXT, Marks INT);\nINSERT INTO STUDENTS VALUES (1,'Ashley',81),(2,'Samantha',75),(3,'Julia',80),(4,'Belvet',77),(5,'Scarlet',70);",
      starter: "SELECT Name FROM STUDENTS WHERE Marks > 75 ORDER BY SUBSTR(Name,-3,3), ID;"
    }
  },
  {
    id: 'sql-lc-619-biggest-single', level: 'easy', category: 'Subqueries', type: 'coding',
    q: 'Biggest Single Number: return the largest number that appears exactly once; NULL if none.',
    answer: '<p>Keep numbers appearing once, then take the max (wrapped so "none" returns NULL):</p><pre><code>SELECT MAX(num) AS num FROM (\n  SELECT num FROM MyNumbers\n  GROUP BY num HAVING COUNT(*) = 1\n) t;</code></pre><p><code>MAX</code> over an empty set yields NULL, which satisfies the "none" case.</p>',
    source: { site: 'LeetCode', label: '619. Biggest Single Number', url: 'https://leetcode.com/problems/biggest-single-number/' },
    tryIt: {
      setup: "CREATE TABLE MyNumbers(num INT);\nINSERT INTO MyNumbers VALUES (8),(8),(3),(3),(1),(4),(5),(6);",
      starter: "SELECT MAX(num) AS num FROM (SELECT num FROM MyNumbers GROUP BY num HAVING COUNT(*)=1) t;"
    }
  },
  {
    id: 'sql-lc-595b-running-cte', level: 'medium', category: 'CTEs', type: 'coding',
    q: 'Using a recursive CTE, generate the integers 1 through 5 as rows (no source table).',
    answer: '<p>A classic recursive CTE with an anchor and a terminating recursive step:</p><pre><code>WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;</code></pre><p>The <code>WHERE n < 5</code> is the stop condition — omit it and the query never terminates.</p>',
    source: { site: 'PostgreSQL docs', label: '7.8. WITH Queries (Common Table Expressions)', url: 'https://www.postgresql.org/docs/current/queries-with.html' },
    tryIt: {
      setup: "CREATE TABLE dummy(x INT);",
      starter: "WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM nums WHERE n<5)\nSELECT n FROM nums;"
    }
  },

  // ===================== Concept & scenario =====================
  {
    id: 'sql-c-where-vs-having', level: 'easy', category: 'Aggregation', type: 'concept',
    answer: '<p><code>WHERE</code> filters individual rows <strong>before</strong> grouping; <code>HAVING</code> filters groups <strong>after</strong> aggregation. That ordering is why an aggregate like <code>COUNT(*)</code> is legal in HAVING but not in WHERE. Logical execution order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.</p><pre><code>SELECT customer_id, COUNT(*) FROM orders\nWHERE status <> \'cancelled\'   -- rows first\nGROUP BY customer_id\nHAVING COUNT(*) >= 4;         -- groups after</code></pre>',
    source: { site: 'PostgreSQL docs', label: '2.7. Aggregate Functions', url: 'https://www.postgresql.org/docs/current/tutorial-agg.html' }
  },
  {
    id: 'sql-c-join-types', level: 'easy', category: 'Joins', type: 'concept',
    q: 'Explain INNER, LEFT, RIGHT and FULL OUTER JOIN.',
    answer: '<p><strong>INNER</strong> keeps only matched rows. <strong>LEFT</strong> keeps all left rows (NULLs where no right match). <strong>RIGHT</strong> is the mirror. <strong>FULL OUTER</strong> keeps everything from both sides. MySQL lacks FULL OUTER JOIN — emulate it with <code>LEFT ... UNION ... RIGHT</code>.</p>',
    source: { site: 'PostgreSQL docs', label: '2.6. Joins Between Tables', url: 'https://www.postgresql.org/docs/current/tutorial-join.html' }
  },
  {
    id: 'sql-c-null-logic', level: 'medium', category: 'Filtering', type: 'concept',
    q: 'Why does WHERE col = NULL return no rows, and what should you use instead?',
    answer: '<p>SQL uses three-valued logic. Any comparison with <code>NULL</code> yields <strong>unknown</strong>, and <code>WHERE</code> keeps only rows that are <em>true</em> — so <code>= NULL</code> matches nothing. Use <code>IS NULL</code> / <code>IS NOT NULL</code>. This also makes <code>NOT IN</code> dangerous when the list may contain NULL; prefer <code>NOT EXISTS</code>.</p>',
    source: { site: 'PostgreSQL docs', label: '9.2. Comparison Functions and Operators', url: 'https://www.postgresql.org/docs/current/functions-comparison.html' }
  },
  {
    id: 'sql-c-pk-vs-unique', level: 'easy', category: 'Schema design', type: 'concept',
    q: 'What is the difference between a PRIMARY KEY and a UNIQUE constraint?',
    answer: '<p>A <strong>primary key</strong> is unique AND not null, there is at most one per table, and it is the row\'s identity (often the clustering key). A <strong>UNIQUE</strong> constraint also forbids duplicates but allows NULLs (usually multiple), and you can have several per table. Both create a backing index.</p>',
    source: { site: 'PostgreSQL docs', label: '5.5. Constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' }
  },
  {
    id: 'sql-c-acid', level: 'medium', category: 'Transactions', type: 'concept',
    q: 'What does ACID stand for?',
    answer: '<p><strong>A</strong>tomicity (all-or-nothing), <strong>C</strong>onsistency (constraints always hold), <strong>I</strong>solation (concurrent transactions don\'t see each other\'s partial work), <strong>D</strong>urability (committed data survives a crash). These are the guarantees that make relational databases safe for money and inventory.</p>',
    source: { site: 'PostgreSQL docs', label: '13.2. Transaction Isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }
  },
  {
    id: 'sql-c-index-tradeoff', level: 'medium', category: 'Performance', type: 'concept',
    q: 'How does an index speed up queries, and what does it cost?',
    answer: '<p>A B-tree index keeps keys sorted so lookups become O(log n) instead of a full O(n) scan. Costs: every write must also update each index (slower INSERT/UPDATE/DELETE), extra disk space, and low-selectivity indexes are often ignored by the planner. Index the columns you filter/join on, not every column.</p>',
    source: { site: 'PostgreSQL docs', label: 'Chapter 11. Indexes', url: 'https://www.postgresql.org/docs/current/indexes.html' }
  },
  {
    id: 'sql-c-normalization', level: 'medium', category: 'Schema design', type: 'concept',
    q: 'What is normalization and what problems does it solve?',
    answer: '<p>Normalization splits data so each fact lives in exactly one place, eliminating update, insertion and deletion anomalies. 1NF: atomic values. 2NF: no partial dependency on part of a composite key. 3NF: no transitive dependency between non-key columns. BCNF: every determinant is a candidate key. 3NF is the usual practical target.</p>',
    source: { site: 'Wikipedia', label: 'Database normalization', url: 'https://en.wikipedia.org/wiki/Database_normalization' }
  },
  {
    id: 'sql-c-rank-vs-dense', level: 'medium', category: 'Window functions', type: 'concept',
    q: 'Compare ROW_NUMBER, RANK and DENSE_RANK on tied values.',
    answer: '<p>On ties over the same ORDER BY: <strong>ROW_NUMBER</strong> gives distinct numbers (arbitrary tie-break), <strong>RANK</strong> gives ties the same rank then skips (1,1,3), <strong>DENSE_RANK</strong> gives ties the same rank with no gap (1,1,2). "Nth highest distinct salary" uses DENSE_RANK; "exactly N rows" uses ROW_NUMBER.</p>',
    source: { site: 'LeetCode', label: '178. Rank Scores', url: 'https://leetcode.com/problems/rank-scores/' }
  },
  {
    id: 'sql-c-delete-truncate-drop', level: 'easy', category: 'Modifying data', type: 'concept',
    q: 'DELETE vs TRUNCATE vs DROP — what is the difference?',
    answer: '<p><code>DELETE</code> removes selected rows (WHERE), is logged per row, fires triggers, and is a DML statement. <code>TRUNCATE</code> removes ALL rows fast by deallocating pages, usually resets auto-increment, and skips row triggers (DDL in most engines). <code>DROP</code> removes the table structure itself. SQLite has no TRUNCATE; <code>DELETE FROM t</code> with no WHERE is used instead.</p>',
    source: { site: 'PostgreSQL docs', label: 'TRUNCATE', url: 'https://www.postgresql.org/docs/current/sql-truncate.html' }
  },
  {
    id: 'sql-c-union-vs-unionall', level: 'easy', category: 'Set operations', type: 'concept',
    q: 'What is the difference between UNION and UNION ALL?',
    answer: '<p><code>UNION</code> combines two result sets and removes duplicates (an extra sort/hash pass). <code>UNION ALL</code> keeps all rows including duplicates and is faster because it skips de-duplication. Prefer <code>UNION ALL</code> unless you specifically need duplicates removed.</p>',
    source: { site: 'PostgreSQL docs', label: '7.4. Combining Queries (UNION, INTERSECT, EXCEPT)', url: 'https://www.postgresql.org/docs/current/queries-union.html' }
  },
  {
    id: 'sql-c-correlated-subquery', level: 'medium', category: 'Subqueries', type: 'concept',
    q: 'What is a correlated subquery and why can it be slow?',
    answer: '<p>A correlated subquery references a column from the outer query, so it cannot be computed once up front — it re-evaluates for every outer row (O(n) executions). A JOIN + GROUP BY or a window function often computes the same result in a single pass. Modern optimisers sometimes rewrite correlated subqueries into joins automatically.</p>',
    source: { site: 'LeetCode', label: '183. Customers Who Never Order', url: 'https://leetcode.com/problems/customers-who-never-order/' }
  },
  {
    id: 'sql-c-cte-vs-subquery', level: 'medium', category: 'CTEs', type: 'concept',
    q: 'What is a CTE and when would you use one over a subquery?',
    answer: '<p>A Common Table Expression (<code>WITH name AS (...)</code>) names a temporary result so a complex query reads top-to-bottom and can be referenced multiple times. Use it for readability, chained steps, and recursion. For a one-off simple filter a plain subquery is fine. Recursive CTEs (<code>WITH RECURSIVE</code>) walk hierarchies and generate series.</p>',
    source: { site: 'PostgreSQL docs', label: '7.8. WITH Queries (Common Table Expressions)', url: 'https://www.postgresql.org/docs/current/queries-with.html' }
  },
  {
    id: 'sql-c-window-vs-groupby', level: 'medium', category: 'Window functions', type: 'concept',
    q: 'How do window functions differ from GROUP BY?',
    answer: '<p><code>GROUP BY</code> collapses each group into one row. A window function (<code>... OVER (PARTITION BY ... ORDER BY ...)</code>) computes across a set of rows but returns the value alongside <em>every</em> original row — nothing collapses. That lets you show a row\'s value next to its group\'s average, rank, running total, or neighbouring rows.</p>',
    source: { site: 'LeetCode', label: '184. Department Highest Salary', url: 'https://leetcode.com/problems/department-highest-salary/' }
  },
  {
    id: 'sql-c-isolation-levels', level: 'hard', category: 'Transactions', type: 'concept',
    q: 'Name the four isolation levels and the anomalies they prevent.',
    answer: '<p>From weakest to strongest: <strong>READ UNCOMMITTED</strong> (allows dirty reads), <strong>READ COMMITTED</strong> (no dirty reads), <strong>REPEATABLE READ</strong> (also no non-repeatable reads), <strong>SERIALIZABLE</strong> (also no phantoms; behaves as if transactions ran one at a time). PostgreSQL defaults to READ COMMITTED; MySQL/InnoDB to REPEATABLE READ.</p>',
    source: { site: 'PostgreSQL docs', label: '13.2. Transaction Isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }
  },
  {
    id: 'sql-c-sql-injection', level: 'medium', category: 'Security', type: 'concept',
    q: 'What is SQL injection and how do you prevent it?',
    answer: '<p>Injection happens when user input is concatenated into a query string and becomes executable SQL. The fix is <strong>parameterised queries</strong>: send the SQL and the values separately so values can never be reinterpreted as code (<code>?</code> or <code>$1</code> placeholders with a values array, never string formatting). Defence in depth: least-privilege DB users, ORMs/query builders, allow-listing for identifiers you can\'t parameterise.</p>',
    source: { site: 'OWASP', label: 'SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }
  },
  {
    id: 'sql-c-view-purpose', level: 'easy', category: 'Views', type: 'concept',
    q: 'What is a view, and how does a materialized view differ?',
    answer: '<p>A <strong>view</strong> is a saved query you can select from like a table; it re-runs the underlying SELECT every time (great for hiding complexity and access control). A <strong>materialized view</strong> stores the computed result on disk and must be refreshed — good for expensive analytics that need not be real-time. PostgreSQL has native materialized views; MySQL and SQLite do not.</p>',
    source: { site: 'PostgreSQL docs', label: '39.3. Materialized Views', url: 'https://www.postgresql.org/docs/current/rules-materializedviews.html' }
  },
  {
    id: 'sql-c-dialect-upsert', level: 'medium', category: 'Dialects', type: 'concept',
    q: 'How do you perform an upsert in PostgreSQL/SQLite vs MySQL?',
    answer: '<p>PostgreSQL & SQLite: <code>INSERT ... ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col</code>. MySQL: <code>INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col)</code>. Both require a UNIQUE or PRIMARY KEY to detect the conflict.</p>',
    source: { site: 'PostgreSQL docs', label: 'INSERT (ON CONFLICT clause)', url: 'https://www.postgresql.org/docs/current/sql-insert.html' }
  },
  {
    id: 'sql-c-char-vs-varchar', level: 'easy', category: 'Data types', type: 'concept',
    q: 'What is the difference between CHAR and VARCHAR?',
    answer: '<p><code>CHAR(n)</code> is fixed length and right-pads with spaces to n characters; <code>VARCHAR(n)</code> stores only the actual characters plus a small length prefix. Use CHAR for truly fixed-width codes (e.g. country code CHAR(2)); use VARCHAR/TEXT for everything variable. In SQLite both just have TEXT affinity (lengths are ignored).</p>',
    source: { site: 'PostgreSQL docs', label: '8.3. Character Types', url: 'https://www.postgresql.org/docs/current/datatype-character.html' }
  },
  {
    id: 'sql-c-aggregate-null', level: 'medium', category: 'Aggregation', type: 'concept',
    q: 'How do aggregate functions treat NULL, and why does COUNT(*) differ from COUNT(col)?',
    answer: '<p>Aggregates (<code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>) ignore NULLs. <code>COUNT(*)</code> counts rows (including all-NULL rows); <code>COUNT(col)</code> counts only non-NULL values of that column; <code>COUNT(DISTINCT col)</code> counts unique non-NULLs. This is exactly why a LEFT JOIN + <code>COUNT(child.id)</code> correctly yields 0 for unmatched parents.</p>',
    source: { site: 'LeetCode', label: '183. Customers Who Never Order', url: 'https://leetcode.com/problems/customers-who-never-order/' }
  },
  {
    id: 'sql-c-foreign-key-actions', level: 'medium', category: 'Schema design', type: 'concept',
    q: 'What do ON DELETE CASCADE, SET NULL and RESTRICT do on a foreign key?',
    answer: '<p>They decide what happens to child rows when the referenced parent is deleted. <strong>CASCADE</strong> deletes the children too; <strong>SET NULL</strong> nulls the child FK (column must be nullable); <strong>RESTRICT/NO ACTION</strong> blocks the delete while children exist (the safe default). Note: SQLite only enforces foreign keys after <code>PRAGMA foreign_keys = ON</code>.</p>',
    source: { site: 'PostgreSQL docs', label: '5.5. Constraints (Foreign Keys)', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' }
  },
  {
    id: 'sql-s-slow-query', level: 'hard', category: 'Performance', type: 'scenario',
    q: 'Scenario: a query that filters on a column was fast on 10k rows but is now slow on 10M rows. How do you diagnose and fix it?',
    answer: '<p>Run <code>EXPLAIN ANALYZE</code> (or <code>EXPLAIN QUERY PLAN</code> in SQLite). A <em>sequential/full table scan</em> on the filtered column is the usual culprit. Add an index on that column (or a composite index matching the filter + join), re-run EXPLAIN and confirm it switched to an index scan with a lower cost. Watch for index-defeating patterns: a function on the column (<code>LOWER(email)</code>), a leading-wildcard <code>LIKE \'%x\'</code>, or implicit type casts. Measure, don\'t guess.</p>',
    source: { site: 'PostgreSQL docs', label: 'Chapter 11. Indexes', url: 'https://www.postgresql.org/docs/current/indexes.html' }
  },
  {
    id: 'sql-s-money-transfer', level: 'medium', category: 'Transactions', type: 'scenario',
    q: 'Scenario: you must move money between two accounts. How do you make it safe against crashes and concurrency?',
    answer: '<p>Wrap both updates in a transaction so they are atomic:</p><pre><code>BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;</code></pre><p>Add a <code>CHECK (balance >= 0)</code> and, for concurrency, either pessimistic locking (<code>SELECT ... FOR UPDATE</code>) or optimistic locking (a <code>version</code> column, retry on 0 rows updated). Durability (WAL) ensures a committed transfer survives a crash.</p>',
    source: { site: 'PostgreSQL docs', label: '13.2. Transaction Isolation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html' }
  },
  {
    id: 'sql-s-pagination-deep', level: 'medium', category: 'Performance', type: 'scenario',
    q: 'Scenario: an API using LIMIT/OFFSET pagination is fast on page 1 but slow on page 5000. Why, and what is the fix?',
    answer: '<p><code>OFFSET 100000</code> makes the database generate and discard 100,000 rows before returning the page, so deep pages get progressively slower. Switch to <strong>keyset (cursor) pagination</strong>: remember the last key seen and filter past it — <code>WHERE id > :last_id ORDER BY id LIMIT 10</code> — which uses the index to seek directly. Always pair with a stable, unique ORDER BY.</p>',
    source: { site: 'LeetCode', label: '595. Big Countries', url: 'https://leetcode.com/problems/big-countries/' }
  },
  {
    id: 'sql-s-duplicate-cleanup', level: 'medium', category: 'Modifying data', type: 'scenario',
    q: 'Scenario: a table accumulated duplicate rows (same email, different id). How do you keep one per email and delete the rest safely?',
    answer: '<p>Decide the survivor rule (usually smallest id). Preview first with a SELECT, then delete inside a transaction:</p><pre><code>BEGIN;\nDELETE FROM person\nWHERE id NOT IN (SELECT MIN(id) FROM person GROUP BY email);\n-- verify count, then\nCOMMIT;</code></pre><p>Afterwards add a <code>UNIQUE(email)</code> constraint so duplicates can never return. Window functions (<code>ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)</code> then delete where rn > 1) are an alternative on large tables.</p>',
    source: { site: 'LeetCode', label: '196. Delete Duplicate Emails', url: 'https://leetcode.com/problems/delete-duplicate-emails/' }
  },
  {
    id: 'sql-s-normalize-or-not', level: 'hard', category: 'Schema design', type: 'scenario',
    q: 'Scenario: reports aggregating millions of order rows are too slow even with indexes. Would you denormalize, and how?',
    answer: '<p>Possibly. First confirm indexes and the query plan are optimal. If reads still dominate and the data is append-heavy, denormalize deliberately: maintain a summary/rollup table (e.g. daily revenue per category) updated by triggers, a scheduled job, or a materialized view (PostgreSQL). Keep the normalized tables as the source of truth; the denormalized copy is a cache you can rebuild. Document the trade-off: faster reads for extra write complexity and eventual-consistency risk.</p>',
    source: { site: 'Wikipedia', label: 'Database normalization (Denormalization)', url: 'https://en.wikipedia.org/wiki/Database_normalization' }
  },

]};
