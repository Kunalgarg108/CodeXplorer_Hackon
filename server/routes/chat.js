import express from "express";
import OpenAI from "openai";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Build financial context from the user's real data
const buildFinancialContext = async (email) => {
  // Fetch user's budgets first
  const budgets = await Budget.find({ createdBy: email });
  const budgetIds = budgets.map((b) => b._id);

  // Fetch only user's expenses (filtered by their budget IDs)
  const [userExpenses, incomes, restaurants, user] = await Promise.all([
    Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 }).limit(100),
    Income.find({ createdBy: email }),
    Restaurant.find({}),
    User.findOne({ email }).select("wellnessProfile name"),
  ]);

  // Budget summaries
  const budgetSummaries = budgets.map((b) => {
    const budgetExpenses = userExpenses.filter(
      (e) => e.budgetId.toString() === b._id.toString()
    );
    const totalSpend = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
    const amount = Number(b.amount) || 0;
    const remaining = amount - totalSpend;
    return {
      name: b.name,
      icon: b.icon,
      limit: amount,
      spent: totalSpend,
      remaining,
      utilizationPercent: amount > 0 ? Math.round((totalSpend / amount) * 100) : 0,
      recentExpenses: budgetExpenses.slice(0, 5).map((e) => ({
        name: e.name,
        amount: e.amount,
      })),
    };
  });

  // Income summary
  const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Totals
  const totalBudgetLimit = budgetSummaries.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetSummaries.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgetLimit - totalSpent;

  // Menu items from REAL scanned restaurant data (all restaurants in DB)
  const menuItems = [];
  for (const restaurant of restaurants) {
    for (const item of restaurant.items || []) {
      menuItems.push({
        name: item.name,
        price: item.price,
        category: item.category,
        restaurant: restaurant.restaurant_name,
      });
    }
  }

  // Sort by price ascending for affordable-first recommendations
  menuItems.sort((a, b) => a.price - b.price);

  // Wellness data
  const wellness = user?.wellnessProfile || null;
  let wellnessSummary = null;
  if (wellness && wellness.surveyCompleted) {
    wellnessSummary = {
      sleepHours: wellness.sleepHours,
      stressLevel: wellness.stressLevel,
      studyHours: wellness.studyHours,
      hasJob: wellness.hasJob,
      stressEatingPattern: wellness.stressEatingPattern,
    };
  }

  return {
    studentName: user?.name || "Student",
    totalIncome,
    totalBudgetLimit,
    totalSpent,
    totalRemaining,
    budgets: budgetSummaries,
    menuItems,
    wellnessSummary,
  };
};

router.post("/", auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "AI assistant is not configured. Please add OPENROUTER_API_KEY or OPENAI_API_KEY to server .env file.",
      });
    }

    // Build context from user's REAL financial data
    const context = await buildFinancialContext(req.user.email);

    // Build the menu section from real scanned data
    let menuSection = "";
    if (context.menuItems.length > 0) {
      menuSection = `SCANNED RESTAURANT MENU ITEMS (real data from Menu Scanner, sorted by price):
${context.menuItems.map((m) => `• ${m.name} – ₹${m.price} (${m.category}) [${m.restaurant}]`).join("\n")}

Total menu items available: ${context.menuItems.length}`;
    } else {
      menuSection = "NO SCANNED MENU DATA AVAILABLE. The user has not scanned any restaurant menus yet. Tell them to use the Menu Scanner to scan a menu first if they ask about food options.";
    }

    const systemPrompt = `You are Pocket Buddy, an AI Financial Assistant for college students.

CURRENT FINANCIAL CONTEXT FOR ${context.studentName}:
- Total Monthly Income: ₹${context.totalIncome}
- Total Budget Limit: ₹${context.totalBudgetLimit}
- Total Spent So Far: ₹${context.totalSpent}
- Total Remaining: ₹${context.totalRemaining}

BUDGET BREAKDOWN:
${context.budgets.length > 0 ? context.budgets.map((b) => `• ${b.icon} ${b.name}: Limit ₹${b.limit}, Spent ₹${b.spent}, Remaining ₹${b.remaining} (${b.utilizationPercent}% used)${b.recentExpenses.length > 0 ? `\n  Recent expenses: ${b.recentExpenses.map((e) => `${e.name} ₹${e.amount}`).join(", ")}` : ""}`).join("\n") : "No budgets created yet."}

${menuSection}

${context.wellnessSummary ? `WELLNESS CONTEXT:
- Sleep: ${context.wellnessSummary.sleepHours} hrs/night
- Stress Level: ${context.wellnessSummary.stressLevel}/5
- Study Hours: ${context.wellnessSummary.studyHours} hrs/day
- Has Part-time Job: ${context.wellnessSummary.hasJob ? "Yes" : "No"}
- Stress Eating: ${context.wellnessSummary.stressEatingPattern.join(", ")}` : ""}

CRITICAL INSTRUCTIONS:
1. Always use ₹ (Indian Rupees) for currency.
2. When recommending food: Use ONLY the scanned menu items listed above. NEVER invent or hallucinate food items, prices, or restaurant names.
3. If no menu data is available, tell the user to scan a restaurant menu first using the Menu Scanner feature.
4. When the student mentions a remaining budget, filter the menu items above that fit within their budget and recommend the cheapest options first.
5. Always mention the exact item name and price from the data above.
6. Prioritize cheaper items to help the student stay within budget.
7. Give concise, actionable advice (2-4 sentences unless asked for detail).
8. Be empathetic about student life and financial constraints.
9. Reference their actual budget names, spending amounts, and remaining amounts.
10. If asked about wellness/stress, combine financial and wellness advice.
11. DO NOT use hardcoded examples. DO NOT invent food items. ONLY reference real data provided above.`;

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    // Build messages with conversation history (last 10 for memory)
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: "user", content: message },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message || error);
    res.json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
});

export default router;
