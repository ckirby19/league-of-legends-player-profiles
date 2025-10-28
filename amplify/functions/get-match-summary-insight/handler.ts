import type { Schema } from "../../data/resource"
import { rateLimitedBedrockCall } from "./rateLimiter";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

export const handler: Schema["generateMatchSummaryInsights"]["functionHandler"] = async (
  event
) => {
    if (!event.arguments.prompt) {
        throw new Error("Missing prompt");
    }

    const model = "anthropic.claude-3-haiku-20240307-v1:0";
    const AWS_REGION = process.env.AWS_REGION || "eu-west-2";

    const client = new BedrockRuntimeClient({
        region: AWS_REGION
    });

    return await extractResponseFromAnthropicModel(
        client,
        event.arguments.prompt,
        model);
    }

async function extractResponseFromAnthropicModel(
    client: BedrockRuntimeClient,
    prompt: string,
    model: string) {

    const input = {
        modelId: model,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        system:
           `
            You are an expert League of Legends analyst. 
            You are given structured match timeline data in JSON format. 
            Your job is to generate concise, insightful commentary that can be displayed in a dashboard.
            The insights should help a player understand key moments and performances in their match.
            Focus only on the team data and player data relevant to the user with playerPuuid
            The JSON contains:
            - matchInfo (game mode, duration, etc.)
            - teamStats (kills, deaths, objectives)
            - playerStats (per champion performance)
            - timeline (minute-by-minute win probability, gold/xp swings, momentum impact)
            - keyEvents (kills, objectives, towers, dragons, barons)

            ### Instructions:
            1. Identify turning points** in the match (e.g., when win probability shifted significantly).
            2. Highlight objective control** (dragons, barons, towers) and their impact.
            3. Call out **where the player excelled** (high KDA, big damage, clutch kills etc).
            4. Keep insights **short, bullet-point style** (1-2 sentences each).
            5. Avoid repeating raw numbers already shown in the graphs; instead, explain their meaning.

            Generate 2 to 3 insights. Separate each insight with a newline.
            `,
        messages: [
            {
            role: "user",
            content: [
                {
                type: "text",
                text: prompt,
                },
            ],
            },
        ],
        max_tokens: 800,
        temperature: 0.2,
        }),
    } as InvokeModelCommandInput;

    const command = new InvokeModelCommand(input);

    const response = await rateLimitedBedrockCall(() => client.send(command))
    
    const data = JSON.parse(Buffer.from(response.body).toString());

    return data.content[0].text;
}