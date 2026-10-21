// Formula cheatsheet — standalone module, loaded only on cheatsheet.html

(function () {
  var commands = [
    ["Assets = Liabilities + Equity", "The accounting equation — must balance after every transaction"],
    ["Journal → Ledger → Trial Balance → Financial Statements", "The full accounting flow, start to finish"],
    ["Current Ratio = Current Assets ÷ Current Liabilities", "Liquidity ratio; ideal benchmark is roughly 2:1"],
    ["Quick Ratio = (Current Assets − Inventory) ÷ Current Liabilities", "Liquidity without relying on selling inventory; ideal ≈ 1:1"],
    ["Gross Profit Ratio = Gross Profit ÷ Net Sales × 100", "Profitability after direct cost of goods sold"],
    ["Net Profit Ratio = Net Profit ÷ Net Sales × 100", "Profitability after ALL expenses"],
    ["Return on Investment (ROI) = Net Profit ÷ Capital Employed × 100", "Overall return on capital invested in the business"],
    ["Debt-Equity Ratio = Total Debt ÷ Shareholders' Equity", "Solvency — how dependent the business is on borrowed funds"],
    ["Common-size statement = Line item ÷ Base (Sales or Total Assets) × 100", "Expresses every line as a percentage for size-independent comparison"],
    ["Trend % = Current Year figure ÷ Base Year figure × 100", "Indexes a line item across years against a chosen base year"],
    ["Comparative statement = Year 2 − Year 1, then ÷ Year 1 × 100", "Absolute and percentage change between two periods, side by side"],
    ["Financial Accounting", "Reports the WHOLE business's past financial performance to OUTSIDERS (shareholders, lenders, regulators)"],
    ["Cost Accounting", "Ascertains and controls the COST of a product, job, or process — internal, granular"],
    ["Management Accounting", "Uses any relevant data to help managers PLAN, DECIDE, and CONTROL — no fixed external rules"],
    ["Fixed Budget", "Prepared for one activity level only; not adjusted if actual activity differs"],
    ["Flexible Budget", "Prepared for multiple activity levels; recast to match actual output for fair comparison"],
    ["Zero-Based Budget (ZBB)", "Built from scratch every period; every expense must be freshly justified"],
    ["Master Budget", "The consolidated summary of all functional budgets into one overall plan"],
    ["Budgetary Control", "The ongoing process of comparing actuals vs. budget and acting on variances"],
    ["Contribution per unit = Selling Price − Variable Cost per unit", "Amount each unit contributes toward fixed cost, then profit"],
    ["Profit = Total Contribution − Fixed Cost", "Marginal costing's profit formula"],
    ["Break-Even Point (units) = Fixed Cost ÷ Contribution per unit", "Sales volume at which total cost equals total revenue"],
    ["P/V Ratio = Contribution ÷ Sales × 100", "Profit-Volume ratio — how much of each sales rupee is contribution"],
    ["Break-Even Point (₹ sales) = Fixed Cost ÷ P/V Ratio", "Break-even expressed in sales value instead of units"],
    ["Sales for Target Profit (units) = (Fixed Cost + Target Profit) ÷ Contribution per unit", "CVP formula for a desired profit level"],
    ["Margin of Safety = Actual Sales − Break-even Sales", "How far sales can fall before the business starts losing money"],
    ["Make-or-buy decision", "Compare in-house variable cost vs. outside purchase price, assuming fixed cost is unaffected"],
    ["Limiting factor ranking", "Rank products by contribution PER UNIT OF the scarce resource, not contribution alone"],
    ["Special order acceptance rule", "Accept if price covers variable cost and adds contribution, with spare capacity and no disruption to regular sales"]
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
