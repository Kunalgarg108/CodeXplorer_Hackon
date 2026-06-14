import Tesseract from "tesseract.js";
import { chatCompletion, isAIConfigured } from "../utils/aiClient.js";

/**
 * Menu extraction pipeline: Local OCR (Tesseract.js) + Text LLM (openai.gpt-oss-120b)
 * 
 * Flow: Image → Tesseract OCR → Raw Text → LLM → Structured JSON → MongoDB
 * 
 * No Bedrock Vision models needed.
 */

const MENU_PARSER_PROMPT = `You are a restaurant menu parser. You receive raw OCR text from a restaurant menu image.

Extract all food/drink items with their prices and categories.

Return ONLY valid JSON array. No markdown, no explanation.

Format:
[
  { "name": "Item Name", "price": 12, "category": "Category" }
]

Rules:
- Extract every item that has a name and price.
- Price must be a number (no currency symbols).
- Category should be inferred (e.g. Pizza, Burger, Drinks, Appetizer, Dessert, Main Course, etc).
- If price is unclear, use 0.
- If category is unclear, use "Other".
- Do not invent items that are not in the text.
- Return empty array [] if no menu items found.`;

const parseJsonResponse = (text) => {
  if (!text) throw new Error("Empty response from LLM");
  const trimmed = text.trim();

  try { return JSON.parse(trimmed); } catch {}

  // Try extracting from markdown code blocks
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch {} }

  // Try extracting array
  const arr = trimmed.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch {} }

  // Try extracting object with items
  const obj = trimmed.match(/\{[\s\S]*\}/);
  if (obj) {
    try {
      const parsed = JSON.parse(obj[0]);
      if (Array.isArray(parsed.items)) return parsed.items;
      return parsed;
    } catch {}
  }

  throw new Error("Unable to parse menu JSON from LLM response");
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      price: Number(item?.price) || 0,
      category: String(item?.category || "Other").trim(),
    }))
    .filter((item) => item.name.length > 0);
};

export const extractMenuItemsFromImage = async (imagePath) => {
  // Step 1: OCR with Tesseract.js
  console.log("[OCR] Starting text extraction from image...");

  let menuText;
  try {
    const result = await Tesseract.recognize(imagePath, "eng");
    menuText = result.data.text;
  } catch (ocrError) {
    console.error("[OCR] Failed:", ocrError.message);
    throw new Error(`OCR failed: ${ocrError.message}`);
  }

  if (!menuText || menuText.trim().length < 10) {
    console.error("[OCR] Extracted text too short or empty");
    throw new Error("OCR could not extract readable text from the image. Try a clearer photo.");
  }

  console.log("[OCR] Text extracted (" + menuText.length + " chars)");

  // Step 2: Send OCR text to LLM for structured parsing
  if (!isAIConfigured()) {
    throw new Error("AI not configured. Set OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL in .env");
  }

  console.log("[LLM] Parsing menu text into structured JSON...");

  const content = await chatCompletion(
    [
      { role: "system", content: MENU_PARSER_PROMPT },
      { role: "user", content: menuText },
    ],
    { maxTokens: 4000, temperature: 0 }
  );

  if (!content) {
    throw new Error("LLM returned empty response when parsing menu");
  }

  // Step 3: Parse and validate
  const parsed = parseJsonResponse(content);
  const items = normalizeItems(Array.isArray(parsed) ? parsed : parsed.items || []);

  if (items.length === 0) {
    throw new Error("No menu items found in the image. Try a clearer photo with visible prices.");
  }

  console.log(`[DB] Saving ${items.length} menu items`);
  return items;
};
