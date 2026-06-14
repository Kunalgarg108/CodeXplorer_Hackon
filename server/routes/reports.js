import express from "express";
import { auth } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";
import SpendingThreshold from "../models/SpendingThreshold.js";

const router = express.Router();

// Helper to escape values for CSV
const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return "";
  let str = String(val).replace(/"/g, '""');
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    str = `"${str}"`;
  }
  return str;
};

// GET /api/reports/transaction-export - CSV Export
router.get("/transaction-export", auth, async (req, res) => {
  try {
    const filter = { userId: req.user.id, deletedAt: null };

    if (req.query.category) {
      const cats = req.query.category.split(",");
      filter.category = { $in: cats };
    }

    if (req.query.merchantName) {
      filter.merchantName = { $regex: req.query.merchantName, $options: "i" };
    }

    if (req.query.type) {
      filter.transactionType = req.query.type;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) filter.transactionDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.transactionDate.$lte = new Date(req.query.endDate);
    }

    const transactions = await Transaction.find(filter).sort({ transactionDate: -1 });

    let csvContent = "Date,Merchant,Amount,Type,Category,Subcategory,Description,Tags\n";

    transactions.forEach((t) => {
      const dateStr = new Date(t.transactionDate).toISOString().split("T")[0];
      const tagsStr = Array.isArray(t.tags) ? t.tags.join("; ") : "";

      csvContent += `${escapeCsvValue(dateStr)},${escapeCsvValue(t.merchantName)},${t.amount},${escapeCsvValue(t.transactionType)},${escapeCsvValue(t.category)},${escapeCsvValue(t.subcategory)},${escapeCsvValue(t.description)},${escapeCsvValue(tagsStr)}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="transactions_export_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/dashboard-snapshot - Monthly summary JSON
router.get("/dashboard-snapshot", auth, async (req, res) => {
  try {
    const now = new Date();
    const monthParam = req.query.month; // e.g. "2026-06"
    let year = now.getFullYear();
    let monthIdx = now.getMonth();

    if (monthParam && monthParam.match(/^\d{4}-\d{2}$/)) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0]);
      monthIdx = parseInt(parts[1]) - 1;
    }

    const startOfMonth = new Date(year, monthIdx, 1);
    const endOfMonth = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);

    const monthlyTxns = await Transaction.find({
      userId: req.user.id,
      deletedAt: null,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let totalSpend = 0;
    let totalIncome = 0;
    const categorySpend = {};

    monthlyTxns.forEach((t) => {
      if (t.transactionType === "CREDIT") {
        totalIncome += t.amount;
      } else if (t.transactionType === "DEBIT" && !t.isIgnored && !t.excludeFromAnalysis) {
        totalSpend += t.amount;
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      }
    });

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpend) / totalIncome) * 100 : 0;

    // Check breaches
    const thresholds = await SpendingThreshold.find({ userId: req.user.id, isActive: true });
    const breaches = [];
    thresholds.forEach((t) => {
      const spent = categorySpend[t.category] || 0;
      if (spent > t.thresholdAmount) {
        breaches.push({
          category: t.category,
          limit: t.thresholdAmount,
          spent,
          excess: spent - t.thresholdAmount
        });
      }
    });

    res.json({
      period: startOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      totalSpend,
      totalIncome,
      savingsRate,
      breachesCount: breaches.length,
      breaches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/spending-report-pdf - Printable summary HTML
router.get("/spending-report-pdf", auth, async (req, res) => {
  try {
    const now = new Date();
    const monthParam = req.query.month; // e.g. "2026-06"
    let year = now.getFullYear();
    let monthIdx = now.getMonth();

    if (monthParam && monthParam.match(/^\d{4}-\d{2}$/)) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0]);
      monthIdx = parseInt(parts[1]) - 1;
    }

    const startOfMonth = new Date(year, monthIdx, 1);
    const endOfMonth = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
    const monthLabel = startOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Fetch transactions
    const transactions = await Transaction.find({
      userId: req.user.id,
      deletedAt: null,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ transactionDate: -1 });

    let totalSpend = 0;
    let totalIncome = 0;
    const categorySpend = {};
    const merchantSpend = {};

    transactions.forEach((t) => {
      if (t.transactionType === "CREDIT") {
        totalIncome += t.amount;
      } else if (t.transactionType === "DEBIT" && !t.isIgnored && !t.excludeFromAnalysis) {
        totalSpend += t.amount;
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
        merchantSpend[t.merchantName] = (merchantSpend[t.merchantName] || 0) + t.amount;
      }
    });

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpend) / totalIncome) * 100 : 0;

    // Top merchants
    const topMerchants = Object.entries(merchantSpend)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Fetch thresholds
    const thresholds = await SpendingThreshold.find({ userId: req.user.id, isActive: true });
    const categoryLimitsList = [];
    thresholds.forEach((t) => {
      const spent = categorySpend[t.category] || 0;
      categoryLimitsList.push({
        category: t.category,
        limit: t.thresholdAmount,
        spent,
        percent: t.thresholdAmount > 0 ? (spent / t.thresholdAmount) * 100 : 0,
        isBreached: spent > t.thresholdAmount
      });
    });

    // Generate beautifully formatted HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Finan Smart Financial Report - ${monthLabel}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 800;
      color: #4f46e5;
    }
    .header-title {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: right;
    }
    .report-meta {
      font-size: 14px;
      color: #475569;
      margin-bottom: 30px;
    }
    .metrics-grid {
      display: grid;
      grid-template-cols: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }
    .metric-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
    }
    .metric-value.income { color: #10b981; }
    .metric-value.expense { color: #f43f5e; }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 40px;
      margin-bottom: 20px;
      border-left: 4px solid #4f46e5;
      padding-left: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      color: #475569;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      text-align: left;
    }
    td {
      border-bottom: 1px solid #f1f5f9;
      padding: 14px 16px;
      font-size: 14px;
      color: #334155;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.exceeded {
      background-color: #ffe4e6;
      color: #e11d48;
    }
    .status-badge.good {
      background-color: #ecfdf5;
      color: #059669;
    }
    .footer {
      margin-top: 60px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">Finan Smart</div>
      <div class="header-title">Monthly Financial Report<br><span style="color: #4f46e5;">${monthLabel}</span></div>
    </div>

    <div class="report-meta">
      <strong>Statement For:</strong> ${escapeCsvValue(req.user.name)} (${escapeCsvValue(req.user.email)})<br>
      <strong>Generated On:</strong> ${new Date().toLocaleString()}
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Deposits</div>
        <div class="metric-value income">₹${totalIncome.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Outflows</div>
        <div class="metric-value expense">₹${totalSpend.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Savings Rate</div>
        <div class="metric-value">${savingsRate.toFixed(1)}%</div>
      </div>
    </div>

    ${categoryLimitsList.length > 0 ? `
    <div class="section-title">Budget Limits & Breaches</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Budget Limit</th>
          <th>Actual Spent</th>
          <th>Percentage Used</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${categoryLimitsList.map((c) => `
          <tr>
            <td><strong>${escapeCsvValue(c.category)}</strong></td>
            <td>₹${c.limit.toLocaleString()}</td>
            <td>₹${c.spent.toLocaleString()}</td>
            <td>${c.percent.toFixed(0)}%</td>
            <td>
              <span class="status-badge ${c.isBreached ? 'exceeded' : 'good'}">
                ${c.isBreached ? 'Exceeded' : 'Under Limit'}
              </span>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    ` : ""}

    <div class="section-title">Top Expense Sources</div>
    <table>
      <thead>
        <tr>
          <th>Merchant Name</th>
          <th>Total Outflow</th>
        </tr>
      </thead>
      <tbody>
        ${topMerchants.map((m) => `
          <tr>
            <td><strong>${escapeCsvValue(m.name)}</strong></td>
            <td>₹${m.amount.toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="section-title">Monthly Transaction Statement</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Merchant</th>
          <th>Category</th>
          <th>Type</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.slice(0, 50).map((t) => `
          <tr>
            <td>${new Date(t.transactionDate).toISOString().split("T")[0]}</td>
            <td>${escapeCsvValue(t.merchantName)}</td>
            <td>${escapeCsvValue(t.category)}</td>
            <td style="color: ${t.transactionType === 'CREDIT' ? '#10b981' : '#1e293b'}">
              <strong>${t.transactionType}</strong>
            </td>
            <td>₹${t.amount.toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    ${transactions.length > 50 ? `<p style="text-align: center; color: #64748b; font-size: 13px;">Showing first 50 transactions of ${transactions.length} total.</p>` : ""}

    <div class="footer">
      Generated automatically by Finan Smart AI. All rights reserved &copy; ${new Date().getFullYear()}.
    </div>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
