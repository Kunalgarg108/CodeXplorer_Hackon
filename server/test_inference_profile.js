import dotenv from "dotenv";
dotenv.config();

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

async function runTest() {
  const region = "us-west-2";
  const modelId = "us.amazon.nova-pro-v1:0";

  console.log(`Attempting to invoke model ${modelId} in region ${region}...`);
  const client = new BedrockRuntimeClient({ region });

  const body = {
    schemaVersion: "messages-v1",
    messages: [
      {
        role: "user",
        content: [{ text: "Hello! Reply with the word 'Profile-Success'." }]
      }
    ],
    inferenceConfig: { maxTokens: 10, temperature: 0 }
  };

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.output?.message?.content?.[0]?.text;
    console.log(`✅ SUCCESS! Response: "${text.trim()}"`);
  } catch (error) {
    console.error(`❌ FAILED: ${error.name} - ${error.message}`);
  }
}

runTest();
