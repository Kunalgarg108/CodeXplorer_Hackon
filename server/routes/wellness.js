import express from "express";
import User from "../models/User.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { auth } from "../middleware/auth.js";
import getBurnoutAnalysis from "../utils/getBurnoutAnalysis.js";

const router = express.Router();

// GET /api/wellness - get user's wellness profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wellnessProfile: user.wellnessProfile || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/wellness - update user's wellness profile (demographic questionnaire)
router.put("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wellnessProfile = {
      ...user.wellnessProfile?.toObject(),
      ...req.body,
      surveyCompleted: true
    };

    await user.save();
    res.json({ message: "Wellness profile updated", wellnessProfile: user.wellnessProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wellness/checkin - submit daily check-in (sleep, eating, stress history)
router.post("/checkin", auth, async (req, res) => {
  try {
    const { sleepHours, eatingPattern, stressLevel } = req.body;
    if (sleepHours === undefined || !eatingPattern || stressLevel === undefined) {
      return res.status(400).json({ message: "All check-in fields are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wellnessProfile) {
      user.wellnessProfile = {};
    }

    if (!user.wellnessProfile.dailyCheckins) {
      user.wellnessProfile.dailyCheckins = [];
    }

    const todayStr = new Date().toDateString();
    const existingCheckinIdx = user.wellnessProfile.dailyCheckins.findIndex(
      (c) => new Date(c.date).toDateString() === todayStr
    );

    const checkinData = {
      date: new Date(),
      sleepHours: Number(sleepHours),
      eatingPattern,
      stressLevel: Number(stressLevel)
    };

    if (existingCheckinIdx > -1) {
      user.wellnessProfile.dailyCheckins[existingCheckinIdx] = checkinData;
    } else {
      user.wellnessProfile.dailyCheckins.push(checkinData);
    }

    await user.save();
    res.json({ message: "Daily check-in saved", wellnessProfile: user.wellnessProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/wellness/analyze - perform burnout risk analysis
router.get("/analyze", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's wellness profile or construct standard defaults
    const profile = user.wellnessProfile || {
      semester: null,
      examDate: null,
      sleepHours: 6,
      stressEatingPattern: ["Eat less/skip meals"],
      cravingType: [],
      stressLevel: 3,
      studyHours: 6,
      hasJob: false,
      surveyCompleted: false,
      dailyCheckins: []
    };

    // Deeper budget/expense analysis
    const budgets = await Budget.find({ createdBy: req.user.email });
    const budgetIds = budgets.map((b) => b._id);
    const expenses = await Expense.find({ budgetId: { $in: budgetIds } });

    // Identify food budgets (name keywords or food icons)
    const foodBudgetKeywords = ["food", "dining", "grocery", "eat", "restaurant", "cafe", "crave"];
    const foodIcons = ["🍔", "🍕", "🛒", "🍟", "🍲", "🍝", "🍩", "🎂", "🍰", "🍇", "🍉", "🍪"];
    const foodBudgets = budgets.filter(b => 
      foodBudgetKeywords.some(kw => b.name.toLowerCase().includes(kw)) ||
      foodIcons.includes(b.icon)
    );

    const foodBudgetIds = foodBudgets.map(b => b._id.toString());
    
    let totalFoodBudgetLimit = 0;
    foodBudgets.forEach(b => totalFoodBudgetLimit += Number(b.amount) || 0);

    let totalFoodBudgetSpend = 0;
    let copingSpend = 0;
    let examWindowSpend = 0;
    let totalSpend = 0;

    const foodDeliveryKeywords = ["uber eats", "doordash", "grubhub", "zomato", "swiggy", "delivery", "dominos", "pizza", "burger", "mcdonald", "kfc", "junk", "crave"];
    const copingKeywords = ["shop", "amazon", "clothes", "game", "movie", "steam", "bar", "club", "drinks", "netflix", "starbucks", "cafe"];

    const examDateVal = profile.examDate ? new Date(profile.examDate) : null;

    expenses.forEach((e) => {
      totalSpend += e.amount;

      // Food budget spent
      if (foodBudgetIds.includes(e.budgetId.toString())) {
        totalFoodBudgetSpend += e.amount;
      }

      const nameLower = e.name.toLowerCase();

      // Junk / delivery spend
      if (foodDeliveryKeywords.some(kw => nameLower.includes(kw))) {
        copingSpend += e.amount;
      } else if (copingKeywords.some(kw => nameLower.includes(kw))) {
        copingSpend += e.amount;
      }

      // Exam window spend (within 7 days prior to exam)
      if (examDateVal) {
        const expDate = new Date(e.createdAt);
        const diffDays = (examDateVal - expDate) / (1000 * 60 * 60 * 24);
        if (diffDays >= 0 && diffDays <= 7) {
          examWindowSpend += e.amount;
        }
      }
    });

    const financeData = {
      totalFoodBudgetLimit,
      totalFoodBudgetSpend,
      copingSpend,
      examWindowSpend,
      totalSpend
    };

    // Calculate if user has logged stressLevel >= 4 for 3 consecutive check-ins
    const checkins = profile.dailyCheckins || [];
    const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let consecutiveStressDays = 0;
    let maxConsecutiveStressDays = 0;
    let burnoutPhase = false;

    sortedCheckins.forEach((c) => {
      if (c.stressLevel >= 4) {
        consecutiveStressDays++;
        if (consecutiveStressDays > maxConsecutiveStressDays) {
          maxConsecutiveStressDays = consecutiveStressDays;
        }
      } else {
        consecutiveStressDays = 0;
      }
    });

    if (maxConsecutiveStressDays >= 3) {
      burnoutPhase = true;
    }

    // Run burnout analysis combining profile + checkins + finance data + burnout flag
    const analysis = await getBurnoutAnalysis(profile, financeData, { burnoutPhase, maxConsecutiveStressDays });
    
    res.json({
      ...analysis,
      burnoutPhase,
      consecutiveStressDays: maxConsecutiveStressDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
