import express from "express";
import OpenAI from "openai";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Step 3: Score menu items based on financial + wellness context.
 * Food selection happens HERE in application logic — NOT in AI.
 */
const scoreMenuItems = (menuItems, financialCtx, wellnessCtx) => {
  const { remainingBudget, dailyBudget } = financialCtx;
  const {
    stressLevel = 3,
    sleepHours = 7,
    studyHours = 6,
    examDate = null,
    stressEatingPattern = [],
    cravingType = [],
  } = wellnessCtx;

  // Determine exam proximity
  let daysUntilExam = null;
  if (examDate) {
    daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  }
  const isExamWeek = daysUntilExam !== null && daysUntilExam >= 0 && daysUntilExam <= 7;
  const isHighStress = stressLevel >= 4;
  const isPoorSleep = sleepHours < 6;
  const isStressEater = stressEatingPattern.some((p) =>
    ["Binged", "Eat more junk", "Eat more"].includes(p)
  );

  // Food category classification
  const energyFoods = ["juice", "smoothie", "fruit", "banana", "oats", "idli", "poha", "upma", "salad", "egg"];
  const comfortFoods = ["sandwich", "burger", "pizza", "noodle", "pasta", "maggi", "fries", "wrap", "roll", "momos"];
  const lightFoods = ["salad", "soup", "juice", "tea", "coffee", "fruit", "idli", "poha", "upma", "toast"];
  const sustainingFoods = ["thali", "rice", "dal", "roti", "biryani", "meal", "combo", "dosa", "paratha"];
  const sweetFoods = ["chocolate", "cake", "ice cream", "dessert", "sweet", "shake", "lassi", "kulfi"];

  const matchesCategory = (item, keywords) => {
    const nameLower = (item.name || "").toLowerCase();
    const catLower = (item.category || "").toLowerCase();
    return keywords.some((k) => nameLower.includes(k) || catLower.includes(k));
  };

  return menuItems.map((item) => {
    let budgetScore = 0;
    let wellnessScore = 0;

    // BUDGET SCORING (0–50)
    if (item.price <= dailyBudget * 0.3) {
      budgetScore = 50; // Very cheap
    } else if (item.price <= dailyBudget * 0.5) {
      budgetScore = 42;
    } else if (item.price <= dailyBudget * 0.75) {
      budgetScore = 32;
    } else if (item.price <= dailyBudget) {
      budgetScore = 22;
    } else if (item.price <= dailyBudget * 1.5) {
      budgetScore = 12;
    } else {
      budgetScore = 5;
    }

    // WELLNESS SCORING (0–50)
    if (isExamWeek) {
      if (matchesCategory(item, energyFoods)) wellnessScore = 48;
      else if (matchesCategory(item, sustainingFoods)) wellnessScore = 40;
      else if (matchesCategory(item, lightFoods)) wellnessScore = 35;
      else wellnessScore = 18;
    } else if (isHighStress) {
      if (matchesCategory(item, comfortFoods)) wellnessScore = 42;
      else if (matchesCategory(item, lightFoods)) wellnessScore = 35;
      else wellnessScore = 20;
    } else if (isPoorSleep) {
      if (matchesCategory(item, lightFoods)) wellnessScore = 45;
      else if (matchesCategory(item, energyFoods)) wellnessScore = 40;
      else wellnessScore = 18;
    } else if (isStressEater) {
      // Prefer healthier alternatives
      if (matchesCategory(item, lightFoods)) wellnessScore = 42;
      else if (matchesCategory(item, energyFoods)) wellnessScore = 38;
      else wellnessScore = 20;
    } else {
      // Normal state — balanced scoring
      wellnessScore = 28;
      if (matchesCategory(item, sustainingFoods)) wellnessScore = 35;
      else if (matchesCategory(item, energyFoods)) wellnessScore = 32;
    }

    // Craving bonus (up to +8)
    if (cravingType.length > 0) {
      const hasCravingMatch = cravingType.some((c) => {
        const cl = c.toLowerCase();
        return (item.name || "").toLowerCase().includes(cl) || (item.category || "").toLowerCase().includes(cl);
      });
      if (hasCravingMatch) wellnessScore = Math.min(50, wellnessScore + 8);
    }

    const totalScore = Math.min(100, budgetScore + wellnessScore);

    return {
      name: item.name,
      price: item.price,
      category: item.category,
      restaurant: item.restaurant,
      score: totalScore,
      budgetScore,
      wellnessScore,
    };
  });
};

router.get("/", auth, async (req, res) => {
  try {
    // Step 1: Fetch restaurant menu items from MongoDB
    const restaurants = await Restaurant.find({});
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

    // If no scanned menus exist, return empty
    if (menuItems.length === 0) {
      return res.json({
        recommendations: [],
        explanation: null,
        message: "Please scan a restaurant menu first to receive personalized food recommendations.",
      });
    }

    // Fetch user's financial data
    const budgets = await Budget.find({ createdBy: req.user.email });
    const budgetIds = budgets.map((b) => b._id);
    const expenses = await Expense.find({ budgetId: { $in: budgetIds } }).sort({ _id: -1 }).limit(100);
    const user = await User.findOne({ email: req.user.email }).select("wellnessProfile");

    // Calculate financial context
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = Math.max(0, totalBudgetLimit - totalSpent);
    const dailyBudget = totalBudgetLimit > 0 ? totalBudgetLimit / 30 : 200; // fallback ₹200/day

    const financialCtx = { totalBudgetLimit, totalSpent, remainingBudget, dailyBudget };

    // Wellness context
    const wellness = user?.wellnessProfile || {};
    const wellnessCtx = {
      stressLevel: wellness.stressLevel || 3,
      sleepHours: wellness.sleepHours || 7,
      studyHours: wellness.studyHours || 6,
      examDate: wellness.examDate || null,
      stressEatingPattern: wellness.stressEatingPattern || [],
      cravingType: wellness.cravingType || [],
      hasJob: wellness.hasJob || false,
    };

    // Step 2: Filter items that fit within remaining budget
    const affordableItems = menuItems.filter((item) => item.price <= remainingBudget);

    if (affordableItems.length === 0) {
      return res.json({
        recommendations: [],
        explanation: "Your remaining budget is too low for any scanned menu items. Consider adding more to your budget.",
        message: "No affordable items found within your remaining budget.",
      });
    }

    // Step 3 & 4: Score and rank items
    const scored = scoreMenuItems(affordableItems, financialCtx, wellnessCtx);
    const ranked = scored.sort((a, b) => b.score - a.score).slice(0, 8);

    // Step 5: Send ONLY ranked items to AI for explanation generation
    let explanation = null;
    const isPlaceholderKey = (key) => !key || key.trim() === "" || key.startsWith("your-") || key.includes("placeholder");
    const rawKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const apiKey = isPlaceholderKey(rawKey) ? null : rawKey;

    if (apiKey && ranked.length > 0) {
      try {
        const openai = new OpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });

        // Determine wellness state description
        let wellnessState = "Normal wellness state";
        const daysUntilExam = wellnessCtx.examDate
          ? Math.ceil((new Date(wellnessCtx.examDate) - new Date()) / (1000 * 60 * 60 * 24))
          : null;
        if (daysUntilExam !== null && daysUntilExam >= 0 && daysUntilExam <= 7) {
          wellnessState = `Exam in ${daysUntilExam} days`;
        } else if (wellnessCtx.stressLevel >= 4) {
          wellnessState = "High stress (${wellnessCtx.stressLevel}/5)";
        } else if (wellnessCtx.sleepHours < 6) {
          wellnessState = `Poor sleep (${wellnessCtx.sleepHours} hrs)`;
        }

        const prompt = `You are Pocket Buddy, a student food advisor. Generate a short reason (1 sentence max) for each recommended menu item explaining why it's suitable for this student.

Student Context:
- Remaining Budget: $${remainingBudget}
- Daily Budget: $${Math.round(dailyBudget)}
- Stress Level: ${wellnessCtx.stressLevel}/5
- Sleep: ${wellnessCtx.sleepHours} hrs
- Wellness State: ${wellnessState}
- Study Hours: ${wellnessCtx.studyHours} hrs/day

Ranked Menu Items (from database, scored by our algorithm):
${ranked.map((r, i) => `${i + 1}. ${r.name} – $${r.price} (${r.category}) [Score: ${r.score}/100]`).join("\n")}

For each item, write exactly ONE short reason (under 15 words) explaining why it's recommended considering budget + wellness. 
Return ONLY a JSON array of strings (one reason per item, same order).
Example: ["Affordable and energy-boosting for exam prep.", "Budget-friendly comfort food for stress relief."]
No markdown, no extra text.`;

        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.5,
        });

        const content = completion.choices[0].message.content.trim();
        let reasons;
        try {
          reasons = JSON.parse(content);
        } catch {
          const match = content.match(/\[[\s\S]*\]/);
          if (match) reasons = JSON.parse(match[0]);
        }

        // Attach reasons to ranked items
        if (Array.isArray(reasons)) {
          ranked.forEach((item, i) => {
            item.reason = reasons[i] || "Recommended based on your budget and wellness profile.";
          });
        }
      } catch (aiError) {
        console.error("AI explanation failed:", aiError.message);
        // Fallback: generate simple reasons without AI
        ranked.forEach((item) => {
          item.reason = item.score >= 80
            ? "Top pick — very affordable and suits your wellness needs."
            : item.score >= 60
            ? "Good balance of price and suitability."
            : "Budget-friendly option within your spending range.";
        });
      }
    } else {
      // No API key — use fallback reasons
      ranked.forEach((item) => {
        item.reason = item.score >= 80
          ? "Top pick — very affordable and suits your wellness needs."
          : item.score >= 60
          ? "Good balance of price and suitability."
          : "Budget-friendly option within your spending range.";
      });
    }

    res.json({
      recommendations: ranked,
      context: {
        remainingBudget,
        dailyBudget: Math.round(dailyBudget),
        stressLevel: wellnessCtx.stressLevel,
        sleepHours: wellnessCtx.sleepHours,
        totalMenuItems: menuItems.length,
        affordableCount: affordableItems.length,
      },
    });
  } catch (error) {
    console.error("Food recommendations error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
