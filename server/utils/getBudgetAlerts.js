import OpenAI from "openai";

const isPlaceholderKey = (key) => !key || key.trim() === "" || key.startsWith("your-") || key.includes("placeholder");

const generateAlertsWithAI = async (budgetSummaries) => {
  const apiKey = isPlaceholderKey(process.env.OPENROUTER_API_KEY) ? null : process.env.OPENROUTER_API_KEY;

  if (!apiKey || budgetSummaries.length === 0) {
    return generateFallbackAlerts(budgetSummaries);
  }

  try {
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const prompt = `You are a smart financial assistant for college students. Analyze the following budget data and generate actionable alerts.

Budget Data:
${JSON.stringify(budgetSummaries, null, 2)}

Each budget object has:
- name: budget category name
- amount: total budget limit
- totalSpend: amount spent so far
- utilizationPercent: percentage of budget used
- burnRate: average daily spending rate (currency per day)
- daysActive: how many days since budget was created
- daysUntilExhaustion: predicted days until budget runs out (null if no spending)
- weeklyTrend: percentage change in spending this week vs last week (null if insufficient data)
- recentExpenses: last 5 expense names and amounts

Generate 1-4 personalized alert messages. Each alert must be a JSON object with:
- "priority": "high", "medium", or "low"
- "message": a concise, student-friendly alert message (max 1 sentence, use ₹ for currency)
- "action": a specific actionable suggestion (max 1 sentence)
- "budgetName": which budget this alert is for
- "type": one of "overspend", "approaching_limit", "burn_rate", "weekly_spike", "savings_tip"

Rules:
- Generate "high" priority if utilization > 90%
- Generate "medium" priority if utilization > 70% or daysUntilExhaustion < 7
- Generate "low" for savings tips or weekly trend observations
- Be specific with numbers (amounts, percentages, days)
- If weeklyTrend > 30, mention the spending spike
- Always include at least one savings tip if possible

Return ONLY a JSON array of alert objects. No markdown, no explanation.`;

    const chatCompletion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    });

    const content = chatCompletion.choices[0].message.content;
    const trimmed = content.trim();

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fencedMatch) {
        parsed = JSON.parse(fencedMatch[1].trim());
      } else {
        const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          parsed = JSON.parse(arrayMatch[0]);
        } else {
          return generateFallbackAlerts(budgetSummaries);
        }
      }
    }

    if (!Array.isArray(parsed)) {
      return generateFallbackAlerts(budgetSummaries);
    }

    return parsed.slice(0, 5);
  } catch (error) {
    console.error("Error generating budget alerts from AI:", error);
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
        message: `You have already spent ₹${totalSpend} of your ₹${amount} ${name} budget (${utilizationPercent}% used).`,
        action: `Freeze non-essential ${name.toLowerCase()} spending immediately to avoid exceeding your limit.`,
        budgetName: name,
        type: "overspend",
      });
    } else if (utilizationPercent >= 70) {
      alerts.push({
        priority: "medium",
        message: `Your ${name} budget is ${utilizationPercent}% utilized — ₹${(amount - totalSpend).toFixed(0)} remaining.`,
        action: `Plan your remaining ${name.toLowerCase()} expenses carefully for the rest of the month.`,
        budgetName: name,
        type: "approaching_limit",
      });
    }

    if (daysUntilExhaustion !== null && daysUntilExhaustion <= 7 && daysUntilExhaustion > 0 && utilizationPercent < 90) {
      alerts.push({
        priority: "medium",
        message: `You are likely to exceed your ${name} budget in ${Math.round(daysUntilExhaustion)} days at current spending rate.`,
        action: `Reduce daily ${name.toLowerCase()} spending from ₹${burnRate.toFixed(0)} to ₹${((amount - totalSpend) / 14).toFixed(0)} to stay on track.`,
        budgetName: name,
        type: "burn_rate",
      });
    }

    if (weeklyTrend !== null && weeklyTrend > 30) {
      alerts.push({
        priority: "low",
        message: `${name} spending this week is ${Math.round(weeklyTrend)}% higher than last week.`,
        action: `Review your recent ${name.toLowerCase()} expenses and identify any impulse purchases to cut back.`,
        budgetName: name,
        type: "weekly_spike",
      });
    }
  }

  // Add a savings tip if we have budget data
  if (budgetSummaries.length > 0) {
    const highestSpender = budgetSummaries.reduce((a, b) =>
      a.utilizationPercent > b.utilizationPercent ? a : b
    );
    if (highestSpender.utilizationPercent > 50 && alerts.length < 4) {
      const saveable = Math.round(highestSpender.totalSpend * 0.15);
      alerts.push({
        priority: "low",
        message: `You can save approximately ₹${saveable} this month by reducing ${highestSpender.name.toLowerCase()} expenses by 15%.`,
        action: `Try cooking at home or finding cheaper alternatives for your top ${highestSpender.name.toLowerCase()} expenses.`,
        budgetName: highestSpender.name,
        type: "savings_tip",
      });
    }
  }

  return alerts.slice(0, 5);
};

export default generateAlertsWithAI;
