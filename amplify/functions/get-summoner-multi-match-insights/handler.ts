import type { Schema } from "../../data/resource"
import { anthropicModel, AWS_REGION } from "../common";
import { rateLimitedBedrockCall } from "../rateLimiter";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

export const handler: Schema["generateSummonerMultiMatchInsights"]["functionHandler"] = async (
  event
) => {
    if (!event.arguments.prompt) {
        throw new Error("Missing prompt");
    }

    const client = new BedrockRuntimeClient({
        region: AWS_REGION
    });

    return await extractResponseFromAnthropicModel(
        client,
        event.arguments.prompt,
        anthropicModel);
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
            You are given structured data summarising the performance of a summoner over the last 20 games in JSON format. 
            Your job is to generate concise, insightful commentary that can be displayed in a dashboard.
            The insights should help a player understand their performacen across these 20 games and how they can improve.
            Focus only on the team data and player data relevant to the user with playerPuuid
            The JSON contains:
            - matchInfo (game mode, duration, etc.)
            - teamStats (kills, deaths, objectives)
            - playerStats (per champion performance)
            - timeline (minute-by-minute win probability, gold/xp swings, momentum impact)
            - keyEvents (kills, objectives, towers, dragons, barons)

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
        max_tokens: 1200,
        temperature: 0.2,
        }),
    } as InvokeModelCommandInput;

    const command = new InvokeModelCommand(input);

    const response = await rateLimitedBedrockCall(() => client.send(command))
    
    const data = JSON.parse(Buffer.from(response.body).toString());

    return data.content[0].text;
}