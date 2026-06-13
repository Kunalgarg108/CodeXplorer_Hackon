import fs from "fs/promises";
import path from "path";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const EXTRACTION_PROMPT = `Extract menu items from this restaurant menu image.

Return ONLY valid JSON.

Format:

{
  "items": [
    {
      "name": "",
      "price": 0,
      "category": ""
    }
  ]
}

Rules:
- Do not return markdown.
- Do not return explanations.
- Do not return calories.
- Do not return health scores.
- Do not invent prices.
- Category should be inferred from item name.`;

const MEDIA_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const getMediaType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MEDIA_TYPES[ext] || "image/jpeg";
};

const parseJsonResponse = (text) => {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch) {
      return JSON.parse(fencedMatch[1].trim());
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error("Unable to parse menu extraction response");
  }
};

const normalizeItems = (items) =>
  items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      price: Number(item?.price) || 0,
      category: String(item?.category || "Uncategorized").trim(),
    }))
    .filter((item) => item.name);

export const extractMenuItemsFromImage = async (imagePath) => {
  const region = process.env.AWS_REGION;
  const modelId =
    process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

  if (!region) {
    throw new Error("AWS_REGION is not configured");
  }

  const client = new BedrockRuntimeClient({ region });
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mediaType = getMediaType(imagePath);

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const text = responseBody.content?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Bedrock");
  }

  const parsed = parseJsonResponse(text);

  if (!Array.isArray(parsed.items)) {
    throw new Error("Invalid menu extraction response");
  }

  const items = normalizeItems(parsed.items);

  if (items.length === 0) {
    throw new Error("No menu items extracted from image");
  }

  return items;
};
