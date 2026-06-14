import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { chatCompletion, isAIConfigured, getTextModel } from "../utils/aiClient.js";

const router = express.Router();

const buildFinancialContext = async (email) => {
  const budgets = await Budget.find({ createdBy: email });
  const budgetIds = budgets.map((b) => b._id);
  const [userExpenses, incomes, restaurants, user] = await Promise.all([
    Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 }).limit(100),
    Income.find({ createdBy: email }),
    Restaurant.find({}),
    User.findOne({ email }).select("wellnessProfile name"),
  ]);

  const budgetSummaries = budgets.map((b) => {
    const exps = userExpenses.filter((e) => e.budgetId.toString() === b._id.toString());
    const totalSpend = exps.reduce((sum, e) => sum + e.amount, 0);
    const amount = Number(b.amount) || 0;
    return {
      name: b.name, icon: b.icon, limit: amount, spent: totalSpend, remaining: amount - totalSpend,
      utilizationPercent: amount > 0 ? Math.round((totalSpend / amount) * 100) : 0,
      recentExpenses: exps.slice(0, 5).map((e) => ({ name: e.name, amount: e.amount })),
    };
  });

  const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalBudgetLimit = budgetSummaries.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetSummaries.reduce((sum, b) => sum + b.spent, 0);

  const menuItems = [];
  for (const r of restaurants) {
    for (const item of r.items || []) {
      menuItems.push({ name: item.name, price: item.price, category: item.category, restaurant: r.restaurant_name });
    }
  }
  menuItems.sort((a, b) => a.price - b.price);

  const wellness = user?.wellnessProfile;
  let wellnessSummary = null;
  if (wellness?.surveyCompleted) {
    wellnessSummary = { sleepHours: wellness.sleepHours, stressLevel: wellness.stressLevel, studyHours: wellness.studyHours, hasJob: wellness.hasJob, stressEatingPattern: wellness.stressEatingPattern };
  }

  return { studentName: user?.name || "Student", totalIncome, totalBudgetLimit, totalSpent, totalRemaining: totalBudgetLimit - totalSpent, budgets: budgetSummaries, menuItems, wellnessSummary };
};

router.post("/", auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    if (!isAIConfigured()) {
      return res.json({ reply: "AI not configured. Set OPENAI_API_KEY, OPENAI_BASE_URL, and BEDROCK_MODEL_ID in .env." });
    }

    const context = await buildFinancialContext(req.user.email);

    let menuSection = context.menuItems.length > 0
      ? `SCANNED MENU ITEMS (from database):\n${context.menuItems.map((m) => `• ${m.name} – $${m.price} (${m.category}) [${m.restaurant}]`).join("\n")}`
      : "NO SCANNED MENU DATA. Tell user to scan a menu first.";

    const systemPrompt = `You are Pocket Buddy, an AI Financial Assistant for students.

CONTEXT FOR ${context.studentName}:
- Income: $${context.totalIncome}, Budget: $${context.totalBudgetLimit}, Spent: $${context.totalSpent}, Remaining: $${context.totalRemaining}

BUDGETS:
${context.budgets.map((b) => `• ${b.icon} ${b.name}: $${b.limit} limit, $${b.spent} spent, $${b.remaining} left (${b.utilizationPercent}%)`).join("\n") || "None"}

${menuSection}

${context.wellnessSummary ? `WELLNESS: Sleep ${context.wellnessSummary.sleepHours}hrs, Stress ${context.wellnessSummary.stressLevel}/5, Study ${context.wellnessSummary.studyHours}hrs` : ""}

RULES: Use $ for currency. Only recommend menu items from data above. Never invent items. Be concise (2-4 sentences). Be empathetic.`;

    console.log(`[Chat] Using TEXT MODEL: ${getTextModel()} via ${process.env.OPENAI_BASE_URL}`);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: "user", content: message },
    ];

    const reply = await chatCompletion(messages, { maxTokens: 1024, temperature: 0.7 });
    res.json({ reply: reply || "I'm having trouble right now. Please try again." });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.json({ reply: "I'm having trouble connecting right now. Please try again." });
  }
});

export default router;
