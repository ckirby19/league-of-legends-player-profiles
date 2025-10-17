import { TimelineData } from "./types";
import { downloadData, uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { Schema } from "amplify/data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });

async function fetchMatchTimelineFromApi(
    matchId: string,
    summonerName: string,
    region: string): Promise<TimelineData | Error> {
    try {
        const { data, errors } = await client.queries.getMatchTimeline({
            matchId,
            region,
        });

        if (errors || !data) {
            throw new Error("Match timeline not found.");
        }
        // Cache the fetched data in S3 for future requests
        const matchTimeline = data as TimelineData;
        saveMatchTimelineToS3(summonerName, region, matchId, matchTimeline);

        return matchTimeline;
    } catch (error) {
        throw new Error("Summoner not found. Please check the name and tag.");
    }
}

async function saveMatchTimelineToS3(summonerName: string, region: string, matchId: string, matchTimeline: TimelineData): Promise<void> {
    // Implement S3 fetch logic here
    await uploadData({
        path: `player-match-data/${region}/${summonerName}/${matchId}/timeline.json`,
        data: JSON.stringify(matchTimeline),
        options: {
            contentType: "application/json",
            bucket: "playerDashboardStorage"
        }
    }).result;    
}

async function fetchMatchTimelineFromS3(summonerName: string, region: string, matchId: string): Promise<TimelineData | null> {
  try {
    const { body } = await downloadData({
      path: `player-match-data/${region}/${summonerName}/${matchId}/timeline.json`,
      options: {
        bucket: "playerDashboardStorage",
      },
    }).result;

    const data = await body.text();
    return JSON.parse(data) as TimelineData;
  } catch (err) {
    console.error("Error fetching from S3:", err);
    return null;
  }
}

export async function getMatchTimelineForSummonerMatch(summonerName: string, region: string, matchId: string): Promise<TimelineData | Error> {
    // First check S3 bucket for cached data for summoner
    const cachedData = await fetchMatchTimelineFromS3(summonerName, region, matchId);
    if (cachedData) {
        return cachedData;
    }

    // If not found, then call fetchMatchTimeline
    return await fetchMatchTimelineFromApi(matchId, summonerName, region);
}
