import fs from "fs/promises";
import path from "path";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import OpenAI from "openai";

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
      try {
        return JSON.parse(fencedMatch[1].trim());
      } catch { /* fall through */ }
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // JSON is truncated - try to fix by closing the array and object
        let partial = objectMatch[0];
        // Remove trailing incomplete object (after last complete },)
        const lastCompleteItem = partial.lastIndexOf("},");
        if (lastCompleteItem > 0) {
          partial = partial.substring(0, lastCompleteItem + 1) + "]}";
          try {
            return JSON.parse(partial);
          } catch { /* fall through */ }
        }
        // Try closing with just ]}
        const lastBrace = partial.lastIndexOf("}");
        if (lastBrace > 0) {
          partial = partial.substring(0, lastBrace + 1) + "]}";
          try {
            return JSON.parse(partial);
          } catch { /* fall through */ }
        }
      }
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
  let modelId =
    process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

  // Automatically prepend "us." to Amazon Nova models for on-demand routing
  if (modelId.startsWith("amazon.nova")) {
    modelId = `us.${modelId}`;
  }

  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mediaType = getMediaType(imagePath);

  const processExtractedText = (text) => {
    if (!text) {
      throw new Error("Empty response from model");
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

  // Try AWS Bedrock first if region is configured
  if (region) {
    try {
      console.log(`[BedrockService] Attempting to invoke AWS Bedrock with model ${modelId} in region ${region}...`);
      const client = new BedrockRuntimeClient({ region });
      const isNova = modelId.includes("amazon.nova");
      let body;

      if (isNova) {
        let format = "jpeg";
        if (mediaType === "image/png") format = "png";
        else if (mediaType === "image/webp") format = "webp";
        else if (mediaType === "image/gif") format = "gif";

        body = {
          schemaVersion: "messages-v1",
          messages: [
            {
              role: "user",
              content: [
                {
                  image: {
                    format,
                    source: {
                      bytes: base64Image,
                    },
                  },
                },
                {
                  text: EXTRACTION_PROMPT,
                },
              ],
            },
          ],
          inferenceConfig: {
            maxTokens: 4096,
            temperature: 0,
          },
        };
      } else {
        body = {
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
      }

      const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(body),
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const text = isNova
        ? responseBody.output?.message?.content?.[0]?.text
        : responseBody.content?.[0]?.text;

      return processExtractedText(text);
    } catch (bedrockError) {
      console.warn(`[BedrockService] AWS Bedrock invocation failed: ${bedrockError.message}`);
      console.log(`[BedrockService] Attempting to fall back to OpenRouter/Gemini...`);
    }
  } else {
    console.log(`[BedrockService] AWS_REGION not configured, attempting to use OpenRouter...`);
  }

  // Fallback to OpenRouter (multimodal Gemini 2.5 Flash)
  const openRouterKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    throw new Error("AWS Bedrock failed and no OpenRouter/OpenAI API key configured for fallback.");
  }

  try {
    const openai = new OpenAI({
      apiKey: openRouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 8000,
    });

    const text = response.choices[0].message.content;
    return processExtractedText(text);
  } catch (openRouterError) {
    console.error(`[BedrockService] OpenRouter fallback also failed:`, openRouterError.message);
    throw new Error(`Menu extraction failed. Bedrock error or OpenRouter fallback failure: ${openRouterError.message}`);
  }
};
