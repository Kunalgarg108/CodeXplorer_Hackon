import dotenv from "dotenv";
dotenv.config();

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const regions = ["us-east-1", "us-west-2", "eu-west-3", "eu-central-1"];
const models = [
  "amazon.nova-pro-v1:0",
  "amazon.nova-lite-v1:0",
  "amazon.nova-micro-v1:0",
  "anthropic.claude-3-haiku-20240307-v1:0",
  "anthropic.claude-3-5-sonnet-20241022-v2:0"
];

async function probe() {
  console.log("=== PROBING AWS REGIONS FOR BEDROCK MODEL ACCESS ===");
  
  for (const region of regions) {
    console.log(`\nProbing region: ${region}`);
    const client = new BedrockRuntimeClient({ region });
    
    for (const modelId of models) {
      const isNova = modelId.includes("nova");
      const body = isNova ? {
        schemaVersion: "messages-v1",
        messages: [{ role: "user", content: [{ text: "Hi" }] }],
        inferenceConfig: { maxTokens: 5 }
      } : {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 5,
        messages: [{ role: "user", content: [{ type: "text", text: "Hi" }] }]
      };

      try {
        const command = new InvokeModelCommand({
          modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(body)
        });
        
        await client.send(command);
        console.log(`  ✅ ${modelId}: ACCESS GRANTED`);
      } catch (error) {
        console.log(`  ❌ ${modelId}: FAILED (${error.name}: ${error.message})`);
      }
    }
  }
}

probe();
