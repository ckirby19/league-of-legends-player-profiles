import { generateClient } from "aws-amplify/api";
import { Schema } from "amplify/data/resource";
import { scalePositionToMapDisplay } from "./helpers";
import { getPlayerKDAEvents, MatchEventsForPlayer, MatchHistoryStats, MultiMatchHistory, MultiMatchHistoryInputData, SpatialTemporalEvent, TimelineData } from "./types";

const client = generateClient<Schema>({ authMode: "apiKey" });

function getFinalXpForParticipant(
  timeline: TimelineData,
  participantId: number
): number | undefined {
  const finalFrame = timeline.frames[timeline.frames.length - 1];
  if (!finalFrame) return undefined;

  // Find the participantFrame with the matching participantId
  for (const frameKey in finalFrame.participantFrames) {
    const frame = finalFrame.participantFrames[frameKey];
    if (frame.participantId === participantId) {
      return frame.xp;
    }
  }

  return undefined;
}

export async function computeMultiMatchHistory(
  inputData: MultiMatchHistoryInputData
): Promise<MultiMatchHistory> {
    const statsPerMatch: MatchHistoryStats[] = [];
    const playerEventsAcrossMatches: Record<number, MatchEventsForPlayer> = {};

    let wins = 0;
    
    const sortedMatchHistories = inputData.matchHistories.sort((a, b) => {
      const aEnd = a.summary.matchInfo.matchOverview.gameEndTimestamp;
      const bEnd = b.summary.matchInfo.matchOverview.gameEndTimestamp;
      return aEnd - bEnd;
    });

    sortedMatchHistories.forEach(({ summary, timeline }) => {
      const { playerStats, playerPuuid } = summary.matchInfo;
      
      const playerParticipantId = timeline.participants.find(p => p.puuid === playerPuuid)?.participantId ;
      if (!playerParticipantId) {
        console.warn("Player participant ID not found for puuid:", playerPuuid);
        return;
      }
      const finalXp = getFinalXpForParticipant(timeline, playerParticipantId);

      statsPerMatch.push({
        kills: playerStats.kills,
        deaths: playerStats.deaths,
        assists: playerStats.assists,
        goldEarned: playerStats.goldEarned,
        xpEarned: finalXp ?? 0,
      });

      if (playerStats.win) {
        wins += 1;
      }

      const playerEvents: SpatialTemporalEvent[] = timeline.frames.flatMap((f) =>
        getPlayerKDAEvents(f.events, playerParticipantId)
      ).map((e) => ({
        ...e,
        position: scalePositionToMapDisplay(e.position) ,
      }));

      playerEventsAcrossMatches[timeline.gameId] = {
        playerParticipantId: playerParticipantId,
        events: playerEvents
      };
    });
    
    const winRate = sortedMatchHistories.length > 0 ? (wins / sortedMatchHistories.length) * 100 : 0;

    const inputDataToLLM = JSON.stringify(inputData.matchHistories.map(mh => mh.summary));

    const { data, errors } = await client.queries.generateSummonerMultiMatchInsights({
      prompt: inputDataToLLM,
    });

    if (errors){
      throw new Error(`Error generating insights: ${errors.map(e => e.message).join(", ")}`);
    }

    if (!data) {
        throw new Error("Errors generating insights.");
    }

    const historyInsights = data as string;

    return {
      winRate,
      statsPerMatch,
      playerEventsAcrossMatches,
      historyInsights
    };
}