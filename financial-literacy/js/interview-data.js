// Financial Literacy interview questions — data for the shared renderer (../js/interview.js).
// Every answer is written here from scratch, grounded in standard accounting/costing
// principles as taught under Generally Accepted Accounting Principles (GAAP) and common
// cost & management accounting textbooks (e.g. M.Y. Khan & P.K. Jain, "Management Accounting").
window.STUDYHUB_INTERVIEW = {
  topic: 'financial-literacy',
  questions: [
    // ===================== EASY =====================
    {
      id: 'fl-q1', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is the accounting equation, and why must it always balance?',
      answer: '<p>The accounting equation states that <strong>Assets = Liabilities + Owner\'s Equity</strong>. It must always balance because of double-entry bookkeeping: every transaction affects at least two accounts by an equal amount, so whatever a business owns (assets) is always exactly funded either by what it owes to outsiders (liabilities) or by what the owner has invested and retained (equity).</p><p>For example, if a business borrows ₹1,00,000 in cash, cash (an asset) rises by ₹1,00,000 and the loan (a liability) rises by the same ₹1,00,000 — the equation stays balanced automatically.</p>',
      source: { site: 'GAAP (Generally Accepted Accounting Principles)', label: 'Fundamental accounting equation', url: 'https://www.investopedia.com/terms/a/accounting-equation.asp' }
    },
    {
      id: 'fl-q2', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is the difference between a journal and a ledger?',
      answer: '<p>A <strong>journal</strong> is the "book of original entry" — every transaction is recorded here first, in the order it happens, as a debit and an equal credit.</p><p>A <strong>ledger</strong> is the "book of final entry" — it takes every journal entry and regroups it by account (Cash A/c, Sales A/c, Rent A/c, and so on), so you can see the running balance of any one account at a glance. The journal is organized by date; the ledger is organized by subject.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'Books of Original and Final Entry', url: 'https://www.accountingcoach.com/accounting-basics/explanation' }
    },
    {
      id: 'fl-q3', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is a Trial Balance, and what does it prove?',
      answer: '<p>A <strong>Trial Balance</strong> is a statement listing the closing balance of every ledger account at a given date, with debit balances in one column and credit balances in another. Its totals should always be equal.</p><p>It proves only the <em>arithmetical accuracy</em> of the ledger postings — that total debits equal total credits. It does NOT prove that every transaction was recorded correctly or in the right account; a transaction posted entirely to the wrong account would still leave the trial balance matched.</p>',
      source: { site: 'GAAP', label: 'Trial Balance preparation', url: 'https://www.accountingcoach.com/accounting-basics/explanation' }
    },
    {
      id: 'fl-q4', level: 'easy', category: 'Financial Statements', type: 'concept',
      q: 'What is the difference between the Trading Account and the Profit & Loss Account?',
      answer: '<p>The <strong>Trading Account</strong> calculates <em>Gross Profit</em> — it compares net sales against the direct cost of goods sold (opening stock + purchases + direct expenses − closing stock) to show the profit made purely from buying/producing and selling goods.</p><p>The <strong>Profit & Loss Account</strong> starts from that gross profit and deducts all remaining indirect/operating expenses (rent, salaries, administration, selling costs) — and adds any other income — to arrive at the final <em>Net Profit</em> for the period.</p>',
      source: { site: 'GAAP', label: 'Final Accounts structure', url: 'https://www.accountingcoach.com/accounting-basics/explanation' }
    },
    {
      id: 'fl-q5', level: 'easy', category: 'Accounting Branches', type: 'concept',
      q: 'Who are the primary users of Financial Accounting information?',
      answer: '<p>Financial accounting is aimed mainly at <strong>external users</strong>: shareholders and potential investors (deciding whether to invest), lenders and banks (assessing creditworthiness), tax and regulatory authorities (ensuring compliance), and suppliers or customers assessing the business\'s stability. Because these users don\'t sit inside the business, financial accounting follows standardized, statutory rules so that different companies\' statements can be compared fairly.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'Users of Financial Statements', url: 'https://www.accountingcoach.com/accounting-basics/explanation' }
    },
    {
      id: 'fl-q6', level: 'easy', category: 'Budgeting', type: 'concept',
      q: 'What is a budget, and what is budgetary control?',
      answer: '<p>A <strong>budget</strong> is a formal, quantified plan for a future period — expected sales, costs, and profit — prepared in advance. <strong>Budgetary control</strong> is the ongoing management process built around it: continuously comparing actual results against the budgeted figures, analyzing the resulting variances, and taking corrective action where performance has drifted from the plan.</p>',
      source: { site: 'Management Accounting Textbook (M.Y. Khan & P.K. Jain)', label: 'Budgeting fundamentals', url: 'https://www.investopedia.com/terms/b/budget.asp' }
    },
    {
      id: 'fl-q7', level: 'easy', category: 'Marginal Costing', type: 'concept',
      q: 'What is "Contribution" in marginal costing?',
      answer: '<p><strong>Contribution</strong> (or contribution margin) is Sales minus Variable Cost. It represents the amount each unit sold "contributes" first toward covering the business\'s fixed costs, and once fixed costs are fully covered, directly toward profit. It is the single most important figure in marginal costing because every short-term decision — break-even, pricing, special orders — is built on it.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Marginal Costing — Contribution', url: 'https://www.investopedia.com/terms/c/contributionmargin.asp' }
    },
    // ===================== MEDIUM =====================
    {
      id: 'fl-q8', level: 'medium', category: 'Financial Statements', type: 'scenario',
      q: 'A company\'s Current Ratio is 3:1, but its Quick Ratio is only 0.4:1. What does this gap suggest?',
      answer: '<p>A large gap between the Current Ratio (which includes inventory) and the Quick Ratio (which excludes it) suggests that a very large share of the company\'s current assets is tied up in <strong>inventory</strong> rather than cash or receivables. The business LOOKS liquid on the Current Ratio alone, but if it needed to pay short-term debts quickly without time to sell that stock, it could struggle — inventory can be slow to convert to cash, and its sale value is uncertain. This pattern is common in businesses with slow-moving or seasonal stock, and it\'s exactly why analysts look at both ratios together rather than relying on just one.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'Liquidity Ratio Analysis', url: 'https://www.investopedia.com/terms/q/quickratio.asp' }
    },
    {
      id: 'fl-q9', level: 'medium', category: 'Financial Statements', type: 'concept',
      q: 'Explain the difference between common-size statements and comparative statements.',
      answer: '<p>A <strong>common-size statement</strong> converts every line item into a percentage of one chosen base (net sales for the P&L, total assets for the balance sheet) for a SINGLE period, letting you compare the internal structure of businesses of different sizes.</p><p>A <strong>comparative statement</strong> places figures from two or more PERIODS side by side for the SAME business and adds absolute and percentage change columns, letting you see how that one business has moved over time. In short: common-size analysis compares structure across entities at one point in time; comparative analysis tracks the same entity\'s change across time.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'Techniques of Financial Statement Analysis', url: 'https://www.investopedia.com/terms/c/commonsize.asp' }
    },
    {
      id: 'fl-q10', level: 'medium', category: 'Accounting Branches', type: 'scenario',
      q: 'A factory manager wants to know the exact cost of producing one unit of a specific product. Which branch of accounting gives this, and why not the others?',
      answer: '<p><strong>Cost Accounting</strong> is designed exactly for this — it tracks material, labor, and overhead costs at the level of an individual product, job, or process, letting the manager see a precise per-unit cost.</p><p>Financial Accounting would not help here because it only reports on the business as a whole, historically, for external users — it has no concept of "per unit." Management Accounting is broader still and could USE this cost data for a decision, but the raw per-unit cost figure itself is the output of cost accounting, which feeds into management accounting reports.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Cost Accounting vs Financial vs Management Accounting', url: 'https://www.investopedia.com/terms/c/cost-accounting.asp' }
    },
    {
      id: 'fl-q11', level: 'medium', category: 'Budgeting', type: 'concept',
      q: 'Why is a Flexible Budget usually considered better for performance evaluation than a Fixed Budget?',
      answer: '<p>A <strong>Fixed Budget</strong> is set for one specific activity level and never adjusted. If actual output turns out to be significantly higher or lower than planned, comparing actuals directly against that fixed figure produces misleading variances — mostly reflecting the VOLUME difference rather than genuine cost control or inefficiency.</p><p>A <strong>Flexible Budget</strong> is prepared for several possible activity levels in advance, so once the actual output level is known, the budget can be "recast" to that same level before comparison. This isolates the TRUE efficiency variance (did we spend more or less than we should have, for the volume we actually achieved) from the volume variance, giving management a fairer basis to judge performance.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Flexible Budgeting', url: 'https://www.investopedia.com/terms/f/flexible-budget.asp' }
    },
    {
      id: 'fl-q12', level: 'medium', category: 'Marginal Costing', type: 'coding',
      q: 'A company sells a product at ₹250 per unit. Variable cost is ₹150 per unit, and fixed costs for the period are ₹5,00,000. Calculate the Break-Even Point in units and in sales value.',
      answer: '<pre><code>Contribution per unit = ₹250 − ₹150 = ₹100\nBreak-Even Point (units) = Fixed Cost ÷ Contribution per unit\n                        = ₹5,00,000 ÷ ₹100 = 5,000 units\n\nP/V Ratio = (Contribution ÷ Sales) × 100 = (₹100 ÷ ₹250) × 100 = 40%\nBreak-Even Point (₹ sales) = Fixed Cost ÷ P/V Ratio\n                           = ₹5,00,000 ÷ 40% = ₹12,50,000</code></pre><p>The company must sell <strong>5,000 units</strong>, equivalent to <strong>₹12,50,000</strong> in sales, to exactly cover its costs with no profit or loss.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Break-Even Point calculation', url: 'https://www.investopedia.com/terms/b/breakevenanalysis.asp' }
    },
    {
      id: 'fl-q13', level: 'medium', category: 'Marginal Costing', type: 'scenario',
      q: 'A product shows an "accounting loss" after allocating a share of fixed overheads, but it has positive contribution. Should the company discontinue it? Explain using marginal costing logic.',
      answer: '<p>Not necessarily. Under <strong>absorption costing</strong>, fixed overheads are arbitrarily allocated across products, so a product can appear to make a "loss" purely because of how overhead was split — not because it\'s genuinely unprofitable to keep.</p><p>Under <strong>marginal costing</strong> logic, as long as the product\'s <strong>contribution is positive</strong> (its selling price exceeds its variable cost), it is adding something toward covering the company\'s fixed costs. If the product is discontinued, that contribution disappears — but MOST fixed costs (rent, salaried staff, depreciation) typically remain unchanged in the short run, since they don\'t vary with which products are made. The net effect is usually a FALL in overall profit, not a rise. The decision should instead focus on whether fixed costs can actually be reduced by dropping the product, and on strategic factors (brand, customer relationships) beyond the immediate numbers.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Discontinuation decisions under Marginal Costing', url: 'https://www.investopedia.com/terms/c/contributionmargin.asp' }
    },
    // ===================== HARD =====================
    {
      id: 'fl-q14', level: 'hard', category: 'Marginal Costing', type: 'scenario',
      q: 'A business has one machine with only 1,000 available hours. It makes two products: Product A earns ₹60 contribution per unit and takes 2 machine hours; Product B earns ₹40 contribution per unit and takes 1 machine hour. Which product should be prioritized, and why?',
      answer: '<p>When a resource is limited (the "limiting factor" — here, machine hours), products must be ranked by <strong>contribution PER UNIT OF THE LIMITING FACTOR</strong>, not by contribution per unit alone.</p><pre><code>Product A: ₹60 contribution ÷ 2 machine hours = ₹30 per machine hour\nProduct B: ₹40 contribution ÷ 1 machine hour  = ₹40 per machine hour</code></pre><p>Even though Product A earns MORE contribution per unit (₹60 vs ₹40), Product B earns more contribution PER SCARCE MACHINE HOUR (₹40 vs ₹30). With only 1,000 hours available, prioritizing Product B generates more total contribution from the limited resource. This is a classic trap in limiting-factor decisions: ranking by per-unit contribution alone, ignoring the scarce resource each unit consumes, leads to the wrong product mix.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Key/Limiting Factor Decisions', url: 'https://www.investopedia.com/terms/c/contributionmargin.asp' }
    },
    {
      id: 'fl-q15', level: 'hard', category: 'Marginal Costing', type: 'scenario',
      q: 'A company manufactures a component in-house at a variable cost of ₹80 per unit; an outside supplier offers to supply it at ₹70 per unit. Under what condition should the company still consider making it in-house rather than buying it?',
      answer: '<p>On variable cost alone, buying looks cheaper (₹70 vs ₹80). But the make-or-buy decision also depends on whether the company\'s <strong>fixed costs and spare capacity</strong> are affected:</p><ul><li>If the machinery and staff used to make the component are IDLE if not making it (i.e. have no alternative profitable use), then making in-house still "costs" only the ₹80 variable cost in real cash terms, and the fixed costs continue regardless of the decision — so making in-house could still be preferable if ₹80 is close to or below ₹70 plus any switching/ordering costs of buying.</li><li>If, instead, that capacity could be redirected to produce something else profitable, the real comparison must include the <strong>opportunity cost</strong> of what else that capacity could have earned — in which case buying externally and freeing up the capacity for a more profitable use could be the better decision even though the external price looks higher than the bare variable cost.</li></ul><p>In short: the simple variable-cost comparison only holds when there is no better alternative use for the freed-up capacity. Quality, reliability of supply, and strategic control over the component also matter beyond the pure cost comparison.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Make-or-Buy Decisions', url: 'https://www.investopedia.com/terms/o/opportunitycost.asp' }
    },
    {
      id: 'fl-q16', level: 'hard', category: 'Budgeting', type: 'scenario',
      q: 'A company has used Zero-Based Budgeting for the first time this year. What are the likely benefits and practical challenges compared to its old budgeting approach?',
      answer: '<p><strong>Benefits:</strong> Zero-Based Budgeting (ZBB) forces every department to justify its entire budget from zero each period, rather than simply inflating last year\'s figures by a percentage. This tends to surface and eliminate costs that persisted purely out of habit, sharpens cost-consciousness across the organization, and more closely aligns spending with current priorities rather than historical ones.</p><p><strong>Challenges:</strong> ZBB is significantly more time-consuming and labor-intensive than incremental budgeting, since every line item across every department must be rebuilt and justified from scratch rather than adjusted. It can also create friction, as managers may resist having to re-justify costs they consider obviously necessary, and the process risks becoming a bureaucratic exercise if not managed carefully, especially in its first year when staff are unfamiliar with the discipline it requires.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Zero-Based Budgeting — Advantages and Limitations', url: 'https://www.investopedia.com/terms/z/zbb.asp' }
    },
    {
      id: 'fl-q17', level: 'hard', category: 'Financial Statements', type: 'scenario',
      q: 'Two companies in the same industry have identical Net Profit Ratios, but Company X has a much higher Return on Investment (ROI) than Company Y. What does this most likely indicate?',
      answer: '<p>ROI = Net Profit ÷ Capital Employed × 100. If both companies earn the same NET PROFIT RATIO (profit as a % of sales) but Company X has a higher ROI, the most likely explanation is that Company X is generating the SAME level of profitability per rupee of sales while using LESS capital employed relative to its sales — in other words, Company X is more efficient at generating sales (and therefore profit) from the capital invested in the business. This is usually driven by a higher <strong>asset turnover</strong> (sales ÷ capital employed): X is "sweating its assets" harder than Y. It\'s a reminder that ROI = Net Profit Ratio × Asset Turnover, so two companies with identical margins can still have very different overall returns depending on how efficiently they use their capital base.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'DuPont-style ROI decomposition', url: 'https://www.investopedia.com/terms/r/returnoninvestment.asp' }
    },
    {
      id: 'fl-q18', level: 'hard', category: 'Marginal Costing', type: 'scenario',
      q: 'A company operating below full capacity receives a one-off bulk order at a price below its normal selling price but above its variable cost. Under what conditions should it accept this order?',
      answer: '<p>Under marginal costing logic, this special order is generally worth accepting <strong>provided all of the following hold</strong>: (1) the company has genuine <strong>spare/idle capacity</strong> so the order doesn\'t displace existing regular sales; (2) the offered price covers the <strong>variable cost</strong> per unit, so the order adds positive contribution rather than losing money on each unit; (3) accepting it does not require any additional fixed costs that would outweigh the contribution earned; and (4) it does not risk undermining the regular market price — for instance, by alerting regular customers that the company is willing to sell at a discount, or by breaching a long-term pricing agreement.</p><p>If all these conditions are met, the extra contribution from the order flows straight to profit since fixed costs are already being covered by existing business — making the order worthwhile even though its price is below the "normal" selling price.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Acceptance of Special/Bulk Orders', url: 'https://www.investopedia.com/terms/c/contributionmargin.asp' }
    },
    {
      id: 'fl-q19', level: 'hard', category: 'Financial Statements', type: 'concept',
      q: 'Why can a company be profitable on its Profit & Loss Account yet still face a cash crisis?',
      answer: '<p>The P&L Account is prepared on the <strong>accrual basis</strong> — revenue is recognized when earned (e.g. when goods are sold on credit) and expenses when incurred, regardless of when cash actually changes hands. A company can therefore report strong net profit while its cash position deteriorates if, for example: sales are growing fast but mostly on credit (receivables rising, cash not yet collected); the company is investing heavily in inventory or fixed assets (a cash outflow that doesn\'t appear as an expense on the P&L); or it is repaying loan principal (a cash outflow, but not an expense at all, since only the interest portion hits the P&L). This is exactly why ratio analysis and statement analysis should always be read ALONGSIDE the cash flow statement, not the P&L in isolation — profitability and liquidity are related but genuinely different things.</p>',
      source: { site: 'Standard Accounting Textbook', label: 'Accrual Accounting vs Cash Flow', url: 'https://www.investopedia.com/terms/a/accrualaccounting.asp' }
    },
    {
      id: 'fl-q20', level: 'hard', category: 'Marginal Costing', type: 'concept',
      q: 'What are the key assumptions and limitations of Cost-Volume-Profit (CVP) / Break-Even analysis?',
      answer: '<p>CVP analysis rests on several simplifying assumptions that limit its real-world accuracy:</p><ul><li><strong>Linear cost and revenue behavior</strong> — it assumes selling price and variable cost per unit stay constant at every volume, when in reality bulk discounts, overtime pay, or capacity constraints can bend these relationships.</li><li><strong>Clean fixed/variable split</strong> — many real costs are "semi-variable" or "step-fixed" (jumping to a new fixed level once a capacity threshold is crossed), which pure CVP analysis doesn\'t capture well.</li><li><strong>Single product or constant sales mix</strong> — multi-product break-even gets considerably more complex, since changing the mix changes the blended contribution margin.</li><li><strong>Relevant range</strong> — the straight-line cost and revenue relationships are only assumed valid within a limited "relevant range" of activity; extrapolating far beyond it is unreliable.</li><li><strong>Short-term focus</strong> — it treats fixed costs as fixed, which is realistic only in the short run; over a longer horizon, most costs become variable as capacity itself can be changed.</li></ul><p>Despite these limitations, CVP remains a valuable first-pass tool for quick, directional managerial decisions precisely because of its simplicity.</p>',
      source: { site: 'Management Accounting Textbook', label: 'Assumptions and Limitations of CVP Analysis', url: 'https://www.investopedia.com/terms/c/cost-volume-profit-analysis.asp' }
    }
  ]
};
