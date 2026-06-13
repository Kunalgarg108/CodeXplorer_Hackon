import OpenAI from "openai";

const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!key) return null;

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

export default getFinancialAdvice;
