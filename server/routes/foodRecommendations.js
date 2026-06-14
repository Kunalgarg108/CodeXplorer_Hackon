import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { chatCompletion, isAIConfigured } from "../utils/aiClient.js";

const router = express.Router();

const scoreMenuItems = (menuItems, financialCtx, wellnessCtx) => {
  const { dailyBudget } = financialCtx;
  const { stressLevel = 3, sleepHours = 7, examDate = null, stressEatingPattern = [], cravingType = [] } = wellnessCtx;

  let daysUntilExam = null;
  if (examDate) daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isExamWeek = daysUntilExam !== null && daysUntilExam >= 0 && daysUntilExam <= 7;
  const isHighStress = stressLevel >= 4;
  const isPoorSleep = sleepHours < 6;
  const isStressEater = stressEatingPattern.some((p) => ["Binged", "Eat more junk", "Eat more"].includes(p));

  const energyFoods = ["juice", "smoothie", "fruit", "banana", "oats", "idli", "poha", "upma", "salad", "egg"];
  const comfortFoods = ["sandwich", "burger", "pizza", "noodle", "pasta", "fries", "wrap", "roll", "momos"];
  const lightFoods = ["salad", "soup", "juice", "tea", "coffee", "fruit", "idli", "poha", "upma", "toast"];
  const sustainingFoods = ["thali", "rice", "dal", "roti", "biryani", "meal", "combo", "dosa", "paratha"];

  const matches = (item, keywords) => {
    const n = (item.name || "").toLowerCase();
    const c = (item.category || "").toLowerCase();
    return keywords.some((k) => n.includes(k) || c.includes(k));
  };

  return menuItems.map((item) => {
    let budgetScore = 0, wellnessScore = 0;

    if (item.price <= dailyBudget * 0.3) budgetScore = 50;
    else if (item.price <= dailyBudget * 0.5) budgetScore = 42;
    else if (item.price <= dailyBudget * 0.75) budgetScore = 32;
    else if (item.price <= dailyBudget) budgetScore = 22;
    else if (item.price <= dailyBudget * 1.5) budgetScore = 12;
    else budgetScore = 5;

    if (isExamWeek) { wellnessScore = matches(item, energyFoods) ? 48 : matches(item, sustainingFoods) ? 40 : matches(item, lightFoods) ? 35 : 18; }
    else if (isHighStress) { wellnessScore = matches(item, comfortFoods) ? 42 : matches(item, lightFoods) ? 35 : 20; }
    else if (isPoorSleep) { wellnessScore = matches(item, lightFoods) ? 45 : matches(item, energyFoods) ? 40 : 18; }
    else if (isStressEater) { wellnessScore = matches(item, lightFoods) ? 42 : matches(item, energyFoods) ? 38 : 20; }
    else { wellnessScore = matches(item, sustainingFoods) ? 35 : matches(item, energyFoods) ? 32 : 28; }

    if (cravingType.length > 0 && cravingType.some((c) => (item.name || "").toLowerCase().includes(c.toLowerCase()))) {
      wellnessScore = Math.min(50, wellnessScore + 8);
    }

    return { name: item.name, price: item.price, category: item.category, restaurant: item.restaurant, score: Math.min(100, budgetScore + wellnessScore), budgetScore, wellnessScore };
  });
};

router.get("/", auth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    const menuItems = [];
    for (const r of restaurants) for (const item of r.items || []) menuItems.push({ name: item.name, price: item.price, category: item.category, restaurant: r.restaurant_name });

    if (menuItems.length === 0) return res.json({ recommendations: [], message: "Please scan a restaurant menu first." });

    const budgets = await Budget.find({ createdBy: req.user.email });
    const budgetIds = budgets.map((b) => b._id);
    const expenses = await Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 }).limit(100);
    const user = await User.findOne({ email: req.user.email }).select("wellnessProfile");

    const totalBudgetLimit = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = Math.max(0, totalBudgetLimit - totalSpent);
    const dailyBudget = totalBudgetLimit > 0 ? totalBudgetLimit / 30 : 200;

    const wellness = user?.wellnessProfile || {};
    const wellnessCtx = { stressLevel: wellness.stressLevel || 3, sleepHours: wellness.sleepHours || 7, examDate: wellness.examDate || null, stressEatingPattern: wellness.stressEatingPattern || [], cravingType: wellness.cravingType || [] };

    const affordableItems = menuItems.filter((item) => item.price <= remainingBudget);
    if (affordableItems.length === 0) return res.json({ recommendations: [], message: "No affordable items within your remaining budget." });

    const ranked = scoreMenuItems(affordableItems, { remainingBudget, dailyBudget }, wellnessCtx).sort((a, b) => b.score - a.score).slice(0, 8);

    // AI explanations
    if (isAIConfigured() && ranked.length > 0) {
      try {
        const prompt = `For each menu item, write ONE short reason (under 15 words) why it's recommended for a student with stress ${wellnessCtx.stressLevel}/5, sleep ${wellnessCtx.sleepHours}hrs, budget $${Math.round(dailyBudget)}/day.

Items:
${ranked.map((r, i) => `${i + 1}. ${r.name} – $${r.price}`).join("\n")}

Return ONLY a JSON array of strings. No markdown.`;

        const content = await chatCompletion([{ role: "user", content: prompt }], { maxTokens: 400 });
        if (content) {
          let reasons;
          try { reasons = JSON.parse(content.trim()); } catch { const m = content.match(/\[[\s\S]*\]/); if (m) reasons = JSON.parse(m[0]); }
          if (Array.isArray(reasons)) ranked.forEach((item, i) => { item.reason = reasons[i] || "Recommended for you."; });
        }
      } catch (e) { console.error("AI explanation failed:", e.message); }
    }

    // Fallback reasons
    ranked.forEach((item) => { if (!item.reason) item.reason = item.score >= 80 ? "Top pick for your budget and wellness." : item.score >= 60 ? "Good balance of price and suitability." : "Budget-friendly option."; });

    res.json({ recommendations: ranked, context: { remainingBudget, dailyBudget: Math.round(dailyBudget), stressLevel: wellnessCtx.stressLevel, sleepHours: wellnessCtx.sleepHours, totalMenuItems: menuItems.length, affordableCount: affordableItems.length } });
  } catch (error) {
    console.error("Food recommendations error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
