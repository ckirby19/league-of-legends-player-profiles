import { MatchInfo } from "./types";
import { downloadData, uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { Schema } from "amplify/data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });

async function fetchMatchInfoFromApi(matchId: string, summonerName: string, region: string, puuid: string): Promise<MatchInfo | Error> {
    try {
        const { data, errors } = await client.queries.getMatchInfo({
            matchId,
            puuid,
            region,
        });

        if (errors){
          throw new Error(`${errors.map(e => e.message).join(", ")}`);
        }

        if (!data) {
            throw new Error("Match info not found.");
        }

        // Cache the fetched data in S3 for future requests
        const matchInfo = data as MatchInfo;
        saveMatchInfoToS3(summonerName, region, matchId, matchInfo);

        return matchInfo;
    } catch (error) {
        throw new Error(`${error}`);
    }
}

async function saveMatchInfoToS3(summonerName: string, region: string, matchId: string, matchInfo: MatchInfo): Promise<void> {
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
    return null;
  }
}

export async function getMatchInfoForSummonerMatch(summonerName: string, region: string, matchId: string, puuid: string): Promise<MatchInfo | Error> {
    // First check S3 bucket for cached data for summoner
    const cachedData = await fetchMatchInfoFromS3(summonerName, region, matchId);
    if (cachedData) {
        return cachedData;
    }

    // If not found, then call api
    return await fetchMatchInfoFromApi(matchId, summonerName, region, puuid);
}
