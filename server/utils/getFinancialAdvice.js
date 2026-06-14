import { chatCompletion, isAIConfigured } from "./aiClient.js";

const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend, symbol = "$") => {
  if (!isAIConfigured()) {
    return `AI not configured. Set OPENAI_API_KEY and OPENAI_BASE_URL in server/.env.`;
  }

  try {
    const userPrompt = `Based on the following financial data:
- Total Budget: ${symbol}${totalBudget}
- Expenses: ${symbol}${totalSpend}
- Incomes: ${symbol}${totalIncome}
Provide detailed financial advice in 2 sentences to help the user manage their finances more effectively. Use ${symbol} for all currency numbers in your response.`;

    const content = await chatCompletion(
      [{ role: "user", content: userPrompt }],
      { maxTokens: 400 }
    );

    return content || "Sorry, I couldn't fetch financial advice at this moment.";
  } catch (error) {
    console.error("Error fetching financial advice:", error.message);
    return "Sorry, I couldn't fetch the financial advice at this moment. Please try again later.";
  }
};

const getAIInsights = async (context, symbol = "$") => {
  if (!isAIConfigured()) return null;

  try {
    const userPrompt = `Analyze the following student personal finance context:
      
Total Monthly Spend: ${symbol}${context.totalSpend}
Category Breakdown: ${JSON.stringify(context.categoryBreakdown)}
Top Merchants: ${JSON.stringify(context.topMerchants)}
Active Budget Breaches: ${JSON.stringify(context.breaches)}
Subscriptions: ${JSON.stringify(context.subscriptions)}

Generate exactly 3 bullet-point insights (1-2 sentences each) with specific, actionable, student-focused financial advice. Use ${symbol} for currency.
Return ONLY a JSON array of 3 strings. No markdown.`;

    const content = await chatCompletion(
      [{ role: "user", content: userPrompt }],
      { maxTokens: 600 }
    );

    if (!content) return null;
    try {
      return JSON.parse(content.trim());
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      return null;
    }
  } catch (error) {
    console.error("Error generating AI insights:", error.message);
    return null;
  }
};

export default getFinancialAdvice;
export { getAIInsights };
