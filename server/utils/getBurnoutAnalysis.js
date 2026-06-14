import OpenAI from "openai";

const fallbackBurnoutAnalysis = (profile, financeData, burnoutInfo) => {
  let riskLevel = "Low";
  let reason = "Your lifestyle and spending metrics look stable and balanced.";
  let tip = "Keep up the good habits! Try to maintain a regular sleep schedule.";

  const {
    semester = null,
    examDate = null,
    sleepHours = 6,
    stressEatingPattern = ["Eat less/skip meals"],
    cravingType = [],
    stressLevel = 3,
    studyHours = 6,
    hasJob = false,
    dailyCheckins = []
  } = profile;

  const {
    totalFoodBudgetLimit = 0,
    totalFoodBudgetSpend = 0,
    copingSpend = 0,
    examWindowSpend = 0,
    totalSpend = 0
  } = financeData || {};

  const {
    burnoutPhase = false,
    maxConsecutiveStressDays = 0
  } = burnoutInfo || {};

  // Calculate days until exam
  let daysUntilExam = null;
  if (examDate) {
    const diffTime = new Date(examDate) - new Date();
    daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Evaluate daily checkins (rolling last 7 check-ins)
  let rollingSleepAvg = sleepHours;
  let skippedMealsCount = 0;
  let bingedCount = 0;
  let dailyStressAvg = stressLevel;

  if (dailyCheckins && dailyCheckins.length > 0) {
    const recent = dailyCheckins.slice(-7);
    let totalSleep = 0;
    let totalStress = 0;
    recent.forEach(c => {
      totalSleep += c.sleepHours;
      totalStress += c.stressLevel;
      if (c.eatingPattern === "Skipped meals") skippedMealsCount++;
      if (c.eatingPattern === "Binged") bingedCount++;
    });
    rollingSleepAvg = Number((totalSleep / recent.length).toFixed(1));
    dailyStressAvg = Number((totalStress / recent.length).toFixed(1));
  }

  // Calculate risk score based on inputs + checkins + finances
  let score = 0;

  // Sleep factor
  if (rollingSleepAvg < 5) score += 3.5;
  else if (rollingSleepAvg < 6.5) score += 1.5;

  // Stress Level factor
  if (dailyStressAvg >= 4) score += 3;
  else if (dailyStressAvg >= 3) score += 1;

  // Study hours factor
  if (studyHours > 9) score += 2;
  else if (studyHours > 6) score += 1;

  // Job pressure
  if (hasJob) score += 1.5;

  // Exam pressure
  if (daysUntilExam !== null && daysUntilExam >= 0 && daysUntilExam <= 7) {
    score += 2;
  }

  // Stress eating check-in flags
  if (skippedMealsCount >= 2) score += 2;
  if (bingedCount >= 2) score += 1.5;

  // Financial coping factors
  if (copingSpend > 100) score += 2; // high junk food/delivery/shopping coping spend
  else if (copingSpend > 40) score += 1;

  // Food budget overrun
  if (totalFoodBudgetLimit > 0 && totalFoodBudgetSpend > totalFoodBudgetLimit) {
    score += 1.5;
  }

  // Stress spending spike near exams
  if (examWindowSpend > 80) {
    score += 1;
  }

  // Burnout phase factor (chronic high stress)
  if (burnoutPhase) {
    score += 6; // Enforce high risk category
  }

  // Classify risk
  if (score >= 8 || burnoutPhase) {
    riskLevel = "High";
    if (burnoutPhase) {
      reason = `Chronic burnout phase active: High stress levels (>= 4/5) sustained for ${maxConsecutiveStressDays} consecutive check-ins.`;
      tip = "Take a step back and practice the 4-7-8 guided breathing exercise using the pulsing red alert banner on your dashboard.";
    } else if (rollingSleepAvg < 5.5) {
      reason = `Rolling sleep average is dangerously low (${rollingSleepAvg} hrs) combined with high stress and academic load.`;
      tip = "Prioritize sleep immediately. Set a strict boundary for study hours and turn off devices by 10 PM.";
    } else if (skippedMealsCount >= 2 || (totalFoodBudgetLimit > 0 && totalFoodBudgetSpend > totalFoodBudgetLimit)) {
      reason = `Frequent skipped meals (${skippedMealsCount} times this week) and overspending on food suggest coping issues.`;
      tip = "Schedule regular meal slots in your calendar and allocate a portion of your budget specifically to cheap, healthy home ingredients.";
    } else {
      reason = `Excessive study hours (${studyHours} hrs/day) and a part-time job under high stress rating are causing exhaustion.`;
      tip = "Take a full 'zero-work' rest day. Clear boundaries between study, work, and personal space are vital.";
    }
  } else if (score >= 4.5) {
    riskLevel = "Moderate";
    if (copingSpend > 60 || bingedCount >= 1) {
      reason = `Moderate stress with elevated food-delivery/coping spend ($${copingSpend.toFixed(2)}) and emotional eating signs.`;
      tip = "Try swapping food-delivery orders with easy-to-cook comfort meals to save money and eat healthier.";
    } else if (daysUntilExam !== null && daysUntilExam <= 7) {
      reason = `Exam approaching in ${daysUntilExam} days. Stress is moderate, affecting sleep averages (${rollingSleepAvg} hrs).`;
      tip = "Structure your revision topics into small chunks and test yourself early to gain confidence.";
    } else {
      reason = `Academics, work, and sleep levels (${rollingSleepAvg} hrs) are causing moderate fatigue.`;
      tip = "Try running or walking outdoors for 20 minutes daily to break up coding and study cycles.";
    }
  } else {
    riskLevel = "Low";
    reason = "Your sleep, stress check-ins, and financial habits look stable and sustainable.";
    tip = "Great job! Keep monitoring your budget limits and maintain a consistent sleep routine.";
  }

  return { riskLevel, reason, tip, source: "Quick Analysis" };
};

const isPlaceholderKey = (key) => !key || key.trim() === "" || key.startsWith("your-") || key.includes("placeholder");

const getBurnoutAnalysis = async (profile, financeData, burnoutInfo) => {
  const openRouterKey = isPlaceholderKey(process.env.OPENROUTER_API_KEY) ? null : process.env.OPENROUTER_API_KEY;
  const openAIKey = isPlaceholderKey(process.env.OPENAI_API_KEY) ? null : process.env.OPENAI_API_KEY;
  
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
    return fallbackBurnoutAnalysis(profile, financeData, burnoutInfo);
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
      hasJob = false,
      dailyCheckins = []
    } = profile;

    const {
      totalFoodBudgetLimit = 0,
      totalFoodBudgetSpend = 0,
      copingSpend = 0,
      examWindowSpend = 0,
      totalSpend = 0
    } = financeData || {};

    const {
      burnoutPhase = false,
      maxConsecutiveStressDays = 0
    } = burnoutInfo || {};

    let daysUntilExam = "No exams scheduled";
    if (examDate && examDate !== "No exams scheduled") {
      const diffTime = new Date(examDate) - new Date();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysUntilExam = days >= 0 ? `${days} days` : "passed";
    }

    // Prepare recent daily checkins overview
    const recentCheckinsText = dailyCheckins.slice(-7).map(c => 
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
      - Chronic Burnout Phase: ${burnoutPhase ? "Active" : "Inactive"} (${maxConsecutiveStressDays} consecutive check-ins with stress >= 4/5)

      Recent Daily Check-ins (Last 7 Days):
      ${recentCheckinsText || "No check-ins submitted yet."}

      Financial & Spending Signals:
      - Total Monthly Spend: $${totalSpend.toFixed(2)} USD
      - Food Budget Limit: $${totalFoodBudgetLimit.toFixed(2)} USD, Food Budget Spent: $${totalFoodBudgetSpend.toFixed(2)} USD
      - Coping/Junk Food & Shopping Spend: $${copingSpend.toFixed(2)} USD
      - Spending Spike in Exam Prep Window: $${examWindowSpend.toFixed(2)} USD

      Detect stress levels, coping mechanisms (like stress eating or shopping overruns), and irregular sleep patterns.
      Classify their burnout risk. Provide the response strictly in JSON format with exactly three fields:
      "riskLevel": "Low", "Moderate", or "High"
      "reason": a 1-line description of the classification combining wellness & spending observations (e.g. "Frequent skipped meals and overspending on Doordash near exams")
      "tip": a single actionable tip related to sleep, study schedule, or financial/spending habits.
      
      CRITICAL INSTRUCTION: If Chronic Burnout Phase is Active, you MUST classify riskLevel as "High". The reason must state that chronic burnout is active due to sustained high stress levels, and the tip MUST recommend using the 4-7-8 breathing spacer modal on their dashboard to help them relax.

      Format:
      {
        "riskLevel": "Low/Moderate/High",
        "reason": "...",
        "tip": "..."
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
    const fallbackVal = fallbackBurnoutAnalysis(profile, financeData, burnoutInfo);
    return {
      ...fallbackVal,
      source: "Quick Analysis"
    };
  }
};

export default getBurnoutAnalysis;
