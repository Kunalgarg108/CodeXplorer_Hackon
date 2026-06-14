import OpenAI from "openai";

const fallbackWeeklyAnalysis = (checkins) => {
  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date)); // descending (newest first)
  const thisWeek = sorted.filter(c => {
    const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const lastWeek = sorted.filter(c => {
    const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  });

  let avgSleep = 0;
  let avgStress = 0;
  let skippedMealsCount = 0;
  let bingedCount = 0;
  let healthyCount = 0;
  let ateOutCount = 0;

  if (thisWeek.length > 0) {
    let totalSleep = 0;
    let totalStress = 0;
    thisWeek.forEach(c => {
      totalSleep += c.sleepHours || 0;
      totalStress += c.stressLevel || 0;
      if (c.eatingPattern === "Skipped meals") skippedMealsCount++;
      else if (c.eatingPattern === "Binged") bingedCount++;
      else if (c.eatingPattern === "Healthy") healthyCount++;
      else if (c.eatingPattern === "Ate out") ateOutCount++;
    });
    avgSleep = Number((totalSleep / thisWeek.length).toFixed(1));
    avgStress = Number((totalStress / thisWeek.length).toFixed(1));
  }

  let lastWeekAvgStress = 0;
  if (lastWeek.length > 0) {
    let totalStress = 0;
    lastWeek.forEach(c => totalStress += c.stressLevel || 0);
    lastWeekAvgStress = totalStress / lastWeek.length;
  }

  let trendDirection = "flat";
  let trendPercentage = 0;
  if (lastWeekAvgStress > 0 && avgStress > 0) {
    const diff = avgStress - lastWeekAvgStress;
    trendPercentage = Math.round((Math.abs(diff) / lastWeekAvgStress) * 100);
    if (diff > 0.05) trendDirection = "up";
    else if (diff < -0.05) trendDirection = "down";
  }

  const mostFrequentEating = [];
  if (healthyCount > 0) mostFrequentEating.push(`${healthyCount} healthy meals`);
  if (ateOutCount > 0) mostFrequentEating.push(`ate out ${ateOutCount} times`);
  if (skippedMealsCount > 0) mostFrequentEating.push(`skipped meals on ${skippedMealsCount} days`);
  if (bingedCount > 0) mostFrequentEating.push(`binged on ${bingedCount} days`);

  const eatingText = mostFrequentEating.length > 0 ? mostFrequentEating.join(", ") : "no special eating patterns";

  const trendText = trendDirection === "flat" ? "steady" : `${trendDirection} from last week`;
  const summary = `This week your average sleep was ${avgSleep} hrs (${trendText}) and stress averaged ${avgStress}/5. Your eating habits included: ${eatingText}.`;

  return {
    summary,
    trendDirection,
    trendPercentage,
    source: "Quick Analysis"
  };
};

const isPlaceholderKey = (key) => !key || key.trim() === "" || key.startsWith("your-") || key.includes("placeholder");

const getWeeklyAnalysis = async (checkins) => {
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
    return fallbackWeeklyAnalysis(checkins);
  }

  try {
    const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
    const thisWeek = sorted.filter(c => {
      const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const lastWeek = sorted.filter(c => {
      const diff = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    });

    if (thisWeek.length === 0) {
      return fallbackWeeklyAnalysis(checkins);
    }

    const thisWeekText = thisWeek.map(c => 
      `Date: ${new Date(c.date).toDateString()}, Sleep: ${c.sleepHours} hrs, Eating: ${c.eatingPattern}, Stress: ${c.stressLevel}/5`
    ).join("\n");

    const lastWeekText = lastWeek.map(c => 
      `Date: ${new Date(c.date).toDateString()}, Sleep: ${c.sleepHours} hrs, Eating: ${c.eatingPattern}, Stress: ${c.stressLevel}/5`
    ).join("\n");

    const userPrompt = `
      You are an AI wellness companion. Analyze the student's daily check-ins for the last 7 days compared to the previous 7 days (if available) and provide a weekly summary.

      This Week's Check-ins (Last 7 days):
      ${thisWeekText}

      Previous Week's Check-ins (Days 8-14):
      ${lastWeekText || "None available."}

      Task:
      1. Calculate average sleep hours and average stress level for this week.
      2. Compare this week's average stress to the previous week's average stress (if available) to determine if it went up, down, or stayed flat, and estimate the percentage change.
      3. Write a concise weekly summary paragraph summarizing sleep quality, stress trends, and eating habits.
      
      Respond strictly in JSON format with exactly these fields:
      "summary": A concise weekly summary paragraph (e.g. "This week your average sleep was 6.8 hrs (down from last week) and stress averaged 3.2/5. You skipped meals on 2 days, showing signs of stress eating.")
      "trendDirection": "up", "down", or "flat" (based on average stress comparison)
      "trendPercentage": a positive integer representing the percentage change (or 0 if no change or no previous week data)
      "source": "AI Analysis"
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
      summary: parsed.summary,
      trendDirection: parsed.trendDirection || "flat",
      trendPercentage: Number(parsed.trendPercentage) || 0,
      source: "AI Analysis"
    };
  } catch (error) {
    console.error("Error generating weekly wellness analysis from LLM:", error);
    return fallbackWeeklyAnalysis(checkins);
  }
};

export { getWeeklyAnalysis, fallbackWeeklyAnalysis };
