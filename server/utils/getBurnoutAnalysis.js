import { chatCompletion, isAIConfigured } from "./aiClient.js";

export function computeEWMATrend(history) {
  if (!history || history.length < 2) return "Stable";
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const checkins = sorted.slice(-7);
  if (checkins.length < 2) return "Stable";
  const alpha = 0.3;
  let ewma = checkins[0].stressLevel;
  let prevEwma = ewma;
  for (let i = 1; i < checkins.length; i++) {
    prevEwma = ewma;
    ewma = alpha * checkins[i].stressLevel + (1 - alpha) * ewma;
  }
  const diff = ewma - prevEwma;
  if (diff < -0.15) return "Improving";
  if (diff > 0.15) return "Worsening";
  return "Stable";
}

export function getFallbackAnalysis(today, wellnessState, history) {
  let todayText = "";
  if (!today) {
    todayText = "No check-in logged for today. Submit a check-in to view metrics.";
  } else if (today.stressLevel <= 2) {
    todayText = "Today looks good — low stress supports recovery.";
  } else if (today.stressLevel >= 4) {
    todayText = "Today shows elevated stress. Consider a short break or breathing exercise.";
  } else {
    todayText = "Today is moderate — keep an eye on sleep and stress levels.";
  }

  let triggerDateStr = wellnessState.triggerDate ? new Date(wellnessState.triggerDate).toLocaleDateString() : "recently";
  let recoveryText = "";
  if (wellnessState.burnoutState === "chronic") {
    recoveryText = `Chronic burnout flagged on ${triggerDateStr}. Focus on consistent sleep and stress reduction.`;
  } else if (wellnessState.burnoutState === "recovering") {
    const remaining = Math.max(0, (wellnessState.recoveryDaysRequired || 3) - (wellnessState.recoveryDaysCompleted || 0));
    recoveryText = `Recovering from high stress. ${wellnessState.recoveryDaysCompleted || 0}/${wellnessState.recoveryDaysRequired || 3} healthy days — ${remaining} more to recover.`;
  } else if (wellnessState.burnoutState === "warning") {
    recoveryText = "Stress has been elevated. Watch for a developing pattern.";
  } else {
    recoveryText = "No burnout pattern detected — wellness levels look stable.";
  }

  let suggestedAction = "";
  if (wellnessState.burnoutState === "recovering") {
    const remaining = Math.max(0, (wellnessState.recoveryDaysRequired || 3) - (wellnessState.recoveryDaysCompleted || 0));
    suggestedAction = `Keep going — ${remaining} more healthy day(s) and recovery is complete.`;
  } else if (today && today.stressLevel <= 2) {
    suggestedAction = "Try the 4-7-8 breathing exercise to maintain this calm state.";
  } else {
    suggestedAction = "Prioritize 7-8 hours of sleep tonight and avoid stress-eating triggers.";
  }

  return { todayText, recoveryText, suggestedAction, weeklyTrendLabel: computeEWMATrend(history) };
}

const getBurnoutAnalysis = async (profile, financeData, wellnessState, symbol = "$") => {
  const checkins = profile.dailyCheckins || [];
  const todayStr = new Date().toDateString();
  const today = checkins.find(c => new Date(c.date).toDateString() === todayStr);

  if (!isAIConfigured()) {
    return { ...getFallbackAnalysis(today, wellnessState, checkins), source: "Quick Analysis" };
  }

  try {
    const { semester = "unknown", examDate = "No exams scheduled", sleepHours = 6, stressEatingPattern = [], studyHours = 6, hasJob = false } = profile;
    const { totalFoodBudgetSpend = 0, copingSpend = 0, totalSpend = 0 } = financeData || {};

    let daysUntilExam = "No exams scheduled";
    if (examDate && examDate !== "No exams scheduled") {
      const days = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
      daysUntilExam = days >= 0 ? `${days} days` : "passed";
    }

    const recentCheckinsText = checkins.slice(-7).map(c =>
      `${new Date(c.date).toDateString()}: Sleep ${c.sleepHours}hrs, Eating: ${c.eatingPattern}, Stress: ${c.stressLevel}/5`
    ).join("\n");

    const userPrompt = `You are an AI wellness companion. Analyze burnout risk:

Profile: Semester ${semester}, Exam in ${daysUntilExam}, Sleep ${sleepHours}hrs, Study ${studyHours}hrs/day, Job: ${hasJob ? "Yes" : "No"}
Burnout State: ${wellnessState.burnoutState}, Recovery: ${wellnessState.recoveryDaysCompleted}/${wellnessState.recoveryDaysRequired} days
Spending: Total ${symbol}${totalSpend.toFixed(0)}, Food ${symbol}${totalFoodBudgetSpend.toFixed(0)}, Coping ${symbol}${copingSpend.toFixed(0)}

Recent Check-ins:
${recentCheckinsText || "None"}

Respond in JSON:
{"todayText":"1-line today summary","recoveryText":"burnout/recovery status","suggestedAction":"1 actionable tip","weeklyTrendLabel":"Improving/Stable/Worsening"}`;

    const content = await chatCompletion(
      [{ role: "user", content: userPrompt }],
      { maxTokens: 400, jsonMode: true }
    );

    if (!content) {
      return { ...getFallbackAnalysis(today, wellnessState, checkins), source: "Quick Analysis" };
    }

    // Safely parse JSON — handle markdown fencing or extra whitespace
    let parsed;
    try {
      parsed = JSON.parse(content.trim());
    } catch {
      // Try extracting JSON object from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return { ...getFallbackAnalysis(today, wellnessState, checkins), source: "Quick Analysis" };
      }
    }
    return { ...parsed, source: "AI Analysis" };
  } catch (error) {
    console.error("Error generating burnout analysis:", error.message);
    return { ...getFallbackAnalysis(today, wellnessState, checkins), source: "Quick Analysis" };
  }
};

export default getBurnoutAnalysis;
