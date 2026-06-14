import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { auth } from "../middleware/auth.js";
import generateAlertsWithAI from "../utils/getBudgetAlerts.js";
import { getExchangeRates, getCurrencySymbol } from "../services/currencyService.js";

const router = express.Router();

const alertsCache = new Map(); // userId -> { cacheKey, alerts }

router.get("/", auth, async (req, res) => {
  try {
    const currencyCode = req.query.currency || "USD";
    const { rates } = getExchangeRates();
    const rate = rates[currencyCode] || 1;
    const symbol = getCurrencySymbol(currencyCode);

    const budgets = await Budget.find({ createdBy: req.user.email });

    if (budgets.length === 0) {
      return res.json({ alerts: [] });
    }

    const budgetIds = budgets.map((b) => b._id);
    const expenses = await Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const budgetSummaries = budgets.map((budget) => {
      const budgetExpenses = expenses.filter(
        (e) => e.budgetId.toString() === budget._id.toString()
      );
      const totalSpend = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
      const amount = Number(budget.amount) || 0;
      const utilizationPercent = amount > 0 ? Math.round((totalSpend / amount) * 100) : 0;

      // Calculate days active
      const createdAt = budget.createdAt || budget._id.getTimestamp();
      const daysActive = Math.max(1, Math.ceil((now - new Date(createdAt)) / (1000 * 60 * 60 * 24)));

      // Burn rate (daily average)
      const burnRate = daysActive > 0 ? totalSpend / daysActive : 0;

      // Days until budget exhaustion
      const remaining = amount - totalSpend;
      const daysUntilExhaustion = burnRate > 0 ? remaining / burnRate : null;

      // Weekly trend: compare this week's spending vs last week
      const thisWeekExpenses = budgetExpenses.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= oneWeekAgo;
      });
      const lastWeekExpenses = budgetExpenses.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= twoWeeksAgo && d < oneWeekAgo;
      });

      const thisWeekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

      let weeklyTrend = null;
      if (lastWeekTotal > 0) {
        weeklyTrend = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
      }

      // Recent expenses (last 5)
      const recentExpenses = budgetExpenses.slice(0, 5).map((e) => ({
        name: e.name,
        amount: Math.round(e.amount * rate * 100) / 100,
      }));

      return {
        name: budget.name,
        icon: budget.icon,
        amount: Math.round(amount * rate * 100) / 100,
        totalSpend: Math.round(totalSpend * rate * 100) / 100,
        utilizationPercent,
        burnRate: Math.round(burnRate * rate * 100) / 100,
        daysActive,
        daysUntilExhaustion: daysUntilExhaustion !== null ? Math.round(daysUntilExhaustion) : null,
        weeklyTrend,
        recentExpenses,
      };
    });

    // Only generate alerts for budgets with some activity
    const activeBudgets = budgetSummaries.filter((b) => b.totalSpend > 0);

    if (activeBudgets.length === 0) {
      return res.json({ alerts: [], budgetSummaries });
    }

    const cacheKey = `${currencyCode}_${JSON.stringify(activeBudgets)}`;
    const userId = req.user.id;
    const cached = alertsCache.get(userId);
    let alerts;
    if (cached && cached.cacheKey === cacheKey) {
      alerts = cached.alerts;
    } else {
      alerts = await generateAlertsWithAI(activeBudgets, symbol);
      alertsCache.set(userId, { cacheKey, alerts });
    }

    res.json({ alerts, budgetSummaries });
  } catch (error) {
    console.error("Budget alerts error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
