import OpenAI from "openai";

const isPlaceholderKey = (key) => !key || key.trim() === "" || key.startsWith("your-") || key.includes("placeholder");

const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (isPlaceholderKey(key)) return null;

  if (key.startsWith("sk-or-v1-")) {
    return {
      client: new OpenAI({
        apiKey: key,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true
      }),
      model: "google/gemini-2.5-flash"
    };
  }

  return {
    client: new OpenAI({ apiKey: key }),
    model: "gpt-4o-mini"
  };
};

const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend) => {
  const config = getOpenAI();
  if (!config) {
    return "Set your OPENAI_API_KEY in server/.env to get personalized AI financial advice.";
  }

  const { client, model } = config;

  try {
    const userPrompt = `
      Based on the following financial data:
      - Total Budget: ${totalBudget} USD 
      - Expenses: ${totalSpend} USD 
      - Incomes: ${totalIncome} USD
      Provide detailed financial advice in 2 sentence to help the user manage their finances more effectively.
    `;

    const chatCompletion = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 800,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Sorry, I couldn't fetch the financial advice at this moment. Please try again later.";
  }
};

const getAIInsights = async (context) => {
  const config = getOpenAI();
  if (!config) {
    return null;
  }

  const { client, model } = config;

  try {
    const userPrompt = `
      Analyze the following student personal finance context for this month:
      
      Total Monthly Spend: ₹${context.totalSpend}
      Category Breakdown:
      ${JSON.stringify(context.categoryBreakdown, null, 2)}
      
      Top Merchants:
      ${JSON.stringify(context.topMerchants, null, 2)}
      
      Active Budget Threshold Breaches:
      ${JSON.stringify(context.breaches, null, 2)}
      
      Detected Monthly Subscriptions:
      ${JSON.stringify(context.subscriptions, null, 2)}
      
      Generate exactly 3 bullet-point insights (1-2 sentences each) that provide highly specific, actionable, and student-focused financial advice.
      Rules:
      1. Mention specific categories, merchants, or subscription amounts from the data above. Always use Indian Rupees (₹) for currency.
      2. Identify optimization options (e.g., if comfort food delivery is high, suggest cooking; if threshold is breached, suggest limits).
      3. Keep the tone encouraging but direct.
      
      Return ONLY a JSON array of strings (the 3 bullet points). No markdown, no explanations.
      Example format:
      [
        "Your Food & Dining spending has exceeded its threshold by ₹450, mainly due to 5 orders at Swiggy. Consider cooking at home next week.",
        "We detected a recurring Netflix subscription of ₹199. If you aren't using it daily, pausing it can save you ₹2,388 annually.",
        "Your top merchant is Amazon where you spent ₹1,200. Setting a 24-hour cooling-off period before buying discretionary items can help reduce impulse purchases."
      ]
    `;

    const chatCompletion = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 800,
    });

    const content = chatCompletion.choices[0].message.content.trim();
    try {
      return JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error("Invalid JSON from AI");
    }
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return null;
  }
};

export default getFinancialAdvice;
export { getAIInsights };
