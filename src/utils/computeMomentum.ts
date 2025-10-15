// utils/computeMomentum.ts
import { TimelineData, MinuteSummary, Frame, TimelineEvent, ChampionKillEvent, WardPlacedEvent, WardKillEvent, BuildingKillEvent, EliteMonsterKillEvent, PlayerEvent, OriginalMapDimension, DisplayMapDimension, MatchInfo } from "./types";

function computeAdvantage(team1: number, team2: number): number {
  if (team1 + team2 === 0) return 0;
  return (team1 - team2) / (team1 + team2);
}

function pythagoreanExpectation(team1: number, team2: number, x: number): number {
  return Math.pow(team1, x) / (Math.pow(team1, x) + Math.pow(team2, x));
}

export function computeMinuteSummaries(
  timeline: TimelineData,
  matchInfo: MatchInfo,
  x: number = 2 // exponent for Pythagorean expectation
): MinuteSummary[] {
  const frames = timeline.info.frames;

  // Group frames by minute
  const minutes: Record<number, Frame[]> = {};
  frames.forEach(frame => {
    const minute = Math.floor(frame.timestamp / 60000);
    if (!minutes[minute]) minutes[minute] = [];
    minutes[minute].push(frame);
  });

  // Identify teams and player
  const playerId = timeline.info.participants.find(p => p.puuid == matchInfo.playerPuuid)?.participantId;
  if (!playerId)
    throw new Error("Player not found in timeline participants");

  const playerTeamIds = timeline.info.participants.filter(p => matchInfo.playerTeamParticipants.includes(p.puuid)).map(p => p.participantId);
  const enemyTeamIds = timeline.info.participants.filter(p => matchInfo.enemyTeamParticipants.includes(p.puuid)).map(p => p.participantId);

  const summaries: MinuteSummary[] = [];

  Object.entries(minutes).forEach(([minuteStr, frames]) => {
    const minute = parseInt(minuteStr);

    // Take last frame of the minute for snapshot
    const frame = frames[frames.length - 1];

    // Aggregate metrics
    const playerTeamGold = playerTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.totalGold || 0), 0);
    const enemyTeamGold = enemyTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.totalGold || 0), 0);

    const playerTeamXP = playerTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.xp || 0), 0);
    const enemyTeamXP = enemyTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.xp || 0), 0);

    // Advantage
    const advGold = playerTeamGold - enemyTeamGold;
    const advXP = playerTeamXP - enemyTeamXP;

    // Normalized advantage [-1, 1]
    const normalizedAdvGold = computeAdvantage(playerTeamGold, enemyTeamGold);
    const normalizedAdvXP = computeAdvantage(playerTeamXP, enemyTeamXP);

    // Winning probability per metric
    const pGold = pythagoreanExpectation(playerTeamGold, enemyTeamGold, x);
    const pXP = pythagoreanExpectation(playerTeamXP, enemyTeamXP, x);

    // Final probability = average
    const pFinal = (pGold + pXP) / 2;

    // Player position
    const playerFrame = frame.participantFrames[playerId.toString()];
    const playerPosition = playerFrame?.position
      ? {
          x: (playerFrame.position.x / OriginalMapDimension) * DisplayMapDimension,
          y: DisplayMapDimension - (playerFrame.position.y / OriginalMapDimension) * DisplayMapDimension,
        }
      : undefined;

    // Player events in this minute
    const playerEvents: PlayerEvent[] = [];

    frames.forEach(f => {
        f.events.forEach((ev: TimelineEvent) => {
            switch (ev.type) {
                case "CHAMPION_KILL": {
                    const e = ev as ChampionKillEvent;
                    if (e.killerId === playerId || e.victimId === playerId || e.assistingParticipantIds?.includes(playerId)) {
                      playerEvents.push(e);
                    }
                    break;
                }

                case "WARD_PLACED": {
                    const e = ev as WardPlacedEvent;
                    if (e.creatorId === playerId) {
                      playerEvents.push(e);
                    }
                    break;
                }

                case "WARD_KILL": {
                    const e = ev as WardKillEvent;
                    if (e.killerId === playerId) {
                      playerEvents.push(e);
                    }
                    break;
                }

                case "BUILDING_KILL": {
                    const e = ev as BuildingKillEvent;
                    if (e.killerId === playerId || e.assistingParticipantIds?.includes(playerId)) {
                      playerEvents.push(e);
                    }
                    break;
                }

                case "ELITE_MONSTER_KILL": {
                    const e = ev as EliteMonsterKillEvent;
                    if (e.killerId === playerId || e.assistingParticipantIds?.includes(playerId)) {
                      playerEvents.push(e);
                    }
                    break;
                }

                default:
                    // Ignore other event types for now
                    break;
        }});
    });

    summaries.push({
      minute,
      advantage: (normalizedAdvGold + normalizedAdvXP) / 2,
      winProb: pFinal,
      playerPosition,
      playerEvents,
      goldAdvantage: advGold,
      xpAdvantage: advXP,
    });
  });

  // Compute momentum impact ΔP
  for (let i = 0; i < summaries.length - 1; i++) {
    summaries[i].momentumImpact = summaries[i + 1].winProb - summaries[i].winProb;
  }

  return summaries;
}
