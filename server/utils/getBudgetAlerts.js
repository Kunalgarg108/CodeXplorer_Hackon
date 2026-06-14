import { chatCompletion, isAIConfigured } from "./aiClient.js";

const generateAlertsWithAI = async (budgetSummaries) => {
  if (!isAIConfigured() || budgetSummaries.length === 0) {
    return generateFallbackAlerts(budgetSummaries);
  }

  try {
    const prompt = `You are a smart financial assistant for college students. Analyze the following budget data and generate actionable alerts.

Budget Data:
${JSON.stringify(budgetSummaries, null, 2)}

Generate 1-4 personalized alert messages as a JSON array. Each alert:
- "priority": "high", "medium", or "low"
- "message": concise alert (1 sentence, use $ for currency)
- "action": actionable suggestion (1 sentence)
- "budgetName": which budget
- "type": "overspend", "approaching_limit", "burn_rate", "weekly_spike", or "savings_tip"

Rules: high if utilization > 90%, medium if > 70% or exhaustion < 7 days, low for tips.
Return ONLY a JSON array. No markdown.`;

    const content = await chatCompletion(
      [{ role: "user", content: prompt }],
      { maxTokens: 800 }
    );

    if (!content) return generateFallbackAlerts(budgetSummaries);

    let parsed;
    const trimmed = content.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const match = trimmed.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
      else return generateFallbackAlerts(budgetSummaries);
    }

    return Array.isArray(parsed) ? parsed.slice(0, 5) : generateFallbackAlerts(budgetSummaries);
  } catch (error) {
    console.error("Error generating budget alerts from AI:", error.message);
    return generateFallbackAlerts(budgetSummaries);
  }
};

const generateFallbackAlerts = (budgetSummaries) => {
  const alerts = [];

  for (const budget of budgetSummaries) {
    const { name, amount, totalSpend, utilizationPercent, burnRate, daysUntilExhaustion, weeklyTrend } = budget;

    if (utilizationPercent >= 90) {
      alerts.push({
        priority: "high",
        message: `You have spent $${totalSpend} of your $${amount} ${name} budget (${utilizationPercent}% used).`,
        action: `Freeze non-essential ${name.toLowerCase()} spending to avoid exceeding your limit.`,
        budgetName: name,
        type: "overspend",
      });
    } else if (utilizationPercent >= 70) {
      alerts.push({
        priority: "medium",
        message: `Your ${name} budget is ${utilizationPercent}% utilized — $${(amount - totalSpend).toFixed(0)} remaining.`,
        action: `Plan remaining ${name.toLowerCase()} expenses carefully.`,
        budgetName: name,
        type: "approaching_limit",
      });
    }

    if (daysUntilExhaustion !== null && daysUntilExhaustion <= 7 && daysUntilExhaustion > 0 && utilizationPercent < 90) {
      alerts.push({
        priority: "medium",
        message: `You may exceed your ${name} budget in ${Math.round(daysUntilExhaustion)} days.`,
        action: `Reduce daily spending from $${burnRate.toFixed(0)} to stay on track.`,
        budgetName: name,
        type: "burn_rate",
      });
    }

    if (weeklyTrend !== null && weeklyTrend > 30) {
      alerts.push({
        priority: "low",
        message: `${name} spending is ${Math.round(weeklyTrend)}% higher than last week.`,
        action: `Review recent ${name.toLowerCase()} purchases for impulse buys.`,
        budgetName: name,
        type: "weekly_spike",
      });
    }
  }

  if (budgetSummaries.length > 0 && alerts.length < 4) {
    const top = budgetSummaries.reduce((a, b) => a.utilizationPercent > b.utilizationPercent ? a : b);
    if (top.utilizationPercent > 50) {
      alerts.push({
        priority: "low",
        message: `Save ~$${Math.round(top.totalSpend * 0.15)} by reducing ${top.name.toLowerCase()} expenses 15%.`,
        action: `Try cheaper alternatives for your top ${top.name.toLowerCase()} expenses.`,
        budgetName: top.name,
        type: "savings_tip",
      });
    }
  }

  return alerts.slice(0, 5);
};

export default generateAlertsWithAI;
