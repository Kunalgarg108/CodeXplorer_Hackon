import { chatCompletion, isAIConfigured } from "./aiClient.js";

const fallbackWeeklyAnalysis = (checkins) => {
  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
  const thisWeek = sorted.filter(c => (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24) <= 7);
  const lastWeek = sorted.filter(c => { const d = (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24); return d > 7 && d <= 14; });

  let avgSleep = 0, avgStress = 0;
  if (thisWeek.length > 0) {
    avgSleep = Number((thisWeek.reduce((s, c) => s + (c.sleepHours || 0), 0) / thisWeek.length).toFixed(1));
    avgStress = Number((thisWeek.reduce((s, c) => s + (c.stressLevel || 0), 0) / thisWeek.length).toFixed(1));
  }

  let lastWeekAvgStress = lastWeek.length > 0 ? lastWeek.reduce((s, c) => s + (c.stressLevel || 0), 0) / lastWeek.length : 0;

  let trendDirection = "flat", trendPercentage = 0;
  if (lastWeekAvgStress > 0 && avgStress > 0) {
    const diff = avgStress - lastWeekAvgStress;
    trendPercentage = Math.round((Math.abs(diff) / lastWeekAvgStress) * 100);
    if (diff > 0.05) trendDirection = "up";
    else if (diff < -0.05) trendDirection = "down";
  }

  const summary = `This week: avg sleep ${avgSleep} hrs, stress ${avgStress}/5 (${trendDirection === "flat" ? "steady" : trendDirection} from last week).`;
  return { summary, trendDirection, trendPercentage, source: "Quick Analysis" };
};

const getWeeklyAnalysis = async (checkins) => {
  if (!isAIConfigured()) return fallbackWeeklyAnalysis(checkins);

  try {
    const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
    const thisWeek = sorted.filter(c => (new Date() - new Date(c.date)) / (1000 * 60 * 60 * 24) <= 7);
    if (thisWeek.length === 0) return fallbackWeeklyAnalysis(checkins);

    const thisWeekText = thisWeek.map(c => `${new Date(c.date).toDateString()}: Sleep ${c.sleepHours}hrs, ${c.eatingPattern}, Stress ${c.stressLevel}/5`).join("\n");

    const userPrompt = `Analyze student wellness check-ins and provide a weekly summary.

This Week:
${thisWeekText}

Respond in JSON: {"summary":"1-2 sentence weekly summary","trendDirection":"up/down/flat","trendPercentage":number,"source":"AI Analysis"}`;

    const content = await chatCompletion(
      [{ role: "user", content: userPrompt }],
      { maxTokens: 300, jsonMode: true }
    );

    if (!content) return fallbackWeeklyAnalysis(checkins);
    let parsed;
    try { parsed = JSON.parse(content.trim()); } catch { const m = content.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else return fallbackWeeklyAnalysis(checkins); }
    return { summary: parsed.summary, trendDirection: parsed.trendDirection || "flat", trendPercentage: Number(parsed.trendPercentage) || 0, source: "AI Analysis" };
  } catch (error) {
    console.error("Error generating weekly analysis:", error.message);
    return fallbackWeeklyAnalysis(checkins);
  }
};

export { getWeeklyAnalysis, fallbackWeeklyAnalysis };
