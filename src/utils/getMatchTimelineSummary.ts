import { MatchInfo, MatchTimelineSummary, TimelineData } from "./types";
import { downloadData, uploadData } from "@aws-amplify/storage";
import { computeMatchTimelineSummary } from "./computeMomentum";

async function computeMatchSummary(
  timelineData: TimelineData,
  matchInfo: MatchInfo,
  summonerName: string,
  region: string,
  matchId: string): Promise<MatchTimelineSummary | Error> {
    const timelineSummary = computeMatchTimelineSummary(timelineData, matchInfo)
    await saveMatchSummaryToS3(summonerName, region, matchId, timelineSummary);
    return timelineSummary;
}

async function saveMatchSummaryToS3(summonerName: string, region: string, matchId: string, matchTimelineSummary: MatchTimelineSummary): Promise<void> {
    await uploadData({
        path: `player-match-data/${region}/${summonerName}/${matchId}/match_summary.json`,
        data: JSON.stringify(matchTimelineSummary),
        options: {
            contentType: "application/json",
            bucket: "playerDashboardStorage"
        }
    }).result;    
}

async function fetchMatchSummaryFromS3(
  summonerName: string,
  region: string,
  matchId: string): Promise<MatchTimelineSummary | null> {
    try {
      const { body } = await downloadData({
        path: `player-match-data/${region}/${summonerName}/${matchId}/match_summary.json`,
        options: {
          bucket: "playerDashboardStorage",
        },
      }).result;

      const data = await body.text();
      return JSON.parse(data) as MatchTimelineSummary;
    } catch (err) {
      console.error("Error fetching from S3:", err);
      return null;
    }
}

export async function getMatchTimelineSummaryForSummonerMatch(
  timelineData: TimelineData,
  matchInfo: MatchInfo,
  summonerName: string,
  region: string,
  matchId: string): Promise<MatchTimelineSummary | Error> {
    // First check S3 bucket for cached data for summoner
    const cachedData = await fetchMatchSummaryFromS3(summonerName, region, matchId);
    if (cachedData) {
        return cachedData;
    }

    // If not found, then call computeMatchSummary
    return await computeMatchSummary(timelineData, matchInfo, matchId, summonerName, region);
}
