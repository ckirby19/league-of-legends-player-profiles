import { downloadData, uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { Schema } from "amplify/data/resource";
import { MatchSummary } from "./types";

const client = generateClient<Schema>({ authMode: "apiKey" });

async function generateMatchSummaryInsightsFromBedrock(
    matchId: string,
    matchSummary: MatchSummary,
    summonerName: string,
    region: string): Promise<string | Error> {
    try {
        const { data, errors } = await client.queries.generateMatchSummaryInsights({
          prompt: JSON.stringify(matchSummary),
        });

        if (errors){
          throw new Error(`Error generating insights: ${errors.map(e => e.message).join(", ")}`);
        }

        if (!data) {
            throw new Error("Errors generating insights.");
        }

        const insights = data as string;
      
        saveMatchSummaryInsightsToS3(summonerName, region, matchId, insights);

        return insights;
    } catch (error) {
        throw new Error("Error generating insights: " + (error as Error).message);
    }
}

async function saveMatchSummaryInsightsToS3(summonerName: string, region: string, matchId: string, insights: string): Promise<void> {
  await uploadData({
    path: `player-match-data/${region}/${summonerName}/${matchId}/insights.json`,
    data: JSON.stringify(insights),
    options: {
        contentType: "application/json",
        bucket: "playerDashboardStorage"
    }
  }).result;    
}

async function fetchMatchSummaryInsightsFromS3(summonerName: string, region: string, matchId: string): Promise<string | null> {
  try {
    const { body } = await downloadData({
      path: `player-match-data/${region}/${summonerName}/${matchId}/insights.json`,
      options: {
        bucket: "playerDashboardStorage",
      },
    }).result;

    const data = await body.text();
    return JSON.parse(data);
  } catch (err) {
    console.error("Error fetching from S3:", err);
    return null;
  }
}

export async function getMatchSummaryInsights(summonerName: string, region: string, matchSummary: MatchSummary): Promise<string | Error> {
    const matchId = matchSummary.matchInfo.matchOverview.matchId;
    const cachedData = await fetchMatchSummaryInsightsFromS3(summonerName, region, matchId);
    if (cachedData) {
        return cachedData;
    }

    // If not found, then call fetchMatchTimeline
    return await generateMatchSummaryInsightsFromBedrock(matchId, matchSummary, summonerName, region);
}
