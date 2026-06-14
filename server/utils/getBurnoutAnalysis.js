import OpenAI from "openai";

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
    todayText = "No check-in logged for today. Update today's update to view metrics.";
  } else if (today.stressLevel <= 2) {
    todayText = "Today looks like a good day — low stress and decent sleep support recovery.";
  } else if (today.stressLevel >= 4) {
    todayText = "Today shows elevated stress. Consider a short break or the 4-7-8 breathing exercise.";
  } else {
    todayText = "Today is a moderate day — keep an eye on sleep and stress levels.";
  }

  let triggerDateStr = wellnessState.triggerDate 
    ? new Date(wellnessState.triggerDate).toLocaleDateString()
    : "recently";

  let recoveryText = "";
  if (wellnessState.burnoutState === "chronic") {
    recoveryText = `Chronic burnout was flagged on ${triggerDateStr} due to sustained high stress. Focus on consistent sleep and stress reduction starting today.`;
  } else if (wellnessState.burnoutState === "recovering") {
    const remaining = Math.max(0, (wellnessState.recoveryDaysRequired || 3) - (wellnessState.recoveryDaysCompleted || 0));
    recoveryText = `Recovering from a high-stress period flagged on ${triggerDateStr}. ${wellnessState.recoveryDaysCompleted || 0}/${wellnessState.recoveryDaysRequired || 3} healthy days logged — ${remaining} more to fully recover.`;
  } else if (wellnessState.burnoutState === "warning") {
    recoveryText = "Stress has been elevated for multiple days. Watch for a developing pattern.";
  } else {
    recoveryText = "No burnout pattern detected — wellness levels look stable.";
  }

  let suggestedAction = "";
  if (wellnessState.burnoutState === "recovering") {
    const remaining = Math.max(0, (wellnessState.recoveryDaysRequired || 3) - (wellnessState.recoveryDaysCompleted || 0));
    suggestedAction = `Keep today's routine going — ${remaining} more day(s) like this and recovery is complete.`;
  } else if (today && today.stressLevel <= 2) {
    suggestedAction = "Try the 4-7-8 breathing exercise to maintain this calm state.";
  } else {
    suggestedAction = "Prioritize 7-8 hours of sleep tonight and avoid stress-eating triggers.";
  }

  const weeklyTrendLabel = computeEWMATrend(history);

  return { todayText, recoveryText, suggestedAction, weeklyTrendLabel };
}

const getBurnoutAnalysis = async (profile, financeData, wellnessState) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  
  const checkins = profile.dailyCheckins || [];
  const todayStr = new Date().toDateString();
  const today = checkins.find(c => new Date(c.date).toDateString() === todayStr);

  let openai = null;
  let modelName = "gpt-4o-mini";

  const isOrKey = (key) => key && key.startsWith("sk-or-v1-");

  if (openRouterKey || isOrKey(openAIKey)) {
    openai = new OpenAI({
      apiKey: openRouterKey || openAIKey,
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true
    });
    modelName = "google/gemini-2.5-flash";
  } else if (openAIKey) {
    openai = new OpenAI({
      apiKey: openAIKey
    });
  }

  if (!openai) {
    return getFallbackAnalysis(today, wellnessState, checkins);
  }

  try {
    const {
      semester = "unknown",
      examDate = "No exams scheduled",
      sleepHours = 6,
      stressEatingPattern = ["Eat less/skip meals"],
      cravingType = [],
      stressLevel = 3,
      studyHours = 6,
      hasJob = false
    } = profile;

    const {
      totalFoodBudgetLimit = 0,
      totalFoodBudgetSpend = 0,
      copingSpend = 0,
      examWindowSpend = 0,
      totalSpend = 0
    } = financeData || {};

    let daysUntilExam = "No exams scheduled";
    if (examDate && examDate !== "No exams scheduled") {
      const diffTime = new Date(examDate) - new Date();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysUntilExam = days >= 0 ? `${days} days` : "passed";
    }

    const recentCheckinsText = checkins.slice(-7).map(c => 
      `Date: ${new Date(c.date).toDateString()}, Sleep: ${c.sleepHours} hrs, Eating: ${c.eatingPattern}, Stress: ${c.stressLevel}/5`
    ).join("\n");

    const userPrompt = `
      You are an AI wellness companion for college students. Analyze their burnout risk based on the following profile and financial transactions:

      Student Profile:
      - Semester/Year: ${semester}
      - Days until next exam: ${daysUntilExam}
      - Initial sleep profile: ${sleepHours} hrs
      - Stress coping: ${stressEatingPattern.join(", ")}
      - Cravings: ${cravingType.join(", ")}
      - Study/coding hours per day: ${studyHours} hrs
      - Has job: ${hasJob ? "Yes" : "No"}
      - Burnout State Machine:
        - Current State: ${wellnessState.burnoutState}
        - Flagged Date: ${wellnessState.triggerDate ? new Date(wellnessState.triggerDate).toDateString() : "None"}
        - Recovery Progress: ${wellnessState.recoveryDaysCompleted}/${wellnessState.recoveryDaysRequired} healthy days

      Recent Daily Check-ins (Last 7 Days):
      ${recentCheckinsText || "No check-ins submitted yet."}

      Financial & Spending Signals:
      - Total Monthly Spend: $${totalSpend.toFixed(2)} USD
      - Food Budget Limit: $${totalFoodBudgetLimit.toFixed(2)} USD, Food Budget Spent: $${totalFoodBudgetSpend.toFixed(2)} USD
      - Coping/Junk Food & Shopping Spend: $${copingSpend.toFixed(2)} USD
      - Spending Spike in Exam Prep Window: $${examWindowSpend.toFixed(2)} USD

      Analyze their stress levels, coping mechanisms (like emotional spending or skipping meals), and sleep quality.
      Provide the response strictly in JSON format with exactly four fields:
      "todayText": a 1-line summary of today's state (e.g. "Today's check-in shows high stress and low sleep.")
      "recoveryText": a description of their multi-day recovery or burnout phase (e.g. "Recovering from chronic burnout. 2/3 healthy days logged.")
      "suggestedAction": a single actionable wellness or spending recommendation.
      "weeklyTrendLabel": strictly one of: "Improving", "Stable", "Worsening".

      Format:
      {
        "todayText": "...",
        "recoveryText": "...",
        "suggestedAction": "...",
        "weeklyTrendLabel": "Improving/Stable/Worsening"
      }
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: userPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const content = chatCompletion.choices[0].message.content;
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      source: "AI Analysis"
    };
  } catch (error) {
    console.error("Error generating burnout analysis from LLM:", error);
    const fallbackVal = getFallbackAnalysis(today, wellnessState, checkins);
    return {
      ...fallbackVal,
      source: "Quick Analysis"
    };
  }
};

export default getBurnoutAnalysis;
