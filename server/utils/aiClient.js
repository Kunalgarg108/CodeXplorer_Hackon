import OpenAI from "openai";

/**
 * Centralized AI client for text tasks via Bedrock Mantle (OpenAI-compatible endpoint).
 * 
 * TEXT tasks (chat, recommendations, summaries, advice):
 *   → OPENAI_MODEL via bedrock-mantle endpoint
 * 
 * VISION tasks (menu image extraction):
 *   → amazon.nova-pro-v1:0 via native AWS Converse API (in bedrockService.js)
 *   Nova Pro does NOT support bedrock-mantle / OpenAI-compatible endpoint.
 * 
 * ENV VARS:
 *   OPENAI_API_KEY   - Bedrock Mantle API key
 *   OPENAI_BASE_URL  - https://bedrock-mantle.us-east-1.api.aws/v1
 *   OPENAI_MODEL     - Text model (e.g. openai.gpt-oss-120b)
 */

let _client = null;

export function getAIClient() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  if (!apiKey || !baseURL) return null;
  _client = new OpenAI({ apiKey, baseURL });
  return _client;
}

/** Text model for chat, recommendations, summaries, advice */
export function getTextModel() {
  return process.env.OPENAI_MODEL || "openai.gpt-oss-120b";
}

export function isAIConfigured() {
  return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL && process.env.OPENAI_MODEL);
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
 * Text-only chat completion. Uses OPENAI_MODEL via bedrock-mantle.
 * Returns plain text (markdown stripped) or null on failure.
 */
export async function chatCompletion(messages, options = {}) {
  const client = getAIClient();
  if (!client) return null;

  const model = getTextModel();
  const { maxTokens = 1024, temperature = 0.7, jsonMode = false } = options;

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
  return jsonMode ? content : stripMarkdown(content);
}

export { stripMarkdown };
