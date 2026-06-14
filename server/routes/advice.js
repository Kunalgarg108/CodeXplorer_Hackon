import express from "express";
import getFinancialAdvice, { getAIInsights } from "../utils/getFinancialAdvice.js";
import { auth } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";
import SpendingThreshold from "../models/SpendingThreshold.js";
import { getExchangeRates, getCurrencySymbol } from "../services/currencyService.js";

const router = express.Router();
const adviceCache = new Map(); // userId -> { cacheKey, advice }
const insightsCache = new Map(); // userId -> { contextStr, insights }

router.post("/", auth, async (req, res) => {
  try {
    const { totalBudget, totalIncome, totalSpend, currency } = req.body;
    const currencyCode = currency || "USD";
    const { rates } = getExchangeRates();
    const rate = rates[currencyCode] || 1;
    const symbol = getCurrencySymbol(currencyCode);

    // Convert values to selected currency for prompt/cache
    const convertedBudget = Math.round(totalBudget * rate * 100) / 100;
    const convertedIncome = Math.round(totalIncome * rate * 100) / 100;
    const convertedSpend = Math.round(totalSpend * rate * 100) / 100;

    const cacheKey = `${currencyCode}_${convertedBudget}_${convertedIncome}_${convertedSpend}`;
    const userId = req.user.id;

    const cached = adviceCache.get(userId);
    if (cached && cached.cacheKey === cacheKey) {
      return res.json({ advice: cached.advice });
    }

    const advice = await getFinancialAdvice(convertedBudget, convertedIncome, convertedSpend, symbol);
    adviceCache.set(userId, { cacheKey, advice });
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/insights", auth, async (req, res) => {
  try {
    const currencyCode = req.query.currency || "USD";
    const { rates } = getExchangeRates();
    const rate = rates[currencyCode] || 1;
    const symbol = getCurrencySymbol(currencyCode);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Fetch current month's transactions
    const monthlyTransactions = await Transaction.find({
      userId: req.user.id,
      transactionType: "DEBIT",
      isIgnored: false,
      excludeFromAnalysis: false,
      deletedAt: null,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let totalSpend = 0;
    const categoryBreakdown = {};
    const merchantSpend = {};

    monthlyTransactions.forEach(txn => {
      totalSpend += txn.amount;
      categoryBreakdown[txn.category] = (categoryBreakdown[txn.category] || 0) + txn.amount;
      merchantSpend[txn.merchantName] = (merchantSpend[txn.merchantName] || 0) + txn.amount;
    });

    // Sort and get top merchants
    const topMerchants = Object.entries(merchantSpend)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 2. Fetch thresholds and check breaches
    const thresholds = await SpendingThreshold.find({ userId: req.user.id, isActive: true });
    const breaches = [];
    thresholds.forEach(t => {
      const spent = categoryBreakdown[t.category] || 0;
      if (spent > t.thresholdAmount) {
        breaches.push({
          category: t.category,
          thresholdAmount: t.thresholdAmount,
          currentSpent: spent,
          excess: spent - t.thresholdAmount
        });
      }
    });

    // 3. Subscription Detection Heuristics (120 days)
    const date120DaysAgo = new Date();
    date120DaysAgo.setDate(date120DaysAgo.getDate() - 120);

    const txns120Days = await Transaction.find({
      userId: req.user.id,
      transactionType: "DEBIT",
      isIgnored: false,
      excludeFromAnalysis: false,
      deletedAt: null,
      transactionDate: { $gte: date120DaysAgo }
    }).sort({ transactionDate: 1 });

    const merchantGroups = {};
    txns120Days.forEach(txn => {
      const merchantKey = txn.merchantName.trim().toLowerCase();
      if (!merchantGroups[merchantKey]) {
        merchantGroups[merchantKey] = [];
      }
      merchantGroups[merchantKey].push(txn);
    });

    const subscriptions = [];
    for (const [merchantKey, txns] of Object.entries(merchantGroups)) {
      if (txns.length < 2) continue;

      let isRecurring = false;
      let matchedAmount = 0;
      
      // Try to find consecutive transactions spaced roughly monthly (27-33 days) with similar amount (+/- 10%)
      for (let i = 0; i < txns.length - 1; i++) {
        const t1 = txns[i];
        const t2 = txns[i + 1];

        const diffTime = Math.abs(t2.transactionDate.getTime() - t1.transactionDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        const amountDiff = Math.abs(t1.amount - t2.amount);
        const avgAmount = (t1.amount + t2.amount) / 2;
        const percentDiff = avgAmount > 0 ? (amountDiff / avgAmount) * 100 : 0;

        if (diffDays >= 27 && diffDays <= 33 && percentDiff <= 10) {
          isRecurring = true;
          matchedAmount = t2.amount;
        }
      }

      if (isRecurring) {
        const originalMerchantName = txns[txns.length - 1].merchantName;
        subscriptions.push({
          merchantName: originalMerchantName,
          amount: matchedAmount,
          frequency: "Monthly",
          lastTransactionDate: txns[txns.length - 1].transactionDate
        });
      }
    }

    // Convert values to target currency
    const totalSpendConverted = Math.round(totalSpend * rate * 100) / 100;

    const categoryBreakdownConverted = {};
    for (const [cat, val] of Object.entries(categoryBreakdown)) {
      categoryBreakdownConverted[cat] = Math.round(val * rate * 100) / 100;
    }

    const topMerchantsConverted = topMerchants.map(m => ({
      name: m.name,
      amount: Math.round(m.amount * rate * 100) / 100
    }));

    const breachesConverted = breaches.map(b => ({
      category: b.category,
      thresholdAmount: Math.round(b.thresholdAmount * rate * 100) / 100,
      currentSpent: Math.round(b.currentSpent * rate * 100) / 100,
      excess: Math.round(b.excess * rate * 100) / 100
    }));

    const subscriptionsConverted = subscriptions.map(s => ({
      merchantName: s.merchantName,
      amount: Math.round(s.amount * rate * 100) / 100,
      frequency: s.frequency,
      lastTransactionDate: s.lastTransactionDate
    }));

    // 4. Generate AI Insights or Fallback
    const context = {
      totalSpend: totalSpendConverted,
      categoryBreakdown: categoryBreakdownConverted,
      topMerchants: topMerchantsConverted,
      breaches: breachesConverted,
      subscriptions: subscriptionsConverted
    };

    const contextStr = `${currencyCode}_${JSON.stringify(context)}`;
    const userId = req.user.id;
    const cached = insightsCache.get(userId);

    let insights;
    if (cached && cached.contextStr === contextStr) {
      insights = cached.insights;
    } else {
      insights = await getAIInsights(context, symbol);

      // Fallback if AI fails or key is missing
      if (!insights || !Array.isArray(insights)) {
        insights = [];
        
        // Heuristic Rule 1: Threshold breaches
        if (breachesConverted.length > 0) {
          const primaryBreach = breachesConverted[0];
          insights.push(`Your spending in the '${primaryBreach.category}' category has exceeded its monthly limit of ${symbol}${primaryBreach.thresholdAmount} by ${symbol}${primaryBreach.excess.toFixed(2)}. Consider reviewing individual transactions here.`);
        }

        // Heuristic Rule 2: Cheaper alternatives or top spending
        const CHEAPER_ALTERNATIVES = {
          starbucks: { alternative: "local cafes or home-brewed coffee", savingPercent: 70 },
          uber: { alternative: "public transit or bike sharing", savingPercent: 50 },
          ola: { alternative: "public transit or bike sharing", savingPercent: 50 },
          swiggy: { alternative: "cooking at home or local mess services", savingPercent: 60 },
          zomato: { alternative: "cooking at home or budget restaurants", savingPercent: 60 },
          amazon: { alternative: "comparing prices at local shops", savingPercent: 20 },
          flipkart: { alternative: "comparing prices at local shops", savingPercent: 20 },
        };

        let alternativeSuggestionAdded = false;
        for (const merchant of topMerchantsConverted) {
          const lowerName = merchant.name.toLowerCase();
          for (const [key, val] of Object.entries(CHEAPER_ALTERNATIVES)) {
            if (lowerName.includes(key)) {
              insights.push(`You spent ${symbol}${merchant.amount.toFixed(2)} at ${merchant.name} this month. Swapping this for ${val.alternative} could save you up to ${val.savingPercent}% on your budget.`);
              alternativeSuggestionAdded = true;
              break;
            }
          }
          if (alternativeSuggestionAdded) break;
        }

        if (!alternativeSuggestionAdded && topMerchantsConverted.length > 0) {
          const topM = topMerchantsConverted[0];
          insights.push(`Your highest spending merchant this month is ${topM.name} with a total of ${symbol}${topM.amount.toFixed(2)}. Setting a cooling-off limit before purchasing can prevent impulse spending.`);
        }

        // Heuristic Rule 3: Subscriptions
        if (subscriptionsConverted.length > 0) {
          const sub = subscriptionsConverted[0];
          insights.push(`We identified a recurring monthly charge of ${symbol}${sub.amount.toFixed(2)} at ${sub.merchantName}. Make sure you are actively using this subscription or cancel to save money.`);
        }

        // Fill in remaining bullets to ensure exactly 3 elements
        if (insights.length < 3) {
          insights.push("Try dividing your budget using the 50-30-20 rule (50% needs, 30% wants, 20% savings) adapted for a student lifestyle.");
        }
        if (insights.length < 3) {
          insights.push("Building an emergency fund of 3-6 months' expenses will provide a financial safety net for unexpected school or personal costs.");
        }
        insights = insights.slice(0, 3);
      }

      insightsCache.set(userId, { contextStr, insights });
    }

    res.json({
      insights,
      subscriptions: subscriptionsConverted,
      topMerchants: topMerchantsConverted,
      categoryBreakdown: categoryBreakdownConverted,
      breaches: breachesConverted,
      totalSpend: totalSpendConverted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
