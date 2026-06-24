import Groq from "groq-sdk";

/**
 * Centralized AI client using Groq.
 *
 * All text tasks (chat, recommendations, summaries, advice, menu parsing):
 *   → GROQ_MODEL via Groq API
 *
 * ENV VARS:
 *   GROQ_API_KEY  - Groq API key
 *   GROQ_MODEL    - Model name (e.g. llama-3.3-70b-versatile)
 */

let _client = null;

export function getAIClient() {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  _client = new Groq({ apiKey });
  return _client;
}

/** Text model for chat, recommendations, summaries, advice */
export function getTextModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

export function isAIConfigured() {
  return !!(process.env.GROQ_API_KEY && process.env.GROQ_MODEL);
}

/**
 * Strip markdown formatting from AI responses.
 */
function stripMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/#+\s?/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/^[-*•]\s/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

/**
 * Chat completion using Groq.
 * Returns plain text (markdown stripped) or null on failure.
 *
 * @param {Array} messages - Array of { role, content } objects (system/user/assistant)
 * @param {Object} options - { maxTokens, temperature, jsonMode }
 */
export async function chatCompletion(messages, options = {}) {
  const client = getAIClient();
  if (!client) return null;

  const model = getTextModel();
  const { maxTokens = 1024, temperature = 0.7, jsonMode = false } = options;

  try {
    const requestBody = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (jsonMode) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await client.chat.completions.create(requestBody);
    const content = response.choices[0]?.message?.content || null;
    if (!content) return null;
    return jsonMode ? content : stripMarkdown(content);
  } catch (error) {
    console.error("[Groq] Chat completion error:", error.message);
    return null;
  }
}

export { stripMarkdown };
