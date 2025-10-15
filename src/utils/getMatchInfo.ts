import { MatchInfo } from "./types";
import { downloadData, uploadData } from "@aws-amplify/storage";

async function fetchMatchInfoFromApi(matchId: string, summonerName: string, region: string, puuid: string): Promise<MatchInfo | Error> {
    try {
        const res = await fetch(
            "https://xzbgxt4nchpvoirutenu25mc640rfhwd.lambda-url.eu-west-2.on.aws/",
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchId, puuid, region }),
            }
        );
        if (!res.ok) {
            throw new Error("Summoner not found. Please check the name and tag.");
        }
        const data = await res.json();

        if (!data || data.length === 0) {
            throw new Error("Summoner not found. Please check the name and tag.");
        }
        // Cache the fetched data in S3 for future requests
        const matchInfo = data as MatchInfo;
        saveMatchInfoToS3(summonerName, region, matchId, matchInfo);

        console.log("Fetched match info:", matchInfo);
        return matchInfo;
    } catch (error) {
        throw new Error("Summoner not found. Please check the name and tag.");
    }
}

async function saveMatchInfoToS3(summonerName: string, region: string, matchId: string, matchInfo: MatchInfo): Promise<void> {
    // Implement S3 fetch logic here
    await uploadData({
        path: `player-match-data/${region}/${summonerName}/${matchId}/match_info.json`,
        data: JSON.stringify(matchInfo),
        options: {
            contentType: "application/json",
            bucket: "playerDashboardStorage"
        }
    }).result;    
}

async function fetchMatchInfoFromS3(summonerName: string, region: string, matchId: string): Promise<MatchInfo | null> {
  try {
    const { body } = await downloadData({
      path: `player-match-data/${region}/${summonerName}/${matchId}/match_info.json`,
      options: {
        bucket: "playerDashboardStorage",
      },
    }).result;

    const data = await body.text();
    return JSON.parse(data) as MatchInfo;
  } catch (err) {
    console.error("Error fetching from S3:", err);
    return null;
  }
}

export async function getMatchInfoForSummonerMatch(summonerName: string, region: string, matchId: string, puuid: string): Promise<MatchInfo | Error> {
    // First check S3 bucket for cached data for summoner
    const cachedData = await fetchMatchInfoFromS3(summonerName, region, matchId);
    if (cachedData) {
        console.log("Using cached data from S3:", cachedData);
        return cachedData;
    }

    // If not found, then call api
    return await fetchMatchInfoFromApi(matchId, summonerName, region, puuid);
}
