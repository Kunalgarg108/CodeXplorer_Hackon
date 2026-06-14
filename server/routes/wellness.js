import express from "express";
import User from "../models/User.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { auth } from "../middleware/auth.js";
import getBurnoutAnalysis from "../utils/getBurnoutAnalysis.js";
import { getWeeklyAnalysis } from "../utils/getWeeklyAnalysis.js";

const router = express.Router();

const burnoutCache = new Map(); // userId -> { contextStr, analysis }
const weeklyWellnessCache = new Map(); // userId -> { contextStr, analysis }

export function updateBurnoutState(history, state = {}) {
  if (!history || history.length === 0) {
    return {
      burnoutState: "normal",
      triggerDate: null,
      recoveryDaysRequired: 3,
      recoveryDaysCompleted: 0
    };
  }

  // Sort history chronologically
  const sortedCheckins = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let burnoutState = "normal";
  let triggerDate = null;
  let recoveryDaysRequired = state.recoveryDaysRequired || 3;
  let recoveryDaysCompleted = 0;

  for (let i = 0; i < sortedCheckins.length; i++) {
    const today = sortedCheckins[i];
    const isHealthyDay = (today.stressLevel <= 2 && today.sleepHours >= 6);
    
    // count trailing days where stressLevel >= 4 up to index i
    let consecutiveBadDays = 0;
    for (let j = i; j >= 0; j--) {
      if (sortedCheckins[j].stressLevel >= 4) {
        consecutiveBadDays++;
      } else {
        break;
      }
    }

    switch (burnoutState) {
      case "normal":
        if (consecutiveBadDays >= 5) {
          burnoutState = "chronic";
          triggerDate = today.date;
          recoveryDaysCompleted = 0;
        } else if (consecutiveBadDays >= 2) {
          burnoutState = "warning";
        }
        break;

      case "warning":
        if (consecutiveBadDays >= 5) {
          burnoutState = "chronic";
          triggerDate = today.date;
          recoveryDaysCompleted = 0;
        } else if (consecutiveBadDays === 0) {
          burnoutState = "normal";
        }
        break;

      case "chronic":
        burnoutState = "recovering";
        recoveryDaysCompleted = isHealthyDay ? 1 : 0;
        break;

      case "recovering":
        if (isHealthyDay) {
          recoveryDaysCompleted += 1;
        } else {
          recoveryDaysCompleted = 0;
        }

        if (recoveryDaysCompleted >= recoveryDaysRequired) {
          burnoutState = "normal";
          triggerDate = null;
          recoveryDaysCompleted = 0;
        }
        break;
    }
  }

  return {
    burnoutState,
    triggerDate,
    recoveryDaysRequired,
    recoveryDaysCompleted
  };
}

async function recomputeWellnessState(user) {
  if (!user.wellnessProfile) {
    user.wellnessProfile = {};
  }
  const checkins = user.wellnessProfile.dailyCheckins || [];
  const state = {
    burnoutState: user.wellnessProfile.burnoutState || "normal",
    triggerDate: user.wellnessProfile.triggerDate || null,
    recoveryDaysRequired: user.wellnessProfile.recoveryDaysRequired || 3,
    recoveryDaysCompleted: user.wellnessProfile.recoveryDaysCompleted || 0
  };
  const updatedState = updateBurnoutState(checkins, state);
  
  user.wellnessProfile.burnoutState = updatedState.burnoutState;
  user.wellnessProfile.triggerDate = updatedState.triggerDate;
  user.wellnessProfile.recoveryDaysRequired = updatedState.recoveryDaysRequired;
  user.wellnessProfile.recoveryDaysCompleted = updatedState.recoveryDaysCompleted;
  
  user.markModified("wellnessProfile");
  await user.save();
}

// GET /api/wellness - get user's wellness profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await recomputeWellnessState(user);
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
    await recomputeWellnessState(user);
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

    await recomputeWellnessState(user);
    res.json({ message: "Daily check-in saved", wellnessProfile: user.wellnessProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wellness/resolve-burnout - resolve current burnout phase
router.post("/resolve-burnout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wellnessProfile) {
      user.wellnessProfile = {};
    }

    user.wellnessProfile.lastResolvedBurnout = new Date();
    await user.save();

    res.json({
      message: "Burnout phase resolved",
      lastResolvedBurnout: user.wellnessProfile.lastResolvedBurnout
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/wellness/analyze - perform burnout risk analysis
router.get("/analyze", auth, async (req, res) => {
  try {
    const currencyCode = req.query.currency || "USD";
    const { rates } = getExchangeRates();
    const rate = rates[currencyCode] || 1;
    const symbol = getCurrencySymbol(currencyCode);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await recomputeWellnessState(user);

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
      lastResolvedBurnout: null,
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
      totalFoodBudgetLimit: totalFoodBudgetLimit * rate,
      totalFoodBudgetSpend: totalFoodBudgetSpend * rate,
      copingSpend: copingSpend * rate,
      examWindowSpend: examWindowSpend * rate,
      totalSpend: totalSpend * rate
    };

    // Calculate trailing consecutive days where stressLevel >= 4
    const checkins = profile.dailyCheckins || [];
    const sortedAllCheckins = [...checkins].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let consecutiveStressDays = 0;
    for (let j = sortedAllCheckins.length - 1; j >= 0; j--) {
      if (sortedAllCheckins[j].stressLevel >= 4) {
        consecutiveStressDays++;
      } else {
        break;
      }
    }

    const wellnessState = {
      burnoutState: profile.burnoutState || "normal",
      triggerDate: profile.triggerDate || null,
      recoveryDaysRequired: profile.recoveryDaysRequired || 3,
      recoveryDaysCompleted: profile.recoveryDaysCompleted || 0
    };

    const context = {
      semester: profile.semester || "unknown",
      examDate: profile.examDate || null,
      sleepHours: profile.sleepHours || 6,
      studyHours: profile.studyHours || 6,
      hasJob: profile.hasJob || false,
      checkinsCount: profile.dailyCheckins?.length || 0,
      lastCheckin: profile.dailyCheckins?.length > 0 ? profile.dailyCheckins[profile.dailyCheckins.length - 1] : null,
      financeData,
      wellnessState
    };
    const currentContextStr = `${currencyCode}_${JSON.stringify(context)}`;
    const userId = req.user.id;
    const cached = burnoutCache.get(userId);

    let analysis;
    if (cached && cached.contextStr === currentContextStr) {
      analysis = cached.analysis;
    } else {
      analysis = await getBurnoutAnalysis(profile, financeData, wellnessState, symbol);
      burnoutCache.set(userId, { contextStr: currentContextStr, analysis });
    }
    
    res.json({
      ...analysis,
      burnoutState: wellnessState.burnoutState,
      triggerDate: wellnessState.triggerDate,
      recoveryDaysRequired: wellnessState.recoveryDaysRequired,
      recoveryDaysCompleted: wellnessState.recoveryDaysCompleted,
      consecutiveStressDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/wellness/weekly - perform weekly wellness report analysis
router.get("/weekly", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const checkins = user.wellnessProfile?.dailyCheckins || [];
    if (checkins.length === 0) {
      return res.json({
        summary: "No daily check-ins submitted yet. Check in from your Dashboard page to generate a weekly wellness report!",
        trendDirection: "flat",
        trendPercentage: 0,
        source: "Quick Analysis"
      });
    }

    const context = {
      checkinsCount: checkins.length,
      lastCheckin: checkins.length > 0 ? checkins[checkins.length - 1] : null
    };
    const currentContextStr = JSON.stringify(context);
    const userId = req.user.id;
    const cached = weeklyWellnessCache.get(userId);

    let analysis;
    if (cached && cached.contextStr === currentContextStr) {
      analysis = cached.analysis;
    } else {
      analysis = await getWeeklyAnalysis(checkins);
      weeklyWellnessCache.set(userId, { contextStr: currentContextStr, analysis });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
